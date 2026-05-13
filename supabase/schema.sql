-- ============================================================
-- Shabu Stock — Supabase Schema
-- วิธีใช้: เปิด Supabase Dashboard → SQL Editor → วาง SQL นี้แล้ว Run
-- ============================================================

-- 1. skus (สินค้า)
create table if not exists skus (
  id         text          primary key,
  name       text          not null,
  emoji      text,
  category   text,
  unit       text,
  cost       numeric(12,2) default 0,
  price      numeric(12,2) default 0,
  min_qty    numeric(12,3) default 0,
  max_qty    numeric(12,3) default 0,
  created_at timestamptz   default now()
);

-- 2. warehouses (คลัง)
create table if not exists warehouses (
  id        text   primary key,
  name      text   not null,
  icon      text,
  temp_band text,
  bins      text[] not null default '{}'
);

-- 3. suppliers (ผู้จำหน่าย)
create table if not exists suppliers (
  id   text primary key,
  name text not null
);

-- 4. stock (สต็อกปัจจุบัน — แยกตาม sku / คลัง / bin / batch)
create table if not exists stock (
  id         uuid          primary key default gen_random_uuid(),
  sku        text          not null references skus(id) on delete cascade,
  wh         text          not null references warehouses(id),
  bin        text          not null,
  qty        numeric(12,3) not null default 0 check (qty >= 0),
  batch      text,
  exp        date,
  updated_at timestamptz   default now()
);

create index if not exists stock_sku_idx    on stock(sku);
create index if not exists stock_wh_bin_idx on stock(wh, bin);
create index if not exists stock_exp_idx    on stock(exp);

-- 5. movements (ความเคลื่อนไหวทุกธุรกรรม)
create table if not exists movements (
  id        text          primary key,
  type      text          not null check (type in ('IN','OUT','MV','ADJ')),
  sku       text          not null references skus(id),
  qty       numeric(12,3) not null,
  -- สำหรับ IN / OUT / ADJ
  wh        text,
  bin       text,
  -- สำหรับ MV (ย้าย)
  from_wh   text,
  to_wh     text,
  from_bin  text,
  to_bin    text,
  -- ข้อมูลเพิ่มเติม
  user_name text,
  ref       text,
  supplier  text references suppliers(id),
  dept      text,
  batch     text,
  exp       date,
  note      text,
  ts        timestamptz   default now()
);

create index if not exists movements_sku_idx  on movements(sku);
create index if not exists movements_ts_idx   on movements(ts desc);
create index if not exists movements_type_idx on movements(type);

-- ปิด RLS ไว้ก่อน (เหมาะสำหรับช่วงเริ่มต้น — เปิดเมื่อเพิ่ม Auth ภายหลัง)
alter table skus       disable row level security;
alter table warehouses disable row level security;
alter table suppliers  disable row level security;
alter table stock      disable row level security;
alter table movements  disable row level security;
