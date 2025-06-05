import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleSelectionPage } from './pages/RoleSelectionPage.tsx';
import { StoreViewPage } from './pages/StoreViewPage.tsx';
import { ManagerViewPage } from './pages/ManagerViewPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { Header } from './components/Header.tsx';
import { useData } from './contexts/DataContext.tsx';
import { UserRole } from './types.ts';

function App(): React.ReactNode {
  const { userRole, selectedStoreId, selectedManagerPersona } = useData();

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-teal-50">
        <Header />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<RoleSelectionPage />} />
            <Route path="/admin" element={<AdminPage />} />
            
            {userRole === UserRole.STORE && selectedStoreId && (
              <Route path="/store\" element={<StoreViewPage />} />
            )}
            {userRole === UserRole.STORE && !selectedStoreId && (
               <Route path="/store" element={<Navigate to="/\" replace />} />
            )}

            {userRole === UserRole.MANAGER && selectedManagerPersona && (
              <Route path="/manager" element={<ManagerViewPage />} />
            )}
             {userRole === UserRole.MANAGER && !selectedManagerPersona && (
               <Route path="/manager\" element={<Navigate to="/\" replace />} />
            )}

            <Route path="/store" element={<Navigate to="/\" replace />} />
            <Route path="/manager" element={<Navigate to="/\" replace />} />
            <Route path="*" element={<Navigate to="/\" replace />} />
          </Routes>
        </main>
        <footer className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-center p-4 text-sm shadow-inner">
          © 2025 Watsons Teşhir Uygulamaları. Kemal Gülcan tarafından tasarlanmıştır. Tüm hakları saklıdır.
        </footer>
      </div>
    </HashRouter>
  );
}

export default App;