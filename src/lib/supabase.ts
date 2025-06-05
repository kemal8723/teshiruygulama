import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Supabase bağlantı bilgileri eksik. Lütfen .env dosyasını kontrol edin.');
}

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);