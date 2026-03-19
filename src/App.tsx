import React, { useState, useEffect } from 'react';
import Lobby from './components/Lobby';
import Battle from './components/Battle';
import CharacterCreation from './components/CharacterCreation';
import Shop from './components/Shop';
import Leaderboard from './components/Leaderboard';
import Ending from './components/Ending';
import MapSelection from './components/MapSelection';
import { Character, Monster, Skill, Item, Stats, RunResult } from './types/game';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, setDoc, onSnapshot, getDocFromServer, deleteDoc } from 'firebase/firestore';
import { LogIn, Sparkles, Skull, Trophy, Globe } from 'lucide-react';
import { SKILLS, determineEnding, DUNGEONS, generateMonster, buildRunResult, selectAbandonMessage } from './services/gameLogic';
import { useLanguage } from './contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Screen = 'lobby' | 'battle' | 'creation' | 'shop' | 'loading' | 'login' | 'leaderboard' | 'gameover' | 'ending' | 'map-selection';

const defaultPlayData = {
  totalDamageTaken: 0,
  totalDamageDealt: 0,
  riskySkillUsage: 0,
  chanceSkillUsage: 0,
  itemUsage: 0,
  battlesWon: 0,
  totalTurns: 0,
  bossesDefeated: 0,
};

function normalizeCharacterData(char: Character): Character {
  return {
    ...char,
    inventory: char.inventory || [],
    equipped: char.equipped || {},
    skills: char.skills || [],
    playData: {
      ...defaultPlayData,
      ...(char.playData || {}),
    },
  };
}

export default function App() {
  const { t, language, setLanguage } = useLanguage();
  const [screen, setScreen] = useState<Screen>('loading');
  const [character, setCharacter] = useState<Character | null>(null);
  const [deadCharacter, setDeadCharacter] = useState<Character | null>(null);
  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null);
  const [user, setUser] = useState<any>(null);
  const [newSkill, setNewSkill] = useState<Skill | null>(null);
  const [endingType, setEndingType] = useState<'normal' | 'berserker' | 'survivor' | 'gambler' | 'tactician'>('normal');

  const [metaCurrency, setMetaCurrency] = useState<number>(0);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (!user) {
        setScreen('login');
      } else {
        // Fetch meta currency
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDocFromServer(userRef);
        
        if (userSnap.exists()) {
          setMetaCurrency(userSnap.data().metaCurrency || 0);
          
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Character sync
  useEffect(() => {
    if (!user) return;

    const characterRef = doc(db, 'characters', user.uid);
    const unsubscribe = onSnapshot(characterRef, (snapshot) => {
      if (snapshot.exists()) {
        const charData = normalizeCharacterData(snapshot.data() as Character);
        
        if (charData.isDead) {
          setDeadCharacter(charData);
          setScreen('gameover');
        } else if (screen === 'loading' || screen === 'login') {
          setScreen('lobby');
        }
      } else {
        // If character is gone and we are not in gameover, go to creation
        // We check screen from the current state (it will be updated if screen is in deps)
        if (screen !== 'gameover' && (screen === 'loading' || screen === 'login' || screen === 'lobby' || screen === 'battle' || screen === 'shop')) {
          setScreen('creation');
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `characters/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user, screen]); // Added screen to dependencies to avoid stale closure

  const saveCharacter = async (char: Character) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'characters', user.uid), normalizeCharacterData(char));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `characters/${user.uid}`);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleCreationComplete = (newChar: Character) => {
    saveCharacter(newChar);
    setScreen('lobby');
  };

  const handleStartBattle = (dungeonId: string) => {
    if (!character) return;
    const dungeon = DUNGEONS.find(d => d.id === dungeonId);
    if (!dungeon) return;

    const isBoss = character.currentFloor % 5 === 0;
    const monster = generateMonster(dungeonId, character.currentFloor, isBoss);
    setCurrentMonster(monster);
    setScreen('battle');
  };

  const handleEndRun = async (resultType: 'abandoned' | 'dead' | 'cleared', message: string) => {
    if (!character || !user) return;

    const result = buildRunResult(character, resultType, message);
    const earnedMeta = Math.floor(character.score / 10);
    
    // 1. Save to graveyard/history
    try {
      const historyRef = doc(db, 'history', `${user.uid}_${Date.now()}`);
      await setDoc(historyRef, result);
      
      if (resultType === 'dead') {
        const graveyardRef = doc(db, 'graveyard', `${user.uid}_${Date.now()}`);
        await setDoc(graveyardRef, character);
      }

      // 2. Persist Meta Currency to User Profile
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDocFromServer(userRef);
      const currentMeta = userSnap.exists() ? (userSnap.data().metaCurrency || 0) : 0;
      await setDoc(userRef, { 
        metaCurrency: currentMeta + earnedMeta,
        lastRunAt: Date.now()
      }, { merge: true });

    } catch (error) {
      console.error('Failed to save run result or update meta:', error);
    }

    // 3. Prepare Game Over State
    const finalCharState: Character = {
      ...character,
      metaCurrency: (character.metaCurrency || 0) + earnedMeta,
      isDead: resultType === 'dead' || resultType === 'abandoned',
      killedBy: resultType === 'dead' ? currentMonster?.name : (resultType === 'abandoned' ? 'self' : undefined),
      abandonMessage: resultType === 'abandoned' ? message : undefined
    };

    // 4. Transition
    if (resultType === 'dead' || resultType === 'abandoned') {
      setDeadCharacter(finalCharState);
      setScreen('gameover');
    } else if (resultType === 'cleared') {
      const finalEnding = determineEnding(character);
      setEndingType(finalEnding);
      setScreen('ending');
    }
    
    // 5. Cleanup current run
    try {
      await deleteDoc(doc(db, 'characters', user.uid));
    } catch (error) {
      console.error('Failed to delete character:', error);
    }
    
    setCurrentMonster(null);
  };

  const handleAbandon = () => {
    if (!character) return;
    const messageKey = selectAbandonMessage(character);
    handleEndRun('abandoned', t(messageKey));
  };

  const handleBattleFinish = async (winner: 'player' | 'monster', rewards?: { exp: number; gold: number; items?: Item[]; finalStats: Stats; metrics: { damageTaken: number; damageDealt: number; turns: number; riskySkillUsage: number; chanceSkillUsage: number } }, killerName?: string) => {
    if (!character || !user) return;

    let updatedChar = { ...character };

    if (rewards) {
      const currentPlayData = character.playData || {
        totalDamageTaken: 0,
        totalDamageDealt: 0,
        riskySkillUsage: 0,
        chanceSkillUsage: 0,
        itemUsage: 0,
        battlesWon: 0,
        totalTurns: 0,
        bossesDefeated: 0,
      };

      updatedChar.playData = {
        ...currentPlayData,
        totalDamageTaken: currentPlayData.totalDamageTaken + rewards.metrics.damageTaken,
        totalDamageDealt: currentPlayData.totalDamageDealt + rewards.metrics.damageDealt,
        riskySkillUsage: currentPlayData.riskySkillUsage + rewards.metrics.riskySkillUsage,
        chanceSkillUsage: currentPlayData.chanceSkillUsage + rewards.metrics.chanceSkillUsage,
        totalTurns: currentPlayData.totalTurns + rewards.metrics.turns,
        battlesWon: winner === 'player' ? currentPlayData.battlesWon + 1 : currentPlayData.battlesWon,
        bossesDefeated: (winner === 'player' && currentMonster?.id.startsWith('m_boss')) ? currentPlayData.bossesDefeated + 1 : currentPlayData.bossesDefeated,
      };
      
      // Update stats and HP from battle
      updatedChar.stats = rewards.finalStats;
    }

    if (winner === 'player' && rewards) {
      // Check for final boss
      if (currentMonster?.id === 'm_final') {
        handleEndRun('cleared', t('ending.victory_desc'));
        return;
      }

      let newExp = character.exp + rewards.exp;
      let newLevel = character.level;
      let newNextLevelExp = character.nextLevelExp;
      let newStats = { ...character.stats };
      let leveledUp = false;

      while (newExp >= newNextLevelExp) {
        newExp -= newNextLevelExp;
        newLevel += 1;
        newNextLevelExp = Math.floor(newNextLevelExp * 1.5);
        newStats.maxHp += 20;
        newStats.hp = newStats.maxHp;
        newStats.attack += 5;
        newStats.defense += 3;
        newStats.maxMp += 10;
        newStats.mp = newStats.maxMp;
        leveledUp = true;
      }

      const currentSkills = character.skills || [];
      const currentSkillIds = currentSkills.map(s => s.id);
      const availableSkills = SKILLS.filter(s => !currentSkillIds.includes(s.id));
      
      let finalSkills = [...currentSkills];
      if (availableSkills.length > 0 && Math.random() < 0.5) {
        const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        finalSkills.push(skill);
        setNewSkill(skill);
      }

      const newInventory = [...(character.inventory || [])];
      if (rewards.items) {
        newInventory.push(...rewards.items);
      }

      const nextFloor = character.currentFloor + 1;
      const newMaxFloor = Math.max(character.maxFloor, nextFloor);

      updatedChar = {
        ...updatedChar,
        level: newLevel,
        exp: newExp,
        nextLevelExp: newNextLevelExp,
        stats: leveledUp ? newStats : updatedChar.stats,
        gold: character.gold + rewards.gold,
        inventory: newInventory,
        skills: finalSkills,
        score: (newLevel * 1000) + newExp + (newMaxFloor * 500),
        currentFloor: nextFloor,
        maxFloor: newMaxFloor,
      };
      await saveCharacter(updatedChar);
      setScreen('lobby');
    } else if (winner === 'monster') {
      handleEndRun('dead', t('gameover.death_desc'));
    }

    setCurrentMonster(null);
  };

  const handleRestart = async () => {
    setDeadCharacter(null);
    setScreen('creation');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCharacter(null);
      setScreen('login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleEquip = async (item: Item) => {
    if (!character || !user) return;
    const updatedChar = { ...character };
    if (item.type === 'weapon') {
      updatedChar.equipped.weapon = item;
    } else if (item.type === 'armor') {
      updatedChar.equipped.armor = item;
    }
    await saveCharacter(updatedChar);
  };

  const handleUnequip = async (type: 'weapon' | 'armor') => {
    if (!character || !user) return;
    const updatedChar = { ...character };
    if (type === 'weapon') {
      updatedChar.equipped.weapon = undefined;
    } else if (type === 'armor') {
      updatedChar.equipped.armor = undefined;
    }
    await saveCharacter(updatedChar);
  };

  const handleUseItem = async (item: Item) => {
    if (!character || !user) return;
    
    const updatedChar = { ...character };
    
    // Apply effects
    if (item.stats?.hp) {
      updatedChar.stats.hp = Math.min(updatedChar.stats.maxHp, updatedChar.stats.hp + item.stats.hp);
    }
    if (item.stats?.mp) {
      updatedChar.stats.mp = Math.min(updatedChar.stats.maxMp, updatedChar.stats.mp + item.stats.mp);
    }
    
    // Remove from inventory
    const index = updatedChar.inventory.findIndex(i => i.id === item.id);
    if (index !== -1) {
      updatedChar.inventory.splice(index, 1);
    }
    
    // Track usage
    updatedChar.playData.itemUsage += 1;
    
    await saveCharacter(updatedChar);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <AnimatePresence mode="wait">
        {screen === 'loading' && (
          <motion.div
            key="loading"
            className="min-h-screen flex items-center justify-center text-zinc-500 font-mono text-sm uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Initializing Adventure...
          </motion.div>
        )}

        {screen === 'login' && (
          <motion.div
            key="login"
            className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center space-y-2">
              <h1 className="text-6xl font-black tracking-tighter uppercase italic text-zinc-100">{t('app.title')}</h1>
              <p className="text-zinc-500 text-sm font-mono tracking-[0.3em] uppercase">{t('app.subtitle')}</p>
            </div>
            <div className="flex flex-col items-center gap-6 w-full max-w-xs">
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-zinc-100 text-zinc-950 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <LogIn size={20} />
                {t('app.login')}
              </button>

              {/* Language Toggle in Login */}
              <div className="flex justify-center gap-4 pt-4">
                <button 
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                    language === 'en' ? "bg-zinc-100 text-zinc-950 border-zinc-100" : "text-zinc-500 border-zinc-800 hover:border-zinc-700"
                  )}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage('ko')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                    language === 'ko' ? "bg-zinc-100 text-zinc-950 border-zinc-100" : "text-zinc-500 border-zinc-800 hover:border-zinc-700"
                  )}
                >
                  한국어
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'creation' && (
          <motion.div
            key="creation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CharacterCreation 
              metaCurrency={metaCurrency}
              onComplete={handleCreationComplete} 
            />
          </motion.div>
        )}
        
        {screen === 'lobby' && character && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Lobby 
              character={character} 
              onExplore={() => setScreen('map-selection')}
              onAbandon={handleAbandon}
              onLogout={handleLogout}
              onOpenShop={() => setScreen('shop')}
              onOpenLeaderboard={() => setScreen('leaderboard')}
              onEquip={handleEquip}
              onUnequip={handleUnequip}
              onUseItem={handleUseItem}
            />
            
            {/* New Skill Notification */}
            <AnimatePresence>
              {newSkill && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/60 backdrop-blur-sm"
                >
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                      <Sparkles className="text-blue-400 w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-zinc-400 text-xs uppercase tracking-widest font-mono">{t('skill.learned')}</h3>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">{t(`skill.${newSkill.name}`)}</h2>
                      <p className="text-zinc-500 text-sm">{t(`skill.desc.${newSkill.name}`)}</p>
                    </div>
                    <button 
                      onClick={() => setNewSkill(null)}
                      className="w-full py-4 bg-zinc-100 text-zinc-950 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all"
                    >
                      {t('skill.awesome')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {screen === 'battle' && character && currentMonster && (
          <motion.div
            key="battle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Battle 
              player={character} 
              monster={currentMonster} 
              onFinish={handleBattleFinish}
              onAbandon={handleAbandon}
            />
          </motion.div>
        )}

        {screen === 'map-selection' && character && (
          <motion.div
            key="map-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MapSelection 
              playerLevel={character.level}
              onSelect={handleStartBattle}
              onBack={() => setScreen('lobby')}
            />
          </motion.div>
        )}

        {screen === 'shop' && character && (
          <motion.div
            key="shop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Shop 
              character={character} 
              onPurchase={(updatedChar) => saveCharacter(updatedChar)}
              onBack={() => setScreen('lobby')}
            />
          </motion.div>
        )}

        {screen === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Leaderboard onBack={() => setScreen('lobby')} />
          </motion.div>
        )}

        {screen === 'gameover' && deadCharacter && (
          <motion.div
            key="gameover"
            className="min-h-screen flex flex-col items-center justify-center p-4 space-y-12 bg-zinc-950"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center space-y-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Skull className="text-red-500 w-12 h-12" />
              </motion.div>
              <h1 className="text-6xl font-black tracking-tighter uppercase italic text-zinc-100">{t('gameover.title')}</h1>
              <p className="text-zinc-500 text-lg font-mono uppercase tracking-widest">
                {deadCharacter.name} {t('gameover.fallen')}
              </p>
              {deadCharacter.abandonMessage ? (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-zinc-400 text-xl font-serif italic max-w-lg mx-auto leading-relaxed"
                >
                  "{deadCharacter.abandonMessage}"
                </motion.p>
              ) : (
                <>
                  {deadCharacter.killedBy && (
                    <p className="text-red-500/70 text-sm font-mono italic">
                      {t('gameover.killed_by')} {t(`monster.${deadCharacter.killedBy}`)}
                    </p>
                  )}
                  <p className="text-zinc-500 text-sm italic mt-2">
                    {t('gameover.death_desc')}
                  </p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8 w-full max-w-md">
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl text-center">
                <div className="text-zinc-500 text-xs uppercase tracking-widest font-mono mb-1">{t('gameover.final_level')}</div>
                <div className="text-3xl font-black italic text-zinc-100">{deadCharacter.level}</div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl text-center">
                <div className="text-zinc-500 text-xs uppercase tracking-widest font-mono mb-1">{t('gameover.total_score')}</div>
                <div className="text-3xl font-black italic text-zinc-100">{deadCharacter.score}</div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button
                onClick={handleRestart}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-zinc-100 text-zinc-950 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95"
              >
                {t('gameover.new_run')}
              </button>
              <button
                onClick={() => setScreen('leaderboard')}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-zinc-900 text-zinc-100 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 border border-zinc-800"
              >
                <Trophy size={20} />
                {t('gameover.leaderboard')}
              </button>
            </div>
          </motion.div>
        )}

        {screen === 'ending' && character && (
          <motion.div
            key="ending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Ending 
              character={character} 
              endingType={endingType} 
              onRestart={handleRestart} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="fixed bottom-10 right-6 pointer-events-none z-[100]">
        <div className="px-4 py-2 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-full">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em]">
            {t('app.created_by')} <span className="text-zinc-300 font-bold">김혜인B</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
