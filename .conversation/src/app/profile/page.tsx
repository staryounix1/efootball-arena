'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  User as UserIcon, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  Trophy, 
  Swords,
  CreditCard,
  Building,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import RechargeModal from '@/components/RechargeModal';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showRecharge, setShowRecharge] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('CIH Bank');
  const [destinationInfo, setDestinationInfo] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetch('/api/wallet/transactions')
        .then(res => res.json())
        .then(data => {
          if (data.transactions) setTransactions(data.transactions);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg(null);
    const num = parseFloat(withdrawAmount);

    if (isNaN(num) || num <= 0) {
      setWithdrawMsg({ type: 'error', text: 'Mablagh ghair s7i7' });
      return;
    }

    if (!user || user.balance < num) {
      setWithdrawMsg({ type: 'error', text: 'Rasid dyalk ma kafich l had l-mablagh' });
      return;
    }

    setWithdrawLoading(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: num,
          method: withdrawMethod,
          destination_info: destinationInfo
        })
      });

      const data = await res.json();
      if (res.ok) {
        setWithdrawMsg({ type: 'success', text: 'Talab l-sahb tsjel b naja7! Ghay-viri lik l-admin flousek.' });
        setWithdrawAmount('');
        setDestinationInfo('');
        await refreshUser();
      } else {
        setWithdrawMsg({ type: 'error', text: data.error || 'Erreur' });
      }
    } catch {
      setWithdrawMsg({ type: 'error', text: 'Mochkil f l-ittisal' });
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-24 text-zinc-400">
        <p>Khassek t-connecta bach tchouf l-profil dyalk</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile & Wallet Hero Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* User Card */}
        <div className="md:col-span-7 rounded-3xl bg-zinc-900/80 border border-zinc-800 p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-black font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{user.username}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-center">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">eFootball ID</span>
              <span className="text-xs font-bold text-zinc-200 font-mono">{user.efootball_id}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">WhatsApp</span>
              <span className="text-xs font-bold text-zinc-200 font-mono">{user.whatsapp}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Victoires / Défaites</span>
              <span className="text-xs font-bold font-mono">
                <strong className="text-emerald-400">{user.wins}W</strong> - <strong className="text-rose-400">{user.losses}L</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Wallet Balance Card / Admin Card */}
        {user.role === 'ADMIN' ? (
          <div className="md:col-span-5 rounded-3xl bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-950 border border-purple-500/40 p-6 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Compte Super Admin</span>
              </div>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30 font-bold">
                Idara
              </span>
            </div>

            <div className="my-4">
              <span className="text-xs text-zinc-400 block mb-1">Rôle</span>
              <span className="text-2xl font-black text-white">Idarat L-Mawqi3 Kamel</span>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                K-Admin, nta li kat-tahkkam f talabat l-chahn, tahwilat CIH w Cash Plus, w hal l-khilafat dyal l-matches.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/admin"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/25 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Dkhol l Lawhat Tahakkum (Admin Panel)</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Regular player wallet card */
          <div className="md:col-span-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/40 p-6 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Wallet className="w-4 h-4" />
                <span>Mahfadat L-Flous (Wallet)</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Actif
              </span>
            </div>

            <div className="my-4">
              <span className="text-xs text-zinc-400 block mb-1">Rasid l-Mota7 (Solde Disponible)</span>
              <span className="text-4xl font-black text-white font-mono">
                {user.balance.toFixed(2)} <span className="text-emerald-400 text-2xl">DH</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowRecharge(true)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Chahn (+ Recharge)</span>
              </button>

              <button
                onClick={() => setShowWithdraw(true)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition-all"
              >
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
                <span>Sahb (Retrait)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-amber-400" /> Talab Sahb L-Flous (Retrait)
              </h3>
              <button onClick={() => setShowWithdraw(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            {withdrawMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                withdrawMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {withdrawMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{withdrawMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Mablagh l-sahb (Max: {user.balance} DH)</label>
                <input
                  type="number"
                  min="20"
                  max={user.balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Min 20 DH"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Tariqat L-Sahb</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="CIH Bank">CIH Bank (RIB)</option>
                  <option value="Cash Plus">Cash Plus (Nom + CIN)</option>
                  <option value="Attijariwafa">Attijariwafa Bank</option>
                  <option value="USDT">USDT (Crypto TRC20)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Ma3loumat l-sahb (RIB / Nom complet / CIN)
                </label>
                <textarea
                  rows={2}
                  value={destinationInfo}
                  onChange={(e) => setDestinationInfo(e.target.value)}
                  placeholder="Ex: RIB 230... Nom: ..."
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={withdrawLoading || user.balance < 20}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 font-black text-black text-xs disabled:opacity-50"
              >
                {withdrawLoading ? 'Kan-sejlou l-talab...' : 'Irsal Talab Sahb'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" />
          Sijil L-Mu3amalat (Historique des Transactions)
        </h3>

        {transactions.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-zinc-900/30 border border-dashed border-zinc-800 text-zinc-500 text-xs">
            Mazal makayn hta chi transaction f hisabek.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Mablagh</th>
                  <th className="p-3.5 text-right">Solde apres</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {transactions.map(t => {
                  const isPositive = t.amount > 0;
                  return (
                    <tr key={t.id} className="hover:bg-zinc-800/40">
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {isPositive ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {t.type}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-300 font-medium">{t.description}</td>
                      <td className="p-3.5 text-zinc-500">{new Date(t.created_at).toLocaleString('fr-FR')}</td>
                      <td className={`p-3.5 text-right font-black font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? `+${t.amount}` : t.amount} DH
                      </td>
                      <td className="p-3.5 text-right font-mono text-zinc-400">
                        {t.balance_after.toFixed(2)} DH
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} />}
    </div>
  );
}
