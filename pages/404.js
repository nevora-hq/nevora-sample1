import Link from "next/link";
import Layout from "../components/Layout";
import { SITE, NAV_ITEMS } from "../lib/siteConfig";

export default function NotFound() {
  return (
    <Layout
      title={`ページが見つかりません｜${SITE.name}`}
      description="お探しのページが見つかりませんでした。トップページまたは以下のメニューからお探しください。"
      noindex
      panel
    >
      <div className="not-found">
        {/* 数字の「404」は装飾。見出しは別に h1 として置く
            （見出しのないページを作らないため） */}
        <p className="not-found-code" aria-hidden="true">
          404
        </p>
        <h1 className="page-title">ページが見つかりません</h1>
        <p>
          お探しのページは見つかりませんでした。URLが変更・削除されたか、入力に誤りがある可能性があります。
        </p>
        <p>
          <Link href="/">トップページ</Link>に戻るか、以下からお探しください。
        </p>

        <ul className="not-found-link-list">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
