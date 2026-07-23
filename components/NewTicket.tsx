'use client';
import { useEffect, useState } from 'react';
import type { Material, Lot, Ticket } from '@/lib/types';
import { materialLabel, lotLabel, lotAreaSqm, ticketMessage } from '@/lib/types';

export default function NewTicket({
  materials, lots, lastTicket, onCreated,
}: {
  materials: Material[];
  lots: Lot[];
  lastTicket: Ticket | null;
  onCreated: (t: Ticket) => void;
}) {
  const [customer, setCustomer] = useState('');
  const [materialId, setMaterialId] = useState(materials[0]?.id || '');
  const [lotId, setLotId] = useState('');
  const [w, setW] = useState('');
  const [h, setH] = useState('');
  const [qty, setQty] = useState('1');
  const [requestedBy, setRequestedBy] = useState('');
  const [sourceLocation, setSourceLocation] = useState<'Office' | 'Workshop'>('Office');
  const [notes, setNotes] = useState('');
  const [copyMsg, setCopyMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const matLots = lots.filter(l => l.material_id === materialId && l.location === sourceLocation);

  useEffect(() => {
    if (matLots.length && !matLots.find(l => l.id === lotId)) setLotId(matLots[0].id);
    if (!matLots.length) setLotId('');
  }, [materialId, sourceLocation, lots]);

  const lot = lots.find(l => l.id === lotId);
  const areaNeeded = (parseFloat(w) || 0) * (parseFloat(h) || 0) * (parseInt(qty) || 0);
  const lotArea = lot ? lot.sheet_w * lot.sheet_h : 0;
  const sheetsNeeded = lotArea > 0 ? areaNeeded / lotArea : 0;
  const insufficient = !!lot && sheetsNeeded > lot.sheets_remaining;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!customer || !w || !h || !qty || !requestedBy || !materialId || !lotId) return;
    setSubmitting(true);
    setErr('');
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer, material_id: materialId, lot_id: lotId,
          w: parseFloat(w), h: parseFloat(h), qty: parseInt(qty),
          requested_by: requestedBy, source_location: sourceLocation, notes,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const ticket = await res.json();
      onCreated(ticket);
      setCustomer(''); setW(''); setH(''); setQty('1'); setNotes('');
    } catch (e) {
      setErr('Could not create the ticket — check your connection and try again.');
    }
    setSubmitting(false);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopyMsg('Copied — paste into WhatsApp group');
      setTimeout(() => setCopyMsg(''), 2500);
    }).catch(() => setCopyMsg('Could not copy — select text manually below'));
  }

  if (materials.length === 0) {
    return <div className="panel text-low text-sm text-center py-6">No materials set up yet. Go to the Inventory tab to add your first material and sheet stock.</div>;
  }

  const confirmUrl = typeof window !== 'undefined' && lastTicket ? `${window.location.origin}/confirm/${lastTicket.number}` : '';

  return (
    <div>
      <div className="panel">
        <div className="font-display font-semibold text-sm mb-4">Create job ticket</div>
        {err && <div className="bg-dangerbg border border-danger text-sm text-[#9A3226] rounded-md p-3 mb-3">{err}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[160px] flex flex-col gap-1">
              <label className="text-xs text-mid">Customer / order ref</label>
              <input className="input" value={customer} onChange={e => setCustomer(e.target.value)} required />
            </div>
            <div className="flex-1 min-w-[160px] flex flex-col gap-1">
              <label className="text-xs text-mid">Material & thickness</label>
              <select className="input" value={materialId} onChange={e => setMaterialId(e.target.value)}>
                {materials.map(m => <option key={m.id} value={m.id}>{materialLabel(m)}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[160px] flex flex-col gap-1">
              <label className="text-xs text-mid">Source location</label>
              <select className="input" value={sourceLocation} onChange={e => setSourceLocation(e.target.value as 'Office' | 'Workshop')}>
                <option>Office</option>
                <option>Workshop</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[160px] flex flex-col gap-1">
              <label className="text-xs text-mid">Sheet size to cut from</label>
              {matLots.length ? (
                <select className="input" value={lotId} onChange={e => setLotId(e.target.value)}>
                  {matLots.map(l => <option key={l.id} value={l.id}>{lotLabel(l)}</option>)}
                </select>
              ) : <div className="text-xs text-danger">No {sourceLocation} stock for this material — add it in Inventory</div>}
            </div>
            <div className="flex-1 min-w-[160px] flex flex-col gap-1">
              <label className="text-xs text-mid">Stock remaining</label>
              <div className="input font-mono flex items-center bg-green-light/50">
                {lot ? `${lot.sheets_remaining.toFixed(1)} sheets · ${(lot.sheets_remaining * lotAreaSqm(lot)).toFixed(2)} sqm` : '—'}
              </div>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[100px] flex flex-col gap-1">
              <label className="text-xs text-mid">Width (cm)</label>
              <input className="input font-mono" type="number" step="0.1" value={w} onChange={e => setW(e.target.value)} required />
            </div>
            <div className="flex-1 min-w-[100px] flex flex-col gap-1">
              <label className="text-xs text-mid">Height (cm)</label>
              <input className="input font-mono" type="number" step="0.1" value={h} onChange={e => setH(e.target.value)} required />
            </div>
            <div className="flex-1 min-w-[100px] flex flex-col gap-1">
              <label className="text-xs text-mid">Quantity</label>
              <input className="input font-mono" type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} required />
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[160px] flex flex-col gap-1">
              <label className="text-xs text-mid">Requested by</label>
              <input className="input" value={requestedBy} onChange={e => setRequestedBy(e.target.value)} required />
            </div>
            <div className="flex-1 min-w-[160px] flex flex-col gap-1">
              <label className="text-xs text-mid">Notes (optional)</label>
              <input className="input" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
          {insufficient && lot && (
            <div className="bg-dangerbg border border-danger text-sm text-[#9A3226] rounded-md p-3">
              This job needs ≈{sheetsNeeded.toFixed(2)} sheets of {lotLabel(lot)}, but only {lot.sheets_remaining.toFixed(2)} remain. Ticket will still be created and flagged.
            </div>
          )}
          <button className="btn" type="submit" disabled={!lotId || submitting}>{submitting ? 'Creating…' : 'Generate ticket'}</button>
        </form>
      </div>

      {lastTicket && (
        <div className="card border-l-4 border-l-green mt-3">
          <div className="font-mono text-lg font-semibold text-green-dark">
            {lastTicket.number}{lastTicket.over_stock && <span className="text-danger text-xs ml-2">⚠ over stock</span>}
          </div>
          <div className="text-sm text-mid mt-1">{lastTicket.material_label} ({lastTicket.sheet_size}) · {lastTicket.w}×{lastTicket.h} cm · qty {lastTicket.qty}</div>
          <div className="text-sm text-mid">Requested by <b className="text-ink">{lastTicket.requested_by}</b> · <b className="text-ink">{lastTicket.source_location}</b></div>
          <div className="bg-green-light border border-line rounded-md p-3 mt-3 font-mono text-xs whitespace-pre-wrap text-ink">
            {ticketMessage(lastTicket, confirmUrl)}
          </div>
          <div className="mt-3 flex gap-3 items-center">
            <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => copyToClipboard(ticketMessage(lastTicket, confirmUrl))}>Copy for WhatsApp</button>
            {copyMsg && <span className="text-xs text-low">{copyMsg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
