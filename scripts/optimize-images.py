"""
画像の変換・書き出しスクリプト（Python + Pillow）

ChatGPT等で作成した元画像（PNG/JPEG）を public/images/ に置いてから実行すると、
サイトが参照するWebP（サイズ違い付き）とファビコン一式を書き出す。

  python scripts/optimize-images.py            # 未変換のものだけ処理
  python scripts/optimize-images.py --force    # すでに変換済みでもやり直す

処理内容
  1. ヒーロー・帯・テンプレート画像 … WebPへ変換し、幅違い（-640/-1024/-1600）を書き出す
  2. logo.png … 512×512に整える（構造化データ用。PNGのまま）
  3. ogp.png  … 1200×630に切り抜く（SNSシェア用。WebP非対応のクローラがあるためPNGのまま）
  4. favicon一式 … logo.png から favicon.ico / favicon-16,32,48.png /
                    apple-touch-icon.png / images/favicon.svg を生成
  5. 変換元のPNG/JPEGは image-src/ へ移動する（public/に残すと本番へ不要に配信されるため）

元画像は縮小のみ行い、引き伸ばしはしない（指定幅より小さい場合はその幅の書き出しを飛ばす）。
"""

import argparse
import base64
import io
import shutil
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow が必要です:  pip install Pillow")

FORCE = False  # main() で --force の指定を反映する

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
IMAGES = PUBLIC / "images"
SRC_KEEP = ROOT / "image-src"  # 変換元の退避先（.gitignore 済み）

SOURCE_EXTS = (".png", ".jpg", ".jpeg")
WEBP_QUALITY = 82

# (出力ベースパス, 書き出す幅) … 拡張子なしで指定する
# このサンプルサイトで使う画像だけを対象にする。
# (制作会社サイト用のテンプレート見本・制作実績の画像は削除済みのため対象外)
# 幅は参照側と必ず揃えること:
#   hero       … components/HeroBanner.js の srcSet と pages/index.js の preload
#   band-01    … pages/index.js の <SectionBand widths={...}>
#   split/*    … components/SplitSection.js の srcSet
#   gallery/*  … components/PhotoGallery.js の srcSet
WEBP_JOBS = [
    # ヒーローの元画像は1536px幅のため -1600 は生成されない。参照側(HeroBanner/preload)も640/1024で揃えている
    ("images/hero/home-hero", [640, 1024]),
    ("images/band/band-01", [640, 1024, 1600]),
    ("images/split/charcoal", [640, 1024]),
    ("images/split/utsuwa", [640, 1024]),
    ("images/split/sake", [640, 1024]),
    ("images/gallery/gallery-01", [640, 1024]),
    ("images/gallery/gallery-02", [640, 1024]),
    ("images/gallery/gallery-03", [640, 1024]),
    ("images/gallery/gallery-04", [640, 1024]),
    ("images/gallery/gallery-05", [640, 1024]),
    ("images/gallery/gallery-06", [640, 1024]),
]

# ---- トーン補正（ガンマ） ----
# 元画像が暗すぎて被写体の輪郭が判別しづらいものだけ、書き出し時に持ち上げる。
# 値は 1.0 で無補正、大きいほど明るい。暗部だけが持ち上がり、白飛びは起こさない。
# 目標の平均相対輝度(L)を実測しながら決めた値:
#   gallery-03  L=0.037 → 0.059（他のギャラリーと同程度）
#   gallery-05  L=0.019 → 0.060（最も暗く、輪郭が沈んでいた）
#   home-hero   L=0.015 → 0.026（「墨黒×和紙の灯り」を保つため控えめに）
# band-01 / charcoal / utsuwa / sake は演出として妥当な明るさのため補正しない。
TONE_GAMMA = {
    "images/gallery/gallery-03": 1.35,
    "images/gallery/gallery-05": 1.90,
    "images/hero/home-hero": 1.35,
}

FAVICON_PNG_SIZES = [16, 32, 48]


def apply_gamma(im: Image.Image, gamma: float) -> Image.Image:
    """ガンマ補正。gamma>1 で暗部を持ち上げる（ハイライトは 255 のまま動かない）。"""
    if not gamma or gamma == 1.0:
        return im
    lut = [min(255, round(255 * ((i / 255) ** (1 / gamma)))) for i in range(256)]
    return im.convert("RGB").point(lut * 3)
APPLE_TOUCH_SIZE = 180


def find_source(base: Path, widths):
    """
    変換元を探す。戻り値は (パス, 退避するか)。

    PNG/JPEGを優先する。見つからない場合でも、幅違いが未生成なら
    書き出し済みの .webp 自体を変換元として使う（.webp で受け取ったとき用）。
    この場合は退避せず、その場で幅違いだけを作る。
    """
    for ext in SOURCE_EXTS:
        candidate = base.with_suffix(ext)
        if candidate.exists():
            return candidate, True

    # public/ に元画像がなければ、退避済みの元画像（image-src/）を使う。
    # --force で作り直すとき、書き出し済みWebPからの再エンコードを避けるため。
    stashed_dir = SRC_KEEP / base.parent.relative_to(PUBLIC)
    for ext in SOURCE_EXTS:
        candidate = stashed_dir / f"{base.name}{ext}"
        if candidate.exists():
            return candidate, False

    main = base.with_suffix(".webp")
    if main.exists():
        missing = [w for w in widths if not (base.parent / f"{base.name}-{w}.webp").exists()]
        if missing or FORCE:
            return main, False
    return None, False


def resize_to_width(im: Image.Image, width: int) -> Image.Image:
    if im.width <= width:
        return im.copy()
    height = round(im.height * width / im.width)
    return im.resize((width, height), Image.LANCZOS)


def crop_to_ratio(im: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """中央基準で目標比率に切り抜いてからリサイズする（余白は作らない）。"""
    target_ratio = target_w / target_h
    ratio = im.width / im.height
    if ratio > target_ratio:  # 横に長い → 左右を削る
        new_w = round(im.height * target_ratio)
        left = (im.width - new_w) // 2
        box = (left, 0, left + new_w, im.height)
    else:  # 縦に長い → 上下を削る
        new_h = round(im.width / target_ratio)
        top = (im.height - new_h) // 2
        box = (0, top, im.width, top + new_h)
    return im.crop(box).resize((target_w, target_h), Image.LANCZOS)


def save_webp(im: Image.Image, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(path, "WEBP", quality=WEBP_QUALITY, method=6)
    return path.stat().st_size


def stash_source(src: Path):
    """変換元を image-src/ へ移動する（public/ に残さない）。"""
    dest = SRC_KEEP / src.relative_to(PUBLIC)
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(src), str(dest))
    return dest


def build_webp_set(force: bool, only=None):
    done, skipped, missing = [], [], []

    for rel_base, widths in WEBP_JOBS:
        # --only 指定時は、部分一致したものだけを処理する
        if only and not any(key in rel_base for key in only):
            continue
        base = PUBLIC / rel_base
        src, stash = find_source(base, widths)
        main_out = base.with_suffix(".webp")

        if src is None:
            if main_out.exists() and not force:
                skipped.append(f"{rel_base}.webp（変換済み）")
            else:
                missing.append(f"{rel_base}.png")
            continue

        with Image.open(src) as im:
            im.load()
            gamma = TONE_GAMMA.get(rel_base)
            if gamma:
                im = apply_gamma(im, gamma)
            largest = max(widths)
            outputs = []
            total = 0
            if src != main_out:
                # 基準となる .webp（srcSet非対応環境が読む src 属性の実体）も書き出す。
                # 変換元が .webp 自身のときだけ、自分を上書きしないよう飛ばす。
                total += save_webp(resize_to_width(im, largest), main_out)
                outputs.append(main_out.name)
            too_small = []
            for w in widths:
                if im.width < w and w != min(widths):
                    # 元画像より大きい幅は引き伸ばしになるため書き出さない
                    too_small.append(w)
                    continue
                out = base.parent / f"{base.name}-{w}.webp"
                total += save_webp(resize_to_width(im, w), out)
                outputs.append(out.name)
            size_kb = total / 1024
            line = f"{rel_base}: {im.width}×{im.height} → {', '.join(outputs)}（計 {size_kb:.0f}KB）"
            if gamma:
                line += f" ※ガンマ {gamma} で補正"
            if too_small:
                # 参照側(SectionBand の widths / HeroBanner の srcSet)と食い違うと404になるため知らせる
                line += f" ※元画像が小さいため {', '.join(f'-{w}' for w in too_small)} は未生成"
            done.append(line)

        if stash:
            stash_source(src)

    return done, skipped, missing


def build_logo_and_ogp():
    messages = []

    logo = IMAGES / "logo.png"
    if logo.exists():
        with Image.open(logo) as im:
            im.load()
            if im.size != (512, 512):
                im.convert("RGBA").resize((512, 512), Image.LANCZOS).save(logo, "PNG")
                messages.append(f"logo.png: {im.width}×{im.height} → 512×512 に調整")
            else:
                messages.append("logo.png: 512×512（変更なし）")
    else:
        messages.append("logo.png: 見つかりません")

    messages += build_ogp()

    return messages


# ---- OGP画像（背景に文字を合成する） ----
# 背景だけの画像を public/images/ogp.png（または ogp-bg.png）に置いて実行すると、
# 下記の文言を焼き込んだ 1200×630 のOGP画像を書き出す。
# 文言を変えるときはここを編集して --force で作り直す。
# OGPのロゴ台座の色。ロゴが「明るい図柄＋透過」なら白、
# このテンプレートのように「黒背景に金の図柄」なら黒にして、地になじませる。
OGP_MARK_BG = (0, 0, 0)

OGP_TEXT = {
    "brand": "鮨しょう",
    "title": "一期一会の贅を、一貫に込めて。",
    "sub": "おつまみコース 税込4,950円〜",
}
FONT_BOLD = "C:/Windows/Fonts/YuGothB.ttc"
FONT_MEDIUM = "C:/Windows/Fonts/YuGothM.ttc"


def _font(path, size):
    from PIL import ImageFont

    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def _draw_tracked(draw, xy, text, font, fill, tracking=0):
    """字間を空けて中央寄せで描く（Pillowに字間指定がないため1文字ずつ描画する）。"""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x


def _tracked_width(draw, text, font, tracking=0):
    return sum(draw.textlength(ch, font=font) for ch in text) + tracking * (len(text) - 1)


def build_ogp():
    from PIL import ImageDraw

    W, H = 1200, 630
    out = IMAGES / "ogp.png"
    stash = SRC_KEEP / "images" / "ogp-bg.png"
    placed_bg = IMAGES / "ogp-bg.png"

    # 背景の取得元を決める。
    # 合成済みのogp.pngを背景として読むと文字が二重に焼き込まれるため、
    # 「1200×630ちょうど」なら合成済みとみなし、退避してある背景を使う。
    def is_generated(path):
        with Image.open(path) as probe:
            return probe.size == (W, H)

    if placed_bg.exists():
        source = placed_bg
    elif out.exists() and not is_generated(out):
        source = out  # 新しい背景が置かれた
    elif stash.exists():
        source = stash
    elif out.exists():
        source = out
    else:
        return ["ogp.png: 見つかりません（背景画像を置いて再実行してください）"]

    with Image.open(source) as im:
        im.load()
        bg = crop_to_ratio(im.convert("RGB"), W, H)

    # 背景を退避（次回以降はこちらを背景として使う）
    stash.parent.mkdir(parents=True, exist_ok=True)
    bg.save(stash, "PNG", optimize=True)
    if placed_bg.exists():
        placed_bg.unlink()

    canvas = bg.copy()
    # 文字の可読性を上げるため、中央に薄い暗幕を敷く。
    # 帯の境目が線として出ないよう、上下を徐々に薄くする。
    scrim = Image.new("RGBA", (W, H), (8, 24, 48, 0))
    sd = ImageDraw.Draw(scrim)
    top, top_full, bottom_full, bottom, peak = 90, 200, 450, 570, 95
    for y in range(top, bottom):
        if y < top_full:
            alpha = peak * (y - top) / (top_full - top)
        elif y > bottom_full:
            alpha = peak * (bottom - y) / (bottom - bottom_full)
        else:
            alpha = peak
        sd.line([(0, y), (W, y)], fill=(8, 24, 48, int(alpha)))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), scrim).convert("RGB")

    draw = ImageDraw.Draw(canvas)
    f_brand = _font(FONT_BOLD, 34)
    f_title = _font(FONT_BOLD, 58)
    f_sub = _font(FONT_MEDIUM, 28)

    # ロゴマーク＋ブランド名を横並びにして中央に配置
    mark_size, gap = 84, 20
    brand_w = _tracked_width(draw, OGP_TEXT["brand"], f_brand, tracking=6)
    lockup_w = mark_size + gap + brand_w
    lockup_x = int((W - lockup_w) // 2)  # textlengthはfloatを返すためintに直す
    lockup_y = 168

    logo = IMAGES / "logo.png"
    if logo.exists():
        with Image.open(logo) as lg:
            lg.load()
            mark = Image.new("RGBA", (mark_size, mark_size), OGP_MARK_BG + (255,))
            inner = lg.convert("RGBA").resize((mark_size - 14, mark_size - 14), Image.LANCZOS)
            mark.alpha_composite(inner, (7, 7))
            # 角丸マスク
            mask = Image.new("L", (mark_size, mark_size), 0)
            ImageDraw.Draw(mask).rounded_rectangle([0, 0, mark_size - 1, mark_size - 1], radius=18, fill=255)
            canvas.paste(mark.convert("RGB"), (lockup_x, lockup_y), mask)

    _draw_tracked(
        draw,
        (lockup_x + mark_size + gap, lockup_y + (mark_size - 44) // 2),
        OGP_TEXT["brand"],
        f_brand,
        (255, 255, 255),
        tracking=6,
    )

    title_w = draw.textlength(OGP_TEXT["title"], font=f_title)
    draw.text(((W - title_w) / 2, 300), OGP_TEXT["title"], font=f_title, fill=(255, 255, 255))

    sub_w = draw.textlength(OGP_TEXT["sub"], font=f_sub)
    draw.text(((W - sub_w) / 2, 392), OGP_TEXT["sub"], font=f_sub, fill=(226, 236, 248))

    canvas.save(out, "PNG", optimize=True)
    return [f"ogp.png: {W}×{H} に切り抜き、ロゴと文言を合成（背景は image-src/images/ogp-bg.png に退避）"]


def build_favicons():
    """
    logo.png からファビコン一式を作る。透過は白で埋める（タブ上での視認性のため）。

    既存のアイコンを意図せず上書きしないよう、logo.png が favicon.ico より
    新しいときだけ実行する（作り直したいときは --force）。
    """
    logo = IMAGES / "logo.png"
    if not logo.exists():
        return ["favicon: logo.png がないため生成をスキップ"]

    ico = PUBLIC / "favicon.ico"
    if ico.exists() and not FORCE and logo.stat().st_mtime <= ico.stat().st_mtime:
        return ["favicon: logo.png に変更がないためスキップ（作り直すときは --force）"]

    with Image.open(logo) as im:
        im.load()
        base = im.convert("RGBA")

    def flatten(size):
        canvas = Image.new("RGBA", (size, size), (255, 255, 255, 255))
        resized = base.resize((size, size), Image.LANCZOS)
        canvas.alpha_composite(resized)
        return canvas

    made = []
    for size in FAVICON_PNG_SIZES:
        out = PUBLIC / f"favicon-{size}.png"
        flatten(size).save(out, "PNG")
        made.append(out.name)

    flatten(APPLE_TOUCH_SIZE).convert("RGB").save(PUBLIC / "apple-touch-icon.png", "PNG")
    made.append("apple-touch-icon.png")

    flatten(48).save(
        PUBLIC / "favicon.ico",
        "ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )
    made.append("favicon.ico")

    # favicon.svg は元がベクターではないため、PNGを埋め込んだSVGとして書き出す
    buf = io.BytesIO()
    flatten(192).convert("RGB").save(buf, "PNG", optimize=True)
    encoded = base64.b64encode(buf.getvalue()).decode("ascii")
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192">'
        f'<image width="192" height="192" href="data:image/png;base64,{encoded}"/>'
        "</svg>"
    )
    (IMAGES / "favicon.svg").write_text(svg, encoding="utf-8")
    made.append("images/favicon.svg")

    return [f"favicon: {', '.join(made)} を logo.png から生成"]


def main():
    parser = argparse.ArgumentParser(description="画像をWebPへ変換し、サイズ違いとファビコンを書き出す")
    parser.add_argument("--force", action="store_true", help="変換済みのものも作り直す")
    parser.add_argument(
        "--only",
        nargs="+",
        metavar="KEY",
        help="指定した文字列を含む画像だけを処理する（例: --only gallery-03 home-hero）",
    )
    args = parser.parse_args()

    global FORCE
    FORCE = args.force

    done, skipped, missing = build_webp_set(args.force, args.only)

    print("== WebP 変換 ==")
    for line in done or ["（処理対象なし）"]:
        print("  [OK]", line)
    for line in skipped:
        print("  [skip]", line)
    if missing:
        print("  [!] 元画像が見つからないもの:")
        for line in missing:
            print("     ", line)

    print("== ロゴ・OGP ==")
    for line in build_logo_and_ogp():
        print("  ", line)

    print("== ファビコン ==")
    for line in build_favicons():
        print("  ", line)

    if SRC_KEEP.exists():
        print(f"\n変換元の画像は {SRC_KEEP.relative_to(ROOT)}/ へ移動しました（Gitの追跡対象外）")


if __name__ == "__main__":
    main()
