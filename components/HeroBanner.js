import Link from "next/link";
import Photo from "./Photo";
import { HERO, IMAGES } from "../lib/siteConfig";

// 見出しの装飾。
//  ・「贅」「一貫」… 金色のグラデーション
//  ・漢字の直後にある助詞（の・を・に・が・と）… 小さくしてメリハリをつける
//    （「ひととき」のように平仮名が続く部分の「と」は対象外）
const DECORATE = /(贅|一貫)|(?<=[一-鿿])([のをにがと])/g;

function decorate(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(DECORATE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      m[1] ? (
        <span key={m.index} className="hero-gold">
          {m[1]}
        </span>
      ) : (
        <span key={m.index} className="hero-josi">
          {m[2]}
        </span>
      )
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

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
                  {decorate(line)}
                </span>
              ))}
            </h1>
            <p className="hero-banner-lead">
              {/* スマホでは「、」で2行に分ける（PCでは1つながり） */}
              {HERO.lead.split(/(?<=、)/).map((part, i) => (
                <span key={i} className="hero-lead-part">
                  {decorate(part)}
                </span>
              ))}
            </p>
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
