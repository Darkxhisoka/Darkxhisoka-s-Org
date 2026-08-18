import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ogwvpnhhxtjzdebyfeem.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_uBrh_mcJmhQGUJoVqFyKrg_g-kwLtCY';

export const getSecretRole = (): string => {
  try {
    const sessionStr = localStorage.getItem('delice_session');
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      if (parsed?.user?.secret_role) {
        return parsed.user.secret_role;
      }
    }
  } catch (e) {
    // fallback
  }
  return 'LAB_EXECUTIVE_ADMIN';
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      'x-secret-role': getSecretRole(),
    },
  },
});

