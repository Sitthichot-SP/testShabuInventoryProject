# คู่มือตั้งค่า Supabase + Vercel

## ขั้นตอนที่ 1 — สร้าง Supabase Project

1. ไปที่ [https://app.supabase.com](https://app.supabase.com) → Sign up / Login
2. กด **New Project** → ตั้งชื่อ (เช่น `shabu-stock`) → เลือก Region ใกล้ไทย (Singapore) → ตั้ง password → **Create Project**
3. รอ ~2 นาที ให้ project พร้อม

---

## ขั้นตอนที่ 2 — รัน SQL Schema

1. ใน Supabase Dashboard → เมนูซ้าย **SQL Editor**
2. คลิก **New Query**
3. เปิดไฟล์ `supabase/schema.sql` → copy ทั้งหมด → วางใน editor → กด **Run**
4. ทำซ้ำกับ `supabase/seed.sql` (ข้อมูลเริ่มต้น)

---

## ขั้นตอนที่ 3 — ใส่ API Keys ในโค้ด

1. Supabase Dashboard → **Settings** (เฟือง) → **API**
2. Copy 2 ค่านี้:
   - **Project URL** — รูปแบบ `https://xxxx.supabase.co`
   - **anon public** key — key ยาวๆ

3. เปิดไฟล์ `supabase-client.js` แล้วแทนที่ค่า:

```js
const SUPABASE_URL     = 'https://YOUR_PROJECT_ID.supabase.co';  // ← วาง Project URL
const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';                // ← วาง anon key
```

4. บันทึกไฟล์

---

## ขั้นตอนที่ 4 — Deploy บน Vercel

1. ไปที่ [https://vercel.com](https://vercel.com) → Sign up / Login ด้วย GitHub account เดิม
2. กด **Add New → Project**
3. เลือก repository **testShabuInventoryProject**
4. Vercel จะตรวจจับว่าเป็น static site อัตโนมัติ
5. กด **Deploy** — รอ ~1 นาที

> **หมายเหตุ:** `supabase-client.js` มี API key อยู่ — anon key ของ Supabase ปลอดภัยสำหรับ client-side (ออกแบบมาให้เปิดเผยได้) แต่ควรตั้ง RLS rules เพิ่มเติมเมื่อพร้อม

---

## โครงสร้าง Database

```
skus          — สินค้า (10 SKUs ชาบู)
warehouses    — คลัง (ห้องเย็น, แช่แข็ง, แห้ง, ครัวกลาง)
suppliers     — ผู้จำหน่าย
stock         — สต็อกปัจจุบัน (แยกตาม sku/คลัง/bin/batch)
movements     — ประวัติทุก transaction (IN/OUT/MV/ADJ)
```

---

## ถ้ายังไม่ได้ตั้งค่า Supabase

ระบบจะแสดงแบนเนอร์สีเหลืองและใช้ข้อมูลทดสอบ (mock data) แทนโดยอัตโนมัติ — ใช้งานได้ปกติแต่ข้อมูลจะไม่ถูกบันทึก
