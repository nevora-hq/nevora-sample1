import { useEffect } from "react";
import Script from "next/script";
import { INSTAGRAM_URL } from "../lib/siteConfig";

// Instagram公式のプロフィール埋め込み（blockquote + embed.js）。
// 読み込みに失敗・遅延しても枠内のリンクボタンから開けるよう、ボタンは常に表示する。
export default function InstagramEmbed() {
  // ページ遷移で戻ってきたとき、embed.js は読み込み済みなので手動で再描画する
  useEffect(() => {
    if (typeof window !== "undefined" && window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, []);

  if (!INSTAGRAM_URL) return null;
  const permalink = `${INSTAGRAM_URL}?utm_source=ig_embed&utm_campaign=loading`;

  return (
    <div className="instagram-embed">
      <p className="instagram-link instagram-link--top">
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
          Instagramで見る
        </a>
      </p>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={permalink}
        data-instgrm-version="14"
      >
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
          鮨しょう（@sushi_sho1129）のInstagram
        </a>
      </blockquote>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => window.instgrm && window.instgrm.Embeds.process()}
      />
    </div>
  );
}
