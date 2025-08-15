/**
 * SES案件管理システム - 案件検索・フィルタリングコンポーネント
 * 
 * 機能:
 * - キーワード検索（案件名、概要）
 * - 詳細フィルタリング（展開・折りたたみ可能）
 * - スキルフィルター（複数選択可能）
 * - 単価範囲フィルター（最低・最高単価）
 * - 勤務地フィルター（複数選択可能）
 * - ステータスフィルター（募集中、提案中等）
 * - 開始日範囲フィルター
 * - フィルタークリア機能
 * 
 * UI特徴:
 * - 段階的な情報開示（詳細フィルターの展開）
 * - リアルタイム検索（入力と同時にフィルタリング）
 * - 選択状態の視覚的フィードバック
 */
import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { CaseFilters } from '../../types';
import { skillOptions, locationOptions } from '../../data/mockData';

interface SearchFiltersProps {
  onSearch: (filters: CaseFilters) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState<CaseFilters>({
    search: '',
    skills: [],
    rateMin: 0,
    rateMax: 0,
    locations: [],
    status: [],
    startDateFrom: '',
    startDateTo: '',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof CaseFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    handleFilterChange('skills', newSkills);
  };

  const handleLocationToggle = (location: string) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter(l => l !== location)
      : [...filters.locations, location];
    handleFilterChange('locations', newLocations);
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    handleFilterChange('status', newStatuses);
  };

  const clearFilters = () => {
    const clearedFilters: CaseFilters = {
      search: '',
      skills: [],
      rateMin: 0,
      rateMax: 0,
      locations: [],
      status: [],
      startDateFrom: '',
      startDateTo: '',
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">案件検索</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <Filter className="w-4 h-4" />
          <span>{isExpanded ? '詳細検索を閉じる' : '詳細検索'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            キーワード検索
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="案件名や概要で検索..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Skills Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                スキル
              </label>
              <div className="flex flex-wrap gap-2">
                {skillOptions.slice(0, 12).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filters.skills.includes(skill)
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Rate Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最低単価
                </label>
                <input
                  type="number"
                  placeholder="例: 500000"
                  value={filters.rateMin || ''}
                  onChange={(e) => handleFilterChange('rateMin', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最高単価
                </label>
                <input
                  type="number"
                  placeholder="例: 1000000"
                  value={filters.rateMax || ''}
                  onChange={(e) => handleFilterChange('rateMax', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                勤務地
              </label>
              <div className="flex flex-wrap gap-2">
                {locationOptions.slice(0, 8).map((location) => (
                  <button
                    key={location}
                    onClick={() => handleLocationToggle(location)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filters.locations.includes(location)
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'recruiting', label: '募集中' },
                  { value: 'proposing', label: '提案中' },
                  { value: 'contracted', label: '成約済' },
                  { value: 'ended', label: '終了' },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusToggle(status.value)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filters.status.includes(status.value)
                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始日（から）
                </label>
                <input
                  type="date"
                  value={filters.startDateFrom}
                  onChange={(e) => handleFilterChange('startDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始日（まで）
                </label>
                <input
                  type="date"
                  value={filters.startDateTo}
                  onChange={(e) => handleFilterChange('startDateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>フィルターをクリア</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;