// =============================================
// Shared primitives, icons, sidebar, toast system
// =============================================

const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

// ---------- Icons (lucide-style, stroke 2) ----------
const Icon = ({ name, size = 18, ...rest }) => {
  const paths = ICONS[name];
  if (!paths) return null;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {paths}
    </svg>
  );
};

const ICONS = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>,
  in:       <><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></>,
  out:      <><path d="M12 20V8"/><path d="m17 13-5-5-5 5"/><path d="M5 4h14"/></>,
  box:      <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></>,
  layers:   <><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></>,
  report:   <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></>,
  move:     <><path d="M5 9 2 12l3 3"/><path d="M9 5l3-3 3 3"/><path d="M15 19l-3 3-3-3"/><path d="m19 9 3 3-3 3"/><path d="M2 12h20"/><path d="M12 2v20"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  search:   <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
  bell:     <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
  plus:     <><path d="M5 12h14"/><path d="M12 5v14"/></>,
  close:    <><path d="m18 6-12 12"/><path d="m6 6 12 12"/></>,
  check:    <><path d="M20 6 9 17l-5-5"/></>,
  warn:     <><path d="m21.7 16.5-8-13.9a2 2 0 0 0-3.4 0l-8 13.9a2 2 0 0 0 1.7 3h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
  info:     <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>,
  trend_up: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
  trend_down: <><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></>,
  qr:       <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3"/><path d="M17 21h4"/><path d="M21 17v4"/><path d="M14 17v.01"/><path d="M14 21v.01"/></>,
  scan:     <><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></>,
  edit:     <><path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></>,
  trash:    <><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>,
  filter:   <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  upload:   <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
  chevron_r:<><polyline points="9 18 15 12 9 6"/></>,
  chevron_l:<><polyline points="15 18 9 12 15 6"/></>,
  more:     <><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>,
  fridge:   <><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="5" y1="10" x2="19" y2="10"/><line x1="9" y1="6" x2="9" y2="7"/><line x1="9" y1="14" x2="9" y2="16"/></>,
  flame:    <><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 2.5-1.25 2.5-3 0-1-.5-2-1-2.5 0 1-.5 2-1.5 2-1 0-2-.5-2-1.5 0-1 .5-1.5 1-2-2 1-3 3-3 5a4 4 0 0 0 8 0c0-1.5-.5-3-2-4.5-.5-.5-1-.5-1.5 0-.5.5-.5 1 0 1.5"/></>,
  user:     <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  package:  <><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></>,
  arrow_r:  <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
  refresh:  <><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></>,
  pin:      <><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1Z"/></>,
  history:  <><path d="M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></>,
};

// ---------- Toast context ----------
const ToastCtx = createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { ...toast, id }]);
    setTimeout(() => {
      setToasts(t => t.map(x => x.id === id ? { ...x, leaving: true } : x));
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 320);
    }, 3400);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.leaving ? 'leaving' : ''}`}>
            <div className={`toast-icon ${t.kind || 'info'}`}>
              <Icon size={15} name={t.kind === 'success' ? 'check' : t.kind === 'warn' ? 'warn' : t.kind === 'error' ? 'close' : 'info'} />
            </div>
            <div>
              <div className="toast-title">{t.title}</div>
              {t.msg && <div className="toast-msg">{t.msg}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => useContext(ToastCtx);

// ---------- Animated counter ----------
function Counter({ to, duration = 900, decimals = 0, format = (v) => v }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  const num = decimals === 0 ? Math.round(v) : Number(v.toFixed(decimals));
  return <>{format(num)}</>;
}

// ---------- Sidebar ----------
function Sidebar({ route, setRoute, lowStockCount }) {
  const items = [
    { id: 'dashboard', label: 'แดชบอร์ด',      icon: 'dashboard' },
    { id: 'receive',   label: 'รับเข้า',        icon: 'in' },
    { id: 'issue',     label: 'จ่ายออก',        icon: 'out' },
    { id: 'transfer',  label: 'ย้ายระหว่างคลัง', icon: 'move' },
  ];
  const items2 = [
    { id: 'stock',     label: 'รายการสินค้า', icon: 'box', badge: lowStockCount },
    { id: 'location',  label: 'คลัง / Bin',   icon: 'layers' },
  ];
  const items3 = [
    { id: 'report_stock', label: 'รายงานสินค้าคงเหลือ', icon: 'report' },
    { id: 'report_move',  label: 'รายงานความเคลื่อนไหว', icon: 'history' },
  ];

  const renderItem = (it) => (
    <div key={it.id} className={`nav-item ${route === it.id ? 'active' : ''}`} onClick={() => setRoute(it.id)}>
      <Icon name={it.icon} size={18} className="nav-icon" />
      <span>{it.label}</span>
      {it.badge ? <span className="nav-badge">{it.badge}</span> : null}
    </div>
  );

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h18l-1.5 11a2 2 0 0 1-2 1.8H6.5a2 2 0 0 1-2-1.8L3 7Z"/>
            <path d="M8 7V5a4 4 0 0 1 8 0v2"/>
            <path d="M12 12v4"/>
          </svg>
        </div>
        <div className="col" style={{gap: 0}}>
          <div className="brand-name">Shabu Stock</div>
          <div className="brand-sub">ระบบสต็อกชาบู</div>
        </div>
      </div>

      <div className="nav-section-label">เมนูหลัก</div>
      {items.map(renderItem)}

      <div className="nav-section-label">ข้อมูลหลัก</div>
      {items2.map(renderItem)}

      <div className="nav-section-label">รายงาน</div>
      {items3.map(renderItem)}

      <div className="sidebar-footer">
        <div className="avatar">ภว</div>
        <div className="col">
          <div className="user-name">ภาวินี ส.</div>
          <div className="user-role">ผู้จัดการคลัง</div>
        </div>
      </div>
    </aside>
  );
}

// ---------- Topbar ----------
function Topbar({ title, sub, actions }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="topbar">
      <div className="page-title-block">
        <div className="page-title">{title}</div>
        {sub && <div className="page-sub">{sub}</div>}
      </div>
      <div className="search-bar">
        <Icon name="search" size={15} style={{color: 'var(--text-3)'}} />
        <input placeholder="ค้นหา SKU, รหัสเอกสาร, คลัง..." />
        <span className="kbd">⌘K</span>
      </div>
      <button className="icon-btn"><Icon name="scan" size={17} /></button>
      <button className="icon-btn">
        <Icon name="bell" size={17} />
        <span className="dot"></span>
      </button>
      {actions}
    </div>
  );
}

// ---------- Status helpers ----------
function StockStatusBadge({ status, fontSize }) {
  const map = {
    good:  { cls: 'badge-good',   label: 'ปกติ' },
    warn:  { cls: 'badge-warn',   label: 'ใกล้หมด' },
    low:   { cls: 'badge-warn',   label: 'ต่ำกว่ามินิมั่ม' },
    out:   { cls: 'badge-danger', label: 'หมดสต็อก' },
  };
  const v = map[status] || map.good;
  return <span className={`badge ${v.cls}`} style={fontSize ? {fontSize} : undefined}><span className="bdot"></span>{v.label}</span>;
}

function MovementTypeChip({ type }) {
  const map = {
    IN:  { label: 'รับเข้า',   cls: 'badge-good',    icon: 'in' },
    OUT: { label: 'จ่ายออก',  cls: 'badge-danger',  icon: 'out' },
    MV:  { label: 'ย้ายคลัง',  cls: 'badge-info',    icon: 'move' },
    ADJ: { label: 'ปรับปรุง',  cls: 'badge-warn',    icon: 'edit' },
  };
  const v = map[type] || map.IN;
  return <span className={`badge ${v.cls}`}><Icon name={v.icon} size={10} />{v.label}</span>;
}

// ---------- Sparkline (SVG) ----------
function Sparkline({ data, w = 100, h = 32, color = 'var(--indigo-400)', fill = true }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return [x, y];
  });
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${d} L ${w} ${h} L 0 ${h} Z`;
  const gid = `sg-${Math.random().toString(36).slice(2,7)}`;
  return (
    <svg className="spark" width={w} height={h}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color}/>
    </svg>
  );
}

// ---------- Donut ----------
function Donut({ segments, size = 140, thickness = 14, centerValue, centerLabel }) {
  const total = segments.reduce((a, b) => a + b.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} style={{transform: 'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={thickness}/>
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle key={i}
                    cx={size/2} cy={size/2} r={r}
                    fill="none" stroke={s.color} strokeWidth={thickness}
                    strokeDasharray={dash} strokeDashoffset={-offset}
                    strokeLinecap="round"
                    style={{transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease'}}/>
          );
          offset += len;
          return el;
        })}
      </svg>
      {(centerValue || centerLabel) && (
        <div className="donut-center">
          <div className="col" style={{alignItems: 'center', gap: 0}}>
            <div className="v">{centerValue}</div>
            <div className="l">{centerLabel}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- SKU pill ----------
function SkuPill({ sku, dim = false }) {
  if (!sku) return null;
  return (
    <div className="sku-pill">
      <div className="sku-thumb">{sku.emoji}</div>
      <div className="col" style={{gap: 0}}>
        <div className="semibold" style={{fontSize: 12.5}}>{sku.name}</div>
        <div className="mono smaller muted">{sku.id}</div>
      </div>
    </div>
  );
}

// ---------- Modal / Drawer ----------
function Modal({ open, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Drawer({ open, onClose, children, width = 560 }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <div className="drawer" style={{width}}>{children}</div>
    </>
  );
}

// expose
Object.assign(window, {
  Icon, ICONS, Counter, Sparkline, Donut, Sidebar, Topbar,
  StockStatusBadge, MovementTypeChip, SkuPill, Modal, Drawer,
  ToastProvider, useToast,
});
