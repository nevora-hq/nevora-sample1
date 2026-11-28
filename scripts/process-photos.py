"""
お店から届いた写真（画像フォルダ/S__*.jpg）をサイト用のWebPに整える（Python + Pillow）。

  python scripts/process-photos.py

- 明るさ・コントラスト・彩度をごく軽く補正し、必要な比率に切り抜いて public/images/ へ書き出す
- 書き出しでEXIF（撮影位置情報など）は落ちる
- 切り抜き位置・使う写真を変えるときは下の JOBS / SUSHI を編集する
"""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "画像フォルダ"
OUT = ROOT / "public" / "images"


def load(num):
    return ImageOps.exif_transpose(Image.open(SRC / f"S__{num}.jpg")).convert("RGB")


def enhance(im, b=1.06, c=1.06, s=1.10):
    im = ImageEnhance.Brightness(im).enhance(b)
    im = ImageEnhance.Contrast(im).enhance(c)
    im = ImageEnhance.Color(im).enhance(s)
    return im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=3))


# 切り替え写真は、器の中心と大きさをそろえて、切り替えたときに目線が動かないようにする（拡大率）
ZOOM = {"intro/intro-02": 1.04, "intro/intro-02-c": 1.28, "intro/intro-02-e": 1.25,
        "intro/intro-02-g": 1.5, "intro/intro-02-h": 1.2, "intro/intro-02-i": 1.6, "intro/intro-02-j": 1.05,
        "intro/intro-02-k": 1.08}


def crop_ratio(im, ratio, cx=0.5, cy=0.5, zoom=1.0):
    """ratio=幅/高さ。(cx,cy)=切り抜き中心の相対位置"""
    w, h = im.size
    if w / h > ratio:
        nw, nh = int(h * ratio), h
    else:
        nw, nh = w, int(w / ratio)
    nw, nh = int(nw / zoom), int(nh / zoom)
    x = min(max(int(cx * w - nw / 2), 0), w - nw)
    y = min(max(int(cy * h - nh / 2), 0), h - nh)
    return im.crop((x, y, x + nw, y + nh))


def save(im, path, width, q=82):
    path = OUT / path
    path.parent.mkdir(parents=True, exist_ok=True)
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(path, "WEBP", quality=q, method=6)


# (出力ベース, 元写真, 縦横比, 切り抜き中心x, y, 書き出し幅[最初が本体])
JOBS = [
    ("hero/home-hero", "85696721", 3 / 2, 0.5, 0.55, [1024, 640]),  # 全体の盛り合わせ
    # 四季の前菜の切り替え写真。縦長(3:4)で器の全体が見えるようにし、器の中心・大きさをそろえる
    ("intro/intro-02", "85696537", 3 / 4, 0.52, 0.54, [720, 480]),    # 籠盛り（斜めからで立体感）
    ("intro/intro-02-b", "85688393", 3 / 4, 0.5, 0.5, [720, 480]),  # 水色の角皿
    ("intro/intro-02-c", "85688401", 3 / 4, 0.467, 0.495, [720, 480]),  # 灰色の丸皿
    ("intro/intro-02-f", "85688378", 3 / 4, 0.5, 0.5, [720, 480]),  # 金色の三日月の器（斜めに寄った写真）
    ("intro/intro-02-e", "85696563", 3 / 4, 0.458, 0.50, [720, 480]),  # 花形の小鉢
    ("intro/intro-02-g", "85696602", 3 / 4, 0.495, 0.53, [720, 480]),  # 茶碗蒸し
    ("intro/intro-02-h", "85696608", 3 / 4, 0.505, 0.505, [720, 480]),  # 汁物
    ("intro/intro-02-i", "85696647", 3 / 4, 0.48, 0.54, [720, 480]),   # うに（グラス）
    ("intro/intro-02-j", "85696716", 3 / 4, 0.46, 0.53, [720, 480]),   # スイーツ
    ("gallery/tsumami", "85688383", 3 / 2, 0.5, 0.5, [900]),            # お品書きページの一覧用（横長タイル）
    ("intro/intro-02-k", "85688409", 3 / 4, 0.5, 0.6, [720, 480]),   # お刺身
    ("band/strip-01", "85688384", 3.6, 0.5, 0.505, [1600, 1024, 640]),  # 横長の帯（おつまみ三種）
]
# 単品の寿司（メニューの横スライド）。並び順＝掲載順
SUSHI = ["85696616", "85696611", "85696670", "85696628",
         "85696660", "85696680", "85696632", "85696708"]  # 大トロが先頭。同じネタの似た写真は1枚に絞る  # 同じネタの似た写真は1枚に絞る  # 同じネタの似た写真は1枚に絞る

# 背景用: (出力名, 元写真)  外観2種・店内1種
BG = [("exterior-2", "85696727"), ("interior-1", "85696600")]

# 「熟成と赤酢のシャリ」の切り替え写真（握り）。アップで見せる（皿は左右が少し切れる）
NIGIRI = ["85696616", "85696611", "85696670", "85696628",
          "85696660", "85696680", "85696632", "85696708"]


def plate_box(im):
    """緑の皿の外接矩形(幅, 中心x, 中心y)を返す。縮小画像で緑の画素を数えて求める"""
    s = im.width / 200
    sm = im.resize((200, round(im.height / s)))
    px = sm.load()
    xs, ys = [], []
    for y in range(sm.height):
        for x in range(sm.width):
            r, g, b = px[x, y]
            if g > r * 1.25 and g > b * 1.05 and g < 160:
                xs.append(x)
                ys.append(y)
    xs.sort()
    ys.sort()
    k = len(xs) // 200
    x0, x1, y0, y1 = xs[k], xs[-1 - k], ys[k], ys[-1 - k]
    return (x1 - x0) * s, (x0 + x1) / 2 * s, (y0 + y1) / 2 * s


def sushi_square(im, fill=0.86, target_luma=150):
    """皿の大きさ・位置・明るさを全写真で揃えた正方形に切り抜く（高さ・背景の見え方を統一）"""
    pw, cx, cy = plate_box(im)
    side = int(min(pw / fill, im.width, im.height))
    x = min(max(int(cx - side / 2), 0), im.width - side)
    y = min(max(int(cy - side * 0.52), 0), im.height - side)
    sq = im.crop((x, y, x + side, y + side))
    luma = sum(ImageOps.grayscale(sq.resize((64, 64))).tobytes()) / 4096
    k = min(max(target_luma / luma, 0.9), 1.15)
    return ImageEnhance.Brightness(sq).enhance(k)


def sushi_portrait(im, fill=1.22, target_luma=150):
    """握りをアップにした縦長(3:4)の切り抜き。皿の大きさ・位置・明るさをそろえ、切り替えても目線が動かない"""
    pw, cx, cy = plate_box(im)
    w = int(min(pw / fill, im.width, im.height * 3 / 4))
    h = int(w * 4 / 3)
    x = min(max(int(cx - w / 2), 0), im.width - w)
    y = min(max(int(cy - h * 0.5), 0), im.height - h)
    cr = im.crop((x, y, x + w, y + h))
    luma = sum(ImageOps.grayscale(cr.resize((64, 64))).tobytes()) / 4096
    k = min(max(target_luma / luma, 0.9), 1.15)
    return ImageEnhance.Brightness(cr).enhance(k)


if __name__ == "__main__":
    for base, num, ratio, cx, cy, widths in JOBS:
        im = enhance(crop_ratio(load(num), ratio, cx, cy, ZOOM.get(base, 1.0)))
        save(im, f"{base}.webp", widths[0])
        for w in widths:
            save(im, f"{base}-{w}.webp", w)
        print(base, im.size)
    for i, num in enumerate(SUSHI, 1):
        im = enhance(sushi_square(load(num)))
        save(im, f"menu/sushi-{i:02d}.webp", 900, q=80)
    print("sushi", len(SUSHI))
    for i, num in enumerate(NIGIRI, 1):
        im = enhance(sushi_portrait(load(num)))
        save(im, f"intro/nigiri-{i:02d}.webp", 720, q=80)
        save(im, f"intro/nigiri-{i:02d}-480.webp", 480, q=80)
        save(im, f"intro/nigiri-{i:02d}-720.webp", 720, q=80)
    print("nigiri", len(NIGIRI))
    # サイトの背景（お店の外観・内装）。文字が読めるよう、CSS側で生成り色の膜を重ねる
    for name, num in BG:
        im = enhance(load(num), b=1.04, c=1.0, s=1.0)
        save(im, f"bg/{name}.webp", 1100, q=70)
    print("bg", len(BG))
