import React, { useState } from 'react';
import { Character, Monster, Item } from '../types/game';
import { MONSTERS, getTotalStats } from '../services/gameLogic';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Shield, Heart, Zap, ChevronRight, LogOut, ShoppingBag, Skull, Trophy, Package, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LobbyProps {
  character: Character;
  onStartBattle: (monster: Monster) => void;
  onLogout: () => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onEquip: (item: Item) => void;
  onUnequip: (type: 'weapon' | 'armor') => void;
  onUseItem: (item: Item) => void;
}

export default function Lobby({ character, onStartBattle, onLogout, onOpenShop, onOpenLeaderboard, onEquip, onUnequip, onUseItem }: LobbyProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'adventures' | 'inventory'>('adventures');
  const totalStats = getTotalStats(character);
  const expPercent = (character.exp / character.nextLevelExp) * 100;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center text-3xl">
              {character.class === 'Warrior' && '🛡️'}
              {character.class === 'Mage' && '🔮'}
              {character.class === 'Rogue' && '🗡️'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">{character.name}</h2>
                <span className="text-[10px] bg-zinc-100 text-zinc-950 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter italic">
                  {t('lobby.floor')} {character.currentFloor}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold">
                <span className="text-zinc-100">{t(`class.${character.class}`)}</span>
                <span>•</span>
                <span>{t('lobby.level')} {character.level}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onOpenLeaderboard}
              className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 hover:border-zinc-700 transition-all font-bold uppercase tracking-widest text-xs"
            >
              <Skull size={18} className="text-red-500" />
              <span className="hidden md:inline">{t('lobby.graveyard')}</span>
            </button>
            <button 
              onClick={onOpenShop}
              className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 hover:border-zinc-700 transition-all font-bold uppercase tracking-widest text-xs"
            >
              <ShoppingBag size={18} />
              <span className="hidden md:inline">{t('lobby.shop')}</span>
            </button>
            <button 
              onClick={onLogout}
              className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-100 hover:border-zinc-700 transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats & Progress */}
          <div className="space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{t('lobby.experience')}</h3>
                <span className="text-xs font-mono text-zinc-400">{character.exp} / {character.nextLevelExp}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${expPercent}%` }}
                  className="h-full bg-zinc-100"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                <StatBox icon={<Heart size={14} />} label={t('stats.hp')} value={character.stats.hp} max={totalStats.maxHp} color="text-emerald-500" />
                <StatBox icon={<Zap size={14} />} label={t('stats.mp')} value={character.stats.mp} max={totalStats.maxMp} color="text-blue-500" />
                <StatBox icon={<Swords size={14} />} label={t('stats.attack')} value={totalStats.attack} color="text-red-500" />
                <StatBox icon={<Shield size={14} />} label={t('stats.defense')} value={totalStats.defense} color="text-amber-500" />
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                  <Trophy size={20} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">{t('lobby.gold')}</span>
                  <p className="text-xl font-black font-mono">{character.gold}</p>
                </div>
              </div>
            </div>

            {/* Equipped Items */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{t('lobby.equipment')}</h3>
              <div className="space-y-2">
                <EquippedSlot 
                  label={t('item.type.weapon')} 
                  item={character.equipped?.weapon} 
                  onUnequip={() => onUnequip('weapon')} 
                />
                <EquippedSlot 
                  label={t('item.type.armor')} 
                  item={character.equipped?.armor} 
                  onUnequip={() => onUnequip('armor')} 
                />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
              <TabButton 
                active={activeTab === 'adventures'} 
                onClick={() => setActiveTab('adventures')}
                icon={<Swords size={16} />}
                label={t('lobby.adventures')}
              />
              <TabButton 
                active={activeTab === 'inventory'} 
                onClick={() => setActiveTab('inventory')}
                icon={<Package size={16} />}
                label={t('lobby.inventory')}
              />
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'adventures' ? (
                <motion.div
                  key="adventures"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {MONSTERS.map((monster) => (
                    <motion.button
                      key={monster.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onStartBattle(monster)}
                      className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-left hover:border-zinc-100 transition-all overflow-hidden"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700">
                          <img 
                            src={monster.image} 
                            alt={t(`monster.${monster.name}`)} 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center">
                            <h4 className="text-lg font-black uppercase tracking-tighter italic">{t(`monster.${monster.name}`)}</h4>
                            <span className="text-[10px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{t('lobby.level')} {monster.level}</span>
                          </div>
                          <div className="flex gap-3 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                            <span className="flex items-center gap-1"><Swords size={10} /> {monster.stats.attack}</span>
                            <span className="flex items-center gap-1"><Heart size={10} /> {monster.stats.hp}</span>
                          </div>
                        </div>
                        <ChevronRight className="text-zinc-700 group-hover:text-zinc-100 transition-colors" />
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="inventory"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                >
                  {character.inventory.length === 0 ? (
                    <div className="col-span-full py-12 text-center space-y-2">
                      <Package size={48} className="mx-auto text-zinc-800" />
                      <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{t('lobby.inventory_empty')}</p>
                    </div>
                  ) : (
                    character.inventory.map((item, index) => (
                      <InventoryItem 
                        key={`${item.id}-${index}`} 
                        item={item} 
                        onEquip={() => onEquip(item)}
                        onUse={() => onUseItem(item)}
                        isEquipped={character.equipped?.weapon?.id === item.id || character.equipped?.armor?.id === item.id}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, max, color }: { icon: any, label: string, value: number, max?: number, color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-zinc-500">
        <span className={color}>{icon}</span>
        <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>
      </div>
      <p className="text-lg font-black font-mono">
        {value}{max && <span className="text-xs text-zinc-600 ml-1">/ {max}</span>}
      </p>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
        active ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function EquippedSlot({ label, item, onUnequip }: { label: string, item?: Item, onUnequip: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
      <div className="space-y-0.5">
        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">{label}</span>
        <p className={`text-xs font-bold ${item ? 'text-zinc-100' : 'text-zinc-700 italic'}`}>
          {item ? item.name : '---'}
        </p>
      </div>
      {item && (
        <button onClick={onUnequip} className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function InventoryItem({ item, onEquip, onUse, isEquipped }: { item: Item, onEquip: () => void, onUse: () => void, isEquipped: boolean, key?: React.Key }) {
  const { t } = useLanguage();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative group p-4 bg-zinc-900 border rounded-2xl text-left transition-all flex flex-col justify-between ${
        isEquipped ? 'border-emerald-500/50' : 'border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">{t(`item.type.${item.type}`)}</span>
          {isEquipped && <span className="text-[8px] bg-emerald-500 text-emerald-950 px-1 rounded font-black uppercase tracking-tighter italic">E</span>}
        </div>
        <h4 className="text-xs font-black uppercase tracking-tighter italic leading-tight">{item.name}</h4>
        <div className="flex flex-wrap gap-1">
          {item.stats?.attack && item.stats.attack > 0 && <span className="text-[8px] text-red-500 font-bold">ATK +{item.stats.attack}</span>}
          {item.stats?.defense && item.stats.defense > 0 && <span className="text-[8px] text-amber-500 font-bold">DEF +{item.stats.defense}</span>}
          {item.stats?.maxHp && item.stats.maxHp > 0 && <span className="text-[8px] text-emerald-500 font-bold">HP +{item.stats.maxHp}</span>}
          {item.stats?.hp && item.stats.hp > 0 && <span className="text-[8px] text-emerald-400 font-bold">HEAL +{item.stats.hp}</span>}
        </div>
      </div>

      <div className="mt-4">
        {item.type === 'consumable' ? (
          <button
            onClick={onUse}
            className="w-full py-1.5 bg-emerald-500 text-emerald-950 text-[10px] font-black uppercase tracking-widest italic rounded-lg hover:bg-emerald-400 transition-all"
          >
            {t('shop.buy')} {/* Reusing buy text or similar */}
          </button>
        ) : (
          <button
            onClick={onEquip}
            disabled={isEquipped}
            className={`w-full py-1.5 text-[10px] font-black uppercase tracking-widest italic rounded-lg transition-all ${
              isEquipped 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-zinc-100 text-zinc-950 hover:bg-white'
            }`}
          >
            {isEquipped ? t('lobby.equipment') : t('shop.buy')}
          </button>
        )}
      </div>
    </motion.div>
  );
}
