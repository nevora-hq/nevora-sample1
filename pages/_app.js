import { useEffect } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import "../styles/globals.css";
import { GA_MEASUREMENT_ID, isGAEnabled, pageview } from "../lib/gtag";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    if (!isGAEnabled) return;

    const handleRouteChange = (url) => pageview(url);
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  // スクロールで要素がふわっと現れるアニメーション（ページ遷移のたびに設定し直す）
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let io;
    const setup = () => {
      if (io) io.disconnect();
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      document
        // 文字は対象外。画像・写真・地図・スライダー・Instagramなどのメディアだけ
        .querySelectorAll(
          ".menu-slider, .seasonal, .photo-placeholder, .map-embed, .instagram-embed, .home-stripe img:not(.menu-slider img):not(.seasonal img), .page-section img:not(.menu-slider img):not(.seasonal img)"
        )
        .forEach((el) => {
          if (el.classList.contains("is-visible")) return;
          el.classList.add("reveal");
          io.observe(el);
        });
    };
    const t = setTimeout(setup, 50);
    const onDone = () => setTimeout(setup, 50);
    router.events.on("routeChangeComplete", onDone);
    return () => {
      clearTimeout(t);
      router.events.off("routeChangeComplete", onDone);
      if (io) io.disconnect();
    };
  }, [router.events]);

  return (
    <>
      {isGAEnabled && (
        <>
          {/* Google Analytics 4 (GA4) 計測タグ。
              NEXT_PUBLIC_GA_MEASUREMENT_ID が本番環境で設定されている場合のみ読み込む */}
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}
      <Component {...pageProps} />
    </>
  );
}
