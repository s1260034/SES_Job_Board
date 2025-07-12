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
        viewHistory: parsedUser.viewHistory || []
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
    return user?.role === 'admin';
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
  };
};