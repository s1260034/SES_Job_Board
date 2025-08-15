/**
 * SES案件管理システム - 応募モーダルコンポーネント
 * 
 * 機能:
 * - エンジニアから営業担当者への連絡機能
 * - 応募メッセージの入力
 * - 参考資料URL（ポートフォリオ等）の添付
 * - 既存応募の状況表示
 * - 案件情報の確認表示
 * 
 * 応募ステータス表示:
 * - pending: 応募済み（営業対応待ち）
 * - reviewing: 書類選考中
 * - interview_scheduled: 面談予定
 * - accepted: 採用決定
 * - rejected: 不採用
 * 
 * UI特徴:
 * - 案件情報の要約表示
 * - 応募状況の視覚的表示
 * - フィードバック情報の表示
 */
import React, { useState } from 'react';
import { X, Send, FileText, User, Clock, CheckCircle } from 'lucide-react';
import { Case, Application } from '../../types';

interface ApplicationModalProps {
  case: Case;
  onClose: () => void;
  onSubmit: (applicationData: { message: string; resumeUrl?: string }) => void;
  existingApplication?: Application;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  case: caseItem,
  onClose,
  onSubmit,
  existingApplication,
}) => {
  const [message, setMessage] = useState(existingApplication?.message || '');
  const [resumeUrl, setResumeUrl] = useState(existingApplication?.resumeUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ message: message.trim(), resumeUrl: resumeUrl.trim() || undefined });
      onClose();
    } catch (error) {
      console.error('Application submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      case 'pending': return '応募済み';
      case 'reviewing': return '書類選考中';
      case 'interview_scheduled': return '面談予定';
      case 'interview_completed': return '面談完了';
      case 'accepted': return '採用決定';
      case 'rejected': return '不採用';
      case 'withdrawn': return '辞退';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {existingApplication ? '応募状況' : '営業担当者に応募意思を伝える'}
                </h2>
                <p className="text-gray-600">{caseItem.name}</p>
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
          {existingApplication && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">応募状況</h3>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(existingApplication.status)}`}>
                  {getStatusLabel(existingApplication.status)}
                </span>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">応募日:</span>
                  <span className="font-medium">{new Date(existingApplication.appliedAt).toLocaleDateString('ja-JP')}</span>
                </div>
                
                {existingApplication.interviewDate && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600">面談予定:</span>
                    <span className="font-medium">{new Date(existingApplication.interviewDate).toLocaleString('ja-JP')}</span>
                  </div>
                )}
                
                {existingApplication.feedback && (
                  <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">フィードバック</p>
                    <p className="text-sm text-gray-700">{existingApplication.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!existingApplication && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  営業担当者へのメッセージ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="この案件への興味や質問、あなたの経験・スキルについて営業担当者に伝えてください。

例:
・この案件に興味があります
・React開発経験3年あります
・TypeScriptを使った大規模開発経験があります
・詳細な条件について相談したいです
・面談の機会をいただけますでしょうか"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  参考資料URL（任意）
                </label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/portfolio.pdf"
                />
                <p className="mt-2 text-sm text-gray-500">
                  ポートフォリオや履歴書のGoogle Drive、Dropbox等の共有URLを入力してください
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-medium text-gray-900 mb-3">興味のある案件</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">企業:</span> {caseItem.companyName}</p>
                  <p><span className="font-medium">単価:</span> ¥{caseItem.rateMin.toLocaleString()} - ¥{caseItem.rateMax.toLocaleString()}</p>
                  <p><span className="font-medium">勤務地:</span> {caseItem.workLocation}</p>
                  <p><span className="font-medium">開始予定:</span> {caseItem.expectedStartDate}</p>
                  <div>
                    <span className="font-medium">必須スキル:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {caseItem.requiredSkills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                >
                  {isSubmitting ? '送信中...' : '営業担当者に連絡する'}
                </button>
              </div>
            </form>
          )}

          {existingApplication && existingApplication.status === 'pending' && (
            <div className="text-center">
              <div className="bg-blue-50 rounded-2xl p-4 mb-4">
                <p className="text-sm text-blue-800">
                  営業担当者に連絡済みです。担当者からの連絡をお待ちください。
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-colors"
              >
                閉じる
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;