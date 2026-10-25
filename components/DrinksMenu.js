import { DRINKS } from "../lib/siteConfig";

function DrinkList({ items }) {
  return (
    <ul className="drink-list">
      {items.map((d) => (
        <li key={d.name} className="drink-item">
          <p className="drink-name">
            {d.name}
            <span className="drink-origin">（{d.origin}）</span>
          </p>
          <p className="drink-desc">{d.desc}</p>
        </li>
      ))}
    </ul>
  );
}

// 日本酒・焼酎・ワインを上品な枠でまとめたコーナー。データは lib/siteConfig.js の DRINKS。
// 末尾に「隠し酒」の一文を小さく添える。
export default function DrinksMenu() {
  const { sake, shochu, wine, hiddenSake } = DRINKS;
  return (
    <div className="drinks-frame">
      <h2 className="drinks-title">{DRINKS.title}</h2>
      <p className="drinks-lead">{DRINKS.lead}</p>

      <section className="drink-group">
        <h3 className="drink-group-title drink-group-title--major">日本酒</h3>
        {sake.map((g) => (
          <div key={g.slug} className="drink-subgroup">
            <h4 className="drink-group-title">{g.title}</h4>
            <DrinkList items={g.items} />
          </div>
        ))}
      </section>

      <section className="drink-group">
        <h3 className="drink-group-title drink-group-title--major">{shochu.title}</h3>
        <DrinkList items={shochu.items} />
      </section>

      <section className="drink-group">
        <h3 className="drink-group-title drink-group-title--major">{wine.title}</h3>
        <p className="drink-desc">{wine.lead}</p>
        <div className="wine-recommend">
          <p className="wine-badge">{wine.recommend.badge}</p>
          <h4 className="wine-title">{wine.recommend.title}</h4>
          <p className="wine-subtitle">{wine.recommend.subtitle}</p>
          {wine.recommend.body.map((p) => (
            <p key={p} className="wine-body">
              {p}
            </p>
          ))}
        </div>
      </section>

      <p className="hidden-sake">{hiddenSake}</p>
    </div>
  );
}
