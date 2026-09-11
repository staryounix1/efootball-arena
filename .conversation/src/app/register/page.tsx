'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserPlus, AlertCircle, ArrowRight, Shield } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [efootballId, setEfootballId] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          efootball_id: efootballId,
          whatsapp
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur d inscription');
      } else {
        await refreshUser();
        router.push('/matches');
      }
    } catch {
      setError('Mochkil f l-ittisal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 mb-3">
            <UserPlus className="w-7 h-7 text-black" />
          </div>
          <h1 className="text-2xl font-black text-white">Fte7 Hisab Jdid</h1>
          <p className="text-xs text-zinc-400 mt-1">Dkhol l-komyuniti dyal l3iba dyal eFootball f l-Mghrib</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Pseudo / Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: Yassine_7"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                eFootball ID / Nom f l-le3ba
              </label>
              <input
                type="text"
                value={efootballId}
                onChange={(e) => setEfootballId(e.target.value)}
                placeholder="Ex: EF-123456"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Raqm WhatsApp (Bach Admin ytwasel m3ak f l-chahn)
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+212 6 XX XX XX XX"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="smitk@gmail.com"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 caractères"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Kan-sejlou l-compte...' : 'Tsjel Daba'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-400">
            3ndek hisab deja?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold ml-1">
              Dkhol l hisabk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
