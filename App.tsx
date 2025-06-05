
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleSelectionPage } from './pages/RoleSelectionPage.tsx';
import { StoreViewPage } from './pages/StoreViewPage.tsx';
import { ManagerViewPage } from './pages/ManagerViewPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx'; // AdminPage import edildi
import { Header } from './components/Header.tsx';
import { useData } from './contexts/DataContext.tsx';
import { UserRole } from './types.ts';

// Trivial comment for cache busting
function App(): React.ReactNode {
  const { userRole, selectedStoreId, selectedManagerPersona } = useData();

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<RoleSelectionPage />} />
            <Route path="/admin" element={<AdminPage />} /> {/* Admin yolu eklendi */}
            
            {userRole === UserRole.STORE && selectedStoreId && (
              <Route path="/store" element={<StoreViewPage />} />
            )}
            {userRole === UserRole.STORE && !selectedStoreId && (
               <Route path="/store" element={<Navigate to="/" replace />} />
            )}

            {userRole === UserRole.MANAGER && selectedManagerPersona && (
              <Route path="/manager" element={<ManagerViewPage />} />
            )}
             {userRole === UserRole.MANAGER && !selectedManagerPersona && (
               <Route path="/manager" element={<Navigate to="/" replace />} />
            )}

            {/* Fallback for invalid role/selection states */}
            {/* These specific fallbacks ensure that if a user manually navigates to /store or /manager 
                without fulfilling the conditions above (e.g. role set but no ID), they are redirected.
                The order of routes matters. More specific routes (with conditions) should come before general fallbacks.
            */}
            <Route path="/store" element={<Navigate to="/" replace />} />
            <Route path="/manager" element={<Navigate to="/" replace />} />
            {/* A final catch-all for any other undefined paths, though "/" handles most cases */}
            {/* Admin yolu zaten yukarıda tanımlı, /admin olmayanlar ana sayfaya */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </main>
        <footer className="bg-teal-800 text-white text-center p-4 text-sm">
          © 2025 Watsons Teşhir Uygulamaları. Kemal Gülcan tarafından tasarlanmıştır. Tüm hakları saklıdır.
        </footer>
      </div>
    </HashRouter>
  );
}

export default App;