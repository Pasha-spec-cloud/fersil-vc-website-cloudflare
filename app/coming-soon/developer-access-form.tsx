'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

export function DeveloperAccessForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function requestCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const response = await fetch('/api/developer-access/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const payload = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(payload.error ?? 'Unable to send the code.');
      return;
    }

    setCodeSent(true);
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const response = await fetch('/api/developer-access/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const payload = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(payload.error ?? 'Unable to verify the code.');
      return;
    }

    window.location.href = '/';
  }

  const inputClass =
    'mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none';

  return (
    <div className="mt-10 w-full max-w-md rounded-3xl border border-white/10 bg-black/25 p-6 text-left backdrop-blur">
      <p className="text-xs uppercase tracking-[0.35em] text-muted">Developer Access</p>
      <p className="mt-3 text-sm text-muted">Request access from your fersil.vc address.</p>

      <form onSubmit={codeSent ? verifyCode : requestCode} className="mt-6">
        <label htmlFor="email" className="text-xs uppercase tracking-[0.3em] text-muted">
          FerSil Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@fersil.vc"
          required
          readOnly={codeSent}
          className={inputClass}
        />
        {codeSent && (
          <>
            <label htmlFor="code" className="mt-5 block text-xs uppercase tracking-[0.3em] text-muted">
              Access Code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              required
              autoFocus
              className={`${inputClass} text-center text-lg tracking-[0.45em]`}
            />
          </>
        )}
        <Button type="submit" className="mt-5 w-full" disabled={busy}>
          {busy ? (codeSent ? 'Verifying…' : 'Sending…') : (codeSent ? 'Unlock Site' : 'Email Access Code')}
        </Button>
      </form>

      {codeSent && (
        <button
          type="button"
          className="mt-4 w-full text-center text-xs uppercase tracking-[0.2em] text-muted transition hover:text-white"
          onClick={() => {
            setCodeSent(false);
            setCode('');
            setError(null);
          }}
        >
          Use another email
        </button>
      )}

      {error && <p className="mt-4 text-sm text-rose-200">{error}</p>}
    </div>
  );
}
