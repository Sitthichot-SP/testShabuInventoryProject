// =============================================
// Main App + Tweaks
// =============================================

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "indigo",
  "density": "standard",
  "atmosphere": "standard"
}/*EDITMODE-END*/;

// Curated accent palettes that re-tint the whole UI
const PALETTES = {
  indigo:  { name: 'Indigo',         a300:'#a5b4fc', a400:'#818cf8', a500:'#6366f1', a600:'#4f46e5', glow:'99,102,241',  amb1:'99,102,241',  amb2:'168,85,247' },
  cyan:    { name: 'Cyan Command',   a300:'#67e8f9', a400:'#22d3ee', a500:'#06b6d4', a600:'#0891b2', glow:'34,211,238',  amb1:'34,211,238',  amb2:'99,102,241' },
  emerald: { name: 'Emerald Fresh',  a300:'#6ee7b7', a400:'#34d399', a500:'#10b981', a600:'#059669', glow:'16,185,129',  amb1:'16,185,129',  amb2:'34,211,238' },
  amber:   { name: 'Shabu Warm',     a300:'#fcd34d', a400:'#fbbf24', a500:'#f59e0b', a600:'#d97706', glow:'245,158,11',  amb1:'245,158,11',  amb2:'244,63,94' },
  rose:    { name: 'Hot Pot',        a300:'#fda4af', a400:'#fb7185', a500:'#f43f5e', a600:'#e11d48', glow:'244,63,94',   amb1:'244,63,94',   amb2:'168,85,247' },
};

const DENSITIES = {
  compact:  { pad: 14, gap: 12, contentPad: 18, kpiVal: 24, cardGap: 12 },
  standard: { pad: 22, gap: 16, contentPad: 28, kpiVal: 30, cardGap: 18 },
  spacious: { pad: 30, gap: 22, contentPad: 40, kpiVal: 36, cardGap: 26 },
};

const ATMOSPHERES = {
  calm:      { blur: 12, saturate: 110, ambient: 0.45, gridOp: 0.012, animScale: 0.55, scanDur: 4.2,  glowSize: 18 },
  standard:  { blur: 20, saturate: 130, ambient: 1.00, gridOp: 0.018, animScale: 1.00, scanDur: 2.4,  glowSize: 24 },
  energetic: { blur: 30, saturate: 165, ambient: 1.55, gridOp: 0.026, animScale: 1.35, scanDur: 1.4,  glowSize: 32 },
};

function applyTweaks(t) {
  const p = PALETTES[t.palette] || PALETTES.indigo;
  const d = DENSITIES[t.density] || DENSITIES.standard;
  const a = ATMOSPHERES[t.atmosphere] || ATMOSPHERES.standard;
  const r = document.documentElement.style;

  // Accent palette — re-tint everything using --indigo-* (the design's primary)
  r.setProperty('--indigo-300', p.a300);
  r.setProperty('--indigo-400', p.a400);
  r.setProperty('--indigo-500', p.a500);
  r.setProperty('--indigo-600', p.a600);
  r.setProperty('--indigo-glow', `rgba(${p.glow}, 0.45)`);
  r.setProperty('--amb-1', p.amb1);
  r.setProperty('--amb-2', p.amb2);

  // Density
  r.setProperty('--pad-card', `${d.pad}px`);
  r.setProperty('--gap-stack', `${d.gap}px`);
  r.setProperty('--pad-content', `${d.contentPad}px`);
  r.setProperty('--kpi-val-size', `${d.kpiVal}px`);
  r.setProperty('--card-gap', `${d.cardGap}px`);

  // Atmosphere
  r.setProperty('--blur-amount', `${a.blur}px`);
  r.setProperty('--blur-saturate', `${a.saturate}%`);
  r.setProperty('--ambient-strength', a.ambient);
  r.setProperty('--grid-opacity', a.gridOp);
  r.setProperty('--anim-scale', a.animScale);
  r.setProperty('--scan-dur', `${a.scanDur}s`);
  r.setProperty('--glow-size', `${a.glowSize}px`);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(() => { applyTweaks(t); }, [t.palette, t.density, t.atmosphere]);

  const [route, setRoute] = useState('dashboard');
  const [stock, setStock] = useState(window.DATA.stock);
  const [movements, setMovements] = useState(window.DATA.movements);

  const store = {
    skus: window.DATA.skus,
    warehouses: window.DATA.warehouses,
    suppliers: window.DATA.suppliers,
    dailySeries: window.DATA.dailySeries,
    stock,
    movements,
  };

  function doMovement(m) {
    const now = new Date().toISOString();
    const id = `MV-2026-${String(143 + movements.length).padStart(4, '0')}`;
    const newMov = { id, ts: now, user: 'คุณภาวินี', ...m };
    setMovements(prev => [newMov, ...prev]);

    setStock(prev => {
      const copy = prev.map(s => ({ ...s }));
      if (m.type === 'IN') {
        const existing = copy.find(s => s.sku === m.sku && s.wh === m.wh && s.bin === m.bin && s.batch === m.batch);
        if (existing) existing.qty += m.qty;
        else copy.push({ sku: m.sku, wh: m.wh, bin: m.bin, qty: m.qty, batch: m.batch || `B26-${Math.floor(140+Math.random()*60)}`, exp: m.exp || '2026-12-31' });
      } else if (m.type === 'OUT') {
        let remaining = m.qty;
        const candidates = copy.filter(s => s.sku === m.sku && s.wh === m.wh && s.bin === m.bin)
                               .sort((a,b) => new Date(a.exp) - new Date(b.exp));
        for (const c of candidates) {
          if (remaining <= 0) break;
          const take = Math.min(c.qty, remaining);
          c.qty -= take; remaining -= take;
        }
      } else if (m.type === 'MV') {
        const [fromWh, toWh] = (m.wh || '').split('->');
        const [fromBin, toBin] = (m.bin || '').split('→');
        const fromItems = copy.filter(s => s.sku === m.sku && s.wh === fromWh && s.bin === fromBin)
                              .sort((a,b) => new Date(a.exp) - new Date(b.exp));
        let remaining = m.qty;
        const movedBatches = [];
        for (const c of fromItems) {
          if (remaining <= 0) break;
          const take = Math.min(c.qty, remaining);
          c.qty -= take; remaining -= take;
          movedBatches.push({ batch: c.batch, exp: c.exp, qty: take });
        }
        for (const b of movedBatches) {
          const dest = copy.find(s => s.sku === m.sku && s.wh === toWh && s.bin === toBin && s.batch === b.batch);
          if (dest) dest.qty += b.qty;
          else copy.push({ sku: m.sku, wh: toWh, bin: toBin, qty: b.qty, batch: b.batch, exp: b.exp });
        }
      }
      return copy.filter(s => s.qty > 0.0001);
    });
  }

  const meta = {
    dashboard:    { title: 'แดชบอร์ด', sub: 'ภาพรวมระบบสต็อกชาบู — อัปเดตล่าสุดเมื่อสักครู่' },
    receive:      { title: 'รับเข้าสินค้า', sub: 'บันทึกของที่รับเข้าจากผู้จำหน่าย' },
    issue:        { title: 'จ่ายออก', sub: 'จ่ายของไปยังสาขา / ครัวกลาง' },
    transfer:     { title: 'ย้ายระหว่างคลัง', sub: 'โอนของระหว่างคลังภายใน' },
    stock:        { title: 'รายการสินค้า', sub: 'จัดการ SKU และดูรายละเอียดสต็อก' },
    location:     { title: 'คลัง / Bin', sub: 'จัดการตำแหน่งจัดเก็บสินค้า 2 ชั้น (คลัง → Bin)' },
    report_stock: { title: 'รายงานสินค้าคงเหลือ', sub: 'สรุปสต็อก ณ ปัจจุบัน' },
    report_move:  { title: 'รายงานความเคลื่อนไหว', sub: 'ประวัติทุกธุรกรรมในระบบ' },
  };

  const lowStockCount = window.DATA.skus.filter(s => {
    const total = stock.filter(x => x.sku === s.id).reduce((a,b) => a+b.qty, 0);
    if (total <= 0) return true;
    if (total < s.min) return true;
    return false;
  }).length;

  const fabAction = {
    dashboard: { icon: 'plus', label: 'รับเข้าสินค้า', go: () => setRoute('receive') },
    stock:     { icon: 'plus', label: 'เพิ่มสินค้าใหม่', go: () => {} },
    location:  { icon: 'plus', label: 'เพิ่ม Bin', go: () => {} },
  }[route];

  // Palette swatch options for TweakColor
  const paletteOptions = Object.entries(PALETTES).map(([k, p]) => [p.a400, p.a500, p.a600]);
  const paletteKeys    = Object.keys(PALETTES);
  const currentPalette = paletteOptions[paletteKeys.indexOf(t.palette)] || paletteOptions[0];

  return (
    <ToastProvider>
      <div className={`app density-${t.density} atmo-${t.atmosphere}`}>
        <Sidebar route={route} setRoute={setRoute} lowStockCount={lowStockCount} />
        <main className="main">
          <Topbar title={meta[route]?.title} sub={meta[route]?.sub} />

          {route === 'dashboard'    && <DashboardScreen     store={store} setRoute={setRoute} />}
          {route === 'receive'      && <ReceiveScreen        store={store} doMovement={doMovement} />}
          {route === 'issue'        && <IssueScreen          store={store} doMovement={doMovement} />}
          {route === 'transfer'     && <TransferScreen       store={store} doMovement={doMovement} />}
          {route === 'stock'        && <StockScreen          store={store} setRoute={setRoute} />}
          {route === 'location'     && <LocationScreen       store={store} />}
          {route === 'report_stock' && <ReportStockScreen    store={store} />}
          {route === 'report_move'  && <ReportMoveScreen     store={store} />}
        </main>

        {fabAction && (
          <button className="fab" onClick={fabAction.go} title={fabAction.label}>
            <Icon name={fabAction.icon} size={22} />
          </button>
        )}

        <TweaksPanel title="Tweaks">
          <TweakSection label="Accent palette" />
          <TweakColor
            label="วิบ (Vibe)"
            value={currentPalette}
            options={paletteOptions}
            onChange={(v) => {
              const idx = paletteOptions.findIndex(p => p[0] === v[0] && p[1] === v[1]);
              setTweak('palette', paletteKeys[idx] || 'indigo');
            }} />
          <div className="twk-val" style={{padding:'2px 2px 4px'}}>{PALETTES[t.palette]?.name}</div>

          <TweakSection label="Density" />
          <TweakRadio
            label="ความหนาแน่น"
            value={t.density}
            options={['compact', 'standard', 'spacious']}
            onChange={(v) => setTweak('density', v)} />

          <TweakSection label="Atmosphere" />
          <TweakRadio
            label="บรรยากาศ"
            value={t.atmosphere}
            options={['calm', 'standard', 'energetic']}
            onChange={(v) => setTweak('atmosphere', v)} />
          <div className="twk-val" style={{padding:'2px 2px 4px', lineHeight: 1.4}}>
            {t.atmosphere === 'calm' && 'blur เบา · ambient จาง · animation ช้า — เหมาะกับงานเอกสาร'}
            {t.atmosphere === 'standard' && 'ค่ามาตรฐาน — สมดุลระหว่าง info density กับ visual feel'}
            {t.atmosphere === 'energetic' && 'blur หนา · glow แรง · animation เร็ว — feel แบบ command center'}
          </div>
        </TweaksPanel>
      </div>
    </ToastProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
