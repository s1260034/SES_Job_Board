/**
 * SES案件管理システム - 案件管理カスタムフック
 * 
 * 機能:
 * - 案件データの取得・管理（モックデータベース）
 * - 案件CRUD操作（作成、更新、削除）
 * - 案件一括登録（Excel/CSVインポート対応）
 * - 案件コピー機能（既存案件の複製）
 * - 案件検索・フィルタリング（スキル、単価、勤務地等）
 * - 案件画像のランダム割り当て
 * 
 * データソース:
 * - mockData.ts からの初期データ読み込み
 * - ローカル状態での案件管理
 * - 将来的にSupabaseへの移行予定
 */
import { useState, useEffect } from 'react';
import { Case, CaseFilters } from '../types';
import { mockCases, getRandomCaseImage } from '../data/mockData';

export const useCases = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCases(mockCases);
      setLoading(false);
    }, 500);
  }, []);

  const createCase = (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCase: Case = {
      ...caseData,
      id: `CASE-${String(cases.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: caseData.imageUrl || getRandomCaseImage(),
    };
    setCases(prev => [newCase, ...prev]);
    return newCase;
  };

  const createMultipleCases = (casesData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const newCases: Case[] = casesData.map((caseData, index) => ({
      ...caseData,
      id: `CASE-${String(cases.length + index + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: caseData.imageUrl || getRandomCaseImage(),
    }));
    setCases(prev => [...newCases, ...prev]);
    return newCases;
  };

  const updateCase = (id: string, updates: Partial<Case>) => {
    setCases(prev => prev.map(c => 
      c.id === id 
        ? { ...c, ...updates, updatedAt: new Date().toISOString() }
        : c
    ));
  };

  const deleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
  };

  const copyCase = (id: string) => {
    const originalCase = cases.find(c => c.id === id);
    if (!originalCase) return null;

    const copiedCase: Case = {
      ...originalCase,
      id: `CASE-${String(cases.length + 1).padStart(3, '0')}`,
      name: `${originalCase.name} (コピー)`,
      status: 'recruiting', // Reset status to recruiting
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: undefined, // Clear assignment
      imageUrl: getRandomCaseImage(), // 新しいランダム画像を設定
    };

    setCases(prev => [copiedCase, ...prev]);
    return copiedCase;
  };

  const filterCases = (filters: CaseFilters) => {
    return cases.filter(caseItem => {
      if (filters.search && !caseItem.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !caseItem.overview.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      if (filters.skills.length > 0) {
        const hasRequiredSkill = filters.skills.some(skill => 
          caseItem.requiredSkills.includes(skill) || caseItem.preferredSkills.includes(skill)
        );
        if (!hasRequiredSkill) return false;
      }
      
      if (filters.rateMin > 0 && caseItem.rateMax < filters.rateMin) return false;
      if (filters.rateMax > 0 && caseItem.rateMin > filters.rateMax) return false;
      
      if (filters.locations.length > 0 && !filters.locations.includes(caseItem.workLocation)) {
        return false;
      }
      
      if (filters.status.length > 0 && !filters.status.includes(caseItem.status)) {
        return false;
      }
      
      if (filters.startDateFrom && caseItem.expectedStartDate < filters.startDateFrom) {
        return false;
      }
      
      if (filters.startDateTo && caseItem.expectedStartDate > filters.startDateTo) {
        return false;
      }
      
      return true;
    });
  };

  const getCaseById = (id: string) => {
    return cases.find(c => c.id === id);
  };

  return {
    cases,
    loading,
    createCase,
    createMultipleCases,
    updateCase,
    deleteCase,
    copyCase,
    filterCases,
    getCaseById,
  };
};