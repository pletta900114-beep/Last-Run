import React, { useState, useEffect } from 'react';
import { Dungeon, Character, Monster, DungeonState } from '../types/game';
import { DUNGEONS, generateMonster } from '../services/gameLogic';
import { motion, AnimatePresence } from 'motion/react';
import { Map as MapIcon, ChevronRight, Swords, Skull, Trophy, ArrowLeft, Package, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DungeonExplorationProps {
  character: Character;
  dungeonId: string;
  onStartBattle: (monster: Monster, isBoss: boolean) => void;
  onBack: () => void;
}

export default function DungeonExploration({ character, dungeonId, onStartBattle, onBack }: DungeonExplorationProps) {
  const { t } = useLanguage();
  const dungeon = DUNGEONS.find(d => d.id === dungeonId)!;
  
  const [dungeonState, setDungeonState] = useState<DungeonState>({
    dungeonId,
    currentFloor: character.currentFloor || 1,
    isBossFloor: (character.currentFloor || 1) % 5 === 0,
    battlesInCurrentFloor: 0,
  });

  const handleExplore = () => {
    const isBoss = dungeonState.currentFloor === dungeon.maxFloor;
    const monster = generateMonster(dungeonId, dungeonState.currentFloor, isBoss);
    onStartBattle(monster, isBoss);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-12">
        <header className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-zinc-100 flex items-center gap-4">
              {dungeon.name}
            </h1>
            <p className="text-zinc-500 text-xs font-mono tracking-[0.3em] uppercase">
              {t('dungeon.floor')} {dungeonState.currentFloor} / {dungeon.maxFloor}
            </p>
          </div>
          <button 
            onClick={onBack}
            className="p-3 bg-zinc-900 text-zinc-400 rounded-2xl hover:bg-zinc-800 transition-all border border-zinc-800"
          >
            <ArrowLeft size={20} />
          </button>
        </header>

        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
          <img 
            src={dungeon.image} 
            alt={dungeon.name} 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-2"
            >
              <div className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.5em]">{t('dungeon.status')}</div>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">
                {dungeonState.currentFloor === dungeon.maxFloor ? t('dungeon.boss_approaching') : t('dungeon.exploring')}
              </h2>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={handleExplore}
            className="group relative w-full py-8 bg-zinc-100 text-zinc-950 rounded-3xl font-black uppercase tracking-widest hover:bg-white transition-all active:scale-[0.98] overflow-hidden"
          >
            <div className="relative z-10 flex items-center justify-center gap-4 text-2xl italic">
              <Swords size={32} />
              {dungeonState.currentFloor === dungeon.maxFloor ? t('dungeon.fight_boss') : t('dungeon.explore_next')}
            </div>
            <motion.div 
              className="absolute inset-0 bg-zinc-200/50"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.5 }}
            />
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onBack}
              className="flex items-center justify-center gap-3 py-4 bg-zinc-900 text-zinc-400 rounded-2xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all border border-zinc-800"
            >
              <ArrowLeft size={18} />
              {t('common.back')}
            </button>
            <div className="flex items-center justify-center gap-3 py-4 bg-zinc-900/50 text-zinc-500 rounded-2xl font-mono text-xs uppercase tracking-widest border border-zinc-900">
              <Package size={18} />
              {character.inventory?.length || 0} {t('lobby.inventory')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
