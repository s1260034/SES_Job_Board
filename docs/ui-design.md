# SES案件管理システム UI/UX設計書

## 1. デザインシステム概要

### 1.1 デザインコンセプト
- **モダン**: 最新のWebデザイントレンドを取り入れた洗練されたUI
- **直感的**: ユーザーが迷わない分かりやすいインターフェース
- **効率的**: 業務効率を向上させる機能的なデザイン
- **アクセシブル**: 全てのユーザーが利用しやすいユニバーサルデザイン

### 1.2 デザイン原則
- **一貫性**: 全画面で統一されたデザインルール
- **階層性**: 情報の重要度に応じた視覚的階層
- **フィードバック**: ユーザーアクションに対する明確な反応
- **予測可能性**: 期待通りに動作するインターフェース

## 2. カラーシステム

### 2.1 プライマリカラー
```css
/* メインブランドカラー */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* メインカラー */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

### 2.2 セカンダリカラー
```css
/* アクセントカラー */
--secondary-50: #fdf4ff;
--secondary-100: #fae8ff;
--secondary-200: #f5d0fe;
--secondary-300: #f0abfc;
--secondary-400: #e879f9;
--secondary-500: #d946ef;  /* セカンダリカラー */
--secondary-600: #c026d3;
--secondary-700: #a21caf;
--secondary-800: #86198f;
--secondary-900: #701a75;
```

### 2.3 ステータスカラー
```css
/* 成功 */
--success-500: #10b981;
--success-100: #d1fae5;

/* 警告 */
--warning-500: #f59e0b;
--warning-100: #fef3c7;

/* エラー */
--error-500: #ef4444;
--error-100: #fee2e2;

/* 情報 */
--info-500: #06b6d4;
--info-100: #cffafe;
```

### 2.4 グレースケール
```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

## 3. タイポグラフィ

### 3.1 フォントファミリー
```css
/* プライマリフォント */
--font-primary: 'Inter', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 
                'Noto Sans JP', 'Yu Gothic UI', 'Meiryo', sans-serif;

/* モノスペースフォント */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

### 3.2 フォントサイズ
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### 3.3 フォントウェイト
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 3.4 行間
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

## 4. スペーシングシステム

### 4.1 基本スペーシング（8pxベース）
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
```

### 4.2 レイアウトスペーシング
```css
--container-padding: var(--space-6);
--section-gap: var(--space-12);
--card-padding: var(--space-6);
--form-gap: var(--space-4);
```

## 5. コンポーネント設計

### 5.1 ボタンコンポーネント
```css
/* プライマリボタン */
.btn-primary {
  background: linear-gradient(135deg, var(--primary-600), var(--secondary-600));
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: 0.75rem;
  font-weight: var(--font-semibold);
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* セカンダリボタン */
.btn-secondary {
  background: white;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  padding: var(--space-3) var(--space-6);
  border-radius: 0.75rem;
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}
```

### 5.2 カードコンポーネント
```css
.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
  padding: var(--card-padding);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  border-bottom: 1px solid var(--gray-200);
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-4);
}
```

### 5.3 フォームコンポーネント
```css
.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: var(--text-base);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  margin-bottom: var(--space-2);
}
```

### 5.4 ステータスバッジ
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: 9999px;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.badge-recruiting {
  background: var(--info-100);
  color: var(--info-800);
}

.badge-proposing {
  background: var(--warning-100);
  color: var(--warning-800);
}

.badge-contracted {
  background: var(--success-100);
  color: var(--success-800);
}

.badge-ended {
  background: var(--gray-100);
  color: var(--gray-800);
}
```

## 6. レイアウト設計

### 6.1 グリッドシステム
```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

/* レスポンシブ */
@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}
```

### 6.2 フレックスボックス
```css
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.space-x-4 > * + * {
  margin-left: var(--space-4);
}

.space-y-4 > * + * {
  margin-top: var(--space-4);
}
```

## 7. レスポンシブデザイン

### 7.1 ブレークポイント
```css
/* モバイル */
@media (max-width: 767px) {
  .container {
    padding: 0 var(--space-4);
  }
  
  .card {
    padding: var(--space-4);
  }
}

/* タブレット */
@media (min-width: 768px) and (max-width: 1023px) {
  .container {
    padding: 0 var(--space-6);
  }
}

/* デスクトップ */
@media (min-width: 1024px) {
  .container {
    padding: 0 var(--space-8);
  }
}
```

### 7.2 モバイルファースト設計
- 最小幅320pxから対応
- タッチフレンドリーなインターフェース
- 44px以上のタップターゲット
- スワイプジェスチャー対応

## 8. アニメーション・トランジション

### 8.1 基本トランジション
```css
.transition-all {
  transition: all 0.2s ease;
}

.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.transition-transform {
  transition: transform 0.2s ease;
}
```

### 8.2 ホバーエフェクト
```css
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.hover-scale:hover {
  transform: scale(1.05);
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}
```

### 8.3 ローディングアニメーション
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## 9. アクセシビリティ

### 9.1 カラーコントラスト
- WCAG 2.1 AA準拠（4.5:1以上）
- 重要な情報は色だけでなく形状やテキストでも表現
- カラーブラインドユーザーへの配慮

### 9.2 キーボードナビゲーション
```css
.focus-visible:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 9.3 ARIAラベル
- 適切なrole属性の使用
- aria-label、aria-describedbyの活用
- スクリーンリーダー対応

## 10. ダークモード対応

### 10.1 カラー変数（ダークモード）
```css
@media (prefers-color-scheme: dark) {
  :root {
    --gray-50: #1f2937;
    --gray-100: #374151;
    --gray-200: #4b5563;
    --gray-300: #6b7280;
    --gray-400: #9ca3af;
    --gray-500: #d1d5db;
    --gray-600: #e5e7eb;
    --gray-700: #f3f4f6;
    --gray-800: #f9fafb;
    --gray-900: #ffffff;
  }
}
```

### 10.2 ダークモード切り替え
```css
[data-theme="dark"] {
  --bg-primary: var(--gray-900);
  --text-primary: var(--gray-100);
  --border-color: var(--gray-700);
}

[data-theme="light"] {
  --bg-primary: white;
  --text-primary: var(--gray-900);
  --border-color: var(--gray-200);
}
```

## 11. パフォーマンス最適化

### 11.1 CSS最適化
- Critical CSS のインライン化
- 未使用CSSの削除
- CSS Minification
- CSS Grid/Flexbox の活用

### 11.2 画像最適化
- WebP形式の使用
- 適切なサイズでの配信
- Lazy Loading
- Progressive JPEG

### 11.3 フォント最適化
- フォントサブセット化
- font-display: swap の使用
- プリロード指定
- システムフォントフォールバック