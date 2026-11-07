import { useEffect, useRef, useState } from "react";

// スマホでは横スライド＋小さなタブボタン、PCでは従来のグリッド表示になる共通部品。
// items … [{ key, label, node }]　gridClass … PC表示用のグリッドのクラス名
export default function MobileSlider({ items, gridClass, label }) {
  const ref = useRef(null);
  const tabsRef = useRef(null);
  const [active, setActive] = useState(0);

  // 選択中のタブが見える位置まで、ボタン列も横にスライドさせる
  useEffect(() => {
    const bar = tabsRef.current;
    const tab = bar && bar.children[active];
    if (bar && tab && bar.scrollWidth > bar.clientWidth) {
      bar.scrollTo({ left: tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
    }
  }, [active]);

  const slideAt = (i) => ref.current && ref.current.children[i];

  const goTo = (i) => {
    const el = ref.current;
    const slide = slideAt(i);
    if (el && slide) el.scrollTo({ left: slide.offsetLeft - el.offsetLeft - 0, behavior: "smooth" });
    setActive(i);
  };
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    let best = 0;
    let min = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - el.offsetLeft - el.scrollLeft);
      if (d < min) {
        min = d;
        best = i;
      }
    });
    setActive(best);
  };

  return (
    <div className="mslider" role="region" aria-label={label}>
      <div className="mslider-tabs" ref={tabsRef} role="group" aria-label={`${label}を選ぶ`}>
        {items.map((it, i) => (
          <button
            key={it.key}
            type="button"
            className={`mslider-tab${active === i ? " is-active" : ""}`}
            aria-pressed={active === i}
            onClick={() => goTo(i)}
          >
            {it.label}
          </button>
        ))}
      </div>
      <div className={`mslider-track ${gridClass}`} ref={ref} onScroll={onScroll}>
        {items.map((it) => (
          <div key={it.key} className="mslider-slide">
            {it.node}
          </div>
        ))}
      </div>
      <p className="mslider-hint">横にスワイプ／ボタンで切り替えできます。</p>
    </div>
  );
}
