export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales' | 'engineer';
  department: string;
  favorites: string[];
  viewHistory: ViewHistoryItem[];
}

export interface ViewHistoryItem {
  caseId: string;
  viewedAt: string;
}

export interface Case {
  id: string;
  name: string;
  overview: string;
  requiredSkills: string[];
  preferredSkills: string[];
  rateMin: number;
  rateMax: number;
  workLocation: string;
  expectedStartDate: string;
  remoteWorkConditions: string;
  workHours: string;
  contractPeriod: string;
  notes: string;
  status: 'recruiting' | 'proposing' | 'contracted' | 'ended';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo?: string;
  referenceMaterials?: ReferenceMaterial[];
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