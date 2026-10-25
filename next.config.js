const { PHASE_PRODUCTION_BUILD } = require("next/constants");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  // 静的ホスティング(ConoHa WING等のApache系サーバー)へアップロードする前提のため、
  // 各ページを /price/index.html の形で書き出す。
  // これを付けないと /price(拡張子なし)へのリンクがサーバー側の設定次第で404になる。
  trailingSlash: true,
};

// NEXT_PUBLIC_SITE_URL未設定時、components/Layout.jsはcanonical/OGPタグを
// 丸ごと出力しないフェイルセーフ設計になっている(安全側だが検知されにくい)。
// ビルド時点で気づけるよう、`next build`(本番ビルド)では未設定をエラーにし、
// `next dev`では警告のみに留める。
module.exports = (phase) => {
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    const message =
      "[next.config.js] NEXT_PUBLIC_SITE_URL が未設定です。canonical/OGP(components/Layout.js)が出力されなくなります。";
    if (phase === PHASE_PRODUCTION_BUILD) {
      throw new Error(message);
    }
    console.warn(message);
  }
  return nextConfig;
};
