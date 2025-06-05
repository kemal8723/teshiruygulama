
export enum UserRole {
  STORE = 'STORE',
  MANAGER = 'MANAGER',
}

export interface Store {
  id: string;
  name: string;
}

export interface Equipment {
  id: string;
  name: string;
  referenceImageUrl: string; // Zorunlu hale getirildi
  description: string;
}

export interface Review {
  id: string;
  managerId: string; // Represents the manager persona
  managerName: string; 
  isCorrect: boolean;
  notes: string; // Mandatory if !isCorrect
  timestamp: string; // ISO date string
}

export interface Submission {
  id: string; // Unique ID, perhaps storeId + equipmentId
  storeId: string;
  equipmentId: string;
  uploadedImageUrl: string | null;
  uploadedImageFileName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'partial_review'; // Overall status based on reviews
  timestamp: string; // ISO date string of last update or upload
  reviews: Review[];
}

export interface ManagerPersona {
  id: string;
  name: string;
}