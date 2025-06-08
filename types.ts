
export enum UserRole {
  STORE = 'STORE',
  MANAGER = 'MANAGER',
}

export enum StoreType {
  MASS = 'Mass',
  PREMIUM = 'Premium',
}

export interface Store {
  id: string;
  name: string;
}

export interface Equipment {
  id:string;
  name: string;
  referenceImageUrl: string; 
  description: string;
}

export interface Review {
  id: string;
  managerId: string; 
  managerName: string; 
  isCorrect: boolean;
  notes: string; 
  timestamp: string; 
}

export interface Submission {
  id: string; 
  storeId: string; // This will be the store name
  storeType?: StoreType; // Added store type, optional for backward compatibility
  equipmentId: string;
  uploadedImageUrl: string | null;
  uploadedImageFileName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'partial_review'; 
  timestamp: string; 
  reviews: Review[];
}

export interface ManagerPersona {
  id: string;
  name: string;
}
