import { Character, CharacterClass, Monster, Stats, Skill, Item, Dungeon, RunResult } from '../types/game';

export const SKILLS: Skill[] = [
  // Warrior
  { id: 's1', name: 'Shield Bash', description: 'Deals damage based on Defense (1.5x).', mpCost: 10, damageMultiplier: 1.5, type: 'attack', requiredClass: 'Warrior', scalingType: 'defense', category: 'normal' },
  { id: 's2', name: 'Iron Will', description: 'Heals for 40% of missing HP.', mpCost: 15, damageMultiplier: 0.4, type: 'heal', requiredClass: 'Warrior', scalingType: 'missingHp', category: 'normal' },
  { id: 's3', name: 'Berserk', description: 'ATK +15, DEF -10 for 3 turns.', mpCost: 20, damageMultiplier: 0, type: 'buff', requiredClass: 'Warrior', buffStats: { attack: 15, defense: -10 }, duration: 3, category: 'risky' },
  
  // Mage
  { id: 's4', name: 'Fireball', description: 'Deals 2.5x Attack damage.', mpCost: 20, damageMultiplier: 2.5, type: 'attack', requiredClass: 'Mage', category: 'normal' },
  { id: 's5', name: 'Mana Shield', description: 'DEF +20 for 2 turns.', mpCost: 15, damageMultiplier: 0, type: 'buff', requiredClass: 'Mage', buffStats: { defense: 20 }, duration: 2, category: 'normal' },
  { id: 's6', name: 'Arcane Surge', description: 'ATK +30 for 1 turn. High risk.', mpCost: 25, damageMultiplier: 0, type: 'buff', requiredClass: 'Mage', buffStats: { attack: 30 }, duration: 1, category: 'risky' },
  
  // Rogue
  { id: 's7', name: 'Quick Slash', description: 'Swift attack. Low MP cost.', mpCost: 5, damageMultiplier: 1.2, type: 'attack', requiredClass: 'Rogue', category: 'normal' },
  { id: 's8', name: 'Shadow Strike', description: 'Deals 3x damage. 30% chance to miss.', mpCost: 15, damageMultiplier: 3.0, type: 'attack', requiredClass: 'Rogue', chance: 0.7, category: 'chance' },
  { id: 's9', name: 'Assassinate', description: 'Deals 5x damage if monster HP < 30%.', mpCost: 25, damageMultiplier: 5.0, type: 'attack', requiredClass: 'Rogue', category: 'normal' },
];

export const MONSTER_SKILLS: Skill[] = [
  { id: 'ms1', name: 'Slime Tackle', description: 'A sticky tackle.', mpCost: 0, damageMultiplier: 1.2, type: 'attack' },
  { id: 'ms2', name: 'Goblin Slash', description: 'A quick slash.', mpCost: 0, damageMultiplier: 1.5, type: 'attack' },
  { id: 'ms3', name: 'Bone Toss', description: 'Throws a bone.', mpCost: 0, damageMultiplier: 1.8, type: 'attack' },
  { id: 'ms4', name: 'Orc Smash', description: 'A heavy smash.', mpCost: 0, damageMultiplier: 2.5, type: 'attack' },
  { id: 'ms5', name: 'Dragon Breath', description: 'Fire breath!', mpCost: 0, damageMultiplier: 4.0, type: 'attack' },
];

export const ITEMS: Item[] = [
  { id: 'i1', name: 'Rusty Sword', description: 'A basic weapon. +5 Attack.', type: 'weapon', stats: { attack: 5 }, price: 50, image: 'https://picsum.photos/seed/sword/100/100' },
  { id: 'i2', name: 'Leather Armor', description: 'Basic protection. +3 Defense.', type: 'armor', stats: { defense: 3 }, price: 50, image: 'https://picsum.photos/seed/armor/100/100' },
  { id: 'i3', name: 'Health Potion', description: 'Restores 50 HP.', type: 'consumable', stats: { hp: 50 }, price: 20, image: 'https://picsum.photos/seed/potion/100/100' },
  { id: 'i4', name: 'Iron Blade', description: 'A sturdy iron blade. +10 Attack.', type: 'weapon', stats: { attack: 10 }, price: 150, image: 'https://picsum.photos/seed/ironblade/100/100' },
  { id: 'i5', name: 'Chainmail', description: 'Strong chainmail armor. +8 Defense.', type: 'armor', stats: { defense: 8 }, price: 150, image: 'https://picsum.photos/seed/chainmail/100/100' },
  { id: 'i6', name: 'Magic Wand', description: 'A wand that boosts magic. +15 MP.', type: 'weapon', stats: { maxMp: 15 }, classBonus: { Mage: { attack: 10 } }, price: 200, image: 'https://picsum.photos/seed/wand/100/100' },
];

export const CLASS_STATS: Record<CharacterClass, Stats> = {
  Warrior: { hp: 120, maxHp: 120, mp: 30, maxMp: 30, attack: 15, defense: 10, speed: 8 },
  Mage: { hp: 80, maxHp: 80, mp: 100, maxMp: 100, attack: 25, defense: 5, speed: 10 },
  Rogue: { hp: 90, maxHp: 90, mp: 50, maxMp: 50, attack: 18, defense: 7, speed: 15 },
};

export const createCharacter = (name: string, charClass: CharacterClass, uid: string, metaCurrency: number = 0): Character => {
  const stats = { ...CLASS_STATS[charClass] };
  
  let startingSkills: Skill[] = [];
  if (charClass === 'Warrior') startingSkills = [SKILLS[0], SKILLS[1], SKILLS[2]];
  else if (charClass === 'Mage') startingSkills = [SKILLS[3], SKILLS[4], SKILLS[5]];
  else if (charClass === 'Rogue') startingSkills = [SKILLS[6], SKILLS[7], SKILLS[8]];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    uid,
    name,
    class: charClass,
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    stats,
    inventory: [],
    equipped: {},
    skills: startingSkills,
    gold: 0,
    metaCurrency,
    isDead: false,
    score: 0,
    currentFloor: 1,
    maxFloor: 1,
    playData: {
      totalDamageTaken: 0,
      totalDamageDealt: 0,
      riskySkillUsage: 0,
      chanceSkillUsage: 0,
      itemUsage: 0,
      battlesWon: 0,
      totalTurns: 0,
      bossesDefeated: 0,
    },
    startTime: Date.now(),
  };
};

export const MONSTERS: Monster[] = [
  {
    id: 'm1',
    name: 'Slime',
    level: 1,
    stats: { hp: 30, maxHp: 30, mp: 0, maxMp: 0, attack: 5, defense: 2, speed: 5 },
    expReward: 20,
    goldReward: 10,
    image: 'https://picsum.photos/seed/slime/200/200',
    skills: [MONSTER_SKILLS[0]],
    dropTable: [{ itemId: 'i3', chance: 0.3 }],
  },
  {
    id: 'm2',
    name: 'Goblin',
    level: 3,
    stats: { hp: 60, maxHp: 60, mp: 0, maxMp: 0, attack: 12, defense: 5, speed: 12 },
    expReward: 50,
    goldReward: 30,
    image: 'https://picsum.photos/seed/goblin/200/200',
    skills: [MONSTER_SKILLS[1]],
    dropTable: [{ itemId: 'i1', chance: 0.1 }, { itemId: 'i3', chance: 0.2 }],
  },
  {
    id: 'm3',
    name: 'Skeleton',
    level: 5,
    stats: { hp: 100, maxHp: 100, mp: 0, maxMp: 0, attack: 18, defense: 8, speed: 10 },
    expReward: 80,
    goldReward: 50,
    image: 'https://picsum.photos/seed/skeleton/200/200',
    skills: [MONSTER_SKILLS[2]],
    dropTable: [{ itemId: 'i2', chance: 0.1 }, { itemId: 'i3', chance: 0.2 }],
  },
  {
    id: 'm4',
    name: 'Orc',
    level: 8,
    stats: { hp: 200, maxHp: 200, mp: 0, maxMp: 0, attack: 30, defense: 15, speed: 8 },
    expReward: 200,
    goldReward: 120,
    image: 'https://picsum.photos/seed/orc/200/200',
    skills: [MONSTER_SKILLS[3]],
    dropTable: [{ itemId: 'i4', chance: 0.1 }, { itemId: 'i5', chance: 0.1 }],
  },
  {
    id: 'm5',
    name: 'Dragon',
    level: 15,
    stats: { hp: 500, maxHp: 500, mp: 0, maxMp: 0, attack: 60, defense: 30, speed: 15 },
    expReward: 1000,
    goldReward: 500,
    image: 'https://picsum.photos/seed/dragon/200/200',
    skills: [MONSTER_SKILLS[4]],
    dropTable: [{ itemId: 'i6', chance: 0.5 }],
  },
  {
    id: 'm_final',
    name: 'Demon Lord',
    level: 20,
    stats: { hp: 1000, maxHp: 1000, mp: 0, maxMp: 0, attack: 100, defense: 50, speed: 20 },
    expReward: 5000,
    goldReward: 2000,
    image: 'https://picsum.photos/seed/demonlord/200/200',
    skills: [MONSTER_SKILLS[4], MONSTER_SKILLS[3]],
  },
];

export const DUNGEONS: Dungeon[] = [
  {
    id: 'd1',
    name: 'Peaceful Grassland',
    description: 'A calm field where slimes and goblins roam.',
    monsterPool: ['m1', 'm2'],
    bossId: 'm2',
    minLevel: 1,
    maxFloor: 5,
    image: 'https://picsum.photos/seed/grassland/400/200',
    trait: { id: 't1', name: 'Standard', description: 'No special effects.', effect: 'none' },
    scaling: 1.05
  },
  {
    id: 'd2',
    name: 'Toxic Swamp',
    description: 'A murky swamp filled with poison.',
    monsterPool: ['m1', 'm2'], // Should add more monsters later
    bossId: 'm3',
    minLevel: 5,
    maxFloor: 10,
    image: 'https://picsum.photos/seed/swamp/400/200',
    trait: { id: 't2', name: 'Poisonous', description: 'Lose 3% HP every turn.', effect: 'poison', value: 0.03 },
    scaling: 1.10
  },
  {
    id: 'd3',
    name: 'Forgotten Ruins',
    description: 'Ancient ruins where the dead do not rest.',
    monsterPool: ['m2', 'm3'],
    bossId: 'm4',
    minLevel: 10,
    maxFloor: 15,
    image: 'https://picsum.photos/seed/ruins/400/200',
    trait: { id: 't3', name: 'Cursed', description: '20% chance for monsters to revive.', effect: 'curse', value: 0.2 },
    scaling: 1.15
  },
  {
    id: 'd4',
    name: 'Frozen Highlands',
    description: 'Cold mountains where the wind bites.',
    monsterPool: ['m3', 'm4'],
    bossId: 'm5',
    minLevel: 15,
    maxFloor: 20,
    image: 'https://picsum.photos/seed/highlands/400/200',
    trait: { id: 't4', name: 'Gale', description: 'Accuracy reduced by 15%.', effect: 'wind', value: 0.15 },
    scaling: 1.20
  },
  {
    id: 'd_final',
    name: 'Demon Castle',
    description: 'The final stronghold of the Demon Lord.',
    monsterPool: ['m4', 'm5'],
    bossId: 'm_final',
    minLevel: 20,
    maxFloor: 25,
    image: 'https://picsum.photos/seed/castle/400/200',
    trait: { id: 't5', name: 'Chaos', description: 'Random effects every battle.', effect: 'chaos' },
    scaling: 1.25
  },
];

export const generateMonster = (dungeonId: string, floor: number, isBoss: boolean): Monster => {
  const dungeon = DUNGEONS.find(d => d.id === dungeonId)!;
  const monsterId = isBoss ? dungeon.bossId : dungeon.monsterPool[Math.floor(Math.random() * dungeon.monsterPool.length)];
  const baseMonster = MONSTERS.find(m => m.id === monsterId)!;
  
  // Scaling logic based on region's scaling factor and floor
  const scale = Math.pow(dungeon.scaling, floor - 1);
  const scaledStats: Stats = {
    hp: Math.floor(baseMonster.stats.hp * scale),
    maxHp: Math.floor(baseMonster.stats.maxHp * scale),
    mp: baseMonster.stats.mp,
    maxMp: baseMonster.stats.maxMp,
    attack: Math.floor(baseMonster.stats.attack * scale),
    defense: Math.floor(baseMonster.stats.defense * scale),
    speed: Math.floor(baseMonster.stats.speed * scale),
  };

  return {
    ...baseMonster,
    level: baseMonster.level + (floor - 1),
    stats: scaledStats,
    expReward: Math.floor(baseMonster.expReward * scale),
    goldReward: Math.floor(baseMonster.goldReward * scale),
  };
};

export const getTotalStats = (character: Character): Stats => {
  const total = { ...character.stats };
  
  const applyItem = (item?: Item) => {
    if (!item) return;
    if (item.stats) {
      Object.entries(item.stats).forEach(([key, value]) => {
        if (typeof value === 'number') {
          (total as any)[key] += value;
        }
      });
    }
    if (item.classBonus && item.classBonus[character.class]) {
      Object.entries(item.classBonus[character.class]!).forEach(([key, value]) => {
        if (typeof value === 'number') {
          (total as any)[key] += value;
        }
      });
    }
  };

  applyItem(character.equipped?.weapon);
  applyItem(character.equipped?.armor);
  
  return total;
};

export const calculateDamage = (attacker: Stats, defender: Stats): number => {
  const baseDamage = attacker.attack;
  const reduction = defender.defense;
  const finalDamage = Math.max(1, Math.floor(baseDamage - reduction + (Math.random() * 4 - 2)));
  return finalDamage;
};

export type EndingType = 'Normal' | 'Berserker' | 'Survivor' | 'Gambler' | 'Tactician';

export const ABANDON_MESSAGES = {
  default: [
    "abandon.default.0",
    "abandon.default.1",
    "abandon.default.2",
    "abandon.default.3",
    "abandon.default.4",
    "abandon.default.5"
  ],
  lowHp: [
    "abandon.lowHp.0",
    "abandon.lowHp.1"
  ],
  earlyQuit: [
    "abandon.earlyQuit.0",
    "abandon.earlyQuit.1"
  ],
  longRun: [
    "abandon.longRun.0",
    "abandon.longRun.1"
  ],
  riskyPlay: [
    "abandon.riskyPlay.0",
    "abandon.riskyPlay.1"
  ]
};

export const determineEnding = (character: Character): EndingType => {
  const playData = character.playData;
  
  if (playData.riskySkillUsage > 20) return 'Berserker';
  if (playData.totalDamageTaken < 100 && character.level > 10) return 'Survivor';
  if (playData.chanceSkillUsage > 15) return 'Gambler';
  if (playData.totalTurns / (playData.battlesWon || 1) < 5) return 'Tactician';
  
  return 'Normal';
};

export const selectAbandonMessage = (character: Character): string => {
  const hpPercent = character.stats.hp / character.stats.maxHp;
  const battleCount = character.playData.battlesWon;
  const playTime = (Date.now() - character.startTime) / 1000;
  const riskyUsage = character.playData.riskySkillUsage;

  // Priority 1: Low HP
  if (hpPercent < 0.2) {
    return ABANDON_MESSAGES.lowHp[Math.floor(Math.random() * ABANDON_MESSAGES.lowHp.length)];
  }
  
  // Priority 2: Risky Play
  if (riskyUsage > 10) {
    return ABANDON_MESSAGES.riskyPlay[Math.floor(Math.random() * ABANDON_MESSAGES.riskyPlay.length)];
  }

  // Priority 3: Long Run
  if (character.currentFloor >= 15 || playTime >= 1800) {
    return ABANDON_MESSAGES.longRun[Math.floor(Math.random() * ABANDON_MESSAGES.longRun.length)];
  }

  // Priority 4: Early Quit
  if (battleCount < 3) {
    return ABANDON_MESSAGES.earlyQuit[Math.floor(Math.random() * ABANDON_MESSAGES.earlyQuit.length)];
  }
  
  // Default
  return ABANDON_MESSAGES.default[Math.floor(Math.random() * ABANDON_MESSAGES.default.length)];
};

export const buildRunResult = (character: Character, resultType: 'abandoned' | 'dead' | 'cleared', message: string): RunResult => {
  return {
    resultType,
    message,
    finalSnapshot: {
      className: character.class,
      level: character.level,
      hp: character.stats.hp,
      maxHp: character.stats.maxHp,
      runGold: character.gold,
      dungeonId: character.currentDungeonId || 'none',
      floor: character.currentFloor
    },
    performanceMetrics: {
      playTime: Math.floor((Date.now() - character.startTime) / 1000),
      battleCount: character.playData.battlesWon,
      totalTurns: character.playData.totalTurns,
      damageDealt: character.playData.totalDamageDealt,
      damageTaken: character.playData.totalDamageTaken,
      itemsCollected: character.inventory.length,
      riskySkillUsage: character.playData.riskySkillUsage
    }
  };
};
