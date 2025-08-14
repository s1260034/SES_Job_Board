import React, { useState } from 'react';
import { X, Calendar, FileText, MessageSquare, CheckCircle, Clock, Users, Award, XCircle } from 'lucide-react';
import { Application, Case, User } from '../../types';

interface ApplicationStatusModalProps {
  application: Application;
  case: Case;
  applicant: User;
  onClose: () => void;
  onUpdateStatus: (applicationId: string, status: Application['status'], notes?: string, interviewDate?: string, feedback?: string) => boolean;
}

const ApplicationStatusModal: React.FC<ApplicationStatusModalProps> = ({
  application,
  case: caseItem,
  applicant,
  onClose,
  onUpdateStatus,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<Application['status']>(application.status);
  const [notes, setNotes] = useState(application.notes || '');
  const [interviewDate, setInterviewDate] = useState(
    application.interviewDate ? new Date(application.interviewDate).toISOString().slice(0, 16) : ''
  );
  const [feedback, setFeedback] = useState(application.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions: { value: Application['status']; label: string; color: string; icon: React.ComponentType<any> }[] = [
    { value: 'pending', label: '新規連絡', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    { value: 'reviewing', label: '書類選考中', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: FileText },
    { value: 'interview_scheduled', label: '面談予定', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Calendar },
    { value: 'interview_completed', label: '面談完了', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Users },
    { value: 'accepted', label: '採用決定', color: 'bg-green-100 text-green-800 border-green-200', icon: Award },
    { value: 'rejected', label: '不採用', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    { value: 'withdrawn', label: '辞退', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = onUpdateStatus(
        application.id,
        selectedStatus,
        notes.trim() || undefined,
        interviewDate || undefined,
        feedback.trim() || undefined
      );

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Status update failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStatusOption = statusOptions.find(option => option.value === selectedStatus);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">ステータス管理</h2>
                <p className="text-gray-600">{applicant.name}さんの連絡</p>
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
          {/* Case and Applicant Info */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{caseItem.name}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">企業:</span> {caseItem.companyName}</p>
                  <p><span className="font-medium">単価:</span> ¥{caseItem.rateMin.toLocaleString()} - ¥{caseItem.rateMax.toLocaleString()}</p>
                  <p><span className="font-medium">勤務地:</span> {caseItem.workLocation}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{applicant.name}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">部署:</span> {applicant.department}</p>
                  <p><span className="font-medium">経験:</span> {applicant.experience}年</p>
                  <p><span className="font-medium">連絡日:</span> {new Date(application.appliedAt).toLocaleDateString('ja-JP')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Original Message */}
          {application.message && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <h4 className="font-medium text-gray-900 mb-2">連絡内容</h4>
              <p className="text-sm text-gray-700">{application.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ステータス <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedStatus(option.value)}
                      className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                        selectedStatus === option.value
                          ? option.color + ' border-current'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interview Date */}
            {(selectedStatus === 'interview_scheduled' || selectedStatus === 'interview_completed') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  面談日時
                </label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Feedback */}
            {(selectedStatus === 'interview_completed' || selectedStatus === 'accepted' || selectedStatus === 'rejected') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  フィードバック
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="面談の結果や採用・不採用の理由などを入力してください"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                営業メモ
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="営業活動に関するメモを入力してください"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                {isSubmitting ? '更新中...' : 'ステータスを更新'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatusModal;