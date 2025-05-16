// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

declare global {
  interface Window {
    env: {
      SUPABASE_URL: string;
      API_URL: string;
    };
  }
}

export const environment = {
  production: true,
  apiUrl: 'https://atc-01116535351.onrender.com/api',
  supabase: {
    url: 'https://twxkscrkqztvzqucypof.supabase.co',
  },
};
