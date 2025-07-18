import React from 'react';
import { 
  X, Calendar, MapPin, DollarSign, Users, Clock, 
  Building, FileText, Edit, Trash2, Copy, Heart
} from 'lucide-react';
import { Case, ReferenceMaterial } from '../../types';
import ReferenceMaterials from './ReferenceMaterials';

interface CaseDetailProps {
  case: Case;
  onClose: () => void;
  onEdit?: (caseId: string) => void;
  onDelete?: (caseId: string) => void;
  onCopy?: (caseId: string) => void;
  onToggleFavorite?: (caseId: string) => void;
  isFavorite?: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const CaseDetail: React.FC<CaseDetailProps> = ({
  case: caseItem,
  onClose,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">{caseItem.name}</h2>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                {getStatusLabel(caseItem.status)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(caseItem.id)}
                  className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                    isFavorite
                      ? 'text-pink-600 hover:text-pink-800 hover:bg-pink-50'
                      : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                  }`}
                  title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}
              {canEdit && onCopy && (
                <button
                  onClick={() => onCopy(caseItem.id)}
                  className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:scale-105"
                  title="案件をコピー"
                >
                  <Copy className="w-5 h-5" />
                </button>
              )}
              {canEdit && onEdit && (
                <button
                  onClick={() => onEdit(caseItem.id)}
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              {canDelete && onDelete && (
                <button
                  onClick={() => onDelete(caseItem.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Case Image */}
          {caseItem.imageUrl && (
            <div className="mb-6">
              <img
                src={caseItem.imageUrl}
                alt={caseItem.name}
                className="w-full h-64 object-cover rounded-2xl shadow-lg"
              />
            </div>
          )}
          
          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">単価</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ¥{caseItem.rateMin.toLocaleString()} - ¥{caseItem.rateMax.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">勤務地</p>
                  <p className="text-lg font-semibold text-gray-900">{caseItem.workLocation}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">稼働開始予定日</p>
                  <p className="text-lg font-semibold text-gray-900">{caseItem.expectedStartDate}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {caseItem.workHours && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">勤務時間</p>
                    <p className="text-lg font-semibold text-gray-900">{caseItem.workHours}</p>
                  </div>
                </div>
              )}

              {caseItem.contractPeriod && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">契約期間</p>
                    <p className="text-lg font-semibold text-gray-900">{caseItem.contractPeriod}</p>
                  </div>
                </div>
              )}

              {caseItem.remoteWorkConditions && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">リモートワーク</p>
                    <p className="text-lg font-semibold text-gray-900">{caseItem.remoteWorkConditions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 案件概要 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">案件概要</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{caseItem.overview}</p>
            </div>
          </div>

          {/* 必須スキル */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">必須スキル</h3>
            <div className="flex flex-wrap gap-2">
              {caseItem.requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* 歓迎スキル */}
          {caseItem.preferredSkills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">歓迎スキル</h3>
              <div className="flex flex-wrap gap-2">
                {caseItem.preferredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 備考 */}
          {caseItem.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">備考</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{caseItem.notes}</p>
              </div>
            </div>
          )}

          {/* 参考資料 */}
          <div>
            <ReferenceMaterials
              materials={caseItem.referenceMaterials || []}
              onAdd={(material) => {
                // This would be handled by the parent component
                console.log('Add material:', material);
              }}
              onRemove={(materialId) => {
                // This would be handled by the parent component
                console.log('Remove material:', materialId);
              }}
              canEdit={canEdit}
            />
          </div>

          {/* メタデータ */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
              <div>
                <p className="font-medium">案件ID</p>
                <p>{caseItem.id}</p>
              </div>
              <div>
                <p className="font-medium">作成日</p>
                <p>{new Date(caseItem.createdAt).toLocaleDateString('ja-JP')}</p>
              </div>
              <div>
                <p className="font-medium">更新日</p>
                <p>{new Date(caseItem.updatedAt).toLocaleDateString('ja-JP')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;