import { createClient } from '@supabase/supabase-js';

declare global {
  interface ImportMeta {
    env: {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
    }
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fix common .env file mistake: if key includes the variable name, extract just the value
if (supabaseAnonKey && supabaseAnonKey.includes('VITE_SUPABASE_ANON_KEY=')) {
  const parts = supabaseAnonKey.split('VITE_SUPABASE_ANON_KEY=');
  if (parts.length > 1) {
    supabaseAnonKey = parts[parts.length - 1].trim();
    console.warn('⚠️ Fixed .env file format issue: Removed variable name from key value');
  }
}

// Validate API key format
if (supabaseAnonKey && !supabaseAnonKey.startsWith('eyJ')) {
  console.error('❌ Invalid Supabase API key format. The key should start with "eyJ" (JWT format).');
  console.error('Current key starts with:', supabaseAnonKey.substring(0, 30) + '...');
  console.error('Please check your .env file and ensure VITE_SUPABASE_ANON_KEY contains ONLY the actual anon key from your Supabase dashboard.');
  console.error('Get it from: Supabase Dashboard → Settings → API → anon/public key');
  console.error('');
  console.error('Common issues:');
  console.error('1. Make sure there are NO quotes around the value');
  console.error('2. Make sure the value does NOT include "VITE_SUPABASE_ANON_KEY="');
  console.error('3. Make sure there are NO spaces around the = sign');
  console.error('4. Correct format: VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 