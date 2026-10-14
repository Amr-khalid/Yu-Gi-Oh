/**
 * extract-card-database.js
 * Extracts card names, descriptions, properties and image mappings from PC game files
 * and outputs mobile/src/data/cards.json.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const MEGE_DIR = path.join(ROOT_DIR, 'Mege');
const LIST_CARD_PATH = path.join(MEGE_DIR, 'card', 'list_card.txt');
const CARD_NAME_PATH = path.join(MEGE_DIR, 'bin#', 'card_nameeng.bin');
const CARD_DESC_PATH = path.join(MEGE_DIR, 'bin#', 'card_desceng.bin');
const CARD_PROP_PATH = path.join(MEGE_DIR, 'bin#', 'card_prop.bin');
const OUTPUT_DIR = path.join(__dirname, '../src/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'cards.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🔄 Loading game asset files...');

// 1. Read card names
const nameBin = fs.readFileSync(CARD_NAME_PATH);
const names = nameBin.toString('utf8').split('\0').filter(x => x.length > 0);
console.log(`✅ Loaded ${names.length} card names.`);

// 2. Read card descriptions
const descBin = fs.readFileSync(CARD_DESC_PATH);
const descs = descBin.toString('utf8').split('\0').filter(x => x.length > 0);
console.log(`✅ Loaded ${descs.length} card descriptions.`);

// 3. Read card properties (4 bytes per card)
const propBin = fs.readFileSync(CARD_PROP_PATH);
const propCount = Math.floor(propBin.length / 4);
console.log(`✅ Loaded ${propCount} card property records.`);

// 4. Read list_card.txt
const listText = fs.readFileSync(LIST_CARD_PATH, 'utf8');
const lines = listText.split(/\r?\n/).map(l => l.trim());

// Collect all image entries from list_card.txt
const bmpEntries = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].endsWith('.bmp')) {
    const bmp = lines[i];
    let cardName = '';
    // Look up preceding comment lines for the card name
    for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
      if (lines[j].startsWith('//') && lines[j].length > 2 && !lines[j].includes('Generated')) {
        cardName = lines[j].replace(/^\/\/\s*/, '').trim();
        break;
      }
    }
    bmpEntries.push({
      file: bmp,
      nameFromList: cardName
    });
  }
}
console.log(`✅ Loaded ${bmpEntries.length} image mappings from list_card.txt.`);

// Famous card stats lookup dictionary for guaranteed accuracy of classic Yu-Gi-Oh! cards
const KNOWN_STATS = {
  // Yugi / Kaiba / Joey / Iconic Cards
  'Blue-Eyes White Dragon': { atk: 3000, def: 2500, level: 8, attribute: 'LIGHT', race: 'Dragon', type: 'monster', subType: 'normal' },
  'Blue-Eyes Ultimate Dragon': { atk: 4500, def: 3800, level: 12, attribute: 'LIGHT', race: 'Dragon', type: 'monster', subType: 'fusion' },
  'Blue-Eyes Toon Dragon': { atk: 3000, def: 2500, level: 8, attribute: 'LIGHT', race: 'Dragon', type: 'monster', subType: 'effect' },
  'Dark Magician': { atk: 2500, def: 2100, level: 7, attribute: 'DARK', race: 'Spellcaster', type: 'monster', subType: 'normal' },
  'Dark Magician Girl': { atk: 2000, def: 1700, level: 6, attribute: 'DARK', race: 'Spellcaster', type: 'monster', subType: 'effect' },
  'Dark Magician of Chaos': { atk: 2800, def: 2600, level: 8, attribute: 'DARK', race: 'Spellcaster', type: 'monster', subType: 'effect' },
  'Dark Magician Knight': { atk: 2500, def: 2100, level: 7, attribute: 'DARK', race: 'Warrior', type: 'monster', subType: 'effect' },
  'Skilled Dark Magician': { atk: 1900, def: 1700, level: 4, attribute: 'DARK', race: 'Spellcaster', type: 'monster', subType: 'effect' },
  'Red-Eyes B. Dragon': { atk: 2400, def: 2000, level: 7, attribute: 'DARK', race: 'Dragon', type: 'monster', subType: 'normal' },
  'Summoned Skull': { atk: 2500, def: 1200, level: 6, attribute: 'DARK', race: 'Fiend', type: 'monster', subType: 'normal' },
  'Celtic Guardian': { atk: 1400, def: 1200, level: 4, attribute: 'EARTH', race: 'Warrior', type: 'monster', subType: 'normal' },
  'Kuriboh': { atk: 300, def: 200, level: 1, attribute: 'DARK', race: 'Fiend', type: 'monster', subType: 'effect' },
  'Buster Blader': { atk: 2600, def: 2300, level: 7, attribute: 'EARTH', race: 'Warrior', type: 'monster', subType: 'effect' },
  'Battle Ox': { atk: 1700, def: 1000, level: 4, attribute: 'EARTH', race: 'Beast-Warrior', type: 'monster', subType: 'normal' },
  'La Jinn the Mystical Genie of the Lamp': { atk: 1800, def: 1000, level: 4, attribute: 'DARK', race: 'Fiend', type: 'monster', subType: 'normal' },
  'Vorse Raider': { atk: 1900, def: 1200, level: 4, attribute: 'DARK', race: 'Beast-Warrior', type: 'monster', subType: 'normal' },
  'Judge Man': { atk: 2200, def: 1500, level: 6, attribute: 'EARTH', race: 'Warrior', type: 'monster', subType: 'normal' },
  'Mystic Horseman': { atk: 1300, def: 1550, level: 4, attribute: 'EARTH', race: 'Beast', type: 'monster', subType: 'normal' },
  'Ryu-Kishin Powered': { atk: 1600, def: 1200, level: 4, attribute: 'DARK', race: 'Fiend', type: 'monster', subType: 'normal' },
  'Lord of D.': { atk: 1200, def: 1100, level: 4, attribute: 'DARK', race: 'Spellcaster', type: 'monster', subType: 'effect' },
  'Sangan': { atk: 1000, def: 600, level: 3, attribute: 'DARK', race: 'Fiend', type: 'monster', subType: 'effect' },
  'Witch of the Black Forest': { atk: 1100, def: 1200, level: 4, attribute: 'DARK', race: 'Spellcaster', type: 'monster', subType: 'effect' },
  'Man-Eater Bug': { atk: 450, def: 600, level: 2, attribute: 'EARTH', race: 'Insect', type: 'monster', subType: 'effect' },
  'Cyber-Stein': { atk: 700, def: 500, level: 2, attribute: 'DARK', race: 'Machine', type: 'monster', subType: 'effect' },
  'Cyber Dragon': { atk: 2100, def: 1600, level: 5, attribute: 'LIGHT', race: 'Machine', type: 'monster', subType: 'effect' },
  'Cyber End Dragon': { atk: 4000, def: 2800, level: 10, attribute: 'LIGHT', race: 'Machine', type: 'monster', subType: 'fusion' },
  'Jinzo': { atk: 2400, def: 1500, level: 6, attribute: 'DARK', race: 'Machine', type: 'monster', subType: 'effect' },
  'Black Luster Soldier': { atk: 3000, def: 2500, level: 8, attribute: 'EARTH', race: 'Warrior', type: 'monster', subType: 'ritual' },
  'Black Luster Soldier - Envoy of the Beginning': { atk: 3000, def: 2500, level: 8, attribute: 'LIGHT', race: 'Warrior', type: 'monster', subType: 'effect' },
  'Chaos Emperor Dragon - Envoy of the End': { atk: 3000, def: 2500, level: 8, attribute: 'DARK', race: 'Dragon', type: 'monster', subType: 'effect' },
  'Felgrand Dragon': { atk: 2800, def: 2800, level: 8, attribute: 'LIGHT', race: 'Dragon', type: 'monster', subType: 'effect' },
  'Elemental Hero Burstinatrix': { atk: 1200, def: 800, level: 3, attribute: 'FIRE', race: 'Warrior', type: 'monster', subType: 'normal' },
  'Armored Lizard': { atk: 1500, def: 1200, level: 4, attribute: 'EARTH', race: 'Reptile', type: 'monster', subType: 'normal' },
  'Aqua Madoor': { atk: 1200, def: 2000, level: 4, attribute: 'WATER', race: 'Spellcaster', type: 'monster', subType: 'normal' },

  // Exodia
  'Exodia the Forbidden One': { atk: 1000, def: 1000, level: 3, attribute: 'DARK', race: 'Spellcaster', type: 'monster', subType: 'effect' },
  'Right Leg of the Forbidden One': { atk: 200, def: 300, level: 1, attribute: 'DARK', race: 'Spellcaster', type: 'monster', subType: 'normal' },
  'Left Leg of the Forbidden One': { atk: 200, def: 300, level: 1, attribute: 'DARK', race: 'Spellcaster', type: 'monster', subType: 'normal' },
  'Right Arm of the Forbidden One': { atk: 200, def: 300, level: 1, attribute: 'DARK', race: 'Spellcaster', type: 'monster', subType: 'normal' },
  'Left Arm of the Forbidden One': { atk: 200, def: 300, level: 1, attribute: 'DARK', race: 'Spellcaster', type: 'monster', subType: 'normal' },

  // Spells
  'Pot of Greed': { type: 'spell', subType: 'normal' },
  'Raigeki': { type: 'spell', subType: 'normal' },
  'Dark Hole': { type: 'spell', subType: 'normal' },
  'Monster Reborn': { type: 'spell', subType: 'normal' },
  'Change of Heart': { type: 'spell', subType: 'normal' },
  'Swords of Revealing Light': { type: 'spell', subType: 'normal' },
  'Heavy Storm': { type: 'spell', subType: 'normal' },
  'Harpie\'s Feather Duster': { type: 'spell', subType: 'normal' },
  'Mystical Space Typhoon': { type: 'spell', subType: 'quickplay' },
  'Premature Burial': { type: 'spell', subType: 'equip' },
  'Snatch Steal': { type: 'spell', subType: 'equip' },
  'Mage Power': { type: 'spell', subType: 'equip' },
  'United We Stand': { type: 'spell', subType: 'equip' },
  'Graceful Charity': { type: 'spell', subType: 'normal' },
  'Polymerization': { type: 'spell', subType: 'normal' },
  'Infinite Cards': { type: 'spell', subType: 'continuous' },
  'Stop Defense': { type: 'spell', subType: 'normal' },
  'Megamorph': { type: 'spell', subType: 'equip' },

  // Traps
  'Mirror Force': { type: 'trap', subType: 'normal' },
  'Trap Hole': { type: 'trap', subType: 'normal' },
  'Torrential Tribute': { type: 'trap', subType: 'normal' },
  'Magic Cylinder': { type: 'trap', subType: 'normal' },
  'Call of the Haunted': { type: 'trap', subType: 'continuous' },
  'Imperial Order': { type: 'trap', subType: 'continuous' },
  'Crush Card': { type: 'trap', subType: 'normal' },
  'Solemn Judgment': { type: 'trap', subType: 'counter' },
  'Magic Jammer': { type: 'trap', subType: 'counter' },
  'Seven Tools of the Bandit': { type: 'trap', subType: 'counter' },
  'Ring of Destruction': { type: 'trap', subType: 'normal' },
  'Bottomless Trap Hole': { type: 'trap', subType: 'normal' },
};

// Build final cards list
const allCards = [];

for (let i = 0; i < names.length; i++) {
  const cardName = names[i];
  const cardDesc = descs[i] || '';
  
  // Corresponding image entry (index 0 in list_card.txt is 0000.bmp, index 1 is card 1)
  const bmpEntry = bmpEntries[i + 1] || { file: `${4007 + i}_1.bmp`, nameFromList: cardName };
  const bmpFile = bmpEntry.file;
  
  // Extract file code number
  const codeMatch = bmpFile.match(/^(\d+)/);
  const cardCode = codeMatch ? parseInt(codeMatch[1], 10) : (4007 + i);

  // Raw property bytes
  const propOffset = i * 4;
  const p0 = propBin[propOffset] || 0;
  const p1 = propBin[propOffset + 1] || 0;
  const p2 = propBin[propOffset + 2] || 0;
  const p3 = propBin[propOffset + 3] || 0;

  // Determine card type & stats
  let cardInfo = {
    id: i + 1,
    cardCode,
    internalId: cardCode - 4007,
    name: cardName,
    description: cardDesc,
    image: bmpFile.replace('.bmp', '.webp'),
    miniImage: bmpFile.replace('.bmp', '.webp'),
    rawFile: bmpFile,
    props: [p0, p1, p2, p3]
  };

  // Check known stats dictionary first
  if (KNOWN_STATS[cardName]) {
    cardInfo = { ...cardInfo, ...KNOWN_STATS[cardName] };
  } else {
    // Intelligent deduction from description and properties
    const descLower = cardDesc.toLowerCase();

    // Check if Spell
    const isSpell = descLower.includes('[spell card') || 
                    descLower.includes('spell card') || 
                    descLower.includes('equip spell') ||
                    descLower.includes('continuous spell') ||
                    descLower.includes('ritual spell') ||
                    descLower.includes('field spell') ||
                    descLower.includes('quick-play');

    // Check if Trap
    const isTrap = descLower.includes('[trap card') || 
                   descLower.includes('trap card') || 
                   descLower.includes('continuous trap') ||
                   descLower.includes('counter trap') ||
                   descLower.includes('activate only when') ||
                   descLower.includes('activate when');

    if (isSpell) {
      cardInfo.type = 'spell';
      if (descLower.includes('quick-play')) cardInfo.subType = 'quickplay';
      else if (descLower.includes('continuous')) cardInfo.subType = 'continuous';
      else if (descLower.includes('equip')) cardInfo.subType = 'equip';
      else if (descLower.includes('field')) cardInfo.subType = 'field';
      else if (descLower.includes('ritual')) cardInfo.subType = 'ritual';
      else cardInfo.subType = 'normal';
    } else if (isTrap) {
      cardInfo.type = 'trap';
      if (descLower.includes('counter')) cardInfo.subType = 'counter';
      else if (descLower.includes('continuous')) cardInfo.subType = 'continuous';
      else cardInfo.subType = 'normal';
    } else {
      // Monster
      cardInfo.type = 'monster';
      if (descLower.includes('fusion') || descLower.includes('" + "')) {
        cardInfo.subType = 'fusion';
      } else if (descLower.includes('ritual') && descLower.includes('ritual summon')) {
        cardInfo.subType = 'ritual';
      } else if (
        descLower.includes('flip:') || 
        descLower.includes('when this card') || 
        descLower.includes('you can') || 
        descLower.includes('this card cannot') ||
        descLower.includes('destroy') ||
        descLower.includes('tribute')
      ) {
        cardInfo.subType = 'effect';
      } else {
        cardInfo.subType = 'normal';
      }

      // Estimate ATK/DEF from property bytes or text
      // In PoC engine, p0 * 10 is frequently DEF (or ATK)
      let estimatedDef = p0 * 10;
      let estimatedAtk = p1 * 10;
      
      // Defaults if zeros or out of bounds
      if (estimatedAtk === 0 && estimatedDef === 0) {
        estimatedAtk = 1500;
        estimatedDef = 1200;
      }
      if (estimatedAtk > 5000) estimatedAtk = 2000;
      if (estimatedDef > 5000) estimatedDef = 1500;

      cardInfo.atk = estimatedAtk;
      cardInfo.def = estimatedDef;
      cardInfo.level = Math.max(1, Math.min(12, Math.floor((cardInfo.atk + cardInfo.def) / 600)));
      cardInfo.attribute = 'DARK';
      cardInfo.race = 'Warrior';
    }
  }

  allCards.push(cardInfo);
}

// Write to JSON
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allCards, null, 2), 'utf8');
console.log(`\n🎉 Successfully extracted ${allCards.length} cards to ${OUTPUT_FILE}!`);

// Stats summary
const monsterCount = allCards.filter(c => c.type === 'monster').length;
const spellCount = allCards.filter(c => c.type === 'spell').length;
const trapCount = allCards.filter(c => c.type === 'trap').length;
console.log(`📊 Breakdown:`);
console.log(`   - Monsters: ${monsterCount}`);
console.log(`   - Spells:   ${spellCount}`);
console.log(`   - Traps:    ${trapCount}`);
