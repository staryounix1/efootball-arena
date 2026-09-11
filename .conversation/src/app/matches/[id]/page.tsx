'use client';

import React, { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  Swords, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Upload, 
  Clock, 
  ArrowLeft,
  XCircle,
  Trophy,
  ShieldAlert,
  Smartphone,
  Check
} from 'lucide-react';

export default function MatchRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, refreshUser } = useAuth();

  const [match, setMatch] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Result submission
  const [myScore, setMyScore] = useState<number | string>('');
  const [claimedWinner, setClaimedWinner] = useState<string>('');
  const [proofImage, setProofImage] = useState<string>('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const fetchMatchDetails = async () => {
    try {
      const res = await fetch(`/api/matches/${id}`);
      const data = await res.json();
      if (data.match) {
        setMatch(data.match);
        if (data.match.room_code) {
          setRoomCodeInput(data.match.room_code);
        }
      }
      if (data.messages) setMessages(data.messages);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchMatchDetails();
    const interval = setInterval(fetchMatchDetails, 4000); // Live poll match state & chat
    return () => clearInterval(interval);
  }, [id]);

  const handleCopyCode = () => {
    if (match?.room_code) {
      navigator.clipboard.writeText(match.room_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSetRoomCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_room_code', room_code: roomCodeInput.trim() })
      });
      if (res.ok) {
        fetchMatchDetails();
      }
    } catch {}
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    try {
      await fetch(`/api/matches/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_message', message: chatInput.trim() })
      });
      setChatInput('');
      fetchMatchDetails();
    } catch {}
  };

  const handleCancelMatch = async () => {
    if (!confirm('Wach mteked bghiti t-annuli had l-match w y-rje3 lik rasid?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      });
      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        fetchMatchDetails();
      } else {
        alert(data.error);
      }
    } catch {}
    setActionLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!claimedWinner) {
      setSubmitError('Khtar chkoun li rbeh l-match');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_result',
          score: myScore || 0,
          claimed_winner: claimedWinner,
          proof: proofImage
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Erreur lors de la validation');
      } else {
        setSubmitSuccess('Natija tsjlat b naja7!');
        await refreshUser();
        fetchMatchDetails();
      }
    } catch {
      setSubmitError('Erreur serveur');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-zinc-400">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Kan-charjiw l-Match Room...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-24 text-zinc-400">
        <p>Match non trouvé</p>
        <Link href="/matches" className="text-emerald-400 underline text-sm mt-2 block">
          Rjo3 l l-matches
        </Link>
      </div>
    );
  }

  const isCreator = user?.id === match.creator_id;
  const isOpponent = user?.id === match.opponent_id;
  const isParticipant = isCreator || isOpponent;

  const alreadySubmitted = (isCreator && match.creator_claimed_winner) || (isOpponent && match.opponent_claimed_winner);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link href="/matches" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Rjo3 l l-Lobby
      </Link>

      {/* MATCH HEADER CARD */}
      <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 shadow-2xl relative overflow-hidden">
        {/* Status banner top */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-zinc-500">#{match.id}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400">{match.platform}</span>
          </div>

          <div>
            {match.status === 'OPEN' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> F ntidar la3ib (Open)
              </span>
            )}
            {match.status === 'PLAYING' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30">
                <Clock className="w-3.5 h-3.5 animate-spin" /> Match en cours
              </span>
            )}
            {match.status === 'PENDING_CONFIRMATION' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5" /> F tor l-t'akid
              </span>
            )}
            {match.status === 'DISPUTE' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30">
                <AlertTriangle className="w-3.5 h-3.5" /> Khilaf (Arbitrage Admin)
              </span>
            )}
            {match.status === 'COMPLETED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-zinc-300 bg-emerald-500/20 border border-emerald-500/40">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Match Salat
              </span>
            )}
            {match.status === 'CANCELLED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-zinc-500 bg-zinc-800">
                Annulé
              </span>
            )}
          </div>
        </div>

        {/* VS Hero */}
        <div className="py-6 grid grid-cols-1 md:grid-cols-11 items-center gap-4">
          {/* Player 1 (Creator) */}
          <div className="md:col-span-4 flex items-center gap-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-lg flex items-center justify-center shrink-0">
              {match.creator_name?.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Hôte (Moul l-match)</span>
              <h3 className="text-base font-bold text-white truncate">{match.creator_name}</h3>
              <p className="text-xs text-zinc-500 font-mono">ID: {match.creator_efootball_id}</p>
            </div>
          </div>

          {/* Center Stakes & VS */}
          <div className="md:col-span-3 text-center space-y-1">
            <span className="text-2xl font-black text-zinc-700 tracking-widest block font-mono">VS</span>
            <div className="inline-block px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-amber-500/30">
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Ja'izat l-Fayez</span>
              <span className="text-xl font-black text-amber-400 font-mono">{match.prize} DH</span>
            </div>
            <div className="text-[11px] text-zinc-500">Mise: {match.stake} DH kola wahed</div>
          </div>

          {/* Player 2 (Opponent) */}
          <div className="md:col-span-4 flex items-center justify-end gap-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80 text-right">
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Adversaire</span>
              <h3 className="text-base font-bold text-white truncate">
                {match.opponent_name || 'En attente...'}
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                {match.opponent_efootball_id ? `ID: ${match.opponent_efootball_id}` : '----'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-400 border border-zinc-700 font-black text-lg flex items-center justify-center shrink-0">
              {match.opponent_name ? match.opponent_name.substring(0, 2).toUpperCase() : '?'}
            </div>
          </div>
        </div>

        {/* Winner Announcement if Completed */}
        {match.status === 'COMPLETED' && (
          <div className="mt-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
            <div className="inline-flex items-center gap-2 text-amber-400 font-black text-lg">
              <Trophy className="w-6 h-6" /> L-Fayez Houwa: {match.winner_name || 'Le vainqueur'}
            </div>
            <p className="text-xs text-zinc-300">
              L-ja'iza dyal <strong className="text-amber-400">{match.prize} DH</strong> t-versat direct f l-mahfada dyalo!
            </p>
          </div>
        )}

        {/* Cancel match button if creator and OPEN */}
        {match.status === 'OPEN' && isCreator && (
          <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end">
            <button
              onClick={handleCancelMatch}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
            >
              Annuler L-Match w Rje3 l-mise ({match.stake} DH)
            </button>
          </div>
        )}
      </div>

      {/* DISPUTE ALERT IF ACTIVE */}
      {match.status === 'DISPUTE' && (
        <div className="p-5 rounded-3xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-4">
          <ShieldAlert className="w-7 h-7 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-300">Khilaf mwejahe l l-Admin (Dispute Active)</h4>
            <p className="text-xs text-zinc-300">
              Bjouj bghito trbho awla les captures d'écran ma mttafqinch. L-Admin kay-checké daba les preuves w ghay-tranchi f a9rab weqt. Flous l-match m7miya f l-Escrow.
            </p>
          </div>
        </div>
      )}

      {/* MAIN CONTENT GRID: Left: Instructions & Result, Right: Chat & Room Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Room Code & Score Submission */}
        <div className="lg:col-span-7 space-y-6">
          {/* Room Code Card */}
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Room Code dyal eFootball (Nom dyal l-ghorfa)
            </h4>

            {match.room_code ? (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Code Match eFootball</span>
                  <span className="text-xl font-black text-emerald-400 font-mono tracking-wider">
                    {match.room_code}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copier Code'}</span>
                </button>
              </div>
            ) : isParticipant ? (
              <form onSubmit={handleSetRoomCode} className="space-y-3">
                <p className="text-xs text-zinc-400">
                  Kreye ghorfa (Match Room) f eFootball app w dakhel l-code hna bach la3ib lakhor y-dkhol m3ak:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value)}
                    placeholder="Ex: 0849-1234"
                    className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-zinc-950 bg-emerald-400 hover:bg-emerald-300"
                  >
                    Sauvegarder
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-zinc-500">Mazal mol l-match ma dkhlch l-code.</p>
            )}
          </div>

          {/* Submit Result Form (if PLAYING or PENDING_CONFIRMATION) */}
          {(match.status === 'PLAYING' || match.status === 'PENDING_CONFIRMATION') && isParticipant && (
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Tasjil Natijat L-Match (Confirmation)
                </h4>
                {alreadySubmitted && (
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Sifti natija ✓
                  </span>
                )}
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                  {submitSuccess}
                </div>
              )}

              {alreadySubmitted ? (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-2">
                  <p>✓ Natija dyalk tsjlat. Ghir y-sift la3ib lakhor natija dyalo, l-system ghay-validi direct!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitResult} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                      Chkoun li rbeh l-match?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setClaimedWinner(user!.id)}
                        className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all ${
                          claimedWinner === user!.id
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        🏆 Ana li rbeht (Moi)
                      </button>
                      <button
                        type="button"
                        onClick={() => setClaimedWinner(isCreator ? match.opponent_id : match.creator_id)}
                        className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all ${
                          claimedWinner !== user!.id && claimedWinner !== ''
                            ? 'bg-zinc-800 border-zinc-600 text-zinc-200'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        🤝 La3ib lakhor li rbeh
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Score dyalk (Ex: 3)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={myScore}
                      onChange={(e) => setMyScore(e.target.value)}
                      placeholder="Masalan: 2"
                      className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Screenshot upload */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Capture d'écran (Screenshot Natija f eFootball)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-emerald-400 hover:file:bg-zinc-700"
                    />
                    {proofImage && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-zinc-800 max-h-40">
                        <img src={proofImage} alt="Capture" className="w-full object-cover" />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-3 px-4 rounded-xl font-black text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all text-xs"
                  >
                    {actionLoading ? 'Kan-siftou...' : 'Sift Natija & Valider'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Column: In-match Chat */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col h-[480px]">
            <h4 className="text-sm font-bold text-white pb-3 border-b border-zinc-800 flex items-center justify-between">
              <span>Chat dyal l-Match</span>
              <span className="text-[10px] text-emerald-400 font-mono">Live ●</span>
            </h4>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto py-4 space-y-2.5 text-xs">
              {messages.length === 0 ? (
                <div className="text-center py-10 text-zinc-500">
                  Mazal makayn hta message. Bda l-hadra m3a l-khssim!
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.user_id === user?.id;
                  const isSys = m.username === 'System';

                  if (isSys) {
                    return (
                      <div key={m.id} className="text-center py-1">
                        <span className="inline-block px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400">
                          {m.message}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-zinc-500 mb-0.5">{m.username}</span>
                      <div
                        className={`px-3.5 py-2 rounded-2xl max-w-[85%] ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            {isParticipant ? (
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-zinc-800 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Kteb message..."
                  className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="pt-3 border-t border-zinc-800 text-center text-xs text-zinc-500">
                Ghir la3ibin f had l-match li 3ndhom l-haq y-khedmo l-chat.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
