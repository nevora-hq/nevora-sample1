import Layout from "../components/Layout";
import Cta from "../components/Cta";
import CourseCards from "../components/CourseCards";
import AlaCarte from "../components/AlaCarte";
import DrinksMenu from "../components/DrinksMenu";
import MenuSlider from "../components/MenuSlider";
import {
  SITE,
  MENU_GUIDE,
  MENU_NOTE,
  COURSE_GROUPS,
  COURSE_INSTAGRAM_NOTE,
  INSTAGRAM_URL,
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
      description="鮨しょうのお品書きです。おつまみコース 税込4,950円、大将お任せコース 税込8,580円・12,100円。期間限定コース、アラカルト、日本酒・焼酎・ワインもご紹介します。"
      canonicalPath="/menu/"
      wide
      jsonLd={jsonLd}
    >
      <h1 className="page-title">お品書き</h1>
      <p className="page-lead">
        <strong>{MENU_GUIDE.title}</strong>
        <br />
        {MENU_GUIDE.body}
        <br />
        {MENU_NOTE}
      </p>

      <section className="page-section" id="course">
        <h2 className="section-title">{COURSE_GROUPS.regular.title}</h2>
        <MenuSlider kind="food" label="料理メニューの画像" />
        <CourseCards group="regular" withCta />
      </section>

      <section className="page-section" id="seasonal">
        <h2 className="section-title">
          {COURSE_GROUPS.seasonal.title}
          <span className="section-title-badge">{COURSE_GROUPS.seasonal.badge}</span>
        </h2>
        <CourseCards group="seasonal" />
        <p className="course-extra-note">
          ※{COURSE_INSTAGRAM_NOTE}
          {INSTAGRAM_URL && (
            <>
              {" "}
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                Instagramを見る →
              </a>
            </>
          )}
        </p>
      </section>

      <section className="page-section" id="alacarte">
        <h2 className="section-title">{ALACARTE.title}</h2>
        <AlaCarte />
      </section>

      <section className="page-section" id="drink">
        <MenuSlider kind="drink" label="お酒メニューの画像" />
        <DrinksMenu />
      </section>

      <Cta
        title="ご予約・ご相談"
        lead="コースのご相談もお電話にてお気軽にどうぞ。"
      />
    </Layout>
  );
}
