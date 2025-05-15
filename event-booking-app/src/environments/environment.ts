// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Local development API
  supabase: {
    url: 'https://twxkscrkqztvzqucypof.supabase.co', // Replace with your Supabase URL
    anonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3eGtzY3JrcXp0dnpxdWN5cG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDE2NzUsImV4cCI6MjA2MjcxNzY3NX0.wac_PUNsxTUH2at7FRLpDDftdhTdHizj95jwXYMPxCA', // Replace with your Supabase anon key
    storageUrl:
      'https://supabase.com/dashboard/project/twxkscrkqztvzqucypof/storage/buckets', // e.g., https://your-project.supabase.co/storage/v1
  },
};
