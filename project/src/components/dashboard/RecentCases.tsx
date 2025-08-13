import React from 'react';
import { Calendar, MapPin, DollarSign, Clock } from 'lucide-react';
import { Case } from '../../types';

interface RecentCasesProps {
  cases: Case[];
  onCaseClick: (caseId: string) => void;
}

const RecentCases: React.FC<RecentCasesProps> = ({ cases, onCaseClick }) => {
  const recentCases = cases.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recruiting': return 'bg-blue-100 text-blue-800';
      case 'proposing': return 'bg-orange-100 text-orange-800';
      case 'contracted': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'recruiting': return '募集中';
      case 'proposing': return '提案中';
      case 'contracted': return '成約済';
      case 'ended': return '終了';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の案件</h3>
      <div className="space-y-4">
        {recentCases.map((caseItem) => (
          <div
            key={caseItem.id}
            onClick={() => onCaseClick(caseItem.id)}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900 truncate">{caseItem.name}</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                {getStatusLabel(caseItem.status)}
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
                  <MapPin className="w-4 h-4" />
                  <span>{caseItem.workLocation || '勤務地未定'}</span>
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
  );
};

export default RecentCases;