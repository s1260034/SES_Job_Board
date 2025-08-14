import React, { useState } from 'react';
import { 
  Building, Filter, Search, MapPin, DollarSign, Calendar, 
  Users, Heart, Send, Eye, Star, TrendingUp, Target, Award 
} from 'lucide-react';
import { Case, Application } from '../../types';
import { skillOptions, locationOptions } from '../../data/mockData';

interface EngineerCaseListProps {
  cases: Case[];
  onView: (caseId: string) => void;
  onToggleFavorite: (caseId: string) => void;
  onApply: (caseId: string) => void;
  userFavorites: string[];
  userApplications: Application[];
}

const EngineerCaseList: React.FC<EngineerCaseListProps> = ({
  cases,
  onView,
  onToggleFavorite,
  onApply,
  userFavorites,
  userApplications,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [rateRange, setRateRange] = useState({ min: 0, max: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'rate' | 'match'>('newest');

  // フィルタリングとソート
  const filteredCases = cases.filter(caseItem => {
    // 募集中の案件のみ表示
    if (caseItem.status !== 'recruiting') return false;

    // キーワード検索
    if (searchTerm && !caseItem.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !caseItem.overview.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // スキルフィルタ
    if (selectedSkills.length > 0) {
      const hasSkill = selectedSkills.some(skill => 
        caseItem.requiredSkills.includes(skill) || caseItem.preferredSkills.includes(skill)
      );
      if (!hasSkill) return false;
    }

    // 勤務地フィルタ
    if (selectedLocations.length > 0 && !selectedLocations.includes(caseItem.workLocation)) {
      return false;
    }

    // 単価フィルタ
    if (rateRange.min > 0 && caseItem.rateMax < rateRange.min) return false;
    if (rateRange.max > 0 && caseItem.rateMin > rateRange.max) return false;

    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rate':
        return (b.rateMax || 0) - (a.rateMax || 0);
      case 'match':
        // スキルマッチ度でソート（簡易実装）
        const aMatches = selectedSkills.filter(skill => 
          a.requiredSkills.includes(skill) || a.preferredSkills.includes(skill)
        ).length;
        const bMatches = selectedSkills.filter(skill => 
          b.requiredSkills.includes(skill) || b.preferredSkills.includes(skill)
        ).length;
        return bMatches - aMatches;
      default:
        return 0;
    }
  });

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleLocationToggle = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSkills([]);
    setSelectedLocations([]);
    setRateRange({ min: 0, max: 0 });
  };

  const getApplicationStatus = (caseId: string) => {
    return userApplications.find(app => app.caseId === caseId);
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800';
      case 'interview_completed': return 'bg-indigo-100 text-indigo-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Application['status']) => {
    switch (status) {
      case 'pending': return '連絡済み';
      case 'reviewing': return '書類選考中';
      case 'interview_scheduled': return '面談予定';
      case 'interview_completed': return '面談完了';
      case 'accepted': return '採用決定';
      case 'rejected': return '不採用';
      case 'withdrawn': return '辞退';
      default: return status;
    }
  };

  const stats = {
    totalCases: filteredCases.length,
    appliedCases: userApplications.length,
    favoriteCases: userFavorites.length,
    averageRate: filteredCases.length > 0 
      ? Math.round(filteredCases.reduce((acc, c) => acc + (c.rateMin + c.rateMax) / 2, 0) / filteredCases.length)
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Building className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">エンジニア向け案件一覧</h1>
            <p className="text-emerald-100 text-lg">募集中の案件を効率的に探しましょう</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">募集中案件</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalCases}</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Send className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">応募済み</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.appliedCases}</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">お気に入り</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.favoriteCases}</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">平均単価</span>
            </div>
            <p className="text-2xl font-bold text-white">¥{stats.averageRate.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">案件を探す</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <Filter className="w-4 h-4" />
            <span>{showFilters ? '詳細フィルターを閉じる' : '詳細フィルター'}</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="案件名や技術で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">並び順:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'rate' | 'match')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="newest">新しい順</option>
              <option value="rate">単価高い順</option>
              <option value="match">スキルマッチ度</option>
            </select>
          </div>

          {showFilters && (
            <div className="space-y-6 pt-4 border-t border-gray-200">
              {/* Skills Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  スキルで絞り込み
                </label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.slice(0, 20).map((skill) => (
                    <button
                      key={skill}
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-2 text-sm rounded-xl border transition-all duration-200 ${
                        selectedSkills.includes(skill)
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  勤務地で絞り込み
                </label>
                <div className="flex flex-wrap gap-2">
                  {locationOptions.map((location) => (
                    <button
                      key={location}
                      onClick={() => handleLocationToggle(location)}
                      className={`px-3 py-2 text-sm rounded-xl border transition-all duration-200 ${
                        selectedLocations.includes(location)
                          ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最低希望単価
                  </label>
                  <input
                    type="number"
                    placeholder="例: 600000"
                    value={rateRange.min || ''}
                    onChange={(e) => setRateRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最高希望単価
                  </label>
                  <input
                    type="number"
                    placeholder="例: 1000000"
                    value={rateRange.max || ''}
                    onChange={(e) => setRateRange(prev => ({ ...prev, max: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  フィルターをクリア
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCases.map((caseItem) => {
          const application = getApplicationStatus(caseItem.id);
          const isFavorite = userFavorites.includes(caseItem.id);
          
          return (
            <div
              key={caseItem.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
            >
              {/* Case Image */}
              {caseItem.imageUrl && (
                <div className="mb-4 -mx-6 -mt-6">
                  <img
                    src={caseItem.imageUrl}
                    alt={caseItem.name}
                    className="w-full h-48 object-cover rounded-t-2xl"
                  />
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{caseItem.name}</h3>
                  <p className="text-sm text-gray-600 font-medium">{caseItem.companyName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {application && (
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                      {getStatusLabel(application.status)}
                    </span>
                  )}
                </div>
              </div>

              {/* Overview */}
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">{caseItem.overview}</p>

              {/* Key Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">単価</p>
                    <p className="font-semibold text-gray-900">
                      ¥{caseItem.rateMin.toLocaleString()} - ¥{caseItem.rateMax.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">勤務地</p>
                    <p className="font-semibold text-gray-900">{caseItem.workLocation}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">開始予定</p>
                    <p className="font-semibold text-gray-900">{caseItem.expectedStartDate}</p>
                  </div>
                </div>

                {caseItem.remoteFrequency && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">リモート</p>
                      <p className="font-semibold text-gray-900">{caseItem.remoteFrequency}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">必須スキル</p>
                <div className="flex flex-wrap gap-2">
                  {caseItem.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        selectedSkills.includes(skill)
                          ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                
                {caseItem.preferredSkills.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">歓迎スキル</p>
                    <div className="flex flex-wrap gap-2">
                      {caseItem.preferredSkills.map((skill, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            selectedSkills.includes(skill)
                              ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onView(caseItem.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>詳細を見る</span>
                  </button>
                  
                  <button
                    onClick={() => onToggleFavorite(caseItem.id)}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      isFavorite
                        ? 'text-pink-600 hover:text-pink-700 hover:bg-pink-50'
                        : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                    }`}
                    title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {!application ? (
                  <button
                    onClick={() => onApply(caseItem.id)}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 hover:scale-105"
                  >
                    <Send className="w-4 h-4" />
                    <span>営業に連絡</span>
                  </button>
                ) : (
                  <div className="text-right">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                      {getStatusLabel(application.status)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(application.appliedAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            条件に合う案件が見つかりません
          </h3>
          <p className="text-gray-600 mb-6">
            検索条件を変更して再度お試しください
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            フィルターをクリア
          </button>
        </div>
      )}
    </div>
  );
};

export default EngineerCaseList;