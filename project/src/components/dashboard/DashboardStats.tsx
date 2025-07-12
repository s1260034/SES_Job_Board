import React from 'react';
import { TrendingUp, Users, CheckCircle, DollarSign } from 'lucide-react';
import { Case } from '../../types';

interface DashboardStatsProps {
  cases: Case[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ cases }) => {
  const stats = React.useMemo(() => {
    const totalCases = cases.length;
    const activeCases = cases.filter(c => c.status === 'recruiting' || c.status === 'proposing').length;
    const contractedCases = cases.filter(c => c.status === 'contracted').length;
    const averageRate = cases.length > 0 
      ? Math.round(cases.reduce((acc, c) => acc + (c.rateMin + c.rateMax) / 2, 0) / cases.length)
      : 0;

    return {
      totalCases,
      activeCases,
      contractedCases,
      averageRate,
    };
  }, [cases]);

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.title}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-sm text-green-600 mt-1">{item.change}</p>
              </div>
              <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;