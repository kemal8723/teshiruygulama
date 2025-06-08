
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext.tsx';
import { UserRole, Store, ManagerPersona, StoreType } from '../types.ts'; // Added StoreType
import { ShoppingBagIcon, BriefcaseIcon, ChevronDownIcon, InfoIcon, LockClosedIcon } from '../components/IconComponents.tsx'; 
import { LoadingIcon } from '../components/LoadingIcon.tsx';

export const RoleSelectionPage: React.FC = () => {
  const { 
    userRole, 
    setUserRole, 
    selectedStoreId, 
    setSelectedStoreId,
    selectedStoreType, // Added
    setSelectedStoreType, // Added
    selectedManagerPersona, 
    setSelectedManagerPersona,
    managerPassword,
  } = useData();
  const navigate = useNavigate();

  const [internalRole, setInternalRole] = useState<UserRole | null>(userRole);
  const [internalStoreName, setInternalStoreName] = useState<string | null>(selectedStoreId);
  const [internalStoreType, setInternalStoreType] = useState<StoreType | null>(selectedStoreType); // Added
  const [internalManagerNameInput, setInternalManagerNameInput] = useState<string>(''); 
  const [managerPasswordInput, setManagerPasswordInput] = useState<string>('');
  const [isManagerPasswordVerified, setIsManagerPasswordVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    setInternalRole(userRole);
    setInternalStoreName(selectedStoreId);
    setInternalStoreType(selectedStoreType); // Set initial store type
    if (userRole === UserRole.MANAGER && selectedManagerPersona) {
        setInternalManagerNameInput(selectedManagerPersona.name || '');
    } else {
        setInternalManagerNameInput('');
    }
    setIsManagerPasswordVerified(false); 
    setManagerPasswordInput(''); 
  }, [userRole, selectedStoreId, selectedStoreType, selectedManagerPersona]);

  const handleRoleSelect = (role: UserRole) => {
    setInternalRole(role);
    setInputError(null); 
    setIsManagerPasswordVerified(false); 
    setManagerPasswordInput(''); 
    if (role === UserRole.STORE) {
      setInternalManagerNameInput(''); 
    } else if (role === UserRole.MANAGER) {
      setInternalStoreName(null);
      setInternalStoreType(null); // Clear store type if manager selected
    }
  };

  const handleProceed = () => {
    setInputError(null);
    if (!internalRole) {
        setInputError('Lütfen bir rol seçiniz.');
        setIsLoading(false);
        return;
    }

    setIsLoading(true);

    if (internalRole === UserRole.STORE) {
      if (!internalStoreName || internalStoreName.trim() === '') {
        setInputError('Lütfen mağaza adını giriniz.');
        setIsLoading(false);
        return;
      }
      if (!internalStoreType) { // Check for store type
        setInputError('Lütfen mağaza tipini seçiniz.');
        setIsLoading(false);
        return;
      }
      setUserRole(internalRole);
      setSelectedStoreId(internalStoreName.trim());
      setSelectedStoreType(internalStoreType); // Set store type
      setTimeout(() => { setIsLoading(false); navigate('/store'); }, 500);

    } else if (internalRole === UserRole.MANAGER) {
      if (!isManagerPasswordVerified) {
        if (managerPasswordInput.trim() === managerPassword) {
          setIsManagerPasswordVerified(true);
          setInputError(null); 
          setManagerPasswordInput(''); 
          setIsLoading(false); 
        } else {
          setInputError('Girilen şifre yanlış. Lütfen tekrar deneyin.');
          setIsLoading(false);
        }
      } else {
        const managerNameTrimmed = internalManagerNameInput.trim();
        if (managerNameTrimmed) {
          setUserRole(internalRole); 
          const customManagerPersona: ManagerPersona = {
            id: `custom_${managerNameTrimmed.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
            name: managerNameTrimmed
          };
          setSelectedManagerPersona(customManagerPersona);
          setTimeout(() => { setIsLoading(false); navigate('/manager'); }, 500);
        } else {
          setInputError('Lütfen yetkili adını ve soyadını giriniz.');
          setIsLoading(false);
        }
      }
    } else {
        setIsLoading(false); 
    }
  };
  
  const showMainLoadingSpinner = isLoading && !(internalRole === UserRole.MANAGER && !isManagerPasswordVerified && managerPasswordInput.trim() !== '');
  
  if (showMainLoadingSpinner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingIcon size={48} className="text-teal-500" />
        <p className="mt-4 text-lg text-slate-600">Yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  let currentCanProceed = false;
  if (internalRole === UserRole.STORE) {
      currentCanProceed = !!(internalStoreName && internalStoreName.trim() !== '' && internalStoreType); // Added store type check
  } else if (internalRole === UserRole.MANAGER) {
      if (!isManagerPasswordVerified) {
          currentCanProceed = managerPasswordInput.trim() !== '';
      } else {
          currentCanProceed = internalManagerNameInput.trim() !== '';
      }
  }

  let proceedButtonContent: React.ReactNode;
  if (isLoading && (internalRole !== UserRole.MANAGER || isManagerPasswordVerified)) {
     proceedButtonContent = <LoadingIcon className="text-white mx-auto" size={20}/>;
  } else if (internalRole === UserRole.MANAGER && !isManagerPasswordVerified) {
    proceedButtonContent = 'Şifreyi Onayla';
  } else {
    proceedButtonContent = 'Devam Et';
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:shadow-3xl">
        <h1 className="text-3xl font-bold text-center text-teal-700 mb-2">Hoş Geldiniz!</h1>
        <p className="text-center text-slate-600 mb-8">Lütfen rolünüzü seçerek devam edin.</p>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleRoleSelect(UserRole.STORE)}
              className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all duration-300 ease-in-out transform hover:scale-105 ${
                internalRole === UserRole.STORE ? 'bg-teal-500 text-white border-teal-600 shadow-lg' : 'bg-slate-50 hover:bg-teal-100 border-slate-300 text-slate-700'
              }`}
            >
              <ShoppingBagIcon className={`w-12 h-12 mb-2 ${internalRole === UserRole.STORE ? 'text-white' : 'text-teal-500'}`} />
              <span className="font-semibold text-lg">Mağaza Personeli</span>
            </button>
            <button
              onClick={() => handleRoleSelect(UserRole.MANAGER)}
              className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all duration-300 ease-in-out transform hover:scale-105 ${
                internalRole === UserRole.MANAGER ? 'bg-cyan-600 text-white border-cyan-700 shadow-lg' : 'bg-slate-50 hover:bg-cyan-100 border-slate-300 text-slate-700'
              }`}
            >
              <BriefcaseIcon className={`w-12 h-12 mb-2 ${internalRole === UserRole.MANAGER ? 'text-white' : 'text-cyan-600'}`} />
              <span className="font-semibold text-lg">Bölge Müdürü</span>
            </button>
          </div>

          {internalRole === UserRole.STORE && (
            <>
              <div>
                <label htmlFor="storeNameInput" className="block text-base font-semibold text-slate-800 mb-1.5">Mağaza Adı</label>
                <input
                  type="text"
                  id="storeNameInput"
                  value={internalStoreName || ''}
                  onChange={(e) => {
                    setInternalStoreName(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  placeholder="Örn: Cevahir"
                  className="block w-full px-3 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm"
                />
              </div>
              <div className="relative">
                <label htmlFor="storeTypeSelect" className="block text-base font-semibold text-slate-800 mb-1.5">Mağaza Tipi</label>
                <select
                  id="storeTypeSelect"
                  value={internalStoreType || ''}
                  onChange={(e) => {
                    setInternalStoreType(e.target.value as StoreType);
                    if (inputError) setInputError(null);
                  }}
                  className="block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm appearance-none"
                >
                  <option value="" disabled>Seçiniz...</option>
                  <option value={StoreType.MASS}>Mass</option>
                  <option value={StoreType.PREMIUM}>Premium</option>
                </select>
                <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 mt-3 pointer-events-none" />
              </div>
            </>
          )}

          {internalRole === UserRole.MANAGER && !isManagerPasswordVerified && (
            <div>
              <label htmlFor="managerPasswordInput" className="block text-base font-semibold text-slate-800 mb-1.5">Yönetici Şifresi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  id="managerPasswordInput"
                  value={managerPasswordInput}
                  onChange={(e) => {
                    setManagerPasswordInput(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleProceed()}
                  placeholder="Lütfen şifreyi giriniz"
                  className="block w-full pl-10 pr-3 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md shadow-sm"
                />
              </div>
            </div>
          )}

          {internalRole === UserRole.MANAGER && isManagerPasswordVerified && (
            <div>
              <label htmlFor="managerNameInput" className="block text-base font-semibold text-slate-800 mb-1.5">Yetkili Adı Soyadı</label>
              <input
                type="text"
                id="managerNameInput"
                value={internalManagerNameInput}
                onChange={(e) => {
                  setInternalManagerNameInput(e.target.value);
                  if (inputError) setInputError(null);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleProceed()}
                placeholder="Örn: Alp Yılmaz"
                className="block w-full px-3 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md shadow-sm"
              />
            </div>
          )}
          
          {inputError && (
            <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-md border border-red-300">
                <InfoIcon className="w-5 h-5 mr-2 text-red-500" />
                {inputError}
            </div>
          )}

          {internalRole && (
            <button
              onClick={handleProceed}
              className={`w-full font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
                currentCanProceed ? (internalRole === UserRole.STORE ? 'bg-teal-500 hover:bg-teal-600 text-white focus:ring-teal-400' : 'bg-cyan-600 hover:bg-cyan-700 text-white focus:ring-cyan-400') : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              } ${currentCanProceed && 'hover:scale-105'}`}
              disabled={isLoading || !currentCanProceed}
            >
              {proceedButtonContent}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
