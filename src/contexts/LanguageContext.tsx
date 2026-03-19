import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ko';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // App / Login
    'app.title': 'Last Run',
    'app.subtitle': 'Roguelike Adventure',
    'app.login': 'Sign in with Google',
    'app.loading': 'Initializing Adventure...',
    'app.created_by': 'Created by',
    
    // Character Creation
    'create.title': 'Create Your Hero',
    'create.name_label': 'Hero Name',
    'create.class_label': 'Select Class',
    'create.start': 'Start Adventure',
    'create.placeholder': 'Enter name...',
    'create.ranking_notice': 'This name will be registered in the rankings.',
    'create.name_taken': 'This name is already taken.',
    'create.base_stats': 'Base Stats',
    
    // Lobby
    'lobby.level': 'Level',
    'lobby.experience': 'Experience',
    'lobby.gold': 'Gold',
    'lobby.adventures': 'Available Adventures',
    'lobby.graveyard': 'Graveyard',
    'lobby.shop': 'Shop',
    'lobby.last_run': 'Last Run',
    'lobby.inventory': 'Inventory',
    'lobby.equipment': 'Equipment',
    'lobby.inventory_empty': 'Inventory is empty',
    'lobby.floor': 'Floor',
    'lobby.ready_to_explore': 'Ready to Explore?',
    'lobby.choose_region': 'Select a region to begin your journey',
    'lobby.start_exploration': 'Start Exploration',
    'lobby.abandon': 'Abandon Run',
    'lobby.logout': 'Logout',
    'lobby.current_floor': 'Current Floor',
    'lobby.max_floor': 'Max Floor',
    'lobby.battles_won': 'Battles Won',
    'common.back': 'Back',
    'common.confirm': 'Confirm',
    
    // Map Selection
    'map.title': 'World Map',
    'map.subtitle': 'Select Your Destination',
    'map.min_level': 'Min Level',
    'map.max_floor': 'Max Floor',
    'map.enter': 'Enter Region',
    'map.locked': 'Level Too Low',
    
    // Dungeon
    'dungeon.floor': 'Floor',
    'dungeon.status': 'Status',
    'dungeon.exploring': 'Exploring...',
    'dungeon.boss_approaching': 'Boss Approaching!',
    'dungeon.fight_boss': 'Fight Boss',
    'dungeon.explore_next': 'Explore Next',
    
    // Battle Result
    'result.title': 'Victory',
    'result.exp': 'EXP Gained',
    'result.gold': 'Gold Gained',
    'result.items': 'Items Found',
    'result.no_items': 'No items found',
    'result.next_battle': 'Next Battle',
    'result.return_lobby': 'Return to Lobby',
    'result.go_shop': 'Go to Shop',
    'result.inventory': 'Inventory',
    
    // Battle
    'battle.logs': 'Battle Logs',
    'battle.attack': 'Attack',
    'battle.defend': 'Defend',
    'battle.skills': 'Skills',
    'battle.mp_cost': 'MP',
    'battle.appeared': 'A wild {{name}} appeared!',
    'battle.attack_log': '{{attacker}} attacks {{defender}} for {{damage}} damage!',
    'battle.defend_log': '{{name}} takes a defensive stance!',
    'battle.not_enough_mp': 'Not enough MP for {{name}}!',
    'battle.skill_attack_log': '{{attacker}} uses {{skill}}! Deals {{damage}} damage!',
    'battle.skill_heal_log': '{{attacker}} uses {{skill}} and heals for {{amount}} HP!',
    'battle.skill_buff_log': '{{attacker}} uses {{skill}}! Stats increased!',
    'battle.miss_log': '{{attacker}} missed the attack!',
    'battle.blocked_log': '{{name}} blocked half the damage!',
    'battle.defeated': '{{name}} was defeated!',
    'battle.player_defeated': '{{name}} was defeated...',
    'battle.abandon': 'Abandon',
    'battle.trait_poison': 'The poison in the air deals {{damage}} damage!',
    
    // Shop
    'shop.title': "Merchant's Stall",
    'shop.buy': 'Buy',
    'shop.item.p1.name': 'Health Potion',
    'shop.item.p1.desc': 'Restores 50 HP.',
    'shop.item.w1.name': 'Iron Sword',
    'shop.item.w1.desc': '+5 Attack.',
    'shop.item.a1.name': 'Leather Armor',
    'shop.item.a1.desc': '+3 Defense.',
    
    // Leaderboard
    'leaderboard.title': 'The Graveyard',
    'leaderboard.loading': 'Loading Memorials...',
    'leaderboard.no_heroes': 'No fallen heroes yet.',
    'leaderboard.killed_by': 'encountered {{name}}',
    'leaderboard.pts': 'PTS',
    
    // Game Over
    'gameover.title': 'Game Over',
    'gameover.fallen': 'has fallen in battle.',
    'gameover.killed_by': 'Encountered',
    'gameover.final_level': 'Final Level',
    'gameover.total_score': 'Total Score',
    'gameover.new_run': 'New Run',
    'gameover.leaderboard': 'Leaderboard',
    'gameover.death_desc': 'Your journey ends here. May your soul find peace.',
    
    // Abandon
    'abandon.self': 'Self-Abandonment',
    'abandon.default.0': '[Narrative] Your footsteps fade into the abyss. The adventure stops here.',
    'abandon.default.1': '[Narrative] No rest is granted to the soul that lets go of its own string.',
    'abandon.default.2': '[Provocation] A strategic retreat, or a simple surrender? History will judge.',
    'abandon.default.3': '[Provocation] It is easy to lay down a heavy burden, but the price is never light.',
    'abandon.default.4': '[Log] Session terminated. The subject has self-evacuated from the battlefield.',
    'abandon.default.5': '[Log] Run aborted. Transmitting current records to the archives.',
    'abandon.lowHp.0': 'You turned your back at the threshold of death. You chose survival over cowardice.',
    'abandon.lowHp.1': 'The smell of blood has broken your will.',
    'abandon.earlyQuit.0': 'The flame went out before the adventure even began. Was it too hasty a judgment?',
    'abandon.earlyQuit.1': 'What did you see in this short journey that made you flee in such a hurry?',
    'abandon.longRun.0': 'The finish line was not far, but the fatigue of the long journey finally broke you.',
    'abandon.longRun.1': 'Even though you held out for so long, you lacked the courage to take that last step.',
    'abandon.riskyPlay.0': "The gambler's luck ends here. You bet too much, and finally stopped before losing everything.",
    'abandon.riskyPlay.1': 'You enjoyed walking the dangerous tightrope, and finally cut the rope yourself.',
    
    // Ending
    'ending.victory_desc': 'You have conquered the final challenge and saved the world!',
    
    // Skills Notification
    'skill.learned': 'New Skill Learned!',
    'skill.awesome': 'Awesome!',
    
    // Stats
    'stats.hp': 'HP',
    'stats.mp': 'MP',
    'stats.attack': 'ATK',
    'stats.defense': 'DEF',
    
    // Classes
    'class.Warrior': 'Warrior',
    'class.Mage': 'Mage',
    'class.Rogue': 'Rogue',

    // Monsters
    'monster.Slime': 'Slime',
    'monster.Goblin': 'Goblin',
    'monster.Skeleton': 'Skeleton',
    'monster.Orc': 'Orc',
    'monster.Dragon': 'Dragon',

    // Items
    'item.type.weapon': 'Weapon',
    'item.type.armor': 'Armor',
    'item.type.consumable': 'Consumable',

    // Skills
    'skill.Shield Bash': 'Shield Bash',
    'skill.Iron Will': 'Iron Will',
    'skill.Berserk': 'Berserk',
    'skill.Fireball': 'Fireball',
    'skill.Mana Shield': 'Mana Shield',
    'skill.Arcane Surge': 'Arcane Surge',
    'skill.Quick Slash': 'Quick Slash',
    'skill.Shadow Strike': 'Shadow Strike',
    'skill.Assassinate': 'Assassinate',
    
    // Skill Descriptions
    'skill.desc.Shield Bash': 'Deals damage based on Defense (1.5x).',
    'skill.desc.Iron Will': 'Heals for 40% of missing HP.',
    'skill.desc.Berserk': 'ATK +15, DEF -10 for 3 turns.',
    'skill.desc.Fireball': 'Deals 2.5x Attack damage.',
    'skill.desc.Mana Shield': 'DEF +20 for 2 turns.',
    'skill.desc.Arcane Surge': 'ATK +30 for 1 turn. High risk.',
    'skill.desc.Quick Slash': 'Swift attack. Low MP cost.',
    'skill.desc.Shadow Strike': 'Deals 3x damage. 30% chance to miss.',
    'skill.desc.Assassinate': 'Deals 5x damage if monster HP < 30%.',
    'skill.Slime Tackle': 'Slime Tackle',
    'skill.Goblin Slash': 'Goblin Slash',
    'skill.Bone Toss': 'Bone Toss',
    'skill.Orc Smash': 'Orc Smash',
    'skill.Dragon Breath': 'Dragon Breath',
    
    // Endings
    'ending.normal.title': 'The New Guardian',
    'ending.normal.description': 'You defeated the Demon Lord and restored peace. You are hailed as the new guardian of the realm.',
    'ending.berserker.title': 'The Bloodthirsty King',
    'ending.berserker.description': 'Your path was paved with reckless violence. You defeated the Demon Lord, but the darkness you embraced has consumed you.',
    'ending.survivor.title': 'The Unbreakable Spirit',
    'ending.survivor.description': 'Through sheer resilience and careful planning, you survived the impossible. You return home as a living legend of survival.',
    'ending.gambler.title': 'The Hand of Fate',
    'ending.gambler.description': 'You played with fire and won. Luck was your greatest weapon, and the world wonders if you truly defeated the Demon Lord or just got lucky.',
    'ending.tactician.title': 'The Grand Strategist',
    'ending.tactician.description': 'Every move was calculated. You dismantled the Demon Lord\'s forces with surgical precision. Your name will be taught in military academies for generations.',
    
    'ending.stat.damage_dealt': 'Damage Dealt',
    'ending.stat.damage_taken': 'Damage Taken',
    'ending.stat.battles_won': 'Battles Won',
    'ending.stat.total_turns': 'Total Turns',
    'ending.stat.risky_usage': 'Risky Skills',
    'ending.stat.chance_usage': 'Chance Skills',
    'ending.stat.item_usage': 'Items Used',
    'ending.restart': 'Begin New Journey',
    'ending.footer': 'Your legend has been recorded in the annals of history.',
  },
  ko: {
    // App / Login
    'app.title': 'Last Run',
    'app.subtitle': '로그라이크 어드벤처',
    'app.login': 'Google로 로그인',
    'app.loading': '모험을 준비 중입니다...',
    'app.created_by': '제작:',
    
    // Character Creation
    'create.title': '영웅 생성',
    'create.name_label': '영웅 이름',
    'create.class_label': '직업 선택',
    'create.start': '모험 시작',
    'create.placeholder': '이름을 입력하세요...',
    'create.ranking_notice': '해당 이름은 랭킹에 등록됩니다.',
    'create.name_taken': '이미 사용 중인 이름입니다.',
    'create.base_stats': '기본 능력치',
    
    // Lobby
    'lobby.level': '레벨',
    'lobby.experience': '경험치',
    'lobby.gold': '골드',
    'lobby.adventures': '가능한 모험',
    'lobby.graveyard': '묘지',
    'lobby.shop': '상점',
    'lobby.last_run': '마지막 여정',
    'lobby.inventory': '인벤토리',
    'lobby.equipment': '장착 장비',
    'lobby.inventory_empty': '인벤토리가 비어 있습니다',
    'lobby.floor': '층',
    'lobby.ready_to_explore': '탐험을 시작하시겠습니까?',
    'lobby.choose_region': '여정을 시작할 지역을 선택하세요',
    'lobby.start_exploration': '탐험 시작',
    'lobby.abandon': '런 포기',
    'lobby.logout': '로그아웃',
    'lobby.current_floor': '현재 층수',
    'lobby.max_floor': '최대 층수',
    'lobby.battles_won': '승리 횟수',
    'common.back': '뒤로가기',
    'common.confirm': '확인',
    
    // Map Selection
    'map.title': '월드 맵',
    'map.subtitle': '목적지를 선택하세요',
    'map.min_level': '최소 레벨',
    'map.max_floor': '최대 층수',
    'map.enter': '지역 입장',
    'map.locked': '레벨 부족',
    
    // Dungeon
    'dungeon.floor': '층',
    'dungeon.status': '상태',
    'dungeon.exploring': '탐사 중...',
    'dungeon.boss_approaching': '보스 출현 임박!',
    'dungeon.fight_boss': '보스전 시작',
    'dungeon.explore_next': '다음 구역 탐사',
    
    // Battle Result
    'result.title': '전투 승리',
    'result.exp': '획득 경험치',
    'result.gold': '획득 골드',
    'result.items': '획득 아이템',
    'result.no_items': '획득한 아이템이 없습니다',
    'result.next_battle': '다음 전투',
    'result.return_lobby': '로비로 돌아가기',
    'result.go_shop': '상점으로 이동',
    'result.inventory': '인벤토리 확인',
    
    // Battle
    'battle.logs': '전투 로그',
    'battle.attack': '공격',
    'battle.defend': '방어',
    'battle.skills': '스킬',
    'battle.mp_cost': 'MP',
    'battle.appeared': '야생의 {{name}}이(가) 나타났습니다!',
    'battle.attack_log': '{{attacker}}이(가) {{defender}}을(를) 공격하여 {{damage}}의 피해를 입혔습니다!',
    'battle.defend_log': '{{name}}이(가) 방어 태세를 취합니다!',
    'battle.not_enough_mp': '{{name}}을(를) 사용하기 위한 마력이 부족합니다!',
    'battle.skill_attack_log': '{{attacker}}이(가) {{skill}}을(를) 사용! {{damage}}의 피해를 입혔습니다!',
    'battle.skill_heal_log': '{{attacker}}이(가) {{skill}}을(를) 사용! 체력을 {{amount}} 회복했습니다!',
    'battle.skill_buff_log': '{{attacker}}이(가) {{skill}}을(를) 사용! 능력치가 상승했습니다!',
    'battle.miss_log': '{{attacker}}의 공격이 빗나갔습니다!',
    'battle.blocked_log': '{{name}}이(가) 공격을 절반으로 방어했습니다!',
    'battle.defeated': '{{name}}을(를) 처치했습니다!',
    'battle.player_defeated': '{{name}}이(가) 쓰러졌습니다...',
    'battle.abandon': '포기',
    'battle.trait_poison': '공기 중의 독기가 {{damage}}의 피해를 입힙니다!',
    
    // Shop
    'shop.title': '상인의 가판대',
    'shop.buy': '구매',
    'shop.item.p1.name': '체력 포션',
    'shop.item.p1.desc': 'HP를 50 회복합니다.',
    'shop.item.w1.name': '철검',
    'shop.item.w1.desc': '공격력 +5.',
    'shop.item.a1.name': '가죽 갑옷',
    'shop.item.a1.desc': '방어력 +3.',
    
    // Leaderboard
    'leaderboard.title': '영웅들의 묘지',
    'leaderboard.loading': '추모록을 불러오는 중...',
    'leaderboard.no_heroes': '아직 쓰러진 영웅이 없습니다.',
    'leaderboard.killed_by': '{{name}}와(과) 조우함',
    'leaderboard.pts': '점수',
    
    // Game Over
    'gameover.title': '게임 오버',
    'gameover.fallen': '이(가) 전투 중 전사했습니다.',
    'gameover.killed_by': '조우한 적:',
    'gameover.final_level': '최종 레벨',
    'gameover.total_score': '최종 점수',
    'gameover.new_run': '새로운 시작',
    'gameover.leaderboard': '명예의 전당',
    'gameover.death_desc': '당신의 여정은 여기서 끝납니다. 영혼에 평화가 깃들기를.',

    // Abandon
    'abandon.self': '자진 포기',
    'abandon.default.0': '당신의 발자국 소리가 심연 속으로 잦아듭니다. 모험은 여기서 멈췄습니다.',
    'abandon.default.1': '스스로 끈을 놓아버린 영혼에게 안식은 허락되지 않을 것입니다.',
    'abandon.default.2': '전략적인 후퇴인가요, 아니면 단순한 항복인가요? 판단은 역사가 할 것입니다.',
    'abandon.default.3': '무거운 짐을 내려놓는 것은 쉽지만, 그 대가는 결코 가볍지 않습니다.',
    'abandon.lowHp.0': '죽음의 문턱에서 등을 돌렸습니다. 비겁함보다는 생존을 택했군요.',
    'abandon.lowHp.1': '피 냄새가 당신의 의지를 꺾어 놓았습니다.',
    'abandon.earlyQuit.0': '모험이 시작되기도 전에 불꽃이 꺼졌습니다. 너무 성급한 판단은 아니었을까요?',
    'abandon.earlyQuit.1': '이 짧은 여정에서 무엇을 보았기에 그리 서둘러 도망치십니까?',
    'abandon.longRun.0': '결승선이 머지않았으나, 긴 여정의 피로가 결국 당신을 무너뜨렸습니다.',
    'abandon.longRun.1': '그토록 오래 버텼음에도, 마지막 한 걸음을 내딛을 용기가 부족했군요.',
    'abandon.riskyPlay.0': '도박사의 운은 여기까지입니다. 너무 많은 것을 걸었고, 결국 모든 것을 잃기 전에 멈췄군요.',
    'abandon.riskyPlay.1': '위험한 줄타기를 즐기더니, 결국 스스로 줄을 끊어버렸습니다.',

    // Ending
    'ending.victory_desc': '당신은 최후의 시련을 이겨내고 세상을 구했습니다!',
    
    // Skills Notification
    'skill.learned': '새로운 스킬 습득!',
    'skill.awesome': '확인',
    
    // Stats
    'stats.hp': '체력',
    'stats.mp': '마력',
    'stats.attack': '공격력',
    'stats.defense': '방어력',
    
    // Classes
    'class.Warrior': '전사',
    'class.Mage': '마법사',
    'class.Rogue': '도적',

    // Monsters
    'monster.Slime': '슬라임',
    'monster.Goblin': '고블린',
    'monster.Skeleton': '스켈레톤',
    'monster.Orc': '오크',
    'monster.Dragon': '드래곤',

    // Items
    'item.type.weapon': '무기',
    'item.type.armor': '방어구',
    'item.type.consumable': '소모품',

    // Skills
    'skill.Shield Bash': '방패 가격',
    'skill.Iron Will': '강인한 의지',
    'skill.Berserk': '광분',
    'skill.Fireball': '화염구',
    'skill.Mana Shield': '마나 실드',
    'skill.Arcane Surge': '비전 폭주',
    'skill.Quick Slash': '신속한 베기',
    'skill.Shadow Strike': '그림자 습격',
    'skill.Assassinate': '암살',
    
    // Skill Descriptions
    'skill.desc.Shield Bash': '방어력에 비례한 피해(1.5배)를 입힙니다.',
    'skill.desc.Iron Will': '잃은 체력의 40%를 회복합니다.',
    'skill.desc.Berserk': '3턴 동안 공격력 +15, 방어력 -10.',
    'skill.desc.Fireball': '공격력의 2.5배 피해를 입힙니다.',
    'skill.desc.Mana Shield': '2턴 동안 방어력 +20.',
    'skill.desc.Arcane Surge': '1턴 동안 공격력 +30. 높은 리스크.',
    'skill.desc.Quick Slash': '신속한 공격. 낮은 MP 소모.',
    'skill.desc.Shadow Strike': '3배의 피해를 입히지만, 30% 확률로 빗나갑니다.',
    'skill.desc.Assassinate': '적의 체력이 30% 미만일 때 5배의 피해를 입힙니다.',
    'skill.Slime Tackle': '슬라임 태클',
    'skill.Goblin Slash': '고블린 베기',
    'skill.Bone Toss': '뼈다귀 던지기',
    'skill.Orc Smash': '오크 강타',
    'skill.Dragon Breath': '드래곤 브레스',

    // Endings
    'ending.normal.title': '새로운 수호자',
    'ending.normal.description': '마왕을 물리치고 평화를 되찾았습니다. 당신은 대륙의 새로운 수호자로 칭송받습니다.',
    'ending.berserker.title': '피에 굶주린 왕',
    'ending.berserker.description': '무모한 폭력으로 점철된 길이었습니다. 마왕은 쓰러졌지만, 당신이 받아들인 어둠이 당신을 집어삼켰습니다.',
    'ending.survivor.title': '불굴의 생존자',
    'ending.survivor.description': '강인한 생명력과 철저한 계획으로 불가능을 생존해냈습니다. 당신은 생존의 전설이 되어 고향으로 돌아갑니다.',
    'ending.gambler.title': '운명의 손길',
    'ending.gambler.description': '불장난 끝에 승리했습니다. 행운은 당신의 가장 강력한 무기였으며, 세상은 당신이 실력으로 이겼는지 운이었는지 궁금해합니다.',
    'ending.tactician.title': '대지략가',
    'ending.tactician.description': '모든 움직임은 계산되었습니다. 외과 수술과 같은 정밀함으로 마왕의 군대를 해체했습니다. 당신의 이름은 대대로 군사 학교에서 가르쳐질 것입니다.',

    'ending.stat.damage_dealt': '가한 피해',
    'ending.stat.damage_taken': '받은 피해',
    'ending.stat.battles_won': '승리 횟수',
    'ending.stat.total_turns': '총 턴 수',
    'ending.stat.risky_usage': '리스크 스킬 사용',
    'ending.stat.chance_usage': '확률 스킬 사용',
    'ending.stat.item_usage': '아이템 사용',
    'ending.restart': '새로운 여정 시작',
    'ending.footer': '당신의 전설이 역사의 한 페이지에 기록되었습니다.',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('game_language');
    if (saved === 'en' || saved === 'ko') return saved;
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('game_language', language);
  }, [language]);

  const t = (key: string, params?: { [key: string]: string | number }) => {
    let text = translations[language][key] || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        text = text.replace(`{{${paramKey}}}`, String(params[paramKey]));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
