// ============================================================
// DB — Supabase operations wrapper
// ============================================================

window.DB = {

  // ─── Load ────────────────────────────────────────────────

  async loadStock() {
    const { data, error } = await window.sb
      .from('stock')
      .select('*')
      .gt('qty', 0);
    if (error) throw error;
    return data.map(r => ({
      sku: r.sku,
      wh:  r.wh,
      bin: r.bin,
      qty: parseFloat(r.qty),
      batch: r.batch,
      exp:  r.exp,
    }));
  },

  async loadMovements() {
    const { data, error } = await window.sb
      .from('movements')
      .select('*')
      .order('ts', { ascending: false })
      .limit(200);
    if (error) throw error;
    return data.map(r => ({
      id:       r.id,
      type:     r.type,
      sku:      r.sku,
      qty:      parseFloat(r.qty),
      // reconstruct combined wh/bin for MV type (frontend expects 'WH-A->WH-B' format)
      wh:       r.type === 'MV' ? `${r.from_wh}->${r.to_wh}` : r.wh,
      bin:      r.type === 'MV' ? `${r.from_bin}→${r.to_bin}` : r.bin,
      user:     r.user_name,
      ref:      r.ref,
      supplier: r.supplier,
      dept:     r.dept,
      batch:    r.batch,
      note:     r.note,
      ts:       r.ts,
    }));
  },

  // ─── Persist movement + update stock ─────────────────────

  async persistMovement(m) {
    // Build DB row from movement object
    const row = {
      id:        m.id,
      type:      m.type,
      sku:       m.sku,
      qty:       m.qty,
      user_name: m.user,
      ref:       m.ref   || null,
      supplier:  m.supplier || null,
      dept:      m.dept  || null,
      batch:     m.batch || null,
      exp:       m.exp   || null,
      note:      m.note  || null,
      ts:        m.ts,
    };

    if (m.type === 'MV') {
      const [fromWh, toWh]   = (m.wh  || '->').split('->');
      const [fromBin, toBin] = (m.bin || '→').split('→');
      row.from_wh  = fromWh;  row.to_wh  = toWh;
      row.from_bin = fromBin; row.to_bin = toBin;
    } else {
      row.wh  = m.wh;
      row.bin = m.bin;
    }

    const { error: mvErr } = await window.sb.from('movements').insert(row);
    if (mvErr) throw mvErr;

    // Update stock table
    if (m.type === 'IN') {
      const batch = m.batch || `B${String(new Date().getFullYear()).slice(-2)}-${Math.floor(100 + Math.random() * 200)}`;
      await this._stockIn(m.sku, m.wh, m.bin, m.qty, batch, m.exp || null);

    } else if (m.type === 'OUT') {
      await this._stockOut(m.sku, m.wh, m.bin, m.qty);

    } else if (m.type === 'MV') {
      const [fromWh, toWh]   = (m.wh  || '->').split('->');
      const [fromBin, toBin] = (m.bin || '→').split('→');
      await this._stockTransfer(m.sku, fromWh, toWh, fromBin, toBin, m.qty);

    } else if (m.type === 'ADJ') {
      if (m.qty < 0) {
        await this._stockOut(m.sku, m.wh, m.bin, Math.abs(m.qty));
      } else {
        await this._stockIn(m.sku, m.wh, m.bin, m.qty, m.batch || null, m.exp || null);
      }
    }
  },

  // ─── Internal stock helpers ───────────────────────────────

  async _stockIn(sku, wh, bin, qty, batch, exp) {
    const { data: existing } = await window.sb.from('stock')
      .select('id, qty')
      .eq('sku', sku).eq('wh', wh).eq('bin', bin).eq('batch', batch || '')
      .maybeSingle();

    if (existing) {
      await window.sb.from('stock')
        .update({ qty: parseFloat(existing.qty) + qty, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await window.sb.from('stock').insert({ sku, wh, bin, qty, batch, exp });
    }
  },

  async _stockOut(sku, wh, bin, qty) {
    const { data: candidates } = await window.sb.from('stock')
      .select('id, qty, exp')
      .eq('sku', sku).eq('wh', wh).eq('bin', bin).gt('qty', 0)
      .order('exp', { ascending: true });

    let remaining = qty;
    for (const c of (candidates || [])) {
      if (remaining <= 0) break;
      const take   = Math.min(parseFloat(c.qty), remaining);
      const newQty = parseFloat(c.qty) - take;
      remaining   -= take;
      if (newQty < 0.001) {
        await window.sb.from('stock').delete().eq('id', c.id);
      } else {
        await window.sb.from('stock').update({ qty: newQty, updated_at: new Date().toISOString() }).eq('id', c.id);
      }
    }
  },

  async _stockTransfer(sku, fromWh, toWh, fromBin, toBin, qty) {
    const { data: sources } = await window.sb.from('stock')
      .select('id, qty, batch, exp')
      .eq('sku', sku).eq('wh', fromWh).eq('bin', fromBin).gt('qty', 0)
      .order('exp', { ascending: true });

    let remaining = qty;
    for (const c of (sources || [])) {
      if (remaining <= 0) break;
      const take   = Math.min(parseFloat(c.qty), remaining);
      const newQty = parseFloat(c.qty) - take;
      remaining   -= take;

      // Deduct source
      if (newQty < 0.001) {
        await window.sb.from('stock').delete().eq('id', c.id);
      } else {
        await window.sb.from('stock').update({ qty: newQty, updated_at: new Date().toISOString() }).eq('id', c.id);
      }

      // Add to destination
      const { data: dest } = await window.sb.from('stock')
        .select('id, qty')
        .eq('sku', sku).eq('wh', toWh).eq('bin', toBin).eq('batch', c.batch || '')
        .maybeSingle();

      if (dest) {
        await window.sb.from('stock').update({ qty: parseFloat(dest.qty) + take, updated_at: new Date().toISOString() }).eq('id', dest.id);
      } else {
        await window.sb.from('stock').insert({ sku, wh: toWh, bin: toBin, qty: take, batch: c.batch, exp: c.exp });
      }
    }
  },
};
