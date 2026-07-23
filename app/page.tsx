'use client';
import { useEffect, useState } from 'react';
import NewTicket from '@/components/NewTicket';
import Inventory from '@/components/Inventory';
import TicketLog from '@/components/TicketLog';
import type { Material, Lot, Ticket } from '@/lib/types';

export default function Home() {
  const [tab, setTab] = useState<'new' | 'inventory' | 'log'>('new');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);

  async function loadAll(showLoading = false) {
    if (showLoading) setLoading(true);
    const [m, l, t] = await Promise.all([
      fetch('/api/materials').then(r => r.json()),
      fetch('/api/lots').then(r => r.json()),
      fetch('/api/tickets').then(r => r.json()),
    ]);
    setMaterials(m); setLots(l); setTickets(t);
    if (showLoading) setLoading(false);
  }

  useEffect(() => { loadAll(true); }, []);

  if (loading) {
    return <div className="p-10 text-low font-mono">Loading CutTrack…</div>;
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="h-[5px] bg-green" />
      <div className="px-7 pt-6 pb-4">
        <div className="font-display text-2xl font-bold flex items-baseline gap-2">
          <span className="text-green">◧</span> CutTrack
        </div>
        <div className="text-low text-sm mt-1">Job tickets & sheet inventory — signage & fabrication floor</div>
      </div>
      <div className="flex gap-1 px-7 border-b border-line">
        {(['new', 'inventory', 'log'] as const).map(t => (
          <div
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium cursor-pointer border-b-2 ${tab === t ? 'text-green border-green' : 'text-low border-transparent'}`}
          >
            {t === 'new' ? 'New Ticket' : t === 'inventory' ? 'Inventory' : 'Ticket Log'}
          </div>
        ))}
      </div>
      <div className="px-7 pt-6 max-w-3xl">
        {tab === 'new' && (
          <NewTicket
            materials={materials}
            lots={lots}
            lastTicket={lastTicket}
            onCreated={async (ticket) => {
              setLastTicket(ticket);
              await loadAll();
            }}
          />
        )}
        {tab === 'inventory' && <Inventory materials={materials} lots={lots} onChanged={loadAll} />}
        {tab === 'log' && <TicketLog tickets={tickets} materials={materials} onChanged={loadAll} />}
      </div>
      <div className="px-7 pt-6 text-low text-[11px]">
        Everyone with access to this site sees the same live data.
      </div>
    </div>
  );
}
