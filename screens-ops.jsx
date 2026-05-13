// =============================================
// Dashboard, Receiving, Issuing, Transfer screens
// =============================================

const { useState: useS1, useEffect: useE1, useMemo: useM1 } = React;

// ============================================
// DASHBOARD
// ============================================
function DashboardScreen({ store, setRoute }) {
  const { skus, stock, movements, dailySeries, warehouses } = store;
  const toast = useToast();

  const totalSkus = skus.length;
  const totalQty = stock.reduce((a, b) => a + b.qty, 0);
  const totalValue = stock.reduce((a, b) => {
    const s = skus.find(x => x.id === b.sku);
    return a + (s ? s.cost * b.qty : 0);
  }, 0);

  const lowStock = skus.filter(s => UTIL.stockStatus(s.id) === 'low' || UTIL.stockStatus(s.id) === 'out');

  // Expiry soon: within 5 days
  const expiringSoon = stock
    .map(s => ({ ...s, daysLeft: UTIL.daysUntil(s.exp), sku: skus.find(x => x.id === s.sku) }))
    .filter(s => s.daysLeft <= 5)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Recent movements
  const recent = [...movements].slice(0, 6);

  // Movement totals last 7 days
  const last7 = dailySeries.slice(-7);
  const inTotal = last7.reduce((a, b) => a + b.in, 0);
  const outTotal = last7.reduce((a, b) => a + b.out, 0);

  // Donut by category value
  const catColors = {
    'เนื้อนำเข้า':  '#6366f1',
    'เนื้อสด':      '#22d3ee',
    'แปรรูป':       '#f59e0b',
    'ผัก/เห็ด':     '#10b981',
    'แห้ง':         '#a78bfa',
    'น้ำซุป/ซอส':   '#f43f5e',
  };
  const catData = useM1(() => {
    const map = {};
    stock.forEach(st => {
      const sku = skus.find(x => x.id === st.sku);
      if (!sku) return;
      map[sku.category] = (map[sku.category] || 0) + sku.cost * st.qty;
    });
    return Object.entries(map).map(([k, v]) => ({ label: k, value: Math.round(v), color: catColors[k] || '#888' }));
  }, [stock, skus]);

  return (
    <div className="content page-enter">
      {/* KPIs */}
      <div className="kpi-grid stagger">
        <div className="card kpi card-pad">
          <div className="kpi-label">
            <div className="kpi-icon"><Icon name="box" size={15} /></div>
            มูลค่าสต็อกรวม
          </div>
          <div className="kpi-value">
            ฿<Counter to={totalValue} duration={1100} format={(n) => n.toLocaleString('en-US')} />
          </div>
          <div className="kpi-delta up"><Icon name="trend_up" size={11} />+8.4% vs 7 วันก่อน</div>
        </div>

        <div className="card kpi card-pad">
          <div className="kpi-label">
            <div className="kpi-icon" style={{background:'rgba(16,185,129,0.14)', color:'var(--emerald-400)'}}><Icon name="in" size={15} /></div>
            รับเข้า 7 วัน
          </div>
          <div className="kpi-value">
            <Counter to={inTotal} duration={900} /><span className="kpi-unit">รายการ</span>
          </div>
          <div className="kpi-delta up"><Icon name="trend_up" size={11} />+12% vs สัปดาห์ก่อน</div>
        </div>

        <div className="card kpi card-pad">
          <div className="kpi-label">
            <div className="kpi-icon" style={{background:'rgba(244,63,94,0.14)', color:'var(--rose-400)'}}><Icon name="out" size={15} /></div>
            จ่ายออก 7 วัน
          </div>
          <div className="kpi-value">
            <Counter to={outTotal} duration={900} /><span className="kpi-unit">รายการ</span>
          </div>
          <div className="kpi-delta down"><Icon name="trend_down" size={11} />-3% vs สัปดาห์ก่อน</div>
        </div>

        <div className="card kpi card-pad">
          <div className="kpi-label">
            <div className="kpi-icon" style={{background:'rgba(245,158,11,0.14)', color:'var(--amber-400)'}}><Icon name="warn" size={15} /></div>
            ต้องระวัง
          </div>
          <div className="kpi-value">
            <Counter to={lowStock.length + expiringSoon.length} duration={900} /><span className="kpi-unit">รายการ</span>
          </div>
          <div className="row" style={{marginTop: 8, gap: 6, fontSize: 11}}>
            <span className="chip" style={{padding: '2px 8px'}}>ต่ำกว่ามินิมั่ม {lowStock.length}</span>
            <span className="chip" style={{padding: '2px 8px'}}>ใกล้หมดอายุ {expiringSoon.length}</span>
          </div>
        </div>
      </div>

      <div className="grid-2-1 stagger">
        {/* Movement chart */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-h-title">ความเคลื่อนไหว 14 วันที่ผ่านมา</div>
              <div className="card-h-sub">เปรียบเทียบรายการรับเข้า / จ่ายออก ต่อวัน</div>
            </div>
            <div className="row gap-12">
              <div className="row" style={{gap: 6, fontSize: 12}}>
                <span style={{width:10,height:10,borderRadius:3,background:'var(--indigo-500)'}}></span><span className="muted">รับเข้า</span>
              </div>
              <div className="row" style={{gap: 6, fontSize: 12}}>
                <span style={{width:10,height:10,borderRadius:3,background:'var(--rose-500)'}}></span><span className="muted">จ่ายออก</span>
              </div>
              <div className="tabs"><div className="tab active">วัน</div><div className="tab">สัปดาห์</div></div>
            </div>
          </div>
          <div className="card-pad">
            <BarChart series={dailySeries} />
          </div>
        </div>

        {/* Category donut */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-h-title">สัดส่วนมูลค่าสต็อก</div>
              <div className="card-h-sub">แยกตามหมวดสินค้า</div>
            </div>
          </div>
          <div className="card-pad row" style={{gap: 28}}>
            <Donut
              segments={catData}
              centerValue={`฿${(totalValue/1000).toFixed(0)}k`}
              centerLabel="มูลค่ารวม"
            />
            <div className="legend" style={{flex: 1, minWidth: 0}}>
              {catData.map(c => (
                <div className="legend-row" key={c.label}>
                  <span className="dot" style={{background: c.color}}></span>
                  <span style={{flex:1}}>{c.label}</span>
                  <span className="mono muted small">฿{c.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2-1 stagger mt-24">
        {/* Recent activity */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-h-title">ความเคลื่อนไหวล่าสุด</div>
              <div className="card-h-sub">บันทึก movement แบบเรียลไทม์</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setRoute('report_move')}>
              ดูทั้งหมด <Icon name="chevron_r" size={13} />
            </button>
          </div>
          <div style={{padding: '4px 22px 12px'}}>
            {recent.map(m => {
              const sku = skus.find(s => s.id === m.sku);
              const cls = m.type === 'IN' ? 'in' : m.type === 'OUT' ? 'out' : m.type === 'MV' ? 'mv' : 'adj';
              const ic  = m.type === 'IN' ? 'in' : m.type === 'OUT' ? 'out' : m.type === 'MV' ? 'move' : 'edit';
              const sign = m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : '';
              return (
                <div className="activity" key={m.id}>
                  <div className={`activity-dot ${cls}`}><Icon name={ic} size={14} /></div>
                  <div className="activity-body">
                    <div className="activity-title">
                      {m.type === 'IN' && 'รับเข้า'}
                      {m.type === 'OUT' && 'จ่ายออก'}
                      {m.type === 'MV' && 'ย้ายระหว่างคลัง'}
                      {m.type === 'ADJ' && 'ปรับปรุงสต็อก'}
                      <span className="muted-2"> · </span>
                      <span className="semibold">{sku?.name}</span>
                    </div>
                    <div className="activity-meta">
                      <span className="mono">{m.ref}</span> · {m.user} · {UTIL.thaiTimeAgo(m.ts)} · {m.bin || m.wh}
                    </div>
                  </div>
                  <div className={`activity-qty ${cls}`}>
                    {sign}{UTIL.fmt(Math.abs(m.qty))}<span className="muted small" style={{fontWeight:400, marginLeft: 3}}>{sku?.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        <div className="col gap-16">
          <div className="card">
            <div className="card-h">
              <div className="row gap-8">
                <Icon name="warn" size={15} style={{color:'var(--amber-400)'}} />
                <div className="card-h-title">ของใกล้หมดอายุ</div>
              </div>
              <span className="chip" style={{color:'var(--amber-400)'}}>{expiringSoon.length}</span>
            </div>
            <div style={{padding: '4px 22px 16px'}}>
              {expiringSoon.length === 0 && <div className="muted small mt-8">ไม่มี — ทุกอย่างเรียบร้อย ✓</div>}
              {expiringSoon.slice(0, 4).map((s, i) => {
                const cls = s.daysLeft <= 1 ? 'badge-danger' : s.daysLeft <= 3 ? 'badge-warn' : 'badge-info';
                return (
                  <div className="activity" key={i}>
                    <div className="sku-thumb" style={{width: 30, height: 30, fontSize: 14}}>{s.sku?.emoji}</div>
                    <div className="activity-body">
                      <div className="activity-title">{s.sku?.name}</div>
                      <div className="activity-meta">
                        <span className="mono">{s.batch}</span> · {s.wh} / {s.bin} · {UTIL.fmt(s.qty)} {s.sku?.unit}
                      </div>
                    </div>
                    <span className={`badge ${cls}`}>
                      <span className="bdot"></span>
                      {s.daysLeft <= 0 ? 'หมดอายุ' : `${s.daysLeft} วัน`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <div className="row gap-8">
                <Icon name="warn" size={15} style={{color:'var(--rose-400)'}} />
                <div className="card-h-title">สต็อกต่ำ / หมด</div>
              </div>
              <span className="chip" style={{color:'var(--rose-400)'}}>{lowStock.length}</span>
            </div>
            <div style={{padding: '4px 22px 16px'}}>
              {lowStock.length === 0 && <div className="muted small mt-8">ไม่มี — สต็อกอยู่ในระดับปกติ ✓</div>}
              {lowStock.slice(0, 4).map(sku => {
                const total = UTIL.totalQty(sku.id);
                const pct = Math.min(100, (total / sku.min) * 100);
                return (
                  <div className="activity" key={sku.id} style={{flexDirection: 'column', alignItems: 'stretch', gap: 8}}>
                    <div className="row" style={{gap: 12, alignItems: 'flex-start'}}>
                      <div className="sku-thumb" style={{width: 30, height: 30, fontSize: 14}}>{sku.emoji}</div>
                      <div className="activity-body">
                        <div className="activity-title">{sku.name}</div>
                        <div className="activity-meta">
                          คงเหลือ <span className="num bold" style={{color:'var(--rose-400)'}}>{UTIL.fmt(total)} {sku.unit}</span>
                          {' '}/ ขั้นต่ำ {sku.min} {sku.unit}
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => setRoute('receive')}>สั่งซื้อ</button>
                    </div>
                    <div className="progress"><div className={`progress-fill ${pct < 60 ? 'danger' : 'warn'}`} style={{width: `${pct}%`}}></div></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Bar chart used by dashboard ----
function BarChart({ series }) {
  const max = Math.max(...series.flatMap(d => [d.in, d.out]));
  const h = 200;
  return (
    <div className="row" style={{alignItems: 'flex-end', height: h + 40, gap: 8, position: 'relative'}}>
      {/* horizontal grid */}
      <div style={{position:'absolute', left: 0, right: 0, top: 0, height: h, pointerEvents: 'none'}}>
        {[0, 25, 50, 75, 100].map(p => (
          <div key={p} style={{
            position:'absolute', left: 0, right: 0,
            top: `${p}%`, borderTop: '1px dashed rgba(255,255,255,0.04)'
          }}></div>
        ))}
      </div>
      {series.map((d, i) => (
        <div key={i} style={{flex: 1, display:'flex', flexDirection:'column', alignItems:'center', gap: 6}}>
          <div style={{display:'flex', alignItems:'flex-end', gap: 3, height: h, width: '100%', justifyContent: 'center'}}>
            <div style={{
              width: '40%', minWidth: 7,
              height: `${(d.in / max) * 100}%`,
              background: 'linear-gradient(180deg, var(--indigo-400), var(--indigo-600))',
              borderRadius: '4px 4px 1px 1px',
              boxShadow: '0 4px 12px -2px var(--indigo-glow)',
              transition: 'height 0.6s cubic-bezier(.4,0,.2,1)',
              transitionDelay: `${i * 30}ms`,
            }} title={`รับเข้า ${d.in}`}></div>
            <div style={{
              width: '40%', minWidth: 7,
              height: `${(d.out / max) * 100}%`,
              background: 'linear-gradient(180deg, var(--rose-400), var(--rose-500))',
              borderRadius: '4px 4px 1px 1px',
              transition: 'height 0.6s cubic-bezier(.4,0,.2,1)',
              transitionDelay: `${i * 30 + 80}ms`,
            }} title={`จ่ายออก ${d.out}`}></div>
          </div>
          <div className="mono smaller muted" style={{fontSize: 10}}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// RECEIVING
// ============================================
function ReceiveScreen({ store, doMovement }) {
  const { skus, warehouses, suppliers, movements } = store;
  const toast = useToast();
  const [lines, setLines] = useState([emptyLine()]);
  const [supplier, setSupplier] = useState('SUP-01');
  const [ref, setRef] = useState(`PO-2026-${Math.floor(319 + Math.random()*5)}`);
  const [showScanner, setShowScanner] = useState(false);

  function emptyLine() {
    return { sku: '', qty: '', wh: 'WH-COLD', bin: '', batch: `B26-${String(140 + Math.floor(Math.random()*60))}`, exp: '' };
  }

  function updLine(i, k, v) {
    setLines(ls => ls.map((l, idx) => idx === i ? { ...l, [k]: v, ...(k === 'wh' ? { bin: '' } : {}) } : l));
  }
  function addLine() { setLines(ls => [...ls, emptyLine()]); }
  function rmLine(i) { setLines(ls => ls.filter((_, idx) => idx !== i)); }

  function submit() {
    const valid = lines.filter(l => l.sku && Number(l.qty) > 0 && l.bin);
    if (!valid.length) {
      toast({ kind: 'warn', title: 'ยังกรอกข้อมูลไม่ครบ', msg: 'ต้องเลือก SKU, จำนวน และ Bin อย่างน้อย 1 รายการ' });
      return;
    }
    valid.forEach(l => doMovement({
      type: 'IN', sku: l.sku, qty: Number(l.qty), wh: l.wh, bin: l.bin,
      batch: l.batch, exp: l.exp, ref, supplier
    }));
    toast({ kind: 'success', title: `รับเข้า ${valid.length} รายการเรียบร้อย`, msg: `เอกสาร ${ref} ได้อัปเดตสต็อกแล้ว` });
    setLines([emptyLine()]);
    setRef(`PO-2026-${Math.floor(319 + Math.random()*5)}`);
  }

  return (
    <div className="content page-enter">
      <div className="grid-2-1">
        <div className="col gap-16">
          <div className="card">
            <div className="card-h">
              <div>
                <div className="card-h-title">รายละเอียดการรับเข้า</div>
                <div className="card-h-sub">บันทึกของที่รับเข้าตามใบสั่งซื้อ</div>
              </div>
              <span className="badge badge-info"><span className="bdot"></span>ร่าง</span>
            </div>
            <div className="card-pad">
              <div className="field-row-3">
                <div className="field">
                  <label className="field-label">เลขใบสั่งซื้อ (PO)</label>
                  <input className="input mono" value={ref} onChange={e => setRef(e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">ผู้จำหน่าย</label>
                  <select className="select" value={supplier} onChange={e => setSupplier(e.target.value)}>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">วันที่รับเข้า</label>
                  <input className="input" type="date" defaultValue="2026-05-13" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <div>
                <div className="card-h-title">รายการสินค้า ({lines.length})</div>
                <div className="card-h-sub">เพิ่ม / แก้ไขรายการที่จะรับเข้า</div>
              </div>
              <div className="row gap-8">
                <button className="btn btn-ghost btn-sm" onClick={() => setShowScanner(true)}>
                  <Icon name="qr" size={13} />สแกน QR
                </button>
                <button className="btn btn-ghost btn-sm" onClick={addLine}>
                  <Icon name="plus" size={13} />เพิ่มรายการ
                </button>
              </div>
            </div>
            <div className="card-pad">
              <div className="col gap-12">
                {lines.map((l, i) => (
                  <LineRow key={i} idx={i} line={l} skus={skus} warehouses={warehouses}
                           onChange={(k, v) => updLine(i, k, v)}
                           onRemove={() => rmLine(i)} canRemove={lines.length > 1}
                           kind="IN" />
                ))}
              </div>
            </div>
          </div>

          {/* Recent receipts */}
          <div className="card">
            <div className="card-h">
              <div>
                <div className="card-h-title">ใบรับเข้าล่าสุด</div>
                <div className="card-h-sub">ดูประวัติย้อนหลัง</div>
              </div>
              <button className="btn btn-ghost btn-sm">ดูทั้งหมด <Icon name="chevron_r" size={13} /></button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>เลขเอกสาร</th>
                    <th>สินค้า</th>
                    <th>จำนวน</th>
                    <th>ปลายทาง</th>
                    <th>เวลา</th>
                    <th>ผู้บันทึก</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.filter(m => m.type === 'IN').slice(0, 5).map(m => {
                    const sku = skus.find(s => s.id === m.sku);
                    return (
                      <tr key={m.id}>
                        <td className="mono">{m.ref}</td>
                        <td><div className="row gap-8"><span style={{fontSize:16}}>{sku?.emoji}</span><span>{sku?.name}</span></div></td>
                        <td className="num right" style={{color:'var(--emerald-400)'}}>+{UTIL.fmt(m.qty)} <span className="muted small">{sku?.unit}</span></td>
                        <td><span className="chip">{UTIL.whById(m.wh)?.name} / {m.bin}</span></td>
                        <td className="small muted">{UTIL.thaiTimeAgo(m.ts)}</td>
                        <td className="small">{m.user}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary panel */}
        <div className="col gap-16">
          <div className="card">
            <div className="card-h">
              <div className="card-h-title">สรุปการรับเข้า</div>
            </div>
            <div className="card-pad">
              <SummaryPanel lines={lines} skus={skus} type="IN" />
              <button className="btn btn-success" style={{width: '100%', marginTop: 14}} onClick={submit}>
                <Icon name="check" size={15} />ยืนยันรับเข้าสต็อก
              </button>
              <button className="btn btn-ghost" style={{width: '100%', marginTop: 8}}>
                <Icon name="download" size={14} />บันทึกเป็นร่าง
              </button>
            </div>
          </div>

          <div className="card card-pad">
            <div className="row-between mb-8">
              <div className="bold">เคล็ดลับ</div>
              <Icon name="info" size={15} style={{color: 'var(--indigo-300)'}} />
            </div>
            <div className="small muted">
              ระบบจะอัปเดตสต็อกของแต่ละ <b>Bin</b> โดยอัตโนมัติเมื่อยืนยันการรับเข้า และจะสร้าง batch number ใหม่หากไม่ระบุ
            </div>
          </div>
        </div>
      </div>

      <Modal open={showScanner} onClose={() => setShowScanner(false)}>
        <div className="modal-h">
          <div className="modal-title">สแกน QR / Barcode</div>
          <div className="modal-sub">เล็ง QR code ของกล่องสินค้าให้อยู่ในกรอบ</div>
        </div>
        <div className="modal-body">
          <div className="scanner">
            <div className="scanner-frame"><i></i></div>
            <div className="scanner-line" style={{top: '20%'}}></div>
            <div style={{position:'absolute', bottom: 16, left: 16, right: 16}} className="row gap-8">
              <span className="chip"><span className="bdot pulse" style={{width:8,height:8,borderRadius:'50%',background:'var(--emerald-400)'}}></span>กำลังสแกน...</span>
            </div>
          </div>
          <div className="mt-16 small muted">
            <b>เคล็ดลับ:</b> เปิดไฟให้สว่าง วาง QR ห่างกล้องประมาณ 15–20 ซม.
          </div>
        </div>
        <div className="modal-f">
          <button className="btn btn-ghost" onClick={() => setShowScanner(false)}>ยกเลิก</button>
          <button className="btn btn-primary" onClick={() => {
            // simulate scan
            updLine(lines.length - 1, 'sku', 'SHB-001');
            updLine(lines.length - 1, 'qty', '8');
            setShowScanner(false);
            toast({ kind: 'success', title: 'สแกนสำเร็จ', msg: 'พบสินค้า: เนื้อวากิว A5 สไลซ์ (8 กก.)' });
          }}>เพิ่มรายการที่สแกน</button>
        </div>
      </Modal>
    </div>
  );
}

function LineRow({ idx, line, skus, warehouses, onChange, onRemove, canRemove, kind }) {
  const sku = skus.find(s => s.id === line.sku);
  const wh = warehouses.find(w => w.id === line.wh);
  return (
    <div className="glass card-pad-sm" style={{display:'grid', gridTemplateColumns: '32px 1fr 110px 1fr 110px 36px', gap: 12, alignItems: 'flex-start'}}>
      <div className="num center muted" style={{fontFamily:'var(--font-mono)', fontSize: 13, paddingTop: 30}}>{String(idx+1).padStart(2,'0')}</div>

      <div>
        <label className="field-label">สินค้า (SKU)</label>
        <select className="select" value={line.sku} onChange={e => onChange('sku', e.target.value)}>
          <option value="">– เลือกสินค้า –</option>
          {skus.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name} ({s.id})</option>)}
        </select>
        {kind === 'IN' && (
          <div className="field-row mt-8">
            <div>
              <label className="field-label">Batch / Lot</label>
              <input className="input mono" value={line.batch} onChange={e => onChange('batch', e.target.value)} />
            </div>
            <div>
              <label className="field-label">หมดอายุ</label>
              <input className="input" type="date" value={line.exp} onChange={e => onChange('exp', e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="field-label">จำนวน {sku && <span className="muted">({sku.unit})</span>}</label>
        <input className="input num right" type="number" value={line.qty}
               onChange={e => onChange('qty', e.target.value)} placeholder="0" />
      </div>

      <div>
        <label className="field-label">คลัง</label>
        <select className="select" value={line.wh} onChange={e => onChange('wh', e.target.value)}>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
        </select>
      </div>

      <div>
        <label className="field-label">Bin</label>
        <select className="select mono" value={line.bin} onChange={e => onChange('bin', e.target.value)}>
          <option value="">– เลือก Bin –</option>
          {wh?.bins.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div style={{paddingTop: 22}}>
        {canRemove && (
          <button className="icon-btn" style={{width: 32, height: 32}} onClick={onRemove}>
            <Icon name="trash" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryPanel({ lines, skus, type }) {
  const valid = lines.filter(l => l.sku && Number(l.qty) > 0);
  const totalLines = valid.length;
  const totalQty = valid.reduce((a, l) => a + Number(l.qty), 0);
  const totalValue = valid.reduce((a, l) => {
    const s = skus.find(x => x.id === l.sku);
    return a + (s ? (type === 'IN' ? s.cost : s.price) * Number(l.qty) : 0);
  }, 0);
  return (
    <div className="col gap-12">
      <div className="row-between">
        <span className="muted small">รายการทั้งหมด</span>
        <span className="num bold large"><Counter to={totalLines} /></span>
      </div>
      <div className="row-between">
        <span className="muted small">จำนวนรวม</span>
        <span className="num bold large"><Counter to={totalQty} decimals={1} /></span>
      </div>
      <div style={{height: 1, background: 'var(--glass-border)', margin: '4px 0'}}></div>
      <div className="row-between">
        <span className="muted small">มูลค่ารวม {type === 'IN' ? '(ต้นทุน)' : '(ราคาขาย)'}</span>
        <span className="num bold xl" style={{color: type === 'IN' ? 'var(--emerald-400)' : 'var(--indigo-300)'}}>
          ฿<Counter to={totalValue} format={(n) => n.toLocaleString('en-US')} />
        </span>
      </div>
    </div>
  );
}

// ============================================
// ISSUING
// ============================================
function IssueScreen({ store, doMovement }) {
  const { skus, warehouses, stock, movements } = store;
  const toast = useToast();
  const [lines, setLines] = useState([{ sku: '', qty: '', wh: 'WH-COLD', bin: '' }]);
  const [dept, setDept] = useState('สาขาทองหล่อ');
  const [ref, setRef] = useState(`IS-2026-${Math.floor(402 + Math.random()*8)}`);

  function updLine(i, k, v) {
    setLines(ls => ls.map((l, idx) => idx === i ? { ...l, [k]: v, ...(k === 'wh' ? { bin: '' } : {}) } : l));
  }
  function addLine() { setLines(ls => [...ls, { sku: '', qty: '', wh: 'WH-COLD', bin: '' }]); }
  function rmLine(i) { setLines(ls => ls.filter((_, idx) => idx !== i)); }

  function submit() {
    const valid = lines.filter(l => l.sku && Number(l.qty) > 0 && l.bin);
    if (!valid.length) {
      toast({ kind: 'warn', title: 'ยังกรอกข้อมูลไม่ครบ' });
      return;
    }
    // check stock
    for (const l of valid) {
      const avail = stock.filter(s => s.sku === l.sku && s.wh === l.wh && s.bin === l.bin).reduce((a, b) => a + b.qty, 0);
      if (avail < Number(l.qty)) {
        const sku = skus.find(s => s.id === l.sku);
        toast({ kind: 'error', title: 'สต็อกไม่พอ', msg: `${sku?.name} ที่ ${l.wh}/${l.bin} เหลือเพียง ${avail} ${sku?.unit}` });
        return;
      }
    }
    valid.forEach(l => doMovement({
      type: 'OUT', sku: l.sku, qty: Number(l.qty), wh: l.wh, bin: l.bin, ref, dept
    }));
    toast({ kind: 'success', title: `จ่ายออก ${valid.length} รายการเรียบร้อย`, msg: `เอกสาร ${ref} ถูกบันทึก` });
    setLines([{ sku: '', qty: '', wh: 'WH-COLD', bin: '' }]);
    setRef(`IS-2026-${Math.floor(402 + Math.random()*8)}`);
  }

  return (
    <div className="content page-enter">
      <div className="grid-2-1">
        <div className="col gap-16">
          <div className="card">
            <div className="card-h">
              <div>
                <div className="card-h-title">รายละเอียดการจ่ายออก</div>
                <div className="card-h-sub">บันทึกของที่ส่งออกไปยังสาขา / ครัว</div>
              </div>
              <span className="badge badge-warn"><span className="bdot"></span>รอยืนยัน</span>
            </div>
            <div className="card-pad">
              <div className="field-row-3">
                <div className="field">
                  <label className="field-label">เลขเอกสาร</label>
                  <input className="input mono" value={ref} onChange={e => setRef(e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">ปลายทาง</label>
                  <select className="select" value={dept} onChange={e => setDept(e.target.value)}>
                    <option>สาขาทองหล่อ</option>
                    <option>สาขาเอกมัย</option>
                    <option>สาขาสาทร</option>
                    <option>สาขาอารีย์</option>
                    <option>ครัวกลาง</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">วันที่จ่ายออก</label>
                  <input className="input" type="date" defaultValue="2026-05-13" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <div>
                <div className="card-h-title">รายการที่จะจ่ายออก ({lines.length})</div>
                <div className="card-h-sub">ระบบจะหักสต็อกอัตโนมัติเมื่อยืนยัน · ใช้ FEFO (หมดอายุก่อน — ออกก่อน)</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={addLine}>
                <Icon name="plus" size={13} />เพิ่มรายการ
              </button>
            </div>
            <div className="card-pad">
              <div className="col gap-12">
                {lines.map((l, i) => (
                  <IssueLineRow key={i} idx={i} line={l} skus={skus} warehouses={warehouses} stock={stock}
                                onChange={(k, v) => updLine(i, k, v)}
                                onRemove={() => rmLine(i)} canRemove={lines.length > 1} />
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <div>
                <div className="card-h-title">การจ่ายออกล่าสุด</div>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>เอกสาร</th><th>สินค้า</th><th>จำนวน</th><th>ปลายทาง</th><th>เวลา</th></tr>
                </thead>
                <tbody>
                  {movements.filter(m => m.type === 'OUT').slice(0, 5).map(m => {
                    const sku = skus.find(s => s.id === m.sku);
                    return (
                      <tr key={m.id}>
                        <td className="mono">{m.ref}</td>
                        <td><div className="row gap-8"><span style={{fontSize:16}}>{sku?.emoji}</span><span>{sku?.name}</span></div></td>
                        <td className="num right" style={{color:'var(--rose-400)'}}>-{UTIL.fmt(m.qty)} <span className="muted small">{sku?.unit}</span></td>
                        <td><span className="chip">{m.dept}</span></td>
                        <td className="small muted">{UTIL.thaiTimeAgo(m.ts)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col gap-16">
          <div className="card">
            <div className="card-h">
              <div className="card-h-title">สรุปการจ่ายออก</div>
            </div>
            <div className="card-pad">
              <SummaryPanel lines={lines} skus={skus} type="OUT" />
              <button className="btn btn-primary" style={{width: '100%', marginTop: 14}} onClick={submit}>
                <Icon name="arrow_r" size={15} />ยืนยันการจ่ายออก
              </button>
              <button className="btn btn-ghost" style={{width: '100%', marginTop: 8}}>
                <Icon name="download" size={14} />ดาวน์โหลด PDF
              </button>
            </div>
          </div>

          <div className="card card-pad">
            <div className="row gap-8 mb-8">
              <div style={{width:32,height:32,borderRadius:8,background:'rgba(99,102,241,0.16)',color:'var(--indigo-300)',display:'grid',placeItems:'center'}}>
                <Icon name="info" size={15} />
              </div>
              <div className="bold">FEFO อัตโนมัติ</div>
            </div>
            <div className="small muted">
              ระบบจะเลือกหักจาก batch ที่ <b>หมดอายุก่อน</b> โดยอัตโนมัติเพื่อลดของเสีย หากต้องการระบุ batch เอง กดปุ่ม "เลือก batch"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IssueLineRow({ idx, line, skus, warehouses, stock, onChange, onRemove, canRemove }) {
  const sku = skus.find(s => s.id === line.sku);
  const wh = warehouses.find(w => w.id === line.wh);
  // Available bins for the selected sku at the selected warehouse
  const availBins = useMemo(() => {
    if (!line.sku || !line.wh) return [];
    return stock.filter(s => s.sku === line.sku && s.wh === line.wh)
      .map(s => ({ bin: s.bin, qty: s.qty }))
      .reduce((acc, s) => {
        const ex = acc.find(x => x.bin === s.bin);
        if (ex) ex.qty += s.qty;
        else acc.push({ ...s });
        return acc;
      }, []);
  }, [line.sku, line.wh, stock]);

  const binStock = availBins.find(b => b.bin === line.bin);
  const overflow = line.qty && binStock && Number(line.qty) > binStock.qty;

  return (
    <div className="glass card-pad-sm" style={{display:'grid', gridTemplateColumns: '32px 1fr 110px 1fr 130px 36px', gap: 12, alignItems: 'flex-start'}}>
      <div className="num center muted" style={{fontFamily:'var(--font-mono)', fontSize: 13, paddingTop: 30}}>{String(idx+1).padStart(2,'0')}</div>

      <div>
        <label className="field-label">สินค้า (SKU)</label>
        <select className="select" value={line.sku} onChange={e => onChange('sku', e.target.value)}>
          <option value="">– เลือกสินค้า –</option>
          {skus.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name} ({s.id})</option>)}
        </select>
      </div>

      <div>
        <label className="field-label">จำนวน {sku && <span className="muted">({sku.unit})</span>}</label>
        <input className={`input num right ${overflow ? '' : ''}`} type="number" value={line.qty}
               onChange={e => onChange('qty', e.target.value)} placeholder="0"
               style={overflow ? {borderColor:'var(--rose-500)', boxShadow:'0 0 0 2px rgba(244,63,94,0.16)'} : undefined} />
        {overflow && <div className="smaller" style={{color:'var(--rose-400)', marginTop: 4}}>เกินสต็อก ({binStock.qty} {sku?.unit})</div>}
      </div>

      <div>
        <label className="field-label">คลัง</label>
        <select className="select" value={line.wh} onChange={e => onChange('wh', e.target.value)}>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
        </select>
      </div>

      <div>
        <label className="field-label">Bin <span className="muted">(คงเหลือ)</span></label>
        <select className="select mono" value={line.bin} onChange={e => onChange('bin', e.target.value)}>
          <option value="">– เลือก Bin –</option>
          {availBins.map(b => <option key={b.bin} value={b.bin}>{b.bin} · {UTIL.fmt(b.qty)} {sku?.unit}</option>)}
        </select>
      </div>

      <div style={{paddingTop: 22}}>
        {canRemove && (
          <button className="icon-btn" style={{width: 32, height: 32}} onClick={onRemove}>
            <Icon name="trash" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// TRANSFER
// ============================================
function TransferScreen({ store, doMovement }) {
  const { skus, warehouses, stock } = store;
  const toast = useToast();
  const [from, setFrom] = useState({ wh: 'WH-COLD', bin: '' });
  const [to, setTo] = useState({ wh: 'WH-KIT', bin: '' });
  const [sku, setSku] = useState('');
  const [qty, setQty] = useState('');
  const fromWh = warehouses.find(w => w.id === from.wh);
  const toWh = warehouses.find(w => w.id === to.wh);

  const availBins = useMemo(() => {
    if (!sku || !from.wh) return [];
    return stock.filter(s => s.sku === sku && s.wh === from.wh);
  }, [sku, from.wh, stock]);

  function submit() {
    if (!sku || !qty || !from.bin || !to.bin) {
      toast({ kind: 'warn', title: 'กรอกข้อมูลให้ครบ' });
      return;
    }
    doMovement({ type: 'MV', sku, qty: Number(qty),
      wh: `${from.wh}->${to.wh}`, bin: `${from.bin}→${to.bin}`,
      ref: `TR-2026-${Math.floor(123 + Math.random()*10)}` });
    toast({ kind: 'success', title: 'ย้ายสต็อกเรียบร้อย', msg: `${from.wh}/${from.bin} → ${to.wh}/${to.bin}` });
    setSku(''); setQty(''); setFrom({...from, bin: ''}); setTo({...to, bin: ''});
  }

  return (
    <div className="content page-enter">
      <div className="grid-2-1">
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-h-title">ย้ายสต็อกระหว่างคลัง</div>
              <div className="card-h-sub">โอนของจากคลัง/bin หนึ่งไปอีกที่</div>
            </div>
            <span className="badge badge-info"><Icon name="move" size={11} />Transfer</span>
          </div>
          <div className="card-pad">
            <div className="field">
              <label className="field-label">เลือกสินค้า</label>
              <select className="select" value={sku} onChange={e => setSku(e.target.value)}>
                <option value="">– เลือกสินค้า –</option>
                {skus.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
              </select>
            </div>

            <div className="grid-2 mt-16" style={{gap: 18}}>
              {/* FROM */}
              <div className="glass card-pad-sm">
                <div className="row gap-8 mb-8"><Icon name="upload" size={14} style={{color:'var(--rose-400)'}} /><div className="bold">จาก (From)</div></div>
                <div className="field">
                  <label className="field-label">คลังต้นทาง</label>
                  <select className="select" value={from.wh} onChange={e => setFrom({wh: e.target.value, bin: ''})}>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Bin ต้นทาง</label>
                  <select className="select mono" value={from.bin} onChange={e => setFrom({...from, bin: e.target.value})}>
                    <option value="">– เลือก Bin –</option>
                    {availBins.map(s => <option key={s.bin} value={s.bin}>{s.bin} · {UTIL.fmt(s.qty)}</option>)}
                  </select>
                </div>
              </div>

              {/* TO */}
              <div className="glass card-pad-sm">
                <div className="row gap-8 mb-8"><Icon name="download" size={14} style={{color:'var(--emerald-400)'}} /><div className="bold">ไปยัง (To)</div></div>
                <div className="field">
                  <label className="field-label">คลังปลายทาง</label>
                  <select className="select" value={to.wh} onChange={e => setTo({wh: e.target.value, bin: ''})}>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Bin ปลายทาง</label>
                  <select className="select mono" value={to.bin} onChange={e => setTo({...to, bin: e.target.value})}>
                    <option value="">– เลือก Bin –</option>
                    {toWh?.bins.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="field mt-16">
              <label className="field-label">จำนวนที่ย้าย</label>
              <input className="input num" type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" />
            </div>

            <button className="btn btn-primary mt-16" style={{width:'100%'}} onClick={submit}>
              <Icon name="move" size={15} />ยืนยันการย้ายสต็อก
            </button>
          </div>
        </div>

        <div className="col gap-16">
          <div className="card card-pad">
            <div className="bold mb-8">สรุปการย้าย</div>
            <div className="col gap-12 small">
              <div className="row-between"><span className="muted">สินค้า</span><span>{skus.find(s => s.id === sku)?.name || '—'}</span></div>
              <div className="row-between"><span className="muted">จำนวน</span><span className="num bold">{qty || '0'} {skus.find(s=>s.id===sku)?.unit}</span></div>
              <div className="row" style={{justifyContent:'center', padding: '14px 0', gap: 12}}>
                <span className="chip" style={{color:'var(--rose-400)'}}>{fromWh?.icon} {fromWh?.name} / {from.bin || '—'}</span>
                <Icon name="arrow_r" size={16} style={{color:'var(--text-3)'}} />
                <span className="chip" style={{color:'var(--emerald-400)'}}>{toWh?.icon} {toWh?.name} / {to.bin || '—'}</span>
              </div>
            </div>
          </div>

          <div className="card card-pad">
            <div className="row gap-8 mb-8">
              <Icon name="info" size={15} style={{color:'var(--indigo-300)'}} />
              <div className="bold small">การย้ายไม่กระทบยอดรวม</div>
            </div>
            <div className="small muted">
              การ Transfer เป็นการย้ายของจริง — สต็อก <b>ต้นทางลด</b> และ <b>ปลายทางเพิ่ม</b> ด้วยจำนวนที่เท่ากัน
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  DashboardScreen, ReceiveScreen, IssueScreen, TransferScreen, BarChart,
});
