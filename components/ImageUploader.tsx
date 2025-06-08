import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { CameraIcon, UploadCloudIcon, XIcon, PhotoIcon } from './IconComponents.tsx'; // PhotoIcon for gallery

interface ImageUploaderProps {
  onImageUpload: (file: File, base64Image: string) => void;
  onImageRemove?: () => void;
  existingImageUrl?: string | null;
  buttonText?: string;
  uploaderId: string;
  onUploadError?: (error: Error | ProgressEvent<FileReader> | string) => void;
  parentIsLoading?: boolean; // To disable uploader actions while parent is processing
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  onImageRemove, 
  existingImageUrl, 
  buttonText = "Görsel Yükle", 
  uploaderId, 
  onUploadError,
  parentIsLoading = false
}) => {
  const [preview, setPreview] = useState<string | null>(existingImageUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [internalIsLoading, setInternalIsLoading] = useState(false); // For FileReader
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSourceChoiceOpen, setIsSourceChoiceOpen] = useState(false);

  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedBase64Image, setStagedBase64Image] = useState<string | null>(null);

  useEffect(() => {
    setPreview(existingImageUrl || null);
    if (existingImageUrl) { // If an existing image is set, clear any staged file
      setStagedFile(null);
      setStagedBase64Image(null);
      setFileName(null);
    }
    if (!existingImageUrl && fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input if existingImageUrl is removed
    }
  }, [existingImageUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log(`[ImageUploader] File selected: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      setInternalIsLoading(true);
      setStagedFile(null); // Clear previous staged file
      setStagedBase64Image(null);
      if (onUploadError) {
        // Clear previous uploader-specific error if a new file is chosen
      }


      const reader = new FileReader();
      reader.onloadstart = () => console.log("[ImageUploader] File reading started.");
      reader.onloadend = () => {
        console.log("[ImageUploader] File reading ended.");
        setInternalIsLoading(false);
        try {
          if (reader.error) {
            console.error("[ImageUploader] FileReader error property set:", reader.error);
            if (onUploadError) onUploadError(reader.error);
            setPreview(existingImageUrl || null); // Revert to existing or clear
            setFileName(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }
          const base64String = reader.result as string;
          if (!base64String) {
            console.error("[ImageUploader] FileReader result is null or empty.");
            if (onUploadError) onUploadError(new Error("FileReader sonucu boş. Dosya bozuk veya çok büyük olabilir."));
            setPreview(existingImageUrl || null);
            setFileName(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }
          setStagedFile(file);
          setStagedBase64Image(base64String);
          setPreview(base64String); // Show preview of the new file
          setFileName(file.name);
          console.log("[ImageUploader] Staged file and preview set. Awaiting 'Upload' button click.");
        } catch (e: any) {
          console.error("[ImageUploader] Error processing FileReader result:", e);
          if (onUploadError) onUploadError(e.message || "Dosya işlenirken bir hata oluştu.");
          setPreview(existingImageUrl || null);
          setFileName(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.onerror = (errorEvent: ProgressEvent<FileReader>) => {
        console.error("[ImageUploader] FileReader onerror event:", errorEvent);
        setInternalIsLoading(false);
        if (onUploadError) onUploadError(errorEvent.type ? `FileReader error: ${errorEvent.type}` : "Dosya okunurken bir hata oluştu.");
        setPreview(existingImageUrl || null);
        setFileName(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      try {
        console.log("[ImageUploader] Calling reader.readAsDataURL().");
        reader.readAsDataURL(file);
      } catch (e: any) {
        console.error("[ImageUploader] Error calling readAsDataURL:", e);
        setInternalIsLoading(false);
        if (onUploadError) onUploadError(e.message || "Dosya okuma başlatılamadı.");
        setPreview(existingImageUrl || null);
        setFileName(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } else {
      console.log("[ImageUploader] No file selected.");
    }
  };

  const handleConfirmUpload = () => {
    if (stagedFile && stagedBase64Image && !parentIsLoading) {
      console.log("[ImageUploader] 'Upload' button clicked. Calling onImageUpload.");
      onImageUpload(stagedFile, stagedBase64Image);
      // Parent component will handle its loading state and eventually update existingImageUrl
      // Effect hook for existingImageUrl will clear stagedFile/stagedBase64Image
    }
  };

  const handleRemoveImage = () => {
    if (parentIsLoading) return;

    if (stagedFile) { // If a new file is staged but not yet "confirmed" for upload
      console.log("[ImageUploader] Removing staged file before 'Upload' confirmation.");
      setStagedFile(null);
      setStagedBase64Image(null);
      setPreview(existingImageUrl || null); // Revert to existing image or clear if none
      setFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (onUploadError){
        // onUploadError(""); // Clear any uploader-specific error if user cancels staging
      }
    } else if (onImageRemove) { // No staged file, so removing an existing/uploaded image
      console.log("[ImageUploader] Removing existing/uploaded image.");
      onImageRemove(); // This will trigger parent to clear existingImageUrl
      // The useEffect for existingImageUrl will then ensure preview is also cleared.
    } else { // Fallback, e.g. onImageRemove not provided but image is shown
      setPreview(null);
      setFileName(null);
       if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = (captureMode?: 'environment') => {
    if (fileInputRef.current && !parentIsLoading && !internalIsLoading) {
      if (captureMode) {
        fileInputRef.current.setAttribute('capture', captureMode);
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
      fileInputRef.current.value = ""; 
      fileInputRef.current.click();
    }
    setIsSourceChoiceOpen(false);
  };

  const handleLabelClick = (event: React.MouseEvent<HTMLLabelElement>) => {
    if (internalIsLoading || parentIsLoading) return;
    event.preventDefault(); 
    setIsSourceChoiceOpen(true);
  };

  const uploaderDisabled = internalIsLoading || parentIsLoading;

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        id={uploaderId}
        disabled={uploaderDisabled}
      />
      {internalIsLoading ? (
        <div className="mt-2 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-teal-400 rounded-lg bg-teal-50">
          <svg className="animate-spin h-10 w-10 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-teal-600 font-semibold mt-2">Görsel okunuyor...</p>
        </div>
      ) : preview ? (
        <div className="mt-2 p-2 border border-gray-300 rounded-lg shadow-sm bg-white relative">
          <img src={preview} alt="Yüklenen/Seçilen görsel" className="max-w-full h-auto max-h-60 object-contain rounded mx-auto" />
          {fileName && <p className="text-xs text-gray-500 mt-1 mb-2 text-center truncate">{fileName}</p>}
          
          {stagedFile && !parentIsLoading && (
            <button
              onClick={handleConfirmUpload}
              disabled={uploaderDisabled}
              className={`w-full mt-2 mb-1 flex items-center justify-center p-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-md shadow-sm transition-colors text-sm font-medium ${uploaderDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <UploadCloudIcon className="w-5 h-5 mr-2"/> Yükle
            </button>
          )}

          <button 
            onClick={handleRemoveImage} 
            className={`absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors ${uploaderDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Görseli kaldır"
            disabled={uploaderDisabled}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <label
            htmlFor={uploaderId}
            onClick={handleLabelClick}
            className={`mt-2 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-teal-400 rounded-lg bg-teal-50 transition-colors ${uploaderDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-teal-100'}`}
            aria-label={buttonText}
          >
            <UploadCloudIcon className="w-12 h-12 text-teal-500 mb-2" />
            <span className="text-teal-600 font-semibold">{buttonText}</span>
            <span className="text-xs text-gray-500">(Veya buraya dokunarak seçin)</span>
            <div className="flex items-center mt-2">
                <CameraIcon className="w-5 h-5 text-teal-500 mr-1" /> 
                <span className="text-xs text-gray-500">/</span>
                <PhotoIcon className="w-5 h-5 text-teal-500 ml-1" />
            </div>
            <span className="text-xs text-gray-500">Fotoğraf çekin veya galeriden seçin</span>
          </label>

          {isSourceChoiceOpen && (
            <div 
                className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out"
                onClick={() => setIsSourceChoiceOpen(false)}
            >
              <div 
                className="bg-white p-5 sm:p-6 rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm transform transition-all duration-300 ease-in-out" 
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-teal-700 mb-4 text-center">Görsel Kaynağı Seçin</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => triggerFileInput('environment')} 
                    className="w-full flex items-center justify-center p-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-md transition-colors text-sm font-medium"
                  >
                    <CameraIcon className="w-5 h-5 mr-2.5"/> Fotoğraf Çek
                  </button>
                  <button 
                    onClick={() => triggerFileInput()} 
                    className="w-full flex items-center justify-center p-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg shadow-md transition-colors text-sm font-medium"
                  >
                    <PhotoIcon className="w-5 h-5 mr-2.5"/> Galeriden Seç
                  </button>
                  <button 
                    onClick={() => setIsSourceChoiceOpen(false)} 
                    className="mt-3 w-full p-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
