# SES案件管理システム システム設計書

## 1. システム構成

### 1.1 全体アーキテクチャ
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/TS)    │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ - UI Components │    │ - API Server    │    │ - Cases         │
│ - State Mgmt    │    │ - Auth Logic    │    │ - Users         │
│ - Routing       │    │ - Business Logic│    │ - Applications  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   External      │◄─────────────┘
                        │   Services      │
                        │                 │
                        │ - LLM Service   │
                        │ - File Storage  │
                        │ - Email Service │
                        └─────────────────┘
```

### 1.2 技術スタック
- **フロントエンド**: React 18, TypeScript, Tailwind CSS, Vite
- **状態管理**: React Hooks (useState, useEffect)
- **ルーティング**: React Router (将来実装予定)
- **UI コンポーネント**: Lucide React (アイコン)
- **バックエンド**: Node.js, Express.js (将来実装)
- **データベース**: SQL（未定）
- **認証**: Supabase Auth
- **ファイル処理**: xlsx, papaparse
- **デプロイ**: Netlify

## 2. フロントエンド設計

### 2.1 コンポーネント構成
```
src/
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Navigation.tsx
│   ├── dashboard/
│   │   ├── EngineerDashboard.tsx
│   │   ├── SalesAdminDashboard.tsx
│   │   └── ApplicationStatusModal.tsx
│   ├── cases/
│   │   ├── CaseList.tsx
│   │   ├── CaseCard.tsx
│   │   ├── CaseDetail.tsx
│   │   ├── CaseForm.tsx
│   │   ├── SearchFilters.tsx
│   │   ├── ApplicationModal.tsx
│   │   ├── ReferenceMaterials.tsx
│   │   ├── EmailImport.tsx
│   │   ├── ExcelImport.tsx
│   │   └── EngineerParticipationList.tsx
│   ├── favorites/
│   │   └── FavoritesList.tsx
│   └── history/
│       └── HistoryList.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useCases.ts
├── services/
│   └── llmService.ts
├── types/
│   └── index.ts
├── data/
│   └── mockData.ts
└── App.tsx
```

### 2.2 状態管理設計
- **グローバル状態**: useAuth, useCases カスタムフック
- **ローカル状態**: 各コンポーネント内でuseState
- **データフロー**: Props drilling (将来的にContext API検討)

### 2.3 ルーティング設計
現在は単一ページアプリケーション（SPA）として実装。
将来的なルーティング構成：
```
/login          - ログインページ
/dashboard      - ダッシュボード
/cases          - 案件一覧
/cases/:id      - 案件詳細
/cases/new      - 案件登録
/cases/:id/edit - 案件編集
/search         - 案件検索
/favorites      - お気に入り
/history        - 閲覧履歴
/profile        - プロフィール
/admin          - 管理者画面
```

## 3. バックエンド設計

### 3.1 API設計
RESTful API設計（将来実装）

#### 認証API
```
POST /api/auth/login     - ログイン
POST /api/auth/logout    - ログアウト
GET  /api/auth/me        - 現在のユーザー情報取得
```

#### 案件API
```
GET    /api/cases           - 案件一覧取得
GET    /api/cases/:id       - 案件詳細取得
POST   /api/cases           - 案件作成
PUT    /api/cases/:id       - 案件更新
DELETE /api/cases/:id       - 案件削除
POST   /api/cases/import    - 案件一括登録
POST   /api/cases/analyze   - メール解析
```

#### ユーザーAPI
```
GET    /api/users           - ユーザー一覧取得
GET    /api/users/:id       - ユーザー詳細取得
PUT    /api/users/:id       - ユーザー情報更新
```

#### 応募API
```
GET    /api/applications         - 応募一覧取得
POST   /api/applications         - 応募作成
PUT    /api/applications/:id     - 応募ステータス更新
DELETE /api/applications/:id     - 応募削除
```

### 3.2 ミドルウェア設計
- **認証ミドルウェア**: JWT トークン検証
- **認可ミドルウェア**: ロールベースアクセス制御
- **ログミドルウェア**: API アクセスログ
- **エラーハンドリング**: 統一エラーレスポンス

### 3.3 ビジネスロジック層
```
services/
├── authService.js      - 認証関連ロジック
├── caseService.js      - 案件管理ロジック
├── userService.js      - ユーザー管理ロジック
├── applicationService.js - 応募管理ロジック
├── emailService.js     - メール解析ロジック
└── fileService.js      - ファイル処理ロジック
```

## 4. セキュリティ設計

### 4.1 認証・認可
- **認証方式**: JWT (JSON Web Token)
- **パスワード**: bcrypt でハッシュ化
- **セッション**: httpOnly Cookie + CSRF トークン
- **権限管理**: RBAC (Role-Based Access Control)

### 4.2 データ保護
- **通信暗号化**: HTTPS 必須
- **入力検証**: サーバーサイドでの厳密な検証
- **SQLインジェクション対策**: パラメータ化クエリ
- **XSS対策**: 出力エスケープ

### 4.3 ファイルアップロード
- **ファイル形式制限**: Excel, CSV のみ許可
- **ファイルサイズ制限**: 最大10MB
- **ウイルススキャン**: アップロード時のスキャン
- **一時ファイル**: 処理後の自動削除

## 5. パフォーマンス設計

### 5.1 フロントエンド最適化
- **コード分割**: React.lazy による動的インポート
- **メモ化**: React.memo, useMemo, useCallback
- **仮想化**: 大量データ表示時の仮想スクロール
- **画像最適化**: WebP 形式、遅延読み込み

### 5.2 バックエンド最適化
- **データベース**: インデックス最適化
- **キャッシュ**: Redis によるセッション・データキャッシュ
- **ページネーション**: 大量データの分割取得
- **非同期処理**: ファイル処理の非同期化

### 5.3 ネットワーク最適化
- **CDN**: 静的ファイルの配信
- **圧縮**: gzip 圧縮
- **HTTP/2**: 多重化通信
- **キャッシュ戦略**: ブラウザキャッシュの活用

## 6. 監視・ログ設計

### 6.1 ログ設計
- **アクセスログ**: API アクセス履歴
- **エラーログ**: システムエラー詳細
- **監査ログ**: データ変更履歴
- **パフォーマンスログ**: レスポンス時間

### 6.2 監視項目
- **システムメトリクス**: CPU、メモリ、ディスク使用率
- **アプリケーションメトリクス**: レスポンス時間、エラー率
- **ビジネスメトリクス**: ユーザー数、案件数、応募数

### 6.3 アラート設計
- **システムアラート**: リソース使用率閾値超過
- **アプリケーションアラート**: エラー率上昇
- **ビジネスアラート**: 異常な利用パターン検知

## 7. デプロイ・運用設計

### 7.1 デプロイ戦略
- **環境**: Development, Staging, Production
- **CI/CD**: GitHub Actions による自動デプロイ
- **ブルーグリーンデプロイ**: ダウンタイムゼロ更新
- **ロールバック**: 問題発生時の即座復旧

### 7.2 バックアップ戦略
- **データベース**: 日次フルバックアップ + 時間単位差分
- **ファイル**: クラウドストレージへの自動同期
- **設定ファイル**: Git による管理
- **復旧手順**: 災害復旧計画書

### 7.3 スケーリング設計
- **水平スケーリング**: ロードバランサー + 複数インスタンス
- **垂直スケーリング**: リソース増強
- **データベース**: リードレプリカ、シャーディング
- **キャッシュ**: 分散キャッシュシステム