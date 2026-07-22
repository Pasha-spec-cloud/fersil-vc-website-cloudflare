'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

export function DeveloperAccessForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const response = await fetch('/api/developer-access/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const payload = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(payload.error ?? 'Unable to sign in.');
      return;
    }

    window.location.href = '/';
  }

  const inputClass =
    'mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none';

  return (
    <div className="mt-10 w-full max-w-md rounded-3xl border border-white/10 bg-black/25 p-6 text-left backdrop-blur">
      <p className="text-xs uppercase tracking-[0.35em] text-muted">Developer Access</p>
      <p className="mt-3 text-sm text-muted">Sign in with your approved FerSil email and shared access password.</p>

      <form onSubmit={signIn} className="mt-6">
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
          className={inputClass}
        />
        <label htmlFor="password" className="mt-5 block text-xs uppercase tracking-[0.3em] text-muted">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className={inputClass}
        />
        <Button type="submit" className="mt-5 w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Unlock Site'}
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-rose-200">{error}</p>}
    </div>
  );
}
