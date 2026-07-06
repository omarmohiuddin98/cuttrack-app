import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// PATCH /api/tickets/T-0001  { status: 'cut' | 'open', cut_by?: string }
export async function PATCH(req: Request, { params }: { params: { number: string } }) {
  const supabase = supabaseServer();
  const body = await req.json();
  const status = body.status === 'open' ? 'open' : 'cut';

  const { data, error } = await supabase
    .from('tickets')
    .update({
      status,
      cut_by: status === 'cut' ? (body.cut_by || 'Confirmed via link') : null,
      cut_at: status === 'cut' ? new Date().toISOString() : null,
    })
    .eq('number', params.number)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET(req: Request, { params }: { params: { number: string } }) {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('tickets').select('*').eq('number', params.number).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}
