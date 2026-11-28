import { useEffect, useRef, useState } from "react";
import { FOOD_GALLERY } from "../lib/siteConfig";

// お料理の写真の一覧。タップで同じページ上に拡大表示（×・背景タップ・Escで閉じる、◀▶で前後）。
// データは lib/siteConfig.js の FOOD_GALLERY。拡大表示の見た目は MenuSlider と共通（.menu-lightbox）。
export default function FoodGallery() {
  const closeRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(null);
  const count = FOOD_GALLERY.length;

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

  const step = (dir) => setOpenIndex((i) => (i + dir + count) % count);

  return (
    <>
      <ul className="food-gallery">
        {FOOD_GALLERY.map((p, i) => (
          <li key={p.src} className={p.wide ? "food-gallery-item food-gallery-item--wide" : "food-gallery-item"}>
            <button type="button" onClick={() => setOpenIndex(i)} aria-label={`${p.alt}を拡大して見る`}>
              <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null && (
        <div
          className="menu-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={FOOD_GALLERY[openIndex].alt}
          onClick={() => setOpenIndex(null)}
        >
          <button type="button" className="menu-lightbox-close" ref={closeRef} onClick={() => setOpenIndex(null)} aria-label="閉じる">
            ×
          </button>
          <button
            type="button"
            className="menu-lightbox-nav menu-lightbox-nav--prev"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="前の写真"
          >
            ‹
          </button>
          <img
            className="menu-lightbox-img"
            src={FOOD_GALLERY[openIndex].src}
            alt={FOOD_GALLERY[openIndex].alt}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="menu-lightbox-nav menu-lightbox-nav--next"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="次の写真"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
