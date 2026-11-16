import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonkey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonkey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

export const supabase = createClient (supabaseUrl, supabaseAnonkey);