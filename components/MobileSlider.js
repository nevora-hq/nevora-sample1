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

  // スマホ：表示中のスライドの高さに合わせる（背の低いスライドの下に空白が残らないように）
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const fit = () => {
      // equal 指定のスライド同士は、一番高いものに高さをそろえる
      const eq = Array.from(el.children).filter((c) => c.dataset.equal);
      eq.forEach((c) => {
        c.style.minHeight = "";
      });
      if (window.matchMedia("(max-width: 700px)").matches && eq.length > 1) {
        const max = Math.max(...eq.map((c) => c.offsetHeight));
        eq.forEach((c) => {
          c.style.minHeight = `${max}px`;
        });
      }
      const slide = el.children[active];
      if (window.matchMedia("(max-width: 700px)").matches && slide) {
        el.style.height = `${slide.offsetHeight}px`;
      } else {
        el.style.height = "";
      }
    };
    fit();
    window.addEventListener("resize", fit);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    if (ro && el.children[active]) ro.observe(el.children[active]);
    return () => {
      window.removeEventListener("resize", fit);
      if (ro) ro.disconnect();
    };
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
          <div key={it.key} className="mslider-slide" data-equal={it.equal ? "1" : undefined}>
            {it.node}
          </div>
        ))}
      </div>
      <p className="mslider-hint">横にスワイプ／ボタンで切り替えできます。</p>
    </div>
  );
}
