
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Submission, UserRole, Store, Equipment, Review, ManagerPersona } from '../types.ts';
import { STORES, EQUIPMENT_LIST as DEFAULT_EQUIPMENT_LIST, MANAGER_PERSONAS, DEFAULT_MANAGER_PASSWORD, LOCAL_STORAGE_KEY_MANAGER_PASSWORD } from '../constants.ts'; // Renamed to avoid conflict

// Trivial comment to potentially help with module resolution or caching issues.
interface DataContextType {
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  stores: Store[];
  equipmentList: Equipment[]; // This will be the stateful list
  setEquipmentList: React.Dispatch<React.SetStateAction<Equipment[]>>; // For direct manipulation from Admin
  addEquipment: (equipmentData: Omit<Equipment, 'id'>) => void;
  updateEquipment: (equipment: Equipment) => void;
  deleteEquipment: (equipmentId: string) => void;
  managerPersonas: ManagerPersona[];
  selectedStoreId: string | null;
  setSelectedStoreId: (id: string | null) => void;
  selectedManagerPersona: ManagerPersona | null;
  setSelectedManagerPersona: (persona: ManagerPersona | null) => void;
  submissions: Submission[];
  addSubmission: (storeId: string, equipmentId: string, uploadedImageUrl: string | null, uploadedImageFileName: string | undefined) => void;
  updateSubmissionStatus: (submissionId: string, reviews: Review[]) => void;
  addReviewToSubmission: (submissionId: string, review: Review) => void;
  getSubmission: (storeId: string, equipmentId: string) => Submission | undefined;
  clearAllData: () => void; 
  managerPassword: string;
  updateManagerPassword: (newPassword: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Constants for localStorage keys to ensure data persistence across browser sessions.
const LOCAL_STORAGE_KEY_SUBMISSIONS = 'visualAuditSubmissions';
const LOCAL_STORAGE_KEY_USER_ROLE = 'visualAuditUserRole';
const LOCAL_STORAGE_KEY_STORE_ID = 'visualAuditStoreId';
const LOCAL_STORAGE_KEY_MANAGER_PERSONA = 'visualAuditManagerPersona';
const LOCAL_STORAGE_KEY_EQUIPMENT_LIST = 'visualAuditEquipmentList';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userRole, setUserRoleState] = useState<UserRole | null>(() => {
    const storedRole = localStorage.getItem(LOCAL_STORAGE_KEY_USER_ROLE);
    return storedRole ? (storedRole as UserRole) : null;
  });

  const [selectedStoreId, setSelectedStoreIdState] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY_STORE_ID);
  });

  const [selectedManagerPersona, setSelectedManagerPersonaState] = useState<ManagerPersona | null>(() => {
    const storedPersona = localStorage.getItem(LOCAL_STORAGE_KEY_MANAGER_PERSONA);
    return storedPersona ? JSON.parse(storedPersona) : null;
  });
  
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const storedSubmissions = localStorage.getItem(LOCAL_STORAGE_KEY_SUBMISSIONS);
    return storedSubmissions ? JSON.parse(storedSubmissions) : [];
  });

  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => {
    const storedList = localStorage.getItem(LOCAL_STORAGE_KEY_EQUIPMENT_LIST);
    return storedList ? JSON.parse(storedList) : DEFAULT_EQUIPMENT_LIST;
  });

  const [managerPassword, setManagerPasswordState] = useState<string>(() => {
    const storedPassword = localStorage.getItem(LOCAL_STORAGE_KEY_MANAGER_PASSWORD);
    return storedPassword || DEFAULT_MANAGER_PASSWORD;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_EQUIPMENT_LIST, JSON.stringify(equipmentList));
  }, [equipmentList]);

  useEffect(() => {
    if (userRole) {
      localStorage.setItem(LOCAL_STORAGE_KEY_USER_ROLE, userRole);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_USER_ROLE);
    }
  }, [userRole]);

  useEffect(() => {
    if (selectedStoreId) {
      localStorage.setItem(LOCAL_STORAGE_KEY_STORE_ID, selectedStoreId);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_STORE_ID);
    }
  }, [selectedStoreId]);

  useEffect(() => {
    if (selectedManagerPersona) {
      localStorage.setItem(LOCAL_STORAGE_KEY_MANAGER_PERSONA, JSON.stringify(selectedManagerPersona));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_MANAGER_PERSONA);
    }
  }, [selectedManagerPersona]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_MANAGER_PASSWORD, managerPassword);
  }, [managerPassword]);

  const setUserRole = (role: UserRole | null) => {
    setUserRoleState(role);
    if (role === UserRole.MANAGER) {
        setSelectedStoreIdState(null); 
    } else if (role === UserRole.STORE) {
        setSelectedManagerPersonaState(null); 
    } else { 
        setSelectedStoreIdState(null);
        setSelectedManagerPersonaState(null);
    }
  };

  const setSelectedStoreId = (id: string | null) => {
    setSelectedStoreIdState(id);
  };

  const setSelectedManagerPersona = (persona: ManagerPersona | null) => {
    setSelectedManagerPersonaState(persona);
  };

  const calculateOverallStatus = useCallback((reviews: Review[]): Submission['status'] => {
    if (reviews.length === 0) return 'pending';
    
    const approvalCount = reviews.filter(r => r.isCorrect).length;
    const rejectionCount = reviews.filter(r => !r.isCorrect).length;

    if (rejectionCount > 0) return 'rejected';
    if (approvalCount > 0 && approvalCount === reviews.length) return 'approved'; 
    if (approvalCount > 0 && approvalCount < reviews.length && rejectionCount === 0) return 'partial_review'; 
    
    return 'pending';
  }, []);

  const addSubmission = useCallback((storeId: string, equipmentId: string, uploadedImageUrl: string | null, uploadedImageFileName: string | undefined) => {
    setSubmissions(prevSubmissions => {
      const submissionIndex = prevSubmissions.findIndex(s => s.storeId === storeId && s.equipmentId === equipmentId);
      const newSubmissionData = {
        uploadedImageUrl,
        uploadedImageFileName,
        timestamp: new Date().toISOString(),
      };

      if (submissionIndex > -1) {
        const updatedSubmissions = [...prevSubmissions];
        const existingSubmission = updatedSubmissions[submissionIndex];
        
        let reviewsAndStatus;
        if (uploadedImageUrl === null || existingSubmission.uploadedImageUrl !== uploadedImageUrl || (!existingSubmission.uploadedImageUrl && uploadedImageUrl)) {
          reviewsAndStatus = { reviews: [], status: 'pending' as Submission['status'] };
        } else {
          reviewsAndStatus = { reviews: existingSubmission.reviews, status: calculateOverallStatus(existingSubmission.reviews) };
        }
        
        updatedSubmissions[submissionIndex] = { 
          ...existingSubmission, 
          ...newSubmissionData, 
          ...reviewsAndStatus 
        };
        return updatedSubmissions;
      } else {
        const newSubmission: Submission = {
          id: `${storeId}-${equipmentId}-${Date.now()}`, 
          storeId, 
          equipmentId, 
          uploadedImageUrl, 
          uploadedImageFileName, 
          reviews: [], 
          status: 'pending', 
          timestamp: new Date().toISOString(),
        };
        return [...prevSubmissions, newSubmission];
      }
    });
  }, [calculateOverallStatus]);

  const updateSubmissionStatus = useCallback((submissionId: string, reviews: Review[]) => {
    setSubmissions(prev =>
      prev.map(s =>
        s.id === submissionId
          ? { ...s, reviews: reviews, status: calculateOverallStatus(reviews), timestamp: new Date().toISOString() }
          : s
      )
    );
  }, [calculateOverallStatus]);

  const addReviewToSubmission = useCallback((submissionId: string, review: Review) => {
    setSubmissions(prev => {
      return prev.map(s => {
        if (s.id === submissionId) {
          if (!s.uploadedImageUrl) return s; 

          const existingReviewIndex = s.reviews.findIndex(r => r.managerId === review.managerId);
          let updatedReviews;
          if (existingReviewIndex > -1) {
            updatedReviews = [...s.reviews];
            updatedReviews[existingReviewIndex] = review; 
          } else {
            updatedReviews = [...s.reviews, review];
          }
          return { ...s, reviews: updatedReviews, status: calculateOverallStatus(updatedReviews), timestamp: new Date().toISOString() };
        }
        return s;
      });
    });
  }, [calculateOverallStatus]);
  
  const getSubmission = useCallback((storeId: string, equipmentId: string): Submission | undefined => {
    return submissions.find(s => s.storeId === storeId && s.equipmentId === equipmentId);
  }, [submissions]);

  const addEquipment = (equipmentData: Omit<Equipment, 'id'>) => {
    setEquipmentList(prevList => {
      const newEquipment: Equipment = {
        id: `eq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...equipmentData,
      };
      return [...prevList, newEquipment]; 
    });
  };

  const updateEquipment = (updatedEquipment: Equipment) => {
    setEquipmentList(prevList =>
      prevList.map(eq => (eq.id === updatedEquipment.id ? updatedEquipment : eq))
    ); 
  };

  const deleteEquipment = (equipmentId: string) => {
    setEquipmentList(prevList => prevList.filter(eq => eq.id !== equipmentId));
    setSubmissions(prevSubs => prevSubs.filter(sub => sub.equipmentId !== equipmentId));
  };

  const updateManagerPassword = (newPassword: string) => {
    setManagerPasswordState(newPassword);
  };

  const clearAllData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_SUBMISSIONS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_USER_ROLE);
    localStorage.removeItem(LOCAL_STORAGE_KEY_STORE_ID);
    localStorage.removeItem(LOCAL_STORAGE_KEY_MANAGER_PERSONA);
    localStorage.removeItem(LOCAL_STORAGE_KEY_EQUIPMENT_LIST);
    localStorage.removeItem(LOCAL_STORAGE_KEY_MANAGER_PASSWORD);

    setSubmissions([]);
    setUserRoleState(null);
    setSelectedStoreIdState(null);
    setSelectedManagerPersonaState(null);
    setEquipmentList(DEFAULT_EQUIPMENT_LIST); 
    setManagerPasswordState(DEFAULT_MANAGER_PASSWORD);
  };

  return (
    <DataContext.Provider
      value={{
        userRole,
        setUserRole,
        stores: STORES,
        equipmentList, 
        setEquipmentList,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        managerPersonas: MANAGER_PERSONAS,
        selectedStoreId,
        setSelectedStoreId,
        selectedManagerPersona,
        setSelectedManagerPersona,
        submissions,
        addSubmission,
        updateSubmissionStatus,
        addReviewToSubmission,
        getSubmission,
        clearAllData,
        managerPassword,
        updateManagerPassword,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
