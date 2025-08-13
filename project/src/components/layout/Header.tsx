import React from 'react';
import { LogOut, User } from 'lucide-react';
import { User as UserType } from '../../types';

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '管理者';
      case 'sales': return '営業';
      case 'engineer': return 'エンジニア';
      default: return role;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8">
        <div className="flex justify-between items-center h-16">
          {/* 左：アプリ名 */}
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              SES案件管理システム
            </h1>
          </div>

          {/* 右：ユーザー情報とログアウト */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm leading-tight text-right">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-gray-500">{getRoleLabel(user.role)}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">ログアウト</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;