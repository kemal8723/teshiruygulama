
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { APP_NAME } from '../constants.ts';
import { useData } from '../contexts/DataContext.tsx';
import { UserRole } from '../types.ts';
import { HomeIcon, UserCogIcon, ShoppingBagIcon, LogOutIcon, ShieldCheckIcon } from './IconComponents.tsx'; 

const WATSONS_LOGO_URL = "https://www.watsons.com.tr/medias/sys_master/images/h5e/hc0/12006938902558/Watsons--20Yil_Logo_Site_Yatay/Watsons-20Yil-Logo-Site-Yatay.png";

export const Header: React.FC = () => {
  const { userRole, setUserRole, selectedStoreId, selectedStoreType, selectedManagerPersona } = useData(); // Added selectedStoreType
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUserRole(null); 
    navigate('/');
  };
  
  const getRoleSpecificInfo = () => {
    if (userRole === UserRole.STORE && selectedStoreId && selectedStoreType) { // Check for storeType
      return `Mağaza: ${selectedStoreId} (${selectedStoreType})`; // Display store type
    }
    if (userRole === UserRole.STORE && selectedStoreId) { // Fallback if type somehow not set yet
        return `Mağaza: ${selectedStoreId}`;
    }
    if (userRole === UserRole.MANAGER && selectedManagerPersona) {
      return `Yetkili: ${selectedManagerPersona.name}`;
    }
    return '';
  };

  const showAdminLink = !userRole && location.pathname !== '/admin';

  return (
    <header className="bg-[#007a7a] text-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between py-4">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
          <img src={WATSONS_LOGO_URL} alt="Watsons Logo" className="h-14 sm:h-16" />
          <span className="text-xl sm:text-2xl font-bold tracking-tight">{APP_NAME}</span>
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0">
          {userRole && (
            <span className="text-sm sm:text-base hidden md:block px-2 py-1 bg-white/20 rounded-md">{getRoleSpecificInfo()}</span>
          )}
          {showAdminLink && (
             <Link to="/admin" title="Admin Paneli" className="p-2 rounded-md text-sm font-medium hover:bg-[#005a5a] transition-colors">
               <ShieldCheckIcon className="w-5 h-5" />
            </Link>
          )}
          {userRole === UserRole.STORE && (
            <Link to="/store" title="Mağaza Paneli" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-[#005a5a] transition-colors">
              <ShoppingBagIcon className="w-5 h-5 sm:mr-1.5" /> <span className="hidden sm:inline">Mağaza Paneli</span>
            </Link>
          )}
          {userRole === UserRole.MANAGER && (
            <Link to="/manager" title="Yönetici Paneli" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-[#005a5a] transition-colors">
              <UserCogIcon className="w-5 h-5 sm:mr-1.5" /> <span className="hidden sm:inline">Yönetici Paneli</span>
            </Link>
          )}
          {userRole && (
             <button
              onClick={handleLogout}
              title="Çıkış Yap"
              className="flex items-center bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <LogOutIcon className="w-5 h-5 sm:mr-1.5" /> <span className="hidden sm:inline">Çıkış Yap</span>
            </button>
          )}
          {!userRole && location.pathname !== '/' && !showAdminLink && ( 
            <Link to="/" title="Ana Sayfa" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-[#005a5a] transition-colors">
               <HomeIcon className="w-5 h-5 sm:mr-1.5" /> <span className="hidden sm:inline">Ana Sayfa</span>
            </Link>
          )}
        </div>
      </div>
       {userRole && (
          <div className="md:hidden bg-[#005a5a] text-center py-1.5 px-4 text-xs"> 
            {getRoleSpecificInfo()}
          </div>
        )}
    </header>
  );
};
