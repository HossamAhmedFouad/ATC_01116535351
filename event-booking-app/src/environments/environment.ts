// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

declare global {
  interface Window {
    env: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      SUPABASE_STORAGE_URL: string;
      API_URL: string;
    };
  }
}

export const environment = {
  production: false,
  apiUrl: 'https://atc-01116535351.onrender.com/api',
  supabase: {
    url: window?.env?.SUPABASE_URL || '',
    anonKey: window?.env?.SUPABASE_ANON_KEY || '',
    storageUrl: window?.env?.SUPABASE_STORAGE_URL || '',
  },
};
