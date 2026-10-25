import Link from "next/link";
import { SITE, telHref } from "../lib/siteConfig";

// 各ページの末尾に置く共通の予約誘導ブロック。
// 電話番号が仮表示のあいだは、電話ボタンを出さない（telHref が空文字を返す）。
export default function Cta({
  title = "ご予約・ご相談",
  lead = "ご予約なしでもご利用いただけます。ご来店の前に、営業しているかをお電話でご確認ください。日・月曜日も4名様以上なら営業いたします。",
}) {
  const { tel, businessHours } = SITE.company;
  const href = telHref(tel);

  return (
    <section className="cta">
      <div className="container container--wide cta-inner">
        <h2 className="cta-title">{title}</h2>
        <p className="cta-lead">{lead}</p>
        <div className="cta-actions">
          <Link href="/contact" className="btn btn--primary btn--lg">
            ご予約・お問い合わせ
          </Link>
          {href && (
            <a href={href} className="btn btn--ghost btn--lg">
              電話でご予約（{tel}）
            </a>
          )}
        </div>
        {businessHours && <p className="cta-note">営業時間：{businessHours}</p>}
      </div>
    </section>
  );
}
