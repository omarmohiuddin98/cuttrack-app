import { cookies } from 'next/headers';

export const INVENTORY_COOKIE = 'inventory_auth';

export function isInventoryAuthed() {
  const stored = cookies().get(INVENTORY_COOKIE)?.value;
  return !!stored && !!process.env.INVENTORY_PASSWORD && stored === process.env.INVENTORY_PASSWORD;
}
