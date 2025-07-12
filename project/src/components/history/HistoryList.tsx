import React from 'react';
import { Clock, Eye, Calendar } from 'lucide-react';
import { Case, ViewHistoryItem } from '../../types';
import CaseCard from '../cases/CaseCard';

interface HistoryListProps {
  historyCases: { case: Case; viewedAt: string }[];
  onView: (caseId: string) => void;
  onEdit?: (caseId: string) => void;
  onDelete?: (caseId: string) => void;
  onCopy?: (caseId: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const HistoryList: React.FC<HistoryListProps> = ({
  historyCases,
  onView,
  onEdit,
  onDelete,
  onCopy,
  canEdit,
  canDelete,
}) => {
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const viewedDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - viewedDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'たった今';
    if (diffInMinutes < 60) return `${diffInMinutes}分前`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}時間前`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}日前`;
    
    return viewedDate.toLocaleDateString('ja-JP');
  };

  const groupByDate = (items: { case: Case; viewedAt: string }[]) => {
    const groups: { [key: string]: { case: Case; viewedAt: string }[] } = {};
    
    items.forEach(item => {
      const date = new Date(item.viewedAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = '今日';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = '昨日';
      } else {
        groupKey = date.toLocaleDateString('ja-JP');
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    
    return groups;
  };

  const groupedHistory = groupByDate(historyCases);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">閲覧履歴</h1>
            <p className="text-blue-100 text-lg">最近見た案件を確認</p>
          </div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-2xl font-bold">{historyCases.length}</p>
              <p className="text-blue-100 text-sm">閲覧した案件</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {historyCases.filter(item => {
                  const viewedDate = new Date(item.viewedAt);
                  const today = new Date();
                  return viewedDate.toDateString() === today.toDateString();
                }).length}
              </p>
              <p className="text-blue-100 text-sm">今日の閲覧</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {historyCases.length > 0 ? getTimeAgo(historyCases[0].viewedAt) : '-'}
              </p>
              <p className="text-blue-100 text-sm">最後の閲覧</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Groups */}
      {Object.keys(groupedHistory).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedHistory).map(([dateGroup, items]) => (
            <div key={dateGroup}>
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">{dateGroup}</h2>
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500">{items.length}件</span>
              </div>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.case.id}-${item.viewedAt}`} className="relative">
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-gray-600 border border-gray-200">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{getTimeAgo(item.viewedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="transform hover:scale-[1.02] transition-transform duration-200">
                      <CaseCard
                        case={item.case}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onCopy={onCopy}
                        canEdit={canEdit}
                        canDelete={canDelete}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            閲覧履歴がありません
          </h3>
          <p className="text-gray-600 mb-6">
            案件を閲覧すると、ここに履歴が表示されます
          </p>
          <div className="bg-gray-50 rounded-2xl p-6 max-w-md mx-auto">
            <h4 className="font-medium text-gray-900 mb-3">閲覧履歴について</h4>
            <div className="space-y-2 text-sm text-gray-600 text-left">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>案件を表示すると自動で記録</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>最新の20件まで保存</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>日付ごとにグループ化して表示</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryList;