export type CharacterClass = 'Warrior' | 'Mage' | 'Rogue';

export interface Stats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  damageMultiplier: number;
  type: 'attack' | 'heal' | 'buff';
  category?: 'risky' | 'chance' | 'normal';
  requiredClass?: CharacterClass;
  scalingType?: 'attack' | 'defense' | 'missingHp';
  chance?: number; // 0 to 1
  buffStats?: Partial<Stats>;
  duration?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable';
  stats?: Partial<Stats>;
  classBonus?: Partial<Record<CharacterClass, Partial<Stats>>>;
  price: number;
  image: string;
}

export interface DropTable {
  itemId: string;
  chance: number; // 0 to 1
}

export interface Character {
  id: string;
  uid: string;
  name: string;
  class: CharacterClass;
  level: number;
  exp: number;
  nextLevelExp: number;
  stats: Stats;
  inventory: Item[];
  equipped: {
    weapon?: Item;
    armor?: Item;
  };
  skills: Skill[];
  gold: number;
  isDead: boolean;
  score: number;
  killedBy?: string;
  currentDungeonId?: string;
  currentFloor: number;
  maxFloor: number;
  playData: PlayData;
}

export interface PlayData {
  totalDamageTaken: number;
  totalDamageDealt: number;
  riskySkillUsage: number;
  chanceSkillUsage: number;
  itemUsage: number;
  battlesWon: number;
  totalTurns: number;
  bossesDefeated: number;
}

export interface Monster {
  id: string;
  name: string;
  level: number;
  stats: Stats;
  expReward: number;
  goldReward: number;
  image: string;
  skills: Skill[];
  dropTable?: DropTable[];
}

export interface Dungeon {
  id: string;
  name: string;
  description: string;
  monsterPool: string[]; // Monster IDs
  bossId: string;
  minLevel: number;
  maxFloor: number;
  image: string;
}

export interface DungeonState {
  dungeonId: string;
  currentFloor: number;
  isBossFloor: boolean;
  battlesInCurrentFloor: number;
}

export interface BattleLog {
  id: string;
  text: string;
}

export interface Buff {
  id: string;
  name: string;
  stats: Partial<Stats>;
  duration: number;
}

export interface BattleState {
  player: Character;
  monster: Monster;
  turn: 'player' | 'monster';
  logs: BattleLog[];
  isFinished: boolean;
  winner?: 'player' | 'monster';
  playerDefending: boolean;
  playerBuffs: Buff[];
  monsterBuffs: Buff[];
  damageTakenThisBattle: number;
  damageDealtThisBattle: number;
  turnsThisBattle: number;
  riskySkillUsageThisBattle: number;
  chanceSkillUsageThisBattle: number;
}
