import { useRef, useState } from "react";
import { SEASONAL_MENU } from "../lib/siteConfig";

// 期間限定メニュー（冬・夏）。横スワイプ／左右ボタン／「冬」「夏」ボタンで切り替える。
// size … "small"（トップ・イラストなし）/ "large"（お品書き・イラストあり）
export default function SeasonalSlider({ size = "small" }) {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const slides = SEASONAL_MENU.slides;

  const goTo = (i) => {
    const el = ref.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setActive(i);
  };
  const onScroll = () => {
    const el = ref.current;
    if (!el || !el.clientWidth) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className={`seasonal seasonal--${size}`} role="region" aria-label={SEASONAL_MENU.title}>
      <div className="seasonal-head">
        <h3 className="seasonal-title">{SEASONAL_MENU.title}</h3>
        <div className="seasonal-tabs" role="group" aria-label="季節を選ぶ">
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              className={`seasonal-tab seasonal-tab--${s.key}${active === i ? " is-active" : ""}`}
              aria-pressed={active === i}
              onClick={() => goTo(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="seasonal-stage">
        <button type="button" className="menu-slider-btn menu-slider-btn--prev" onClick={() => goTo(Math.max(active - 1, 0))} aria-label="前へ" disabled={active === 0}>
          ‹
        </button>
        <ul className="seasonal-track" ref={ref} onScroll={onScroll} tabIndex={0}>
          {slides.map((s) => (
            <li key={s.key} className="seasonal-slide">
              <img src={size === "large" ? s.large : s.small} alt={s.alt} loading="lazy" decoding="async" />
            </li>
          ))}
        </ul>
        <button type="button" className="menu-slider-btn menu-slider-btn--next" onClick={() => goTo(Math.min(active + 1, slides.length - 1))} aria-label="次へ" disabled={active === slides.length - 1}>
          ›
        </button>
      </div>
      <p className="menu-slider-hint">{SEASONAL_MENU.note}　横にスワイプ／「冬」「夏」ボタンで切り替えできます。</p>
    </div>
  );
}
