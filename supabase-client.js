// ============================================================
// Supabase Client Config
// 1. ไปที่ https://app.supabase.com → เลือก Project → Settings → API
// 2. Copy "Project URL" และ "anon public" key แล้วใส่ด้านล่าง
// ============================================================

const SUPABASE_URL     = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';

window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
