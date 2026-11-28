// output: "export"(静的エクスポート)ではgetServerSidePropsが使えないため、
// robots.txt と sitemap.xml はビルド前にpublic/へ書き出す。
// package.jsonのprebuildスクリプトから自動実行される。
//
// 検索エンジンに登録される運用：robots.txt は全ページ許可、
// sitemap.xml は STATIC_PATHS の全ページを載せる。
const fs = require("fs");
const path = require("path");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl) {
  throw new Error(
    "[generate-seo-files] NEXT_PUBLIC_SITE_URL が未設定です。robots.txt/sitemap.xml に正しい絶対URLを書き出せません。"
  );
}
// 末尾スラッシュがあると `${siteUrl}/` が `//` になるため取り除く
const base = siteUrl.replace(/\/+$/, "");

const publicDir = path.join(__dirname, "..", "public");

// サイトに存在するページ（ページを追加したらここにも追記する。404 は含めない）
const STATIC_PATHS = ["/", "/menu/", "/access/", "/contact/", "/privacy-policy/", "/terms/"];

const robots = ["User-agent: *", "Allow: /", "", `Sitemap: ${base}/sitemap.xml`, ""].join("\n");
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");

const today = new Date().toISOString().slice(0, 10);
const urls = STATIC_PATHS.map(
  (p) => `  <url><loc>${base}${p}</loc><lastmod>${today}</lastmod></url>`
);
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  "</urlset>",
  "",
].join("\n");
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");

console.log(
  `[generate-seo-files] robots.txt と sitemap.xml（${STATIC_PATHS.length}ページ）を生成しました / base: ${base}`
);
