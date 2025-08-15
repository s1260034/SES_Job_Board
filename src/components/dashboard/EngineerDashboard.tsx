/**
 * SES案件管理システム - エンジニア向けダッシュボードコンポーネント
 * 
 * 機能:
 * - エンジニアの応募状況サマリー表示
 * - 営業担当者との連絡状況管理
 * - プロフィール情報表示
 * - 応募案件の詳細確認
 * 
 * 統計情報:
 * - 総連絡数: 営業担当者への連絡総数
 * - 営業対応待ち: pending状態の連絡数
 * - 選考中: reviewing状態の応募数
 * - 面談予定: interview_scheduled状態の数
 * - 採用決定: accepted状態の数
 * 
 * 表示内容:
 * - 応募案件の一覧と現在のステータス
 * - 面談予定日の表示
 * - フィードバック情報
 * - エンジニアのスキル・経験年数
 * 
 * UI特徴:
 * - グラデーション背景のウェルカムヘッダー
 * - ステータス別カラーコーディング
 * - 案件詳細への直接アクセス
 */
import React from 'react';
import { 
  Send, Clock, CheckCircle, XCircle, Calendar, 
  TrendingUp, Target, Award, User, Users 
} from 'lucide-react';
import { Case, Application, User as UserType } from '../../types';

interface EngineerDashboardProps {
  user: UserType;
  cases: Case[];
  onCaseClick: (caseId: string) => void;
}

const EngineerDashboard: React.FC<EngineerDashboardProps> = ({
  user,
  cases,
  onCaseClick,
}) => {
  const applications = user.applications || [];
  
  const stats = React.useMemo(() => {
    const totalContacts = applications.length;
    const pendingContacts = applications.filter(app => app.status === 'pending').length;
    const reviewingApplications = applications.filter(app => app.status === 'reviewing').length;
    const interviewScheduled = applications.filter(app => app.status === 'interview_scheduled').length;
    const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
    
    return {
      totalContacts,
      pendingContacts,
      reviewingApplications,
      interviewScheduled,
      acceptedApplications,
    };
  }, [applications]);

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'interview_completed': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: Application['status']) => {
    switch (status) {
      case 'pending': return '連絡済み';
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
      case 'reviewing': return Clock;
      case 'interview_scheduled': return Calendar;
      case 'interview_completed': return CheckCircle;
      case 'accepted': return CheckCircle;
      case 'rejected': return XCircle;
      case 'withdrawn': return XCircle;
      default: return Clock;
    }
  };

  const getCaseById = (caseId: string) => cases.find(c => c.id === caseId);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">おかえりなさい、{user.name}さん</h1>
            <p className="text-blue-100 text-lg">営業担当者との連絡状況をチェックしましょう</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Send className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">総連絡数</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalContacts}</p>
            <p className="text-xs text-blue-100 mt-1">営業担当者への連絡</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">営業対応待ち</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.pendingContacts}</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">選考中</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.reviewingApplications}</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">面談予定</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.interviewScheduled}</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">採用決定</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.acceptedApplications}</p>
          </div>
        </div>
      </div>

      {/* Application Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">営業担当者との連絡状況</h2>
        
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => {
              const caseItem = getCaseById(application.caseId);
              const StatusIcon = getStatusIcon(application.status);
              
              if (!caseItem) return null;
              
              return (
                <div
                  key={application.id}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => onCaseClick(application.caseId)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {caseItem.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {caseItem.companyName}
                      </p>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(application.status)}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{getStatusLabel(application.status)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-sm">
                      <span className="text-gray-500">応募日:</span>
                      <span className="ml-2 font-medium">
                        {new Date(application.appliedAt).toLocaleDateString('ja-JP')}
                      </span>
                      <span className="text-xs text-gray-400 block">
                        {application.status === 'pending' ? '営業担当者からの連絡待ち' : '営業担当者対応中'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">単価:</span>
                      <span className="ml-2 font-medium">
                        ¥{caseItem.rateMin.toLocaleString()} - ¥{caseItem.rateMax.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">勤務地:</span>
                      <span className="ml-2 font-medium">{caseItem.workLocation}</span>
                    </div>
                  </div>
                  
                  {application.interviewDate && (
                    <div className="bg-purple-50 rounded-xl p-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">
                          面談予定: {new Date(application.interviewDate).toLocaleString('ja-JP')}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {application.feedback && (
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-sm font-medium text-green-900 mb-1">フィードバック</p>
                      <p className="text-sm text-green-800">{application.feedback}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {caseItem.requiredSkills.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              まだ営業担当者に連絡していません
            </h3>
            <p className="text-gray-600 mb-6">
              気になる案件を見つけて営業担当者に連絡してみましょう
            </p>
            <div className="bg-blue-50 rounded-2xl p-6 max-w-md mx-auto">
              <h4 className="font-medium text-blue-900 mb-3">連絡の流れ</h4>
              <div className="space-y-2 text-sm text-blue-800 text-left">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>案件一覧から気になる案件を選択</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>「営業担当者に連絡」ボタンをクリック</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>興味や質問を入力して送信</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">プロフィール</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">基本情報</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">経験年数:</span>
                <span className="font-medium">{user.experience}年</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">部署:</span>
                <span className="font-medium">{user.department}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">スキル</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;