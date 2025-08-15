/**
 * SES案件管理システム - エントリーポイント
 * 
 * 機能:
 * - Reactアプリケーションの初期化
 * - ルートコンポーネント（App）のマウント
 * - StrictModeによる開発時の警告表示
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
