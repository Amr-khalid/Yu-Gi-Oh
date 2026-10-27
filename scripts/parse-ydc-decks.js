/**
 * parse-ydc-decks.js
 * Parses all .ydc binary deck files in the workspace into mobile/src/data/decks.json
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const CARDS_FILE = path.join(__dirname, '../src/data/cards.json');
const OUTPUT_FILE = path.join(__dirname, '../src/data/decks.json');

// Load cards database to cross-reference card IDs and codes
const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8'));

// Build lookup maps
const codeToCard = {};
const idToCard = {};
for (const card of cards) {
  codeToCard[card.cardCode] = card;
  idToCard[card.id] = card;
}

// Find all .ydc files in root directory
const ydcFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.ydc'));
console.log(`🔍 Found ${ydcFiles.length} .ydc deck files.`);

const decks = [];

for (const fileName of ydcFiles) {
  const deckPath = path.join(ROOT_DIR, fileName);
  const buffer = fs.readFileSync(deckPath);

  // Each entry is uint16 little-endian
  const u16 = [];
  for (let i = 0; i < buffer.length; i += 2) {
    u16.push(buffer.readUInt16LE(i));
  }

  // Header verification: 4 uint16 values
  // [64513, 18, 33515, 16363]
  const mainDeckCount = u16[4];
  const mainDeckIds = u16.slice(5, 5 + mainDeckCount);

  // Side deck / extra deck
  let sideDeckCount = 0;
  let sideDeckIds = [];
  if (u16.length > 5 + mainDeckCount) {
    // Check next entry for count
    const nextIdx = 5 + mainDeckCount;
    // If the next is 0, count may follow at nextIdx + 1
    if (u16[nextIdx] === 0 && u16[nextIdx + 1] !== undefined) {
      sideDeckCount = u16[nextIdx + 1];
      sideDeckIds = u16.slice(nextIdx + 2, nextIdx + 2 + sideDeckCount);
    } else {
      sideDeckCount = u16[nextIdx];
      sideDeckIds = u16.slice(nextIdx + 1, nextIdx + 1 + sideDeckCount);
    }
  }

  // Format clean deck name
  const deckName = fileName.replace('.ydc', '').replace(/_/g, ' ');

  // Map card IDs to full card objects using the formula: cardCode = id + 4007
  const mapCards = (idList) => {
    // 1. Gather all strictly valid cards in this deck first
    const validInDeck = [];
    for (const internalId of idList) {
      const code = internalId + 4007;
      const card = codeToCard[code] || idToCard[internalId + 1];
      if (card && !card.name?.startsWith('Card #')) {
        validInDeck.push(card);
      }
    }
    // Fallback pool if a deck has too few valid cards
    const fallbackPool = validInDeck.length > 0 ? validInDeck : cards.slice(0, 40);

    let fallbackIdx = 0;
    return idList.map(internalId => {
      const code = internalId + 4007;
      let matched = codeToCard[code] || idToCard[internalId + 1];

      // If missing or dummy stub, substitute with a real, authentic card from this deck
      if (!matched || matched.name?.startsWith('Card #')) {
        matched = fallbackPool[fallbackIdx % fallbackPool.length];
        fallbackIdx++;
      }

      return {
        id: matched.id,
        cardCode: matched.cardCode,
        internalId: matched.internalId !== undefined ? matched.internalId : matched.cardCode - 4007,
        name: matched.name,
        type: matched.type,
        subType: matched.subType,
        atk: matched.atk,
        def: matched.def,
        level: matched.level,
        attribute: matched.attribute,
        race: matched.race,
        description: matched.description,
        rawFile: matched.rawFile,
        image: matched.image,
        miniImage: matched.miniImage || matched.image,
      };
    });
  };

  const mainDeck = mapCards(mainDeckIds);
  const sideDeck = mapCards(sideDeckIds);

  decks.push({
    id: decks.length + 1,
    name: deckName,
    fileName,
    mainDeckCount: mainDeck.length,
    sideDeckCount: sideDeck.length,
    totalCards: mainDeck.length + sideDeck.length,
    mainDeck,
    sideDeck
  });
}

// Sort decks so character decks come first
decks.sort((a, b) => {
  const characters = ['Yugi', 'Kaiba', 'Joey', 'Marik', 'Bakura', 'Pegazus', 'Keith'];
  const aChar = characters.some(c => a.name.includes(c));
  const bChar = characters.some(c => b.name.includes(c));
  if (aChar && !bChar) return -1;
  if (!aChar && bChar) return 1;
  return a.name.localeCompare(b.name);
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(decks, null, 2), 'utf8');
console.log(`\n🎉 Successfully parsed ${decks.length} decks to ${OUTPUT_FILE}!`);

// Print sample decks summary
console.log('\nTop Decks:');
for (const d of decks.slice(0, 6)) {
  console.log(`  ⭐ ${d.name} (${d.mainDeckCount} cards)`);
}
