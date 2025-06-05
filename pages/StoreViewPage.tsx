
import React, { useState, useCallback } from 'react';
import { useData } from '../contexts/DataContext.tsx';
import { ImageUploader } from '../components/ImageUploader.tsx';
import { Equipment, Submission } from '../types.ts';
import { Modal } from '../components/Modal.tsx';
import { LoadingIcon } from '../components/LoadingIcon.tsx';
import { CheckCircleIcon, XCircleIcon, EyeIcon, UploadCloudIcon, InfoIcon, ThumbsUpIcon, ThumbsDownIcon } from '../components/IconComponents.tsx'; 
import { Lightbox } from '../components/Lightbox.tsx'; 

const EquipmentCard: React.FC<{ 
  equipment: Equipment; 
  storeName: string;
  openLightbox: (url: string, alt: string) => void; 
}> = ({ equipment, storeName, openLightbox }) => {
  const { getSubmission, addSubmission } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  
  const submission = getSubmission(storeName, equipment.id);

  const handleImageUpload = async (file: File, base64Image: string) => {
    console.log(`[EquipmentCard] handleImageUpload called for Store: "${storeName}", Equipment ID: "${equipment.id}", Equipment Name: "${equipment.name}"`);
    setIsLoading(true);
    // Simulate network delay for a better UX understanding of loading state
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    addSubmission(storeName, equipment.id, base64Image, file.name);
    setIsLoading(false);
  };

  const handleImageRemove = () => {
    console.log(`[EquipmentCard] handleImageRemove called for Store: "${storeName}", Equipment ID: "${equipment.id}"`);
    // Potentially add a confirmation dialog here if needed
    addSubmission(storeName, equipment.id, null, undefined);
  };
  
  const getStatusBadge = () => {
    if (!submission || !submission.uploadedImageUrl) return null; 

    const totalReviews = submission.reviews.length;
    const approvals = submission.reviews.filter(r => r.isCorrect).length;
    const rejections = submission.reviews.filter(r => !r.isCorrect).length;

    let bgColor = 'bg-yellow-100 text-yellow-800';
    let text = `Beklemede (${totalReviews} değerlendirme)`;
    let icon = <InfoIcon className="w-4 h-4 mr-1 text-yellow-600"/>;

    if (submission.status === 'approved') {
      bgColor = 'bg-green-100 text-green-800';
      text = `Onaylandı (${approvals} OLUMLU)`;
      icon = <CheckCircleIcon className="w-4 h-4 mr-1 text-green-600"/>;
    } else if (submission.status === 'rejected') {
      bgColor = 'bg-red-100 text-red-800';
      text = `Reddedildi (${rejections} OLUMSUZ)`;
      icon = <XCircleIcon className="w-4 h-4 mr-1 text-red-600"/>; 
    } else if ((submission.status === 'pending' || submission.status === 'partial_review') && totalReviews > 0) { 
      bgColor = 'bg-sky-100 text-sky-800';
      text = `İnceleniyor (${approvals} Olumlu, ${rejections} Olumsuz)`;
      icon = <InfoIcon className="w-4 h-4 mr-1 text-sky-600"/>;
    }

    return (
      <div className={`mt-3 p-2 rounded-md text-xs font-medium flex items-center justify-center ${bgColor}`}>
        {icon} {text}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="p-5">
        <h3 className="text-xl font-semibold text-teal-700 mb-2">{equipment.name}</h3>
        <p className="text-sm text-slate-600 mb-3 h-10 overflow-y-auto">{equipment.description}</p>
        
        <div className="flex justify-center mb-3">
            <button 
                onClick={() => openLightbox(equipment.referenceImageUrl, `${equipment.name} Referans Görseli`)}
                className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center underline"
            >
                <EyeIcon className="w-4 h-4 mr-1" /> Referans Görseli Görüntüle (Tam Ekran)
            </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40">
            <LoadingIcon size={32} className="text-teal-500" />
            <p className="text-slate-500 mt-2">Görsel işleniyor...</p>
          </div>
        ) : (
          <ImageUploader 
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove} 
            existingImageUrl={submission?.uploadedImageUrl}
            buttonText="Uygulama Görselini Yükle"
            uploaderId={`imageUploadInput-${equipment.id}`} 
          />
        )}
        
        {submission?.uploadedImageUrl && (
          <div className="mt-3 space-y-2">
            <button 
                onClick={() => openLightbox(submission.uploadedImageUrl!, `Yüklenen Görsel - ${equipment.name}`)}
                className="w-full text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center justify-center underline py-1"
            >
                <EyeIcon className="w-4 h-4 mr-1" /> Yüklenen Görseli Görüntüle (Tam Ekran)
            </button>
            { (submission.status === 'rejected' || (submission.reviews && submission.reviews.some(r => !r.isCorrect))) && (
               <button 
                onClick={() => setIsNotesModalOpen(true)}
                className="w-full text-sm text-red-600 hover:text-red-800 font-medium flex items-center justify-center underline py-1"
              >
                <InfoIcon className="w-4 h-4 mr-1" /> Değerlendirme Notlarını Gör
              </button>
            )}
          </div>
        )}
        {getStatusBadge()}
      </div>

       {submission && (
        <Modal isOpen={isNotesModalOpen} onClose={() => setIsNotesModalOpen(false)} title="Değerlendirme Notları">
            {submission.reviews.length > 0 ? (
                <ul className="space-y-3 max-h-80 overflow-y-auto">
                    {submission.reviews.map(review => (
                        <li key={review.id} className={`p-3 rounded-md ${review.isCorrect ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-sm text-slate-700">{review.managerName}</span>
                                {review.isCorrect ? 
                                    <span className="text-xs font-medium text-green-600 px-2 py-0.5 rounded-full bg-green-100 flex items-center"><ThumbsUpIcon className="w-3 h-3 mr-1"/> Uygun</span> : 
                                    <span className="text-xs font-medium text-red-600 px-2 py-0.5 rounded-full bg-red-100 flex items-center"><ThumbsDownIcon className="w-3 h-3 mr-1"/> Uygun Değil</span>
                                }
                            </div>
                            {review.notes && <p className="text-sm text-slate-600 mt-1">{review.notes}</p>}
                            <p className="text-xs text-slate-400 mt-1">{new Date(review.timestamp).toLocaleString('tr-TR')}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-slate-500 text-center">Henüz değerlendirme notu bulunmamaktadır.</p>
            )}
        </Modal>
       )}
    </div>
  );
};

export const StoreViewPage: React.FC = () => {
  const { equipmentList, selectedStoreId } = useData(); 
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxAltText, setLightboxAltText] = useState<string>('');

  const openLightbox = (url: string, alt: string) => {
    setLightboxImageUrl(url);
    setLightboxAltText(alt);
  };

  const closeLightbox = () => {
    setLightboxImageUrl(null);
    setLightboxAltText('');
  };

  if (!selectedStoreId) {
    return <div className="text-center text-red-500 p-8">Mağaza bilgisi bulunamadı. Lütfen rol seçim sayfasına geri dönün.</div>;
  }
  const currentStoreName = selectedStoreId;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-teal-700 mb-2">Mağaza Paneli: {currentStoreName}</h1>
        <p className="text-slate-600">Bu sayfada mağazanız için tanımlı görsel düzenleme alanlarını görebilir, ilgili görselleri yükleyebilir ve değerlendirme durumlarını takip edebilirsiniz.</p>
      </div>
      
      {equipmentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipmentList.map(equipment => (
            <EquipmentCard 
              key={equipment.id} 
              equipment={equipment} 
              storeName={currentStoreName} 
              openLightbox={openLightbox}
            />
          ))}
        </div>
      ) : (
         <div className="text-center py-12 bg-white rounded-xl shadow-lg p-6">
            <UploadCloudIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-xl text-slate-500">Henüz tanımlı bir ekipman veya görsel alanı bulunmamaktadır.</p>
            <p className="text-sm text-slate-400 mt-2">Lütfen sistem yöneticinizle iletişime geçin.</p>
        </div>
      )}
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
