'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Medal, Award, User as UserIcon } from 'lucide-react';

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.players) setPlayers(data.players);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
          <Flame className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Classement L-Abtal (Top Players)</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Ahsan la3ibin f eFootball f l-Mghrib hasab 3adad l-intissarat
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-500 text-sm">Kan-charjiw l-classement...</div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-4 w-16 text-center">Rang</th>
                <th className="p-4">Joueur</th>
                <th className="p-4">eFootball ID</th>
                <th className="p-4 text-center">Victoires (Wins)</th>
                <th className="p-4 text-center">Défaites (Losses)</th>
                <th className="p-4 text-right">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {players.map((p, idx) => (
                <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4 text-center font-bold">
                    {idx === 0 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-black font-black text-sm">1</span>
                    ) : idx === 1 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-300 text-black font-black text-sm">2</span>
                    ) : idx === 2 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black text-sm">3</span>
                    ) : (
                      <span className="text-zinc-500 font-mono">#{idx + 1}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold">
                        {p.username.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-white text-sm">{p.username}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-zinc-400">{p.efootball_id}</td>
                  <td className="p-4 text-center font-bold text-emerald-400 font-mono text-sm">{p.wins}</td>
                  <td className="p-4 text-center font-bold text-rose-400 font-mono text-sm">{p.losses}</td>
                  <td className="p-4 text-right font-bold text-white font-mono text-sm">{p.win_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
