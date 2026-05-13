// ===== Mock data for Shabu Inventory =====

window.DATA = (function() {
  const UNITS = { KG: 'กก.', PACK: 'แพ็ค', PCS: 'ชิ้น', L: 'ลิตร', BOX: 'กล่อง' };

  const skus = [
    { id: 'SHB-001', name: 'เนื้อวากิว A5 สไลซ์',     emoji: '🥩', category: 'เนื้อนำเข้า',   unit: UNITS.KG,   cost: 2850, price: 4200, min: 8,  max: 30 },
    { id: 'SHB-002', name: 'สันคอหมูสไลซ์',          emoji: '🥓', category: 'เนื้อสด',       unit: UNITS.KG,   cost: 220,  price: 380,  min: 15, max: 60 },
    { id: 'SHB-003', name: 'อกไก่สไลซ์',             emoji: '🍗', category: 'เนื้อสด',       unit: UNITS.KG,   cost: 110,  price: 220,  min: 10, max: 50 },
    { id: 'SHB-004', name: 'ลูกชิ้นปลาเกรดพรีเมียม',  emoji: '🐟', category: 'แปรรูป',         unit: UNITS.PACK, cost: 85,   price: 160,  min: 20, max: 80 },
    { id: 'SHB-005', name: 'เห็ดเข็มทอง',            emoji: '🍄', category: 'ผัก/เห็ด',       unit: UNITS.PACK, cost: 18,   price: 40,   min: 25, max: 120 },
    { id: 'SHB-006', name: 'ผักกาดขาวฮ่องกง',         emoji: '🥬', category: 'ผัก/เห็ด',       unit: UNITS.KG,   cost: 45,   price: 90,   min: 10, max: 50 },
    { id: 'SHB-007', name: 'เต้าหู้ไข่ญี่ปุ่น',         emoji: '🟨', category: 'แปรรูป',         unit: UNITS.PACK, cost: 28,   price: 60,   min: 15, max: 80 },
    { id: 'SHB-008', name: 'วุ้นเส้นเกาหลี',           emoji: '🍜', category: 'แห้ง',           unit: UNITS.PACK, cost: 32,   price: 65,   min: 30, max: 150 },
    { id: 'SHB-009', name: 'ไข่ไก่ไซส์ใหญ่',            emoji: '🥚', category: 'แปรรูป',         unit: UNITS.PCS,  cost: 5,    price: 12,   min: 60, max: 360 },
    { id: 'SHB-010', name: 'น้ำซุปดาชิเข้มข้น',         emoji: '🍲', category: 'น้ำซุป/ซอส',     unit: UNITS.L,    cost: 120,  price: 220,  min: 8,  max: 40 },
  ];

  // 2-tier locations: warehouse -> bin
  const warehouses = [
    { id: 'WH-COLD', name: 'ห้องเย็น',         icon: '❄️', tempBand: '0–4°C',  bins: ['A1','A2','A3','B1','B2','B3'] },
    { id: 'WH-FREEZE', name: 'ห้องแช่แข็ง',     icon: '🧊', tempBand: '-18°C', bins: ['F1','F2','F3','F4'] },
    { id: 'WH-DRY',  name: 'คลังของแห้ง',      icon: '📦', tempBand: 'อุณหภูมิห้อง', bins: ['D1','D2','D3','D4'] },
    { id: 'WH-KIT',  name: 'ครัวกลาง',         icon: '🍳', tempBand: 'พร้อมใช้',  bins: ['K1','K2'] },
  ];

  // Fallback mock stock (ใช้เมื่อ DB ไม่พร้อม)
  const stock = [
    // วากิว — ห้องแช่แข็ง
    { sku: 'SHB-001', wh: 'WH-FREEZE', bin: 'F1', qty: 12.5, batch: 'B26-051', exp: '2026-08-12' },
    { sku: 'SHB-001', wh: 'WH-COLD',   bin: 'A1', qty: 3.2,  batch: 'B26-051', exp: '2026-05-18' },
    // หมู — ห้องเย็น
    { sku: 'SHB-002', wh: 'WH-COLD',   bin: 'A2', qty: 28,   batch: 'B26-128', exp: '2026-05-16' },
    { sku: 'SHB-002', wh: 'WH-FREEZE', bin: 'F2', qty: 18,   batch: 'B26-115', exp: '2026-07-22' },
    // ไก่ — ห้องเย็น
    { sku: 'SHB-003', wh: 'WH-COLD',   bin: 'A3', qty: 22,   batch: 'B26-130', exp: '2026-05-17' },
    // ลูกชิ้นปลา — แช่แข็ง
    { sku: 'SHB-004', wh: 'WH-FREEZE', bin: 'F3', qty: 45,   batch: 'B26-095', exp: '2026-09-30' },
    // เห็ด — ห้องเย็น
    { sku: 'SHB-005', wh: 'WH-COLD',   bin: 'B1', qty: 65,   batch: 'B26-131', exp: '2026-05-19' },
    { sku: 'SHB-005', wh: 'WH-KIT',    bin: 'K1', qty: 8,    batch: 'B26-131', exp: '2026-05-16' },
    // ผักกาด — ห้องเย็น
    { sku: 'SHB-006', wh: 'WH-COLD',   bin: 'B2', qty: 6,    batch: 'B26-132', exp: '2026-05-15' },
    // เต้าหู้
    { sku: 'SHB-007', wh: 'WH-COLD',   bin: 'B3', qty: 35,   batch: 'B26-120', exp: '2026-06-04' },
    // วุ้นเส้น — แห้ง
    { sku: 'SHB-008', wh: 'WH-DRY',    bin: 'D1', qty: 88,   batch: 'B26-070', exp: '2027-01-15' },
    // ไข่ไก่
    { sku: 'SHB-009', wh: 'WH-COLD',   bin: 'A1', qty: 240,  batch: 'B26-129', exp: '2026-06-12' },
    { sku: 'SHB-009', wh: 'WH-KIT',    bin: 'K2', qty: 36,   batch: 'B26-129', exp: '2026-05-30' },
    // น้ำซุป — แห้ง
    { sku: 'SHB-010', wh: 'WH-DRY',    bin: 'D2', qty: 18,   batch: 'B26-110', exp: '2027-04-20' },
  ];

  const suppliers = [
    { id: 'SUP-01', name: 'Sakura Wagyu Imports' },
    { id: 'SUP-02', name: 'Charoen Fresh Meat' },
    { id: 'SUP-03', name: 'Bangkok Fresh Vegetables' },
    { id: 'SUP-04', name: 'Marine Frozen Co.' },
    { id: 'SUP-05', name: 'Yamato Dashi Supply' },
  ];

  // Fallback mock movements (ใช้เมื่อ DB ไม่พร้อม)
  function dayAgo(d, h = 12, m = 0) {
    const dt = new Date('2026-05-13T18:00:00');
    dt.setDate(dt.getDate() - d);
    dt.setHours(h, m, 0, 0);
    return dt.toISOString();
  }

  const movements = [
    { id: 'MV-2026-0142', type: 'IN',  sku: 'SHB-001', qty: 8,   wh: 'WH-FREEZE', bin: 'F1', user: 'คุณภาวินี', ref: 'PO-2026-318', supplier: 'SUP-01', ts: dayAgo(0, 8, 12), note: 'รับเข้าตามใบ PO ปกติ' },
    { id: 'MV-2026-0141', type: 'OUT', sku: 'SHB-002', qty: 6,   wh: 'WH-COLD',   bin: 'A2', user: 'คุณนิรันดร์', ref: 'IS-2026-401',  dept: 'สาขาทองหล่อ', ts: dayAgo(0, 9, 30) },
    { id: 'MV-2026-0140', type: 'OUT', sku: 'SHB-009', qty: 60,  wh: 'WH-COLD',   bin: 'A1', user: 'คุณนิรันดร์', ref: 'IS-2026-400',  dept: 'สาขาเอกมัย', ts: dayAgo(0, 10, 5) },
    { id: 'MV-2026-0139', type: 'MV',  sku: 'SHB-005', qty: 8,   wh: 'WH-COLD->WH-KIT', bin: 'B1→K1', user: 'คุณภาวินี', ref: 'TR-2026-122', ts: dayAgo(0, 11, 20) },
    { id: 'MV-2026-0138', type: 'IN',  sku: 'SHB-006', qty: 12,  wh: 'WH-COLD',   bin: 'B2', user: 'คุณภาวินี', ref: 'PO-2026-317', supplier: 'SUP-03', ts: dayAgo(1, 8, 0) },
    { id: 'MV-2026-0137', type: 'OUT', sku: 'SHB-006', qty: 4,   wh: 'WH-COLD',   bin: 'B2', user: 'คุณนิรันดร์', ref: 'IS-2026-399', dept: 'สาขาทองหล่อ', ts: dayAgo(1, 10, 30) },
    { id: 'MV-2026-0136', type: 'ADJ', sku: 'SHB-007', qty: -2,  wh: 'WH-COLD',   bin: 'B3', user: 'คุณภาวินี', ref: 'AJ-2026-088', note: 'นับสต็อกแล้วพบของเสีย 2 แพ็ค', ts: dayAgo(1, 14, 0) },
    { id: 'MV-2026-0135', type: 'IN',  sku: 'SHB-008', qty: 40,  wh: 'WH-DRY',    bin: 'D1', user: 'คุณภาวินี', ref: 'PO-2026-316', supplier: 'SUP-05', ts: dayAgo(2, 9, 0) },
    { id: 'MV-2026-0134', type: 'OUT', sku: 'SHB-001', qty: 2.5, wh: 'WH-COLD',   bin: 'A1', user: 'คุณนิรันดร์', ref: 'IS-2026-398', dept: 'สาขาสาทร', ts: dayAgo(2, 11, 15) },
    { id: 'MV-2026-0133', type: 'IN',  sku: 'SHB-004', qty: 25,  wh: 'WH-FREEZE', bin: 'F3', user: 'คุณภาวินี', ref: 'PO-2026-315', supplier: 'SUP-04', ts: dayAgo(3, 8, 30) },
    { id: 'MV-2026-0132', type: 'OUT', sku: 'SHB-002', qty: 10,  wh: 'WH-COLD',   bin: 'A2', user: 'คุณนิรันดร์', ref: 'IS-2026-397', dept: 'สาขาเอกมัย', ts: dayAgo(3, 10, 0) },
    { id: 'MV-2026-0131', type: 'MV',  sku: 'SHB-009', qty: 36,  wh: 'WH-COLD->WH-KIT', bin: 'A1→K2', user: 'คุณภาวินี', ref: 'TR-2026-121', ts: dayAgo(3, 13, 0) },
    { id: 'MV-2026-0130', type: 'IN',  sku: 'SHB-003', qty: 18,  wh: 'WH-COLD',   bin: 'A3', user: 'คุณภาวินี', ref: 'PO-2026-314', supplier: 'SUP-02', ts: dayAgo(4, 8, 45) },
    { id: 'MV-2026-0129', type: 'OUT', sku: 'SHB-005', qty: 12,  wh: 'WH-COLD',   bin: 'B1', user: 'คุณนิรันดร์', ref: 'IS-2026-396', dept: 'สาขาทองหล่อ', ts: dayAgo(4, 11, 30) },
    { id: 'MV-2026-0128', type: 'OUT', sku: 'SHB-010', qty: 2,   wh: 'WH-DRY',    bin: 'D2', user: 'คุณนิรันดร์', ref: 'IS-2026-395', dept: 'สาขาสาทร', ts: dayAgo(5, 9, 0) },
    { id: 'MV-2026-0127', type: 'IN',  sku: 'SHB-009', qty: 180, wh: 'WH-COLD',   bin: 'A1', user: 'คุณภาวินี', ref: 'PO-2026-313', supplier: 'SUP-02', ts: dayAgo(5, 8, 30) },
  ];

  // Daily aggregate for last 14 days (in qty as # of movements)
  const dailySeries = (() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date('2026-05-13T18:00:00');
      d.setDate(d.getDate() - i);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      // simulate
      const inCnt = Math.round(8 + Math.sin(i*0.7)*4 + Math.random()*5);
      const outCnt = Math.round(12 + Math.cos(i*0.5)*5 + Math.random()*6);
      days.push({ label, in: inCnt, out: outCnt });
    }
    return days;
  })();

  return {
    skus, warehouses, suppliers, UNITS,
    dailySeries,
    // _mock* ใช้เป็น fallback เมื่อ Supabase ไม่พร้อม
    _mockStock: stock,
    _mockMovements: movements,
    // stock และ movements จริงจะถูก overwrite โดย app.jsx หลัง load จาก DB
    stock: [],
    movements: [],
  };
})();

// Utility fns
window.UTIL = {
  fmt: (n, d = 2) => {
    if (n === null || n === undefined || isNaN(n)) return '–';
    const v = typeof n === 'number' ? n : parseFloat(n);
    return v.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(v) ? 0 : d, maximumFractionDigits: d });
  },
  baht: (n) => `฿${(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
  daysUntil: (iso) => {
    const today = new Date('2026-05-13T00:00:00');
    const d = new Date(iso);
    return Math.round((d - today) / (1000 * 60 * 60 * 24));
  },
  thaiDate: (iso) => {
    const d = new Date(iso);
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return `${d.getDate()} ${months[d.getMonth()]} ${(d.getFullYear()+543)%100}`;
  },
  thaiTimeAgo: (iso) => {
    const now = new Date('2026-05-13T18:00:00');
    const d = new Date(iso);
    const mins = Math.round((now - d) / 60000);
    if (mins < 1) return 'เมื่อกี้นี้';
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} ชม.ที่แล้ว`;
    const days = Math.round(hrs / 24);
    return `${days} วันก่อน`;
  },
  skuById: (id) => window.DATA.skus.find(s => s.id === id),
  whById:  (id) => window.DATA.warehouses.find(w => w.id === id),
  totalQty: (skuId) => window.DATA.stock
    .filter(s => s.sku === skuId)
    .reduce((sum, s) => sum + s.qty, 0),
  stockStatus: (skuId) => {
    const sku = window.DATA.skus.find(s => s.id === skuId);
    if (!sku) return 'unknown';
    const total = window.DATA.stock.filter(s => s.sku === skuId).reduce((a,b) => a+b.qty, 0);
    if (total <= 0) return 'out';
    if (total < sku.min) return 'low';
    if (total < sku.min * 1.5) return 'warn';
    return 'good';
  }
};
