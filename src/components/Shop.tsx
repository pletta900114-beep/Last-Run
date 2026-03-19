import React from 'react';
import { Character } from '../types/game';
import { motion } from 'motion/react';
import { ShoppingBag, Heart, Swords, Shield, Zap, ChevronLeft, Trophy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ShopItem {
  id: string;
  nameKey: string;
  descKey: string;
  price: number;
  type: 'potion' | 'weapon' | 'armor';
  effect: (char: Character) => Character;
  icon: any;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'p1',
    nameKey: 'shop.item.p1.name',
    descKey: 'shop.item.p1.desc',
    price: 20,
    type: 'potion',
    icon: <Heart size={20} />,
    effect: (char) => ({
      ...char,
      stats: { ...char.stats, hp: Math.min(char.stats.maxHp, char.stats.hp + 50) }
    })
  },
  {
    id: 'w1',
    nameKey: 'shop.item.w1.name',
    descKey: 'shop.item.w1.desc',
    price: 100,
    type: 'weapon',
    icon: <Swords size={20} />,
    effect: (char) => ({
      ...char,
      stats: { ...char.stats, attack: char.stats.attack + 5 }
    })
  },
  {
    id: 'a1',
    nameKey: 'shop.item.a1.name',
    descKey: 'shop.item.a1.desc',
    price: 80,
    type: 'armor',
    icon: <Shield size={20} />,
    effect: (char) => ({
      ...char,
      stats: { ...char.stats, defense: char.stats.defense + 3 }
    })
  }
];

interface ShopProps {
  character: Character;
  onPurchase: (updatedChar: Character) => void;
  onBack: () => void;
}

export default function Shop({ character, onPurchase, onBack }: ShopProps) {
  const { t } = useLanguage();
  const handleBuy = (item: ShopItem) => {
    if (character.gold < item.price) return;
    
    const updatedChar = item.effect({
      ...character,
      gold: character.gold - item.price
    });
    
    onPurchase(updatedChar);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl space-y-8">
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-100 hover:border-zinc-700 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">{t('shop.title')}</h2>
          </div>
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
            <Trophy size={18} className="text-amber-500" />
            <span className="font-mono font-bold text-amber-500">{character.gold}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOP_ITEMS.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-100">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-lg font-black uppercase tracking-tighter italic">{t(item.nameKey)}</h4>
                  <p className="text-zinc-500 text-xs font-mono mt-1">{t(item.descKey)}</p>
                </div>
              </div>
              
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500 font-mono font-bold">
                  <Trophy size={14} />
                  {item.price}
                </div>
                <button
                  onClick={() => handleBuy(item)}
                  disabled={character.gold < item.price}
                  className={cn(
                    "px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all",
                    character.gold >= item.price
                      ? "bg-zinc-100 text-zinc-950 hover:bg-white"
                      : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  )}
                >
                  {t('shop.buy')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
