import Head from "next/head";
import Link from "next/link";
import Layout from "../components/Layout";
import HeroBanner from "../components/HeroBanner";
import SectionBand from "../components/SectionBand";
import MenuSlider from "../components/MenuSlider";
import CourseCards from "../components/CourseCards";
import StoreInfo from "../components/StoreInfo";
import InstagramEmbed from "../components/InstagramEmbed";
import FaqAccordion from "../components/FaqAccordion";
import Cta from "../components/Cta";
import { buildRestaurantJsonLd, buildFaqJsonLd } from "../lib/structuredData";
import { SITE, REEL_LINK, CONCEPT, MENU_GUIDE, MENU_NOTE, IMAGES, FAQS } from "../lib/siteConfig";

export async function getStaticProps() {
  return { props: { jsonLd: [buildRestaurantJsonLd(), buildFaqJsonLd(FAQS)].filter(Boolean) } };
}

export default function Home({ jsonLd }) {
  return (
    <Layout
      title={`${SITE.name}｜津本式熟成魚と3年熟成赤酢のシャリ`}
      description={SITE.description}
      canonicalPath="/"
      fullWidth
      jsonLd={jsonLd}
      hero={<HeroBanner />}
    >
      {/* ヒーロー写真が入ったら、LCP対策として preload を出す（srcSet/sizes は HeroBanner と同じにする） */}
      {IMAGES.hero && (
        <Head>
          <link
            rel="preload"
            as="image"
            href={`${IMAGES.hero}.webp`}
            imageSrcSet={`${IMAGES.hero}-640.webp 640w, ${IMAGES.hero}-1024.webp 1024w`}
            imageSizes="100vw"
            type="image/webp"
            fetchPriority="high"
          />
        </Head>
      )}

      <div className="home-page">
        {/* ---- コンセプト ---- */}
        <section className="home-stripe home-intro">
          <div className="container">
            <h2 className="intro-title">{CONCEPT.title}</h2>
            {CONCEPT.body.map((paragraph) => (
              <p key={paragraph} className="intro-body">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* 画像バンド（写真は lib/siteConfig.js の IMAGES.band） */}
        <SectionBand base={IMAGES.band} widths={[640, 1024, 1600]} objectPosition="50% 45%" />

        {/* ---- お品書き（おつまみコースを主役に） ---- */}
        <section className="home-stripe home-stripe--tint" id="menu">
          <div className="container container--wide">
            <h2 className="section-title">お品書き</h2>
            <p className="section-lead">
              <strong>{MENU_GUIDE.title}</strong>
              <br />
              {MENU_GUIDE.body}
              <br />
              {MENU_NOTE}
            </p>
            <MenuSlider kind="food" label="料理メニューの画像" />
            <CourseCards group="regular" compact />
            <h3 className="home-subtitle">お飲み物</h3>
            <MenuSlider kind="drink" label="お酒メニューの画像" />
            <p className="section-more">
              <Link href="/menu">期間限定コース・アラカルト・お飲み物を見る →</Link>
            </p>
          </div>
        </section>

        {/* ---- 店舗情報（定休日の例外を強調・Googleマップ） ---- */}
        <section className="home-stripe" id="access">
          <div className="container container--wide">
            <h2 className="section-title">店舗情報</h2>
            <StoreInfo />
          </div>
        </section>

        {/* ---- Instagram（ページ最下部付近） ---- */}
        <section className="home-stripe home-stripe--tint" id="instagram">
          <div className="container container--wide">
            <h2 className="section-title">Instagram</h2>
            <p className="section-lead">実際のコースのお料理は、当店の公式Instagramにて多数ご紹介しております。</p>
            <InstagramEmbed />
            <div className="home-reel">
              <a href={REEL_LINK.href} target="_blank" rel="noopener noreferrer" className="reel-link">
                <img
                  src={REEL_LINK.image}
                  width={REEL_LINK.width}
                  height={REEL_LINK.height}
                  alt={REEL_LINK.alt}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            </div>
            <p className="instagram-link">
              <a href={REEL_LINK.href} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                {REEL_LINK.caption}
              </a>
            </p>
          </div>
        </section>

        {/* ---- よくあるご質問 ---- */}
        <section className="home-stripe" id="faq">
          <div className="container container--wide">
            <div className="narrow-block">
              {/* 全体を開閉式にし、中に質問ごとの開閉式を入れる（回答は閉じていてもHTMLに含まれる） */}
              <details className="faq-group">
                <summary className="faq-group-title">
                  <h2>よくあるご質問</h2>
                  <span className="faq-group-count">{FAQS.length}件</span>
                </summary>
                <div className="faq-group-body">
                  <FaqAccordion items={FAQS} />
                </div>
              </details>
            </div>
          </div>
        </section>

        <Cta />
      </div>
    </Layout>
  );
}
