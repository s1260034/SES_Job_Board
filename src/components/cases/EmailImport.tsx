import React, { useState } from 'react';
import { X, Mail, Wand2, AlertCircle, CheckCircle, Zap, Brain, Clock, Loader } from 'lucide-react';
import { Case } from '../../types';
import { llmService } from '../../services/llmService';

interface EmailImportProps {
  onImport: (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

const EmailImport: React.FC<EmailImportProps> = ({ onImport, onClose }) => {
  const [emailContent, setEmailContent] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<string>('');
  const [analysisMethod, setAnalysisMethod] = useState<'llm' | 'regex' | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');

  // メール文面から案件情報を抽出する関数
  const parseEmailContent = (content: string): Omit<Case, 'id' | 'createdAt' | 'updatedAt'> => {
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
    commonSkills.forEach(skill => {
      if (content.includes(skill)) {
        if (!requiredSkills.includes(skill)) {
          requiredSkills.push(skill);
        }
      }
    });

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

    // デフォルト値を設定
    return {
      name: extractedData.name || '',
      overview: extractedData.overview || '',
      requiredSkills: requiredSkills.slice(0, 5),
      preferredSkills: [],
      rateMin: extractedData.rateMin || 0,
      rateMax: extractedData.rateMax || 0,
      workLocation: extractedData.workLocation || '',
      expectedStartDate: extractedData.expectedStartDate || '',
      remoteFrequency: '',
      workHours: '',
      period: '',
      notes: `メールから自動抽出された案件情報\n\n元のメール内容:\n${content}`,
      status: 'recruiting' as const,
      createdBy: '1',
      referenceMaterials: [],
      imageUrl: '',
    };
  };

  const handleLLMAnalysis = async () => {
    if (!emailContent.trim()) {
      setParseResult('メール内容を入力してください');
      return;
    }

    setParsing(true);
    setParseResult('');
    setConfidence(0);
    setProgress(0);
    setProgressMessage('LLM解析を開始しています...');

    try {
      // プログレス表示のシミュレーション
      setProgress(20);
      setProgressMessage('LLMモデルを初期化中...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(40);
      setProgressMessage('メール内容を解析中...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProgress(70);
      setProgressMessage('案件情報を抽出中...');
      const llmResult = await llmService.analyzeEmail(emailContent);
      
      setProgress(90);
      setProgressMessage('結果を整理中...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let extractedData;
      let resultMessage = '';
      
      if (llmResult.success && llmResult.extractedData) {
        extractedData = {
          ...llmResult.extractedData,
          status: 'recruiting' as const,
          createdBy: '1',
          referenceMaterials: [],
          imageUrl: '',
        };
        setConfidence(llmResult.confidence || 0);
        resultMessage = `✅ LLM解析完了！信頼度: ${Math.round((llmResult.confidence || 0) * 100)}%`;
      } else {
        // LLM解析失敗時は正規表現にフォールバック
        extractedData = parseEmailContent(emailContent);
        setConfidence(0.6);
        resultMessage = '⚠️ LLM解析失敗、正規表現解析で処理しました';
      }
      
      setProgress(100);
      setProgressMessage('完了！');
      setParseResult(resultMessage);
      onImport(extractedData);
    } catch (err) {
      setParseResult('❌ メール内容の解析に失敗しました');
      setConfidence(0);
      setProgress(0);
      setProgressMessage('');
    } finally {
      setParsing(false);
    }
  };

  const handleRuleBasedAnalysis = async () => {
    if (!emailContent.trim()) {
      setParseResult('メール内容を入力してください');
      return;
    }

    setParsing(true);
    setParseResult('');
    setConfidence(0);
    setProgress(0);
    setProgressMessage('ルールベース解析を開始しています...');

    try {
      // プログレス表示のシミュレーション
      setProgress(30);
      setProgressMessage('正規表現パターンを適用中...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProgress(70);
      setProgressMessage('案件情報を抽出中...');
      const extractedData = parseEmailContent(emailContent);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setProgress(100);
      setProgressMessage('完了！');
      setConfidence(0.6);
      setParseResult('✅ ルールベース解析が完了しました！');
      
      const finalData = {
        ...extractedData,
        status: 'recruiting' as const,
        createdBy: '1',
        referenceMaterials: [],
        imageUrl: '',
      };
      
      onImport(finalData);
    } catch (err) {
      setParseResult('❌ メール内容の解析に失敗しました');
      setConfidence(0);
      setProgress(0);
      setProgressMessage('');
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                'bg-gradient-to-br from-purple-500 to-blue-600'
              }`}>
                  <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  メール自動解析
                </h2>
                <p className="text-gray-600">
                  LLMまたはルールベースで案件情報を抽出
                </p>
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

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-900">
              メール内容を貼り付けてください
            </label>
            
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Outlookからコピーしたメール内容をここに貼り付けてください..."
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
            />
            
            {/* Progress Bar */}
            {parsing && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-sm font-medium text-gray-700">{progressMessage}</span>
                  <span className="text-sm text-gray-500 ml-auto">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>開始</span>
                  <Clock className="w-3 h-3" />
                  <span>完了</span>
                </div>
              </div>
            )}
            
            {/* Result Display */}
            {parseResult && (
              <div className={`flex items-center space-x-2 p-4 rounded-xl ${
                parseResult.includes('✅') ? 'text-green-600 bg-green-50' : 
                parseResult.includes('⚠️') ? 'text-orange-600 bg-orange-50' :
                'text-red-600 bg-red-50'
              }`}>
                {parseResult.includes('✅') ? <CheckCircle className="w-5 h-5" /> : 
                 parseResult.includes('⚠️') ? <AlertCircle className="w-5 h-5" /> :
                 <AlertCircle className="w-5 h-5" />}
                <span>{parseResult}</span>
                {confidence > 0 && (
                  <div className="ml-auto text-sm font-medium">信頼度: {Math.round(confidence * 100)}%</div>
                )}
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
                onClick={handleRuleBasedAnalysis}
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
            
            {/* Help Text */}
            <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">解析方法の選択について</p>
                  <p><strong>LLM解析</strong>: AI技術で高精度な抽出。複雑なメール形式にも対応しますが、処理に時間がかかります。</p>
                  <p><strong>ルールベース解析</strong>: 正規表現で高速処理。一般的なメール形式に対応し、すぐに結果が得られます。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailImport;