/**
 * SES案件管理システム - Vite設定ファイル
 * 
 * 機能:
 * - React開発環境の構築
 * - TypeScript + JSXのトランスパイル設定
 * - 開発サーバーの設定
 * - ビルド最適化設定
 * - Lucide Reactの最適化除外設定
 * 
 * 設定内容:
 * - React プラグインの有効化
 * - 依存関係の最適化設定
 * - Hot Module Replacement (HMR) 対応
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
