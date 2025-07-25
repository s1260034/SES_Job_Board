import React from 'react';
import { Calendar, MapPin, DollarSign, Users, Edit, Trash2, Eye, Copy, Heart } from 'lucide-react';
import { Case } from '../../types';

interface CaseCardProps {
  case: Case;
  onView: (caseId: string) => void;
  onEdit?: (caseId: string) => void;
  onDelete?: (caseId: string) => void;
  onCopy?: (caseId: string) => void;
  onToggleFavorite?: (caseId: string) => void;
  isFavorite?: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const CaseCard: React.FC<CaseCardProps> = ({
  case: caseItem,
  onView,
  onEdit,
  onDelete,
  onCopy,
  onToggleFavorite,
  isFavorite = false,
  canEdit,
  canDelete,
}) => {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Case Image */}
      {caseItem.imageUrl && (
        <div className="mb-4 -mx-6 -mt-6">
          <img
            src={caseItem.imageUrl}
            alt={caseItem.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{caseItem.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{caseItem.overview}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
          {getStatusLabel(caseItem.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>¥{caseItem.rateMin.toLocaleString()} - ¥{caseItem.rateMax.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{caseItem.workLocation}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>開始予定: {caseItem.expectedStartDate}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
          <Users className="w-4 h-4" />
          <span>必須スキル:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {caseItem.requiredSkills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
          {caseItem.requiredSkills.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{caseItem.requiredSkills.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          更新日: {new Date(caseItem.updatedAt).toLocaleDateString('ja-JP')}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(caseItem.id)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(caseItem.id)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite
                  ? 'text-pink-600 hover:text-pink-700 hover:bg-pink-50'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
              title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
          {canEdit && onCopy && (
            <button
              onClick={() => onCopy(caseItem.id)}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:scale-105"
              title="案件をコピー"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(caseItem.id)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(caseItem.id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseCard;