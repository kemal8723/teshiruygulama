import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Submission, UserRole, Store, Equipment, Review, ManagerPersona } from '../types.ts';
import { STORES, EQUIPMENT_LIST as DEFAULT_EQUIPMENT_LIST, MANAGER_PERSONAS, DEFAULT_MANAGER_PASSWORD, LOCAL_STORAGE_KEY_MANAGER_PASSWORD } from '../constants.ts';
import { supabase } from '../lib/supabase.ts';

interface DataContextType {
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  stores: Store[];
  equipmentList: Equipment[];
  setEquipmentList: React.Dispatch<React.SetStateAction<Equipment[]>>;
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

  // Supabase Realtime subscriptions
  useEffect(() => {
    const submissionsSubscription = supabase
      .channel('submissions_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions'
        },
        (payload) => {
          setSubmissions(currentSubmissions => {
            const updatedSubmission = payload.new as any;
            switch (payload.eventType) {
              case 'INSERT':
                return [...currentSubmissions, updatedSubmission];
              case 'UPDATE':
                return currentSubmissions.map(sub => 
                  sub.id === updatedSubmission.id ? updatedSubmission : sub
                );
              case 'DELETE':
                return currentSubmissions.filter(sub => sub.id !== updatedSubmission.id);
              default:
                return currentSubmissions;
            }
          });
        }
      )
      .subscribe();

    const reviewsSubscription = supabase
      .channel('reviews_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        (payload) => {
          const review = payload.new as any;
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setSubmissions(currentSubmissions => {
              return currentSubmissions.map(sub => {
                if (sub.id === review.submission_id) {
                  const updatedReviews = sub.reviews.filter(r => r.id !== review.id);
                  return {
                    ...sub,
                    reviews: [...updatedReviews, review],
                    status: calculateOverallStatus([...updatedReviews, review])
                  };
                }
                return sub;
              });
            });
          }
        }
      )
      .subscribe();

    return () => {
      submissionsSubscription.unsubscribe();
      reviewsSubscription.unsubscribe();
    };
  }, []);

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

  const addSubmission = useCallback(async (storeId: string, equipmentId: string, uploadedImageUrl: string | null, uploadedImageFileName: string | undefined) => {
    const { data: existingSubmission } = await supabase
      .from('submissions')
      .select()
      .eq('store_id', storeId)
      .eq('equipment_id', equipmentId)
      .single();

    if (existingSubmission) {
      const { data, error } = await supabase
        .from('submissions')
        .update({
          uploaded_image_url: uploadedImageUrl,
          uploaded_image_filename: uploadedImageFileName,
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubmission.id)
        .select();

      if (error) {
        console.error('Error updating submission:', error);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          store_id: storeId,
          equipment_id: equipmentId,
          uploaded_image_url: uploadedImageUrl,
          uploaded_image_filename: uploadedImageFileName,
          status: 'pending'
        })
        .select();

      if (error) {
        console.error('Error creating submission:', error);
        return;
      }
    }
  }, []);

  const updateSubmissionStatus = useCallback(async (submissionId: string, reviews: Review[]) => {
    const { error } = await supabase
      .from('submissions')
      .update({
        status: calculateOverallStatus(reviews),
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    if (error) {
      console.error('Error updating submission status:', error);
    }
  }, [calculateOverallStatus]);

  const addReviewToSubmission = useCallback(async (submissionId: string, review: Review) => {
    const { data: existingReview } = await supabase
      .from('reviews')
      .select()
      .eq('submission_id', submissionId)
      .eq('manager_id', review.managerId)
      .single();

    if (existingReview) {
      const { error } = await supabase
        .from('reviews')
        .update({
          is_correct: review.isCorrect,
          notes: review.notes,
          created_at: new Date().toISOString()
        })
        .eq('id', existingReview.id);

      if (error) {
        console.error('Error updating review:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('reviews')
        .insert({
          submission_id: submissionId,
          manager_id: review.managerId,
          manager_name: review.managerName,
          is_correct: review.isCorrect,
          notes: review.notes
        });

      if (error) {
        console.error('Error creating review:', error);
        return;
      }
    }
  }, []);

  const getSubmission = useCallback((storeId: string, equipmentId: string): Submission | undefined => {
    return submissions.find(s => s.storeId === storeId && s.equipmentId === equipmentId);
  }, [submissions]);

  const addEquipment = async (equipmentData: Omit<Equipment, 'id'>) => {
    const { data, error } = await supabase
      .from('equipment')
      .insert({
        name: equipmentData.name,
        reference_image_url: equipmentData.referenceImageUrl,
        description: equipmentData.description
      })
      .select();

    if (error) {
      console.error('Error adding equipment:', error);
      return;
    }

    setEquipmentList(prev => [...prev, data[0]]);
  };

  const updateEquipment = async (updatedEquipment: Equipment) => {
    const { error } = await supabase
      .from('equipment')
      .update({
        name: updatedEquipment.name,
        reference_image_url: updatedEquipment.referenceImageUrl,
        description: updatedEquipment.description
      })
      .eq('id', updatedEquipment.id);

    if (error) {
      console.error('Error updating equipment:', error);
      return;
    }

    setEquipmentList(prev => prev.map(eq => eq.id === updatedEquipment.id ? updatedEquipment : eq));
  };

  const deleteEquipment = async (equipmentId: string) => {
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', equipmentId);

    if (error) {
      console.error('Error deleting equipment:', error);
      return;
    }

    setEquipmentList(prev => prev.filter(eq => eq.id !== equipmentId));
    setSubmissions(prev => prev.filter(sub => sub.equipmentId !== equipmentId));
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