
import React, { useState, ChangeEvent, useRef } from 'react';
import { CameraIcon, UploadCloudIcon, XIcon } from './IconComponents.tsx'; // Assuming XIcon is for cancel/remove

interface ImageUploaderProps {
  onImageUpload: (file: File, base64Image: string) => void;
  existingImageUrl?: string | null;
  buttonText?: string;
  uploaderId: string; // Unique ID for the input and label
  onUploadError?: (error: Error | ProgressEvent<FileReader>) => void; // Optional error callback
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, existingImageUrl, buttonText = "Görsel Yükle", uploaderId, onUploadError }) => {
  const [preview, setPreview] = useState<string | null>(existingImageUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Local loading state for file reading
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log(`[ImageUploader] File selected: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      setFileName(file.name);
      setIsLoading(true); // Start loading before file reading

      const reader = new FileReader();

      reader.onloadstart = () => {
        console.log("[ImageUploader] File reading started.");
      };

      reader.onloadend = () => {
        console.log("[ImageUploader] File reading ended.");
        setIsLoading(false); // Stop loading after file reading attempt
        try {
          if (reader.error) { // Check for reader.error specifically in onloadend
            console.error("[ImageUploader] FileReader error property set:", reader.error);
            if (onUploadError) onUploadError(reader.error);
            setPreview(null);
            setFileName(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }
          const base64String = reader.result as string;
          if (!base64String) {
            console.error("[ImageUploader] FileReader result is null or empty after successful read.");
            if (onUploadError) onUploadError(new Error("FileReader result is empty."));
            setPreview(null);
            return;
          }
          setPreview(base64String);
          console.log("[ImageUploader] Preview set. Calling onImageUpload.");
          onImageUpload(file, base64String);
        } catch (e: any) {
          console.error("[ImageUploader] Error processing FileReader result:", e);
          if (onUploadError) onUploadError(e);
          setPreview(null);
          setFileName(null);
           if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };

      reader.onerror = (errorEvent: ProgressEvent<FileReader>) => {
        console.error("[ImageUploader] FileReader onerror event:", errorEvent);
        setIsLoading(false); // Stop loading on error
        if (onUploadError) onUploadError(errorEvent);
        setPreview(null);
        setFileName(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; 
        }
        // Optionally, display an error message to the user here
      };
      
      try {
        console.log("[ImageUploader] Calling reader.readAsDataURL().");
        reader.readAsDataURL(file);
      } catch (e: any) {
        console.error("[ImageUploader] Error calling readAsDataURL:", e);
        setIsLoading(false); // Stop loading on immediate error
        if (onUploadError) onUploadError(e);
        setPreview(null);
        setFileName(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } else {
      console.log("[ImageUploader] No file selected or event.target.files is null.");
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
    // Notify parent that image was removed; using onImageUpload with null might be an option or a dedicated callback
    // For now, this just clears the preview. Parent logic for "removing" an image (e.g. setting URL to null)
    // would typically be handled by re-uploading or a specific "delete" action.
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        capture="environment" 
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        id={uploaderId}
        disabled={isLoading} // Disable input while processing
      />
      {isLoading ? (
        <div className="mt-2 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-teal-400 rounded-lg bg-teal-50">
          <svg className="animate-spin h-10 w-10 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-teal-600 font-semibold mt-2">Görsel işleniyor...</p>
        </div>
      ) : preview ? (
        <div className="mt-2 p-2 border border-gray-300 rounded-lg shadow-sm bg-white relative">
          <img src={preview} alt="Yüklenen görsel" className="max-w-full h-auto max-h-60 object-contain rounded mx-auto" />
          {fileName && <p className="text-xs text-gray-500 mt-1 text-center truncate">{fileName}</p>}
          <button 
            onClick={handleRemoveImage} 
            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            aria-label="Görseli kaldır"
            disabled={isLoading}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={uploaderId}
          className={`mt-2 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-teal-400 rounded-lg  bg-teal-50 transition-colors ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-teal-100'}`}
        >
          <UploadCloudIcon className="w-12 h-12 text-teal-500 mb-2" />
          <span className="text-teal-600 font-semibold">{buttonText}</span>
          <span className="text-xs text-gray-500">(Veya buraya sürükleyip bırakın)</span>
           <CameraIcon className="w-6 h-6 text-teal-500 mt-2" />
          <span className="text-xs text-gray-500">Doğrudan fotoğraf çekebilirsiniz</span>
        </label>
      )}
    </div>
  );
};
