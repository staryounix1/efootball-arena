'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Swords, 
  PlusCircle, 
  Play, 
  Smartphone, 
  Gamepad2, 
  Monitor, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Search,
  RefreshCw
} from 'lucide-react';
import CreateMatchModal from '@/components/CreateMatchModal';
import RechargeModal from '@/components/RechargeModal';

export default function MatchesPage() {
  const { user, refreshUser } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'ALL' ? '/api/matches' : `/api/matches?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.matches) setMatches(data.matches);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, [statusFilter]);

  const handleJoin = async (match: any) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (user.balance < match.stake) {
      setActionError(`Rasid dyalk (${user.balance} DH) ma kafich l had l-match (${match.stake} DH).`);
      setShowRechargeModal(true);
      return;
    }

    if (confirm(`Wach bghiti t-qbel had l-match b mise dyal ${match.stake} DH?`)) {
      try {
        const res = await fetch(`/api/matches/${match.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'join' })
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Mochkil f dkhoul l l-match');
        } else {
          await refreshUser();
          window.location.href = `/matches/${match.id}`;
        }
      } catch {
        alert('Erreur serveur');
      }
    }
  };

  const filteredMatches = matches.filter(m => {
    if (platformFilter !== 'ALL' && m.platform !== platformFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Swords className="w-8 h-8 text-emerald-400" />
            Lobby 1vs1 Challenges
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Khtar challenge awla kreye wahed jdid w tsenna la3ib y-accepté
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) window.location.href = '/login';
            else setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-500/20 text-sm hover:scale-[1.02] transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Kreye Challenge Jdid</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        {/* Status Filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'OPEN', label: 'Disponible (Open)' },
            { id: 'PLAYING', label: 'En cours (Playing)' },
            { id: 'DISPUTE', label: 'Khilaf (Dispute)' },
            { id: 'COMPLETED', label: 'Salaw (Terminé)' },
            { id: 'ALL', label: 'Kolchi' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Platform filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-semibold uppercase">Platform:</span>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Koulchi (All)</option>
            <option value="Mobile">Mobile (iOS/Android)</option>
            <option value="PlayStation">PlayStation</option>
            <option value="Xbox/PC">Xbox / PC</option>
          </select>

          <button
            onClick={fetchMatches}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500 text-sm flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Kan-charjiw les matches...</span>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-zinc-900/30 border border-dashed border-zinc-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-zinc-600 flex items-center justify-center mx-auto">
            <Swords className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-300">Makayn hta chi match f had l-halat</h3>
          <p className="text-xs text-zinc-500">Koun nta lewel li y-creyé match daba!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
          >
            Kreye Challenge
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((m) => {
            const isCreator = user?.id === m.creator_id;
            const isOpponent = user?.id === m.opponent_id;
            const isParticipant = isCreator || isOpponent;

            return (
              <div
                key={m.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  m.status === 'OPEN'
                    ? 'bg-zinc-900/80 border-zinc-800 hover:border-emerald-500/50 shadow-lg'
                    : m.status === 'PLAYING'
                    ? 'bg-zinc-900/60 border-cyan-500/30'
                    : m.status === 'DISPUTE'
                    ? 'bg-zinc-900/60 border-rose-500/30'
                    : 'bg-zinc-950 border-zinc-900 opacity-80'
                }`}
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                      {m.platform === 'Mobile' ? <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> : <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>{m.platform}</span>
                    </div>

                    <div>
                      {m.status === 'OPEN' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Open
                        </span>
                      )}
                      {m.status === 'PLAYING' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                          <Clock className="w-3 h-3" /> En cours
                        </span>
                      )}
                      {m.status === 'PENDING_CONFIRMATION' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          En confirmation
                        </span>
                      )}
                      {m.status === 'DISPUTE' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" /> Khilaf (Admin)
                        </span>
                      )}
                      {m.status === 'COMPLETED' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Salaw
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Players display */}
                  <div className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center">
                          {m.creator_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block leading-tight">{m.creator_name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{m.creator_efootball_id}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-zinc-500">Hôte</span>
                    </div>

                    <div className="text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                      VS
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 font-black text-xs flex items-center justify-center">
                          {m.opponent_name ? m.opponent_name.substring(0, 2).toUpperCase() : '?'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block leading-tight">
                            {m.opponent_name || 'En attente dun joueur...'}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {m.opponent_efootball_id || '----'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-zinc-500">Adversaire</span>
                    </div>
                  </div>

                  {/* Stakes & Prize info */}
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 grid grid-cols-2 gap-2 text-center my-2">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Mise</span>
                      <span className="text-sm font-bold text-white font-mono">{m.stake} DH</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Ja'iza (Prize)</span>
                      <span className="text-sm font-black text-amber-400 font-mono">{m.prize} DH</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3">
                  {m.status === 'OPEN' ? (
                    isCreator ? (
                      <Link
                        href={`/matches/${m.id}`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                      >
                        Chouf l-Match Dyalk
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleJoin(m)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Qbel L-Challenge ({m.stake} DH)</span>
                      </button>
                    )
                  ) : (
                    <Link
                      href={`/matches/${m.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 transition-colors"
                    >
                      Dkhol l Room dyal l-Match
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateMatchModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchMatches}
        />
      )}
      {showRechargeModal && (
        <RechargeModal onClose={() => setShowRechargeModal(false)} />
      )}
    </div>
  );
}
