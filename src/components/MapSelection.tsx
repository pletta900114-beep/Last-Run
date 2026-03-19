import React from 'react';
import { Dungeon, Character } from '../types/game';
import { DUNGEONS } from '../services/gameLogic';
import { motion } from 'motion/react';
import { Map as MapIcon, ChevronRight, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MapSelectionProps {
  character: Character;
  onSelectDungeon: (dungeonId: string) => void;
  onBack: () => void;
}

export default function MapSelection({ character, onSelectDungeon, onBack }: MapSelectionProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter uppercase italic text-zinc-100 flex items-center gap-4">
              <MapIcon size={40} className="text-zinc-500" />
              {t('map.title')}
            </h1>
            <p className="text-zinc-500 text-sm font-mono tracking-[0.3em] uppercase">{t('map.subtitle')}</p>
          </div>
          <button 
            onClick={onBack}
            className="px-6 py-3 bg-zinc-900 text-zinc-400 rounded-2xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all border border-zinc-800"
          >
            {t('common.back')}
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {DUNGEONS.map((dungeon, index) => {
            const isLocked = character.level < dungeon.minLevel;
            
            return (
              <motion.div
                key={dungeon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border transition-all",
                  isLocked 
                    ? "bg-zinc-900/20 border-zinc-900 grayscale opacity-60" 
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 cursor-pointer"
                )}
                onClick={() => !isLocked && onSelectDungeon(dungeon.id)}
              >
                <div className="flex flex-col md:flex-row h-full">
                  <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden">
                    <img 
                      src={dungeon.image} 
                      alt={dungeon.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 to-transparent md:from-transparent" />
                  </div>
                  
                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h2 className="text-3xl font-black uppercase tracking-tight italic group-hover:text-white transition-colors">
                            {dungeon.name}
                          </h2>
                          <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-zinc-500">
                            <span>{t('map.min_level')}: {dungeon.minLevel}</span>
                            <span>{t('map.max_floor')}: {dungeon.maxFloor}</span>
                          </div>
                        </div>
                        {isLocked ? (
                          <Lock className="text-zinc-700" size={24} />
                        ) : (
                          <ChevronRight className="text-zinc-700 group-hover:text-zinc-100 transition-colors" size={24} />
                        )}
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                        {dungeon.description}
                      </p>
                    </div>
                    
                    {!isLocked && (
                      <div className="mt-6 flex gap-2">
                        {dungeon.monsterPool.slice(0, 3).map(mId => (
                          <span key={mId} className="px-3 py-1 bg-zinc-800/50 rounded-full text-[10px] font-mono uppercase tracking-widest text-zinc-500 border border-zinc-800">
                            {mId}
                          </span>
                        ))}
                        <span className="px-3 py-1 bg-zinc-800/50 rounded-full text-[10px] font-mono uppercase tracking-widest text-zinc-500 border border-zinc-800">
                          ...
                        </span>
                      </div>
                    )}
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
