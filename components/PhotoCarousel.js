import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// 写真の切り替え表示。◀▶ボタン（と下の丸印）で送る。
// 写真をクリックすると、画面いっぱいに拡大して、拡大したまま前後に送れる（×・背景クリック・Escで閉じる）。
// bases … 拡張子・幅サフィックスなしのパスの配列（Photo と同じ規則）。widths … srcset の幅
// 拡大表示には {base}-1080.webp を使う。親要素（.intro-photo）いっぱいに表示する。
export default function PhotoCarousel({ bases, widths = [480, 720], label }) {
  const [index, setIndex] = useState(0);
  const [big, setBig] = useState(null); // 拡大表示中の番号（閉じているときは null）
  const closeRef = useRef(null);
  const count = bases.length;
  const go = (dir) => setIndex((i) => (i + dir + count) % count);
  const goBig = (dir) => setBig((i) => (i + dir + count) % count);
  const close = () => {
    if (big !== null) setIndex(big); // 閉じたとき、小さい表示も同じ写真にそろえる
    setBig(null);
  };

  useEffect(() => {
    if (big === null) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goBig(-1);
      if (e.key === "ArrowRight") goBig(1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (closeRef.current) closeRef.current.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [big]);

  return (
    <div className="photo-carousel" role="group" aria-roledescription="carousel" aria-label={label}>
      {bases.map((base, i) => (
        <img
          key={base}
          src={`${base}.webp`}
          srcSet={widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ")}
          sizes="(max-width: 700px) 82vw, 400px"
          alt=""
          className={i === index ? "is-active" : undefined}
          loading={i === 0 ? undefined : "lazy"}
          decoding="async"
          aria-hidden={i === index ? undefined : "true"}
        />
      ))}
      <button type="button" className="photo-carousel-open" onClick={() => setBig(index)} aria-label="写真を拡大して見る" />
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

      {big !== null &&
        createPortal(
          <div className="menu-lightbox photo-lightbox" role="dialog" aria-modal="true" aria-label={label} onClick={close}>
            <button type="button" className="menu-lightbox-close" ref={closeRef} onClick={close} aria-label="閉じる">
              ×
            </button>
            {count > 1 && (
              <button
                type="button"
                className="menu-lightbox-nav menu-lightbox-nav--prev"
                onClick={(e) => {
                  e.stopPropagation();
                  goBig(-1);
                }}
                aria-label="前の写真"
              >
                ‹
              </button>
            )}
            <img
              className="menu-lightbox-img"
              src={`${bases[big]}-1080.webp`}
              alt=""
              onClick={(e) => e.stopPropagation()}
            />
            {count > 1 && (
              <button
                type="button"
                className="menu-lightbox-nav menu-lightbox-nav--next"
                onClick={(e) => {
                  e.stopPropagation();
                  goBig(1);
                }}
                aria-label="次の写真"
              >
                ›
              </button>
            )}
            {count > 1 && (
              <p className="photo-lightbox-count" aria-live="polite">
                {big + 1} / {count}
              </p>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
