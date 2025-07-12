import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Case, ReferenceMaterial } from '../../types';
import { skillOptions, locationOptions } from '../../data/mockData';
import ReferenceMaterials from './ReferenceMaterials';

interface CaseFormProps {
  case?: Case;
  onSubmit: (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  iscopying?: boolean;
}

const CaseForm: React.FC<CaseFormProps> = ({ case: existingCase, onSubmit, onCancel, iscopying }) => {
  const [formData, setFormData] = useState({
    name: '',
    overview: '',
    requiredSkills: [] as string[],
    preferredSkills: [] as string[],
    rateMin: 0,
    rateMax: 0,
    workLocation: '',
    expectedStartDate: '',
    remoteWorkConditions: '',
    workHours: '',
    contractPeriod: '',
    notes: '',
    status: 'recruiting' as const,
    createdBy: '1',
    referenceMaterials: [] as ReferenceMaterial[],
    imageUrl: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingCase) {
      setFormData({
        name: existingCase.name,
        overview: existingCase.overview,
        requiredSkills: existingCase.requiredSkills,
        preferredSkills: existingCase.preferredSkills,
        rateMin: existingCase.rateMin,
        rateMax: existingCase.rateMax,
        workLocation: existingCase.workLocation,
        expectedStartDate: existingCase.expectedStartDate,
        remoteWorkConditions: existingCase.remoteWorkConditions,
        workHours: existingCase.workHours,
        contractPeriod: existingCase.contractPeriod,
        notes: existingCase.notes,
        status: existingCase.status,
        createdBy: existingCase.createdBy,
        referenceMaterials: existingCase.referenceMaterials || [],
        imageUrl: existingCase.imageUrl || '',
      });
    }
  }, [existingCase]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '案件名は必須です';
    }
    if (!formData.overview.trim()) {
      newErrors.overview = '案件概要は必須です';
    }
    if (formData.requiredSkills.length === 0) {
      newErrors.requiredSkills = '必須スキルを1つ以上選択してください';
    }
    if (formData.rateMin <= 0) {
      newErrors.rateMin = '最低単価を入力してください';
    }
    if (formData.rateMax <= 0) {
      newErrors.rateMax = '最高単価を入力してください';
    }
    if (formData.rateMin > formData.rateMax) {
      newErrors.rateMax = '最高単価は最低単価より大きくしてください';
    }
    if (!formData.workLocation.trim()) {
      newErrors.workLocation = '勤務地は必須です';
    }
    if (!formData.expectedStartDate) {
      newErrors.expectedStartDate = '稼働開始予定日は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleSkillAdd = (type: 'required' | 'preferred') => {
    if (skillInput.trim()) {
      const skills = type === 'required' ? formData.requiredSkills : formData.preferredSkills;
      if (!skills.includes(skillInput.trim())) {
        setFormData(prev => ({
          ...prev,
          [type === 'required' ? 'requiredSkills' : 'preferredSkills']: [...skills, skillInput.trim()]
        }));
      }
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skill: string, type: 'required' | 'preferred') => {
    const skills = type === 'required' ? formData.requiredSkills : formData.preferredSkills;
    setFormData(prev => ({
      ...prev,
      [type === 'required' ? 'requiredSkills' : 'preferredSkills']: skills.filter(s => s !== skill)
    }));
  };

  const handleSkillSelect = (skill: string, type: 'required' | 'preferred') => {
    const skills = type === 'required' ? formData.requiredSkills : formData.preferredSkills;
    if (!skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        [type === 'required' ? 'requiredSkills' : 'preferredSkills']: [...skills, skill]
      }));
    }
  };

  const handleAddMaterial = (material: Omit<ReferenceMaterial, 'id' | 'uploadedAt'>) => {
    const newMaterial: ReferenceMaterial = {
      ...material,
      id: `ref-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    setFormData(prev => ({
      ...prev,
      referenceMaterials: [...prev.referenceMaterials, newMaterial],
    }));
  };

  const handleRemoveMaterial = (materialId: string) => {
    setFormData(prev => ({
      ...prev,
      referenceMaterials: prev.referenceMaterials.filter(m => m.id !== materialId),
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {iscopying ? '案件コピー' : existingCase ? '案件編集' : '案件登録'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 案件名 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              案件名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例: 大手ECサイト リニューアルプロジェクト"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* 案件画像 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              案件画像URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {formData.imageUrl && (
              <div className="mt-3">
                <img
                  src={formData.imageUrl}
                  alt="案件画像プレビュー"
                  className="w-full max-w-md h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* 案件概要 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              案件概要 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.overview}
              onChange={(e) => setFormData(prev => ({ ...prev, overview: e.target.value }))}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.overview ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="プロジェクトの詳細な説明を入力してください"
            />
            {errors.overview && <p className="mt-1 text-sm text-red-600">{errors.overview}</p>}
          </div>

          {/* 必須スキル */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              必須スキル <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="スキルを入力または下から選択"
                />
                <button
                  type="button"
                  onClick={() => handleSkillAdd('required')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {skillOptions.slice(0, 15).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillSelect(skill, 'required')}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      formData.requiredSkills.includes(skill)
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillRemove(skill, 'required')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            {errors.requiredSkills && <p className="mt-1 text-sm text-red-600">{errors.requiredSkills}</p>}
          </div>

          {/* 歓迎スキル */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              歓迎スキル
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="スキルを入力または下から選択"
                />
                <button
                  type="button"
                  onClick={() => handleSkillAdd('preferred')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {skillOptions.slice(0, 15).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillSelect(skill, 'preferred')}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      formData.preferredSkills.includes(skill)
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.preferredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillRemove(skill, 'preferred')}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 単価 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最低単価 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.rateMin || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, rateMin: parseInt(e.target.value) || 0 }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.rateMin ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例: 600000"
            />
            {errors.rateMin && <p className="mt-1 text-sm text-red-600">{errors.rateMin}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最高単価 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.rateMax || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, rateMax: parseInt(e.target.value) || 0 }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.rateMax ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例: 800000"
            />
            {errors.rateMax && <p className="mt-1 text-sm text-red-600">{errors.rateMax}</p>}
          </div>

          {/* 勤務地 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              勤務地 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.workLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, workLocation: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.workLocation ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">選択してください</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            {errors.workLocation && <p className="mt-1 text-sm text-red-600">{errors.workLocation}</p>}
          </div>

          {/* 稼働開始予定日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              稼働開始予定日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.expectedStartDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expectedStartDate: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.expectedStartDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.expectedStartDate && <p className="mt-1 text-sm text-red-600">{errors.expectedStartDate}</p>}
          </div>

          {/* リモートワーク条件 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              リモートワーク条件
            </label>
            <input
              type="text"
              value={formData.remoteWorkConditions}
              onChange={(e) => setFormData(prev => ({ ...prev, remoteWorkConditions: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: フルリモート可、週3日リモート"
            />
          </div>

          {/* 勤務時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              勤務時間
            </label>
            <input
              type="text"
              value={formData.workHours}
              onChange={(e) => setFormData(prev => ({ ...prev, workHours: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 9:00-18:00"
            />
          </div>

          {/* 契約期間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              契約期間
            </label>
            <input
              type="text"
              value={formData.contractPeriod}
              onChange={(e) => setFormData(prev => ({ ...prev, contractPeriod: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 6ヶ月、12ヶ月"
            />
          </div>

          {/* ステータス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ステータス
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Case['status'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recruiting">募集中</option>
              <option value="proposing">提案中</option>
              <option value="contracted">成約済</option>
              <option value="ended">終了</option>
            </select>
          </div>

          {/* 備考 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              備考
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="追加の情報や特記事項があれば記入してください"
            />
          </div>

          {/* 参考資料 */}
          <div className="md:col-span-2">
            <ReferenceMaterials
              materials={formData.referenceMaterials}
              onAdd={handleAddMaterial}
              onRemove={handleRemoveMaterial}
              canEdit={true}
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {existingCase ? '更新' : '登録'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaseForm;