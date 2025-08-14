import React from 'react';
import { LayoutDashboard, Briefcase, Plus, Search, Heart, Clock, Users } from 'lucide-react';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  canEdit: boolean;
  userRole: string;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange, canEdit, userRole }) => {
  const getNavItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
      { id: 'cases', label: '案件一覧', icon: Briefcase },
      { id: 'search', label: '案件検索', icon: Search },
    ];

    // エンジニアの場合はお気に入りを表示
    if (userRole === 'engineer') {
      baseItems.push({ id: 'favorites', label: 'お気に入り', icon: Heart });
    }

    // 営業と管理者の場合はエンジニア参画情報を表示
    if (userRole === 'sales' || userRole === 'admin') {
      baseItems.push({ id: 'engineer-participation', label: 'エンジニア参画情報', icon: Users });
    }

    baseItems.push({ id: 'history', label: '閲覧履歴', icon: Clock });

    if (canEdit) {
      baseItems.push({ id: 'create', label: '案件登録', icon: Plus });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-gray-50 border-r border-gray-200 w-64 h-screen overflow-y-auto fixed left-0 top-16 z-40">
      <div className="p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;