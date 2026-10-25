import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SITE, NAV_ITEMS } from "../lib/siteConfig";

// ナビゲーション項目は lib/siteConfig.js の NAV_ITEMS を唯一の定義元とする。
// 「ご予約」だけはCTAボタンとして右端に固定表示するため、
// 通常リンクの列からは除外している。
const CONTACT_HREF = "/contact";

export default function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const close = () => setOpen(false);
  const navLinks = NAV_ITEMS.filter((item) => item.href !== CONTACT_HREF);

  return (
    <header className="site-header">
      <div className="container container--wide header-inner">
        <Link href="/" className="logo" onClick={close}>
          {SITE.logoText}
          {/* 屋号の読み仮名。漢字二文字の店名だけでは読めないため小さく添える */}
          {SITE.logoReading && <span className="logo-reading">{SITE.logoReading}</span>}
          {SITE.logoTagline && <span className="logo-tagline">｜{SITE.logoTagline}</span>}
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle-bar" />
        </button>
        <nav className={`main-nav${open ? " open" : ""}`}>
          <Link
            href="/"
            className="main-nav-link"
            onClick={close}
            aria-current={router.pathname === "/" ? "page" : undefined}
          >
            トップ
          </Link>
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="main-nav-link"
              onClick={close}
              aria-current={router.pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link href={CONTACT_HREF} className="header-cta" onClick={close}>
            ご予約
          </Link>
        </nav>
      </div>
    </header>
  );
}
