import { useEffect, useRef, useState } from "react";
import { MENU_SLIDES } from "../lib/siteConfig";

// メニュー画像の横スライド。スクロール（スワイプ）に加え、左右ボタンでも送れる。
// 画像をタップすると、同じページ上で大きく表示する（×・背景タップ・Escキーで閉じる）。
// kind … "food"（料理）/ "drink"（お酒）。データは lib/siteConfig.js の MENU_SLIDES。
export default function MenuSlider({ kind, label }) {
  const ref = useRef(null);
  const closeRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(null);
  const slides = MENU_SLIDES[kind];

  // 拡大表示中は、Escで閉じる・背面のスクロールを止める・×ボタンへフォーカスを移す
  useEffect(() => {
    if (openIndex === null) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (closeRef.current) closeRef.current.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex]);

  if (!Array.isArray(slides) || slides.length === 0) return null;

  const move = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  const step = (dir) =>
    setOpenIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <div className="menu-slider" role="region" aria-label={label}>
      <button type="button" className="menu-slider-btn menu-slider-btn--prev" onClick={() => move(-1)} aria-label="前へ">
        ‹
      </button>
      <ul className="menu-slider-track" ref={ref} tabIndex={0}>
        {slides.map((s, i) => (
          <li key={s.src} className="menu-slider-item">
            <button
              type="button"
              className="menu-slider-open"
              onClick={() => setOpenIndex(i)}
              aria-label={`${s.alt}を拡大して見る`}
            >
              <img src={s.src} alt={s.alt} loading="lazy" decoding="async" />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="menu-slider-btn menu-slider-btn--next" onClick={() => move(1)} aria-label="次へ">
        ›
      </button>
      <p className="menu-slider-hint">横にスワイプ／ボタンで送れます。タップで拡大します。</p>

      {openIndex !== null && (
        <div
          className="menu-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={slides[openIndex].alt}
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            className="menu-lightbox-close"
            ref={closeRef}
            onClick={() => setOpenIndex(null)}
            aria-label="閉じる"
          >
            ×
          </button>
          {slides.length > 1 && (
            <button
              type="button"
              className="menu-lightbox-nav menu-lightbox-nav--prev"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              aria-label="前の画像"
            >
              ‹
            </button>
          )}
          <img
            className="menu-lightbox-img"
            src={slides[openIndex].src}
            alt={slides[openIndex].alt}
            onClick={(e) => e.stopPropagation()}
          />
          {slides.length > 1 && (
            <button
              type="button"
              className="menu-lightbox-nav menu-lightbox-nav--next"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              aria-label="次の画像"
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
