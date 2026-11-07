import Layout from "../components/Layout";
import Cta from "../components/Cta";
import CourseCards from "../components/CourseCards";
import AlaCarte from "../components/AlaCarte";
import DrinksMenu from "../components/DrinksMenu";
import SeasonalSlider from "../components/SeasonalSlider";
import MenuSlider from "../components/MenuSlider";
import {
  SITE,
  MENU_GUIDE,
  MENU_NOTE,
  COURSE_GROUPS,
  ALACARTE,
} from "../lib/siteConfig";
import { buildBreadcrumbJsonLd } from "../lib/structuredData";

export async function getStaticProps() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  return {
    props: {
      jsonLd: [
        buildBreadcrumbJsonLd(siteUrl, [
          { name: "トップ", url: `${siteUrl}/` },
          { name: "お品書き", url: `${siteUrl}/menu/` },
        ]),
      ].filter(Boolean),
    },
  };
}

export default function Menu({ jsonLd }) {
  return (
    <Layout
      title={`お品書き｜${SITE.name}`}
      description="鮨しょうのお品書きです。おつまみコース 税込4,950円、大将おまかせ 税込8,580円・大将おまかせプレミアム 税込13,200円。期間限定コース、アラカルト、日本酒・焼酎・ワインもご紹介します。"
      canonicalPath="/menu/"
      fullWidth
      jsonLd={jsonLd}
    >
      {/* トップページと同じく、項目ごとに背景色の違う帯を縦に積む */}
      <section className="home-stripe home-zone-2" id="course">
        <div className="container container--wide">
          <h1 className="page-title">お品書き</h1>
          <p className="page-lead">
            <strong>{MENU_GUIDE.title}</strong>
            <br />
            {MENU_GUIDE.body}
            <br />
            {MENU_NOTE}
          </p>
          <h2 className="section-title">{COURSE_GROUPS.regular.title}</h2>
          <MenuSlider kind="food" label="料理メニューの画像" />
          <CourseCards group="regular" withCta slider />
        </div>
      </section>

      <section className="home-stripe home-zone-3" id="seasonal">
        <div className="container container--wide">
          <h2 className="section-title">
            {COURSE_GROUPS.seasonal.title}
            <span className="section-title-badge">{COURSE_GROUPS.seasonal.badge}</span>
          </h2>
          <SeasonalSlider size="large" />
        </div>
      </section>

      <section className="home-stripe home-zone-4" id="alacarte">
        <div className="container container--wide">
          <h2 className="section-title">{ALACARTE.title}</h2>
          <AlaCarte />
        </div>
      </section>

      <section className="home-stripe home-zone-1" id="drink">
        <div className="container container--wide">
          <MenuSlider kind="drink" label="お酒メニューの画像" />
          <DrinksMenu />
        </div>
      </section>

      <div className="home-zone-5">
        <Cta
          title="ご予約・ご相談"
          lead="コースのご相談もお電話にてお気軽にどうぞ。"
        />
      </div>
    </Layout>
  );
}
