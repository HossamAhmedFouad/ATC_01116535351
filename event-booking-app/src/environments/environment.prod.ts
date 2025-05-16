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
  production: true,
  apiUrl: 'http://172.161.48.59:3000/api',
  supabase: {
    url: window?.env?.SUPABASE_URL || '',
    anonKey: window?.env?.SUPABASE_ANON_KEY || '',
    storageUrl: window?.env?.SUPABASE_STORAGE_URL || '',
  },
};
