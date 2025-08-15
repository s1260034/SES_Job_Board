/**
 * SES案件管理システム - ESLint設定ファイル
 * 
 * 機能:
 * - TypeScript + React プロジェクトのコード品質管理
 * - 構文エラー・潜在的バグの検出
 * - コーディング規約の統一
 * - React Hooks使用ルールの強制
 * 
 * 設定内容:
 * - JavaScript推奨ルール
 * - TypeScript推奨ルール  
 * - React Hooks ルール
 * - React Refresh ルール（開発時のHMR最適化）
 * - ブラウザ環境のグローバル変数設定
 */
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);
