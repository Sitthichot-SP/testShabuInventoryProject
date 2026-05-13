// =============================================
// Stock list, Location, Reports
// =============================================

// ============================================
// STOCK LIST + DETAIL DRAWER
// ============================================
function StockScreen({ store, setRoute }) {
  const { skus, stock, movements } = store;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const enriched = skus.map(s => {
    const total = stock.filter(x => x.sku === s.id).reduce((a, b) => a + b.qty, 0);
    const status = UTIL.stockStatus(s.id);
    const locs = stock.filter(x => x.sku === s.id).length;
    return { ...s, total, status, locs };
  });

  const filtered = enriched.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'low' && !['low','out','warn'].includes(s.status)) return false;
    if (filter === 'good' && s.status !== 'good') return false;
    return true;
  });

  return (
    <div className="content page-enter">
      <div className="card mb-16">
        <div className="card-h">
          <div>
            <div className="card-h-title">รายการสินค้าทั้งหมด</div>
            <div className="card-h-sub">{filtered.length} จาก {skus.length} รายการ · คลิกเพื่อดูรายละเอียด</div>
          </div>
          <div className="row gap-8">
            <div className="search-bar" style={{width: 280}}>
              <Icon name="search" size={14} style={{color:'var(--text-3)'}} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา SKU หรือชื่อสินค้า..." />
            </div>
            <div className="tabs">
              <div className={`tab ${filter==='all'?'active':''}`} onClick={() => setFilter('all')}>ทั้งหมด</div>
              <div className={`tab ${filter==='low'?'active':''}`} onClick={() => setFilter('low')}>ต่ำ/หมด</div>
              <div className={`tab ${filter==='good'?'active':''}`} onClick={() => setFilter('good')}>ปกติ</div>
            </div>
            <button className="btn btn-primary"><Icon name="plus" size={14} />เพิ่มสินค้า</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>สินค้า</th>
                <th>SKU</th>
                <th>หมวด</th>
                <th className="right">คงเหลือ</th>
                <th>ระดับสต็อก</th>
                <th className="center">Locations</th>
                <th>สถานะ</th>
                <th className="right">ต้นทุน/หน่วย</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const pct = Math.min(100, (s.total / s.max) * 100);
                const cls = s.status === 'good' ? 'good' : s.status === 'low' || s.status === 'out' ? 'danger' : 'warn';
                return (
                  <tr key={s.id} onClick={() => setSelected(s.id)} style={{cursor:'pointer'}}>
                    <td>
                      <div className="row gap-12">
                        <div className="sku-thumb" style={{width:38, height:38, fontSize: 18}}>{s.emoji}</div>
                        <div className="col" style={{gap:1}}>
                          <span className="semibold">{s.name}</span>
                          <span className="muted small">{s.unit}</span>
                        </div>
                      </div>
                    </td>
                    <td className="mono">{s.id}</td>
                    <td><span className="chip">{s.category}</span></td>
                    <td className="num right bold">{UTIL.fmt(s.total)} <span className="muted small">{s.unit}</span></td>
                    <td style={{minWidth: 140}}>
                      <div className="col" style={{gap:4}}>
                        <div className="progress"><div className={`progress-fill ${cls}`} style={{width: `${pct}%`}}></div></div>
                        <div className="row-between smaller muted">
                          <span>{s.min}</span><span>{s.max}</span>
                        </div>
                      </div>
                    </td>
                    <td className="center mono">{s.locs}</td>
                    <td><StockStatusBadge status={s.status} /></td>
                    <td className="num right">{UTIL.baht(s.cost)}</td>
                    <td><Icon name="chevron_r" size={14} style={{color:'var(--text-3)'}} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <StockDetailDrawer open={!!selected} onClose={() => setSelected(null)} skuId={selected} store={store} />
    </div>
  );
}

function StockDetailDrawer({ open, onClose, skuId, store }) {
  const sku = skuId && store.skus.find(s => s.id === skuId);
  const items = sku ? store.stock.filter(s => s.sku === sku.id) : [];
  const moves = sku ? store.movements.filter(m => m.sku === sku.id).slice(0, 8) : [];
  const total = items.reduce((a, b) => a + b.qty, 0);
  const status = sku ? UTIL.stockStatus(sku.id) : 'good';

  // 30-day mock series
  const series = useMemo(() => {
    const arr = [];
    let v = total * 0.7;
    for (let i = 0; i < 30; i++) {
      v += (Math.random() - 0.45) * 5;
      arr.push(Math.max(0, v));
    }
    arr[arr.length - 1] = total;
    return arr;
  }, [total, skuId]);

  return (
    <Drawer open={open} onClose={onClose}>
      {sku && (
        <>
          <div style={{padding: '22px 26px 16px', borderBottom: '1px solid var(--glass-border)'}}>
            <div className="row-between">
              <div className="row gap-16">
                <div className="sku-thumb" style={{width:56,height:56,fontSize:28,borderRadius:14}}>{sku.emoji}</div>
                <div>
                  <div className="row gap-8">
                    <div className="xl">{sku.name}</div>
                    <StockStatusBadge status={status} />
                  </div>
                  <div className="row gap-12 mt-8 small muted">
                    <span className="mono">{sku.id}</span>
                    <span>·</span>
                    <span>{sku.category}</span>
                    <span>·</span>
                    <span>หน่วย: {sku.unit}</span>
                  </div>
                </div>
              </div>
              <button className="icon-btn" onClick={onClose}><Icon name="close" size={16} /></button>
            </div>
          </div>

          <div style={{padding: 26}}>
            {/* KPIs */}
            <div className="grid-3 mb-16" style={{gap: 12}}>
              <div className="glass card-pad-sm">
                <div className="small muted mb-8">คงเหลือรวม</div>
                <div className="num bold xl"><Counter to={total} decimals={1} /></div>
                <div className="smaller muted mt-8">หน่วย: {sku.unit}</div>
              </div>
              <div className="glass card-pad-sm">
                <div className="small muted mb-8">ขั้นต่ำ / สูงสุด</div>
                <div className="num bold xl">{sku.min}<span className="muted" style={{fontSize:16}}> / {sku.max}</span></div>
                <div className="smaller muted mt-8">{sku.unit}</div>
              </div>
              <div className="glass card-pad-sm">
                <div className="small muted mb-8">มูลค่าคงเหลือ</div>
                <div className="num bold xl">฿<Counter to={Math.round(total * sku.cost)} format={n => n.toLocaleString('en-US')} /></div>
                <div className="smaller muted mt-8">@ ฿{sku.cost.toLocaleString()}/{sku.unit}</div>
              </div>
            </div>

            {/* Trend */}
            <div className="glass card-pad-sm mb-16">
              <div className="row-between mb-8">
                <div>
                  <div className="bold">แนวโน้ม 30 วัน</div>
                  <div className="smaller muted">ระดับสต็อกตามเวลา</div>
                </div>
                <span className="chip">เฉลี่ย {UTIL.fmt(series.reduce((a,b)=>a+b,0)/series.length)} {sku.unit}</span>
              </div>
              <Sparkline data={series} w={460} h={70} color="var(--indigo-400)" />
            </div>

            {/* Locations */}
            <div className="row-between mb-8">
              <div className="bold large">รายละเอียดตาม Bin ({items.length})</div>
              <button className="btn btn-ghost btn-sm"><Icon name="move" size={13} />ย้ายสต็อก</button>
            </div>
            <div className="col gap-8 mb-16">
              {items.map((it, i) => {
                const wh = UTIL.whById(it.wh);
                const days = UTIL.daysUntil(it.exp);
                const expCls = days <= 1 ? 'badge-danger' : days <= 5 ? 'badge-warn' : 'badge-info';
                return (
                  <div key={i} className="glass card-pad-sm" style={{display:'grid',gridTemplateColumns:'48px 1fr auto auto',gap:14,alignItems:'center'}}>
                    <div style={{
                      width:42, height:42, borderRadius:10,
                      background:'rgba(99,102,241,0.12)',
                      display:'grid', placeItems:'center',
                      fontSize: 20
                    }}>{wh?.icon}</div>
                    <div className="col" style={{gap: 2}}>
                      <div className="semibold">{wh?.name} <span className="muted">/</span> <span className="mono">{it.bin}</span></div>
                      <div className="row gap-8 smaller muted">
                        <span className="mono">{it.batch}</span>
                        <span className={`badge ${expCls}`} style={{fontSize: 10, padding: '1px 6px'}}>
                          <Icon name="calendar" size={9} />หมดอายุ {UTIL.thaiDate(it.exp)}
                        </span>
                      </div>
                    </div>
                    <div className="num bold large right">{UTIL.fmt(it.qty)} <span className="muted small">{sku.unit}</span></div>
                    <button className="icon-btn" style={{width:32,height:32}}><Icon name="more" size={14} /></button>
                  </div>
                );
              })}
            </div>

            {/* Recent movements */}
            <div className="row-between mb-8 mt-16">
              <div className="bold large">ความเคลื่อนไหวล่าสุด</div>
            </div>
            <div className="col">
              {moves.map(m => {
                const sign = m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : '';
                const cls = m.type === 'IN' ? 'in' : m.type === 'OUT' ? 'out' : m.type === 'MV' ? 'mv' : 'adj';
                const ic  = m.type === 'IN' ? 'in' : m.type === 'OUT' ? 'out' : m.type === 'MV' ? 'move' : 'edit';
                return (
                  <div className="activity" key={m.id}>
                    <div className={`activity-dot ${cls}`}><Icon name={ic} size={13} /></div>
                    <div className="activity-body">
                      <div className="activity-title">
                        {m.type === 'IN' && 'รับเข้า'}
                        {m.type === 'OUT' && 'จ่ายออก' + (m.dept ? ' → '+m.dept : '')}
                        {m.type === 'MV' && 'ย้ายระหว่างคลัง'}
                        {m.type === 'ADJ' && 'ปรับปรุงสต็อก'}
                      </div>
                      <div className="activity-meta"><span className="mono">{m.ref}</span> · {UTIL.thaiTimeAgo(m.ts)} · {m.bin || m.wh}</div>
                    </div>
                    <div className={`activity-qty ${cls}`}>{sign}{UTIL.fmt(Math.abs(m.qty))}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}

// ============================================
// LOCATION
// ============================================
function LocationScreen({ store }) {
  const { warehouses, stock, skus } = store;
  const [activeWh, setActiveWh] = useState(warehouses[0].id);
  const [activeBin, setActiveBin] = useState(null);

  const wh = warehouses.find(w => w.id === activeWh);
  const binSummary = useMemo(() => {
    return wh.bins.map(bin => {
      const items = stock.filter(s => s.wh === wh.id && s.bin === bin);
      const totalQty = items.reduce((a, b) => a + b.qty, 0);
      const value = items.reduce((a, b) => {
        const sku = skus.find(s => s.id === b.sku);
        return a + (sku ? sku.cost * b.qty : 0);
      }, 0);
      return { bin, items, totalQty, value, fill: Math.min(100, items.length / 4 * 100) };
    });
  }, [wh, stock, skus]);

  const whTotalValue = binSummary.reduce((a,b) => a + b.value, 0);
  const whItems = binSummary.reduce((a,b) => a + b.items.length, 0);

  const activeBinData = activeBin ? binSummary.find(b => b.bin === activeBin) : null;

  return (
    <div className="content page-enter">
      {/* Warehouse selector cards */}
      <div className="grid-3 mb-16 stagger" style={{gridTemplateColumns:`repeat(${warehouses.length}, 1fr)`}}>
        {warehouses.map(w => {
          const items = stock.filter(s => s.wh === w.id);
          const qty = items.reduce((a,b) => a+b.qty, 0);
          const value = items.reduce((a,b) => {
            const sku = skus.find(s => s.id === b.sku);
            return a + (sku ? sku.cost * b.qty : 0);
          }, 0);
          const isActive = activeWh === w.id;
          return (
            <div key={w.id} className="card card-pad" style={{
              cursor: 'pointer',
              borderColor: isActive ? 'var(--indigo-500)' : undefined,
              boxShadow: isActive ? '0 0 0 1px var(--indigo-500), 0 12px 30px -10px var(--indigo-glow)' : undefined,
            }} onClick={() => { setActiveWh(w.id); setActiveBin(null); }}>
              <div className="row-between mb-8">
                <div className="row gap-12">
                  <div style={{
                    width:42, height:42, borderRadius:12,
                    background: isActive ? 'linear-gradient(135deg, var(--indigo-500), var(--indigo-600))' : 'var(--glass-bg)',
                    display:'grid', placeItems:'center',
                    fontSize: 22,
                    boxShadow: isActive ? '0 8px 20px -8px var(--indigo-glow)' : undefined,
                  }}>{w.icon}</div>
                  <div className="col" style={{gap: 0}}>
                    <div className="bold">{w.name}</div>
                    <div className="smaller muted mono">{w.id} · {w.tempBand}</div>
                  </div>
                </div>
                <span className="chip">{w.bins.length} bin</span>
              </div>
              <div className="row gap-16 mt-16">
                <div className="col" style={{gap: 0}}>
                  <div className="smaller muted">ของในคลัง</div>
                  <div className="num bold large">{items.length} ชิ้น</div>
                </div>
                <div className="col" style={{gap: 0}}>
                  <div className="smaller muted">มูลค่า</div>
                  <div className="num bold large">฿{(value/1000).toFixed(0)}k</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid-2-1">
        {/* Bin grid */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-h-title row gap-8" style={{display:'flex'}}>
                <span style={{fontSize:18}}>{wh.icon}</span>
                {wh.name}
              </div>
              <div className="card-h-sub">{wh.bins.length} bin · {whItems} รายการ · มูลค่า ฿{whTotalValue.toLocaleString('en-US', {maximumFractionDigits:0})}</div>
            </div>
            <div className="row gap-8">
              <button className="btn btn-ghost btn-sm"><Icon name="plus" size={13} />เพิ่ม Bin</button>
              <button className="btn btn-ghost btn-sm"><Icon name="filter" size={13} />กรอง</button>
            </div>
          </div>
          <div className="card-pad">
            <div className="bin-grid">
              {binSummary.map(b => {
                const cls = b.items.length === 0 ? '' : b.items.length >= 3 ? 'warn' : '';
                return (
                  <div key={b.bin}
                       className={`bin ${activeBin === b.bin ? 'active' : ''}`}
                       onClick={() => setActiveBin(activeBin === b.bin ? null : b.bin)}>
                    <div className="row-between">
                      <div className="bin-code">{b.bin}</div>
                      <span className="mono smaller muted">{b.items.length}</span>
                    </div>
                    <div className="bin-cap">{UTIL.fmt(b.totalQty)} หน่วย</div>
                    <div className="bin-bar"><div className={`bin-bar-fill ${cls}`} style={{width: `${Math.min(100, b.fill)}%`}}></div></div>
                    {b.items.length > 0 && (
                      <div className="row" style={{marginTop: 8, gap: 3, flexWrap: 'wrap'}}>
                        {b.items.slice(0,4).map((it,i) => {
                          const sku = skus.find(s => s.id === it.sku);
                          return <span key={i} style={{fontSize: 14}}>{sku?.emoji}</span>;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bin detail */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-h-title">
                {activeBinData ? <>Bin <span className="mono">{activeBinData.bin}</span></> : 'รายละเอียด Bin'}
              </div>
              <div className="card-h-sub">
                {activeBinData ? `${activeBinData.items.length} รายการ · ${UTIL.fmt(activeBinData.totalQty)} หน่วย` : 'คลิก bin ทางซ้ายเพื่อดูรายการ'}
              </div>
            </div>
          </div>
          <div className="card-pad">
            {!activeBinData && (
              <div className="col" style={{alignItems:'center', padding: '40px 0', gap: 12}}>
                <div style={{
                  width:64, height:64, borderRadius:16,
                  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  display:'grid', placeItems:'center'
                }}>
                  <Icon name="package" size={28} style={{color:'var(--text-3)'}} />
                </div>
                <div className="muted small">เลือก Bin จากตารางทางซ้าย</div>
              </div>
            )}

            {activeBinData && activeBinData.items.length === 0 && (
              <div className="col" style={{alignItems:'center', padding: '20px 0', gap: 6}}>
                <Icon name="package" size={22} style={{color:'var(--text-3)'}} />
                <div className="muted small">Bin นี้ว่าง — พร้อมรับของใหม่</div>
              </div>
            )}

            {activeBinData && activeBinData.items.map((it, i) => {
              const sku = skus.find(s => s.id === it.sku);
              const days = UTIL.daysUntil(it.exp);
              const expCls = days <= 1 ? 'badge-danger' : days <= 5 ? 'badge-warn' : 'badge-info';
              return (
                <div key={i} className="activity">
                  <div className="sku-thumb" style={{width:38,height:38,fontSize:18}}>{sku?.emoji}</div>
                  <div className="activity-body">
                    <div className="activity-title">{sku?.name}</div>
                    <div className="activity-meta row gap-8">
                      <span className="mono">{it.batch}</span>
                      <span className={`badge ${expCls}`} style={{fontSize: 10, padding: '1px 6px'}}>
                        <Icon name="calendar" size={9} />หมด {UTIL.thaiDate(it.exp)}
                      </span>
                    </div>
                  </div>
                  <div className="num bold">{UTIL.fmt(it.qty)} <span className="muted small">{sku?.unit}</span></div>
                </div>
              );
            })}

            {activeBinData && activeBinData.items.length > 0 && (
              <div className="mt-16" style={{paddingTop: 12, borderTop: '1px solid var(--glass-border)'}}>
                <div className="row-between">
                  <span className="muted small">มูลค่ารวม</span>
                  <span className="num bold large">฿{Math.round(activeBinData.value).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// REPORT — STOCK ON HAND
// ============================================
function ReportStockScreen({ store }) {
  const { skus, stock, warehouses } = store;
  const [groupBy, setGroupBy] = useState('category');

  const enriched = skus.map(s => {
    const items = stock.filter(x => x.sku === s.id);
    const total = items.reduce((a, b) => a + b.qty, 0);
    const cost = total * s.cost;
    const status = UTIL.stockStatus(s.id);
    return { ...s, total, cost, status, items };
  });

  const totalValue = enriched.reduce((a,b) => a+b.cost, 0);
  const totalSku = enriched.length;
  const totalLines = enriched.reduce((a,b) => a + b.items.length, 0);

  const byCategory = useMemo(() => {
    const map = {};
    enriched.forEach(s => {
      if (!map[s.category]) map[s.category] = { items: [], totalValue: 0 };
      map[s.category].items.push(s);
      map[s.category].totalValue += s.cost;
    });
    return Object.entries(map);
  }, [enriched]);

  return (
    <div className="content page-enter">
      <div className="grid-3 mb-16 stagger" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
        <div className="card kpi card-pad">
          <div className="kpi-label">มูลค่าสต็อกรวม</div>
          <div className="kpi-value">฿<Counter to={Math.round(totalValue)} format={n=>n.toLocaleString('en-US')} /></div>
        </div>
        <div className="card kpi card-pad">
          <div className="kpi-label">รายการ SKU</div>
          <div className="kpi-value"><Counter to={totalSku} /></div>
        </div>
        <div className="card kpi card-pad">
          <div className="kpi-label">รายการในคลัง</div>
          <div className="kpi-value"><Counter to={totalLines} /></div>
        </div>
        <div className="card kpi card-pad">
          <div className="kpi-label">ปริมาณรวม</div>
          <div className="kpi-value"><Counter to={Math.round(enriched.reduce((a,b)=>a+b.total,0))} /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-h-title">รายงานสินค้าคงเหลือ</div>
            <div className="card-h-sub">ข้อมูลล่าสุด ณ 13 พ.ค. 26 18:00 น.</div>
          </div>
          <div className="row gap-8">
            <div className="tabs">
              <div className={`tab ${groupBy==='category'?'active':''}`} onClick={() => setGroupBy('category')}>ตามหมวด</div>
              <div className={`tab ${groupBy==='all'?'active':''}`} onClick={() => setGroupBy('all')}>ทั้งหมด</div>
              <div className={`tab ${groupBy==='wh'?'active':''}`} onClick={() => setGroupBy('wh')}>ตามคลัง</div>
            </div>
            <button className="btn btn-ghost btn-sm"><Icon name="filter" size={13} />กรอง</button>
            <button className="btn btn-primary btn-sm"><Icon name="download" size={13} />Export Excel</button>
          </div>
        </div>

        {groupBy === 'all' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>สินค้า</th><th>SKU</th><th>หมวด</th>
                  <th className="right">คงเหลือ</th>
                  <th className="right">ต้นทุน/หน่วย</th>
                  <th className="right">มูลค่า</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {enriched.map(s => (
                  <tr key={s.id}>
                    <td><div className="row gap-12"><div className="sku-thumb" style={{width:30,height:30,fontSize:14}}>{s.emoji}</div><span>{s.name}</span></div></td>
                    <td className="mono">{s.id}</td>
                    <td><span className="chip">{s.category}</span></td>
                    <td className="num right bold">{UTIL.fmt(s.total)} <span className="muted small">{s.unit}</span></td>
                    <td className="num right">{UTIL.baht(s.cost)}</td>
                    <td className="num right bold" style={{color:'var(--emerald-400)'}}>{UTIL.baht(Math.round(s.cost * s.total))}</td>
                    <td><StockStatusBadge status={s.status} /></td>
                  </tr>
                ))}
                <tr style={{background: 'rgba(99,102,241,0.08)'}}>
                  <td colSpan={5} className="bold">รวมทั้งหมด</td>
                  <td className="num right bold large" style={{color:'var(--indigo-300)'}}>{UTIL.baht(Math.round(totalValue))}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {groupBy === 'category' && (
          <div style={{padding: '4px 0 12px'}}>
            {byCategory.map(([cat, d]) => (
              <div key={cat} style={{padding: '12px 22px'}}>
                <div className="row-between mb-8">
                  <div className="row gap-12">
                    <span className="bold large">{cat}</span>
                    <span className="chip">{d.items.length} รายการ</span>
                  </div>
                  <span className="num bold" style={{color:'var(--indigo-300)'}}>฿{Math.round(d.totalValue).toLocaleString()}</span>
                </div>
                <table>
                  <tbody>
                    {d.items.map(s => (
                      <tr key={s.id}>
                        <td style={{width: 38}}><div className="sku-thumb" style={{width:30,height:30,fontSize:14}}>{s.emoji}</div></td>
                        <td>{s.name}</td>
                        <td className="mono small muted">{s.id}</td>
                        <td className="num right bold">{UTIL.fmt(s.total)} <span className="muted small">{s.unit}</span></td>
                        <td className="num right">{UTIL.baht(s.cost)}</td>
                        <td className="num right bold">{UTIL.baht(Math.round(s.cost * s.total))}</td>
                        <td style={{width: 110}}><StockStatusBadge status={s.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {groupBy === 'wh' && (
          <div style={{padding: '4px 0 12px'}}>
            {warehouses.map(wh => {
              const items = stock.filter(s => s.wh === wh.id).map(s => ({ ...s, sku: skus.find(x => x.id === s.sku) }));
              const value = items.reduce((a,b) => a + (b.sku?.cost || 0) * b.qty, 0);
              return (
                <div key={wh.id} style={{padding: '12px 22px'}}>
                  <div className="row-between mb-8">
                    <div className="row gap-12">
                      <span style={{fontSize: 20}}>{wh.icon}</span>
                      <span className="bold large">{wh.name}</span>
                      <span className="chip">{items.length} รายการ</span>
                      <span className="chip">{wh.tempBand}</span>
                    </div>
                    <span className="num bold" style={{color: 'var(--indigo-300)'}}>฿{Math.round(value).toLocaleString()}</span>
                  </div>
                  <table>
                    <tbody>
                      {items.map((it, i) => (
                        <tr key={i}>
                          <td style={{width: 38}}><div className="sku-thumb" style={{width:30,height:30,fontSize:14}}>{it.sku?.emoji}</div></td>
                          <td>{it.sku?.name}</td>
                          <td className="mono small muted">{it.sku?.id} · Bin {it.bin} · {it.batch}</td>
                          <td className="num right bold">{UTIL.fmt(it.qty)} <span className="muted small">{it.sku?.unit}</span></td>
                          <td className="num right bold">{UTIL.baht(Math.round((it.sku?.cost || 0) * it.qty))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// REPORT — MOVEMENTS
// ============================================
function ReportMoveScreen({ store }) {
  const { movements, skus, warehouses, dailySeries } = store;
  const [type, setType] = useState('all');
  const [period, setPeriod] = useState('14d');

  const filtered = movements.filter(m => type === 'all' || m.type === type);

  const totalIn = movements.filter(m => m.type === 'IN').reduce((a,b)=>a+b.qty, 0);
  const totalOut = movements.filter(m => m.type === 'OUT').reduce((a,b)=>a+b.qty, 0);
  const totalMv = movements.filter(m => m.type === 'MV').length;
  const totalAdj = movements.filter(m => m.type === 'ADJ').length;

  return (
    <div className="content page-enter">
      <div className="grid-3 mb-16 stagger" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
        <div className="card kpi card-pad">
          <div className="kpi-label">
            <div className="kpi-icon" style={{background:'rgba(16,185,129,0.14)', color:'var(--emerald-400)'}}><Icon name="in" size={14} /></div>
            รับเข้ารวม
          </div>
          <div className="kpi-value">+<Counter to={Math.round(totalIn)} /></div>
        </div>
        <div className="card kpi card-pad">
          <div className="kpi-label">
            <div className="kpi-icon" style={{background:'rgba(244,63,94,0.14)', color:'var(--rose-400)'}}><Icon name="out" size={14} /></div>
            จ่ายออกรวม
          </div>
          <div className="kpi-value">-<Counter to={Math.round(totalOut)} /></div>
        </div>
        <div className="card kpi card-pad">
          <div className="kpi-label">
            <div className="kpi-icon"><Icon name="move" size={14} /></div>
            ย้ายคลัง
          </div>
          <div className="kpi-value"><Counter to={totalMv} /></div>
        </div>
        <div className="card kpi card-pad">
          <div className="kpi-label">
            <div className="kpi-icon" style={{background:'rgba(245,158,11,0.14)', color:'var(--amber-400)'}}><Icon name="edit" size={14} /></div>
            ปรับปรุง
          </div>
          <div className="kpi-value"><Counter to={totalAdj} /></div>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-h">
          <div>
            <div className="card-h-title">ภาพรวมความเคลื่อนไหว</div>
            <div className="card-h-sub">รายการ IN/OUT รายวัน</div>
          </div>
          <div className="tabs">
            <div className={`tab ${period==='7d'?'active':''}`} onClick={() => setPeriod('7d')}>7 วัน</div>
            <div className={`tab ${period==='14d'?'active':''}`} onClick={() => setPeriod('14d')}>14 วัน</div>
            <div className={`tab ${period==='30d'?'active':''}`} onClick={() => setPeriod('30d')}>30 วัน</div>
          </div>
        </div>
        <div className="card-pad">
          <BarChart series={period === '7d' ? dailySeries.slice(-7) : dailySeries} />
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-h-title">บันทึกการเคลื่อนไหว ({filtered.length})</div>
            <div className="card-h-sub">รายละเอียดทุกธุรกรรมที่เกิดขึ้นกับสต็อก</div>
          </div>
          <div className="row gap-8">
            <div className="tabs">
              <div className={`tab ${type==='all'?'active':''}`} onClick={() => setType('all')}>ทั้งหมด</div>
              <div className={`tab ${type==='IN'?'active':''}`} onClick={() => setType('IN')}>รับเข้า</div>
              <div className={`tab ${type==='OUT'?'active':''}`} onClick={() => setType('OUT')}>จ่ายออก</div>
              <div className={`tab ${type==='MV'?'active':''}`} onClick={() => setType('MV')}>ย้าย</div>
              <div className={`tab ${type==='ADJ'?'active':''}`} onClick={() => setType('ADJ')}>ปรับ</div>
            </div>
            <button className="btn btn-primary btn-sm"><Icon name="download" size={13} />Export</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>เวลา</th>
                <th>เอกสาร</th>
                <th>ประเภท</th>
                <th>สินค้า</th>
                <th className="right">จำนวน</th>
                <th>ตำแหน่ง</th>
                <th>อ้างอิง</th>
                <th>ผู้บันทึก</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const sku = skus.find(s => s.id === m.sku);
                const sign = m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : '';
                const color = m.type === 'IN' ? 'var(--emerald-400)' : m.type === 'OUT' ? 'var(--rose-400)' : m.type === 'ADJ' ? 'var(--amber-400)' : 'var(--indigo-300)';
                return (
                  <tr key={m.id}>
                    <td className="small">
                      <div>{UTIL.thaiDate(m.ts)}</div>
                      <div className="muted smaller">{new Date(m.ts).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="mono small">{m.id}</td>
                    <td><MovementTypeChip type={m.type} /></td>
                    <td><div className="row gap-8"><span style={{fontSize: 16}}>{sku?.emoji}</span><div className="col" style={{gap:0}}><span>{sku?.name}</span><span className="muted smaller mono">{sku?.id}</span></div></div></td>
                    <td className="num right bold" style={{color}}>{sign}{UTIL.fmt(Math.abs(m.qty))} <span className="muted small">{sku?.unit}</span></td>
                    <td className="small"><span className="chip mono">{m.bin || m.wh}</span></td>
                    <td className="mono small">{m.ref}{m.dept ? ' → ' + m.dept : ''}{m.supplier ? ' / ' + m.supplier : ''}</td>
                    <td className="small">{m.user}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  StockScreen, LocationScreen, ReportStockScreen, ReportMoveScreen,
});
