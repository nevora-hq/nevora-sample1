import Link from "next/link";
import Photo from "./Photo";
import { HERO, IMAGES } from "../lib/siteConfig";

// トップページのファーストビュー(full-bleedヒーロー)。
// 写真は lib/siteConfig.js の IMAGES.hero（空のあいだは仮表示の枠）。
// 写真を入れたら pages/index.js の <link rel="preload"> も同じ内容にすること。
export default function HeroBanner() {
  return (
    <section className="hero-banner">
      <Photo
        base={IMAGES.hero}
        className="hero-banner-img"
        eager
        label="メインビジュアル写真（推奨 1600×900px）"
      />
      <div className="hero-banner-scrim" aria-hidden="true" />
      <div className="hero-banner-overlay">
        <div className="hero-banner-inner">
          <div className="hero-banner-copy">
            <h1 className="hero-banner-title">
              {HERO.title.split("\n").map((line, i) => (
                <span key={i} className="hero-banner-title-line">
                  {line}
                </span>
              ))}
            </h1>
            <p className="hero-banner-lead">{HERO.lead}</p>
            <div className="hero-banner-actions">
              {HERO.primaryCta && (
                <Link href={HERO.primaryCta.href} className="btn btn--primary">
                  {HERO.primaryCta.label}
                </Link>
              )}
              {HERO.secondaryCta && (
                <Link href={HERO.secondaryCta.href} className="btn btn--ghost">
                  {HERO.secondaryCta.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
