SES案件情報管理システム 要件定義書
1. システム概要
1.1 システム名
SES案件情報管理システム

1.2 目的
SES（System Engineering Service）企業における案件情報の効率的な管理と、営業・エンジニア・管理者間での情報共有を実現する。

1.3 対象ユーザー
営業担当者: 案件の登録・編集・提案管理
エンジニア: 案件の閲覧・検索・お気に入り管理
管理者: 全案件の管理・削除・システム全体の統制
2. 機能要件
2.1 認証・権限管理
2.1.1 ログイン機能
機能: メールアドレスとパスワードによる認証
入力項目:
メールアドレス（必須）
パスワード（必須）
デモアカウント:
営業: tanaka@ses-company.com
エンジニア: sato@ses-company.com
管理者: suzuki@ses-company.com
パスワード: password
2.1.2 権限管理
管理者: 全機能利用可能（案件の作成・編集・削除）
営業: 案件の作成・編集可能、削除不可
エンジニア: 案件の閲覧のみ可能
2.2 ダッシュボード機能
2.2.1 統計情報表示
総案件数
募集中案件数
成約案件数
平均単価
各統計の前月比表示
2.2.2 最近の案件表示
最新5件の案件をカード形式で表示
案件名、概要、単価、勤務地、開始予定日を表示
2.3 案件管理機能
2.3.1 案件一覧表示
表示項目:
案件画像
案件名
案件概要（2行まで）
ステータス（募集中/提案中/成約済/終了）
単価範囲
勤務地
開始予定日
必須スキル（最大3つ表示）
更新日
2.3.2 案件詳細表示
基本情報:
案件画像
案件名
ステータス
単価範囲
勤務地
稼働開始予定日
勤務時間
契約期間
リモートワーク条件
詳細情報:
案件概要
必須スキル
歓迎スキル
備考
参考資料
メタデータ:
案件ID
作成日
更新日
2.3.3 案件登録・編集機能
入力項目:
案件名（必須）
案件画像URL
案件概要（必須）
必須スキル（必須、複数選択可）
歓迎スキル（複数選択可）
最低単価（必須、数値）
最高単価（必須、数値）
勤務地（必須、選択式）
稼働開始予定日（必須）
リモートワーク条件
勤務時間
契約期間
備考
ステータス（募集中/提案中/成約済/終了）
参考資料（複数登録可）
2.3.4 案件コピー機能
既存案件をベースに新規案件を作成
案件名に「(コピー)」を自動付与
ステータスを「募集中」にリセット
2.3.5 案件削除機能
管理者のみ実行可能
削除前に確認ダイアログを表示
2.4 検索・フィルタリング機能
2.4.1 キーワード検索
案件名・概要での部分一致検索
2.4.2 詳細検索
フィルタ項目:
スキル（複数選択可）
単価範囲（最低・最高）
勤務地（複数選択可）
ステータス（複数選択可）
開始日範囲（開始日から・開始日まで）
2.4.3 フィルタクリア機能
全フィルタを一括でリセット
2.5 お気に入り機能
2.5.1 お気に入り登録・削除
案件カード・詳細画面からハートアイコンで操作
ユーザーごとに個別管理
2.5.2 お気に入り一覧表示
お気に入りに登録した案件の一覧表示
統計情報（お気に入り数、募集中案件数、平均単価）
2.6 閲覧履歴機能
2.6.1 履歴自動記録
案件詳細表示時に自動で履歴に追加
最新20件まで保存
同一案件の重複は最新の閲覧時刻で更新
2.6.2 履歴一覧表示
日付別グループ化（今日/昨日/その他の日付）
相対時間表示（○分前、○時間前）
統計情報（閲覧案件数、今日の閲覧数、最後の閲覧時刻）
2.7 Excel一括登録機能
2.7.1 テンプレートダウンロード
案件登録用Excelテンプレートの提供
サンプルデータ付き
2.7.2 ファイルアップロード
ドラッグ&ドロップ対応
Excel（.xlsx, .xls）、CSV（.csv）形式対応
2.7.3 データバリデーション
必須項目チェック: 案件名、概要、必須スキル、単価、勤務地、開始日
データ型チェック: 単価は数値、日付は正しい形式
論理チェック: 最高単価 > 最低単価
選択肢チェック: ステータスは指定値のみ
2.7.4 処理結果表示
成功件数とエラー件数の表示
エラー詳細（行番号とエラー内容）
有効なデータのみ一括登録
2.8 参考資料管理機能
2.8.1 資料登録
資料名、URL、種類（ドキュメント/画像/リンク/その他）を入力
案件ごとに複数の資料を登録可能
2.8.2 資料表示・削除
種類別アイコン表示
外部リンクでの資料表示
編集権限のあるユーザーのみ削除可能
3. 非機能要件
3.1 ユーザビリティ
レスポンシブデザイン: モバイル・タブレット・デスクトップ対応
直感的なUI: Appleスタイルの洗練されたデザイン
アクセシビリティ: 適切なコントラスト比とキーボード操作対応
3.2 パフォーマンス
初期表示: 3秒以内
検索結果表示: 1秒以内
ファイルアップロード: 10MB以下のファイルを30秒以内で処理
3.3 セキュリティ
認証: セッション管理による認証状態の維持
権限制御: ロールベースアクセス制御
データ保護: ローカルストレージでの個人データ管理
3.4 互換性
ブラウザ: Chrome、Firefox、Safari、Edge（最新版）
ファイル形式: Excel 2007以降、CSV（UTF-8）
4. データ仕様
4.1 ユーザーデータ

interface User {
  id: string;
  name: string;
  email: string;
  role: '
4.2 案件データ

interface Case {
  id: string;
  name
4.3 参考資料データ

interface Re
5. 画面遷移
5.1 メイン画面構成
ログイン画面
ダッシュボード（初期表示）
案件一覧
案件検索
お気に入り
閲覧履歴
案件登録（営業・管理者のみ）
5.2 モーダル画面
案件詳細表示
案件編集
Excel一括登録
6. 技術仕様
6.1 フロントエンド
フレームワーク: React 18 + TypeScript
スタイリング: Tailwind CSS
アイコン: Lucide React
状態管理: React Hooks
ファイル処理: xlsx、papaparse
6.2 データ管理
ローカルストレージ: ユーザー設定・お気に入り・履歴
モックデータ: 開発・デモ用サンプルデータ
6.3 開発環境
ビルドツール: Vite
パッケージマネージャー: npm
コード品質: ESLint + TypeScript
7. 運用要件
7.1 データバックアップ
ユーザーデータのローカルストレージ保存
ブラウザデータクリア時の注意喚起
7.2 メンテナンス
定期的なモックデータの更新
新機能追加時の段階的リリース
7.3 サポート
ユーザーマニュアルの提供
FAQ・トラブルシューティングガイド
8. 今後の拡張予定
8.1 機能拡張
通知機能: 案件更新・締切アラート
レポート機能: 案件統計・売上分析
API連携: 外部システムとのデータ連携
チャット機能: 案件に関するコミュニケーション
8.2 技術的改善
データベース連携: 永続化データストレージ
認証強化: SSO・多要素認証
パフォーマンス最適化: 仮想化・ページネーション
PWA対応: オフライン機能・プッシュ通知
文書バージョン: 1.0

作成日: 2024年1月

最終更新: 2024年1月

7.7M monthly tokens remaining.
Subscribe to Pro 50 for 2x more usage

Clear
Update




import { useState, useEffect } from 'react';
import { User, ViewHistoryItem } from '../types';
import { mockUsers } from '../data/mockData';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate authentication check
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Ensure favorites and viewHistory are always arrays
      setUser({
        ...parsedUser,
        favorites: parsedUser.favorites || [],
        viewHistory: parsedUser.viewHistory || []
      });
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    // Simulate login
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const canEdit = () => {
    return user?.role === 'admin' || user?.role === 'sales';
  };

  const canDelete = () => {
    return user?.role === 'admin';
  };

  const addToFavorites = (caseId: string) => {
    if (user && !user.favorites.includes(caseId)) {
      const updatedUser = {
        ...user,
        favorites: [...user.favorites, caseId]
      };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const removeFromFavorites = (caseId: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        favorites: user.favorites.filter(id => id !== caseId)
      };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const addToHistory = (caseId: string) => {
    if (user) {
      const viewHistory = user.viewHistory || [];
      const existingIndex = viewHistory.findIndex(item => item.caseId === caseId);
      let newHistory = [...viewHistory];
      
      if (existingIndex !== -1) {
        // Remove existing entry
        newHistory.splice(existingIndex, 1);
      }
      
      // Add to beginning
      newHistory.unshift({
        caseId,
        viewedAt: new Date().toISOString()
      });
      
      // Keep only last 20 items
      newHistory = newHistory.slice(0, 20);
      
      const updatedUser = {
        ...user,
        viewHistory: newHistory
      };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    canEdit,
    canDelete,
    addToFavorites,
    removeFromFavorites,
    addToHistory,
  };
};
/
