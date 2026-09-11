'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  Wallet, 
  Users, 
  AlertTriangle, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  MessageCircle, 
  ExternalLink, 
  Plus, 
  Minus, 
  Clock, 
  RefreshCw,
  Search,
  Save,
  Trophy
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'recharges' | 'disputes' | 'users' | 'settings'>('recharges');

  // Data states
  const [recharges, setRecharges] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Manual User Adjustment Modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('50');
  const [adjustReason, setAdjustReason] = useState<string>('Ziyadat rasid yadawiya');

  // Filter
  const [rechargeFilter, setRechargeFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchRecharges = async () => {
    try {
      const res = await fetch('/api/admin/recharges');
      const data = await res.json();
      if (data.requests) setRecharges(data.requests);
    } catch {}
  };

  const fetchDisputes = async () => {
    try {
      const res = await fetch('/api/admin/disputes');
      const data = await res.json();
      if (data.disputes) setDisputes(data.disputes);
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) setUsersList(data.users);
    } catch {}
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch {}
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchRecharges(), fetchDisputes(), fetchUsers(), fetchSettings()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Action: Approve Recharge
  const handleApproveRecharge = async (requestId: string, amount: number, username: string) => {
    if (!confirm(`Wach bghiti t-validé had l-talab w t-zid ${amount} DH l ${username}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/recharges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'approve' })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', data.message);
        fetchRecharges();
        fetchUsers();
      } else {
        showFeedback('error', data.error);
      }
    } catch {
      showFeedback('error', 'Erreur serveur');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Reject Recharge
  const handleRejectRecharge = async (requestId: string) => {
    const reason = prompt('Sbab l-rafd (Optionnel):', 'Paiement non reçu');
    if (reason === null) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/recharges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'reject', admin_notes: reason })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', data.message);
        fetchRecharges();
      } else {
        showFeedback('error', data.error);
      }
    } catch {
      showFeedback('error', 'Erreur serveur');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Manual Balance Adjustment
  const handleUserAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseFloat(adjustAmount),
          reason: adjustReason
        })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', data.message);
        setSelectedUser(null);
        fetchUsers();
      } else {
        showFeedback('error', data.error);
      }
    } catch {
      showFeedback('error', 'Erreur serveur');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Resolve Dispute
  const handleResolveDispute = async (matchId: string, decision: string, winnerId?: string) => {
    if (!confirm('Wach mteked mn had l-qarar?')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, decision, winnerId })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', data.message);
        fetchDisputes();
      } else {
        showFeedback('error', data.error);
      }
    } catch {
      showFeedback('error', 'Erreur serveur');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', data.message);
      } else {
        showFeedback('error', data.error);
      }
    } catch {
      showFeedback('error', 'Erreur serveur');
    } finally {
      setActionLoading(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Mamnoo3 (Accès Réservé l l-Admin)</h2>
        <p className="text-xs text-zinc-400">
          Khassek tkoun connecte b compte d'administration bach tchouf had l-page.
        </p>
      </div>
    );
  }

  const filteredRecharges = recharges.filter(r => {
    if (rechargeFilter === 'ALL') return true;
    return r.status === rechargeFilter;
  });

  const pendingCount = recharges.filter(r => r.status === 'PENDING').length;
  const disputeCount = disputes.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-white">Admin Panel (Idarat l-Mawqi3)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Super Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Geri talabat l-chahn l-yadawiya, zid rasid l l-la3ibin, w tranchi f les disputes.
          </p>
        </div>

        <button
          onClick={loadAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase">Talabat Chahn En Attente</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-2 block">
            {pendingCount}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase">Khilafat (Disputes)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-black text-rose-400 font-mono mt-2 block">
            {disputeCount}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase">Total La3ibin (Users)</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono mt-2 block">
            {usersList.length}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase">Commission Plateforme</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl font-black text-purple-400 font-mono mt-2 block">
            {(parseFloat(settings.commission_rate || '0.10') * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'recharges', label: 'Talabat l-Chahn (Deposits)', icon: Wallet, badge: pendingCount },
          { id: 'disputes', label: 'Idarat l-Khilafat (Disputes)', icon: AlertTriangle, badge: disputeCount },
          { id: 'users', label: 'L-La3ibin & Ziyadat Rasid', icon: Users },
          { id: 'settings', label: 'I3dadat & Paiement (RIB)', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: RECHARGES (MANUAL DEPOSITS) */}
      {activeTab === 'recharges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-black text-white">Talabat Chahn l-Rasid</h3>
            <div className="flex gap-1.5">
              {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setRechargeFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    rechargeFilter === f
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {f === 'PENDING' ? 'En attente' : f === 'APPROVED' ? 'Validés' : f === 'REJECTED' ? 'Refusés' : 'Tous'}
                </button>
              ))}
            </div>
          </div>

          {filteredRecharges.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-zinc-900/40 border border-dashed border-zinc-800 text-zinc-500 text-sm">
              Makayn hta chi talab chahn f had l-status.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecharges.map(req => {
                const cleanPhone = req.whatsapp.replace(/[^0-9]/g, '');
                const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Salam ${req.username}! Bkhosos talab chahn #${req.id} dyal ${req.amount} DH...`
                )}`;

                return (
                  <div
                    key={req.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                      req.status === 'PENDING'
                        ? 'bg-zinc-900/90 border-emerald-500/40 shadow-lg'
                        : 'bg-zinc-950 border-zinc-800/80 opacity-80'
                    }`}
                  >
                    {/* User & Request Details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white font-mono">#{req.id}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                          {req.payment_method}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(req.created_at).toLocaleString('fr-FR')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <span className="text-zinc-300">
                          La3ib: <strong className="text-emerald-400">{req.username}</strong>
                        </span>
                        <span className="text-zinc-400 font-mono">ID eFootball: {req.efootball_id}</span>
                        <span className="text-zinc-400">Solde actuel: <strong className="font-mono">{req.current_balance} DH</strong></span>
                      </div>

                      {req.notes && (
                        <div className="text-xs text-zinc-400 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                          Note du joueur: <span className="text-zinc-200">{req.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-800">
                      <div className="text-left lg:text-right mr-2">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Mablagh l-chahn</span>
                        <span className="text-xl font-black text-emerald-400 font-mono">
                          +{req.amount} DH
                        </span>
                      </div>

                      {/* WhatsApp direct chat button */}
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-bold"
                        title="Twasel f WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp ({req.whatsapp})</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {/* Approve / Reject buttons */}
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveRecharge(req.id, req.amount, req.username)}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs shadow-lg shadow-emerald-500/20"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Validé & Zid Rasid</span>
                          </button>

                          <button
                            onClick={() => handleRejectRecharge(req.id)}
                            disabled={actionLoading}
                            className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold"
                            title="Rfed"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            req.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {req.status === 'APPROVED' ? 'Validé ✓' : 'Refusé ✕'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DISPUTES */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-white">Idarat L-Khilafat (Match Disputes)</h3>

          {disputes.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-zinc-900/40 border border-dashed border-zinc-800 text-zinc-500 text-sm">
              Lhamdullah makayn hta chi khilaf mftou7 daba. Kolchi tranquille!
            </div>
          ) : (
            <div className="space-y-6">
              {disputes.map(match => (
                <div key={match.id} className="p-6 rounded-3xl bg-zinc-900/90 border border-rose-500/40 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div>
                      <span className="text-xs font-bold text-rose-400 font-mono">Dispute #{match.id}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{match.title}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Prize Pot</span>
                      <span className="text-base font-black text-amber-400 font-mono">{match.prize} DH</span>
                    </div>
                  </div>

                  {/* Screenshots & Claims Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Player 1 Claim */}
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400">{match.creator_name} (Hôte)</span>
                        <span className="text-xs font-mono">Score: {match.creator_score}</span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Claimed Winner: <strong>{match.creator_claimed_winner === match.creator_id ? 'Raso' : 'L-khssim'}</strong>
                      </p>
                      {match.creator_proof ? (
                        <div className="mt-2 rounded-xl overflow-hidden border border-zinc-800 max-h-48">
                          <img src={match.creator_proof} alt="Proof 1" className="w-full object-cover" />
                        </div>
                      ) : (
                        <div className="text-[11px] text-zinc-500 italic">Makaynch capture</div>
                      )}
                    </div>

                    {/* Player 2 Claim */}
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400">{match.opponent_name} (Adversaire)</span>
                        <span className="text-xs font-mono">Score: {match.opponent_score}</span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Claimed Winner: <strong>{match.opponent_claimed_winner === match.opponent_id ? 'Raso' : 'L-khssim'}</strong>
                      </p>
                      {match.opponent_proof ? (
                        <div className="mt-2 rounded-xl overflow-hidden border border-zinc-800 max-h-48">
                          <img src={match.opponent_proof} alt="Proof 2" className="w-full object-cover" />
                        </div>
                      ) : (
                        <div className="text-[11px] text-zinc-500 italic">Makaynch capture</div>
                      )}
                    </div>
                  </div>

                  {/* Admin Resolution Buttons */}
                  <div className="pt-3 border-t border-zinc-800 flex flex-wrap gap-2 justify-end">
                    <button
                      onClick={() => handleResolveDispute(match.id, 'PICK_WINNER', match.creator_id)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black"
                    >
                      🏆 Fowwez {match.creator_name} ({match.prize} DH)
                    </button>

                    <button
                      onClick={() => handleResolveDispute(match.id, 'PICK_WINNER', match.opponent_id)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black"
                    >
                      🏆 Fowwez {match.opponent_name} ({match.prize} DH)
                    </button>

                    <button
                      onClick={() => handleResolveDispute(match.id, 'REFUND_BOTH')}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    >
                      Annuler l-Match w Rje3 l-mise l bjouj
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USERS & BALANCE ADJUSTMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white">Qayimat L-La3ibin & Ziyadat Rasid</h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Pseudo</th>
                  <th className="p-3.5">eFootball ID</th>
                  <th className="p-3.5">WhatsApp</th>
                  <th className="p-3.5">Rasid (Balance)</th>
                  <th className="p-3.5">W / L</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 bg-zinc-900/60">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">{u.username}</td>
                    <td className="p-3.5 font-mono text-zinc-400">{u.efootball_id}</td>
                    <td className="p-3.5 font-mono text-zinc-400">{u.whatsapp}</td>
                    <td className="p-3.5 font-bold text-emerald-400 font-mono">{u.balance.toFixed(2)} DH</td>
                    <td className="p-3.5 font-mono text-zinc-300">
                      <span className="text-emerald-400">{u.wins}W</span> / <span className="text-rose-400">{u.losses}L</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-zinc-200 text-xs font-semibold transition-colors"
                      >
                        ± Zid / N9es Rasid
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl space-y-6">
          <div>
            <h3 className="text-lg font-black text-white">I3dadat l-Mawqi3 & Paiement</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Beddel ma3loumat l-khalas dyal CIH Bank w Cash Plus li kaybanou l nass f talab l-chahn.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Raqm WhatsApp dyal Admin
              </label>
              <input
                type="text"
                value={settings.admin_whatsapp || ''}
                onChange={(e) => setSettings({ ...settings, admin_whatsapp: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  CIH Bank - RIB
                </label>
                <input
                  type="text"
                  value={settings.cih_rib || ''}
                  onChange={(e) => setSettings({ ...settings, cih_rib: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  CIH Bank - Nom Complet
                </label>
                <input
                  type="text"
                  value={settings.cih_name || ''}
                  onChange={(e) => setSettings({ ...settings, cih_name: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Cash Plus - Nom Complet
                </label>
                <input
                  type="text"
                  value={settings.cashplus_name || ''}
                  onChange={(e) => setSettings({ ...settings, cashplus_name: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Cash Plus - CIN
                </label>
                <input
                  type="text"
                  value={settings.cashplus_cin || ''}
                  onChange={(e) => setSettings({ ...settings, cashplus_cin: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Taux Commission Plateforme (Ex: 0.10 = 10%)
              </label>
              <input
                type="text"
                value={settings.commission_rate || '0.10'}
                onChange={(e) => setSettings({ ...settings, commission_rate: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Sauvegarder les paramètres</span>
            </button>
          </form>
        </div>
      )}

      {/* Manual Balance Adjustment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Zid awla N9es Rasid: <span className="text-emerald-400">{selectedUser.username}</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Rasid dyalo l-hali: <strong className="text-white font-mono">{selectedUser.balance.toFixed(2)} DH</strong>
            </p>

            <form onSubmit={handleUserAdjustment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Mablagh (+ l ziyada, - l khasm)
                </label>
                <input
                  type="number"
                  step="1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Sbab (Motif)
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-xs font-bold text-zinc-950"
                >
                  Appliquer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
