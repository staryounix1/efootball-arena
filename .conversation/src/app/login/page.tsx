'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogIn, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur de connexion');
      } else {
        await refreshUser();
        if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/matches');
        }
      }
    } catch {
      setError('Mochkil f l-ittisal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 mb-3">
            <LogIn className="w-7 h-7 text-black" />
          </div>
          <h1 className="text-2xl font-black text-white">Dkhol l Hisab Dyalk</h1>
          <p className="text-xs text-zinc-400 mt-1">L3eb 1vs1 w chhan rasid dyalk f kol wa9t</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Username awla Email
            </label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="admin awla smitk..."
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Kan-tconnectaw...' : 'Dkhol'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-400">
            Mazal ma 3ndekch hisab?{' '}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-bold ml-1">
              Tsjel daba fabor
            </Link>
          </p>

          <div className="mt-4 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400 text-left">
            <span className="font-semibold text-zinc-300 block mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Compte Admin Demo:
            </span>
            <span>Login: <code className="text-emerald-300 font-mono">admin</code> | MDP: <code className="text-emerald-300 font-mono">admin123</code></span>
          </div>
        </div>
      </div>
    </div>
  );
}
