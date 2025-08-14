# SES案件管理システム

## 概要
SES事業部における案件情報を効率的に管理し、Outlookメールから自動的に案件情報を抽出・登録することで、手動入力作業を削減し業務効率を向上させるシステムです。

## 主な機能

### 🤖 LLM メール自動解析
- **高精度抽出**: LLM（Large Language Model）を使用した高精度な案件情報抽出
- **フォールバック機能**: LLMが利用できない場合は正規表現ベースの解析に自動切り替え
- **信頼度表示**: 解析結果の信頼度をパーセンテージで表示

### 📧 メール解析機能
- Outlookメールから案件情報を自動抽出
- 企業名、案件名、概要、スキル、単価、勤務地などを自動識別
- 複数の解析方法（LLM / 正規表現）から選択可能

### 📊 案件管理機能
- 案件の登録、編集、削除、コピー
- ステータス管理（募集中、提案中、成約済、終了）
- お気に入り機能と閲覧履歴
- Excel一括登録機能

### 🔍 検索・フィルタ機能
- キーワード検索
- スキル、単価、勤務地、ステータスでのフィルタリング
- 詳細検索機能

### 👥 ユーザー管理
- ロールベースアクセス制御（管理者、営業、エンジニア）
- 権限に応じた機能制限

## LLM連携について

### 対応モデル
- **Phi-3-mini-4k-instruct-q4**: 軽量で高性能なモデル
- **llama.cpp**: ローカル実行可能なLLMランタイム

### セットアップ方法

#### 1. llama.cppサーバーの起動
```bash
# llama.cppをダウンロード・ビルド
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

# モデルファイルをダウンロード
wget https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf

# サーバーを起動
./server -m Phi-3-mini-4k-instruct-q4.gguf --host 0.0.0.0 --port 8080
```

#### 2. 環境変数の設定
```bash
# .env.local ファイルを作成
VITE_LLM_API_ENDPOINT=http://localhost:8080/v1/chat/completions
VITE_LLM_MODEL=Phi-3-mini-4k-instruct-q4
```

### API仕様
システムはOpenAI互換のAPIフォーマットを使用します：

```typescript
// リクエスト例
{
  "model": "Phi-3-mini-4k-instruct-q4",
  "messages": [
    {
      "role": "system",
      "content": "あなたはSES案件管理システムのメール解析AIです。"
    },
    {
      "role": "user", 
      "content": "メール内容..."
    }
  ],
  "max_tokens": 1024,
  "temperature": 0.1
}
```

## 技術スタック

### フロントエンド
- **React 18**: UIライブラリ
- **TypeScript**: 型安全性
- **Tailwind CSS**: スタイリング
- **Lucide React**: アイコン

### バックエンド（想定）
- **llama.cpp**: LLMランタイム
- **Microsoft Outlook**: メール連携
- **Excel/VBA**: データ管理・自動化

### 開発環境
- **Vite**: ビルドツール
- **ESLint**: コード品質
- **WebContainer**: ブラウザ内開発環境

## インストール・起動

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```

## 使用方法

### 1. ログイン
デモユーザーでログイン：
- 営業: `tanaka@ses-company.com`
- エンジニア: `sato@ses-company.com`
- 管理者: `suzuki@ses-company.com`
- パスワード: `password`

### 2. メール解析
1. 「案件登録」画面を開く
2. 右側の「メール自動解析」エリアでLLMまたは正規表現を選択
3. Outlookからメール内容をコピー&ペースト
4. 「解析開始」ボタンをクリック
5. 左側のフォームに自動入力された内容を確認・修正
6. 「案件を登録」で保存

### 3. 案件管理
- **ダッシュボード**: 統計情報と最近の案件
- **案件一覧**: 全案件の表示・管理
- **検索**: 詳細な検索・フィルタ機能
- **お気に入り**: 重要な案件をブックマーク
- **履歴**: 閲覧した案件の履歴

## 要件定義書準拠

本システムは「SES事業部案件管理システム要件定義書」に基づいて開発されており、以下の要件を満たしています：

- ✅ メール自動同期機能
- ✅ データ管理機能（全20項目対応）
- ✅ 重複排除機能
- ✅ LLM連携による高精度抽出
- ✅ フォールバック機能
- ✅ ログ・エラーハンドリング

## ライセンス
MIT License

## 開発者
SES事業部システム開発チーム