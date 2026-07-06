'use client';
import { useState } from 'react';

export default function ConfirmButton({ number, initialStatus }: { number: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function markCut() {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(`/api/tickets/${number}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cut' }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('cut');
    } catch (e) {
      setErr('Could not update — check your connection and try again.');
    }
    setLoading(false);
  }

  if (status === 'cut') {
    return (
      <div className="bg-green-light border border-green rounded-md p-4 text-center">
        <div className="text-green-dark font-semibold">✓ Marked as cut</div>
        <div className="text-xs text-mid mt-1">Inventory and the ticket log are updated.</div>
      </div>
    );
  }

  return (
    <div>
      <button className="btn w-full text-base py-3" onClick={markCut} disabled={loading}>
        {loading ? 'Updating…' : 'Mark as cut'}
      </button>
      {err && <div className="text-danger text-xs mt-2">{err}</div>}
    </div>
  );
}
