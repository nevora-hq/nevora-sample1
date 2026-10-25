import { Html, Head, Main, NextScript } from "next/document";

// Google Search Console(GSC)の所有権確認用metaタグ。
// 環境変数 NEXT_PUBLIC_GSC_VERIFICATION が設定されている場合のみ出力する。
// (HTMLファイルによる確認方式を使う場合は、確認用ファイルを public/ 直下に置くだけでよい)
const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION || "";

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        {/* ファビコンは案件ごとに public/ 直下と public/images/favicon.svg を差し替える */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {GSC_VERIFICATION && (
          <meta name="google-site-verification" content={GSC_VERIFICATION} />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
