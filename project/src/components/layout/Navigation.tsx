import React from 'react';
import { LayoutDashboard, Briefcase, Plus, Search, Heart, Clock } from 'lucide-react';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  canEdit: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange, canEdit }) => {
  const navItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
    { id: 'cases', label: '案件一覧', icon: Briefcase },
    { id: 'search', label: '案件検索', icon: Search },
    { id: 'favorites', label: 'お気に入り', icon: Heart },
    { id: 'history', label: '閲覧履歴', icon: Clock },
    ...(canEdit ? [{ id: 'create', label: '案件登録', icon: Plus }] : []),
  ];

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