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


def crop_ratio(im, ratio, cx=0.5, cy=0.5):
    """ratio=幅/高さ。(cx,cy)=切り抜き中心の相対位置"""
    w, h = im.size
    if w / h > ratio:
        nw, nh = int(h * ratio), h
    else:
        nw, nh = w, int(w / ratio)
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
    ("intro/intro-02", "85696546", 4 / 3, 0.5, 0.60, [870, 640]),   # 前菜（籠盛り）
    ("intro/intro-03", "85696617", 4 / 3, 0.5, 0.52, [870, 640]),   # 握り
    ("band/strip-01", "85688384", 2.4, 0.5, 0.52, [1000, 640]),  # 横長の帯（おつまみ三種）
]
# 単品の寿司（メニューの横スライド）。並び順＝掲載順
SUSHI = ["85696611", "85696670", "85696616", "85696617", "85696621", "85696628", "85696630",
         "85696660", "85696680", "85696682", "85696632", "85696633", "85696708"]

# 背景用: (出力名, 元写真)  外観2種・店内1種
BG = [("exterior-2", "85696727"), ("interior-1", "85696600")]


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


if __name__ == "__main__":
    for base, num, ratio, cx, cy, widths in JOBS:
        im = enhance(crop_ratio(load(num), ratio, cx, cy))
        save(im, f"{base}.webp", widths[0])
        for w in widths:
            save(im, f"{base}-{w}.webp", w)
        print(base, im.size)
    for i, num in enumerate(SUSHI, 1):
        im = enhance(sushi_square(load(num)))
        save(im, f"menu/sushi-{i:02d}.webp", 900, q=80)
    print("sushi", len(SUSHI))
    # サイトの背景（お店の外観・内装）。文字が読めるよう、CSS側で生成り色の膜を重ねる
    for name, num in BG:
        im = enhance(load(num), b=1.04, c=1.0, s=1.0)
        save(im, f"bg/{name}.webp", 1100, q=70)
    print("bg", len(BG))
