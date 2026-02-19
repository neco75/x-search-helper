# X Search Helper

X（旧Twitter）の高度な検索を簡単に使えるChrome拡張機能です。
検索オプションをGUIで選ぶだけで、複雑な検索クエリを自動生成します。

## 機能

- キーワード検索（AND / OR / 完全一致 / 除外 / ハッシュタグ / キャッシュタグ）
- ユーザー指定（投稿者 / 宛先 / メンション / フォロー中のみ）
- コンテンツフィルター（画像 / 動画 / リンク / 認証済み / リプライ除外 / RT除外 / 引用のみ）
- 日付指定（開始日 / 終了日）
- エンゲージメント（最小いいね数 / 最小RT数 / 最小リプライ数）
- 言語・位置情報（言語指定 / 場所指定 / 範囲指定）
- リファレンスシート（各オプション横の `?` ボタンで構文・使用例を確認）
- ダーク/ライトモード切替
- リアルタイムプレビュー

## インストール方法

1. [Releases ページ](https://github.com/neco75/x-search-helper/releases) から最新のZIPファイルをダウンロード

2. ZIPファイルを解凍する

3. Chromeで `chrome://extensions` を開く

4. 右上の「デベロッパーモード」をオンにする

5. 「パッケージ化されていない拡張機能を読み込む」をクリック

6. 解凍したフォルダを選択

7. ツールバーに拡張機能のアイコンが表示されればインストール完了

## 使い方

1. ツールバーの拡張機能アイコンをクリック
2. 各カテゴリを開いて検索条件を入力
3. 画面上部にリアルタイムでクエリが表示される
4. 「Xで検索」ボタンで検索実行、またはコピーボタンでクエリをコピー

各フィールドの横にある `?` ボタンをクリックすると、使い方と構文例が表示されます。

## 検索オプション一覧

| 構文 | 説明 | 例 |
|------|------|-----|
| `word1 word2` | AND検索 | `プログラミング AI` |
| `"phrase"` | 完全一致 | `"機械学習 入門"` |
| `word1 OR word2` | OR検索 | `Python OR JavaScript` |
| `-word` | 除外 | `-広告` |
| `#tag` | ハッシュタグ | `#AI` |
| `$SYM` | キャッシュタグ | `$TSLA` |
| `from:user` | 投稿者 | `from:elonmusk` |
| `to:user` | 宛先 | `to:elonmusk` |
| `@user` | メンション | `@NASA` |
| `filter:follows` | フォロー中のみ | — |
| `filter:images` | 画像あり | — |
| `filter:videos` | 動画あり | — |
| `filter:media` | メディアあり | — |
| `filter:links` | リンクあり | — |
| `filter:verified` | 認証済みのみ | — |
| `-filter:replies` | リプライ除外 | — |
| `-filter:retweets` | RT除外 | — |
| `filter:quote` | 引用のみ | — |
| `url:domain` | URL指定 | `url:github.com` |
| `since:YYYY-MM-DD` | 開始日 | `since:2025-01-01` |
| `until:YYYY-MM-DD` | 終了日 | `until:2025-12-31` |
| `min_faves:N` | 最小いいね数 | `min_faves:100` |
| `min_retweets:N` | 最小RT数 | `min_retweets:50` |
| `min_replies:N` | 最小リプライ数 | `min_replies:10` |
| `lang:code` | 言語指定 | `lang:ja` |
| `near:city` | 場所 | `near:Tokyo` |
| `within:dist` | 範囲 | `within:10km` |

## 技術仕様

- Manifest Version: V3
- 権限: `tabs`（検索結果を新しいタブで開くため）
- 外部通信: なし（全てローカルで動作）
- データ保存: テーマ設定のみ `localStorage` に保存

## 応援する

このツールが役に立ったら、Ko-fiで応援していただけると嬉しいです。

https://ko-fi.com/neco75

## ライセンス

MIT License
