import Layout from "../components/Layout";
import { SITE } from "../lib/siteConfig";

// 案件ごとに使い回す前提の汎用プライバシーポリシー。
// 案件ごとに以下を必ず確認・修正すること:
//  ・アクセス解析ツールの利用有無(GA4を入れない案件では該当項を削除)
//  ・Cookieの利用有無
//  ・取得した個人情報の保管期間・第三者提供の有無
//  ・問い合わせ窓口(lib/siteConfig.js の company.email / tel を参照)
//  ・飲食店の場合、食物アレルギー等の健康に関する情報を扱う点を明記する
export default function PrivacyPolicy() {
  const { company } = SITE;

  return (
    <Layout
      title={`プライバシーポリシー｜${SITE.name}`}
      description={`${company.name}における個人情報の取り扱いについてご案内します。`}
      canonicalPath="/privacy-policy/"
      panel
    >
      <h1 className="page-title">プライバシーポリシー</h1>
      <p>
        {company.name}（以下「当店」といいます）は、当サイトの運営およびご予約対応にあたり、
        お客様の個人情報を以下のとおり取り扱います。
      </p>

      <h2>1. 取得する情報</h2>
      <p>当店は、ご予約の際に、お名前とお電話番号のみをお伺いします。</p>

      <h2>2. 利用目的</h2>
      <p>取得した情報は、ご予約の確認・変更のご連絡にのみ利用し、それ以外の目的では利用しません。</p>

      <h2>3. 第三者への提供</h2>
      <p>
        当店は、お客様の同意なく個人情報を第三者に提供しません。ただし、法令に基づく開示請求があった場合、
        およびご予約管理に必要な範囲で外部に委託する場合（この場合は委託先に対して適切な管理を求めます）を除きます。
      </p>

      <h2>4. アクセス解析について</h2>
      <p>
        当サイトでは、サイトの利用状況を把握するためにGoogleアナリティクスを利用する場合があります。
        Googleアナリティクスは、Cookieを使用して個人を特定しない形で情報を収集します。
        Cookieの利用を望まれない場合は、ブラウザの設定から無効にすることができます。
      </p>

      <h2>5. お問い合わせ窓口</h2>
      <p>
        {company.name}
        <br />
        {company.email && <>メール：{company.email}</>}
        {company.tel && (
          <>
            <br />
            電話：{company.tel}
            {company.businessHours && `（${company.businessHours}）`}
          </>
        )}
      </p>

      <h2>6. 本ポリシーの変更</h2>
      <p>
        当店は、法令の変更や事業内容の変更に応じて本ポリシーを改定する場合があります。
        改定後の内容は当ページに掲載した時点から適用されます。
      </p>
    </Layout>
  );
}
