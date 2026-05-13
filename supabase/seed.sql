-- ============================================================
-- Shabu Stock — Seed Data (ข้อมูลเริ่มต้น)
-- รัน schema.sql ก่อน แล้วค่อยรัน seed.sql นี้
-- ============================================================

-- SKUs
insert into skus (id, name, emoji, category, unit, cost, price, min_qty, max_qty) values
  ('SHB-001', 'เนื้อวากิว A5 สไลซ์',          '🥩', 'เนื้อนำเข้า',   'กก.',    2850, 4200,  8,  30),
  ('SHB-002', 'สันคอหมูสไลซ์',               '🥓', 'เนื้อสด',       'กก.',    220,  380,  15,  60),
  ('SHB-003', 'อกไก่สไลซ์',                  '🍗', 'เนื้อสด',       'กก.',    110,  220,  10,  50),
  ('SHB-004', 'ลูกชิ้นปลาเกรดพรีเมียม',       '🐟', 'แปรรูป',        'แพ็ค',   85,   160,  20,  80),
  ('SHB-005', 'เห็ดเข็มทอง',                 '🍄', 'ผัก/เห็ด',      'แพ็ค',   18,   40,   25, 120),
  ('SHB-006', 'ผักกาดขาวฮ่องกง',              '🥬', 'ผัก/เห็ด',      'กก.',    45,   90,   10,  50),
  ('SHB-007', 'เต้าหู้ไข่ญี่ปุ่น',              '🟨', 'แปรรูป',        'แพ็ค',   28,   60,   15,  80),
  ('SHB-008', 'วุ้นเส้นเกาหลี',               '🍜', 'แห้ง',          'แพ็ค',   32,   65,   30, 150),
  ('SHB-009', 'ไข่ไก่ไซส์ใหญ่',               '🥚', 'แปรรูป',        'ชิ้น',    5,    12,   60, 360),
  ('SHB-010', 'น้ำซุปดาชิเข้มข้น',             '🍲', 'น้ำซุป/ซอส',    'ลิตร',   120,  220,   8,  40)
on conflict (id) do nothing;

-- Warehouses
insert into warehouses (id, name, icon, temp_band, bins) values
  ('WH-COLD',   'ห้องเย็น',      '❄️',  '0–4°C',         ARRAY['A1','A2','A3','B1','B2','B3']),
  ('WH-FREEZE', 'ห้องแช่แข็ง',   '🧊',  '-18°C',          ARRAY['F1','F2','F3','F4']),
  ('WH-DRY',    'คลังของแห้ง',   '📦',  'อุณหภูมิห้อง',    ARRAY['D1','D2','D3','D4']),
  ('WH-KIT',    'ครัวกลาง',      '🍳',  'พร้อมใช้',        ARRAY['K1','K2'])
on conflict (id) do nothing;

-- Suppliers
insert into suppliers (id, name) values
  ('SUP-01', 'Sakura Wagyu Imports'),
  ('SUP-02', 'Charoen Fresh Meat'),
  ('SUP-03', 'Bangkok Fresh Vegetables'),
  ('SUP-04', 'Marine Frozen Co.'),
  ('SUP-05', 'Yamato Dashi Supply')
on conflict (id) do nothing;

-- Stock เริ่มต้น
insert into stock (sku, wh, bin, qty, batch, exp) values
  ('SHB-001', 'WH-FREEZE', 'F1', 12.5, 'B26-051', '2026-08-12'),
  ('SHB-001', 'WH-COLD',   'A1', 3.2,  'B26-051', '2026-05-18'),
  ('SHB-002', 'WH-COLD',   'A2', 28,   'B26-128', '2026-05-16'),
  ('SHB-002', 'WH-FREEZE', 'F2', 18,   'B26-115', '2026-07-22'),
  ('SHB-003', 'WH-COLD',   'A3', 22,   'B26-130', '2026-05-17'),
  ('SHB-004', 'WH-FREEZE', 'F3', 45,   'B26-095', '2026-09-30'),
  ('SHB-005', 'WH-COLD',   'B1', 65,   'B26-131', '2026-05-19'),
  ('SHB-005', 'WH-KIT',    'K1', 8,    'B26-131', '2026-05-16'),
  ('SHB-006', 'WH-COLD',   'B2', 6,    'B26-132', '2026-05-15'),
  ('SHB-007', 'WH-COLD',   'B3', 35,   'B26-120', '2026-06-04'),
  ('SHB-008', 'WH-DRY',    'D1', 88,   'B26-070', '2027-01-15'),
  ('SHB-009', 'WH-COLD',   'A1', 240,  'B26-129', '2026-06-12'),
  ('SHB-009', 'WH-KIT',    'K2', 36,   'B26-129', '2026-05-30'),
  ('SHB-010', 'WH-DRY',    'D2', 18,   'B26-110', '2027-04-20');

-- Movements ประวัติ 16 รายการล่าสุด
insert into movements (id, type, sku, qty, wh, bin, from_wh, to_wh, from_bin, to_bin, user_name, ref, supplier, dept, note, ts) values
  ('MV-2026-0142','IN',  'SHB-001', 8,    'WH-FREEZE','F1',  null,null,null,null, 'คุณภาวินี',  'PO-2026-318','SUP-01',null,              'รับเข้าตามใบ PO ปกติ', now() - interval '10 hours'),
  ('MV-2026-0141','OUT', 'SHB-002', 6,    'WH-COLD',  'A2',  null,null,null,null, 'คุณนิรันดร์', 'IS-2026-401',null,    'สาขาทองหล่อ', null,                   now() - interval '9 hours'),
  ('MV-2026-0140','OUT', 'SHB-009', 60,   'WH-COLD',  'A1',  null,null,null,null, 'คุณนิรันดร์', 'IS-2026-400',null,    'สาขาเอกมัย',  null,                   now() - interval '8 hours'),
  ('MV-2026-0139','MV',  'SHB-005', 8,    null,       null,  'WH-COLD','WH-KIT','B1','K1', 'คุณภาวินี','TR-2026-122',null,null,null,                   now() - interval '7 hours'),
  ('MV-2026-0138','IN',  'SHB-006', 12,   'WH-COLD',  'B2',  null,null,null,null, 'คุณภาวินี',  'PO-2026-317','SUP-03',null,              null,                   now() - interval '32 hours'),
  ('MV-2026-0137','OUT', 'SHB-006', 4,    'WH-COLD',  'B2',  null,null,null,null, 'คุณนิรันดร์', 'IS-2026-399',null,    'สาขาทองหล่อ', null,                   now() - interval '30 hours'),
  ('MV-2026-0136','ADJ', 'SHB-007', -2,   'WH-COLD',  'B3',  null,null,null,null, 'คุณภาวินี',  'AJ-2026-088',null,    null,              'นับสต็อกแล้วพบของเสีย 2 แพ็ค', now() - interval '28 hours'),
  ('MV-2026-0135','IN',  'SHB-008', 40,   'WH-DRY',   'D1',  null,null,null,null, 'คุณภาวินี',  'PO-2026-316','SUP-05',null,              null,                   now() - interval '57 hours'),
  ('MV-2026-0134','OUT', 'SHB-001', 2.5,  'WH-COLD',  'A1',  null,null,null,null, 'คุณนิรันดร์', 'IS-2026-398',null,    'สาขาสาทร',    null,                   now() - interval '55 hours'),
  ('MV-2026-0133','IN',  'SHB-004', 25,   'WH-FREEZE','F3',  null,null,null,null, 'คุณภาวินี',  'PO-2026-315','SUP-04',null,              null,                   now() - interval '79 hours'),
  ('MV-2026-0132','OUT', 'SHB-002', 10,   'WH-COLD',  'A2',  null,null,null,null, 'คุณนิรันดร์', 'IS-2026-397',null,    'สาขาเอกมัย',  null,                   now() - interval '78 hours'),
  ('MV-2026-0131','MV',  'SHB-009', 36,   null,       null,  'WH-COLD','WH-KIT','A1','K2', 'คุณภาวินี','TR-2026-121',null,null,null,                   now() - interval '77 hours'),
  ('MV-2026-0130','IN',  'SHB-003', 18,   'WH-COLD',  'A3',  null,null,null,null, 'คุณภาวินี',  'PO-2026-314','SUP-02',null,              null,                   now() - interval '103 hours'),
  ('MV-2026-0129','OUT', 'SHB-005', 12,   'WH-COLD',  'B1',  null,null,null,null, 'คุณนิรันดร์', 'IS-2026-396',null,    'สาขาทองหล่อ', null,                   now() - interval '101 hours'),
  ('MV-2026-0128','OUT', 'SHB-010', 2,    'WH-DRY',   'D2',  null,null,null,null, 'คุณนิรันดร์', 'IS-2026-395',null,    'สาขาสาทร',    null,                   now() - interval '129 hours'),
  ('MV-2026-0127','IN',  'SHB-009', 180,  'WH-COLD',  'A1',  null,null,null,null, 'คุณภาวินี',  'PO-2026-313','SUP-02',null,              null,                   now() - interval '130 hours')
on conflict (id) do nothing;
