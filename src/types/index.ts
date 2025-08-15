/**
 * SES案件管理システム - TypeScript型定義
 * 
 * 定義している型:
 * - User: ユーザー情報（管理者、営業、エンジニア）
 * - Case: 案件情報（企業名、スキル、単価、ステータス等）
 * - Application: 応募情報（エンジニアから営業への連絡）
 * - ReferenceMaterial: 参考資料（ドキュメント、画像、リンク）
 * - CaseFilters: 案件検索・フィルタリング条件
 * - DashboardStats: ダッシュボード統計情報
 * - ViewHistoryItem: 閲覧履歴項目
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales' | 'engineer';
  department: string;
  favorites: string[];
  viewHistory: ViewHistoryItem[];
  applications: Application[];
  skills: string[];
  experience: number; // 経験年数
}

export interface ViewHistoryItem {
  caseId: string;
  viewedAt: string;
}

export interface Application {
  id: string;
  caseId: string;
  userId: string;
  appliedAt: string;
  status: 'pending' | 'reviewing' | 'interview_scheduled' | 'interview_completed' | 'accepted' | 'rejected' | 'withdrawn';
  message: string; // 応募メッセージ
  resumeUrl?: string; // 履歴書URL
  notes?: string; // 営業側のメモ
  interviewDate?: string;
  feedback?: string; // 面談フィードバック
}

export interface Case {
  id: string;
  companyName: string;
  name: string;
  overview: string;
  requiredSkills: string[];
  preferredSkills: string[];
  rateMin: number;
  rateMax: number;
  workLocation: string;
  remoteFrequency: string;
  developmentEnvironment: string[];
  period: string;
  settlementConditions: string;
  paymentTerms: string;
  recruitmentCount: number;
  contractType: string;
  businessFlow: string;
  foreignNationalAllowed: boolean;
  interviewMethod: string;
  expectedStartDate: string;
  workHours: string;
  notes: string;
  emailSubject: string;
  receivedAt: string;
  status: 'recruiting' | 'proposing' | 'contracted' | 'ended';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo?: string;
  referenceMaterials?: ReferenceMaterial[];
  applications?: Application[];
  imageUrl?: string;
}

export interface ReferenceMaterial {
  id: string;
  name: string;
  url: string;
  type: 'document' | 'image' | 'link' | 'other';
  uploadedAt: string;
}

export interface CaseFilters {
  search: string;
  skills: string[];
  rateMin: number;
  rateMax: number;
  locations: string[];
  status: string[];
  startDateFrom: string;
  startDateTo: string;
}

export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  contractedCases: number;
  averageRate: number;
  topSkills: { skill: string; count: number }[];
  casesByStatus: { status: string; count: number; color: string }[];
}