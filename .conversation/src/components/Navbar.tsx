'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Trophy, 
  Swords, 
  Wallet, 
  PlusCircle, 
  ShieldCheck, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X,
  Flame
} from 'lucide-react';
import { useLanguage, LanguageSelector } from '@/context/LanguageContext';
import RechargeModal from './RechargeModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [showRecharge, setShowRecharge] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">⚽</span>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                eFootball <span className="text-emerald-400">ARENA</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-medium block -mt-1 tracking-wider uppercase">
                {t.site_subtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link 
              href="/matches" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <Swords className="w-4 h-4 text-emerald-400" />
              {t.nav_matches}
            </Link>
            <Link 
              href="/tournaments" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              {t.nav_tournaments}
            </Link>
            <Link 
              href="/leaderboard" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <Flame className="w-4 h-4 text-orange-400" />
              {t.nav_leaderboard}
            </Link>

            {user?.role === 'ADMIN' && (
              <Link 
                href="/admin" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-purple-300 bg-purple-950/50 border border-purple-800/60 hover:bg-purple-900/60 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                {t.nav_admin}
              </Link>
            )}
          </nav>

          {/* User / Wallet / Language Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSelector />
            {user ? (
              <div className="flex items-center gap-2.5">
                {/* For Admin: Show Admin Badge instead of player balance */}
                {user.role === 'ADMIN' ? (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-all text-xs font-bold shadow-inner"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>Idarat L-Mawqi3</span>
                  </Link>
                ) : (
                  /* Regular Player: Balance Badge & Recharge */
                  <button
                    onClick={() => setShowRecharge(true)}
                    className="group flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-emerald-500/30 hover:border-emerald-500/60 transition-all shadow-inner"
                    title="Click l Chahn l-Hisab"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Wallet className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold block leading-none">{t.nav_balance}</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {user.balance.toFixed(2)} <span className="text-xs">DH</span>
                      </span>
                    </div>
                    <PlusCircle className="w-4 h-4 text-emerald-400 group-hover:rotate-90 transition-transform ml-1" />
                  </button>
                )}

                {/* Profile Link */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-sm font-medium transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-zinc-400" />
                  <span>{user.username}</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                  title={t.nav_logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  {t.nav_login}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {t.nav_register}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button & Language */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector />
            {user && user.role !== 'ADMIN' && (
              <button
                onClick={() => setShowRecharge(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-emerald-500/40 text-emerald-400 text-xs font-bold font-mono"
              >
                <Wallet className="w-3.5 h-3.5" />
                {user.balance.toFixed(0)} DH
              </button>
            )}
            {user && user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-300 text-xs font-bold"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Admin
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 pt-2 pb-5 space-y-2">
            <Link 
              href="/matches" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-200 hover:bg-zinc-900 text-sm font-medium"
            >
              <Swords className="w-4 h-4 text-emerald-400" />
              {t.nav_matches}
            </Link>
            <Link 
              href="/tournaments" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-200 hover:bg-zinc-900 text-sm font-medium"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              {t.nav_tournaments}
            </Link>
            <Link 
              href="/leaderboard" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-200 hover:bg-zinc-900 text-sm font-medium"
            >
              <Flame className="w-4 h-4 text-orange-400" />
              {t.nav_leaderboard}
            </Link>

            {user?.role === 'ADMIN' && (
              <Link 
                href="/admin" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-purple-300 bg-purple-950/40 border border-purple-800/40 text-sm font-semibold"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                {t.nav_admin}
              </Link>
            )}

            {user ? (
              <div className="pt-3 border-t border-zinc-800 space-y-2">
                {user.role !== 'ADMIN' && (
                  <button
                    onClick={() => {
                      setShowRecharge(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {t.nav_recharge}
                  </button>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-zinc-300 hover:text-white text-sm"
                >
                  <UserIcon className="w-4 h-4" />
                  {t.nav_profile} ({user.username})
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-rose-400 hover:text-rose-300 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  {t.nav_logout}
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-zinc-800 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-900"
                >
                  {t.nav_login}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-sm font-bold text-zinc-950 bg-emerald-400"
                >
                  {t.nav_register}
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Recharge Modal */}
      {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} />}
    </>
  );
}
