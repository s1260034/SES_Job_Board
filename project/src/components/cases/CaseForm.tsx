import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Mail, Wand2, AlertCircle, CheckCircle, Upload, Brain, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Case, ReferenceMaterial } from '../../types';
import { skillOptions, locationOptions } from '../../data/mockData';
import ReferenceMaterials from './ReferenceMaterials';
import ExcelImport from './ExcelImport';
import EmailImport from './EmailImport';

interface CaseFormProps {
  case?: Case;
  onSubmit: (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onImport?: (cases: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  onCancel: () => void;
  iscopying?: boolean;
}

const CaseForm: React.FC<CaseFormProps> = ({ case: existingCase, onSubmit, onImport, onCancel, iscopying }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    overview: '',
    requiredSkills: [] as string[],
    preferredSkills: [] as string[],
    rateMin: 0,
    rateMax: 0,
    workLocation: '',
    remoteFrequency: '',
    developmentEnvironment: [] as string[],
    period: '',
    settlementConditions: '',
    paymentTerms: '',
    recruitmentCount: 1,
    contractType: '準委任契約',
    businessFlow: '',
    foreignNationalAllowed: false,
    interviewMethod: '',
    expectedStartDate: '',
    workHours: '',
    notes: '',
    emailSubject: '',
    receivedAt: new Date().toISOString(),
    status: 'recruiting' as const,
    createdBy: '1',
    referenceMaterials: [] as ReferenceMaterial[],
  });

  const [requiredSkillInput, setRequiredSkillInput] = useState('');
  const [preferredSkillInput, setPreferredSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showImport, setShowImport] = useState(false);
  const [showEmailImport, setShowEmailImport] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (existingCase) {
      setFormData({
        companyName: existingCase.companyName,
        name: existingCase.name,
        overview: existingCase.overview,
        requiredSkills: existingCase.requiredSkills,
        preferredSkills: existingCase.preferredSkills,
        rateMin: existingCase.rateMin,
        rateMax: existingCase.rateMax,
        workLocation: existingCase.workLocation,
        remoteFrequency: existingCase.remoteFrequency,
        developmentEnvironment: existingCase.developmentEnvironment,
        period: existingCase.period,
        settlementConditions: existingCase.settlementConditions,
        paymentTerms: existingCase.paymentTerms,
        recruitmentCount: existingCase.recruitmentCount,
        contractType: existingCase.contractType,
        businessFlow: existingCase.businessFlow,
        foreignNationalAllowed: existingCase.foreignNationalAllowed,
        interviewMethod: existingCase.interviewMethod,
        expectedStartDate: existingCase.expectedStartDate,
        workHours: existingCase.workHours,
        notes: existingCase.notes,
        emailSubject: existingCase.emailSubject,
        receivedAt: existingCase.receivedAt,
        status: existingCase.status,
        createdBy: existingCase.createdBy,
        referenceMaterials: existingCase.referenceMaterials || [],
      });
    }
  }, [existingCase]);

  // メール文面から案件情報を抽出する関数
  const parseEmailContent = (content: string): Partial<Omit<Case, 'id' | 'createdAt' | 'updatedAt'>> => {
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    const extractedData: Partial<Omit<Case, 'id' | 'createdAt' | 'updatedAt'>> = {};

    // 案件名の抽出
    const subjectMatch = content.match(/件名[：:]\s*(.+)/i) || content.match(/Subject[：:]\s*(.+)/i);
    if (subjectMatch) {
      extractedData.name = subjectMatch[1].trim();
    } else {
      const firstLine = lines[0];
      if (firstLine && !firstLine.includes('@') && firstLine.length < 100) {
        extractedData.name = firstLine;
      }
    }

    // 概要の抽出
    const overviewKeywords = ['概要', '内容', '詳細', '業務内容', 'プロジェクト概要'];
    for (const keyword of overviewKeywords) {
      const regex = new RegExp(`${keyword}[：:]\\s*([\\s\\S]*?)(?=\\n\\n|\\n[^\\s]|$)`, 'i');
      const match = content.match(regex);
      if (match) {
        extractedData.overview = match[1].trim();
        break;
      }
    }

    if (!extractedData.overview) {
      const paragraphs = content.split('\n\n').filter(p => p.trim().length > 20);
      if (paragraphs.length > 0) {
        extractedData.overview = paragraphs[0].trim();
      }
    }

    // スキルの抽出
    const commonSkills = [
      'React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'Node.js', 'Express.js',
      'Java', 'Spring', 'Python', 'Django', 'PHP', 'Laravel', 'C#', '.NET',
      'MySQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Azure', 'Docker', 'Kubernetes',
      'HTML', 'CSS', 'Git', 'Linux'
    ];

    const requiredSkills: string[] = [];
    const preferredSkills: string[] = [];

    commonSkills.forEach(skill => {
      if (content.includes(skill)) {
        if (!requiredSkills.includes(skill) && !preferredSkills.includes(skill)) {
          requiredSkills.push(skill);
        }
      }
    });

    extractedData.requiredSkills = requiredSkills.slice(0, 5);
    extractedData.preferredSkills = preferredSkills.slice(0, 3);

    // 単価の抽出
    const ratePatterns = [
      /単価[：:]?\s*(\d+)万?[～〜-](\d+)万?/,
      /(\d+)万?[～〜-](\d+)万?円?\/月/,
      /月額[：:]?\s*(\d+)万?[～〜-](\d+)万?/,
      /(\d{2,3})万円?[～〜-](\d{2,3})万円?/
    ];

    for (const pattern of ratePatterns) {
      const match = content.match(pattern);
      if (match) {
        const min = parseInt(match[1]);
        const max = parseInt(match[2]);
        if (min && max && min < max) {
          extractedData.rateMin = min * 10000;
          extractedData.rateMax = max * 10000;
          break;
        }
      }
    }

    // 勤務地の抽出
    const locationKeywords = ['勤務地', '場所', '所在地', '勤務場所'];
    const commonLocations = [
      '東京都千代田区', '東京都中央区', '東京都港区', '東京都新宿区',
      '東京都渋谷区', '東京都品川区', '神奈川県横浜市', '大阪府大阪市'
    ];

    for (const keyword of locationKeywords) {
      const regex = new RegExp(`${keyword}[：:]\\s*([^\\n]+)`, 'i');
      const match = content.match(regex);
      if (match) {
        const location = match[1].trim();
        const matchedLocation = commonLocations.find(loc => 
          location.includes(loc) || loc.includes(location)
        );
        if (matchedLocation) {
          extractedData.workLocation = matchedLocation;
        } else {
          extractedData.workLocation = location;
        }
        break;
      }
    }

    // 開始日の抽出
    const datePatterns = [
      /開始[日予定]*[：:]?\s*(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})/,
      /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})[日]?[から開始]/,
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/
    ];

    for (const pattern of datePatterns) {
      const match = content.match(pattern);
      if (match) {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        extractedData.expectedStartDate = `${year}-${month}-${day}`;
        break;
      }
    }

    // リモートワーク条件の抽出
    const remoteKeywords = ['リモート', 'テレワーク', '在宅', 'フルリモート', '出社'];
    for (const keyword of remoteKeywords) {
      const regex = new RegExp(`([^\\n]*${keyword}[^\\n]*)`, 'i');
      const match = content.match(regex);
      if (match) {
        extractedData.remoteWorkConditions = match[1].trim();
        break;
      }
    }

    // 勤務時間の抽出
    const timePattern = /(\d{1,2})[：:](\d{2})[～〜-](\d{1,2})[：:](\d{2})/;
    const timeMatch = content.match(timePattern);
    if (timeMatch) {
      extractedData.workHours = `${timeMatch[1]}:${timeMatch[2]}-${timeMatch[3]}:${timeMatch[4]}`;
    }

    // 契約期間の抽出
    const periodPatterns = [
      /期間[：:]?\s*(\d+)[ヶか]?月/,
      /(\d+)[ヶか]?月間/,
      /契約期間[：:]?\s*([^\\n]+)/
    ];

    for (const pattern of periodPatterns) {
      const match = content.match(pattern);
      if (match) {
        if (match[1].match(/^\d+$/)) {
          extractedData.contractPeriod = `${match[1]}ヶ月`;
        } else {
          extractedData.contractPeriod = match[1].trim();
        }
        break;
      }
    }

    return extractedData;
  };

  const handleLLMAnalysis = async () => {
    if (!emailContent.trim()) {
      setParseResult('メール内容を入力してください');
      return;
    }

    setParsing(true);
    setParseResult('');

    try {
      // LLMサービスを使用して解析
      const { llmService } = await import('../../services/llmService');
      const llmResult = await llmService.analyzeEmail(emailContent);
      
      let extractedData;
      let resultMessage = '';
      
      if (llmResult.success && llmResult.extractedData) {
        extractedData = llmResult.extractedData;
        resultMessage = `✅ LLM解析完了！信頼度: ${Math.round((llmResult.confidence || 0) * 100)}%`;
      } else {
        // LLM解析失敗時は正規表現にフォールバック
        extractedData = parseEmailContent(emailContent);
        resultMessage = '⚠️ LLM解析失敗、正規表現解析で処理しました';
      }
      
      // フォームデータを更新
      setFormData(prev => ({
        ...prev,
        companyName: extractedData.companyName || prev.companyName,
        name: extractedData.name || prev.name,
        overview: extractedData.overview || prev.overview,
        requiredSkills: extractedData.requiredSkills || prev.requiredSkills,
        preferredSkills: extractedData.preferredSkills || prev.preferredSkills,
        rateMin: extractedData.rateMin || prev.rateMin,
        rateMax: extractedData.rateMax || prev.rateMax,
        workLocation: extractedData.workLocation || prev.workLocation,
        expectedStartDate: extractedData.expectedStartDate || prev.expectedStartDate,
        remoteFrequency: extractedData.remoteFrequency || prev.remoteFrequency,
        workHours: extractedData.workHours || prev.workHours,
        period: extractedData.period || prev.period,
        settlementConditions: extractedData.settlementConditions || prev.settlementConditions,
        paymentTerms: extractedData.paymentTerms || prev.paymentTerms,
        recruitmentCount: extractedData.recruitmentCount || prev.recruitmentCount,
        contractType: extractedData.contractType || prev.contractType,
        businessFlow: extractedData.businessFlow || prev.businessFlow,
        foreignNationalAllowed: extractedData.foreignNationalAllowed !== undefined ? extractedData.foreignNationalAllowed : prev.foreignNationalAllowed,
        interviewMethod: extractedData.interviewMethod || prev.interviewMethod,
        notes: extractedData.notes || prev.notes,
      }));

      setParseResult(resultMessage);
    } catch (err) {
      setParseResult('❌ LLM解析に失敗しました');
    } finally {
      setParsing(false);
    }
  };

  const handleEmailParse = async () => {
    if (!emailContent.trim()) {
      setParseResult('メール内容を入力してください');
      return;
    }

    setParsing(true);
    setParseResult('');

    try {
      const extractedData = parseEmailContent(emailContent);
      
      // フォームデータを更新
      setFormData(prev => ({
        ...prev,
        name: extractedData.name || prev.name,
        overview: extractedData.overview || prev.overview,
        requiredSkills: extractedData.requiredSkills || prev.requiredSkills,
        preferredSkills: extractedData.preferredSkills || prev.preferredSkills,
        rateMin: extractedData.rateMin || prev.rateMin,
        rateMax: extractedData.rateMax || prev.rateMax,
        workLocation: extractedData.workLocation || prev.workLocation,
        expectedStartDate: extractedData.expectedStartDate || prev.expectedStartDate,
        remoteWorkConditions: extractedData.remoteWorkConditions || prev.remoteWorkConditions,
        workHours: extractedData.workHours || prev.workHours,
        contractPeriod: extractedData.contractPeriod || prev.contractPeriod,
      }));

      setParseResult('✅ メール解析が完了しました！左側のフォームに情報が自動入力されました。');
    } catch (err) {
      setParseResult('❌ メール内容の解析に失敗しました');
    } finally {
      setParsing(false);
    }
  };

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
    if (formData.rateMin > 0 && formData.rateMax > 0 && formData.rateMin > formData.rateMax) {
      newErrors.rateMax = '最高単価は最低単価より大きくしてください';
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
    const input = type === 'required' ? requiredSkillInput : preferredSkillInput;
    if (input.trim()) {
      const skills = type === 'required' ? formData.requiredSkills : formData.preferredSkills;
      if (!skills.includes(input.trim())) {
        setFormData(prev => ({
          ...prev,
          [type === 'required' ? 'requiredSkills' : 'preferredSkills']: [...skills, input.trim()]
        }));
      }
      if (type === 'required') {
        setRequiredSkillInput('');
      } else {
        setPreferredSkillInput('');
      }
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

  const handleEmailImport = (emailData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Fill the form with imported data
    setFormData(prev => ({
      ...prev,
      ...emailData
    }));
    setShowEmailImport(false);
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="flex h-screen">
        {/* Left Side - Case Form */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 h-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">案件登録フォーム</h2>
                <p className="text-blue-600 text-sm">メール解析やExcel一括登録で自動入力可能</p>
              </div>
              <div className="ml-auto flex items-center space-x-2">
                {onImport && (
                  <button
                    onClick={() => setShowImport(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Excel一括登録</span>
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 企業名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  企業名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例: テックソリューション株式会社"
                />
              </div>

              {/* 案件名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例: 大手ECサイト リニューアルプロジェクト"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* 案件概要 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件概要 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.overview}
                  onChange={(e) => setFormData(prev => ({ ...prev, overview: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.overview ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="プロジェクトの詳細な説明を入力してください"
                />
                {errors.overview && <p className="mt-1 text-sm text-red-600">{errors.overview}</p>}
              </div>

              {/* 必須スキル */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  必須スキル <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2 w-full">
                    <input
                      type="text"
                      value={requiredSkillInput}
                      onChange={(e) => setRequiredSkillInput(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="スキルを入力または下から選択"
                    />
                    <button
                      type="button"
                      onClick={() => handleSkillAdd('required')}
                      className="flex-shrink-0 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  歓迎スキル
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2 w-full">
                    <input
                      type="text"
                      value={preferredSkillInput}
                      onChange={(e) => setPreferredSkillInput(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="スキルを入力または下から選択"
                    />
                    <button
                      type="button"
                      onClick={() => handleSkillAdd('preferred')}
                      className="flex-shrink-0 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最低単価
                  </label>
                  <input
                    type="number"
                    value={formData.rateMin || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, rateMin: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 600000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最高単価
                  </label>
                  <input
                    type="number"
                    value={formData.rateMax || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, rateMax: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 800000"
                  />
                  {errors.rateMax && <p className="mt-1 text-sm text-red-600">{errors.rateMax}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    募集人数
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.recruitmentCount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, recruitmentCount: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
              </div>

              {/* 勤務地・開始日・期間 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    勤務地
                  </label>
                  <select
                    value={formData.workLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, workLocation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">未定</option>
                    {locationOptions.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    稼働開始予定日
                  </label>
                  <input
                    type="date"
                    value={formData.expectedStartDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedStartDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    期間
                  </label>
                  <input
                    type="text"
                    value={formData.period}
                    onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 6ヶ月、1年間"
                  />
                </div>
              </div>

              {/* リモート頻度・勤務時間 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    リモート頻度
                  </label>
                  <input
                    type="text"
                    value={formData.remoteFrequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, remoteFrequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: フルリモート可、週3日出社"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
              </div>

              {/* 契約形態・商流・ステータス */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    契約形態
                  </label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData(prev => ({ ...prev, contractType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="準委任契約">準委任契約</option>
                    <option value="請負契約">請負契約</option>
                    <option value="派遣契約">派遣契約</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    商流
                  </label>
                  <select
                    value={formData.businessFlow}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessFlow: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    <option value="1次請け">1次請け</option>
                    <option value="2次請け">2次請け</option>
                    <option value="3次請け">3次請け</option>
                    <option value="4次請け以下">4次請け以下</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
              </div>

              {/* 精算条件・支払いサイト */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    精算条件
                  </label>
                  <input
                    type="text"
                    value={formData.settlementConditions}
                    onChange={(e) => setFormData(prev => ({ ...prev, settlementConditions: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 140-180時間"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    支払いサイト
                  </label>
                  <input
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 月末締め翌月末払い"
                  />
                </div>
              </div>

              {/* 面談方法・外国籍可否 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    面談方法
                  </label>
                  <select
                    value={formData.interviewMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, interviewMethod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    <option value="オンライン面談">オンライン面談</option>
                    <option value="対面面談">対面面談</option>
                    <option value="オンライン・対面併用">オンライン・対面併用</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    外国籍可否
                  </label>
                  <select
                    value={formData.foreignNationalAllowed ? 'true' : 'false'}
                    onChange={(e) => setFormData(prev => ({ ...prev, foreignNationalAllowed: e.target.value === 'true' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="false">不可</option>
                    <option value="true">可</option>
                  </select>
                </div>
              </div>

              {/* 備考 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備考
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="その他の特記事項があれば記入してください"
                />
              </div>

              {/* メール情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メール件名
                  </label>
                  <input
                    type="text"
                    value={formData.emailSubject}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailSubject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="メールの件名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    受信日時
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.receivedAt ? new Date(formData.receivedAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, receivedAt: new Date(e.target.value).toISOString() }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 参考資料 */}
              <div>
                <ReferenceMaterials
                  materials={formData.referenceMaterials}
                  onAdd={handleAddMaterial}
                  onRemove={handleRemoveMaterial}
                  canEdit={true}
                />
              </div>

              {/* 登録ボタン */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold"
                >
                  {existingCase ? '更新' : '案件を登録'}
                </button>
              </div>
            </form>
          </div>

          {/* Import Modals */}
          {showImport && onImport && (
            <ExcelImport
              onImport={(importedCases) => {
                onImport(importedCases);
                setShowImport(false);
              }}
              onClose={() => setShowImport(false)}
            />
          )}

          {showEmailImport && (
            <EmailImport
              onImport={handleEmailImport}
              onClose={() => setShowEmailImport(false)}
            />
          )}
        </div>

        {/* Right Side - Email Analysis */}
        <div className="flex-1 overflow-y-auto border-l border-gray-200">
          <div className="p-4 h-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">メール自動解析</h2>
                <p className="text-green-600 text-sm">Outlookメールから案件情報を抽出</p>
              </div>
            </div>

            {/* Collapsible Instructions */}
            <div className="mb-4">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center justify-between w-full p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-base font-semibold text-gray-900">📧 メール解析の手順</span>
                </div>
                {showInstructions ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              
              {showInstructions && (
                <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <div>
                        <p className="font-medium">Outlookでメールをコピー</p>
                        <p className="text-gray-600">案件情報が含まれているメールを全選択（Ctrl+A）してコピー（Ctrl+C）</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <div>
                        <p className="font-medium">下のテキストエリアに貼り付け</p>
                        <p className="text-gray-600">Ctrl+Vで貼り付けて「LLM解析」または「ルールベース解析」をクリック</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <div>
                        <p className="font-medium">左側のフォームに自動入力</p>
                        <p className="text-gray-600">解析結果が左側のフォームに自動で入力されます</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Email Content Input */}
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-900">
                メール内容を貼り付けてください
              </label>
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Outlookからコピーしたメール内容をここに貼り付けてください...

例:
件名: 【急募】React開発エンジニア募集

案件概要:
大手ECサイトのフロントエンド開発を担当していただきます。
React/TypeScriptを使用した開発経験が必要です。

必須スキル:
- React (2年以上)
- TypeScript
- HTML/CSS

単価: 70万円〜90万円/月
勤務地: 東京都港区
開始日: 2024年4月1日
リモート: 週3日出社"
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
              />
              
              {parseResult && (
                <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                  parseResult.includes('✅') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                }`}>
                  {parseResult.includes('✅') ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span>{parseResult}</span>
                </div>
              )}
              
              {/* Analysis Method Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleLLMAnalysis}
                  disabled={parsing || !emailContent.trim()}
                  className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                >
                  <Brain className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">LLM解析</div>
                    <div className="text-xs opacity-90">高精度・時間かかる</div>
                  </div>
                </button>
                
                <button
                  onClick={handleEmailParse}
                  disabled={parsing || !emailContent.trim()}
                  className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                >
                  <Zap className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">ルールベース解析</div>
                    <div className="text-xs opacity-90">高速・標準精度</div>
                  </div>
                </button>
              </div>

              <div className="mt-3 p-2 bg-green-100 rounded-lg">
                <p className="text-xs text-green-800">
                  💡 解析後は左側のフォームで内容を確認・編集してから登録してください
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseForm;