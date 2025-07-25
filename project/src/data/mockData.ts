import { Case, User } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: '田中 太郎',
    email: 'tanaka@ses-company.com',
    role: 'sales',
    department: '営業部',
    favorites: ['CASE-001', 'CASE-003'],
    viewHistory: [
      { caseId: 'CASE-001', viewedAt: '2024-01-28T10:30:00Z' },
      { caseId: 'CASE-002', viewedAt: '2024-01-28T09:15:00Z' },
      { caseId: 'CASE-003', viewedAt: '2024-01-27T16:45:00Z' },
    ],
  },
  {
    id: '2',
    name: '佐藤 花子',
    email: 'sato@ses-company.com',
    role: 'engineer',
    department: 'エンジニア部',
    favorites: ['CASE-002'],
    viewHistory: [
      { caseId: 'CASE-002', viewedAt: '2024-01-28T14:20:00Z' },
      { caseId: 'CASE-004', viewedAt: '2024-01-28T11:10:00Z' },
    ],
  },
  {
    id: '3',
    name: '鈴木 一郎',
    email: 'suzuki@ses-company.com',
    role: 'admin',
    department: 'システム管理部',
    favorites: ['CASE-001', 'CASE-002', 'CASE-004'],
    viewHistory: [
      { caseId: 'CASE-001', viewedAt: '2024-01-28T15:30:00Z' },
      { caseId: 'CASE-002', viewedAt: '2024-01-28T13:45:00Z' },
      { caseId: 'CASE-003', viewedAt: '2024-01-28T12:20:00Z' },
      { caseId: 'CASE-004', viewedAt: '2024-01-28T10:15:00Z' },
    ],
  },
];

export const mockCases: Case[] = [
  {
    id: 'CASE-001',
    name: '大手ECサイト リニューアルプロジェクト',
    overview: 'React/TypeScriptを使用したフロントエンド開発。レスポンシブデザイン対応必須。',
    requiredSkills: ['React', 'TypeScript', 'CSS3', 'HTML5'],
    preferredSkills: ['Next.js', 'Tailwind CSS', 'GraphQL'],
    rateMin: 650000,
    rateMax: 850000,
    workLocation: '東京都港区',
    expectedStartDate: '2024-02-01',
    remoteWorkConditions: 'フルリモート可',
    workHours: '9:00-18:00',
    contractPeriod: '6ヶ月',
    notes: 'チームは若手中心で活気があります。学習意欲の高い方を求めています。',
    status: 'recruiting',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: '1',
    referenceMaterials: [
      {
        id: 'ref-001',
        name: '要件定義書',
        url: 'https://example.com/requirements.pdf',
        type: 'document',
        uploadedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'ref-002',
        name: 'システム構成図',
        url: 'https://example.com/architecture.png',
        type: 'image',
        uploadedAt: '2024-01-15T11:00:00Z',
      },
    ],
    imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'CASE-002',
    name: '金融系システム バックエンド開発',
    overview: 'Java/Spring Bootを使用した基幹システム開発。高いセキュリティ要件あり。',
    requiredSkills: ['Java', 'Spring Boot', 'MySQL', 'Linux'],
    preferredSkills: ['Docker', 'AWS', 'JUnit'],
    rateMin: 700000,
    rateMax: 900000,
    workLocation: '東京都千代田区',
    expectedStartDate: '2024-02-15',
    remoteWorkConditions: '月2回出社',
    workHours: '9:00-17:30',
    contractPeriod: '12ヶ月',
    notes: '金融業界の経験があると優遇されます。',
    status: 'proposing',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-20T16:45:00Z',
    createdBy: '1',
    assignedTo: '2',
    referenceMaterials: [
      {
        id: 'ref-003',
        name: 'セキュリティガイドライン',
        url: 'https://example.com/security-guide.pdf',
        type: 'document',
        uploadedAt: '2024-01-10T14:30:00Z',
      },
    ],
    imageUrl: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'CASE-003',
    name: 'IoTプラットフォーム開発',
    overview: 'Node.js/Express.jsを使用したAPI開発。リアルタイム通信実装必須。',
    requiredSkills: ['Node.js', 'Express.js', 'MongoDB', 'Socket.io'],
    preferredSkills: ['React', 'Docker', 'Azure'],
    rateMin: 600000,
    rateMax: 750000,
    workLocation: '神奈川県横浜市',
    expectedStartDate: '2024-03-01',
    remoteWorkConditions: '週3日リモート',
    workHours: '10:00-19:00',
    contractPeriod: '9ヶ月',
    notes: 'IoTデバイスとの連携経験があると良いです。',
    status: 'contracted',
    createdAt: '2024-01-05T11:20:00Z',
    updatedAt: '2024-01-25T09:15:00Z',
    createdBy: '1',
    assignedTo: '2',
    imageUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'CASE-004',
    name: 'モバイルアプリ開発',
    overview: 'React Nativeを使用したクロスプラットフォーム開発。',
    requiredSkills: ['React Native', 'TypeScript', 'Redux'],
    preferredSkills: ['iOS', 'Android', 'Firebase'],
    rateMin: 550000,
    rateMax: 700000,
    workLocation: '大阪府大阪市',
    expectedStartDate: '2024-01-30',
    remoteWorkConditions: 'フルリモート可',
    workHours: '9:30-18:30',
    contractPeriod: '8ヶ月',
    notes: 'アプリストア公開経験があると優遇されます。',
    status: 'ended',
    createdAt: '2024-01-01T16:00:00Z',
    updatedAt: '2024-01-28T14:20:00Z',
    createdBy: '1',
    imageUrl: 'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export const skillOptions = [
  'React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript',
  'Node.js', 'Express.js', 'Next.js', 'Nuxt.js',
  'Java', 'Spring Boot', 'Spring Framework',
  'Python', 'Django', 'Flask', 'FastAPI',
  'C#', '.NET', 'ASP.NET',
  'PHP', 'Laravel', 'Symfony',
  'Ruby', 'Ruby on Rails',
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
  'AWS', 'Azure', 'GCP',
  'Docker', 'Kubernetes',
  'Git', 'GitHub', 'GitLab',
  'HTML5', 'CSS3', 'Sass', 'Tailwind CSS',
  'React Native', 'Flutter',
  'GraphQL', 'REST API',
  'Linux', 'Ubuntu', 'CentOS',
  'JUnit', 'Jest', 'Cypress',
];

export const locationOptions = [
  '東京都千代田区', '東京都中央区', '東京都港区', '東京都新宿区',
  '東京都渋谷区', '東京都品川区', '神奈川県横浜市', '神奈川県川崎市',
  '大阪府大阪市', '愛知県名古屋市', '福岡県福岡市',
];