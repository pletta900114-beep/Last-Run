import React, { useState, useEffect } from 'react';
import { Character, Monster, BattleState, Skill, BattleLog, Item, Stats, Buff } from '../types/game';
import { calculateDamage, getTotalStats, ITEMS, DUNGEONS } from '../services/gameLogic';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Shield, Heart, Zap, ScrollText, ChevronDown, Package, Skull } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BattleProps {
  player: Character;
  monster: Monster;
  onFinish: (winner: 'player' | 'monster', rewards?: { exp: number; gold: number; items?: Item[]; finalStats: Stats; metrics: { damageTaken: number; damageDealt: number; turns: number; riskySkillUsage: number; chanceSkillUsage: number } }, killerName?: string) => void;
  onAbandon: () => void;
}

export default function Battle({ player, monster, onFinish, onAbandon }: BattleProps) {
  const { t } = useLanguage();
  const playerTotalStats = getTotalStats(player);
  
  const [battleState, setBattleState] = useState<BattleState>({
    player: { 
      ...player, 
      stats: { ...player.stats, maxHp: playerTotalStats.maxHp, maxMp: playerTotalStats.maxMp } 
    },
    monster: { ...monster },
    turn: 'player',
    logs: [{ id: 'initial', text: t('battle.appeared', { name: t(`monster.${monster.name}`) }) }],
    isFinished: false,
    playerDefending: false,
    playerBuffs: [],
    monsterBuffs: [],
    damageTakenThisBattle: 0,
    damageDealtThisBattle: 0,
    turnsThisBattle: 0,
    riskySkillUsageThisBattle: 0,
    chanceSkillUsageThisBattle: 0,
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [droppedItems, setDroppedItems] = useState<Item[]>([]);

  const addLog = (log: string) => {
    setBattleState(prev => ({
      ...prev,
      logs: [{ id: Math.random().toString(36).substr(2, 9), text: log }, ...prev.logs].slice(0, 5),
    }));
  };

  const getStatsWithBuffs = (baseStats: Stats, buffs: Buff[]) => {
    const stats = { ...baseStats };
    buffs.forEach(buff => {
      Object.entries(buff.stats).forEach(([key, value]) => {
        if (typeof value === 'number') {
          (stats as any)[key] += value;
        }
      });
    });
    return stats;
  };

  const handlePlayerAction = (action: 'attack' | 'defend' | 'skill', skill?: Skill) => {
    if (battleState.turn !== 'player' || battleState.isFinished || isAnimating) return;

    setIsAnimating(true);
    let damage = 0;
    let log = '';
    let nextTurn: 'player' | 'monster' = 'monster';

    const currentPlayerStats = getStatsWithBuffs(
      { ...battleState.player.stats, attack: playerTotalStats.attack, defense: playerTotalStats.defense, speed: playerTotalStats.speed },
      battleState.playerBuffs
    );

    if (action === 'attack') {
      damage = calculateDamage(currentPlayerStats, battleState.monster.stats);
      log = t('battle.attack_log', { 
        attacker: battleState.player.name, 
        defender: t(`monster.${battleState.monster.name}`), 
        damage 
      });
      
      const newMonsterHp = Math.max(0, battleState.monster.stats.hp - damage);
      setBattleState(prev => ({
        ...prev,
        monster: {
          ...prev.monster,
          stats: { ...prev.monster.stats, hp: newMonsterHp },
        },
        playerDefending: false,
        damageDealtThisBattle: prev.damageDealtThisBattle + damage,
        turnsThisBattle: prev.turnsThisBattle + 1,
      }));
    } else if (action === 'defend') {
      log = t('battle.defend_log', { name: battleState.player.name });
      setBattleState(prev => ({
        ...prev,
        playerDefending: true,
        turnsThisBattle: prev.turnsThisBattle + 1,
      }));
    } else if (action === 'skill' && skill) {
      if (battleState.player.stats.mp < skill.mpCost) {
        log = t('battle.not_enough_mp', { name: t(`skill.${skill.name}`) });
        setIsAnimating(false);
        addLog(log);
        return;
      }

      const isRisky = skill.category === 'risky';
      const isChance = skill.category === 'chance';

      // Special Logic: Rogue Shadow Strike miss chance
      if (skill.chance && Math.random() > skill.chance) {
        log = t('battle.miss_log', { attacker: battleState.player.name });
        damage = 0;
      } else if (skill.type === 'attack') {
        // Special Logic: Rogue Assassinate threshold
        if (skill.name === 'Assassinate' && (battleState.monster.stats.hp / battleState.monster.stats.maxHp) >= 0.3) {
          damage = calculateDamage(currentPlayerStats, battleState.monster.stats);
        } else {
          let baseDamage = calculateDamage(currentPlayerStats, battleState.monster.stats);
          
          // Special Logic: Warrior Shield Bash scaling
          if (skill.scalingType === 'defense') {
            baseDamage = Math.floor(currentPlayerStats.defense * 1.5);
          }
          
          damage = Math.floor(baseDamage * skill.damageMultiplier);
        }

        log = t('battle.skill_attack_log', { 
          attacker: battleState.player.name, 
          skill: t(`skill.${skill.name}`), 
          damage 
        });
        
        const newMonsterHp = Math.max(0, battleState.monster.stats.hp - damage);
        setBattleState(prev => ({
          ...prev,
          monster: {
            ...prev.monster,
            stats: { ...prev.monster.stats, hp: newMonsterHp },
          },
          player: {
            ...prev.player,
            stats: { ...prev.player.stats, mp: prev.player.stats.mp - skill.mpCost }
          },
          playerDefending: false,
          damageDealtThisBattle: prev.damageDealtThisBattle + damage,
          turnsThisBattle: prev.turnsThisBattle + 1,
          riskySkillUsageThisBattle: prev.riskySkillUsageThisBattle + (isRisky ? 1 : 0),
          chanceSkillUsageThisBattle: prev.chanceSkillUsageThisBattle + (isChance ? 1 : 0),
        }));
      } else if (skill.type === 'heal') {
        let healAmount = Math.floor(battleState.player.stats.maxHp * 0.3);
        
        // Special Logic: Warrior Iron Will scaling
        if (skill.scalingType === 'missingHp') {
          healAmount = Math.floor((battleState.player.stats.maxHp - battleState.player.stats.hp) * 0.4);
        }

        log = t('battle.skill_heal_log', { 
          attacker: battleState.player.name, 
          skill: t(`skill.${skill.name}`), 
          amount: healAmount 
        });
        
        const newHp = Math.min(battleState.player.stats.maxHp, battleState.player.stats.hp + healAmount);
        setBattleState(prev => ({
          ...prev,
          player: {
            ...prev.player,
            stats: { 
              ...prev.player.stats, 
              hp: newHp,
              mp: prev.player.stats.mp - skill.mpCost 
            }
          },
          playerDefending: false,
          turnsThisBattle: prev.turnsThisBattle + 1,
          riskySkillUsageThisBattle: prev.riskySkillUsageThisBattle + (isRisky ? 1 : 0),
          chanceSkillUsageThisBattle: prev.chanceSkillUsageThisBattle + (isChance ? 1 : 0),
        }));
      } else if (skill.type === 'buff' && skill.buffStats) {
        log = t('battle.skill_buff_log', { 
          attacker: battleState.player.name, 
          skill: t(`skill.${skill.name}`) 
        });

        // Special Logic: Mage Arcane Surge HP cost
        let hpCost = 0;
        if (skill.name === 'Arcane Surge') {
          hpCost = Math.floor(battleState.player.stats.hp * 0.3);
        }

        const newBuff: Buff = {
          id: Math.random().toString(36).substr(2, 9),
          name: skill.name,
          stats: skill.buffStats,
          duration: skill.duration || 1
        };

        setBattleState(prev => ({
          ...prev,
          playerBuffs: [...prev.playerBuffs, newBuff],
          player: {
            ...prev.player,
            stats: { 
              ...prev.player.stats, 
              hp: Math.max(1, prev.player.stats.hp - hpCost),
              mp: prev.player.stats.mp - skill.mpCost 
            }
          },
          playerDefending: false,
          turnsThisBattle: prev.turnsThisBattle + 1,
          riskySkillUsageThisBattle: prev.riskySkillUsageThisBattle + (isRisky ? 1 : 0),
          chanceSkillUsageThisBattle: prev.chanceSkillUsageThisBattle + (isChance ? 1 : 0),
        }));
      }
      setShowSkills(false);
    }

    addLog(log);

    setTimeout(() => {
      setIsAnimating(false);
      setBattleState(prev => ({ ...prev, turn: nextTurn }));
    }, 1000);
  };

  useEffect(() => {
    if (battleState.monster.stats.hp <= 0 && !battleState.isFinished) {
      setBattleState(prev => ({ ...prev, isFinished: true, winner: 'player' }));
      addLog(t('battle.defeated', { name: t(`monster.${battleState.monster.name}`) }));
      
      // Calculate drops
      const drops: Item[] = [];
      if (monster.dropTable) {
        monster.dropTable.forEach(drop => {
          if (Math.random() < drop.chance) {
            const item = ITEMS.find(i => i.id === drop.itemId);
            if (item) drops.push(item);
          }
        });
      }
      setDroppedItems(drops);
      if (drops.length > 0) {
        drops.forEach(item => {
          addLog(t('battle.item_found', { name: item.name }));
        });
      }

      setTimeout(() => onFinish('player', { 
        exp: monster.expReward, 
        gold: monster.goldReward, 
        items: drops, 
        finalStats: battleState.player.stats,
        metrics: {
          damageTaken: battleState.damageTakenThisBattle,
          damageDealt: battleState.damageDealtThisBattle,
          turns: battleState.turnsThisBattle,
          riskySkillUsage: battleState.riskySkillUsageThisBattle,
          chanceSkillUsage: battleState.chanceSkillUsageThisBattle
        }
      }), 3000);
    } else if (battleState.player.stats.hp <= 0 && !battleState.isFinished) {
      setBattleState(prev => ({ ...prev, isFinished: true, winner: 'monster' }));
      addLog(t('battle.player_defeated', { name: battleState.player.name }));
      setTimeout(() => onFinish('monster', {
        exp: 0,
        gold: 0,
        finalStats: battleState.player.stats,
        metrics: {
          damageTaken: battleState.damageTakenThisBattle,
          damageDealt: battleState.damageDealtThisBattle,
          turns: battleState.turnsThisBattle,
          riskySkillUsage: battleState.riskySkillUsageThisBattle,
          chanceSkillUsage: battleState.chanceSkillUsageThisBattle
        }
      }, monster.name), 2000);
    }
  }, [battleState.monster.stats.hp, battleState.player.stats.hp]);

  useEffect(() => {
    if (battleState.turn === 'monster' && !battleState.isFinished && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        const currentPlayerStats = getStatsWithBuffs(
          { ...battleState.player.stats, attack: playerTotalStats.attack, defense: playerTotalStats.defense, speed: playerTotalStats.speed },
          battleState.playerBuffs
        );
        const currentMonsterStats = getStatsWithBuffs(battleState.monster.stats, battleState.monsterBuffs);
        
        let damage = 0;
        let log = '';

        // Monster Skill Logic
        const useSkill = battleState.monster.skills.length > 0 && Math.random() < 0.3;
        
        if (useSkill) {
          const skill = battleState.monster.skills[Math.floor(Math.random() * battleState.monster.skills.length)];
          damage = Math.max(1, Math.floor(currentMonsterStats.attack * skill.multiplier - currentPlayerStats.defense));
          log = t('battle.monster_skill', { 
            monster: t(`monster.${battleState.monster.name}`), 
            skill: t(`skill.${skill.name}`), 
            damage 
          });
        } else {
          damage = calculateDamage(battleState.monster.stats, currentPlayerStats);
          log = t('battle.attack_log', { 
            attacker: t(`monster.${battleState.monster.name}`), 
            defender: battleState.player.name, 
            damage 
          });
        }
        
        if (battleState.playerDefending) {
          damage = Math.max(1, Math.floor(damage * 0.5));
          addLog(t('battle.blocked_log', { name: battleState.player.name }));
        }

        const newPlayerHp = Math.max(0, battleState.player.stats.hp - damage);
        
        setBattleState(prev => ({
          ...prev,
          player: {
            ...prev.player,
            stats: { ...prev.player.stats, hp: newPlayerHp },
          },
          damageTakenThisBattle: prev.damageTakenThisBattle + damage,
          turn: 'player',
          playerDefending: false,
          playerBuffs: prev.playerBuffs.map(b => ({ ...b, duration: b.duration - 1 })).filter(b => b.duration > 0)
        }));
        
        // Apply Dungeon Trait at end of monster turn (start of player turn)
        if (player.currentDungeonId) {
          const dungeon = DUNGEONS.find(d => d.id === player.currentDungeonId);
          if (dungeon?.trait.id === 'poison') {
            const poisonDamage = Math.floor(playerTotalStats.maxHp * 0.05);
            setBattleState(prev => ({
              ...prev,
              player: {
                ...prev.player,
                stats: { ...prev.player.stats, hp: Math.max(1, prev.player.stats.hp - poisonDamage) }
              },
              damageTakenThisBattle: prev.damageTakenThisBattle + poisonDamage
            }));
            addLog(t('battle.trait_poison', { damage: poisonDamage }));
          }
        }
        
        addLog(log);
        setIsAnimating(false);
      }, 1000);
    }
  }, [battleState.turn, battleState.isFinished]);

  const playerHpPercent = (battleState.player.stats.hp / battleState.player.stats.maxHp) * 100;
  const playerMpPercent = (battleState.player.stats.mp / battleState.player.stats.maxMp) * 100;
  const monsterHpPercent = (battleState.monster.stats.hp / battleState.monster.stats.maxHp) * 100;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Player Side */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="relative w-48 h-48 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden">
            <div className="text-6xl">🛡️</div>
            <AnimatePresence>
              {isAnimating && battleState.turn === 'monster' && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  className="absolute inset-0 bg-red-500/20 flex items-center justify-center"
                >
                  <Swords className="text-red-500 w-12 h-12" />
                </motion.div>
              )}
              {battleState.playerDefending && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 border-4 border-blue-500/50 rounded-2xl"
                />
              )}
            </AnimatePresence>
          </div>
          
          <div className="w-full space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span>{t('stats.hp')}</span>
                <span>{battleState.player.stats.hp} / {battleState.player.stats.maxHp}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${playerHpPercent}%` }}
                  className={cn(
                    "h-full transition-colors duration-500",
                    playerHpPercent > 50 ? "bg-emerald-500" : playerHpPercent > 20 ? "bg-amber-500" : "bg-red-500"
                  )}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span>{t('stats.mp')}</span>
                <span>{battleState.player.stats.mp} / {battleState.player.stats.maxMp}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${playerMpPercent}%` }}
                  className="h-full bg-blue-500 transition-colors duration-500"
                />
              </div>
            </div>
            
            <div className="text-center text-sm font-bold tracking-tight">
              {battleState.player.name} ({t('lobby.level')} {battleState.player.level})
            </div>
          </div>
        </motion.div>

        {/* Monster Side */}
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="relative w-48 h-48 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden">
            <img 
              src={monster.image} 
              alt={t(`monster.${monster.name}`)} 
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
            <AnimatePresence>
              {isAnimating && battleState.turn === 'player' && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  className="absolute inset-0 bg-white/20 flex items-center justify-center"
                >
                  <Swords className="text-white w-12 h-12" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>{t(`monster.${battleState.monster.name}`)} ({t('lobby.level')} {battleState.monster.level})</span>
              <span>{battleState.monster.stats.hp} / {battleState.monster.stats.maxHp}</span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${monsterHpPercent}%` }}
                className={cn(
                  "h-full transition-colors duration-500",
                  monsterHpPercent > 50 ? "bg-emerald-500" : monsterHpPercent > 20 ? "bg-amber-500" : "bg-red-500"
                )}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Battle Logs */}
      <div className="w-full max-w-2xl mt-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 min-h-[160px]">
        <div className="flex items-center gap-2 mb-2 text-zinc-400 text-xs uppercase tracking-widest font-mono">
          <ScrollText size={14} />
          {t('battle.logs')}
        </div>
        <div className="space-y-1">
          {battleState.logs.map((log: BattleLog) => (
            <motion.p 
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "text-sm font-mono",
                battleState.logs[0].id === log.id ? "text-zinc-100" : "text-zinc-500"
              )}
            >
              {log.text}
            </motion.p>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <button
            onClick={() => handlePlayerAction('attack')}
            disabled={battleState.turn !== 'player' || battleState.isFinished || isAnimating}
            className="flex items-center gap-2 px-8 py-3 bg-zinc-100 text-zinc-950 rounded-xl font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Swords size={20} />
            {t('battle.attack')}
          </button>
          <button
            onClick={() => handlePlayerAction('defend')}
            disabled={battleState.turn !== 'player' || battleState.isFinished || isAnimating}
            className="flex items-center gap-2 px-8 py-3 bg-zinc-800 text-zinc-100 rounded-xl font-bold hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shield size={20} />
            {t('battle.defend')}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowSkills(!showSkills)}
              disabled={battleState.turn !== 'player' || battleState.isFinished || isAnimating || (player.skills || []).length === 0}
              className="flex items-center gap-2 px-8 py-3 bg-zinc-800 text-zinc-100 rounded-xl font-bold hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap size={20} />
              {t('battle.skills')}
              <ChevronDown size={16} className={cn("transition-transform", showSkills && "rotate-180")} />
            </button>
            
            <AnimatePresence>
              {showSkills && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full mb-2 left-0 w-64 bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-2xl z-50"
                >
                  {(player.skills || []).map((skill, index) => (
                    <button
                      key={`${skill.id}-${index}`}
                      onClick={() => handlePlayerAction('skill', skill)}
                      className="w-full text-left p-3 hover:bg-zinc-800 rounded-lg transition-colors group"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm">{t(`skill.${skill.name}`)}</span>
                        <span className="text-xs font-mono text-blue-400">{skill.mpCost} {t('battle.mp_cost')}</span>
                      </div>
                      <p className="text-xs text-zinc-500 leading-tight">{t(`skill.desc.${skill.name}`)}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={onAbandon}
            disabled={battleState.isFinished || isAnimating}
            className="flex items-center gap-2 px-6 py-3 bg-red-950/20 text-red-500 border border-red-900/30 rounded-xl font-bold hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Skull size={20} />
            {t('battle.abandon')}
          </button>
        </div>
      </div>
    </div>
  );
}
