// サイト全体で使う構造化データ(JSON-LD)の共通組み立て関数。
// 各ページ(pages/*.js)には呼び出しだけを残し、スキーマの組み立てはここに一本化する。
// サイト名・事業者情報の定義元は lib/siteConfig.js。

import { SITE, INSTAGRAM_URL } from "./siteConfig";

export const SITE_NAME = SITE.name;

// ロゴ画像。TODO: 店のロゴ画像が用意できたら public/images/logo.png を差し替える（現在は仮画像）
// (Googleの推奨最小サイズは112×112px。正方形のPNGを用意する)。
export const LOGO_PATH = "/images/logo.png";

// サイト全体で常に出す構造化データ(WebSite)。
// サイト内検索を持たないテンプレートのため SearchAction は含めない。
export function buildWebsiteJsonLd(siteUrl) {
  if (!siteUrl) return null;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: SITE.description,
  };
}

// パンくずリスト。items: [{name, url}] を先頭から順に並べる。
export function buildBreadcrumbJsonLd(siteUrl, items) {
  if (!siteUrl || !Array.isArray(items) || items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// 一覧ページ(実績一覧・サービス一覧等)用のItemList。items: [{name, url}]。
export function buildItemListJsonLd(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

// FAQPage。faqs: [{question, answer}]。
export function buildFaqJsonLd(faqs) {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

// 店舗情報用のLocalBusiness(Restaurant)。pages/index.js から出力する。
// ドメイン未定のため、url（とドメインに依存するlogo）は出力しない。
// TODO: ドメインが決まったら url を追加する
export function buildRestaurantJsonLd() {
  const { company } = SITE;
  const parts = company.addressParts;
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: company.name,
    description: SITE.description,
    ...(company.tel && { telephone: company.tel }),
    ...(parts && {
      address: {
        "@type": "PostalAddress",
        addressCountry: "JP",
        postalCode: parts.postalCode,
        addressRegion: parts.region,
        addressLocality: parts.locality,
        streetAddress: parts.street,
      },
    }),
    // 営業時間 17:30〜21:00、定休日は日・月曜日（4名様以上のご予約は日・月曜も営業）
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "17:30",
        closes: "21:00",
      },
    ],
    ...(INSTAGRAM_URL && { sameAs: [INSTAGRAM_URL] }),
    servesCuisine: "寿司",
  };
}
