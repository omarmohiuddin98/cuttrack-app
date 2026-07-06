import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('materials').select('*').order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const body = await req.json();
  const { name, grade, thickness } = body;
  if (!name || thickness === undefined) {
    return NextResponse.json({ error: 'name and thickness are required' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('materials')
    .insert({ name, grade: grade || null, thickness })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
