// output: "export"(静的エクスポート)ではgetServerSidePropsが使えないため、
// robots.txt はビルド前にpublic/へ書き出す。
// package.jsonのprebuildスクリプトから自動実行される。
//
// 【公開前の仮設定】公開許可が出るまで、検索エンジンに登録させない。
// sitemap.xml は生成しない（全ページ Disallow のため）。
// TODO: 公開時は下記のコメントのとおり通常運用に戻す。
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

// 【公開前の仮設定】公開準備中は、検索エンジンに
// 一切登録させない。全ページを Disallow にし、サイトマップは生成しない
// （Sitemap: 行も書かない。クロール対象を示す手掛かりを残さないため）。
// 公開時に、robots.txt を
//   User-agent: *
//   Allow: /
//   Disallow: /api/
//   （空行）
//   Sitemap: <サイトURL>/sitemap.xml
// に戻し、STATIC_PATHS からの sitemap.xml 生成を復活させる。
const robots = `User-agent: *
Disallow: /
`;

fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");

// 過去のビルドで生成された sitemap.xml が public/ に残っていると、
// 静的エクスポート時にそのまま out/ へコピーされてしまうため、毎回削除する。
const sitemapPath = path.join(publicDir, "sitemap.xml");
if (fs.existsSync(sitemapPath)) {
  fs.unlinkSync(sitemapPath);
  console.log("[generate-seo-files] 既存の public/sitemap.xml を削除しました");
}

console.log(
  `[generate-seo-files] public/robots.txt を生成しました（全ページ Disallow・サイトマップなし / base: ${base}）`
);
