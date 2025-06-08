import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext.tsx';
import { ADMIN_PASSWORD, APP_NAME } from '../constants.ts';
import { Equipment } from '../types.ts';
import { Modal } from '../components/Modal.tsx';
import { LoadingIcon } from '../components/LoadingIcon.tsx';
import { ImageUploader } from '../components/ImageUploader.tsx';
import { LockClosedIcon, LogOutIcon, EditIcon, TrashIcon, PlusCircleIcon, SaveIcon, InfoIcon, ShieldCheckIcon, EyeIcon, KeyIcon, CheckCircleIcon, XCircleIcon } from '../components/IconComponents.tsx';
import { Lightbox } from '../components/Lightbox.tsx';

const initialNewEquipmentData: Omit<Equipment, 'id'> = {
  name: '',
  referenceImageUrl: '', 
  description: '',
};

export const AdminPage: React.FC = () => {
  const { 
    equipmentList, 
    addEquipment, 
    updateEquipment, 
    deleteEquipment, 
    clearAllData,
    managerPassword, // Current manager password from context
    updateManagerPassword, // Function to update manager password
  } = useData();
  const navigate = useNavigate();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false); // General loading for async admin operations

  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState<boolean>(false);
  const [newEquipmentData, setNewEquipmentData] = useState<Omit<Equipment, 'id'>>(initialNewEquipmentData);
  
  const [isEditEquipmentModalOpen, setIsEditEquipmentModalOpen] = useState<boolean>(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState<boolean>(false);
  const [deletingEquipmentId, setDeletingEquipmentId] = useState<string | null>(null);
  
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxAltText, setLightboxAltText] = useState<string>('');

  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState<boolean>(false);
  const [equipmentFormError, setEquipmentFormError] = useState<string>('');

  // State for manager password change
  const [newManagerPassword, setNewManagerPassword] = useState<string>('');
  const [confirmNewManagerPassword, setConfirmNewManagerPassword] = useState<string>('');
  const [managerPasswordChangeError, setManagerPasswordChangeError] = useState<string>('');
  const [managerPasswordChangeSuccess, setManagerPasswordChangeSuccess] = useState<string>('');
  const [isPasswordChangeLoading, setIsPasswordChangeLoading] = useState<boolean>(false);


  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('isAdminAuthenticated');
    if (sessionAuth === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const handleAdminLogin = () => {
    setIsLoading(true);
    setAuthError('');
    setTimeout(() => { 
      if (passwordInput === ADMIN_PASSWORD) {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        setPasswordInput('');
      } else {
        setAuthError('Yanlış şifre. Lütfen tekrar deneyin.');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('isAdminAuthenticated');
    navigate('/');
  };

  const openAddEquipmentModal = () => {
    setNewEquipmentData(initialNewEquipmentData);
    setEquipmentFormError('');
    setIsAddEquipmentModalOpen(true);
  };

  const handleAddEquipment = async () => {
    if (!newEquipmentData.name.trim() || !newEquipmentData.referenceImageUrl.trim() || !newEquipmentData.description.trim()) {
      setEquipmentFormError('Tüm alanlar ve referans görseli zorunludur.');
      return;
    }
    setEquipmentFormError('');
    setIsLoading(true);
    try {
        await addEquipment(newEquipmentData);
        setIsAddEquipmentModalOpen(false);
    } catch (error) {
        console.error("Error adding equipment:", error);
        setEquipmentFormError("Ekipman eklenirken bir hata oluştu.");
    } finally {
        setIsLoading(false);
    }
  };

  const openEditEquipmentModal = (equipment: Equipment) => {
    setEditingEquipment(JSON.parse(JSON.stringify(equipment))); 
    setEquipmentFormError('');
    setIsEditEquipmentModalOpen(true);
  };

  const handleUpdateEquipment = async () => {
    if (!editingEquipment || !editingEquipment.name.trim() || !editingEquipment.referenceImageUrl.trim() || !editingEquipment.description.trim()) {
        setEquipmentFormError('Tüm alanlar ve referans görseli zorunludur.');
        return;
    }
    setEquipmentFormError('');
    setIsLoading(true);
    try {
        await updateEquipment(editingEquipment);
        setIsEditEquipmentModalOpen(false);
        setEditingEquipment(null);
    } catch (error) {
        console.error("Error updating equipment:", error);
        setEquipmentFormError("Ekipman güncellenirken bir hata oluştu.");
    } finally {
        setIsLoading(false);
    }
  };

  const openDeleteConfirmModal = (equipmentId: string) => {
    setDeletingEquipmentId(equipmentId);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleDeleteEquipment = async () => {
    if (deletingEquipmentId) {
      setIsLoading(true);
      try {
          await deleteEquipment(deletingEquipmentId);
      } catch (error) {
          console.error("Error deleting equipment:", error);
          alert("Ekipman silinirken bir hata oluştu: " + (error as Error).message);
      } finally {
          setIsLoading(false);
      }
    }
    setIsDeleteConfirmModalOpen(false);
    setDeletingEquipmentId(null);
  };
  
  const openLightbox = (url: string, alt: string) => {
    setLightboxImageUrl(url);
    setLightboxAltText(alt);
  };

  const closeLightbox = () => {
    setLightboxImageUrl(null);
    setLightboxAltText('');
  };

  const openResetConfirmModal = () => {
    setIsResetConfirmModalOpen(true);
  };

  const handleResetAllData = async () => {
    setIsLoading(true);
    let resetError: Error | null = null;
    let resetSuccess = false;

    try {
      await clearAllData();
      resetSuccess = true;
    } catch (error) {
      console.error("Error resetting all data:", error);
      resetError = error as Error;
    } finally {
      setIsLoading(false);
      // Close the modal first to allow React to process this state change
      setIsResetConfirmModalOpen(false); 
      
      // Defer alerts and navigation to allow modal-closing re-render.
      // Modal animation is 300ms. Wait slightly longer.
      setTimeout(() => {
        if (resetSuccess) {
          alert('Tüm uygulama verileri başarıyla sıfırlandı. Yeniden giriş yapmanız gerekebilir.');
          handleAdminLogout(); // Navigate after alert
        } else if (resetError) {
          alert("Veriler sıfırlanırken bir hata oluştu: " + resetError.message);
        }
      }, 350); // Increased timeout to ensure modal animation completes
    }
  };

  const handleManagerPasswordChange = () => {
    setManagerPasswordChangeError('');
    setManagerPasswordChangeSuccess('');

    if (!newManagerPassword.trim()) {
      setManagerPasswordChangeError('Yeni şifre boş bırakılamaz.');
      return;
    }
    if (newManagerPassword !== confirmNewManagerPassword) {
      setManagerPasswordChangeError('Girilen yeni şifreler eşleşmiyor.');
      return;
    }
    if (newManagerPassword.length < 4) {
      setManagerPasswordChangeError('Yeni şifre en az 4 karakter uzunluğunda olmalıdır.');
      return;
    }

    setIsPasswordChangeLoading(true);
    setTimeout(() => { 
        try {
            updateManagerPassword(newManagerPassword);
            setManagerPasswordChangeSuccess('Bölge Müdürü şifresi başarıyla güncellendi.');
            setNewManagerPassword('');
            setConfirmNewManagerPassword('');
        } catch (error) {
            console.error("Error updating manager password:", error);
            setManagerPasswordChangeError("Şifre güncellenirken bir hata oluştu.");
        } finally {
            setIsPasswordChangeLoading(false);
        }
    }, 700);
  };


  if (!isAdminAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
          <div className="flex flex-col items-center mb-6">
            <ShieldCheckIcon className="w-16 h-16 text-teal-600 mb-3" />
            <h1 className="text-2xl font-bold text-center text-teal-700">Admin Paneli Girişi</h1>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="adminPasswordInput" className="block text-sm font-medium text-slate-700 mb-1">
                Yönetici Şifresi
              </label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  id="adminPasswordInput"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  placeholder="Şifrenizi girin"
                  className="block w-full pl-10 pr-3 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm"
                />
              </div>
            </div>
            {authError && (
              <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-md border border-red-300">
                <InfoIcon className="w-5 h-5 mr-2 text-red-500" />
                {authError}
              </div>
            )}
            <button
              onClick={handleAdminLogin}
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isLoading && !isPasswordChangeLoading ? <LoadingIcon className="text-white" size={20}/> : 'Giriş Yap'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // General loading covers most operations, password change has its own spinner
  const generalOperationIsLoading = isLoading && !isPasswordChangeLoading;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-wrap justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-teal-700">Yönetici Paneli</h1>
            <p className="text-slate-600">Uygulama verilerini ve ayarlarını yönetin.</p>
        </div>
        <button
          onClick={handleAdminLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center mt-4 sm:mt-0"
        >
          <LogOutIcon className="w-5 h-5 mr-2" /> Çıkış Yap
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-slate-700">Ekipman Yönetimi</h2>
          <button
            onClick={openAddEquipmentModal}
            disabled={generalOperationIsLoading}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center disabled:opacity-50"
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" /> Yeni Ekipman Ekle
          </button>
        </div>
        {generalOperationIsLoading && equipmentList.length === 0 ? <div className="flex justify-center py-4"><LoadingIcon size={30} /></div> : null}
        {equipmentList.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Adı</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Açıklama</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Referans Görsel</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {equipmentList.map((equipment) => (
                  <tr key={equipment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{equipment.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate hover:whitespace-normal hover:overflow-visible">{equipment.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                       {equipment.referenceImageUrl ? (
                           <button 
                             onClick={() => openLightbox(equipment.referenceImageUrl, `Referans: ${equipment.name}`)} 
                             className="text-teal-600 hover:text-teal-800 underline flex items-center"
                           >
                               <EyeIcon className="w-4 h-4 mr-1"/> Görüntüle (Tam Ekran)
                           </button>
                        ) : (
                            <span className="text-slate-400">Görsel Yok</span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => openEditEquipmentModal(equipment)} disabled={generalOperationIsLoading} className="text-cyan-600 hover:text-cyan-800 p-1 rounded hover:bg-cyan-50 transition-colors disabled:opacity-50" title="Düzenle">
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => openDeleteConfirmModal(equipment.id)} disabled={generalOperationIsLoading} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50" title="Sil">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !generalOperationIsLoading && <p className="text-center text-slate-500 py-4">Henüz tanımlı ekipman bulunmamaktadır.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center mb-6">
          <KeyIcon className="w-8 h-8 text-teal-600 mr-3" />
          <h2 className="text-2xl font-semibold text-slate-700">Yönetici Şifre Yönetimi</h2>
        </div>
        <div className="max-w-md space-y-4">
          <div>
            <label htmlFor="newManagerPass" className="block text-sm font-medium text-slate-700">
              Yeni Yönetici Şifresi (En az 4 karakter)
            </label>
            <input
              type="password"
              id="newManagerPass"
              value={newManagerPassword}
              onChange={(e) => {
                setNewManagerPassword(e.target.value);
                setManagerPasswordChangeError('');
                setManagerPasswordChangeSuccess('');
              }}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="Yeni şifreyi girin"
            />
          </div>
          <div>
            <label htmlFor="confirmNewManagerPass" className="block text-sm font-medium text-slate-700">
              Yeni Yönetici Şifresini Onayla
            </label>
            <input
              type="password"
              id="confirmNewManagerPass"
              value={confirmNewManagerPassword}
              onChange={(e) => {
                setConfirmNewManagerPassword(e.target.value);
                setManagerPasswordChangeError('');
                setManagerPasswordChangeSuccess('');
              }}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="Yeni şifreyi tekrar girin"
            />
          </div>
          {managerPasswordChangeError && (
            <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-md border border-red-300">
              <XCircleIcon className="w-5 h-5 mr-2 text-red-500 flex-shrink-0" />
              {managerPasswordChangeError}
            </div>
          )}
          {managerPasswordChangeSuccess && (
            <div className="flex items-center p-3 text-sm text-green-700 bg-green-100 rounded-md border border-green-300">
              <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" />
              {managerPasswordChangeSuccess}
            </div>
          )}
          <button
            onClick={handleManagerPasswordChange}
            disabled={isPasswordChangeLoading || generalOperationIsLoading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition-colors flex items-center disabled:opacity-50"
          >
            {isPasswordChangeLoading ? <LoadingIcon className="text-white mr-2" size={20} /> : <SaveIcon className="w-5 h-5 mr-2" />}
            Yönetici Şifresini Değiştir
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center mb-6">
          <TrashIcon className="w-8 h-8 text-red-600 mr-3" />
          <h2 className="text-2xl font-semibold text-slate-700">Uygulama Ayarları</h2>
        </div>
        <div className="flex flex-col items-start space-y-3">
            <p className="text-sm text-slate-600">
                Bu işlem, tüm mağaza gönderilerini, kullanıcı rollerini, yönetici seçimlerini, Bölge Müdürü şifresini ve tanımlı ekipman listesini geri alınamaz bir şekilde sıfırlayacaktır. 
                Ekipman listesi ve Bölge Müdürü şifresi, uygulamanın başlangıçtaki varsayılan değerlerine dönecektir. Lütfen dikkatli olun.
            </p>
            <button
            onClick={openResetConfirmModal}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md transition-colors flex items-center disabled:opacity-60"
            disabled={generalOperationIsLoading || isPasswordChangeLoading}
            >
             {generalOperationIsLoading ? <LoadingIcon className="text-white mr-2" size={20}/> : <TrashIcon className="w-5 h-5 mr-2" />}
             Tüm Uygulama Verilerini Sıfırla
            </button>
        </div>
      </div>

      <Modal isOpen={isAddEquipmentModalOpen} onClose={() => setIsAddEquipmentModalOpen(false)} title="Yeni Ekipman Ekle">
        <div className="space-y-4">
          <div>
            <label htmlFor="newEqName" className="block text-sm font-medium text-slate-700">Ekipman Adı</label>
            <input type="text" id="newEqName" value={newEquipmentData.name} onChange={(e) => setNewEquipmentData({...newEquipmentData, name: e.target.value})}
                   className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Referans Görsel</label>
            <ImageUploader 
              uploaderId="refImageUploadNew"
              onImageUpload={(_file, base64Image) => setNewEquipmentData({...newEquipmentData, referenceImageUrl: base64Image})}
              onImageRemove={() => setNewEquipmentData({...newEquipmentData, referenceImageUrl: ''})}
              existingImageUrl={newEquipmentData.referenceImageUrl}
              buttonText="Referans Görseli Yükle"
              parentIsLoading={isLoading} // Added parentIsLoading
            />
          </div>
          <div>
            <label htmlFor="newEqDesc" className="block text-sm font-medium text-slate-700">Açıklama</label>
            <textarea id="newEqDesc" value={newEquipmentData.description} onChange={(e) => setNewEquipmentData({...newEquipmentData, description: e.target.value})} rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
          </div>
          {equipmentFormError && <p className="text-sm text-red-600">{equipmentFormError}</p>}
          <div className="flex justify-end space-x-3 pt-2">
            <button onClick={() => setIsAddEquipmentModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md">İptal</button>
            <button onClick={handleAddEquipment} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-md flex items-center disabled:opacity-50">
                {isLoading ? <LoadingIcon className="text-white mr-1.5" size={18}/> : <SaveIcon className="w-4 h-4 mr-1.5"/>} Ekle
            </button>
          </div>
        </div>
      </Modal>

      {editingEquipment && (
        <Modal isOpen={isEditEquipmentModalOpen} onClose={() => setIsEditEquipmentModalOpen(false)} title={`Ekipmanı Düzenle: ${editingEquipment.name}`}>
          <div className="space-y-4">
            <div>
              <label htmlFor="editEqName" className="block text-sm font-medium text-slate-700">Ekipman Adı</label>
              <input type="text" id="editEqName" value={editingEquipment.name} onChange={(e) => setEditingEquipment(prev => prev ? {...prev, name: e.target.value} : null)}
                     className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Referans Görsel</label>
              <ImageUploader 
                uploaderId="refImageUploadEdit"
                onImageUpload={(_file, base64Image) => setEditingEquipment(prev => prev ? {...prev, referenceImageUrl: base64Image} : null)}
                onImageRemove={() => setEditingEquipment(prev => prev ? {...prev, referenceImageUrl: ''} : null)}
                existingImageUrl={editingEquipment.referenceImageUrl}
                buttonText="Yeni Referans Görsel Yükle"
                parentIsLoading={isLoading} // Added parentIsLoading
              />
            </div>
            <div>
              <label htmlFor="editEqDesc" className="block text-sm font-medium text-slate-700">Açıklama</label>
              <textarea id="editEqDesc" value={editingEquipment.description} onChange={(e) => setEditingEquipment(prev => prev ? {...prev, description: e.target.value} : null)} rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
            </div>
            {equipmentFormError && <p className="text-sm text-red-600">{equipmentFormError}</p>}
            <div className="flex justify-end space-x-3 pt-2">
              <button onClick={() => setIsEditEquipmentModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md">İptal</button>
              <button onClick={handleUpdateEquipment} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md flex items-center disabled:opacity-50">
                 {isLoading ? <LoadingIcon className="text-white mr-1.5" size={18}/> : <SaveIcon className="w-4 h-4 mr-1.5"/>} Kaydet
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Modal isOpen={isDeleteConfirmModalOpen} onClose={() => setIsDeleteConfirmModalOpen(false)} title="Ekipmanı Sil?" size="sm">
        <p className="text-slate-600 mb-6">"{equipmentList.find(eq => eq.id === deletingEquipmentId)?.name}" adlı ekipmanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve bu ekipmanla ilişkili tüm gönderiler de silinecektir.</p>
        <div className="flex justify-end space-x-3">
          <button onClick={() => setIsDeleteConfirmModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md">İptal</button>
          <button onClick={handleDeleteEquipment} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center disabled:opacity-50">
            {isLoading ? <LoadingIcon className="text-white mr-1.5" size={18}/> : <TrashIcon className="w-4 h-4 mr-1.5"/>} Evet, Sil
          </button>
        </div>
      </Modal>
      
      <Modal isOpen={isResetConfirmModalOpen} onClose={() => setIsResetConfirmModalOpen(false)} title="Tüm Verileri Sıfırla?" size="md">
        <div className="text-center">
            <InfoIcon className="w-16 h-16 text-red-500 mx-auto mb-4"/>
            <p className="text-lg font-semibold text-slate-700 mb-2">Emin misiniz?</p>
            <p className="text-slate-600 mb-6">
                Bu işlem tüm mağaza gönderilerini, kullanıcı oturumlarını, Bölge Müdürü şifresini ve ekipman listesini varsayılan ayarlara döndürecektir. 
                Bu işlem geri alınamaz.
            </p>
        </div>
        <div className="flex justify-center space-x-4">
          <button onClick={() => setIsResetConfirmModalOpen(false)} className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg">Hayır, İptal Et</button>
          <button 
            onClick={handleResetAllData} 
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? <LoadingIcon className="text-white mr-2" size={18}/> : <TrashIcon className="w-4 h-4 mr-1.5" />}
            Evet, Tüm Verileri Sıfırla
          </button>
        </div>
      </Modal>

      {lightboxImageUrl && (
        <Lightbox 
          imageUrl={lightboxImageUrl} 
          altText={lightboxAltText}
          isOpen={!!lightboxImageUrl} 
          onClose={closeLightbox} 
        />
      )}
    </div>
  );
};