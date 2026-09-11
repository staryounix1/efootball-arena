'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Swords, 
  Trophy, 
  Wallet, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Flame, 
  CheckCircle2, 
  Users, 
  PlusCircle,
  Play,
  Award
} from 'lucide-react';
import CreateMatchModal from '@/components/CreateMatchModal';
import RechargeModal from '@/components/RechargeModal';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [openMatches, setOpenMatches] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [matchesRes, tournsRes] = await Promise.all([
        fetch('/api/matches?status=OPEN'),
        fetch('/api/tournaments')
      ]);
      const matchesData = await matchesRes.json();
      const tournsData = await tournsRes.json();
      if (matchesData.matches) setOpenMatches(matchesData.matches.slice(0, 4));
      if (tournsData.tournaments) setTournaments(tournsData.tournaments.slice(0, 2));
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 border-b border-zinc-800/80 bg-gradient-to-b from-emerald-950/20 via-zinc-950 to-[#090b10]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Col: Hero text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{t.hero_badge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                {t.hero_title_1}<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">{t.hero_title_highlight}</span>{t.hero_title_2}
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t.hero_desc}
              </p>

              {/* Action CTA buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => {
                    if (!user) window.location.href = '/login';
                    else setShowCreateMatch(true);
                  }}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-500/25 transition-all text-sm group hover:scale-[1.02]"
                >
                  <Swords className="w-5 h-5" />
                  <span>{t.hero_btn_create}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    if (!user) window.location.href = '/login';
                    else setShowRecharge(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-emerald-400 bg-zinc-900/90 border border-emerald-500/40 hover:bg-emerald-950/30 transition-all text-sm"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{t.hero_btn_recharge}</span>
                </button>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 max-w-lg mx-auto lg:mx-0 border-t border-zinc-800/80">
                <div className="text-left">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono">1,240+</span>
                  <span className="text-[11px] text-zinc-400 block">{t.hero_stat_matches}</span>
                </div>
                <div className="text-left">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">35,000 DH+</span>
                  <span className="text-[11px] text-zinc-400 block">{t.hero_stat_prizes}</span>
                </div>
                <div className="text-left">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">100%</span>
                  <span className="text-[11px] text-zinc-400 block">{t.hero_stat_escrow}</span>
                </div>
              </div>
            </div>

            {/* Right Col: Live Open Match Card preview */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-2xl backdrop-blur-md overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t.live_available}</span>
                  </div>
                  <Link href="/matches" className="text-xs text-zinc-400 hover:text-emerald-400 font-semibold flex items-center gap-1">
                    {t.see_all} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="py-4 space-y-3">
                  {openMatches.length > 0 ? (
                    openMatches.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-emerald-500/50 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black">
                            ⚽
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-white">{m.creator_name}</span>
                              <span className="text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded font-mono">
                                {m.platform}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-400">{t.stake}: <strong className="text-zinc-200">{m.stake} DH</strong></span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-amber-400 block font-mono">
                            {t.prize}: {m.prize} DH
                          </span>
                          <Link
                            href={`/matches/${m.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors mt-1"
                          >
                            <Play className="w-3 h-3 fill-current" /> {t.accept}
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-zinc-400">
                      {t.no_open_matches}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (!user) window.location.href = '/login';
                      else setShowCreateMatch(true);
                    }}
                    className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 hover:border-emerald-500 text-zinc-400 hover:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" /> {t.create_challenge_btn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white">{t.how_title}</h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            {t.how_subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: t.step1_title,
              desc: t.step1_desc,
              icon: Wallet,
              color: 'text-emerald-400'
            },
            {
              step: '02',
              title: t.step2_title,
              desc: t.step2_desc,
              icon: Swords,
              color: 'text-cyan-400'
            },
            {
              step: '03',
              title: t.step3_title,
              desc: t.step3_desc,
              icon: Play,
              color: 'text-amber-400'
            },
            {
              step: '04',
              title: t.step4_title,
              desc: t.step4_desc,
              icon: Award,
              color: 'text-purple-400'
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all relative overflow-hidden group"
              >
                <div className="text-4xl font-black text-zinc-800/80 group-hover:text-zinc-700/80 transition-colors font-mono absolute top-3 right-4">
                  {item.step}
                </div>
                <div className={`w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED TOURNAMENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              {t.tourn_title}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">{t.tourn_subtitle}</p>
          </div>
          <Link
            href="/tournaments"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            {t.see_all} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournaments.map((tr) => (
            <div
              key={tr.id}
              className="rounded-3xl bg-zinc-900/80 border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all shadow-xl group"
            >
              <div className="h-40 bg-zinc-950 relative overflow-hidden">
                <img
                  src={tr.banner}
                  alt={tr.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-amber-500/90 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {t.prize}: {tr.prize_pool} DH
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-lg font-black text-white">{tr.title}</h3>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-zinc-800 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">{t.tourn_entry_fee}</span>
                    <span className="font-bold text-white font-mono">{tr.entry_fee} DH</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">{t.tourn_players}</span>
                    <span className="font-bold text-white font-mono">{tr.participant_count || 0}/{tr.max_players}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">{t.tourn_start}</span>
                    <span className="font-bold text-emerald-400">{tr.start_date}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-zinc-400">Knockout Direct • 10 Min</span>
                  <Link
                    href={`/tournaments`}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors"
                  >
                    {t.tourn_details}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST / ESCROW BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-teal-950/40 border border-emerald-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{t.escrow_title}</h3>
              <p className="text-xs text-zinc-300 max-w-xl mt-1">
                {t.escrow_desc}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!user) window.location.href = '/login';
              else setShowRecharge(true);
            }}
            className="shrink-0 px-6 py-3 rounded-xl font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all text-xs"
          >
            {t.escrow_cta}
          </button>
        </div>
      </section>

      {/* Modals */}
      {showCreateMatch && (
        <CreateMatchModal
          onClose={() => setShowCreateMatch(false)}
          onSuccess={fetchData}
        />
      )}
      {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} />}
    </div>
  );
}
