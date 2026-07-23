export type Material = {
  id: string;
  name: string;
  grade: string | null;
  thickness: number;
};

export type Lot = {
  id: string;
  material_id: string;
  sheet_w: number;
  sheet_h: number;
  sheets_remaining: number;
  location: 'Office' | 'Workshop';
};

export type Ticket = {
  id: string;
  number: string;
  created_at: string;
  customer: string;
  material_id: string;
  material_label: string;
  lot_id: string;
  sheet_size: string;
  w: number;
  h: number;
  qty: number;
  requested_by: string;
  source_location: 'Office' | 'Workshop';
  notes: string | null;
  status: 'open' | 'cut';
  over_stock: boolean;
  cut_by: string | null;
  cut_at: string | null;
};

export function materialLabel(m: { name: string; grade: string | null; thickness: number }) {
  return `${m.name}${m.grade ? ' (' + m.grade + ')' : ''} · ${m.thickness}mm`;
}

export function lotLabel(l: { sheet_w: number; sheet_h: number }) {
  return `${l.sheet_w}×${l.sheet_h}cm`;
}

// sheet_w and sheet_h are stored in cm, so divide by 100 twice to get sq. meters.
export function lotAreaSqm(l: { sheet_w: number; sheet_h: number }) {
  return (l.sheet_w / 100) * (l.sheet_h / 100);
}

export function ticketMessage(t: Ticket, confirmUrl: string) {
  return `JOB TICKET ${t.number}\nRequested by: ${t.requested_by}  (${t.source_location})\n--------------------------------------------------\n\nMaterial: ${t.material_label}  (from ${t.sheet_size} sheet)\nSize: ${t.w} x ${t.h} cm  |  Qty: ${t.qty}${t.notes ? '\nNotes: ' + t.notes : ''}\n\nTap to confirm once cut: ${confirmUrl}`;
}
