import React, { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Case } from '../../types';

interface ExcelImportProps {
  onImport: (cases: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  onClose: () => void;
}

interface ImportResult {
  success: number;
  errors: { row: number; message: string }[];
  cases: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>[];
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onImport, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templateData = [
    {
      '案件名': '大手ECサイト リニューアルプロジェクト',
      '案件概要': 'React/TypeScriptを使用したフロントエンド開発。レスポンシブデザイン対応必須。',
      '必須スキル': 'React,TypeScript,CSS3,HTML5',
      '歓迎スキル': 'Next.js,Tailwind CSS,GraphQL',
      '最低単価': '650000',
      '最高単価': '850000',
      '勤務地': '東京都港区',
      '稼働開始予定日': '2024-02-01',
      'リモートワーク条件': 'フルリモート可',
      '勤務時間': '9:00-18:00',
      '契約期間': '6ヶ月',
      '備考': 'チームは若手中心で活気があります。学習意欲の高い方を求めています。',
      'ステータス': '募集中',
      '画像URL': 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '案件登録テンプレート');
    XLSX.writeFile(wb, 'SES案件登録テンプレート.xlsx');
  };

  const validateRow = (row: any, index: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!row['案件名']?.trim()) {
      errors.push('案件名は必須です');
    }
    if (!row['案件概要']?.trim()) {
      errors.push('案件概要は必須です');
    }
    if (!row['必須スキル']?.trim()) {
      errors.push('必須スキルは必須です');
    }
    if (!row['最低単価'] || isNaN(Number(row['最低単価']))) {
      errors.push('最低単価は数値で入力してください');
    }
    if (!row['最高単価'] || isNaN(Number(row['最高単価']))) {
      errors.push('最高単価は数値で入力してください');
    }
    if (Number(row['最低単価']) > Number(row['最高単価'])) {
      errors.push('最高単価は最低単価より大きくしてください');
    }
    if (!row['勤務地']?.trim()) {
      errors.push('勤務地は必須です');
    }
    if (!row['稼働開始予定日']) {
      errors.push('稼働開始予定日は必須です');
    }

    const validStatuses = ['募集中', '提案中', '成約済', '終了'];
    if (row['ステータス'] && !validStatuses.includes(row['ステータス'])) {
      errors.push('ステータスは「募集中」「提案中」「成約済」「終了」のいずれかを入力してください');
    }

    return { isValid: errors.length === 0, errors };
  };

  const convertRowToCase = (row: any): Omit<Case, 'id' | 'createdAt' | 'updatedAt'> => {
    const statusMap: Record<string, Case['status']> = {
      '募集中': 'recruiting',
      '提案中': 'proposing',
      '成約済': 'contracted',
      '終了': 'ended'
    };

    return {
      name: row['案件名']?.trim() || '',
      overview: row['案件概要']?.trim() || '',
      requiredSkills: row['必須スキル']?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
      preferredSkills: row['歓迎スキル']?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
      rateMin: Number(row['最低単価']) || 0,
      rateMax: Number(row['最高単価']) || 0,
      workLocation: row['勤務地']?.trim() || '',
      expectedStartDate: row['稼働開始予定日'] || '',
      remoteWorkConditions: row['リモートワーク条件']?.trim() || '',
      workHours: row['勤務時間']?.trim() || '',
      contractPeriod: row['契約期間']?.trim() || '',
      notes: row['備考']?.trim() || '',
      status: statusMap[row['ステータス']] || 'recruiting',
      createdBy: '1',
      referenceMaterials: [],
      imageUrl: row['画像URL']?.trim() || ''
    };
  };

  const processFile = async (file: File) => {
    setImporting(true);
    setResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const importResult: ImportResult = {
        success: 0,
        errors: [],
        cases: []
      };

      jsonData.forEach((row: any, index: number) => {
        const validation = validateRow(row, index + 2); // +2 because Excel rows start from 1 and we have header
        
        if (validation.isValid) {
          const caseData = convertRowToCase(row);
          importResult.cases.push(caseData);
          importResult.success++;
        } else {
          validation.errors.forEach(error => {
            importResult.errors.push({
              row: index + 2,
              message: error
            });
          });
        }
      });

      setResult(importResult);
    } catch (error) {
      setResult({
        success: 0,
        errors: [{ row: 0, message: 'ファイルの読み込みに失敗しました。正しいExcelファイルかご確認ください。' }],
        cases: []
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (result && result.cases.length > 0) {
      onImport(result.cases);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Excel一括登録</h2>
                <p className="text-gray-600">Excelファイルから案件を一括で登録できます</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Template Download */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  1. テンプレートをダウンロード
                </h3>
                <p className="text-gray-600">
                  まず、案件登録用のExcelテンプレートをダウンロードしてください
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>テンプレート</span>
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              2. 入力済みファイルをアップロード
            </h3>
            
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                ファイルをドラッグ&ドロップ
              </p>
              <p className="text-gray-600 mb-4">
                または
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                ファイルを選択
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-4">
                対応形式: Excel (.xlsx, .xls), CSV (.csv)
              </p>
            </div>
          </div>

          {/* Loading */}
          {importing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">ファイルを処理中...</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">処理結果</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-green-600">{result.success}</p>
                        <p className="text-sm text-gray-600">成功</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-red-200">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                      <div>
                        <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
                        <p className="text-sm text-gray-600">エラー</p>
                      </div>
                    </div>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <h4 className="font-medium text-red-900 mb-3">エラー詳細</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-700">
                          <span className="font-medium">行 {error.row}:</span> {error.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.success > 0 && (
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      onClick={onClose}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleImport}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                    >
                      {result.success}件の案件を登録
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelImport;