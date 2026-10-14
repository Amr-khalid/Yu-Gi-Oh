const fs = require('fs');
const path = require('path');

const CARDS_PATH = path.join(__dirname, '../src/data/cards.json');
const BACKUP_PATH = path.join(__dirname, '../src/data/cards.backup.json');

const ALIASES = {
  'beast of gilfer': 'archfiend of gilfer',
  'crush card': 'crush card virus',
  'dark magic ritual': 'black magic ritual',
  'endymion the master magician': 'endymion, the master magician',
  'the winged dragon of ra (sphere mode)': 'the winged dragon of ra - sphere mode',
  'familiar-possesed - dharc': 'familiar-possessed - dharc',
  'verz heliolope': 'evilswarm heliotrope',
  'kuwagata alpha': 'kuwagata α',
  'stain storm': 'acid rain',
  'kinetic soldier': 'cipher soldier',
  'fossil warrior skullking': 'fossil warrior skull king',
  'diamond head dragon': 'diamond-head dragon',
  'swordsman from a foreign land': 'swordsman from a distant land',
  'gishki ceremonial mirror': 'gishki aquamirror',
  'stone d.': 'stone dragon',
  'harpies brother': 'sky scout',
  "harpie's brother": 'sky scout',
  'gravekeepers commantant': "gravekeeper's commandant",
  "gravekeeper's commantant": "gravekeeper's commandant",
  'marie the fallen one': 'darklord marie',
  'b. skull dragon': 'black skull dragon',
  'meteor b. dragon': 'meteor black dragon',
  'red-eyes b. dragon': 'red-eyes black dragon',
  'arcana force xiv - the temperance': 'arcana force xiv - temperance',
  'call of the haunted': 'call of the haunted',
  'scapegoat': 'scapegoat',
  'just desserts': 'just desserts',
  'ceasefire': 'ceasefire',
  'fissure': 'fissure',
  'waboku': 'waboku',
  'sparks': 'sparks',
  'ookazi': 'ookazi',
  'hinotama': 'hinotama',
  'final flame': 'final flame',
  'restructer revolution': 'restructer revolution',
  'tremendous fire': 'tremendous fire',
};

// Exact specifications for unmatched or custom game cards
const CUSTOM_OVERRIDES = {
  // Spells
  'bright castle': {
    type: 'spell',
    subType: 'equip'
  },
  'makiu': {
    type: 'spell',
    subType: 'normal'
  },
  'glory of the king\'s hand': {
    type: 'spell',
    subType: 'normal'
  },
  'eternal draught': {
    type: 'spell',
    subType: 'normal'
  },
  'stain storm': {
    type: 'spell',
    subType: 'normal'
  },
  'dark magic ritual': {
    type: 'spell',
    subType: 'ritual'
  },
  'gishki ceremonial mirror': {
    type: 'spell',
    subType: 'ritual'
  },

  // Traps
  'magic-arm shield': {
    type: 'trap',
    subType: 'normal'
  },
  'magic thorn': {
    type: 'trap',
    subType: 'continuous'
  },
  'call of the dark': {
    type: 'trap',
    subType: 'continuous'
  },
  'crush card': {
    type: 'trap',
    subType: 'normal'
  },

  // Monsters
  'vampire orchis': {
    type: 'monster',
    subType: 'effect',
    atk: 1700,
    def: 1000,
    level: 4,
    attribute: 'EARTH',
    race: 'Plant'
  },
  'beast of gilfer': {
    type: 'monster',
    subType: 'effect',
    atk: 2200,
    def: 2500,
    level: 6,
    attribute: 'DARK',
    race: 'Fiend'
  },
  'verz heliolope': {
    type: 'monster',
    subType: 'normal',
    atk: 1950,
    def: 650,
    level: 4,
    attribute: 'DARK',
    race: 'Rock'
  },
  'swordsman from a foreign land': {
    type: 'monster',
    subType: 'effect',
    atk: 250,
    def: 250,
    level: 1,
    attribute: 'EARTH',
    race: 'Warrior'
  },
  'oscillo hero #2': {
    type: 'monster',
    subType: 'normal',
    atk: 1000,
    def: 500,
    level: 3,
    attribute: 'LIGHT',
    race: 'Thunder'
  },
  'dizzy tiger': {
    type: 'monster',
    subType: 'effect',
    atk: 1300,
    def: 800,
    level: 4,
    attribute: 'EARTH',
    race: 'Beast'
  },
  'familiar-possesed - dharc': {
    type: 'monster',
    subType: 'effect',
    atk: 1850,
    def: 1500,
    level: 4,
    attribute: 'DARK',
    race: 'Spellcaster'
  },
  'dark magician girl of chaos': {
    type: 'monster',
    subType: 'normal',
    atk: 2000,
    def: 1700,
    level: 6,
    attribute: 'DARK',
    race: 'Spellcaster'
  },
  'giant ushi oni': {
    type: 'monster',
    subType: 'normal',
    atk: 2150,
    def: 1950,
    level: 6,
    attribute: 'DARK',
    race: 'Fiend'
  },
  'dizzy angel': {
    type: 'monster',
    subType: 'effect',
    atk: 1400,
    def: 1200,
    level: 4,
    attribute: 'LIGHT',
    race: 'Fairy'
  },
  'kuwagata alpha': {
    type: 'monster',
    subType: 'normal',
    atk: 1250,
    def: 1000,
    level: 4,
    attribute: 'EARTH',
    race: 'Insect'
  },
  'knight of destiny': {
    type: 'monster',
    subType: 'fusion',
    atk: 2800,
    def: 2500,
    level: 10,
    attribute: 'LIGHT',
    race: 'Warrior'
  },
  'kinetic soldier': {
    type: 'monster',
    subType: 'effect',
    atk: 1350,
    def: 1800,
    level: 3,
    attribute: 'EARTH',
    race: 'Machine'
  },
  'stone d.': {
    type: 'monster',
    subType: 'normal',
    atk: 2000,
    def: 2300,
    level: 7,
    attribute: 'EARTH',
    race: 'Rock'
  },
  'ruby dragon': {
    type: 'monster',
    subType: 'normal',
    atk: 2100,
    def: 2800,
    level: 7,
    attribute: 'LIGHT',
    race: 'Dragon'
  },
  'diamond head dragon': {
    type: 'monster',
    subType: 'effect',
    atk: 2800,
    def: 2800,
    level: 8,
    attribute: 'LIGHT',
    race: 'Dragon'
  },
  'trakadon': {
    type: 'monster',
    subType: 'normal',
    atk: 1300,
    def: 800,
    level: 3,
    attribute: 'EARTH',
    race: 'Dinosaur'
  },
  'dryad': {
    type: 'monster',
    subType: 'normal',
    atk: 1200,
    def: 1400,
    level: 4,
    attribute: 'EARTH',
    race: 'Spellcaster'
  },
  'harpie\'s brother': {
    type: 'monster',
    subType: 'normal',
    atk: 1800,
    def: 600,
    level: 4,
    attribute: 'WIND',
    race: 'Winged Beast'
  },
  'gravekeeper\'s commantant': {
    type: 'monster',
    subType: 'effect',
    atk: 1600,
    def: 1500,
    level: 4,
    attribute: 'EARTH',
    race: 'Spellcaster'
  },
  'b. skull dragon': {
    type: 'monster',
    subType: 'fusion',
    atk: 3200,
    def: 2500,
    level: 9,
    attribute: 'DARK',
    race: 'Dragon'
  },
  'blue-eyes baby dragon': {
    type: 'monster',
    subType: 'normal',
    atk: 1200,
    def: 700,
    level: 3,
    attribute: 'LIGHT',
    race: 'Dragon'
  },
  'breaker the magician girl': {
    type: 'monster',
    subType: 'effect',
    atk: 1600,
    def: 1000,
    level: 4,
    attribute: 'DARK',
    race: 'Spellcaster'
  },
  'poseidon giant beetle': {
    type: 'monster',
    subType: 'effect',
    atk: 2500,
    def: 2300,
    level: 7,
    attribute: 'EARTH',
    race: 'Insect'
  },
  'meteor b. dragon': {
    type: 'monster',
    subType: 'fusion',
    atk: 3500,
    def: 2000,
    level: 8,
    attribute: 'FIRE',
    race: 'Dragon'
  },
  'fossil dyna pachicephalo': {
    type: 'monster',
    subType: 'effect',
    atk: 1200,
    def: 1300,
    level: 4,
    attribute: 'EARTH',
    race: 'Rock'
  },
  'rigras leever': {
    type: 'monster',
    subType: 'effect',
    atk: 1600,
    def: 100,
    level: 3,
    attribute: 'FIRE',
    race: 'Fiend'
  },
  'red-eyes b. dragon': {
    type: 'monster',
    subType: 'normal',
    atk: 2400,
    def: 2000,
    level: 7,
    attribute: 'DARK',
    race: 'Dragon'
  },
  'arcana force xiv - the temperance': {
    type: 'monster',
    subType: 'effect',
    atk: 2400,
    def: 2400,
    level: 6,
    attribute: 'LIGHT',
    race: 'Fairy'
  },
  'the stern mystic': {
    type: 'monster',
    subType: 'effect',
    atk: 1500,
    def: 1200,
    level: 4,
    attribute: 'LIGHT',
    race: 'Spellcaster'
  },
  'marie the fallen one': {
    type: 'monster',
    subType: 'effect',
    atk: 1700,
    def: 1200,
    level: 5,
    attribute: 'DARK',
    race: 'Fiend'
  }
};

function normalizeName(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

async function run() {
  console.log('Fetching official YGOProDeck database...');
  const res = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php');
  const json = await res.json();
  const officialCards = json.data;
  console.log(`Loaded ${officialCards.length} official cards.`);

  const exactMap = new Map();
  const normalizedMap = new Map();

  officialCards.forEach(c => {
    exactMap.set(c.name.toLowerCase().trim(), c);
    normalizedMap.set(normalizeName(c.name), c);
  });

  const localCards = JSON.parse(fs.readFileSync(CARDS_PATH, 'utf8'));
  console.log(`Processing ${localCards.length} local cards in cards.json...`);

  let spellsCount = 0;
  let trapsCount = 0;
  let monstersCount = 0;
  let unmatchedCount = 0;

  const updatedCards = localCards.map(card => {
    const rawName = card.name.toLowerCase().trim();
    const aliasName = ALIASES[rawName] || rawName;
    const custom = CUSTOM_OVERRIDES[rawName];

    let match = custom || exactMap.get(aliasName) || normalizedMap.get(normalizeName(aliasName));

    if (!match) {
      unmatchedCount++;
      const updated = { ...card };
      if (updated.type === 'spell' || updated.type === 'trap') {
        delete updated.atk;
        delete updated.def;
        delete updated.level;
        delete updated.attribute;
        delete updated.race;
      }
      return updated;
    }

    if (custom) {
      const updated = { ...card };
      updated.type = custom.type;
      updated.subType = custom.subType;
      if (custom.type === 'monster') {
        updated.atk = custom.atk;
        updated.def = custom.def;
        updated.level = custom.level;
        updated.attribute = custom.attribute;
        updated.race = custom.race;
        monstersCount++;
      } else {
        delete updated.atk;
        delete updated.def;
        delete updated.level;
        delete updated.attribute;
        delete updated.race;
        if (custom.type === 'spell') spellsCount++;
        else trapsCount++;
      }
      return updated;
    }

    // Match from official database
    const officialType = match.type || '';
    const frameType = match.frameType || '';
    const updated = { ...card };

    if (officialType.includes('Spell') || frameType === 'spell') {
      updated.type = 'spell';
      delete updated.atk;
      delete updated.def;
      delete updated.level;
      delete updated.attribute;
      delete updated.race;

      const sub = (match.race || '').toLowerCase();
      if (sub.includes('equip')) updated.subType = 'equip';
      else if (sub.includes('field')) updated.subType = 'field';
      else if (sub.includes('continuous')) updated.subType = 'continuous';
      else if (sub.includes('quick-play')) updated.subType = 'quickplay';
      else if (sub.includes('ritual')) updated.subType = 'ritual';
      else updated.subType = 'normal';

      spellsCount++;
    } else if (officialType.includes('Trap') || frameType === 'trap') {
      updated.type = 'trap';
      delete updated.atk;
      delete updated.def;
      delete updated.level;
      delete updated.attribute;
      delete updated.race;

      const sub = (match.race || '').toLowerCase();
      if (sub.includes('counter')) updated.subType = 'counter';
      else if (sub.includes('continuous')) updated.subType = 'continuous';
      else updated.subType = 'normal';

      trapsCount++;
    } else {
      // Monster
      updated.type = 'monster';
      updated.atk = match.atk !== undefined ? match.atk : 0;
      updated.def = match.def !== undefined ? match.def : 0;
      updated.level = match.level || 4;
      updated.attribute = match.attribute || 'DARK';
      updated.race = match.race || 'Warrior';

      if (officialType.includes('Normal')) updated.subType = 'normal';
      else if (officialType.includes('Fusion')) updated.subType = 'fusion';
      else if (officialType.includes('Ritual')) updated.subType = 'ritual';
      else updated.subType = 'effect';

      monstersCount++;
    }

    return updated;
  });

  // Strict final pass: NO spell or trap must EVER have atk or def or level or race or attribute
  updatedCards.forEach(c => {
    if (c.type === 'spell' || c.type === 'trap') {
      delete c.atk;
      delete c.def;
      delete c.level;
      delete c.attribute;
      delete c.race;
    }
  });

  fs.writeFileSync(CARDS_PATH, JSON.stringify(updatedCards, null, 2), 'utf8');

  console.log('\nFINAL REFRESH STATS:');
  console.log(`- Monsters: ${updatedCards.filter(c => c.type === 'monster').length}`);
  console.log(`- Spells:   ${updatedCards.filter(c => c.type === 'spell').length}`);
  console.log(`- Traps:    ${updatedCards.filter(c => c.type === 'trap').length}`);
  console.log(`- Spells or Traps with ATK or DEF: ${updatedCards.filter(c => (c.type === 'spell' || c.type === 'trap') && (c.atk !== undefined || c.def !== undefined)).length}`);
  console.log(`- Monsters missing ATK or DEF: ${updatedCards.filter(c => c.type === 'monster' && (c.atk === undefined || c.def === undefined)).length}`);
  console.log(`- Unmatched: ${unmatchedCount}`);
}

run().catch(console.error);
