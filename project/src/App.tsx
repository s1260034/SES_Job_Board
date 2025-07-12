import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCases } from './hooks/useCases';
import { CaseFilters } from './types';
import LoginForm from './components/auth/LoginForm';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import DashboardStats from './components/dashboard/DashboardStats';
import RecentCases from './components/dashboard/RecentCases';
import CaseList from './components/cases/CaseList';
import SearchFilters from './components/cases/SearchFilters';
import CaseForm from './components/cases/CaseForm';
import CaseDetail from './components/cases/CaseDetail';
import FavoritesList from './components/favorites/FavoritesList';
import HistoryList from './components/history/HistoryList';

function App() {
  const { user, isLoading, login, logout, canEdit, canDelete, addToFavorites, removeFromFavorites, addToHistory } = useAuth();
  const { cases, loading, createCase, createMultipleCases, updateCase, deleteCase, copyCase, filterCases, getCaseById } = useCases();
  
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState(cases);

  useEffect(() => {
    setSearchResults(cases);
  }, [cases]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={login} />;
  }

  const handleCaseView = (caseId: string) => {
    setSelectedCaseId(caseId);
    addToHistory(caseId);
  };

  const handleCaseEdit = (caseId: string) => {
    setEditingCaseId(caseId);
    setActiveView('edit');
  };

  const handleCaseDelete = (caseId: string) => {
    if (window.confirm('この案件を削除してもよろしいですか？')) {
      deleteCase(caseId);
      setSelectedCaseId(null);
    }
  };

  const handleCaseCopy = (caseId: string) => {
    const originalCase = getCaseById(caseId);
    if (originalCase) {
      // Set the case to copy and navigate to create form
      setEditingCaseId(caseId); // Use original case ID to indicate copying
      setActiveView('copy'); // New view for copying
      setSelectedCaseId(null); // Close any open detail modal
    }
  };

  const handleCaseCreate = () => {
    setEditingCaseId(null);
    setActiveView('create');
  };

  const handleCaseSubmit = (caseData: any) => {
    if (activeView === 'copy') {
      // Create new case from copied data
      const newCase = createCase(caseData);
      setEditingCaseId(null);
      setActiveView('cases');
      // Optionally show the newly created case
      setSelectedCaseId(newCase.id);
    } else if (editingCaseId) {
      updateCase(editingCaseId, caseData);
      setEditingCaseId(null);
      setActiveView('cases');
    } else {
      createCase(caseData);
      setActiveView('cases');
    }
  };

  const handleSearchFilters = (filters: CaseFilters) => {
    const filtered = filterCases(filters);
    setSearchResults(filtered);
  };

  const handleToggleFavorite = (caseId: string) => {
    if (user?.favorites.includes(caseId)) {
      removeFromFavorites(caseId);
    } else {
      addToFavorites(caseId);
    }
  };

  const getFavoriteCases = () => {
    if (!user) return [];
    return user.favorites.map(id => getCaseById(id)).filter(Boolean) as Case[];
  };

  const getHistoryCases = () => {
    if (!user) return [];
    return (user.viewHistory || [])
      .map(item => {
        const caseItem = getCaseById(item.caseId);
        return caseItem ? { case: caseItem, viewedAt: item.viewedAt } : null;
      })
      .filter(Boolean) as { case: Case; viewedAt: string }[];
  };

  const selectedCase = selectedCaseId ? getCaseById(selectedCaseId) : null;
  const editingCase = editingCaseId ? getCaseById(editingCaseId) : null;

  const renderContent = () => {
    if (activeView === 'create' || activeView === 'edit' || activeView === 'copy') {
      const caseToEdit = activeView === 'copy' ? editingCase : (activeView === 'edit' ? editingCase : undefined);
      return (
        <CaseForm
          case={caseToEdit}
          onSubmit={handleCaseSubmit}
          onCancel={() => setActiveView('cases')}
          iscopying={activeView === 'copy'}
        />
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <DashboardStats cases={cases} />
            <RecentCases cases={cases} onCaseClick={handleCaseView} />
          </div>
        );
      
      case 'cases':
        return (
          <CaseList
            cases={cases}
            onView={handleCaseView}
            onEdit={canEdit() ? handleCaseEdit : undefined}
            onDelete={canDelete() ? handleCaseDelete : undefined}
            onCopy={canEdit() ? handleCaseCopy : undefined}
            onToggleFavorite={handleToggleFavorite}
            userFavorites={user?.favorites || []}
            onCreate={canEdit() ? handleCaseCreate : undefined}
            onImport={canEdit() ? createMultipleCases : undefined}
            canEdit={canEdit()}
            canDelete={canDelete()}
          />
        );
      
      case 'search':
        return (
          <div className="space-y-6">
            <SearchFilters onSearch={handleSearchFilters} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map((caseItem) => (
                <div
                  key={caseItem.id}
                  onClick={() => handleCaseView(caseItem.id)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {caseItem.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {caseItem.overview}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>¥{caseItem.rateMin.toLocaleString()}~</span>
                      <span>{caseItem.workLocation}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      caseItem.status === 'recruiting' ? 'bg-blue-100 text-blue-800' :
                      caseItem.status === 'proposing' ? 'bg-orange-100 text-orange-800' :
                      caseItem.status === 'contracted' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {caseItem.status === 'recruiting' ? '募集中' :
                       caseItem.status === 'proposing' ? '提案中' :
                       caseItem.status === 'contracted' ? '成約済' : '終了'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'favorites':
        return (
          <FavoritesList
            favoriteCases={getFavoriteCases()}
            onView={handleCaseView}
            onEdit={canEdit() ? handleCaseEdit : undefined}
            onDelete={canDelete() ? handleCaseDelete : undefined}
            onCopy={canEdit() ? handleCaseCopy : undefined}
            canEdit={canEdit()}
            canDelete={canDelete()}
          />
        );
      
      case 'history':
        return (
          <HistoryList
            historyCases={getHistoryCases()}
            onView={handleCaseView}
            onEdit={canEdit() ? handleCaseEdit : undefined}
            onDelete={canDelete() ? handleCaseDelete : undefined}
            onCopy={canEdit() ? handleCaseCopy : undefined}
            canEdit={canEdit()}
            canDelete={canDelete()}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} onLogout={logout} />
      
      <div className="flex pt-16">
        <Navigation
          activeView={activeView}
          onViewChange={setActiveView}
          canEdit={canEdit()}
        />
        
        <main className="flex-1 p-8 ml-64 min-h-screen overflow-y-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">案件データを読み込み中...</p>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {selectedCase && (
        <CaseDetail
          case={selectedCase}
          onClose={() => setSelectedCaseId(null)}
          onEdit={canEdit() ? handleCaseEdit : undefined}
          onDelete={canDelete() ? handleCaseDelete : undefined}
          onCopy={canEdit() ? handleCaseCopy : undefined}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={user?.favorites.includes(selectedCase.id) || false}
          canEdit={canEdit()}
          canDelete={canDelete()}
        />
      )}
    </div>
  );
}

export default App;