import { useState } from "react";

// 写真の切り替え表示。◀▶ボタン（と下の丸印）で送る。
// bases … 拡張子・幅サフィックスなしのパスの配列（Photo と同じ規則）。widths … srcset の幅
// 親要素（.intro-photo）いっぱいに表示する。
export default function PhotoCarousel({ bases, widths = [640, 870], label }) {
  const [index, setIndex] = useState(0);
  const count = bases.length;
  const go = (dir) => setIndex((i) => (i + dir + count) % count);

  return (
    <div className="photo-carousel" role="group" aria-roledescription="carousel" aria-label={label}>
      {bases.map((base, i) => (
        <img
          key={base}
          src={`${base}.webp`}
          srcSet={widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ")}
          sizes="(max-width: 700px) 82vw, 460px"
          alt=""
          className={i === index ? "is-active" : undefined}
          loading={i === 0 ? undefined : "lazy"}
          decoding="async"
          aria-hidden={i === index ? undefined : "true"}
        />
      ))}
      {count > 1 && (
        <>
          <button type="button" className="photo-carousel-btn photo-carousel-btn--prev" onClick={() => go(-1)} aria-label="前の写真">
            ◀
          </button>
          <button type="button" className="photo-carousel-btn photo-carousel-btn--next" onClick={() => go(1)} aria-label="次の写真">
            ▶
          </button>
          <span className="photo-carousel-dots" aria-hidden="true">
            {bases.map((base, i) => (
              <span key={base} className={i === index ? "is-active" : undefined} />
            ))}
          </span>
        </>
      )}
    </div>
  );
}
