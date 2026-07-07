import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { isInventoryAuthed } from '@/lib/auth';

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('lots').select('*').order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Create a new lot, or add stock to an existing lot of the same material + size.
export async function POST(req: Request) {
  if (!isInventoryAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = supabaseServer();
  const body = await req.json();
  const { material_id, sheet_w, sheet_h, sheets } = body;
  if (!material_id || !sheet_w || !sheet_h || !sheets) {
    return NextResponse.json({ error: 'material_id, sheet_w, sheet_h, sheets are required' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('lots')
    .select('*')
    .eq('material_id', material_id)
    .eq('sheet_w', sheet_w)
    .eq('sheet_h', sheet_h)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('lots')
      .update({ sheets_remaining: existing.sheets_remaining + Number(sheets) })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('lots')
    .insert({ material_id, sheet_w, sheet_h, sheets_remaining: Number(sheets) })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
