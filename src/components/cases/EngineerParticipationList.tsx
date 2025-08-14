import React, { useState } from 'react';
import { 
  Users, Search, Calendar, MapPin, DollarSign, 
  Clock, CheckCircle, Award, XCircle, Eye, Edit2, User,
  TrendingUp, Target, Building, FileText, UserCheck, UserX
} from 'lucide-react';
import { Case, Application, User as UserType } from '../../types';
import ApplicationStatusModal from '../dashboard/ApplicationStatusModal';

interface EngineerParticipationListProps {
  cases: Case[];
  allApplications: Application[];
  allUsers: UserType[];
  onView: (caseId: string) => void;
  onUpdateApplicationStatus: (applicationId: string, status: Application['status'], notes?: string, interviewDate?: string, feedback?: string) => boolean;
}

const EngineerParticipationList: React.FC<EngineerParticipationListProps> = ({
  cases,
  allApplications,
  allUsers,
  onView,
  onUpdateApplicationStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [participationFilter, setParticipationFilter] = useState('all'); // 'all', 'participating', 'waiting'
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // エンジニアの参画状況を判定
  const getParticipationStatus = (applications: Application[]) => {
    const hasAccepted = applications.some(app => app.status === 'accepted');
    const hasActive = applications.some(app => 
      ['pending', 'reviewing', 'interview_scheduled', 'interview_completed'].includes(app.status)
    );
    
    if (hasAccepted) return 'participating';
    if (hasActive) return 'waiting';
    return 'none';
  };

  // 案件別にエンジニア参画情報をグループ化（参画情報があるもののみ）
  const participationData = cases
    .map(caseItem => {
      const caseApplications = allApplications.filter(app => app.caseId === caseItem.id);
      const applicants = caseApplications.map(app => {
        const user = allUsers.find(u => u.id === app.userId);
        return user ? { application: app, user } : null;
      }).filter(Boolean) as { application: Application; user: UserType }[];

      const participationStatus = getParticipationStatus(caseApplications);

      return {
        case: caseItem,
        applications: caseApplications,
        applicants,
        participationStatus,
        totalApplications: caseApplications.length,
        pendingApplications: caseApplications.filter(app => app.status === 'pending').length,
        acceptedApplications: caseApplications.filter(app => app.status === 'accepted').length,
        activeApplications: caseApplications.filter(app => 
          ['pending', 'reviewing', 'interview_scheduled', 'interview_completed'].includes(app.status)
        ).length,
      };
    })
    .filter(data => data.applications.length > 0); // 応募があるもののみ

  // フィルタリング
  const filteredData = participationData.filter(data => {
    // 検索フィルタ
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesCase = data.case.name.toLowerCase().includes(searchLower) ||
                         data.case.companyName.toLowerCase().includes(searchLower);
      const matchesApplicant = data.applicants.some(({ user }) => 
        user.name.toLowerCase().includes(searchLower)
      );
      if (!matchesCase && !matchesApplicant) return false;
    }

    // 参画状況フィルタ
    if (participationFilter !== 'all') {
      if (participationFilter !== data.participationStatus) return false;
    }

    return true;
  });

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
      case 'pending': return '新規連絡';
      case 'reviewing': return '書類選考中';
      case 'interview_scheduled': return '面談予定';
      case 'interview_completed': return '面談完了';
      case 'accepted': return '採用決定';
      case 'rejected': return '不採用';
      case 'withdrawn': return '辞退';
      default: return status;
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'pending': return Clock;
      case 'reviewing': return FileText;
      case 'interview_scheduled': return Calendar;
      case 'interview_completed': return CheckCircle;
      case 'accepted': return Award;
      case 'rejected': return XCircle;
      case 'withdrawn': return XCircle;
      default: return Clock;
    }
  };

  const getParticipationStatusColor = (status: string) => {
    switch (status) {
      case 'participating': return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getParticipationStatusLabel = (status: string) => {
    switch (status) {
      case 'participating': return '参画中';
      case 'waiting': return '待機中';
      default: return '未参画';
    }
  };

  const getCaseById = (caseId: string) => cases.find(c => c.id === caseId);
  const getUserById = (userId: string) => allUsers.find(u => u.id === userId);

  const handleStatusUpdate = (applicationId: string, status: Application['status'], notes?: string, interviewDate?: string, feedback?: string) => {
    const success = onUpdateApplicationStatus(applicationId, status, notes, interviewDate, feedback);
    if (success) {
      setSelectedApplication(null);
      setShowStatusModal(false);
    }
    return success;
  };

  const totalStats = {
    totalCasesWithApplications: participationData.length,
    participatingCases: participationData.filter(data => data.participationStatus === 'participating').length,
    waitingCases: participationData.filter(data => data.participationStatus === 'waiting').length,
    totalApplications: allApplications.length,
    acceptedApplications: allApplications.filter(app => app.status === 'accepted').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">エンジニア参画情報</h1>
            <p className="text-indigo-100 text-lg">案件別のエンジニア参画状況を管理</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Building className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">応募あり案件</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalStats.totalCasesWithApplications}</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <UserCheck className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">参画中案件</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalStats.participatingCases}</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <UserX className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">待機中案件</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalStats.waitingCases}</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">総応募数</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalStats.totalApplications}</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">採用決定</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalStats.acceptedApplications}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              案件・エンジニア検索
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="案件名、企業名、エンジニア名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              参画状況
            </label>
            <select
              value={participationFilter}
              onChange={(e) => setParticipationFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">すべての案件</option>
              <option value="participating">参画中の案件</option>
              <option value="waiting">待機中の案件</option>
            </select>
          </div>
        </div>
      </div>

      {/* Participation List */}
      <div className="space-y-6">
        {filteredData.map((data) => (
          <div key={data.case.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {/* Case Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 
                    className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => onView(data.case.id)}
                  >
                    {data.case.name}
                  </h3>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    data.case.status === 'recruiting' ? 'bg-blue-100 text-blue-800' :
                    data.case.status === 'proposing' ? 'bg-orange-100 text-orange-800' :
                    data.case.status === 'contracted' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {data.case.status === 'recruiting' ? '募集中' :
                     data.case.status === 'proposing' ? '提案中' :
                     data.case.status === 'contracted' ? '成約済' : '終了'}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getParticipationStatusColor(data.participationStatus)}`}>
                    {getParticipationStatusLabel(data.participationStatus)}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{data.case.companyName}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span>¥{data.case.rateMin.toLocaleString()} - ¥{data.case.rateMax.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{data.case.workLocation}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{data.case.expectedStartDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{data.totalApplications}名のエンジニア</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-yellow-50 rounded-lg p-2 text-center">
                      <div className="font-bold text-yellow-800">{data.pendingApplications}</div>
                      <div className="text-yellow-600">対応待ち</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <div className="font-bold text-blue-800">{data.activeApplications}</div>
                      <div className="text-blue-600">選考中</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <div className="font-bold text-green-800">{data.acceptedApplications}</div>
                      <div className="text-green-600">採用</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Engineers List */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                参画エンジニア一覧 ({data.applicants.length}名)
              </h4>
              {data.applicants.map(({ application, user }) => {
                const StatusIcon = getStatusIcon(application.status);
                
                return (
                  <div
                    key={application.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">{user.name}</h5>
                          <p className="text-sm text-gray-600">{user.department} • {user.experience}年経験</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.skills.slice(0, 4).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {user.skills.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{user.skills.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(application.status)}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">{getStatusLabel(application.status)}</span>
                        </div>
                        <button
                          onClick={() => {
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">応募日:</span>
                        <span className="ml-2">{new Date(application.appliedAt).toLocaleDateString('ja-JP')}</span>
                      </div>
                      {application.interviewDate && (
                        <div>
                          <span className="font-medium">面談予定:</span>
                          <span className="ml-2">{new Date(application.interviewDate).toLocaleString('ja-JP')}</span>
                        </div>
                      )}
                      {application.resumeUrl && (
                        <div>
                          <a
                            href={application.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            参考資料を確認
                          </a>
                        </div>
                      )}
                    </div>

                    {application.message && (
                      <div className="bg-white rounded-xl p-3 mb-3">
                        <p className="text-sm font-medium text-gray-900 mb-1">応募メッセージ</p>
                        <p className="text-sm text-gray-700">{application.message}</p>
                      </div>
                    )}

                    {application.notes && (
                      <div className="bg-blue-50 rounded-xl p-3 mb-3">
                        <p className="text-sm font-medium text-blue-900 mb-1">営業メモ</p>
                        <p className="text-sm text-blue-800">{application.notes}</p>
                      </div>
                    )}

                    {application.feedback && (
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-sm font-medium text-green-900 mb-1">フィードバック</p>
                        <p className="text-sm text-green-800">{application.feedback}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {participationData.length === 0 ? 'エンジニアからの応募がありません' : '条件に合う案件が見つかりません'}
          </h3>
          <p className="text-gray-600">
            {participationData.length === 0 
              ? 'エンジニアが案件に応募すると、ここに表示されます'
              : '検索条件を変更して再度お試しください'
            }
          </p>
        </div>
      )}

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

export default EngineerParticipationList;