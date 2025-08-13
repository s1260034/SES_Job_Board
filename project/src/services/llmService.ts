// LLMサービス - メール解析用
export interface LLMAnalysisResult {
  success: boolean;
  extractedData?: {
    companyName?: string;
    name?: string;
    overview?: string;
    requiredSkills?: string[];
    preferredSkills?: string[];
    rateMin?: number;
    rateMax?: number;
    workLocation?: string;
    remoteFrequency?: string;
    developmentEnvironment?: string[];
    period?: string;
    settlementConditions?: string;
    paymentTerms?: string;
    recruitmentCount?: number;
    contractType?: string;
    businessFlow?: string;
    foreignNationalAllowed?: boolean;
    interviewMethod?: string;
    expectedStartDate?: string;
    workHours?: string;
    notes?: string;
  };
  error?: string;
  confidence?: number;
}

// サーバー未実装のため、当面はLLM連携を無効化
export const isLLMEnabled = false;

class LLMService {
  private apiEndpoint: string;
  private model: string;

  constructor() {
    // 本番環境では環境変数から取得
    this.apiEndpoint = 'http://localhost:8080/v1/chat/completions';
    this.model = 'Phi-3-mini-4k-instruct-q4';
  }

  /**
   * メール内容をLLMで解析して案件情報を抽出
   */
  async analyzeEmail(emailContent: string): Promise<LLMAnalysisResult> {
    // LLMを無効化している間は即座にフォールバック解析を返す
    if (!isLLMEnabled) {
      return this.fallbackAnalysis(emailContent);
    }

    try {
      const prompt = this.createAnalysisPrompt(emailContent);
      
      // ローカルLLMサービス（llama.cpp server）への接続を試行
      const response = await this.callLLMAPI(prompt);
      
      if (response.success) {
        return this.parseAnalysisResult(response.data);
      } else {
        // LLMサービスが利用できない場合は従来の正規表現ベースの解析にフォールバック
        console.warn('LLM service unavailable, falling back to regex-based analysis');
        return this.fallbackAnalysis(emailContent);
      }
    } catch (error) {
      console.error('LLM analysis failed:', error);
      return this.fallbackAnalysis(emailContent);
    }
  }

  /**
   * LLM用のプロンプトを作成
   */
  private createAnalysisPrompt(emailContent: string): string {
    return `あなたはSES案件管理システムのメール解析AIです。以下のメール内容から案件情報を抽出し、JSON形式で回答してください。

抽出する項目：
- companyName: 企業名
- name: 案件名
- overview: 案件概要
- requiredSkills: 必須スキル（配列）
- preferredSkills: 歓迎スキル（配列）
- rateMin: 最低単価（数値、万円単位を円に変換）
- rateMax: 最高単価（数値、万円単位を円に変換）
- workLocation: 勤務地
- remoteFrequency: リモート頻度
- developmentEnvironment: 開発環境（配列）
- period: 期間
- settlementConditions: 精算条件
- paymentTerms: 支払いサイト
- recruitmentCount: 募集人数（数値）
- contractType: 契約形態
- businessFlow: 商流
- foreignNationalAllowed: 外国籍可否（boolean）
- interviewMethod: 面談方法
- expectedStartDate: 稼働開始予定日（YYYY-MM-DD形式）
- workHours: 勤務時間
- notes: 備考

メール内容：
${emailContent}

回答は以下のJSON形式でお願いします：
{
  "companyName": "企業名",
  "name": "案件名",
  "overview": "案件概要",
  "requiredSkills": ["スキル1", "スキル2"],
  "preferredSkills": ["スキル1", "スキル2"],
  "rateMin": 600000,
  "rateMax": 800000,
  "workLocation": "東京都港区",
  "remoteFrequency": "週3日リモート",
  "developmentEnvironment": ["React", "Node.js"],
  "period": "6ヶ月",
  "settlementConditions": "140-180時間",
  "paymentTerms": "月末締め翌月末払い",
  "recruitmentCount": 1,
  "contractType": "準委任契約",
  "businessFlow": "2次請け",
  "foreignNationalAllowed": false,
  "interviewMethod": "オンライン面談",
  "expectedStartDate": "2024-02-01",
  "workHours": "9:00-18:00",
  "notes": "その他の情報"
}

情報が不明な場合は null または空文字列を設定してください。`;
  }

  /**
   * LLM APIを呼び出し
   */
  private async callLLMAPI(prompt: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // OpenAI互換のAPIフォーマットでリクエスト
      const requestBody = {
        model: this.model,
        messages: [
          {
            role: "system",
            content: "あなたはSES案件管理システムのメール解析AIです。正確で構造化された情報抽出を行ってください。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.1,
        stop: ["<|end|>"]
      };

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('LLM API call failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * LLMの回答を解析してデータを抽出
   */
  private parseAnalysisResult(apiResponse: any): LLMAnalysisResult {
    try {
      const content = apiResponse.choices?.[0]?.message?.content || apiResponse.choices?.[0]?.text || '';
      
      // JSONの開始と終了を見つける
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON found in response');
      }

      const jsonStr = content.slice(jsonStart, jsonEnd);
      const extractedData = JSON.parse(jsonStr);

      // データの正規化
      const normalizedData = {
        ...extractedData,
        rateMin: this.normalizeRate(extractedData.rateMin),
        rateMax: this.normalizeRate(extractedData.rateMax),
        recruitmentCount: parseInt(extractedData.recruitmentCount) || 1,
        foreignNationalAllowed: Boolean(extractedData.foreignNationalAllowed),
        requiredSkills: Array.isArray(extractedData.requiredSkills) ? extractedData.requiredSkills : [],
        preferredSkills: Array.isArray(extractedData.preferredSkills) ? extractedData.preferredSkills : [],
        developmentEnvironment: Array.isArray(extractedData.developmentEnvironment) ? extractedData.developmentEnvironment : [],
      };

      return {
        success: true,
        extractedData: normalizedData,
        confidence: 0.9 // LLMベースの解析は高い信頼度
      };
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      return {
        success: false,
        error: 'Failed to parse LLM response'
      };
    }
  }

  /**
   * 単価の正規化（万円→円変換）
   */
  private normalizeRate(rate: any): number {
    if (typeof rate === 'number') {
      // 100未満の場合は万円単位と判断して変換
      return rate < 100 ? rate * 10000 : rate;
    }
    if (typeof rate === 'string') {
      const numRate = parseFloat(rate.replace(/[万円,]/g, ''));
      return numRate < 100 ? numRate * 10000 : numRate;
    }
    return 0;
  }

  /**
   * フォールバック解析（従来の正規表現ベース）
   */
  private fallbackAnalysis(emailContent: string): LLMAnalysisResult {
    const lines = emailContent.split('\n').map(line => line.trim()).filter(Boolean);
    const extractedData: any = {};

    // 案件名の抽出
    const subjectMatch = emailContent.match(/件名[：:]\s*(.+)/i) || emailContent.match(/Subject[：:]\s*(.+)/i);
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
      const match = emailContent.match(regex);
      if (match) {
        extractedData.overview = match[1].trim();
        break;
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
      if (emailContent.includes(skill) && !requiredSkills.includes(skill)) {
        requiredSkills.push(skill);
      }
    });
    extractedData.requiredSkills = requiredSkills.slice(0, 5);
    extractedData.preferredSkills = [];

    // 単価の抽出
    const ratePatterns = [
      /単価[：:]?\s*(\d+)万?[～〜-](\d+)万?/,
      /(\d+)万?[～〜-](\d+)万?円?\/月/,
      /月額[：:]?\s*(\d+)万?[～〜-](\d+)万?/,
      /(\d{2,3})万円?[～〜-](\d{2,3})万円?/
    ];

    for (const pattern of ratePatterns) {
      const match = emailContent.match(pattern);
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
      const match = emailContent.match(regex);
      if (match) {
        const location = match[1].trim();
        const matchedLocation = commonLocations.find(loc => 
          location.includes(loc) || loc.includes(location)
        );
        extractedData.workLocation = matchedLocation || location;
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
      const match = emailContent.match(pattern);
      if (match) {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        extractedData.expectedStartDate = `${year}-${month}-${day}`;
        break;
      }
    }

    return {
      success: true,
      extractedData,
      confidence: 0.6 // 正規表現ベースは中程度の信頼度
    };
  }
}

export const llmService = new LLMService();