import Link from "next/link";
import { SITE, FOOTER_LINKS, HOLIDAY_NOTE, telHref } from "../lib/siteConfig";

export default function Footer() {
  const { name, tel, address, businessHours, closedDays } = SITE.company;
  const href = telHref(tel);

  return (
    <footer className="site-footer">
      <div className="container container--wide">
        <p className="footer-name">{name}</p>
        {/* 店舗情報は lib/siteConfig.js の company を唯一の定義元とする。空にした項目は行ごと出力しない */}
        <p className="footer-contact">
          {address && <span>{address}</span>}
          {tel && <span>TEL {href ? <a href={href}>{tel}</a> : tel}</span>}
          {businessHours && <span>営業時間 {businessHours}</span>}
          {closedDays && (
            <span>
              定休日 {closedDays}（{HOLIDAY_NOTE.headline}）
            </span>
          )}
        </p>
        <nav className="footer-nav">
          {FOOTER_LINKS.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <p>&copy; {new Date().getFullYear()} {name}</p>
      </div>
    </footer>
  );
}
