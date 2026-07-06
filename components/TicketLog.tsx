'use client';
import { useState } from 'react';
import type { Material, Ticket } from '@/lib/types';
import { materialLabel } from '@/lib/types';

export default function TicketLog({
  tickets, materials, onChanged,
}: { tickets: Ticket[]; materials: Material[]; onChanged: () => void }) {
  const [search, setSearch] = useState('');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = tickets.filter(t => {
    if (materialFilter !== 'all' && t.material_id !== materialFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search && !(t.customer.toLowerCase().includes(search.toLowerCase()) || t.number.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  async function toggleCut(t: Ticket) {
    await fetch(`/api/tickets/${t.number}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: t.status === 'cut' ? 'open' : 'cut' }),
    });
    onChanged();
  }

  return (
    <div className="panel">
      <div className="font-display font-semibold text-sm mb-4">Ticket history</div>
      <div className="flex gap-3 flex-wrap mb-4">
        <input className="input flex-1 min-w-[180px]" placeholder="Search customer or ticket #" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" value={materialFilter} onChange={e => setMaterialFilter(e.target.value)}>
          <option value="all">All materials</option>
          {materials.map(m => <option key={m.id} value={m.id}>{materialLabel(m)}</option>)}
        </select>
        <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="cut">Cut confirmed</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="text-low text-sm text-center py-6">No tickets yet — create one from the New Ticket tab.</div>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-low text-[11px] uppercase tracking-wide border-b border-line">
              <th className="py-2 px-2">Ticket</th><th className="py-2 px-2">Date</th><th className="py-2 px-2">Customer</th>
              <th className="py-2 px-2">Material</th><th className="py-2 px-2">Sheet</th><th className="py-2 px-2">Size / Qty</th>
              <th className="py-2 px-2">Requested by</th><th className="py-2 px-2">Status</th><th className="py-2 px-2">Confirm</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.number} className="border-b border-line hover:bg-green-light">
                <td className="py-2 px-2 font-mono text-ink">{t.number}{t.over_stock && <span className="text-danger ml-1" title="Was over stock at creation">⚠</span>}</td>
                <td className="py-2 px-2 text-mid">{new Date(t.created_at).toLocaleDateString()}</td>
                <td className="py-2 px-2 text-ink">{t.customer}</td>
                <td className="py-2 px-2 text-mid">{t.material_label}</td>
                <td className="py-2 px-2 font-mono text-mid">{t.sheet_size}</td>
                <td className="py-2 px-2 font-mono text-mid">{t.w}×{t.h} × {t.qty}</td>
                <td className="py-2 px-2 text-mid">{t.requested_by}</td>
                <td className="py-2 px-2">
                  <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${t.status === 'cut' ? 'bg-[#DDF0E4] text-green-dark' : 'bg-green-light text-green-dark'}`}>
                    {t.status === 'cut' ? 'CUT' : 'OPEN'}
                  </span>
                </td>
                <td className="py-2 px-2"><input type="checkbox" checked={t.status === 'cut'} onChange={() => toggleCut(t)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
