import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Character } from '../types/game';
import { Trophy, ArrowLeft, Medal, User, Skull } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '../contexts/LanguageContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LeaderboardProps {
  onBack: () => void;
}

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const { t } = useLanguage();
  const [rankings, setRankings] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const graveyardRef = collection(db, 'graveyard');
    const q = query(graveyardRef, orderBy('score', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Character);
      setRankings(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'graveyard');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <Skull className="text-red-500" size={32} />
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">The Graveyard</h1>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-zinc-500 font-mono text-sm uppercase tracking-widest">
              Loading Memorials...
            </div>
          ) : rankings.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 font-mono text-sm uppercase tracking-widest">
              No fallen heroes yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {rankings.map((char, index) => (
                <motion.div 
                  key={`${char.id}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="w-10 flex justify-center">
                    {index === 0 ? (
                      <Trophy className="text-amber-400" size={24} />
                    ) : (
                      <span className="text-zinc-600 font-mono font-bold">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                    <User size={20} className="text-zinc-400" />
                  </div>

                  <div className="flex-1">
                    <div className="font-bold text-zinc-100 flex items-center gap-2">
                      {char.name}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono flex items-center gap-2">
                      {char.class}
                      {char.killedBy && (
                        <>
                          <span className="text-zinc-700">•</span>
                          <span className="text-red-500/70 lowercase italic">
                            {t('leaderboard.killed_by', { name: t(`monster.${char.killedBy}`) })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black italic text-zinc-100">
                      Lv.{char.level}
                    </div>
                    <div className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold">
                      {char.score.toLocaleString()} PTS
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
