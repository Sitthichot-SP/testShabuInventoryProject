// ============================================================
// Supabase Client Config
// 1. ไปที่ https://app.supabase.com → เลือก Project → Settings → API
// 2. Copy "Project URL" และ "anon public" key แล้วใส่ด้านล่าง
// ============================================================

const SUPABASE_URL     = 'https://rmltbmmswkbjijdremqt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbHRibW1zd2tiamlqZHJlbXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTc1MjEsImV4cCI6MjA5NDIzMzUyMX0.aUwvrQjCyhIT38y_6H--u-JVv_8R2b9eSAEb7cHOvoA';

window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
