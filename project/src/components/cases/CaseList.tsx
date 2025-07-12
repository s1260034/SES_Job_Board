import React, { useState } from 'react';
import { Search, Filter, Plus, Upload } from 'lucide-react';
import { Case } from '../../types';
import CaseCard from './CaseCard';
import ExcelImport from './ExcelImport';

interface CaseListProps {
  cases: Case[];
  onView: (caseId: string) => void;
  onEdit?: (caseId: string) => void;
  onDelete?: (caseId: string) => void;
  onCopy?: (caseId: string) => void;
  onToggleFavorite?: (caseId: string) => void;
  userFavorites?: string[];
  onCreate?: () => void;
  onImport?: (cases: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const CaseList: React.FC<CaseListProps> = ({
  cases,
  onView,
  onEdit,
  onDelete,
  onCopy,
  onToggleFavorite,
  userFavorites = [],
  onCreate,
  onImport,
  canEdit,
  canDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showImport, setShowImport] = useState(false);

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.overview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="案件名や概要で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
            <div className="flex items-center space-x-3">
              {onImport && (
                <button
                  onClick={() => setShowImport(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 hover:scale-105"
                >
                  <Upload className="w-4 h-4" />
                  <span>Excel一括登録</span>
                </button>
              )}
              <button
                onClick={onCreate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>新規案件</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCases.map((caseItem) => (
          <CaseCard
            key={caseItem.id}
            case={caseItem}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onCopy={onCopy}
            onToggleFavorite={onToggleFavorite}
            isFavorite={userFavorites.includes(caseItem.id)}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">該当する案件が見つかりません。</p>
        </div>
      )}

      {showImport && onImport && (
        <ExcelImport
          onImport={(importedCases) => {
            onImport(importedCases);
            setShowImport(false);
          }}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
};

export default CaseList;