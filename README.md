# 鮨しょう 公式サイト

寿司店「鮨しょう」の公式サイトです（Next.js Pages Router + プレーンCSS、静的エクスポート）。

## 開発

```bash
npm install
# .env.local に NEXT_PUBLIC_SITE_URL を設定する（未設定だとビルドがエラーになる）
npm run dev      # 開発サーバー
npm run build    # 静的エクスポート（out/）
```

## 構成

| 場所 | 内容 |
|---|---|
| `lib/siteConfig.js` | 文言・コース・アラカルト・お飲み物・店舗情報などのデータ（編集はここ） |
| `pages/` | `/` `/menu` `/access` `/contact` `/privacy-policy` `/terms` `/404` |
| `components/` | `CourseCards`（コース）/ `AlaCarte` / `DrinksMenu`（お飲み物の枠）/ `StoreInfo`（店舗情報＋地図）/ `InstagramEmbed` ほか |
| `styles/globals.css` | 全スタイル。配色は `:root` の変数 |
| `public/images/` | ロゴ・OGP・favicon（現在は仮画像） |

## 確定待ちの項目（`TODO:` で検索）

- Googleマップの正式な埋め込みURL（`MAP_EMBED_URL`。空のあいだは店名＋住所検索の代替URLで表示）
- 写真（`IMAGES.hero` 1600×900px / `IMAGES.band` 1600×520px）、ロゴ・OGP・favicon の本番画像
- キャンセルの取り扱い（`pages/terms.js`）

## 公開前の仮設定

全ページ noindex、robots.txt は全 Disallow です。公開時に `components/Layout.js` と
`scripts/generate-seo-files.js` のコメントに従って通常運用へ戻してください。
