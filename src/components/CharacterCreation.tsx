import React, { useState } from 'react';
import { CharacterClass } from '../types/game';
import { createCharacter, CLASS_STATS } from '../services/gameLogic';
import { auth, db } from '../firebase';
import { motion } from 'motion/react';
import { Swords, Zap, Shield, Heart, User, ChevronRight, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '../contexts/LanguageContext';
import { collection, query, where, getDocs } from 'firebase/firestore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CharacterCreationProps {
  metaCurrency: number;
  onComplete: (character: any) => void;
}

export default function CharacterCreation({ metaCurrency, onComplete }: CharacterCreationProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('Warrior');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classes: CharacterClass[] = ['Warrior', 'Mage', 'Rogue'];

  const handleCreate = async () => {
    if (!name.trim() || !auth.currentUser) return;
    
    setIsChecking(true);
    setError(null);

    try {
      // Check active characters
      const qActive = query(collection(db, 'characters'), where('name', '==', name.trim()));
      const activeSnap = await getDocs(qActive);
      
      // Check graveyard (ranking)
      const qGraveyard = query(collection(db, 'graveyard'), where('name', '==', name.trim()));
      const graveyardSnap = await getDocs(qGraveyard);

      if (!activeSnap.empty || !graveyardSnap.empty) {
        setError(t('create.name_taken'));
        setIsChecking(false);
        return;
      }

      const character = createCharacter(name.trim(), selectedClass, auth.currentUser.uid, metaCurrency);
      onComplete(character);
    } catch (err) {
      console.error('Error checking name:', err);
      setError('Failed to verify name. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 flex flex-col items-center justify-center font-sans">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-lg space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">{t('app.title')}</h1>
          <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">{t('create.title')}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold ml-1">{t('create.name_label')}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder={t('create.placeholder')}
                className={cn(
                  "w-full bg-zinc-900 border rounded-xl py-4 pl-12 pr-4 focus:outline-none transition-colors text-lg font-bold",
                  error ? "border-red-500" : "border-zinc-800 focus:border-zinc-100"
                )}
              />
            </div>
            <div className="flex flex-col gap-1 mt-2 ml-1">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                {t('create.ranking_notice')}
              </p>
              {error && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1">
                  <AlertCircle size={10} />
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {classes.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                  selectedClass === cls 
                    ? "bg-zinc-100 border-zinc-100 text-zinc-950 scale-105" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                )}
              >
                {cls === 'Warrior' && <Shield size={24} />}
                {cls === 'Mage' && <Zap size={24} />}
                {cls === 'Rogue' && <Swords size={24} />}
                <span className="text-xs font-black uppercase tracking-tighter">{t(`class.${cls}`)}</span>
              </button>
            ))}
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{t('create.class_label')}</span>
              <span className="text-xs font-mono text-zinc-100">{t(`class.${selectedClass}`)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <StatRow icon={<Heart size={14} />} label={t('stats.hp')} value={CLASS_STATS[selectedClass].hp} color="text-emerald-500" />
              <StatRow icon={<Zap size={14} />} label={t('stats.mp')} value={CLASS_STATS[selectedClass].mp} color="text-blue-500" />
              <StatRow icon={<Swords size={14} />} label={t('stats.attack')} value={CLASS_STATS[selectedClass].attack} color="text-red-500" />
              <StatRow icon={<Shield size={14} />} label={t('stats.defense')} value={CLASS_STATS[selectedClass].defense} color="text-amber-500" />
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={!name.trim() || isChecking}
            className="w-full bg-zinc-100 text-zinc-950 py-5 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isChecking ? 'Checking...' : t('create.start')}
            {!isChecking && <ChevronRight className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function StatRow({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-zinc-500">
        <span className={color}>{icon}</span>
        <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>
      </div>
      <span className="font-mono text-sm font-bold">{value}</span>
    </div>
  );
}
