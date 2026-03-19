import React from 'react';
import { Character, PlayData } from '../types/game';
import { motion } from 'motion/react';
import { Trophy, Skull, Swords, Heart, Zap, Package, Timer, Target, Flame, Shield, Sparkles, Brain } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface EndingProps {
  character: Character;
  endingType: 'normal' | 'berserker' | 'survivor' | 'gambler' | 'tactician';
  onRestart: () => void;
}

export default function Ending({ character, endingType, onRestart }: EndingProps) {
  const { t } = useLanguage();
  const data = character.playData || {
    totalDamageTaken: 0,
    totalDamageDealt: 0,
    riskySkillUsage: 0,
    chanceSkillUsage: 0,
    itemUsage: 0,
    battlesWon: 0,
    totalTurns: 0,
    bossesDefeated: 0,
  };

  const getEndingDetails = () => {
    switch (endingType) {
      case 'berserker':
        return {
          title: t('ending.berserker.title'),
          description: t('ending.berserker.description'),
          icon: <Flame className="text-red-500" size={48} />,
          color: 'from-red-900/20 to-zinc-950',
          borderColor: 'border-red-500/50',
        };
      case 'survivor':
        return {
          title: t('ending.survivor.title'),
          description: t('ending.survivor.description'),
          icon: <Shield className="text-emerald-500" size={48} />,
          color: 'from-emerald-900/20 to-zinc-950',
          borderColor: 'border-emerald-500/50',
        };
      case 'gambler':
        return {
          title: t('ending.gambler.title'),
          description: t('ending.gambler.description'),
          icon: <Sparkles className="text-purple-500" size={48} />,
          color: 'from-purple-900/20 to-zinc-950',
          borderColor: 'border-purple-500/50',
        };
      case 'tactician':
        return {
          title: t('ending.tactician.title'),
          description: t('ending.tactician.description'),
          icon: <Brain className="text-blue-500" size={48} />,
          color: 'from-blue-900/20 to-zinc-950',
          borderColor: 'border-blue-500/50',
        };
      default:
        return {
          title: t('ending.normal.title'),
          description: t('ending.normal.description'),
          icon: <Trophy className="text-amber-500" size={48} />,
          color: 'from-amber-900/20 to-zinc-950',
          borderColor: 'border-amber-500/50',
        };
    }
  };

  const details = getEndingDetails();

  return (
    <div className={`min-h-screen bg-gradient-to-b ${details.color} text-zinc-100 p-4 md:p-8 flex items-center justify-center font-sans`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-2xl bg-zinc-900/80 backdrop-blur-xl border ${details.borderColor} rounded-3xl p-8 md:p-12 space-y-8 shadow-2xl relative overflow-hidden`}
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-zinc-100/5 rounded-full blur-3xl" />
        
        <div className="text-center space-y-4 relative">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="p-6 bg-zinc-950 rounded-full border border-zinc-800 shadow-inner">
              {details.icon}
            </div>
          </motion.div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">
              {details.title}
            </h1>
            <p className="text-zinc-400 text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed">
              {details.description}
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-zinc-800/50">
          <SummaryStat icon={<Swords size={14} />} label={t('ending.stat.damage_dealt')} value={data.totalDamageDealt} />
          <SummaryStat icon={<Heart size={14} />} label={t('ending.stat.damage_taken')} value={data.totalDamageTaken} />
          <SummaryStat icon={<Target size={14} />} label={t('ending.stat.battles_won')} value={data.battlesWon} />
          <SummaryStat icon={<Timer size={14} />} label={t('ending.stat.total_turns')} value={data.totalTurns} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DetailStat label={t('ending.stat.risky_usage')} value={data.riskySkillUsage} color="text-red-400" />
          <DetailStat label={t('ending.stat.chance_usage')} value={data.chanceSkillUsage} color="text-purple-400" />
          <DetailStat label={t('ending.stat.item_usage')} value={data.itemUsage} color="text-emerald-400" />
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <button
            onClick={onRestart}
            className="w-full py-4 bg-zinc-100 text-zinc-950 font-black uppercase tracking-widest italic rounded-2xl hover:bg-white transition-all shadow-lg active:scale-95"
          >
            {t('ending.restart')}
          </button>
          <p className="text-center text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
            {t('ending.footer')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function SummaryStat({ icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <div className="text-center space-y-1">
      <div className="flex items-center justify-center gap-1.5 text-zinc-500">
        {icon}
        <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>
      </div>
      <p className="text-xl font-black font-mono">{value.toLocaleString()}</p>
    </div>
  );
}

function DetailStat({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 flex justify-between items-center">
      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">{label}</span>
      <span className={`text-sm font-black font-mono ${color}`}>{value}</span>
    </div>
  );
}
