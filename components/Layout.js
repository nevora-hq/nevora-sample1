import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";
import { SITE } from "../lib/siteConfig";
import { SITE_NAME, buildWebsiteJsonLd } from "../lib/structuredData";

// ページ固有のJSON-LD(FAQPage/BreadcrumbList等)はjsonLd propで追加する。
// サイト全体で常に出すWebSite構造化データはlib/structuredData.jsを参照。

export default function Layout({
  children,
  title = SITE_NAME,
  description = SITE.description,
  // ページ個別のOGP画像。未指定のときは lib/siteConfig.js の SITE.ogImage を使う。
  ogImage = SITE.ogImage,
  hero = null,
  // panel=true で本文を白いカード(.page-panel)で包む。
  // 下層ページ(規約・404等)の可読性を上げるためのもの。
  panel = false,
  // wide=true で本文コンテナを1180pxに広げる。既定は960px。
  wide = false,
  // fullWidth=true では共通のcontainerで包まず、childrenをmain直下に置く。
  // トップページのように「画面幅いっぱいの帯を縦に積み、帯の中で
  // 自前のcontainerを持つ」構成のためのもの。
  fullWidth = false,
  canonicalPath = "",
  ogType = "website",
  // 公開前の仮設定: 現在は prop の値に関係なく常に noindex を出力する（下記 Head 参照）。
  noindex = true,
  jsonLd = [],
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const absoluteOgImage = ogImage && siteUrl ? `${siteUrl}${ogImage}` : ogImage;
  // NEXT_PUBLIC_SITE_URL未設定の環境(ローカル開発等)では絶対URLを組み立てられないため、
  // 不正確なcanonical/og:urlを出力しないよう、その場合はタグ自体を省略する。
  const canonicalUrl = siteUrl && canonicalPath ? `${siteUrl}${canonicalPath}` : "";
  const websiteJsonLd = buildWebsiteJsonLd(siteUrl);
  const allJsonLd = [websiteJsonLd, ...jsonLd].filter(Boolean);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* TODO: 公開前の仮設定。公開してよい状態になったら
            この2行を削除し、{noindex && <meta name="robots" content="noindex, nofollow" />} に戻す。
            あわせて scripts/generate-seo-files.js の robots.txt / sitemap も通常運用に戻すこと。 */}
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="ja_JP" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={ogType} />
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        {absoluteOgImage && <meta property="og:image" content={absoluteOgImage} />}
        <meta
          name="twitter:card"
          content={absoluteOgImage ? "summary_large_image" : "summary"}
        />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {absoluteOgImage && <meta name="twitter:image" content={absoluteOgImage} />}
        {allJsonLd.map((data, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
      </Head>
      {/* 全ページ共通の最背面グラデーション(position: fixedでヘッダー/フッターの
          背後にも回り込む)。ページごとの背景色は持たせず、ここに一本化する。 */}
      <div className="site-bg" aria-hidden="true" />
      <Header />
      <main className={fullWidth ? "main--full" : undefined}>
        {hero}
        {fullWidth ? (
          children
        ) : (
          <div className={`container${wide ? " container--wide" : ""}`}>
            {panel ? <div className="page-panel">{children}</div> : children}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
