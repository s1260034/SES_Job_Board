# SES案件管理システム API設計書

## 1. API概要

### 1.1 API設計原則
- **RESTful**: REST原則に従った設計
- **一貫性**: 統一されたレスポンス形式
- **セキュリティ**: 認証・認可の徹底
- **バージョニング**: APIバージョン管理
- **ドキュメント**: 詳細なAPI仕様書

### 1.2 ベースURL
```
Production:  https://api.ses-management.com/v1
Staging:     https://staging-api.ses-management.com/v1
Development: http://localhost:3001/api/v1
```

### 1.3 認証方式
- **JWT (JSON Web Token)**: Bearer Token認証
- **有効期限**: 24時間
- **リフレッシュトークン**: 30日間

### 1.4 共通レスポンス形式
```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "timestamp": "2024-01-15T10:00:00Z",
  "requestId": "req_123456789"
}
```

### 1.5 エラーレスポンス形式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力データに不正があります",
    "details": [
      {
        "field": "email",
        "message": "有効なメールアドレスを入力してください"
      }
    ]
  },
  "timestamp": "2024-01-15T10:00:00Z",
  "requestId": "req_123456789"
}
```

## 2. 認証API

### 2.1 ログイン
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "田中太郎",
      "role": "sales",
      "department": "営業部"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 86400
    }
  }
}
```

### 2.2 ログアウト
```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

### 2.3 トークンリフレッシュ
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2.4 現在のユーザー情報取得
```http
GET /auth/me
Authorization: Bearer {accessToken}
```

## 3. 案件API

### 3.1 案件一覧取得
```http
GET /cases?page=1&limit=20&status=recruiting&skills=React,TypeScript
Authorization: Bearer {accessToken}
```

**クエリパラメータ**
- `page`: ページ番号（デフォルト: 1）
- `limit`: 1ページあたりの件数（デフォルト: 20、最大: 100）
- `status`: ステータスフィルター（recruiting, proposing, contracted, ended）
- `skills`: スキルフィルター（カンマ区切り）
- `rateMin`: 最低単価
- `rateMax`: 最高単価
- `location`: 勤務地
- `search`: キーワード検索
- `sortBy`: ソート項目（createdAt, updatedAt, rateMin, rateMax）
- `sortOrder`: ソート順（asc, desc）

**レスポンス**
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "case_123",
        "name": "大手ECサイト リニューアルプロジェクト",
        "companyName": "テックソリューション株式会社",
        "overview": "React/TypeScriptを使用したフロントエンド開発...",
        "requiredSkills": ["React", "TypeScript", "CSS3"],
        "preferredSkills": ["Next.js", "Tailwind CSS"],
        "rateMin": 650000,
        "rateMax": 850000,
        "workLocation": "東京都港区",
        "status": "recruiting",
        "expectedStartDate": "2024-02-01",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 3.2 案件詳細取得
```http
GET /cases/{caseId}
Authorization: Bearer {accessToken}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": "case_123",
    "name": "大手ECサイト リニューアルプロジェクト",
    "companyName": "テックソリューション株式会社",
    "overview": "React/TypeScriptを使用したフロントエンド開発...",
    "requiredSkills": ["React", "TypeScript", "CSS3"],
    "preferredSkills": ["Next.js", "Tailwind CSS"],
    "rateMin": 650000,
    "rateMax": 850000,
    "workLocation": "東京都港区",
    "remoteFrequency": "フルリモート可",
    "developmentEnvironment": ["React", "TypeScript", "Node.js"],
    "period": "6ヶ月",
    "settlementConditions": "140-180時間",
    "paymentTerms": "月末締め翌月末払い",
    "recruitmentCount": 2,
    "contractType": "準委任契約",
    "businessFlow": "2次請け",
    "foreignNationalAllowed": false,
    "interviewMethod": "オンライン面談",
    "expectedStartDate": "2024-02-01",
    "workHours": "9:00-18:00",
    "notes": "チームは若手中心で活気があります...",
    "status": "recruiting",
    "imageUrl": "https://example.com/image.jpg",
    "referenceMaterials": [
      {
        "id": "ref_123",
        "name": "要件定義書",
        "url": "https://example.com/requirements.pdf",
        "type": "document",
        "uploadedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "createdBy": {
      "id": "user_123",
      "name": "田中太郎"
    },
    "assignedTo": {
      "id": "user_456",
      "name": "佐藤花子"
    },
    "applicationCount": 5,
    "acceptedCount": 1,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### 3.3 案件作成
```http
POST /cases
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "新規Webアプリ開発",
  "companyName": "株式会社テックイノベーション",
  "overview": "Vue.js/Nuxt.jsを使用したWebアプリケーション開発",
  "requiredSkills": ["Vue.js", "Nuxt.js", "JavaScript"],
  "preferredSkills": ["TypeScript", "Vuex"],
  "rateMin": 600000,
  "rateMax": 800000,
  "workLocation": "東京都新宿区",
  "remoteFrequency": "週2日出社",
  "expectedStartDate": "2024-03-01",
  "recruitmentCount": 1
}
```

### 3.4 案件更新
```http
PUT /cases/{caseId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "更新された案件名",
  "status": "proposing"
}
```

### 3.5 案件削除
```http
DELETE /cases/{caseId}
Authorization: Bearer {accessToken}
```

### 3.6 案件一括登録
```http
POST /cases/bulk
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "cases": [
    {
      "name": "案件1",
      "companyName": "企業1",
      "overview": "概要1",
      "requiredSkills": ["React"]
    },
    {
      "name": "案件2",
      "companyName": "企業2",
      "overview": "概要2",
      "requiredSkills": ["Vue.js"]
    }
  ]
}
```

### 3.7 メール解析
```http
POST /cases/analyze-email
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "emailContent": "件名: React開発エンジニア募集\n\n案件概要:\n...",
  "analysisMethod": "llm" // or "regex"
}
```

## 4. ユーザーAPI

### 4.1 ユーザー一覧取得
```http
GET /users?role=engineer&page=1&limit=20
Authorization: Bearer {accessToken}
```

### 4.2 ユーザー詳細取得
```http
GET /users/{userId}
Authorization: Bearer {accessToken}
```

### 4.3 ユーザー情報更新
```http
PUT /users/{userId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "更新された名前",
  "skills": ["React", "TypeScript", "Node.js"],
  "experienceYears": 5
}
```

### 4.4 エンジニア参画状況取得
```http
GET /users/engineers/participation
Authorization: Bearer {accessToken}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "participating": [
      {
        "user": {
          "id": "user_123",
          "name": "佐藤花子",
          "department": "エンジニア部",
          "experienceYears": 3,
          "skills": ["React", "TypeScript"]
        },
        "case": {
          "id": "case_123",
          "name": "ECサイト開発",
          "companyName": "テック企業"
        },
        "application": {
          "id": "app_123",
          "status": "accepted",
          "appliedAt": "2024-01-15T10:00:00Z"
        }
      }
    ],
    "waiting": [
      {
        "id": "user_456",
        "name": "田中一郎",
        "department": "エンジニア部",
        "experienceYears": 2,
        "skills": ["Vue.js", "JavaScript"]
      }
    ],
    "statistics": {
      "totalEngineers": 10,
      "participating": 3,
      "waiting": 7
    }
  }
}
```

## 5. 応募API

### 5.1 応募一覧取得
```http
GET /applications?caseId=case_123&status=pending
Authorization: Bearer {accessToken}
```

### 5.2 応募作成
```http
POST /applications
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "caseId": "case_123",
  "message": "この案件に興味があります。React開発経験3年あります。",
  "resumeUrl": "https://example.com/resume.pdf"
}
```

### 5.3 応募ステータス更新
```http
PUT /applications/{applicationId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "interview_scheduled",
  "interviewDate": "2024-02-01T14:00:00Z",
  "notes": "技術面談を実施予定"
}
```

### 5.4 応募削除（辞退）
```http
DELETE /applications/{applicationId}
Authorization: Bearer {accessToken}
```

## 6. お気に入りAPI

### 6.1 お気に入り一覧取得
```http
GET /favorites
Authorization: Bearer {accessToken}
```

### 6.2 お気に入り追加
```http
POST /favorites
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "caseId": "case_123"
}
```

### 6.3 お気に入り削除
```http
DELETE /favorites/{caseId}
Authorization: Bearer {accessToken}
```

## 7. 閲覧履歴API

### 7.1 閲覧履歴取得
```http
GET /history?limit=20
Authorization: Bearer {accessToken}
```

### 7.2 閲覧履歴追加
```http
POST /history
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "caseId": "case_123"
}
```

## 8. ファイルAPI

### 8.1 ファイルアップロード
```http
POST /files/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [binary data]
type: "reference_material"
caseId: "case_123"
```

### 8.2 ファイル削除
```http
DELETE /files/{fileId}
Authorization: Bearer {accessToken}
```

## 9. 統計API

### 9.1 ダッシュボード統計取得
```http
GET /statistics/dashboard
Authorization: Bearer {accessToken}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "cases": {
      "total": 150,
      "recruiting": 45,
      "proposing": 30,
      "contracted": 60,
      "ended": 15
    },
    "applications": {
      "total": 300,
      "pending": 25,
      "reviewing": 40,
      "accepted": 80,
      "rejected": 155
    },
    "engineers": {
      "total": 50,
      "participating": 15,
      "waiting": 35
    },
    "trends": {
      "casesThisMonth": 12,
      "applicationsThisMonth": 45,
      "averageRate": 750000
    }
  }
}
```

### 9.2 案件統計取得
```http
GET /statistics/cases?period=month&year=2024
Authorization: Bearer {accessToken}
```

## 10. エラーコード一覧

### 10.1 認証エラー
- `AUTH_REQUIRED`: 認証が必要です
- `INVALID_TOKEN`: 無効なトークンです
- `TOKEN_EXPIRED`: トークンの有効期限が切れています
- `INVALID_CREDENTIALS`: 認証情報が正しくありません

### 10.2 認可エラー
- `INSUFFICIENT_PERMISSIONS`: 権限が不足しています
- `RESOURCE_FORBIDDEN`: このリソースへのアクセスは禁止されています

### 10.3 バリデーションエラー
- `VALIDATION_ERROR`: 入力データに不正があります
- `REQUIRED_FIELD_MISSING`: 必須フィールドが不足しています
- `INVALID_FORMAT`: データ形式が正しくありません

### 10.4 リソースエラー
- `RESOURCE_NOT_FOUND`: リソースが見つかりません
- `RESOURCE_ALREADY_EXISTS`: リソースは既に存在します
- `RESOURCE_CONFLICT`: リソースの競合が発生しました

### 10.5 システムエラー
- `INTERNAL_SERVER_ERROR`: 内部サーバーエラーが発生しました
- `SERVICE_UNAVAILABLE`: サービスが利用できません
- `RATE_LIMIT_EXCEEDED`: レート制限を超過しました

## 11. レート制限

### 11.1 制限値
- **一般API**: 1000リクエスト/時間
- **認証API**: 10リクエスト/分
- **ファイルアップロード**: 100リクエスト/時間
- **メール解析**: 50リクエスト/時間

### 11.2 レスポンスヘッダー
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

## 12. Webhook

### 12.1 案件ステータス変更通知
```http
POST {webhook_url}
Content-Type: application/json

{
  "event": "case.status_changed",
  "data": {
    "caseId": "case_123",
    "oldStatus": "recruiting",
    "newStatus": "contracted",
    "changedBy": "user_123",
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

### 12.2 応募ステータス変更通知
```http
POST {webhook_url}
Content-Type: application/json

{
  "event": "application.status_changed",
  "data": {
    "applicationId": "app_123",
    "caseId": "case_123",
    "userId": "user_456",
    "oldStatus": "pending",
    "newStatus": "accepted",
    "changedBy": "user_123",
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```