'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Trophy, 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  Award
} from 'lucide-react';
import RechargeModal from '@/components/RechargeModal';

export default function TournamentsPage() {
  const { user, refreshUser } = useAuth();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [showRecharge, setShowRecharge] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments');
      const data = await res.json();
      if (data.tournaments) setTournaments(data.tournaments);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleJoin = async (tournament: any) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (user.balance < tournament.entry_fee) {
      setMsg({ type: 'error', text: `Rasid dyalk (${user.balance} DH) ma kafich l frais d'inscription (${tournament.entry_fee} DH).` });
      setShowRecharge(true);
      return;
    }

    if (!confirm(`Wach bghiti tsjel f ${tournament.title} b frais dyal ${tournament.entry_fee} DH?`)) return;

    setJoiningId(tournament.id);
    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: tournament.id })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'Tsjelti b naja7 f l-botola! Ghay-tla9a bracket qbel l-weqt.' });
        await refreshUser();
        fetchTournaments();
      } else {
        setMsg({ type: 'error', text: data.error || 'Mochkil f tasjil' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Erreur serveur' });
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Botolat eFootball (Tournois)</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Championships rasmiya b jawai'z kach mhmma. Tirage au sort direct w matches 10 min.
            </p>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tournaments list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tournaments.map(t => (
          <div
            key={t.id}
            className="rounded-3xl bg-zinc-900/80 border border-zinc-800 overflow-hidden shadow-xl flex flex-col justify-between"
          >
            <div>
              {/* Banner */}
              <div className="h-44 bg-zinc-950 relative overflow-hidden">
                <img src={t.banner} alt={t.title} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Ja'iza Totale: {t.prize_pool} DH
                </div>
                <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur-md text-zinc-200 text-xs font-mono px-2.5 py-1 rounded-lg border border-zinc-700">
                  {t.participant_count || 0}/{t.max_players} Places
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-black text-white">{t.title}</h3>
                <p className="text-xs text-zinc-400">{t.rules}</p>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-800 text-center">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Frais D'entrée</span>
                    <span className="text-sm font-black text-white font-mono">{t.entry_fee} DH</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Weqt l-bdaya</span>
                    <span className="text-xs font-bold text-emerald-400 block mt-0.5">{t.start_date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Nidam</span>
                    <span className="text-xs font-bold text-zinc-300 block mt-0.5">Direct Knockout</span>
                  </div>
                </div>

                {/* Prize Breakdown */}
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-1.5 font-semibold">
                    <Award className="w-4 h-4 text-amber-400" /> Ta9sim L-Jawa'iz:
                  </span>
                  <span className="text-zinc-300 font-mono">
                    🥇 1er: {(t.prize_pool * 0.6).toFixed(0)} DH • 🥈 2ème: {(t.prize_pool * 0.3).toFixed(0)} DH • 🥉 3ème: {(t.prize_pool * 0.1).toFixed(0)} DH
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="p-6 pt-0">
              {t.isJoined ? (
                <div className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Tsjelti deja f had l-botola
                </div>
              ) : (
                <button
                  onClick={() => handleJoin(t)}
                  disabled={joiningId === t.id}
                  className="w-full py-3 rounded-xl font-black text-xs text-zinc-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition-all shadow-lg shadow-amber-500/20"
                >
                  {joiningId === t.id ? 'Kan-sejlouk...' : `Tasjil f L-Botola (${t.entry_fee} DH)`}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} />}
    </div>
  );
}
