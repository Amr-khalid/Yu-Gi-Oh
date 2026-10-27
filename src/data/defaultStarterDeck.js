import allCards from './cards.json';

/**
 * Helper to fetch a complete card object by exact or case-insensitive name
 */
const findCard = (name) => {
  const card = allCards.find((c) => c.name && c.name.toLowerCase() === name.toLowerCase());
  if (!card) {
    console.warn(`[StarterDeck] Warning: Card "${name}" not found in cards.json`);
    return null;
  }
  return { ...card };
};

/**
 * 40-Card Pharaoh's Legendary Starter Deck (مجموعة الفرعون الأسطورية)
 * Perfectly balanced distribution:
 * - 20 Monsters (4 Bosses/Tribute, 6 Utility/Search/Effect, 10 High-Tier Level 3-4 Beaters & Walls)
 * - 11 Spells (Draw power, removal, field wipes, battle manipulation, equips)
 * - 9 Traps (Mirror Force, Magic Cylinder, Solemn, revival, disruption)
 */
export const PHARAOH_STARTER_CARD_NAMES = [
  // Boss & Tribute Monsters (4)
  'Dark Magician',
  'Blue-Eyes White Dragon',
  'Summoned Skull',
  'Buster Blader',

  // Effect & Utility Monsters (6)
  'Dark Magician Girl',
  'Skilled Dark Magician',
  'Skilled Dark Magician',
  'Crusader of Endymion',
  'Magician\'s Valkyria',
  'Sangan',
  'Old Vindictive Magician',

  // Level 4 High ATK Beaters & 2000 DEF Walls (9)
  'Gemini Elf',
  'Gemini Elf',
  'Vorse Raider',
  'Vorse Raider',
  'Archfiend Soldier',
  'Luster Dragon',
  'Alexandrite Dragon',
  'Giant Soldier of Stone',
  'Mystical Elf',

  // Spells (11)
  'Pot of Greed',
  'Monster Reborn',
  'Raigeki',
  'Dark Hole',
  'Swords of Revealing Light',
  'Mystical Space Typhoon',
  'Mystical Space Typhoon',
  'Change of Heart',
  'Card Destruction',
  'Malevolent Nuzzler',
  'Black Pendant',

  // Traps (9)
  'Mirror Force',
  'Magic Cylinder',
  'Call Of The Haunted',
  'Torrential Tribute',
  'Trap Hole',
  'Trap Hole',
  'Destruction Punch',
  'Solemn Judgment',
  'Spellbinding Circle',
];

/**
 * 40-Card Kaiba's Balanced Rival Starter Deck (مجموعة سيتو كايبا الأسطورية)
 */
export const KAIBA_STARTER_CARD_NAMES = [
  // Boss & Tribute Monsters (3)
  'Blue-Eyes White Dragon',
  'Blue-Eyes White Dragon',
  'Summoned Skull',

  // High-Powered Dragon & Warrior Beaters (13)
  'Axe Dragonute',
  'Axe Dragonute',
  'Vorse Raider',
  'Vorse Raider',
  'Luster Dragon',
  'Luster Dragon',
  'Alexandrite Dragon',
  'Alexandrite Dragon',
  'La Jinn the Mystical Genie of the Lamp',
  'La Jinn the Mystical Genie of the Lamp',
  'Battle Ox',
  'Battle Ox',
  'Cave Dragon',

  // Defense & Support (4)
  'Giant Soldier of Stone',
  'Mystical Elf',
  'Lord of D.',
  'Sangan',

  // Spells (11)
  'Pot of Greed',
  'Monster Reborn',
  'Raigeki',
  'Dark Hole',
  'Swords of Revealing Light',
  'Mystical Space Typhoon',
  'Mystical Space Typhoon',
  'Change of Heart',
  'Malevolent Nuzzler',
  'Black Pendant',
  'Riryoku',

  // Traps (9)
  'Mirror Force',
  'Magic Cylinder',
  'Call Of The Haunted',
  'Torrential Tribute',
  'Trap Hole',
  'Trap Hole',
  'Destruction Punch',
  'Solemn Judgment',
  'Windstorm of Etaqua',
];

/**
 * Get Pharaoh's Starter Deck (40 cards)
 */
export const getPharaohStarterDeck = () => {
  return PHARAOH_STARTER_CARD_NAMES.map(findCard).filter(Boolean);
};

/**
 * Get Kaiba's Starter Deck (40 cards)
 */
export const getKaibaStarterDeck = () => {
  return KAIBA_STARTER_CARD_NAMES.map(findCard).filter(Boolean);
};
