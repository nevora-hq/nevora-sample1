import Layout from "../components/Layout";
import { SITE, BOOKING_NOTE, HOLIDAY_NOTE, telHref } from "../lib/siteConfig";
import { buildBreadcrumbJsonLd } from "../lib/structuredData";

export async function getStaticProps() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  return {
    props: {
      jsonLd: [
        buildBreadcrumbJsonLd(siteUrl, [
          { name: "トップ", url: `${siteUrl}/` },
          { name: "ご予約・お問い合わせ", url: `${siteUrl}/contact/` },
        ]),
      ].filter(Boolean),
    },
  };
}

// ご予約はお電話のみ（フォーム・メールでの受付はしない）。
export default function Contact({ jsonLd }) {
  const { company } = SITE;
  const href = telHref(company.tel);

  return (
    <Layout
      title={`ご予約・お問い合わせ｜${SITE.name}`}
      description="鮨しょうはご予約なしでもご利用いただけます。ご来店前に営業しているかをお電話でご確認ください。ご予約もお電話のみです。日・月曜日も4名様以上なら営業いたします。"
      canonicalPath="/contact/"
      panel
      jsonLd={jsonLd}
    >
      <h1 className="page-title">ご予約・お問い合わせ</h1>
      <p className="page-lead">{BOOKING_NOTE}</p>

      <section className="note-box">
        <p>
          <strong>{HOLIDAY_NOTE.headline}</strong>
          <br />
          {HOLIDAY_NOTE.body}
        </p>
      </section>

      <section className="contact-direct">
        <h2 className="section-title">お電話でのご予約・ご相談</h2>
        {href && (
          <p className="contact-mail-action">
            <a href={href} className="btn btn--primary btn--lg">
              電話で予約する（{company.tel}）
            </a>
          </p>
        )}
        <ul className="contact-list">
          {company.tel && (
            <li>
              <span className="contact-list-label">電話</span>
              {href ? <a href={href}>{company.tel}</a> : company.tel}
              {company.businessHours && (
                <span className="contact-list-note">（受付：{company.businessHours}）</span>
              )}
            </li>
          )}
          {company.closedDays && (
            <li>
              <span className="contact-list-label">定休日</span>
              {company.closedDays}
            </li>
          )}
        </ul>
      </section>
    </Layout>
  );
}
