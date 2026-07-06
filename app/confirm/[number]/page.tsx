import { supabaseServer } from '@/lib/supabase';
import ConfirmButton from './ConfirmButton';

export const dynamic = 'force-dynamic';

export default async function ConfirmPage({ params }: { params: { number: string } }) {
  const supabase = supabaseServer();
  const { data: ticket } = await supabase.from('tickets').select('*').eq('number', params.number).single();

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card max-w-sm text-center">
          <p className="text-ink font-semibold">Ticket not found</p>
          <p className="text-low text-sm mt-2">Check the link or ask the office for the correct one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F4F9F6' }}>
      <div className="card max-w-sm w-full">
        <div className="mono text-2xl font-semibold text-green-dark mb-1">{ticket.number}</div>
        <div className="text-sm text-mid mb-4">{ticket.material_label} · {ticket.sheet_size} sheet</div>
        <div className="text-lg font-semibold text-ink mb-1">{ticket.w} × {ticket.h} cm — Qty {ticket.qty}</div>
        {ticket.notes && <div className="text-sm text-mid mt-2">Notes: {ticket.notes}</div>}
        <div className="mt-6">
          <ConfirmButton number={ticket.number} initialStatus={ticket.status} />
        </div>
      </div>
    </div>
  );
}
