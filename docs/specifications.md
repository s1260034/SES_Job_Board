# SES案件管理システム 仕様書

## 1. システム仕様概要

### 1.1 システム構成
```
┌─────────────────────────────────────────────────────────┐
│                    フロントエンド                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │   React 18  │ │ TypeScript  │ │Tailwind CSS │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │Lucide React │ │    Vite     │ │   ESLint    │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  外部システム連携                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ LLMサーバー  │ │   Outlook   │ │ローカルDB    │      │
│  │(llama.cpp)  │ │   メール    │ │(LocalStorage)│      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### 1.2 技術スタック詳細

#### フロントエンド
- **React**: 18.3.1
- **TypeScript**: 5.5.3
- **Vite**: 5.4.2
- **Tailwind CSS**: 3.4.1
- **Lucide React**: 0.344.0

#### 開発・ビルドツール
- **ESLint**: 9.9.1
- **PostCSS**: 8.4.35
- **Autoprefixer**: 10.4.18

#### データ処理
- **XLSX**: 0.18.5 (Excel処理)
- **Papa Parse**: 5.5.3 (CSV処理)

## 2. アーキテクチャ設計

### 2.1 コンポーネント構成
```
src/
├── components/           # UIコンポーネント
│   ├── auth/            # 認証関連
│   ├── cases/           # 案件管理
│   ├── dashboard/       # ダッシュボード
│   ├── favorites/       # お気に入り
│   ├── history/         # 履歴
│   └── layout/          # レイアウト
├── hooks/               # カスタムフック
├── services/            # 外部サービス連携
├── types/               # 型定義
├── data/                # モックデータ
└── App.tsx              # メインアプリケーション
```

### 2.2 状態管理設計
- **認証状態**: useAuth カスタムフック
- **案件データ**: useCases カスタムフック
- **ローカル状態**: React useState/useEffect
- **永続化**: localStorage API

### 2.3 ルーティング設計
```typescript
// 画面遷移管理
const views = {
  dashboard: 'ダッシュボード',
  cases: '案件一覧',
  search: '案件検索',
  favorites: 'お気に入り',
  history: '閲覧履歴',
  create: '案件登録',
  edit: '案件編集',
  copy: '案件コピー'
};
```

## 3. データベース設計

### 3.1 データ構造

#### 案件テーブル（Cases）
```typescript
interface Case {
  // 基本情報
  id: string;                    // 主キー: CASE-001形式
  companyName: string;           // 企業名
  name: string;                  // 案件名
  overview: string;              // 案件概要
  
  // スキル情報
  requiredSkills: string[];      // 必須スキル配列
  preferredSkills: string[];     // 歓迎スキル配列
  developmentEnvironment: string[]; // 開発環境配列
  
  // 条件情報
  rateMin: number;              // 最低単価（円）
  rateMax: number;              // 最高単価（円）
  workLocation: string;          // 勤務地
  remoteFrequency: string;       // リモート頻度
  expectedStartDate: string;     // 開始予定日（YYYY-MM-DD）
  workHours: string;            // 勤務時間
  period: string;                // 契約期間
  
  // 契約情報
  settlementConditions: string;  // 精算条件
  paymentTerms: string;          // 支払いサイト
  recruitmentCount: number;      // 募集人数
  contractType: string;          // 契約形態
  businessFlow: string;          // 商流
  foreignNationalAllowed: boolean; // 外国籍可否
  interviewMethod: string;       // 面談方法
  
  // メタデータ
  notes: string;                // 備考
  emailSubject: string;         // 元メール件名
  receivedAt: string;           // 受信日時（ISO 8601）
  status: CaseStatus;           // ステータス
  createdAt: string;            // 作成日時（ISO 8601）
  updatedAt: string;            // 更新日時（ISO 8601）
  createdBy: string;            // 作成者ID
  assignedTo?: string;          // 担当者ID
  
  // 関連データ
  referenceMaterials?: ReferenceMaterial[]; // 参考資料
  applications?: Application[];  // 連絡履歴
  imageUrl?: string;            // 案件画像URL
}

type CaseStatus = 'recruiting' | 'proposing' | 'contracted' | 'ended';
```

#### ユーザーテーブル（Users）
```typescript
interface User {
  // 基本情報
  id: string;                   // 主キー
  name: string;                 // 氏名
  email: string;                // メールアドレス（ユニーク）
  role: UserRole;               // ロール
  department: string;           // 部署
  
  // エンジニア情報
  skills: string[];             // 保有スキル
  experience: number;           // 経験年数
  
  // ユーザー行動データ
  favorites: string[];          // お気に入り案件ID配列
  viewHistory: ViewHistoryItem[]; // 閲覧履歴
  applications: Application[];   // 連絡履歴
}

type UserRole = 'admin' | 'sales' | 'engineer';

interface ViewHistoryItem {
  caseId: string;              // 案件ID
  viewedAt: string;            // 閲覧日時（ISO 8601）
}
```

#### 連絡テーブル（Applications）
```typescript
interface Application {
  // 基本情報
  id: string;                   // 主キー: APP-001形式
  caseId: string;              // 案件ID（外部キー）
  userId: string;              // ユーザーID（外部キー）
  appliedAt: string;           // 連絡日時（ISO 8601）
  
  // 連絡内容
  message: string;             // 連絡メッセージ
  resumeUrl?: string;          // 参考資料URL
  
  // ステータス管理
  status: ApplicationStatus;    // 連絡ステータス
  notes?: string;              // 営業メモ
  interviewDate?: string;      // 面談日時（ISO 8601）
  feedback?: string;           // フィードバック
}

type ApplicationStatus = 
  | 'pending'              // 新規連絡
  | 'reviewing'            // 書類選考中
  | 'interview_scheduled'  // 面談予定
  | 'interview_completed'  // 面談完了
  | 'accepted'             // 採用決定
  | 'rejected'             // 不採用
  | 'withdrawn';           // 辞退
```

#### 参考資料テーブル（ReferenceMaterials）
```typescript
interface ReferenceMaterial {
  id: string;                   // 主キー
  name: string;                 // 資料名
  url: string;                  // 資料URL
  type: MaterialType;           // 資料種別
  uploadedAt: string;           // 登録日時（ISO 8601）
}

type MaterialType = 'document' | 'image' | 'link' | 'other';
```

### 3.2 データ関連図
```
Users (1) ──────── (*) Applications (*) ──────── (1) Cases
  │                                                   │
  │                                                   │
  └── favorites[] ────────────────────────────────────┘
  └── viewHistory[] ──────────────────────────────────┘
                                                      │
                                                      │
                                              ReferenceMaterials (*)
```

## 4. API設計

### 4.1 LLM API仕様

#### エンドポイント
```
POST /v1/chat/completions
```

#### リクエスト形式
```typescript
interface LLMRequest {
  model: string;                // "Phi-3-mini-4k-instruct-q4"
  messages: Message[];          // 会話履歴
  max_tokens: number;           // 最大トークン数
  temperature: number;          // 創造性パラメータ
  stop?: string[];             // 停止文字列
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

#### レスポンス形式
```typescript
interface LLMResponse {
  choices: Choice[];
  usage: Usage;
}

interface Choice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
```

### 4.2 内部API設計

#### 案件管理API
```typescript
// 案件作成
createCase(caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Case

// 案件更新
updateCase(id: string, updates: Partial<Case>): void

// 案件削除
deleteCase(id: string): void

// 案件コピー
copyCase(id: string): Case | null

// 案件検索
filterCases(filters: CaseFilters): Case[]

// 案件取得
getCaseById(id: string): Case | undefined
```

#### 認証API
```typescript
// ログイン
login(email: string, password: string): boolean

// ログアウト
logout(): void

// 権限チェック
canEdit(): boolean
canDelete(): boolean
```

#### ユーザー行動API
```typescript
// お気に入り追加
addToFavorites(caseId: string): void

// お気に入り削除
removeFromFavorites(caseId: string): void

// 履歴追加
addToHistory(caseId: string): void

// 連絡追加
addApplication(caseId: string, data: ApplicationData): Application | null
```

## 5. UI/UX設計

### 5.1 デザインシステム

#### カラーパレット
```css
/* プライマリカラー */
--primary-50: #eff6ff;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* セカンダリカラー */
--purple-500: #8b5cf6;
--purple-600: #7c3aed;

/* ステータスカラー */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #06b6d4;

/* グレースケール */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-500: #6b7280;
--gray-900: #111827;
```

#### タイポグラフィ
```css
/* フォントファミリー */
font-family: system-ui, -apple-system, sans-serif;

/* フォントサイズ */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* 行間 */
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

#### スペーシング
```css
/* 8pxベースのスペーシングシステム */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### 5.2 コンポーネント設計

#### 基本コンポーネント
```typescript
// ボタンコンポーネント
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// カードコンポーネント
interface CardProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

// モーダルコンポーネント
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

#### レイアウトコンポーネント
```typescript
// ヘッダーコンポーネント
interface HeaderProps {
  user: User;
  onLogout: () => void;
}

// ナビゲーションコンポーネント
interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  canEdit: boolean;
}

// サイドバーコンポーネント
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}
```

### 5.3 レスポンシブデザイン

#### ブレークポイント
```css
/* Tailwind CSS ブレークポイント */
sm: 640px   /* タブレット */
md: 768px   /* 小型デスクトップ */
lg: 1024px  /* デスクトップ */
xl: 1280px  /* 大型デスクトップ */
2xl: 1536px /* 超大型デスクトップ */
```

#### グリッドシステム
```typescript
// レスポンシブグリッド例
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* コンテンツ */}
</div>

// フレックスレイアウト例
<div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
  {/* コンテンツ */}
</div>
```

## 6. セキュリティ設計

### 6.1 認証・認可

#### 認証フロー
```typescript
// ログイン処理
const login = (email: string, password: string): boolean => {
  const user = mockUsers.find(u => u.email === email);
  if (user && password === 'password') {
    setUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return true;
  }
  return false;
};

// 権限チェック
const canEdit = (): boolean => {
  return user?.role === 'admin' || user?.role === 'sales';
};

const canDelete = (): boolean => {
  return user?.role === 'admin' || user?.role === 'sales';
};
```

#### ロールベースアクセス制御
```typescript
// 権限マトリックス
const permissions = {
  admin: {
    cases: ['create', 'read', 'update', 'delete'],
    applications: ['read', 'update'],
    users: ['read', 'update']
  },
  sales: {
    cases: ['create', 'read', 'update', 'delete'],
    applications: ['read', 'update'],
    users: ['read']
  },
  engineer: {
    cases: ['read'],
    applications: ['create', 'read'],
    users: ['read']
  }
};
```

### 6.2 データ保護

#### ローカルストレージ暗号化
```typescript
// データ暗号化（実装例）
const encryptData = (data: any): string => {
  return btoa(JSON.stringify(data));
};

const decryptData = (encryptedData: string): any => {
  return JSON.parse(atob(encryptedData));
};
```

#### 入力値検証
```typescript
// バリデーション関数
const validateCaseData = (data: Partial<Case>): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.name?.trim()) {
    errors.push('案件名は必須です');
  }
  
  if (!data.overview?.trim()) {
    errors.push('案件概要は必須です');
  }
  
  if (!data.requiredSkills?.length) {
    errors.push('必須スキルを1つ以上選択してください');
  }
  
  return { isValid: errors.length === 0, errors };
};
```

### 6.3 XSS対策

#### サニタイゼーション
```typescript
// HTMLエスケープ
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// URLバリデーション
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
```

## 7. パフォーマンス設計

### 7.1 最適化戦略

#### コンポーネント最適化
```typescript
// React.memo による再レンダリング防止
const CaseCard = React.memo<CaseCardProps>(({ case: caseItem, ...props }) => {
  // コンポーネント実装
});

// useMemo による計算結果キャッシュ
const filteredCases = useMemo(() => {
  return cases.filter(caseItem => {
    // フィルタリング処理
  });
}, [cases, filters]);

// useCallback による関数メモ化
const handleCaseClick = useCallback((caseId: string) => {
  // クリック処理
}, []);
```

#### 遅延読み込み
```typescript
// React.lazy による動的インポート
const CaseForm = React.lazy(() => import('./components/cases/CaseForm'));
const ExcelImport = React.lazy(() => import('./components/cases/ExcelImport'));

// Suspense による読み込み状態管理
<Suspense fallback={<LoadingSpinner />}>
  <CaseForm />
</Suspense>
```

### 7.2 データ最適化

#### 仮想化
```typescript
// 大量データの仮想化（実装例）
const VirtualizedList = ({ items, renderItem }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div className="virtual-list">
      {visibleItems.map(renderItem)}
    </div>
  );
};
```

#### キャッシュ戦略
```typescript
// ローカルキャッシュ
const cacheManager = {
  set: (key: string, data: any, ttl: number = 3600000) => {
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(item));
  },
  
  get: (key: string) => {
    const item = localStorage.getItem(`cache_${key}`);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    if (Date.now() - parsed.timestamp > parsed.ttl) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }
    
    return parsed.data;
  }
};
```

## 8. エラーハンドリング

### 8.1 エラー分類

#### システムエラー
```typescript
class SystemError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SystemError';
  }
}

class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

#### エラーバウンダリ
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // エラーログ送信処理
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### 8.2 ユーザーフィードバック

#### トースト通知
```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const showToast = (toast: ToastProps) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  };
  
  return { toasts, showToast };
};
```

#### エラー表示
```typescript
const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-center space-x-2">
      <AlertCircle className="w-5 h-5 text-red-600" />
      <span className="text-red-800">{error}</span>
    </div>
  </div>
);
```

## 9. テスト設計

### 9.1 テスト戦略

#### 単体テスト
```typescript
// コンポーネントテスト例
describe('CaseCard', () => {
  it('should render case information correctly', () => {
    const mockCase = {
      id: 'CASE-001',
      name: 'Test Case',
      overview: 'Test Overview',
      // ... other properties
    };
    
    render(<CaseCard case={mockCase} onView={jest.fn()} />);
    
    expect(screen.getByText('Test Case')).toBeInTheDocument();
    expect(screen.getByText('Test Overview')).toBeInTheDocument();
  });
});

// フック テスト例
describe('useAuth', () => {
  it('should login successfully with valid credentials', () => {
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      const success = result.current.login('test@example.com', 'password');
      expect(success).toBe(true);
    });
    
    expect(result.current.user).toBeDefined();
  });
});
```

#### 統合テスト
```typescript
// ユーザーフローテスト例
describe('Case Management Flow', () => {
  it('should create, edit, and delete a case', async () => {
    render(<App />);
    
    // ログイン
    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'tanaka@ses-company.com' }
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password' }
    });
    fireEvent.click(screen.getByText('ログイン'));
    
    // 案件作成
    fireEvent.click(screen.getByText('新規案件登録'));
    // ... フォーム入力
    fireEvent.click(screen.getByText('案件を登録'));
    
    // 案件が作成されたことを確認
    await waitFor(() => {
      expect(screen.getByText('新規案件')).toBeInTheDocument();
    });
  });
});
```

### 9.2 テストデータ

#### モックデータ
```typescript
// テスト用モックデータ
export const mockTestCases: Case[] = [
  {
    id: 'TEST-001',
    companyName: 'テスト企業',
    name: 'テスト案件',
    overview: 'テスト用の案件概要',
    requiredSkills: ['React', 'TypeScript'],
    preferredSkills: ['Next.js'],
    rateMin: 600000,
    rateMax: 800000,
    workLocation: '東京都港区',
    status: 'recruiting',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: '1',
    // ... other properties
  }
];
```

## 10. デプロイメント設計

### 10.1 ビルド設定

#### Vite設定
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lucide-react', 'xlsx']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});
```

#### TypeScript設定
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [
    { "path": "./tsconfig.node.json" }
  ]
}
```

### 10.2 環境設定

#### 環境変数
```bash
# .env.local
VITE_LLM_API_ENDPOINT=http://localhost:8080/v1/chat/completions
VITE_LLM_MODEL=Phi-3-mini-4k-instruct-q4
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=SES案件管理システム
```

#### Docker設定（参考）
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 11. 監視・ログ設計

### 11.1 ログ設計

#### ログレベル
```typescript
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  
  error(message: string, data?: any) {
    if (this.level >= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, data);
    }
  }
  
  warn(message: string, data?: any) {
    if (this.level >= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, data);
    }
  }
  
  info(message: string, data?: any) {
    if (this.level >= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, data);
    }
  }
  
  debug(message: string, data?: any) {
    if (this.level >= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
}
```

#### パフォーマンス監視
```typescript
// パフォーマンス測定
const performanceMonitor = {
  startTimer: (name: string) => {
    performance.mark(`${name}-start`);
  },
  
  endTimer: (name: string) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    console.info(`Performance: ${name} took ${measure.duration}ms`);
  }
};
```

### 11.2 エラー追跡

#### エラー収集
```typescript
// グローバルエラーハンドラー
window.addEventListener('error', (event) => {
  console.error('Global error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
```

## 12. 保守・運用設計

### 12.1 コード品質

#### ESLint設定
```javascript
// eslint.config.js
export default [
  {
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'react-hooks/recommended'
    ],
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      '@typescript-eslint/no-unused-vars': 'error',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  }
];
```

#### Prettier設定
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 12.2 ドキュメント管理

#### コードコメント
```typescript
/**
 * 案件情報を管理するカスタムフック
 * @returns {Object} 案件管理に関する状態と関数
 */
export const useCases = () => {
  // 実装
};

/**
 * メール内容から案件情報を抽出する
 * @param {string} emailContent - メール内容
 * @returns {Promise<LLMAnalysisResult>} 解析結果
 */
async function analyzeEmail(emailContent: string): Promise<LLMAnalysisResult> {
  // 実装
}
```

#### README更新
```markdown
# 開発者向けガイド

## セットアップ
1. Node.js 18以上をインストール
2. `npm install` で依存関係をインストール
3. `npm run dev` で開発サーバーを起動

## ディレクトリ構成
- `src/components/` - UIコンポーネント
- `src/hooks/` - カスタムフック
- `src/services/` - 外部サービス連携
- `src/types/` - TypeScript型定義

## 開発ルール
- TypeScriptの型定義を必ず行う
- コンポーネントは200行以内に収める
- テストを書く（カバレッジ80%以上）
```

---

**文書作成日**: 2024年2月3日  
**作成者**: SES事業部システム開発チーム  
**バージョン**: 1.0  
**最終更新**: 2024年2月3日