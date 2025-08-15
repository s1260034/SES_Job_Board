/**
 * SES案件管理システム - お気に入り案件一覧コンポーネント
 * 
 * 機能:
 * - エンジニアのお気に入り案件表示
 * - お気に入り統計情報（総数、募集中、平均単価）
 * - 案件操作（詳細表示、編集、削除、コピー）
 * - 空状態の説明表示
 * 
 * 統計情報:
 * - お気に入り案件総数
 * - 募集中の案件数
 * - 平均単価の計算表示
 * 
 * 表示形式:
 * - カード形式での案件一覧
 * - グラデーション背景のヘッダー
 * 
 * 権限:
 * - エンジニアのみアクセス可能
 * - 自分のお気に入りのみ表示
 * 
 * UI特徴:
 * - ピンク系カラーテーマ
 * - 統計情報の視覚的表示
 * - お気に入り機能の使い方説明
 */
import React from 'react';
import { Heart, Calendar, MapPin, DollarSign } from 'lucide-react';
import { Case } from '../../types';
import CaseCard from '../cases/CaseCard';

interface FavoritesListProps {
  favoriteCases: Case[];
  onView: (caseId: string) => void;
  onEdit?: (caseId: string) => void;
  onDelete?: (caseId: string) => void;
  onCopy?: (caseId: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const FavoritesList: React.FC<FavoritesListProps> = ({
  favoriteCases,
  onView,
  onEdit,
  onDelete,
  onCopy,
  canEdit,
  canDelete,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">お気に入り案件</h1>
            <p className="text-pink-100 text-lg">気になる案件をまとめて管理</p>
          </div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-2xl font-bold">{favoriteCases.length}</p>
              <p className="text-pink-100 text-sm">お気に入り案件</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {favoriteCases.filter(c => c.status === 'recruiting').length}
              </p>
              <p className="text-pink-100 text-sm">募集中</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                ¥{favoriteCases.length > 0 
                  ? Math.round(favoriteCases.reduce((acc, c) => acc + (c.rateMin + c.rateMax) / 2, 0) / favoriteCases.length).toLocaleString()
                  : 0}
              </p>
              <p className="text-pink-100 text-sm">平均単価</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      {favoriteCases.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {favoriteCases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              case={caseItem}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onCopy={onCopy}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            お気に入り案件がありません
          </h3>
          <p className="text-gray-600 mb-6">
            気になる案件を見つけたら、ハートアイコンをクリックしてお気に入りに追加しましょう
          </p>
          <div className="bg-gray-50 rounded-2xl p-6 max-w-md mx-auto">
            <h4 className="font-medium text-gray-900 mb-3">お気に入り機能の使い方</h4>
            <div className="space-y-2 text-sm text-gray-600 text-left">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span>案件カードのハートアイコンをクリック</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span>案件詳細画面からも追加可能</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span>いつでもこの画面で確認できます</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesList;