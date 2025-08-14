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
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // 参画中のエンジニア（採用決定されたエンジニア）
  const participatingEngineers = allApplications
    .filter(app => app.status === 'accepted')
    .map(app => {
      const user = allUsers.find(u => u.id === app.userId);
      const caseItem = cases.find(c => c.id === app.caseId);
      return user && caseItem ? { application: app, user, case: caseItem } : null;
    })
    .filter(Boolean) as { application: Application; user: UserType; case: Case }[];

  // 待機中のエンジニア（参画していないエンジニア）
  const participatingUserIds = new Set(participatingEngineers.map(p => p.user.id));
  const waitingEngineers = allUsers.filter(user => 
    user.role === 'engineer' && !participatingUserIds.has(user.id)
  );

  // 検索フィルタリング
  const filteredParticipating = participatingEngineers.filter(({ user, case: caseItem }) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return user.name.toLowerCase().includes(searchLower) ||
           caseItem.name.toLowerCase().includes(searchLower) ||
           caseItem.companyName.toLowerCase().includes(searchLower);
  });

  const filteredWaiting = waitingEngineers.filter(user => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return user.name.toLowerCase().includes(searchLower) ||
           user.department.toLowerCase().includes(searchLower) ||
           user.skills.some(skill => skill.toLowerCase().includes(searchLower));
  });

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
    totalEngineers: allUsers.filter(u => u.role === 'engineer').length,
    participatingEngineers: participatingEngineers.length,
    waitingEngineers: waitingEngineers.length,
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
            <p className="text-indigo-100 text-lg">エンジニアの参画状況を管理</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">総エンジニア数</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalStats.totalEngineers}</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <UserCheck className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">参画中</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalStats.participatingEngineers}</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <UserX className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">待機中</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalStats.waitingEngineers}</p>
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

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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

      {/* Participating Engineers */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">参画中のエンジニア</h2>
            <p className="text-gray-600">採用決定され、案件に参画しているエンジニア</p>
          </div>
          <div className="ml-auto bg-green-50 rounded-xl px-4 py-2">
            <span className="text-green-800 font-semibold">{filteredParticipating.length}名</span>
          </div>
        </div>
        
        {filteredParticipating.length > 0 ? (
          <div className="space-y-4">
            {filteredParticipating.map(({ application, user, case: caseItem }) => (
              <div
                key={application.id}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.department} • {user.experience}年経験</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4" />
                        <span>参画中</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedApplication(application);
                        setShowStatusModal(true);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="詳細管理"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Case Information */}
                <div 
                  className="bg-white rounded-xl p-4 border border-green-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onView(caseItem.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{caseItem.name}</h4>
                      <p className="text-sm text-gray-600">{caseItem.companyName}</p>
                    </div>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4" />
                      <span>¥{caseItem.rateMin.toLocaleString()} - ¥{caseItem.rateMax.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{caseItem.workLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{caseItem.expectedStartDate}</span>
                    </div>
                  </div>
                </div>

                {/* Engineer Skills */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Application Details */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">参画開始日:</span>
                    <span className="ml-2">{new Date(application.appliedAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                  {application.interviewDate && (
                    <div>
                      <span className="font-medium">面談実施日:</span>
                      <span className="ml-2">{new Date(application.interviewDate).toLocaleDateString('ja-JP')}</span>
                    </div>
                  )}
                </div>

                {application.feedback && (
                  <div className="mt-4 bg-white rounded-xl p-3 border border-green-200">
                    <p className="text-sm font-medium text-green-900 mb-1">評価・フィードバック</p>
                    <p className="text-sm text-green-800">{application.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">参画中のエンジニアはいません</p>
          </div>
        )}
      </div>

      {/* Waiting Engineers */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
            <UserX className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">待機中のエンジニア</h2>
            <p className="text-gray-600">現在案件に参画していないエンジニア</p>
          </div>
          <div className="ml-auto bg-yellow-50 rounded-xl px-4 py-2">
            <span className="text-yellow-800 font-semibold">{filteredWaiting.length}名</span>
          </div>
        </div>
        
        {filteredWaiting.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWaiting.map((user) => (
              <div
                key={user.id}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.department}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">経験年数:</span>
                    <span className="font-medium text-gray-900">{user.experience}年</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">メールアドレス:</span>
                    <span className="font-medium text-gray-900 text-xs">{user.email}</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">保有スキル</p>
                  <div className="flex flex-wrap gap-1">
                    {user.skills.slice(0, 6).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {user.skills.length > 6 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{user.skills.length - 6}
                      </span>
                    )}
                  </div>
                </div>

                {/* Application History */}
                {user.applications && user.applications.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-yellow-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">過去の応募履歴</p>
                    <div className="space-y-2">
                      {user.applications.slice(0, 3).map((app) => {
                        const caseItem = getCaseById(app.caseId);
                        if (!caseItem) return null;
                        
                        return (
                          <div key={app.id} className="text-xs text-gray-600">
                            <div className="flex items-center justify-between">
                              <span className="truncate">{caseItem.name}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                app.status === 'withdrawn' ? 'bg-gray-100 text-gray-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {app.status === 'rejected' ? '不採用' :
                                 app.status === 'withdrawn' ? '辞退' : '選考中'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {user.applications.length > 3 && (
                        <p className="text-xs text-gray-500">他 {user.applications.length - 3}件</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Availability Status */}
                <div className="mt-4 pt-4 border-t border-yellow-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">アサイン可能</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-green-600 font-medium">利用可能</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserX className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">
              {searchTerm ? '検索条件に合う待機中のエンジニアはいません' : '待機中のエンジニアはいません'}
            </p>
          </div>
        )}
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

export default EngineerParticipationList;