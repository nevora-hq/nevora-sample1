import { ALACARTE } from "../lib/siteConfig";

// アラカルト（お好み）の一例。データは lib/siteConfig.js の ALACARTE。
export default function AlaCarte() {
  return (
    <>
      <p className="section-lead">※{ALACARTE.note}</p>
      <dl className="alacarte-list">
        {ALACARTE.items.map((item) => (
          <div key={item.name} className="alacarte-item">
            <dt className="alacarte-name">{item.name}</dt>
            <dd className="alacarte-body">
              {item.body}
              {item.details && (
                <ul className="alacarte-details">
                  {item.details.map((d) => (
                    <li key={d.label}>
                      <strong>{d.label}</strong>：{d.text}
                    </li>
                  ))}
                </ul>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}
