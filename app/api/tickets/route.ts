import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { materialLabel, lotLabel } from '@/lib/types';

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const body = await req.json();
  const { customer, material_id, lot_id, w, h, qty, requested_by, notes } = body;

  if (!customer || !material_id || !lot_id || !w || !h || !qty || !requested_by) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: material, error: matErr } = await supabase.from('materials').select('*').eq('id', material_id).single();
  if (matErr || !material) return NextResponse.json({ error: 'Material not found' }, { status: 404 });

  const { data: lot, error: lotErr } = await supabase.from('lots').select('*').eq('id', lot_id).single();
  if (lotErr || !lot) return NextResponse.json({ error: 'Sheet size not found' }, { status: 404 });

  const areaNeeded = Number(w) * Number(h) * Number(qty);
  const lotArea = lot.sheet_w * lot.sheet_h;
  const sheetsNeeded = lotArea > 0 ? areaNeeded / lotArea : 0;
  const overStock = sheetsNeeded > lot.sheets_remaining;

  // Deduct stock (allowed to go negative-flagged rather than blocked, matching the
  // existing tool's behavior: create the ticket but flag it so office can double check).
  const { error: updateErr } = await supabase
    .from('lots')
    .update({ sheets_remaining: Math.max(0, lot.sheets_remaining - sheetsNeeded) })
    .eq('id', lot.id);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  const { data: ticket, error: ticketErr } = await supabase
    .from('tickets')
    .insert({
      customer,
      material_id,
      material_label: materialLabel(material),
      lot_id,
      sheet_size: lotLabel(lot),
      w, h, qty,
      requested_by,
      notes: notes || null,
      status: 'open',
      over_stock: overStock,
    })
    .select()
    .single();

  if (ticketErr) return NextResponse.json({ error: ticketErr.message }, { status: 500 });
  return NextResponse.json(ticket);
}
