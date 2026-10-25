import {
  SITE,
  HOLIDAY_NOTE,
  MAP_PLACE_URL,
  MAP_EMBED_URL,
  MAP_EMBED_FALLBACK_URL,
  INSTAGRAM_URL,
  telHref,
} from "../lib/siteConfig";

// 店舗情報（トップ・/access で共用）。定休日の例外（日・月曜も4名様以上は営業）を
// 表の上の枠で強調し、Googleマップを埋め込む。
export default function StoreInfo() {
  const { company } = SITE;
  const href = telHref(company.tel);

  const rows = [
    { label: "店名", value: company.name },
    { label: "営業時間", value: company.businessHours },
    { label: "定休日", value: company.closedDays, strong: true },
    { label: "座席数", value: company.seats },
    { label: "住所", value: company.address },
    { label: "アクセス", value: company.access },
    { label: "電話番号", value: href ? <a href={href}>{company.tel}</a> : company.tel },
    {
      label: "Instagram",
      value: INSTAGRAM_URL ? (
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
          {INSTAGRAM_URL}
        </a>
      ) : null,
    },
  ].filter((row) => row.value);

  return (
    <>
      <aside className="holiday-callout" aria-label="定休日のご案内">
        <p className="holiday-callout-badge">定休日のご案内</p>
        <p className="holiday-callout-title">{HOLIDAY_NOTE.headline}</p>
        <p className="holiday-callout-body">※{HOLIDAY_NOTE.body}</p>
      </aside>

      <table className="info-table">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td className={row.strong ? "info-strong" : undefined}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="map-embed">
        <iframe
          src={MAP_EMBED_URL || MAP_EMBED_FALLBACK_URL}
          title="Googleマップ：鮨しょうの所在地"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <p className="map-link">
        <a href={MAP_PLACE_URL} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
          Googleマップで開く
        </a>
      </p>
    </>
  );
}
