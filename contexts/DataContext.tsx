
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Submission, UserRole, Store, Equipment, Review, ManagerPersona, StoreType } from '../types.ts'; // Added StoreType
import { STORES, EQUIPMENT_LIST as DEFAULT_EQUIPMENT_LIST, MANAGER_PERSONAS, DEFAULT_MANAGER_PASSWORD, LOCAL_STORAGE_KEY_MANAGER_PASSWORD } from '../constants.ts';

// Firebase imports - using compat for simpler existing code transition
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// Trivial comment to potentially help with module resolution or caching issues.

// ADD YOUR FIREBASE CONFIGURATION HERE:
const firebaseConfig = {
  apiKey: "AIzaSyBGooIsAcvBctCnMQCR1hXCFpEdv8ENC6U",
  authDomain: "teshiruygulama.firebaseapp.com",
  projectId: "teshiruygulama",
  storageBucket: "teshiruygulama.firebasestorage.app",
  messagingSenderId: "134968205831",
  appId: "1:134968205831:web:1beff4d5f0b2f0275d40a2"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// Function to sanitize IDs for Firestore document paths
const sanitizeFirestoreId = (id: string): string => {
  if (!id) return 'undefined_id';
  // Replace characters invalid for Firestore document IDs.
  // Firestore IDs cannot contain '/', '*', '[', ']', '.', or be '__.*__'.
  // This replaces common problematic characters.
  let sanitized = id.replace(/\//g, '_');
  sanitized = sanitized.replace(/\./g, '_');
  sanitized = sanitized.replace(/\[/g, '_');
  sanitized = sanitized.replace(/\]/g, '_');
  sanitized = sanitized.replace(/\*/g, '_');
  // Firestore IDs must not be solely "." or ".."
  if (sanitized === '.' || sanitized === '..') {
    sanitized = `id_${sanitized}`;
  }
  // Ensure ID is not empty after sanitization
  if (sanitized.trim() === '') {
    return 'empty_id_sanitized';
  }
  return sanitized;
};


interface DataContextType {
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  stores: Store[];
  equipmentList: Equipment[]; 
  addEquipment: (equipmentData: Omit<Equipment, 'id'>) => Promise<void>;
  updateEquipment: (equipment: Equipment) => Promise<void>;
  deleteEquipment: (equipmentId: string) => Promise<void>;
  managerPersonas: ManagerPersona[];
  selectedStoreId: string | null; // Represents store name
  setSelectedStoreId: (id: string | null) => void;
  selectedStoreType: StoreType | null; // Added
  setSelectedStoreType: (type: StoreType | null) => void; // Added
  selectedManagerPersona: ManagerPersona | null;
  setSelectedManagerPersona: (persona: ManagerPersona | null) => void;
  submissions: Submission[];
  addSubmission: (storeId: string, storeType: StoreType, equipmentId: string, uploadedImageUrl: string | null, uploadedImageFileName: string | undefined) => Promise<void>; // Added storeType
  addReviewToSubmission: (submissionId: string, review: Review) => Promise<void>;
  getSubmission: (storeId: string, equipmentId: string) => Submission | undefined; 
  clearAllData: () => Promise<void>; 
  managerPassword: string;
  updateManagerPassword: (newPassword: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USER_ROLE = 'visualAuditUserRole';
const LOCAL_STORAGE_KEY_STORE_ID = 'visualAuditStoreId'; // Store name
const LOCAL_STORAGE_KEY_STORE_TYPE = 'visualAuditStoreType'; // Added
const LOCAL_STORAGE_KEY_MANAGER_PERSONA = 'visualAuditManagerPersona';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userRole, setUserRoleState] = useState<UserRole | null>(() => {
    const storedRole = localStorage.getItem(LOCAL_STORAGE_KEY_USER_ROLE);
    return storedRole ? (storedRole as UserRole) : null;
  });

  const [selectedStoreId, setSelectedStoreIdState] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY_STORE_ID);
  });

  const [selectedStoreType, setSelectedStoreTypeState] = useState<StoreType | null>(() => {
    const storedType = localStorage.getItem(LOCAL_STORAGE_KEY_STORE_TYPE);
    return storedType ? (storedType as StoreType) : null;
  });

  const [selectedManagerPersona, setSelectedManagerPersonaState] = useState<ManagerPersona | null>(() => {
    const storedPersona = localStorage.getItem(LOCAL_STORAGE_KEY_MANAGER_PERSONA);
    return storedPersona ? JSON.parse(storedPersona) : null;
  });
  
  const [submissions, setSubmissionsState] = useState<Submission[]>([]);
  const [equipmentList, setEquipmentListState] = useState<Equipment[]>([]); 

  const [managerPassword, setManagerPasswordState] = useState<string>(() => {
    const storedPassword = localStorage.getItem(LOCAL_STORAGE_KEY_MANAGER_PASSWORD);
    return storedPassword || DEFAULT_MANAGER_PASSWORD;
  });

  useEffect(() => {
    const unsubscribeEquipment = db.collection('equipment').onSnapshot(snapshot => {
      const fetchedEquipment: Equipment[] = [];
      snapshot.forEach(doc => {
        fetchedEquipment.push({ id: doc.id, ...doc.data() } as Equipment);
      });
      setEquipmentListState(fetchedEquipment);
    }, error => {
      console.error("Error fetching equipment list from Firestore:", error);
    });

    const unsubscribeSubmissions = db.collection('submissions').onSnapshot(snapshot => {
      const fetchedSubmissions: Submission[] = [];
      snapshot.forEach(doc => {
        fetchedSubmissions.push({ id: doc.id, ...doc.data() } as Submission);
      });
      setSubmissionsState(fetchedSubmissions);
    }, error => {
      console.error("Error fetching submissions from Firestore:", error);
    });
    
    return () => {
      unsubscribeEquipment();
      unsubscribeSubmissions();
    };
  }, []);


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
    if (selectedStoreType) {
      localStorage.setItem(LOCAL_STORAGE_KEY_STORE_TYPE, selectedStoreType);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_STORE_TYPE);
    }
  }, [selectedStoreType]);

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
        setSelectedStoreTypeState(null); // Clear store type
    } else if (role === UserRole.STORE) {
        setSelectedManagerPersonaState(null); 
    } else { 
        setSelectedStoreIdState(null);
        setSelectedStoreTypeState(null); // Clear store type
        setSelectedManagerPersonaState(null);
    }
  };

  const setSelectedStoreId = (id: string | null) => {
    setSelectedStoreIdState(id);
  };

  const setSelectedStoreType = (type: StoreType | null) => {
    setSelectedStoreTypeState(type);
  };

  const setSelectedManagerPersona = (persona: ManagerPersona | null) => {
    setSelectedManagerPersonaState(persona);
  };

  const calculateOverallStatus = useCallback((reviewsInput: Review[] | undefined): Submission['status'] => {
    const reviews = reviewsInput || []; // Ensure reviews is an array
    if (reviews.length === 0) return 'pending';
    
    const approvalCount = reviews.filter(r => r.isCorrect).length;
    const rejectionCount = reviews.filter(r => !r.isCorrect).length;

    if (rejectionCount > 0) return 'rejected';
    // If there's at least one approval and no rejections, it's approved.
    // If only approvals exist from all possible reviewers, it's approved.
    // This logic might need refinement based on how many managers *must* approve.
    // For now, any approval without rejection makes it 'approved'.
    if (approvalCount > 0 && rejectionCount === 0) return 'approved'; 
    
    return 'pending'; // Fallback if no clear approved/rejected state (e.g. only pending reviews from some managers)
  }, []);

  const addSubmission = async (
    storeId: string, // This is the original store name
    storeType: StoreType, 
    equipmentId: string, 
    uploadedImageUrl: string | null, 
    uploadedImageFileName: string | undefined
  ) => {
    const sanitizedStoreIdForDocId = sanitizeFirestoreId(storeId);
    const sanitizedEquipmentIdForDocId = sanitizeFirestoreId(equipmentId);
    const submissionDocId = `${sanitizedStoreIdForDocId}-${sanitizedEquipmentIdForDocId}`; 
    
    const submissionRef = db.collection('submissions').doc(submissionDocId);
    let operationType = "UNINITIALIZED"; // Default operation type

    let docSnapshot: firebase.firestore.DocumentSnapshot | null = null;
    let getFailedDueToOffline = false;

    try {
      operationType = "ATTEMPT_GET";
      docSnapshot = await submissionRef.get();
      operationType = docSnapshot.exists ? "UPDATE_PREP" : "CREATE_PREP";
    } catch (getError: any) {
      console.warn(`Initial get() for submission ${submissionDocId} failed. OperationType was: ${operationType}. Error:`, getError);
      if (getError.code === 'unavailable' || (getError.message && typeof getError.message === 'string' && getError.message.toLowerCase().includes('offline'))) {
        getFailedDueToOffline = true;
        operationType = "GET_FAILED_OFFLINE_PROCEED_TO_WRITE"; // Special type if GET fails offline
      } else {
        // For other GET errors (permissions, network issues not classified as 'offline' by SDK), re-throw.
        operationType = `GET_FAILED_CRITICAL (${getError.code || 'UNKNOWN_CODE'})`;
        console.error(
          `Critical error in DataContext.addSubmission during ${operationType} on doc ID ${submissionDocId}:`, 
          getError
        );
         const payloadDetails = { /* Re-logging basic info for context */ };
         console.error("Context for critical GET error:", payloadDetails);
        throw getError; // Rethrow critical GET errors
      }
    }

    try {
      const currentTime = new Date().toISOString();
      // Initialize payload as Partial<Submission> for flexibility with set merge.
      const payloadToSet: { [key: string]: any } = { 
        storeId: storeId,
        storeType,
        equipmentId,
        uploadedImageUrl,
        timestamp: currentTime,
      };

      if (docSnapshot && docSnapshot.exists) { // Successfully got the document and it exists (online update)
        operationType = "UPDATE_CONSTRUCT_PAYLOAD";
        const existingSubmission = docSnapshot.data() as Submission;
        const imageChangedOrRemoved = 
          uploadedImageUrl === null || 
          existingSubmission.uploadedImageUrl !== uploadedImageUrl || 
          (!existingSubmission.uploadedImageUrl && uploadedImageUrl);

        if (imageChangedOrRemoved) {
          payloadToSet.reviews = [];
          payloadToSet.status = 'pending';
        } else {
          // Image itself hasn't changed; preserve existing reviews and status.
          // This case is less common for `addSubmission` if it's mainly for image changes.
          payloadToSet.reviews = existingSubmission.reviews || [];
          payloadToSet.status = calculateOverallStatus(existingSubmission.reviews || []);
        }
      } else { 
        // This is a CREATE or GET_FAILED_OFFLINE case.
        // In both scenarios, an image operation (new, change, or removal) means fresh reviews/status.
        operationType = getFailedDueToOffline ? "OFFLINE_WRITE_CONSTRUCT_PAYLOAD" : "CREATE_CONSTRUCT_PAYLOAD";
        payloadToSet.reviews = [];
        payloadToSet.status = 'pending';
      }

      // Handle uploadedImageFileName separately for FieldValue.delete()
      if (uploadedImageFileName === undefined) {
        payloadToSet.uploadedImageFileName = firebase.firestore.FieldValue.delete();
      } else {
        payloadToSet.uploadedImageFileName = uploadedImageFileName;
      }
      
      operationType = `PERFORM_SET_MERGE (${operationType.replace('_CONSTRUCT_PAYLOAD', '')})`;
      console.log(`[DataContext] Attempting Firestore set({merge:true}) for doc ${submissionDocId}. Operation: ${operationType}. Payload being sent:`, JSON.parse(JSON.stringify(payloadToSet)));
      await submissionRef.set(payloadToSet, { merge: true });
      console.log(`[DataContext] Firestore set({merge:true}) successful for ${submissionDocId}.`);

    } catch (writeError) {
      operationType = operationType.includes('PERFORM_SET_MERGE') ? operationType : `WRITE_FAILED_ (${operationType})`;
      console.error(
        `Error in DataContext.addSubmission during WRITE (${operationType}) on doc ID ${submissionDocId}:`, 
        writeError
      );
      const payloadDetails = {
        originalStoreId: storeId,
        sanitizedStoreIdForDocId: sanitizedStoreIdForDocId,
        originalEquipmentId: equipmentId,
        sanitizedEquipmentIdForDocId: sanitizedEquipmentIdForDocId,
        storeType,
        uploadedImageUrlIsNull: uploadedImageUrl === null,
        uploadedImageFileNameWasDefined: uploadedImageFileName !== undefined,
        uploadedImageFileNameActual: uploadedImageFileName, // Log actual value
        docId: submissionDocId,
        operationAttempted: operationType, // More specific operation type
        getFailedOfflineFlag: getFailedDueToOffline,
        docSnapshotExists: docSnapshot?.exists // Log if snapshot was available
      };
      console.error("Attempted payload context for Firestore write error:", payloadDetails);
      throw writeError; // Re-throw to be caught by UI
    }
  };

  const addReviewToSubmission = async (submissionId: string, review: Review) => {
    const submissionRef = db.collection('submissions').doc(submissionId);
    try {
      await db.runTransaction(async (transaction) => {
        const submissionDoc = await transaction.get(submissionRef);
        if (!submissionDoc.exists) {
          throw new Error("Submission document does not exist!");
        }
        const submissionData = submissionDoc.data() as Submission;
        if (!submissionData.uploadedImageUrl) {
          console.warn("Cannot add review to submission without an image.");
          return; 
        }

        const currentReviews = submissionData.reviews || [];
        const existingReviewIndex = currentReviews.findIndex(r => r.managerId === review.managerId);
        let updatedReviews;
        if (existingReviewIndex > -1) {
          updatedReviews = [...currentReviews];
          updatedReviews[existingReviewIndex] = review; 
        } else {
          updatedReviews = [...currentReviews, review];
        }
        const newStatus = calculateOverallStatus(updatedReviews);
        transaction.update(submissionRef, { 
          reviews: updatedReviews, 
          status: newStatus,
          timestamp: new Date().toISOString() 
        });
      });
    } catch (error) {
      console.error("Error adding review in DataContext for submission ID " + submissionId + ":", error);
      throw error; 
    }
  };
  
  const getSubmission = useCallback((storeId: string, equipmentId: string): Submission | undefined => {
    const sanitizedStoreIdForDocId = sanitizeFirestoreId(storeId);
    const sanitizedEquipmentIdForDocId = sanitizeFirestoreId(equipmentId);
    const submissionDocId = `${sanitizedStoreIdForDocId}-${sanitizedEquipmentIdForDocId}`;
    return submissions.find(s => s.id === submissionDocId);
  }, [submissions]);

  const addEquipment = async (equipmentData: Omit<Equipment, 'id'>) => {
    try {
      // Assuming 'id' for equipment should be unique and potentially user-defined (like from constants) or derived.
      // If `equipmentData.name` is intended as ID, it needs sanitization.
      // Let's assume an 'id' field is implicitly part of equipmentData if it's meant to be specific,
      // or Firestore auto-generates one if we just use `.add()`.
      // For consistency with current `DEFAULT_EQUIPMENT_LIST` which has `id`s, we should use `.doc(id).set()`.
      // The `Omit<Equipment, 'id'>` suggests ID is handled outside or auto-generated.
      // If `addEquipment` is for new, admin-defined items, they might type an ID or name that becomes ID.
      // Let's assume for now, new equipment ID is based on its name for this example if no explicit ID.
      const newEquipmentId = sanitizeFirestoreId(equipmentData.name || `equipment_${Date.now()}`);
      
      const docRef = db.collection('equipment').doc(newEquipmentId);
      await docRef.set({ ...equipmentData, id: newEquipmentId }); // Ensure 'id' field is in the doc
      console.log("Equipment added/updated with ID: ", newEquipmentId);
    } catch (error) {
      console.error("Error adding equipment in DataContext: ", error);
      throw error; 
    }
  };

  const updateEquipment = async (updatedEquipment: Equipment) => {
    const { id, ...dataToUpdate } = updatedEquipment;
    if (!id) {
      console.error("Cannot update equipment without an ID.");
      throw new Error("Cannot update equipment without an ID.");
    }
    // Equipment ID from Firestore or constants is usually safe.
    // If ID could be user-edited to something problematic, it would need re-sanitization for the doc path.
    // Assuming 'id' here is the clean/correct document ID.
    try {
      await db.collection('equipment').doc(id).update(dataToUpdate);
    } catch (error) {
      console.error("Error updating equipment in DataContext for ID " + id + ":", error);
      throw error; 
    }
  };

  const deleteEquipment = async (equipmentId: string) => {
    try {
      await db.collection('equipment').doc(equipmentId).delete();
      const submissionsQuery = await db.collection('submissions').where('equipmentId', '==', equipmentId).get();
      
      if (!submissionsQuery.empty) {
        const batch = db.batch();
        submissionsQuery.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`Deleted equipment ${equipmentId} and its ${submissionsQuery.size} related submissions.`);
      } else {
        console.log(`Deleted equipment ${equipmentId}. No related submissions found to delete.`);
      }

    } catch (error) {
      console.error("Error deleting equipment in DataContext for ID " + equipmentId + ":", error);
      throw error; 
    }
  };

  const updateManagerPassword = (newPassword: string) => {
    setManagerPasswordState(newPassword); 
  };

  const clearAllData = async () => {
    console.log("Clearing all data from Firestore and local storage...");
    try {
      const submissionsSnapshot = await db.collection('submissions').get();
      const subBatch = db.batch();
      submissionsSnapshot.docs.forEach(doc => subBatch.delete(doc.ref));
      await subBatch.commit();
      console.log("All submissions deleted from Firestore.");

      const equipmentSnapshot = await db.collection('equipment').get();
      const eqBatch = db.batch();
      equipmentSnapshot.docs.forEach(doc => eqBatch.delete(doc.ref));
      await eqBatch.commit();
      console.log("All equipment deleted from Firestore.");

      const defaultEqBatch = db.batch();
      DEFAULT_EQUIPMENT_LIST.forEach(eq => {
        // eq.id from constants is assumed to be safe for Firestore path, or already sanitized if derived.
        const eqIdForDoc = sanitizeFirestoreId(eq.id); 
        const docRef = db.collection('equipment').doc(eqIdForDoc); 
        // Ensure the 'id' field within the document matches the document's ID
        defaultEqBatch.set(docRef, { ...eq, id: eqIdForDoc }); 
      });
      await defaultEqBatch.commit();
      console.log("Default equipment list re-populated in Firestore.");

    } catch (error) {
      console.error("Error clearing Firestore data: ", error);
      alert("Firestore verileri temizlenirken bir hata oluştu: " + (error as Error).message);
    }

    localStorage.removeItem(LOCAL_STORAGE_KEY_USER_ROLE);
    localStorage.removeItem(LOCAL_STORAGE_KEY_STORE_ID);
    localStorage.removeItem(LOCAL_STORAGE_KEY_STORE_TYPE); 
    localStorage.removeItem(LOCAL_STORAGE_KEY_MANAGER_PERSONA);
    localStorage.removeItem(LOCAL_STORAGE_KEY_MANAGER_PASSWORD); 

    setSubmissionsState([]); 
    // setEquipmentListState([]); // This will be repopulated by Firestore listener or by default list population
    // Keep setEquipmentListState(DEFAULT_EQUIPMENT_LIST) if direct repopulation is desired without waiting for listener

    setUserRoleState(null);
    setSelectedStoreIdState(null);
    setSelectedStoreTypeState(null); 
    setSelectedManagerPersonaState(null);
    setManagerPasswordState(DEFAULT_MANAGER_PASSWORD); 
    
    console.log("Local storage and UI state cleared.");
  };


  return (
    <DataContext.Provider
      value={{
        userRole,
        setUserRole,
        stores: STORES, 
        equipmentList, 
        addEquipment,
        updateEquipment,
        deleteEquipment,
        managerPersonas: MANAGER_PERSONAS, 
        selectedStoreId,
        setSelectedStoreId,
        selectedStoreType, 
        setSelectedStoreType, 
        selectedManagerPersona,
        setSelectedManagerPersona,
        submissions, 
        addSubmission,
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
