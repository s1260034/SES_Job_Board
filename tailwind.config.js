/**
 * SES案件管理システム - Tailwind CSS設定ファイル
 * 
 * 機能:
 * - ユーティリティファーストCSSフレームワークの設定
 * - カスタムデザインシステムの定義
 * - レスポンシブデザインのブレークポイント設定
 * - パージ対象ファイルの指定
 * 
 * 設定内容:
 * - content: スキャン対象ファイルパス（HTML, JS, TS, JSX, TSX）
 * - theme: カスタムテーマ拡張（将来的にカラーパレット等追加予定）
 * - plugins: 追加プラグイン（現在は未使用）
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
