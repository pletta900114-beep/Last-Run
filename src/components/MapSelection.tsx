import React from 'react';
import { Dungeon } from '../types/game';
import { DUNGEONS } from '../services/gameLogic';
import { motion } from 'motion/react';
import { MapPin, ChevronRight, AlertCircle, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MapSelectionProps {
  onSelect: (dungeonId: string) => void;
  onBack: () => void;
  playerLevel: number;
}

export default function MapSelection({ onSelect, onBack, playerLevel }: MapSelectionProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-12">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-zinc-500 text-xs font-mono uppercase tracking-[0.4em]">{t('map.subtitle')}</h2>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">{t('map.title')}</h1>
          </div>
          <button 
            onClick={onBack}
            className="px-6 py-2 border border-zinc-800 rounded-xl text-xs font-mono uppercase tracking-widest hover:bg-zinc-900 transition-colors"
          >
            {t('common.back')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DUNGEONS.map((dungeon) => {
            const isLocked = playerLevel < dungeon.minLevel;
            
            return (
              <motion.div
                key={dungeon.id}
                whileHover={!isLocked ? { y: -5 } : {}}
                className={cn(
                  "group relative bg-zinc-900 border rounded-3xl overflow-hidden transition-all duration-500",
                  isLocked ? "border-zinc-800 opacity-50 grayscale" : "border-zinc-800 hover:border-zinc-100 shadow-2xl"
                )}
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img 
                    src={dungeon.image} 
                    alt={dungeon.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="px-3 py-1 bg-zinc-950/80 backdrop-blur-md rounded-full border border-zinc-800 flex items-center gap-1.5">
                      <Zap size={10} className="text-amber-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Lv. {dungeon.minLevel}+</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tight italic">{dungeon.name}</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed">{dungeon.description}</p>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-amber-400/80">
                      <AlertCircle size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{dungeon.trait.name}: {dungeon.trait.description}</span>
                    </div>
                    
                    <button
                      disabled={isLocked}
                      onClick={() => onSelect(dungeon.id)}
                      className={cn(
                        "w-full py-3 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                        isLocked 
                          ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" 
                          : "bg-zinc-100 text-zinc-950 hover:bg-white"
                      )}
                    >
                      {isLocked ? t('map.locked') : t('map.enter')}
                      {!isLocked && <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
