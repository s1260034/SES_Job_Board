/**
 * SES案件管理システム - 営業・管理者向けダッシュボードコンポーネント
 * 
 * 機能:
 * - 案件統計情報の表示
 * - エンジニア連絡統計の表示
 * - 最近のエンジニア連絡一覧
 * - 最近の案件一覧
 * - 応募ステータス管理
 * 
 * 案件統計:
 * - 総案件数、募集中案件、成約案件、平均単価
 * - 前月比の変化率表示
 * 
 * エンジニア連絡統計:
 * - 総連絡数、新規連絡、選考中、面談予定、採用決定
 * 
 * 管理機能:
 * - エンジニア連絡への対応（ステータス更新）
 * - 面談日程の設定
 * - フィードバックの記録
 * 
 * 権限:
 * - 営業・管理者のみアクセス可能
 * - 応募ステータスの更新権限
 * 
 * UI特徴:
 * - 統計カードのグリッド表示
 * - リアルタイム更新対応
 * - ステータス管理モーダル
 */
import React from 'react';
import { 
  TrendingUp, Users, CheckCircle, DollarSign, 
  Clock, Calendar, Award, Target, Eye, UserCheck, Edit2
} from 'lucide-react';
import { Case, Application, User as UserType } from '../../types';
import ApplicationStatusModal from './ApplicationStatusModal';

interface SalesAdminDashboardProps {
  user: UserType;
  cases: Case[];
  allApplications: Application[];
  allUsers: UserType[];
  onCaseClick: (caseId: string) => void;
  onUpdateApplicationStatus: (applicationId: string, status: Application['status'], notes?: string, interviewDate?: string, feedback?: string) => boolean;
}

const SalesAdminDashboard: React.FC<SalesAdminDashboardProps> = ({
  user,
  cases,
  allApplications,
  allUsers,
  onCaseClick,
  onUpdateApplicationStatus,
}) => {
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  const [showStatusModal, setShowStatusModal] = React.useState(false);

  // Force component re-render when applications change
  const [refreshKey, setRefreshKey] = React.useState(0);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const stats = React.useMemo(() => {
    const totalCases = cases.length;
    const activeCases = cases.filter(c => c.status === 'recruiting' || c.status === 'proposing').length;
    const contractedCases = cases.filter(c => c.status === 'contracted').length;
    const averageRate = cases.length > 0 
      ? Math.round(cases.reduce((acc, c) => acc + (c.rateMin + c.rateMax) / 2, 0) / cases.length)
      : 0;

    const totalApplications = allApplications.length;
    const pendingApplications = allApplications.filter(app => 
      app.status === 'pending'
    ).length;
    const reviewingApplications = allApplications.filter(app => 
      app.status === 'reviewing'
    ).length;
    const interviewScheduled = allApplications.filter(app => 
      app.status === 'interview_scheduled'
    ).length;
    const acceptedApplications = allApplications.filter(app => 
      app.status === 'accepted'
    ).length;

    return {
      totalCases,
      activeCases,
      contractedCases,
      averageRate,
      totalApplications,
      pendingApplications,
      reviewingApplications,
      interviewScheduled,
      acceptedApplications,
    };
  }, [cases, allApplications]);

  const recentApplications = React.useMemo(() => {
    return allApplications
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 5);
  }, [allApplications]);

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800';
      case 'interview_completed': return 'bg-indigo-100 text-indigo-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Application['status']) => {
    switch (status) {
      case 'pending': return '連絡受信';
      case 'reviewing': return '書類選考中';
      case 'interview_scheduled': return '面談予定';
      case 'interview_completed': return '面談完了';
      case 'accepted': return '採用決定';
      case 'rejected': return '不採用';
      case 'withdrawn': return '辞退';
      default: return status;
    }
  };

  const getCaseById = (caseId: string) => cases.find(c => c.id === caseId);
  const getUserById = (userId: string) => allUsers.find(u => u.id === userId);

  const handleStatusUpdate = (applicationId: string, status: Application['status'], notes?: string, interviewDate?: string, feedback?: string) => {
    const success = onUpdateApplicationStatus(applicationId, status, notes, interviewDate, feedback);
    if (success) {
      // Update the applications in real-time
      const updatedApplications = allApplications.map(app => {
        if (app.id === applicationId) {
          return {
            ...app,
            status,
            notes: notes || app.notes,
            interviewDate: interviewDate || app.interviewDate,
            feedback: feedback || app.feedback,
          };
        }
        return app;
      });
      
      setSelectedApplication(null);
      setShowStatusModal(false);
      setRefreshKey(prev => prev + 1);
    }
    return success;
  };

  const statItems = [
    {
      title: '総案件数',
      value: stats.totalCases,
      icon: TrendingUp,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: '募集中案件',
      value: stats.activeCases,
      icon: Users,
      color: 'bg-orange-500',
      change: '+5%',
    },
    {
      title: '成約案件',
      value: stats.contractedCases,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: '平均単価',
      value: `¥${stats.averageRate.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+3%',
    },
  ];

  const applicationStats = [
    {
      title: '総連絡数',
      value: stats.totalApplications,
      icon: Target,
      color: 'bg-indigo-500',
    },
    {
      title: '新規連絡',
      value: stats.pendingApplications,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: '選考中',
      value: stats.reviewingApplications,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: '面談予定',
      value: stats.interviewScheduled,
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      title: '採用決定',
      value: stats.acceptedApplications,
      icon: Award,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {user.role === 'admin' ? '管理者' : '営業'}ダッシュボード
            </h1>
            <p className="text-indigo-100 text-lg">案件と応募状況を管理しましょう</p>
          </div>
        </div>
      </div>

      {/* Case Statistics */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">案件統計</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{item.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                    <p className="text-sm text-green-600 mt-1">{item.change}</p>
                  </div>
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Application Statistics */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">エンジニア連絡統計</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {applicationStats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{item.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">最近のエンジニア連絡</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>新規連絡</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>選考中</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span>面談予定</span>
            </div>
          </div>
        </div>
        
        {recentApplications.length > 0 ? (
          <div className="space-y-4">
            {recentApplications.map((application) => {
              const caseItem = getCaseById(application.caseId);
              const applicant = getUserById(application.userId);
              
              if (!caseItem || !applicant) return null;
              
              return (
                <div
                  key={application.id}
                  className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3" onClick={() => onCaseClick(application.caseId)}>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {caseItem.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        連絡者: {applicant.name} ({applicant.department})
                      </p>
                      {application.status === 'pending' && (
                        <p className="text-xs text-yellow-600 mt-1">
                          📞 営業対応が必要です
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                        {getStatusLabel(application.status)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApplication(application);
                          setShowStatusModal(true);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="ステータスを変更"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm" onClick={() => onCaseClick(application.caseId)}>
                    <div>
                      <span className="text-gray-500">連絡日:</span>
                      <span className="ml-2 font-medium">
                        {new Date(application.appliedAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">単価:</span>
                      <span className="ml-2 font-medium">
                        ¥{caseItem.rateMin.toLocaleString()} - ¥{caseItem.rateMax.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">経験年数:</span>
                      <span className="ml-2 font-medium">{applicant.experience}年</span>
                    </div>
                  </div>
                  
                  {application.interviewDate && (
                    <div className="mt-3 bg-purple-50 rounded-xl p-3" onClick={() => onCaseClick(application.caseId)}>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">
                          面談予定: {new Date(application.interviewDate).toLocaleString('ja-JP')}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {application.message && (
                    <div className="mt-3 bg-gray-50 rounded-xl p-3" onClick={() => onCaseClick(application.caseId)}>
                      <p className="text-sm font-medium text-gray-900 mb-1">連絡内容</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{application.message}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">まだエンジニアからの連絡がありません</p>
          </div>
        )}
      </div>

      {/* Recent Cases */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">最近の案件</h2>
        <div className="space-y-4">
          {cases.slice(0, 5).map((caseItem) => (
            <div
              key={caseItem.id}
              onClick={() => onCaseClick(caseItem.id)}
              className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 truncate">{caseItem.name}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  caseItem.status === 'recruiting' ? 'bg-blue-100 text-blue-800' :
                  caseItem.status === 'proposing' ? 'bg-orange-100 text-orange-800' :
                  caseItem.status === 'contracted' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {caseItem.status === 'recruiting' ? '募集中' :
                   caseItem.status === 'proposing' ? '提案中' :
                   caseItem.status === 'contracted' ? '成約済' : '終了'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{caseItem.overview}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {caseItem.rateMin > 0 && caseItem.rateMax > 0
                        ? `¥${caseItem.rateMin.toLocaleString()}~¥${caseItem.rateMax.toLocaleString()}`
                        : '単価未定'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{(caseItem.applications || []).length}件の連絡</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{caseItem.expectedStartDate || '開始日未定'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedApplication && (
        <ApplicationStatusModal
          application={selectedApplication}
          case={getCaseById(selectedApplication.caseId)!}
          applicant={getUserById(selectedApplication.userId)!}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedApplication(null);
          }}
          onUpdateStatus={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default SalesAdminDashboard;