import React, { useState } from 'react';
import { Plus, X, FileText, Image, Link, Download, Upload } from 'lucide-react';
import { ReferenceMaterial } from '../../types';

interface ReferenceMaterialsProps {
  materials: ReferenceMaterial[];
  onAdd: (material: Omit<ReferenceMaterial, 'id' | 'uploadedAt'>) => void;
  onRemove: (materialId: string) => void;
  canEdit: boolean;
}

const ReferenceMaterials: React.FC<ReferenceMaterialsProps> = ({
  materials,
  onAdd,
  onRemove,
  canEdit,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    url: '',
    type: 'document' as ReferenceMaterial['type'],
  });

  const getTypeIcon = (type: ReferenceMaterial['type']) => {
    switch (type) {
      case 'document': return FileText;
      case 'image': return Image;
      case 'link': return Link;
      default: return FileText;
    }
  };

  const getTypeColor = (type: ReferenceMaterial['type']) => {
    switch (type) {
      case 'document': return 'bg-blue-100 text-blue-600';
      case 'image': return 'bg-green-100 text-green-600';
      case 'link': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeLabel = (type: ReferenceMaterial['type']) => {
    switch (type) {
      case 'document': return 'ドキュメント';
      case 'image': return '画像';
      case 'link': return 'リンク';
      default: return 'その他';
    }
  };

  const handleAdd = () => {
    if (newMaterial.name.trim() && newMaterial.url.trim()) {
      onAdd(newMaterial);
      setNewMaterial({ name: '', url: '', type: 'document' });
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewMaterial({ name: '', url: '', type: 'document' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">参考資料</h3>
        {canEdit && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>資料を追加</span>
          </button>
        )}
      </div>

      {/* Add New Material Form */}
      {isAdding && (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                資料名
              </label>
              <input
                type="text"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例: 要件定義書、設計資料など"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="url"
                value={newMaterial.url}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/document.pdf"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                種類
              </label>
              <select
                value={newMaterial.type}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, type: e.target.value as ReferenceMaterial['type'] }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="document">ドキュメント</option>
                <option value="image">画像</option>
                <option value="link">リンク</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleAdd}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                追加
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Materials List */}
      <div className="space-y-3">
        {materials.map((material) => {
          const Icon = getTypeIcon(material.type);
          return (
            <div
              key={material.id}
              className="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeColor(material.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{material.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{getTypeLabel(material.type)}</span>
                      <span>•</span>
                      <span>{new Date(material.uploadedAt).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="開く"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {canEdit && (
                    <button
                      onClick={() => onRemove(material.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="削除"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {materials.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500">
          <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>参考資料が登録されていません</p>
          {canEdit && (
            <p className="text-sm mt-1">「資料を追加」ボタンから資料を登録できます</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReferenceMaterials;