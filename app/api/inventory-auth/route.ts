import { NextResponse } from 'next/server';
import { INVENTORY_COOKIE, isInventoryAuthed } from '@/lib/auth';

export async function GET() {
  return NextResponse.json({ ok: isInventoryAuthed() });
}

export async function POST(req: Request) {
  const { password } = await req.json();
  if (!process.env.INVENTORY_PASSWORD) {
    return NextResponse.json({ error: 'INVENTORY_PASSWORD is not configured on the server' }, { status: 500 });
  }
  if (password !== process.env.INVENTORY_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(INVENTORY_COOKIE, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return res;
}
