import { ALACARTE } from "../lib/siteConfig";
import MobileSlider from "./MobileSlider";

const yen = (n) => n.toLocaleString("ja-JP");

// 鮨アラカルト。データは lib/siteConfig.js の ALACARTE（価格は税抜）。
// スマホでは横スライド＋カテゴリのタブボタン、PCでは2列グリッド。
export default function AlaCarte() {
  const items = ALACARTE.sections.map((section) => ({
    key: section.name,
    label: section.name,
    node: (
      <section className="alacarte-section">
        <h3 className="alacarte-heading">{section.name}</h3>
        {section.note && <p className="alacarte-note">{section.note}</p>}
        <ul className="alacarte-items">
          {section.items.map((item) => (
            <li key={item.name} className="alacarte-row">
              <span className="alacarte-name">{item.name}</span>
              <span className="alacarte-price">
                <span className="alacarte-price-main">
                  {yen(item.price)}円{item.from && "〜"}
                </span>
                <span className="alacarte-price-tax">
                  税込 {yen(Math.round(item.price * 1.1))}円{item.from && "〜"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    ),
  }));

  return (
    <>
      <p className="section-lead">※{ALACARTE.note}</p>
      <MobileSlider items={items} gridClass="alacarte-grid" label="アラカルト" />
    </>
  );
}
