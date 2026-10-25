# 電磁気ナビ

大学受験生向けの電磁気学の解説教材で、先生が生徒の質問に答えるときの手引きとしても使えるReactアプリです。

## 起動

```bash
cd app
npm install
npm run dev        # 開発サーバー（http://localhost:5173）
npm run build      # dist/ に静的ファイルを出力
npm run preview    # ビルド結果を確認
```

`dist/` は静的ファイルだけでできているので、Netlify、GitHub Pages、学内サーバーなどにそのまま置けます。
URLはハッシュ方式（`#/ch/emf/coil` など）なので、サーバー側の設定はいりません。

## 構成

| パス | 内容 |
|---|---|
| `src/content/ch_*.js` | 各章の本文（全15章） |
| `src/content/faq.js` | Q&A集。`source: 'knowhow'` は実際の質問対応をもとにしたもの、`'added'` は同じ考え方で追加したもの |
| `src/content/reference.js` | 用語集と公式集（根拠と適用条件つき） |
| `src/content/dsl.js` | 本文を書くための小さな記法 |
| `src/figures/index.jsx` | 解説図（SVG） |
| `src/lib/search.js` | 全文検索（表記ゆれの辞書つき） |

## 本文の書き方

本文の中では次の記法が使えます。

- `$...$`：数式（KaTeX）
- `**太字**`
- `==強調（赤字）==`
- `[[ch:章id/節id|表示名]]`：章・節へのリンク
- `[[faq:id|表示名]]`：Q&Aへのリンク
- `[[g:用語]]`：用語集へのリンク

枠の種類は `key`（大原則）、`point`（着眼点）、`warn`（よくある誤解）、`tip`（コツ）、`adv`（発展・読み飛ばしOK）、`def`（定義）、`summary`（まとめ）です。

Q&Aを追加するときは、`faq.js` の配列にオブジェクトを1つ足してください。検索の対象には自動で入ります。
