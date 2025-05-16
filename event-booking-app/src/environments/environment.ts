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
  apiUrl: 'http://localhost:3000/api',
  supabase: {
    url: window?.env?.SUPABASE_URL || 'http://localhost:8000',
    anonKey: window?.env?.SUPABASE_ANON_KEY || 'your-anon-key',
    storageUrl:
      window?.env?.SUPABASE_STORAGE_URL || 'http://localhost:8000/storage/v1',
  },
};
