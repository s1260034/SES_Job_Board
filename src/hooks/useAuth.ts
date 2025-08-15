/**
 * SES案件管理システム - 認証管理カスタムフック
 * 
 * 機能:
 * - ユーザーログイン・ログアウト処理
 * - ロールベースアクセス制御（編集・削除権限チェック）
 * - お気に入り案件の追加・削除
 * - 閲覧履歴の管理（最新20件まで保持）
 * - 応募情報の管理（エンジニアから営業への連絡）
 * - 応募ステータス更新（営業・管理者による管理）
 * - ローカルストレージでの状態永続化
 * 
 * 対応ロール:
 * - admin: 全機能利用可能
 * - sales: 案件編集・削除、応募管理
 * - engineer: 案件閲覧、応募、お気に入り
 */
import { useState, useEffect } from 'react';
import { User, ViewHistoryItem } from '../types';
import { mockUsers } from '../data/mockData';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate authentication check
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Ensure favorites and viewHistory are always arrays
      setUser({
        ...parsedUser,
        favorites: parsedUser.favorites || [],
        viewHistory: parsedUser.viewHistory || [],
        applications: parsedUser.applications || []
      });
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    // Simulate login
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const canEdit = () => {
    return user?.role === 'admin' || user?.role === 'sales';
  };

  const canDelete = () => {
    return user?.role === 'admin' || user?.role === 'sales';
  };

  const addToFavorites = (caseId: string) => {
    if (user && !user.favorites.includes(caseId)) {
      const updatedUser = {
        ...user,
        favorites: [...user.favorites, caseId]
      };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const removeFromFavorites = (caseId: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        favorites: user.favorites.filter(id => id !== caseId)
      };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const addToHistory = (caseId: string) => {
    if (user) {
      const viewHistory = user.viewHistory || [];
      const existingIndex = viewHistory.findIndex(item => item.caseId === caseId);
      let newHistory = [...viewHistory];
      
      if (existingIndex !== -1) {
        // Remove existing entry
        newHistory.splice(existingIndex, 1);
      }
      
      // Add to beginning
      newHistory.unshift({
        caseId,
        viewedAt: new Date().toISOString()
      });
      
      // Keep only last 20 items
      newHistory = newHistory.slice(0, 20);
      
      const updatedUser = {
        ...user,
        viewHistory: newHistory
      };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const addApplication = (caseId: string, applicationData: { message: string; resumeUrl?: string }) => {
    if (user) {
      const applications = user.applications || [];
      
      // Check if already applied
      const existingApplication = applications.find(app => app.caseId === caseId);
      if (existingApplication) {
        return existingApplication;
      }
      
      // Create new application
      const newApplication = {
        id: `APP-${Date.now()}`,
        caseId,
        userId: user.id,
        appliedAt: new Date().toISOString(),
        status: 'pending' as const,
        message: applicationData.message,
        resumeUrl: applicationData.resumeUrl,
      };
      
      const updatedApplications = [...applications, newApplication];
      const updatedUser = {
        ...user,
        applications: updatedApplications
      };
      
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      return newApplication;
    }
    return null;
  };

  const updateApplicationStatus = (applicationId: string, status: Application['status'], notes?: string, interviewDate?: string, feedback?: string) => {
    if (user && (user.role === 'admin' || user.role === 'sales')) {
      // Find and update the application in mockUsers
      const updatedMockUsers = mockUsers.map((u: User) => {
        if (u.applications) {
          const updatedApplications = u.applications.map((app: Application) => {
            if (app.id === applicationId) {
              return {
                ...app,
                status,
                notes: notes || app.notes,
                interviewDate: interviewDate || app.interviewDate,
                feedback: feedback || app.feedback,
              };
            }
            return app;
          });
          return { ...u, applications: updatedApplications };
        }
        return u;
      });
      
      // Update current user if they have this application
      if (user.applications) {
        const updatedCurrentUserApplications = user.applications.map((app: Application) => {
          if (app.id === applicationId) {
            return {
              ...app,
              status,
              notes: notes || app.notes,
              interviewDate: interviewDate || app.interviewDate,
              feedback: feedback || app.feedback,
            };
          }
          return app;
        });
        
        const updatedUser = {
          ...user,
          applications: updatedCurrentUserApplications
        };
        
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      // Also update the specific user who made the application
      const applicationUser = updatedMockUsers.find(u => 
        u.applications?.some(app => app.id === applicationId)
      );
      
      if (applicationUser) {
        const currentUserData = localStorage.getItem('currentUser');
        if (currentUserData) {
          const currentUser = JSON.parse(currentUserData);
          if (currentUser.id === applicationUser.id) {
            const updatedApplications = applicationUser.applications?.map((app: Application) => {
              if (app.id === applicationId) {
                return {
                  ...app,
                  status,
                  notes: notes || app.notes,
                  interviewDate: interviewDate || app.interviewDate,
                  feedback: feedback || app.feedback,
                };
              }
              return app;
            });
            
            const updatedCurrentUser = {
              ...currentUser,
              applications: updatedApplications
            };
            
            localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
          }
        }
      }
      
      return true;
    }
    return false;
  };

  return {
    user,
    isLoading,
    login,
    logout,
    canEdit,
    canDelete,
    addToFavorites,
    removeFromFavorites,
    addToHistory,
    addApplication,
    updateApplicationStatus,
  };
};