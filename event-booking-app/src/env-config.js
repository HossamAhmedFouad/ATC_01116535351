(function (window) {
  window.env = window.env || {};
  // Environment variables
  window.env.SUPABASE_URL = "{{SUPABASE_URL}}";
  window.env.SUPABASE_ANON_KEY = "{{SUPABASE_ANON_KEY}}";
  window.env.SUPABASE_STORAGE_URL = "{{SUPABASE_STORAGE_URL}}";
  window.env.API_URL = "{{API_URL}}";
})(this);
