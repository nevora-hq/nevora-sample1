import Layout from "../components/Layout";
import Cta from "../components/Cta";
import StoreInfo from "../components/StoreInfo";
import InstagramEmbed from "../components/InstagramEmbed";
import { SITE } from "../lib/siteConfig";
import { buildBreadcrumbJsonLd } from "../lib/structuredData";

// 店舗情報ページ。飲食店シリーズ共通の URL（/access）。
export async function getStaticProps() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  return {
    props: {
      jsonLd: [
        buildBreadcrumbJsonLd(siteUrl, [
          { name: "トップ", url: `${siteUrl}/` },
          { name: "店舗情報", url: `${siteUrl}/access/` },
        ]),
      ].filter(Boolean),
    },
  };
}

export default function Access({ jsonLd }) {
  return (
    <Layout
      title={`店舗情報｜${SITE.name}`}
      description="鮨しょうの店舗情報です。営業時間17:30〜21:00、定休日は毎週日曜日・月曜日（4名様以上のご予約なら日・月曜も営業）。総席数17席。"
      canonicalPath="/access/"
      fullWidth
      jsonLd={jsonLd}
    >
      <section className="home-stripe home-zone-4">
        <div className="container container--wide">
          <h1 className="page-title">店舗情報</h1>
          <StoreInfo />
        </div>
      </section>

      <section className="home-stripe home-zone-1">
        <div className="container container--wide">
          <h2 className="section-title">Instagram</h2>
          <InstagramEmbed />
        </div>
      </section>

      <div className="home-zone-5">
        <Cta />
      </div>
    </Layout>
  );
}
