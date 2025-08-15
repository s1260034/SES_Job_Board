/**
 * SES案件管理システム - 案件一覧コンポーネント
 * 
 * 機能:
 * - 案件一覧の表示（カード形式・リスト形式切り替え）
 * - ソート機能（新しい順、単価順、名前順等）
 * - ステータスフィルタリング
 * - 案件操作（閲覧、編集、削除、コピー、お気に入り、応募）
 * - 新規案件登録ボタン（権限に応じて表示）
 * 
 * 表示形式:
 * - カード形式: 視覚的で情報が見やすい
 * - リスト形式: 多くの案件を一覧で確認
 * 
 * 権限制御:
 * - 編集・削除: 営業・管理者のみ
 * - 応募: エンジニアのみ
 * - お気に入り: エンジニアのみ
 */
import React, { useState } from 'react';
import { ArrowUpDown, Plus, Calendar, DollarSign, Eye, Grid3X3, List, MapPin, Users, Edit, Trash2, Copy, Heart, Send } from 'lucide-react';
import { Case } from '../../types';
import CaseCard from './CaseCard';

interface CaseListProps {
  cases: Case[];
  onView: (caseId: string) => void;
  onEdit?: (caseId: string) => void;
  onDelete?: (caseId: string) => void;
  onCopy?: (caseId: string) => void;
  onToggleFavorite?: (caseId: string) => void;
  onApply?: (caseId: string) => void;
  userFavorites?: string[];
  onCreate?: () => void;
  onImport?: (cases: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  canEdit: boolean;
  canDelete: boolean;
  canApply: boolean;
  userRole: string;
}

type SortOption = 'newest' | 'oldest' | 'rateHigh' | 'rateLow' | 'nameAsc' | 'nameDesc' | 'statusActive';
type DisplayFormat = 'card' | 'list';

const CaseList: React.FC<CaseListProps> = ({
  cases,
  onView,
  onEdit,
  onDelete,
  onCopy,
  onToggleFavorite,
  onApply,
  userFavorites = [],
  onCreate,
  onImport,
  canEdit,
  canDelete,
  canApply,
  userRole,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [statusFilter, setStatusFilter] = useState('all');
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>('card');

  const sortCases = (cases: Case[], sortOption: SortOption): Case[] => {
    const sorted = [...cases];
    
    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'rateHigh':
        return sorted.sort((a, b) => (b.rateMax || 0) - (a.rateMax || 0));
      case 'rateLow':
        return sorted.sort((a, b) => (a.rateMin || 0) - (b.rateMin || 0));
      case 'nameAsc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
      case 'nameDesc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name, 'ja'));
      case 'statusActive':
        return sorted.sort((a, b) => {
          const statusOrder = { recruiting: 0, proposing: 1, contracted: 2, ended: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        });
      default:
        return sorted;
    }
  };

  const filteredAndSortedCases = sortCases(
    cases.filter(caseItem => {
      const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
      return matchesStatus;
    }),
    sortBy
  );

  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case 'newest': return '新しい順';
      case 'oldest': return '古い順';
      case 'rateHigh': return '単価高い順';
      case 'rateLow': return '単価安い順';
      case 'nameAsc': return '案件名（あ→ん）';
      case 'nameDesc': return '案件名（ん→あ）';
      case 'statusActive': return 'ステータス順';
      default: return option;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recruiting': return 'bg-blue-100 text-blue-800';
      case 'proposing': return 'bg-orange-100 text-orange-800';
      case 'contracted': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'recruiting': return '募集中';
      case 'proposing': return '提案中';
      case 'contracted': return '成約済';
      case 'ended': return '終了';
      default: return status;
    }
  };

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                案件名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                単価
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                勤務地
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                スキル
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedCases.map((caseItem) => (
              <tr key={caseItem.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                         onClick={() => onView(caseItem.id)}>
                      {caseItem.name}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2 max-w-2xl">
                      {caseItem.overview}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {caseItem.rateMin > 0 && caseItem.rateMax > 0
                      ? `¥${caseItem.rateMin.toLocaleString()} - ¥${caseItem.rateMax.toLocaleString()}`
                      : '単価未定'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {caseItem.workLocation || '勤務地未定'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {caseItem.requiredSkills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {caseItem.requiredSkills.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{caseItem.requiredSkills.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                    {getStatusLabel(caseItem.status)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium sticky right-0 bg-white z-10 border-l border-gray-200">
                  <div className="flex flex-col items-center space-y-1">
                    <button
                      onClick={() => onView(caseItem.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-8 h-8 flex items-center justify-center"
                      title="詳細を見る"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {onToggleFavorite && (
                      userRole === 'engineer' && (
                      <button
                        onClick={() => onToggleFavorite(caseItem.id)}
                        className={`p-2 rounded-lg transition-colors w-8 h-8 flex items-center justify-center ${
                          userFavorites.includes(caseItem.id)
                            ? 'text-pink-600 hover:text-pink-700 hover:bg-pink-50'
                            : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                        }`}
                        title={userFavorites.includes(caseItem.id) ? 'お気に入りから削除' : 'お気に入りに追加'}
                      >
                        <Heart className={`w-4 h-4 ${userFavorites.includes(caseItem.id) ? 'fill-current' : ''}`} />
                      </button>
                      )
                    )}
                    {canApply && onApply && caseItem.status === 'recruiting' && (
                      <button
                        onClick={() => onApply(caseItem.id)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors w-8 h-8 flex items-center justify-center"
                        title="営業担当者に連絡"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    {canEdit && onCopy && (
                      <button
                        onClick={() => onCopy(caseItem.id)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors w-8 h-8 flex items-center justify-center"
                        title="コピー"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                    {canEdit && onEdit && (
                      <button
                        onClick={() => onEdit(caseItem.id)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors w-8 h-8 flex items-center justify-center"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && onDelete && (
                      <button
                        onClick={() => onDelete(caseItem.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors w-8 h-8 flex items-center justify-center"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">表示形式:</span>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDisplayFormat('card')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                  displayFormat === 'card'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>カード</span>
              </button>
              <button
                onClick={() => setDisplayFormat('list')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                  displayFormat === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="w-4 h-4" />
                <span>リスト</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">並び順:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[160px]"
          >
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
            <option value="rateHigh">単価高い順</option>
            <option value="rateLow">単価安い順</option>
            <option value="nameAsc">案件名（あ→ん）</option>
            <option value="nameDesc">案件名（ん→あ）</option>
            <option value="statusActive">ステータス順</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべての状態</option>
            <option value="recruiting">募集中</option>
            <option value="proposing">提案中</option>
            <option value="contracted">成約済</option>
            <option value="ended">終了</option>
          </select>
          
          {canEdit && onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>新規案件登録</span>
            </button>
          )}
        </div>
      </div>

      {displayFormat === 'card' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedCases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              case={caseItem}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onCopy={onCopy}
              onToggleFavorite={onToggleFavorite}
              onApply={onApply}
              isFavorite={userFavorites.includes(caseItem.id)}
              canEdit={canEdit}
              canDelete={canDelete}
              canApply={canApply}
              userRole={userRole}
            />
          ))}
        </div>
      ) : (
        renderListView()
      )}

      {filteredAndSortedCases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">該当する案件が見つかりません。</p>
        </div>
      )}

    </div>
  );
};

export default CaseList;