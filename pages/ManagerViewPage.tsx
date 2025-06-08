
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext.tsx';
import { Submission, Review, Store, Equipment, StoreType } from '../types.ts'; // Added StoreType
import { Modal } from '../components/Modal.tsx';
import { LoadingIcon } from '../components/LoadingIcon.tsx';
import { 
  EyeIcon, InfoIcon, EditIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, XCircleIcon,
  ChartBarIcon, DocumentTextIcon, ClockIcon, DownloadIcon 
} from '../components/IconComponents.tsx';
import { Lightbox } from '../components/Lightbox.tsx'; 

interface ReviewFormProps {
  submission: Submission;
  onReviewSubmit: (isCorrect: boolean, notes: string) => void;
  existingReview?: Review;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ submission, onReviewSubmit, existingReview }) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(existingReview ? existingReview.isCorrect : null);
  const [notes, setNotes] = useState(existingReview ? existingReview.notes : '');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (isCorrect === null) {
      setError('Lütfen "Uygun" veya "Uygun Değil" seçeneklerinden birini işaretleyin.');
      return;
    }
    if (!isCorrect && !notes.trim()) {
      setError('Uygun değilse, lütfen not alanını doldurun.');
      return;
    }
    setError('');
    onReviewSubmit(isCorrect, notes.trim());
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Bu görsel yerleşimi referansa uygun mu?</p>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsCorrect(true)}
            className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium w-full transition-colors ${
              isCorrect === true ? 'bg-green-500 text-white ring-2 ring-green-300' : 'bg-slate-100 hover:bg-green-100 text-slate-700'
            }`}
          >
            <CheckCircleIcon className="w-5 h-5 mr-2" /> Evet, Uygun
          </button>
          <button
            onClick={() => setIsCorrect(false)}
            className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium w-full transition-colors ${
              isCorrect === false ? 'bg-red-500 text-white ring-2 ring-red-300' : 'bg-slate-100 hover:bg-red-100 text-slate-700'
            }`}
          >
            <XCircleIcon className="w-5 h-5 mr-2" /> Hayır, Uygun Değil
          </button>
        </div>
      </div>
      {(isCorrect === false || (existingReview && !existingReview.isCorrect)) && (
         <div>
          <label htmlFor="reviewNotes" className="block text-sm font-medium text-slate-700 mb-1">
            Açıklamalar / Eksiklikler (Zorunlu):
          </label>
          <textarea
            id="reviewNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
            placeholder="Lütfen tespit ettiğiniz eksiklikleri veya sebepleri detaylıca açıklayın..."
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handleSubmit}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-colors"
      >
        {existingReview ? 'Değerlendirmeyi Güncelle' : 'Değerlendirmeyi Gönder'}
      </button>
    </div>
  );
};

const SubmissionCard: React.FC<{
  submission: Submission; 
  equipment: Equipment | undefined;
  openLightbox: (url: string, alt: string) => void;
}> = ({ submission, equipment, openLightbox }) => {
  const { addReviewToSubmission, selectedManagerPersona } = useData();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isImageDetailModalOpen, setIsImageDetailModalOpen] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const displayName = submission.storeType 
    ? `${submission.storeId} (${submission.storeType})` 
    : submission.storeId;

  if (!equipment || !selectedManagerPersona) return null;

  const managerHasReviewed = submission.reviews.some(r => r.managerId === selectedManagerPersona.id);
  const ownReview = submission.reviews.find(r => r.managerId === selectedManagerPersona.id);

  const handleReviewSubmit = async (isCorrect: boolean, notes: string) => {
    setIsLoading(true);
    const review: Review = {
      id: `${submission.id}-${selectedManagerPersona.id}-${new Date().getTime()}`, 
      managerId: selectedManagerPersona.id,
      managerName: selectedManagerPersona.name,
      isCorrect,
      notes,
      timestamp: new Date().toISOString(),
    };
    await new Promise(resolve => setTimeout(resolve, 700)); 
    addReviewToSubmission(submission.id, review);
    setIsLoading(false);
    setIsReviewModalOpen(false);
  };
  
  const approvalCount = submission.reviews.filter(r => r.isCorrect).length;
  const rejectionCount = submission.reviews.filter(r => !r.isCorrect).length;

  let statusText = "Beklemede";
  let statusColor = "text-yellow-700 bg-yellow-100";
  if (submission.status === 'approved') {
      statusText = "Onaylandı";
      statusColor = "text-green-700 bg-green-100";
  } else if (submission.status === 'rejected') {
      statusText = "Reddedildi";
      statusColor = "text-red-700 bg-red-100";
  } else if (submission.status === 'partial_review' || (submission.status === 'pending' && submission.reviews.length > 0)) {
      statusText = "Kısmi İnceleme";
      statusColor = "text-sky-700 bg-sky-100";
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
          <div>
            <h3 className="text-lg font-semibold text-teal-700">{displayName}</h3>
            <p className="text-sm text-slate-500">{equipment.name}</p>
          </div>
          <div className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {statusText} ({approvalCount} <CheckCircleIcon className="inline w-3 h-3 text-green-600"/>, {rejectionCount} <XCircleIcon className="inline w-3 h-3 text-red-600"/>)
          </div>
        </div>

        <div className="flex justify-around items-center my-4 space-x-2">
            <button onClick={() => setIsImageDetailModalOpen(true)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors">
                <EyeIcon className="w-4 h-4 mr-1.5"/> Görsel Önizlemeleri
            </button>
            <button 
                onClick={() => setIsReviewModalOpen(true)} 
                disabled={isLoading}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors ${
                    ownReview ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-teal-500 hover:bg-teal-600 text-white'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isLoading ? <LoadingIcon size={16} className="text-white mr-1.5"/> : <EditIcon className="w-4 h-4 mr-1.5"/>}
                {ownReview ? 'Değerlendirmemi Düzenle' : 'Değerlendir'}
            </button>
        </div>
        
        <div className="border-t border-slate-200 pt-3">
            <button 
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                className="w-full flex justify-between items-center text-left text-sm font-medium text-slate-600 hover:text-teal-700 py-2"
            >
                <span>Tüm Değerlendirmeler ({submission.reviews.length})</span>
                {isAccordionOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
            </button>
            {isAccordionOpen && (
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2">
                    {submission.reviews.length > 0 ? submission.reviews.map(review => (
                        <div key={review.id} className={`p-2.5 rounded-md text-xs ${review.isCorrect ? 'bg-green-50 border-l-2 border-green-400' : 'bg-red-50 border-l-2 border-red-400'}`}>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-slate-700">{review.managerName}</span>
                                {review.isCorrect ? <CheckCircleIcon className="w-4 h-4 text-green-500"/> : <XCircleIcon className="w-4 h-4 text-red-500"/>}
                            </div>
                            {review.notes && <p className="text-slate-600 mt-0.5">{review.notes}</p>}
                            <p className="text-slate-400 text-[10px] mt-0.5">{new Date(review.timestamp).toLocaleDateString('tr-TR')}</p>
                        </div>
                    )) : <p className="text-xs text-slate-500 text-center py-2">Henüz değerlendirme yapılmamış.</p>}
                </div>
            )}
        </div>
      </div>

      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title={`Değerlendirme: ${equipment.name} (${displayName})`}>
        {isLoading ? <div className="flex justify-center items-center h-32"><LoadingIcon size={32} className="text-teal-500"/></div> : 
        <ReviewForm submission={submission} onReviewSubmit={handleReviewSubmit} existingReview={ownReview} />}
      </Modal>
      
      <Modal isOpen={isImageDetailModalOpen} onClose={() => setIsImageDetailModalOpen(false)} title="Görsel Karşılaştırma (Önizleme)" size="5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="font-semibold text-teal-700 mb-2 text-center">Referans Görsel ({equipment.name})</h4>
                {equipment.referenceImageUrl ? (
                    <div className="overflow-auto max-h-[70vh] rounded-lg bg-slate-50 p-2">
                        <img 
                            src={equipment.referenceImageUrl} 
                            alt="Referans" 
                            className="block w-full h-auto object-contain rounded-md shadow-md cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openLightbox(equipment.referenceImageUrl, `Referans: ${equipment.name}`)}
                        />
                         <p className="text-xs text-slate-400 mt-1 text-center">(Tam ekran görmek için görsele tıklayın)</p>
                    </div>
                ) : (
                    <div className="h-96 flex items-center justify-center bg-slate-100 rounded-md">
                        <p className="text-slate-500">Referans görsel bulunmamaktadır.</p>
                    </div>
                )}
            </div>
            <div>
                <h4 className="font-semibold text-teal-700 mb-2 text-center">Yüklenen Mağaza Görseli ({displayName})</h4>
                {submission.uploadedImageUrl ? (
                    <div className="overflow-auto max-h-[70vh] rounded-lg bg-slate-50 p-2">
                        <img 
                            src={submission.uploadedImageUrl} 
                            alt="Yüklenen" 
                            className="block w-full h-auto object-contain rounded-md shadow-md cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openLightbox(submission.uploadedImageUrl!, `Yüklenen: ${displayName} - ${equipment.name}`)}
                         />
                         <p className="text-xs text-slate-400 mt-1 text-center">(Tam ekran görmek için görsele tıklayın)</p>
                    </div>
                ) : (
                    <div className="h-96 flex items-center justify-center bg-slate-100 rounded-md">
                        <p className="text-slate-500">Görsel yüklenmemiş.</p>
                    </div>
                )}
            </div>
        </div>
        {submission.uploadedImageFileName && <p className="text-xs text-slate-500 mt-3 text-center">Yüklenen Dosya: {submission.uploadedImageFileName}</p>}
      </Modal>
    </div>
  );
};


interface ManagerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: Submission[];
  managerId: string;
  equipmentList: Equipment[];
}

const ManagerDashboardModal: React.FC<ManagerDashboardModalProps> = ({ isOpen, onClose, submissions, managerId, equipmentList }) => {
  if (!isOpen) return null;

  const dashboardStats = useMemo(() => {
    const activeSubmissions = submissions.filter(sub => sub.uploadedImageUrl);
    const uniqueStoreEntries = Array.from(
      new Set(activeSubmissions.map(sub => `${sub.storeId}###${sub.storeType || 'N/A'}`))
    ).map(entry => {
        const [storeName, storeType] = entry.split('###');
        return { storeName, storeType: storeType === 'N/A' ? undefined : storeType as StoreType };
    });


    const stats = uniqueStoreEntries.map(storeEntry => {
      const storeSubmissions = activeSubmissions.filter(sub => sub.storeId === storeEntry.storeName && sub.storeType === storeEntry.storeType);
      const totalSubmissionsCount = storeSubmissions.length;
      const reviewedByMeCount = storeSubmissions.filter(sub => sub.reviews.some(r => r.managerId === managerId)).length;
      const pendingMyReviewCount = totalSubmissionsCount - reviewedByMeCount;
      const overallApprovedCount = storeSubmissions.filter(sub => sub.status === 'approved').length;
      const overallRejectedCount = storeSubmissions.filter(sub => sub.status === 'rejected').length;
      const overallOtherCount = totalSubmissionsCount - overallApprovedCount - overallRejectedCount;
      
      const approvalRate = totalSubmissionsCount > 0 ? (overallApprovedCount / totalSubmissionsCount) : 0;

      return {
        storeName: storeEntry.storeName,
        storeType: storeEntry.storeType,
        totalSubmissionsCount,
        reviewedByMeCount,
        pendingMyReviewCount,
        overallApprovedCount,
        overallRejectedCount,
        overallOtherCount,
        approvalRate,
      };
    });

    return stats.sort((a, b) => {
      if (b.approvalRate !== a.approvalRate) {
        return b.approvalRate - a.approvalRate;
      }
      if (b.totalSubmissionsCount !== a.totalSubmissionsCount) {
        return b.totalSubmissionsCount - a.totalSubmissionsCount;
      }
      return a.storeName.localeCompare(b.storeName, 'tr');
    });

  }, [submissions, managerId]);

  const handleExportToExcel = () => {
    if (!window.XLSX) {
      alert("Excel dışa aktarma kütüphanesi yüklenemedi. Lütfen sayfayı yenileyin veya internet bağlantınızı kontrol edin.");
      return;
    }
    const XLSX = window.XLSX;

    // Sayfa 1: Değerlendirme Paneli
    const panelHeaders = ["Mağaza Adı", "Mağaza Tipi", "Toplam Yükleme", "BM Değerlendirme", "BM Bekleyen", "Genel Onay", "Genel Red", "Genel Diğer"];
    const panelData = dashboardStats.map(stat => [
      stat.storeName,
      stat.storeType || 'Belirtilmemiş',
      stat.totalSubmissionsCount,
      stat.reviewedByMeCount,
      stat.pendingMyReviewCount,
      stat.overallApprovedCount,
      stat.overallRejectedCount,
      stat.overallOtherCount,
    ]);
    const wsPanel = XLSX.utils.aoa_to_sheet([panelHeaders, ...panelData]);

    // Sayfa 2: Olumsuz Değerlendirmeler
    const olumsuzHeaders = ["Mağaza Adı", "Mağaza Tipi", "Ekipman Adı", "Ekipman Açıklaması", "Değerlendiren Yetkili", "Değerlendirme Notu", "Değerlendirme Tarihi"];
    const olumsuzData: (string | number)[][] = [];
    submissions.forEach(sub => {
      if (sub.uploadedImageUrl) {
        sub.reviews.forEach(review => {
          if (!review.isCorrect) {
            const equipment = equipmentList.find(eq => eq.id === sub.equipmentId);
            olumsuzData.push([
              sub.storeId,
              sub.storeType || 'Belirtilmemiş',
              equipment?.name || 'Bilinmeyen Ekipman',
              equipment?.description || 'Açıklama Yok',
              review.managerName,
              review.notes,
              new Date(review.timestamp).toLocaleString('tr-TR'),
            ]);
          }
        });
      }
    });
    const wsOlumsuz = XLSX.utils.aoa_to_sheet([olumsuzHeaders, ...olumsuzData]);
    
    const fitCols = (ws: any) => {
        const objectMaxLength: number[] = [];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        (data as any[][]).forEach((row) => {
            (row as any[]).forEach((cell, colIndex) => { // Ensure cell is treated as any for string conversion
                objectMaxLength[colIndex] = Math.max(objectMaxLength[colIndex] || 0, String(cell == null ? "" : cell).length + 2);
            });
        });
        ws['!cols'] = objectMaxLength.map(w => ({ width: w }));
    };

    fitCols(wsPanel);
    fitCols(wsOlumsuz);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsPanel, "Değerlendirme Paneli");
    XLSX.utils.book_append_sheet(wb, wsOlumsuz, "Olumsuz Değerlendirmeler");

    XLSX.writeFile(wb, "Watsons_Degerlendirme_Raporu.xlsx");
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mağaza Değerlendirme Paneli" size="5xl">
      <div className="mb-4 flex justify-end">
          <button
            onClick={handleExportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center text-sm"
            aria-label="Verileri Excel'e Aktar"
          >
            <DownloadIcon className="w-5 h-5 mr-2" /> Excel'e Aktar
          </button>
        </div>
      <div className="max-h-[calc(70vh-60px)] overflow-y-auto"> 
        {dashboardStats.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Görüntülenecek mağaza veya yükleme bulunmamaktadır.</p>
        ) : (
          <div className="overflow-x-auto p-1">
            <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg shadow-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mağaza Adı</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mağaza Tipi</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Toplam Yükleme</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">BM Değerlendirme</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">BM Bekleyen</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Genel Onay</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Genel Red</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Genel Diğer</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {dashboardStats.map(stats => (
                  <tr key={`${stats.storeName}-${stats.storeType || 'untyped'}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-teal-700">{stats.storeName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{stats.storeType || 'Belirtilmemiş'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 text-center">
                      <div className="flex items-center justify-center">
                        <DocumentTextIcon className="w-4 h-4 mr-1.5 text-slate-400" /> {stats.totalSubmissionsCount}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 text-center">
                       <div className="flex items-center justify-center">
                        <EditIcon className="w-4 h-4 mr-1.5 text-blue-500" /> {stats.reviewedByMeCount}
                       </div>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-center font-semibold ${stats.pendingMyReviewCount > 0 ? 'text-orange-600' : 'text-slate-600'}`}>
                      <div className="flex items-center justify-center">
                        <ClockIcon className={`w-4 h-4 mr-1.5 ${stats.pendingMyReviewCount > 0 ? 'text-orange-500' : 'text-slate-400'}`} /> {stats.pendingMyReviewCount}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 text-center">
                      <div className="flex items-center justify-center">
                        <CheckCircleIcon className="w-4 h-4 mr-1.5 text-green-500" /> {stats.overallApprovedCount}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 text-center">
                       <div className="flex items-center justify-center">
                        <XCircleIcon className="w-4 h-4 mr-1.5 text-red-500" /> {stats.overallRejectedCount}
                       </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 text-center">
                       <div className="flex items-center justify-center">
                        <InfoIcon className="w-4 h-4 mr-1.5 text-yellow-500" /> {stats.overallOtherCount}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
};


export const ManagerViewPage: React.FC = () => {
  const { stores, submissions, equipmentList, selectedManagerPersona } = useData();
  const [filterStoreName, setFilterStoreName] = useState<string>(''); 
  const [filterStatus, setFilterStatus] = useState<string>(''); 
  
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxAltText, setLightboxAltText] = useState<string>('');
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);


  const openLightbox = (url: string, alt: string) => {
    setLightboxImageUrl(url);
    setLightboxAltText(alt);
  };

  const closeLightbox = () => {
    setLightboxImageUrl(null);
    setLightboxAltText('');
  };

  const submittedStoreNames = useMemo(() => {
    const storeNames = new Set<string>();
    submissions.forEach(sub => {
        if(sub.storeId && sub.uploadedImageUrl) { 
            storeNames.add(sub.storeId);
        }
    });
    return Array.from(storeNames).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter(sub => sub.uploadedImageUrl) 
      .filter(sub => !filterStoreName || sub.storeId === filterStoreName) 
      .filter(sub => !filterStatus || sub.status === filterStatus)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [submissions, filterStoreName, filterStatus]);

  if (!selectedManagerPersona) {
    return <div className="text-center text-red-500 p-8">Yönetici bilgisi bulunamadı. Lütfen rol seçim sayfasına geri dönün.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-teal-700 mb-2">Yönetici Paneli: {selectedManagerPersona.name}</h1>
            <p className="text-slate-600">Bu sayfada mağazalardan gelen görsel yüklemelerini inceleyebilir, değerlendirebilir ve genel durumu takip edebilirsiniz.</p>
          </div>
          <button
            onClick={() => setIsDashboardModalOpen(true)}
            className="mt-4 sm:mt-0 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition-colors flex items-center self-start sm:self-center"
          >
            <ChartBarIcon className="w-5 h-5 mr-2" /> Değerlendirme Paneli
          </button>
        </div>
      
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
                <label htmlFor="storeFilter" className="block text-sm font-medium text-slate-700 mb-1">Mağazaya Göre Filtrele:</label>
                <select 
                    id="storeFilter"
                    value={filterStoreName}
                    onChange={(e) => setFilterStoreName(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm appearance-none"
                >
                    <option value="">Tüm Mağazalar</option>
                    {submittedStoreNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
                 <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 mt-3 pointer-events-none" />
            </div>
            <div className="relative">
                <label htmlFor="statusFilter" className="block text-sm font-medium text-slate-700 mb-1">Duruma Göre Filtrele:</label>
                <select 
                    id="statusFilter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm appearance-none"
                >
                    <option value="">Tüm Durumlar</option>
                    <option value="pending">Beklemede</option>
                    <option value="approved">Onaylandı</option>
                    <option value="rejected">Reddedildi</option>
                    <option value="partial_review">Kısmi İnceleme</option>
                </select>
                 <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 mt-3 pointer-events-none" />
            </div>
        </div>
      </div>

      {filteredSubmissions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSubmissions.map(submission => {
            const equipment = equipmentList.find(e => e.id === submission.equipmentId);
            return (
              <SubmissionCard 
                key={submission.id} 
                submission={submission} 
                equipment={equipment} 
                openLightbox={openLightbox}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg p-6">
            <InfoIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-xl text-slate-500">Filtrelerinize uygun bir yükleme bulunamadı.</p>
            <p className="text-sm text-slate-400 mt-2">Farklı filtreler deneyebilir veya tüm yüklemeleri bekleyebilirsiniz.</p>
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
      <ManagerDashboardModal
        isOpen={isDashboardModalOpen}
        onClose={() => setIsDashboardModalOpen(false)}
        submissions={submissions}
        managerId={selectedManagerPersona.id}
        equipmentList={equipmentList} 
      />
    </div>
  );
};
