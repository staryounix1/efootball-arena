'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  X, 
  Wallet, 
  CheckCircle2, 
  MessageCircle, 
  Copy, 
  Clock, 
  CreditCard,
  Building,
  Smartphone,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface RechargeModalProps {
  onClose: () => void;
}

const PRESET_AMOUNTS = [20, 50, 100, 200, 500];

export default function RechargeModal({ onClose }: RechargeModalProps) {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  
  // Form State
  const [amount, setAmount] = useState<number | string>(50);
  const [paymentMethod, setPaymentMethod] = useState('CIH Bank');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Success state after submitting
  const [submittedData, setSubmittedData] = useState<{
    requestId: string;
    amount: number;
    whatsappUrl: string;
    adminWhatsapp: string;
  } | null>(null);

  // Platform settings (CIH RIB, etc.)
  const [settings, setSettings] = useState<Record<string, string>>({
    cih_rib: '230 780 0000000000000000 00',
    cih_name: 'MOHAMMED ADMIN',
    cashplus_name: 'MOHAMMED ADMIN',
    cashplus_cin: 'AB123456',
    admin_whatsapp: '+212600000000'
  });

  // Past requests
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  useEffect(() => {
    // Fetch public payment settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/wallet/recharge');
      const data = await res.json();
      if (data.requests) setHistory(data.requests);
    } catch {}
    setLoadingHistory(false);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const numAmount = parseFloat(amount.toString());

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Dakhel mablagh s7i7');
      return;
    }

    if (!whatsapp.trim()) {
      setError('Dakhel raqm WhatsApp dyalk');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/wallet/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          payment_method: paymentMethod,
          whatsapp,
          notes
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Wqe3 mochkil, 3awed jarreb');
      } else {
        setSubmittedData({
          requestId: data.request.id,
          amount: data.request.amount,
          whatsappUrl: data.whatsappUrl,
          adminWhatsapp: data.adminWhatsapp
        });
        refreshUser();
      }
    } catch {
      setError('Mochkil f l-ittisal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Chahn l-Hisab (Recharge)</h2>
              <p className="text-xs text-zinc-400">Zid l-rasid bach tl3eb 1vs1 w les tournois</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/30 px-6 pt-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all mr-6 ${
              activeTab === 'create'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Talab Chahn Jdid
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              loadHistory();
            }}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Historique dyal Talabat
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'create' ? (
            submittedData ? (
              /* Success Screen */
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">Talab Chahn Tsjel b Naja7!</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Raqm l-talab dyalk houwa <span className="text-emerald-400 font-mono font-bold">#{submittedData.requestId}</span>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">L-Mablagh:</span>
                    <span className="text-white font-bold font-mono">{submittedData.amount} DH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Tariqat l-khalas:</span>
                    <span className="text-white font-medium">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">L-Halat:</span>
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> F tor l-moraqaba
                    </span>
                  </div>
                </div>

                {/* Direct WhatsApp button */}
                <div className="pt-2">
                  <a
                    href={submittedData.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/30 text-base group"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Twasel m3a l-Admin f WhatsApp Daba</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <p className="text-[11px] text-zinc-400 mt-2">
                    Click 3la l-bouton l-khdra bach y-t7ell lik WhatsApp direct m3a l-Admin m3a l-message fih ma3loumat l-virement. Ghay-validi lik l-rasid f l-blast!
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSubmittedData(null);
                    onClose();
                  }}
                  className="text-xs text-zinc-400 hover:text-zinc-200 underline pt-2"
                >
                  Rjo3 l l-mawqi3
                </button>
              </div>
            ) : (
              /* Request Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Amount presets */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Khtar L-Mablagh (DH)
                  </label>
                  <div className="grid grid-cols-5 gap-2 mb-2.5">
                    {PRESET_AMOUNTS.map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setAmount(p)}
                        className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                          amount === p
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/30'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      step="5"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Mablagh akhor..."
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-zinc-400 font-bold">
                      DH (MAD)
                    </span>
                  </div>
                </div>

                {/* Payment method selection */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Tariqat Dfa3 (Mode de paiement)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'CIH Bank', label: 'CIH Bank', icon: Building },
                      { id: 'Cash Plus', label: 'Cash Plus', icon: CreditCard },
                      { id: 'Attijariwafa', label: 'Attijariwafa', icon: Building },
                      { id: 'Inwi Money', label: 'Inwi Money', icon: Smartphone },
                      { id: 'Orange Money', label: 'Orange Money', icon: Smartphone },
                      { id: 'USDT (Crypto)', label: 'USDT (TRC20)', icon: Wallet }
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => setPaymentMethod(item.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                            paymentMethod === item.id
                              ? 'bg-emerald-500/15 border-emerald-500/80 text-emerald-300'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Admin payment details box */}
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2 text-xs">
                  <div className="text-zinc-400 font-medium flex items-center justify-between">
                    <span>Ma3loumat l-khalas dyal Admin ({paymentMethod}):</span>
                    <span className="text-[10px] text-emerald-400">Verifié ✓</span>
                  </div>

                  {paymentMethod === 'CIH Bank' && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                        <span className="text-zinc-400 font-mono text-[11px]">RIB: {settings.cih_rib}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(settings.cih_rib, 'rib')}
                          className="text-emerald-400 hover:text-emerald-300 p-1"
                          title="Copier RIB"
                        >
                          {copiedKey === 'rib' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-zinc-400 text-[11px]">Nom: <strong className="text-zinc-200">{settings.cih_name}</strong></p>
                    </div>
                  )}

                  {paymentMethod === 'Cash Plus' && (
                    <div className="space-y-1 pt-1">
                      <p className="text-zinc-400 text-[11px]">Nom complet: <strong className="text-zinc-200">{settings.cashplus_name}</strong></p>
                      <p className="text-zinc-400 text-[11px]">CIN: <strong className="text-zinc-200">{settings.cashplus_cin}</strong></p>
                    </div>
                  )}

                  {paymentMethod !== 'CIH Bank' && paymentMethod !== 'Cash Plus' && (
                    <p className="text-zinc-400 text-[11px]">
                      Ghay-3tik l-admin l-ma3loumat f WhatsApp direct bach tsift lih.
                    </p>
                  )}
                </div>

                {/* User's WhatsApp number */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Raqm WhatsApp Dyalk (Bach ytwasel m3ak Admin)
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+212 6 XX XX XX XX"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono text-sm"
                    required
                  />
                </div>

                {/* Optional Note */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Molahada (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Masalan: Virement f smiti / Capture d écran..."
                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 text-sm"
                >
                  {loading ? 'Kan-siftou l-talab...' : `Irsal Talab Chahn (${amount} DH)`}
                </button>
              </form>
            )
          ) : (
            /* History Tab */
            <div className="space-y-3">
              {loadingHistory ? (
                <div className="text-center py-8 text-zinc-500 text-sm">Kan-charjiw l-historique...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  Mazal ma derti hta chi talab chahn qbel.
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-300">#{item.id}</span>
                        <span className="text-xs text-zinc-500 font-medium">({item.payment_method})</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {new Date(item.created_at).toLocaleString('fr-FR')}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400 font-mono">
                        +{item.amount} DH
                      </div>
                      <div>
                        {item.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <Clock className="w-2.5 h-2.5" /> F l-intidar
                          </span>
                        )}
                        {item.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-2.5 h-2.5" /> T-validat
                          </span>
                        )}
                        {item.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                            <ShieldAlert className="w-2.5 h-2.5" /> Trfed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
