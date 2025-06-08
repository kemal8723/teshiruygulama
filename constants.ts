
import { Store, Equipment, ManagerPersona } from './types.ts';

export const STORES: Store[] = [
  { id: 'store1', name: 'İstanbul - Kadıköy Mağazası' },
  { id: 'store2', name: 'Ankara - Çankaya Mağazası' },
  { id: 'store3', name: 'İzmir - Alsancak Mağazası' },
  { id: 'store4', name: 'Bursa - Nilüfer Mağazası' },
];

export const FIXED_MAKYAJ_FANUS_1_ID = 'fixed_makyaj_fanus_1';
export const FIXED_MAKYAJ_FANUS_2_ID = 'fixed_makyaj_fanus_2';
export const FIXED_KASA_ONU_ACI_ID = 'fixed_kasa_onu_aci';

export const FIXED_EQUIPMENT_IDS = [
  FIXED_MAKYAJ_FANUS_1_ID,
  FIXED_MAKYAJ_FANUS_2_ID,
  FIXED_KASA_ONU_ACI_ID
];

export const EQUIPMENT_LIST: Equipment[] = [
  { 
    id: 'haziran_eq1', 
    name: 'M_GB1', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_haziran_eq1/600/400',
    description: 'GÜNEŞ'
  },
  { 
    id: 'haziran_eq2', 
    name: 'M_GB2', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_haziran_eq2/600/400',
    description: 'DEBORAH (Alt raflar hero cilt + Pure Beauty BB&CC eğer red planı varsa farklı seri PB de olabilir)'
  },
  { 
    id: 'haziran_eq3', 
    name: 'M_GB3 50CM', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_haziran_eq3/600/400',
    description: 'LOREAL PARIS ELSEVE + CİLT + MAKYAJ'
  },
  { 
    id: 'haziran_eq4', 
    name: 'M_GB3 75CM', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_haziran_eq4/600/400',
    description: 'LOREAL PARIS ELSEVE + CİLT + MAKYAJ'
  },
  { 
    id: 'haziran_eq5', 
    name: 'P_GB1', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_haziran_eq5/600/400',
    description: 'GÜNEŞ'
  },
  { 
    id: 'haziran_eq6', 
    name: 'P_GB2', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_haziran_eq6/600/400',
    description: 'DEBORAH (Alt raflar hero cilt + Pure Beauty BB&CC eğer red planı varsa farklı seri PB de olabilir)'
  },
  { 
    id: 'haziran_eq7', 
    name: 'P_GB3 50CM', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_haziran_eq7/600/400',
    description: 'LOREAL PARIS ELSEVE + CİLT + MAKYAJ'
  },
  { 
    id: 'haziran_eq8', 
    name: 'P_GB3 75CM', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_haziran_eq8/600/400',
    description: 'LOREAL PARIS ELSEVE + CİLT + MAKYAJ'
  },
  { 
    id: 'haziran_eq9', 
    name: 'M_SR2B', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_haziran_eq9/600/400',
    description: 'ELSEVE 20.YIL'
  },
  { 
    id: 'haziran_eq10', 
    name: 'M_SR3A', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_haziran_eq10/600/400',
    description: 'KARMA GÜNEŞ'
  },
  { 
    id: 'haziran_eq11', 
    name: 'M_SR4A', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_haziran_eq11/600/400',
    description: 'WATSONS GÜNEŞ HERO'
  },
  { 
    id: 'haziran_eq12', 
    name: 'M_SR7A', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_haziran_eq12/600/400',
    description: 'WATSONS GÜNLÜK PED'
  },
  { 
    id: 'haziran_eq13', 
    name: 'P_SR2B', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_haziran_eq13/600/400',
    description: 'ELSEVE 20. YIL' // Note: Image has "20. YIL", keeping consistency
  },
  { 
    id: 'haziran_eq14', 
    name: 'P_SR5A', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_haziran_eq14/600/400',
    description: 'WATSONS GÜNEŞ HERO'
  },
  { 
    id: 'haziran_eq15', 
    name: 'P_SR5B', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_haziran_eq15/600/400',
    description: 'KARMA GÜNEŞ'
  },
  { 
    id: FIXED_MAKYAJ_FANUS_1_ID, 
    name: 'Makyaj Fanus 1', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_makyaj_fanus1/600/400',
    description: 'Genel makyaj ürünleri için fanus sergileme alanı 1.'
  },
  { 
    id: FIXED_MAKYAJ_FANUS_2_ID, 
    name: 'Makyaj Fanus 2', 
    referenceImageUrl: 'https://picsum.photos/seed/ref_makyaj_fanus2/600/400',
    description: 'Genel makyaj ürünleri için fanus sergileme alanı 2.'
  },
  { 
    id: FIXED_KASA_ONU_ACI_ID, 
    name: 'Kasa Önü Genel Açı', 
    referenceImageUrl: '', // Referans görsel kaldırıldı
    description: 'Kasa önü alanı genel görünümü ve düzenlemesi.'
  }
];

export const MANAGER_PERSONAS: ManagerPersona[] = [
  { id: 'managerA', name: 'Bölge Müdürü Alp Yılmaz' },
  { id: 'managerB', name: 'Bölge Müdürü Beste Kara' },
  { id: 'managerC', name: 'Bölge Müdürü Cem Demir' },
];

export const APP_NAME = "Watsons Teşhir Uygulamaları";
export const ADMIN_PASSWORD = "Kg*4060023-";
export const DEFAULT_MANAGER_PASSWORD = '1234'; // Default manager password
export const LOCAL_STORAGE_KEY_MANAGER_PASSWORD = 'visualAuditManagerPassword'; // Key for storing manager password
