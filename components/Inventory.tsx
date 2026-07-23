'use client';
import { useState } from 'react';
import type { Material, Lot } from '@/lib/types';
import { materialLabel, lotAreaSqm } from '@/lib/types';

function InventoryGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    const res = await fetch('/api/inventory-auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setUnlocked(true); setPassword(''); }
    else setError('Wrong password.');
  }

  if (!unlocked) {
    return (
      <div className="panel max-w-sm">
        <div className="font-display font-semibold text-sm mb-4">Inventory is password protected</div>
        <div className="flex flex-col gap-2">
          <input
            className="input font-mono" type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          />
          {error && <div className="text-danger text-xs">{error}</div>}
          <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }} onClick={submit}>Unlock</button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function InventoryContent({
  materials, lots, onChanged,
}: { materials: Material[]; lots: Lot[]; onChanged: () => void }) {
  const [showNewMat, setShowNewMat] = useState(false);
  const [newName, setNewName] = useState('Aluminium');
  const [newGrade, setNewGrade] = useState('');
  const [newThickness, setNewThickness] = useState('');
  const [addLotFor, setAddLotFor] = useState<string | null>(null);
  const [lotW, setLotW] = useState('');
  const [lotH, setLotH] = useState('');
  const [lotCount, setLotCount] = useState('');
  const [lotLocation, setLotLocation] = useState<'Office' | 'Workshop'>('Office');
  const [addStockKey, setAddStockKey] = useState<string | null>(null);
  const [addStockAmt, setAddStockAmt] = useState('');

  async function addMaterial() {
    if (!newName || !newThickness) return;
    await fetch('/api/materials', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, grade: newGrade.trim(), thickness: parseFloat(newThickness) }),
    });
    setShowNewMat(false); setNewThickness(''); setNewGrade('');
    onChanged();
  }

  async function addLot(materialId: string) {
    if (!lotW || !lotH || !lotCount) return;
    await fetch('/api/lots', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ material_id: materialId, sheet_w: parseFloat(lotW), sheet_h: parseFloat(lotH), sheets: parseFloat(lotCount), location: lotLocation }),
    });
    setAddLotFor(null); setLotW(''); setLotH(''); setLotCount(''); setLotLocation('Office');
    onChanged();
  }

  async function addStock(materialId: string, sheetW: number, sheetH: number, location: 'Office' | 'Workshop') {
    const n = parseFloat(addStockAmt);
    if (!n || n <= 0) return;
    await fetch('/api/lots', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ material_id: materialId, sheet_w: sheetW, sheet_h: sheetH, sheets: n, location }),
    });
    setAddStockKey(null); setAddStockAmt('');
    onChanged();
  }

  const LOW_CAP = 10;

  return (
    <div>
      <div className="panel">
        <div className="font-display font-semibold text-sm mb-4">Current stock, by material</div>
        {materials.length === 0 && <div className="text-low text-sm text-center py-4">No materials yet — add your first one below.</div>}
        {materials.map(m => {
          const matLots = lots.filter(l => l.material_id === m.id);
          const total = matLots.reduce((s, l) => s + l.sheets_remaining, 0);
          const totalSqm = matLots.reduce((s, l) => s + l.sheets_remaining * lotAreaSqm(l), 0);
          const officeTotal = matLots.filter(l => l.location === 'Office').reduce((s, l) => s + l.sheets_remaining, 0);
          const workshopTotal = matLots.filter(l => l.location === 'Workshop').reduce((s, l) => s + l.sheets_remaining, 0);
          return (
            <div className="card mb-3" key={m.id}>
              <div className="font-mono font-semibold text-sm flex justify-between items-center mb-2">
                <span>{materialLabel(m)}</span>
                <span className="text-low text-xs">
                  {total.toFixed(1)} sheets total (all sizes) · {totalSqm.toFixed(2)} sqm
                  {' '}— Office: {officeTotal.toFixed(1)} · Workshop: {workshopTotal.toFixed(1)}
                </span>
              </div>
              {matLots.length === 0 && <div className="text-xs text-low">No sheet sizes added yet.</div>}
              {Array.from(new Set(matLots.map(l => `${l.sheet_w}x${l.sheet_h}`))).map(sizeKey => {
                const [sheetW, sheetH] = sizeKey.split('x').map(Number);
                return (
                  <div key={sizeKey} className="border-t border-line pt-2 mt-1">
                    <div className="font-mono text-sm mb-1">{sheetW}×{sheetH}cm</div>
                    {(['Office', 'Workshop'] as const).map(loc => {
                      const l = matLots.find(x => x.sheet_w === sheetW && x.sheet_h === sheetH && x.location === loc);
                      const remaining = l?.sheets_remaining ?? 0;
                      const pct = Math.min(100, Math.round((remaining / LOW_CAP) * 100));
                      const low = remaining <= LOW_CAP * 0.25;
                      const sqm = remaining * lotAreaSqm({ sheet_w: sheetW, sheet_h: sheetH });
                      const cellKey = `${sizeKey}-${loc}`;
                      return (
                        <div key={cellKey} className="flex items-center gap-3 py-1 pl-3 flex-wrap">
                          <span className="text-[11px] px-2 py-1 rounded-full font-semibold bg-green-light text-green-dark min-w-[70px] text-center">{loc}</span>
                          <div className="flex-1 min-w-[100px] h-[9px] bg-green-light border border-line rounded overflow-hidden">
                            <div className={`h-full ${low ? 'bg-danger' : 'bg-green'}`} style={{ width: pct + '%' }} />
                          </div>
                          <div className="font-mono text-sm min-w-[160px] text-right">
                            {remaining.toFixed(1)} sheets · {sqm.toFixed(2)} sqm{low && <span className="text-danger"> · low</span>}
                          </div>
                          {addStockKey === cellKey ? (
                            <div className="flex gap-2">
                              <input className="input w-[70px] font-mono" type="number" min="0" value={addStockAmt} onChange={e => setAddStockAmt(e.target.value)} />
                              <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => addStock(m.id, sheetW, sheetH, loc)}>Add</button>
                              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => { setAddStockKey(null); setAddStockAmt(''); }}>Cancel</button>
                            </div>
                          ) : (
                            <button className="text-green text-xs underline" onClick={() => setAddStockKey(cellKey)}>+ add stock</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {addLotFor === m.id ? (
                <div className="flex gap-3 flex-wrap mt-3">
                  <div className="flex flex-col gap-1"><label className="text-xs text-mid">Sheet width (cm)</label><input className="input font-mono" type="number" value={lotW} onChange={e => setLotW(e.target.value)} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs text-mid">Sheet height (cm)</label><input className="input font-mono" type="number" value={lotH} onChange={e => setLotH(e.target.value)} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs text-mid">Sheets in stock</label><input className="input font-mono" type="number" min="0" value={lotCount} onChange={e => setLotCount(e.target.value)} /></div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-mid">Location</label>
                    <select className="input" value={lotLocation} onChange={e => setLotLocation(e.target.value as 'Office' | 'Workshop')}>
                      <option>Office</option>
                      <option>Workshop</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => addLot(m.id)}>Save size</button>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setAddLotFor(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="text-green text-xs underline mt-2" onClick={() => setAddLotFor(m.id)}>+ add a sheet size for this material</button>
              )}
            </div>
          );
        })}
      </div>

      <div className="panel">
        <div className="font-display font-semibold text-sm mb-4">Add a new material / thickness</div>
        {!showNewMat ? (
          <button className="btn-secondary" onClick={() => setShowNewMat(true)}>+ New material type</button>
        ) : (
          <div className="flex gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-mid">Material</label>
              <select className="input" value={newName} onChange={e => setNewName(e.target.value)}>
                <option>Aluminium</option>
                <option>Stainless Steel</option>
                <option>CS Steel</option>
                <option>G.I Sheet</option>
                <option>Acrylic Sheet</option>
                <option>Phenolic Sheet</option>
                <option>Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-mid">Grade / type (optional)</label>
              <input className="input" value={newGrade} onChange={e => setNewGrade(e.target.value)} placeholder="e.g. SS304, SS316, 5052" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-mid">Thickness (mm)</label>
              <input className="input font-mono" type="number" step="0.1" value={newThickness} onChange={e => setNewThickness(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }} onClick={addMaterial}>Save material</button>
              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setShowNewMat(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Inventory(props: { materials: Material[]; lots: Lot[]; onChanged: () => void }) {
  return (
    <InventoryGate>
      <InventoryContent {...props} />
    </InventoryGate>
  );
}
