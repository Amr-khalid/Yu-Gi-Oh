import fs from 'fs';
import { DuelEngine } from '../src/game/engine/DuelEngine.js';
import { checkWinConditions } from '../src/game/engine/WinCondition.js';
import { activateSpell, setSpellTrap, normalSummon, resolveTrapEffect } from '../src/game/engine/CardResolver.js';
import { resolveMonsterEffect } from '../src/game/engine/MonsterEffects.js';

const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));

function findCard(query) {
  const q = query.toLowerCase();
  const c = cards.find(x => x.name.toLowerCase().includes(q));
  if (!c) throw new Error(`Card not found: ${query}`);
  return JSON.parse(JSON.stringify(c));
}

function makeDummyDeck() {
  return Array.from({ length: 40 }, (_, i) => cards[i % cards.length]);
}

function makeEngine() {
  return new DuelEngine(makeDummyDeck(), makeDummyDeck());
}

console.log('=== TEST SUITE: YU-GI-OH! MECHANICS AND SPECIAL CARDS ===\n');

// 1. Strict Zone Check: Spells and Traps CANNOT be summoned to monster zones
console.log('Test 1: Guard against summoning Spells/Traps to monster zone...');
{
  const axe = findCard('Axe of Despair');
  const mirror = findCard('Mirror Force');
  const engine = makeEngine();
  engine.state.players[0].hand = [axe, mirror];

  let threwSpell = false;
  try {
    engine.normalSummon(0, 0);
  } catch (e) {
    threwSpell = true;
  }
  if (!threwSpell) throw new Error('FAIL: Spell card was allowed to be summoned as monster!');

  let threwTrap = false;
  try {
    engine.normalSummon(1, 0);
  } catch (e) {
    threwTrap = true;
  }
  if (!threwTrap) throw new Error('FAIL: Trap card was allowed to be summoned as monster!');
  console.log('  PASS: Spells and Traps are strictly rejected from monster zones.');
}

// 2. Strict Zone Check: Monsters cannot be set in Spell/Trap zones
console.log('Test 2: Guard against setting monsters into spell/trap zone...');
{
  const bewd = findCard('Blue-Eyes White Dragon');
  const engine = makeEngine();
  engine.state.players[0].hand = [bewd];

  let threw = false;
  try {
    engine.setSpellTrap(0, 0);
  } catch (e) {
    threw = true;
  }
  if (!threw) throw new Error('FAIL: Monster was allowed to be set in spell/trap zone!');
  console.log('  PASS: Monsters are strictly rejected from spell/trap zones.');
}

// 3. Exodia Win Condition
console.log('Test 3: Exodia Instant Win Condition with 5 exact pieces...');
{
  const p0 = [
    findCard('Exodia the Forbidden One'),
    findCard('Left Leg of the Forbidden One'),
    findCard('Left Arm of the Forbidden One'),
    findCard('Right Leg of the Forbidden One'),
    findCard('Right Arm of the Forbidden One'),
  ];
  const engine = makeEngine();
  engine.state.players[0].hand = p0;
  checkWinConditions(engine.state);
  if (engine.state.winner !== 0 || engine.state.winReason !== 'EXODIA') {
    throw new Error(`FAIL: Exodia was not recognized! winner: ${engine.state.winner}`);
  }
  console.log('  PASS: Exodia instant victory achieved cleanly.');
}

// 4. Axe of Despair (+1000 ATK)
console.log('Test 4: Axe of Despair grants exact +1000 ATK...');
{
  const bewd = findCard('Blue-Eyes White Dragon'); // 3000 ATK
  const axe = findCard('Axe of Despair');
  const engine = makeEngine();
  engine.state.players[0].monsterZones[0] = {
    card: bewd,
    position: 'face_up_attack',
    currentAtk: 3000,
    currentDef: 2500,
  };
  engine.state.players[0].hand = [axe];
  engine.activateSpell(0);
  const slot = engine.state.players[0].monsterZones[0];
  if (slot.currentAtk !== 4000) {
    throw new Error(`FAIL: Axe of Despair did not grant +1000 ATK! Got: ${slot.currentAtk}`);
  }
  console.log('  PASS: Blue-Eyes ATK increased from 3000 to 4000 (+1000).');
}

// 5. Mage Power (+500 per S/T)
console.log('Test 5: Mage Power scales with spell/trap count...');
{
  const dm = findCard('Dark Magician'); // 2500 ATK / 2100 DEF
  const magePower = findCard('Mage Power');
  const engine = makeEngine();
  engine.state.players[0].monsterZones[0] = {
    card: dm,
    position: 'face_up_attack',
    currentAtk: 2500,
    currentDef: 2100,
  };
  // Place 2 face-down traps in S/T zones
  engine.state.players[0].spellTrapZones[0] = { card: findCard('Trap Hole'), faceUp: false };
  engine.state.players[0].spellTrapZones[1] = { card: findCard('Mirror Force'), faceUp: false };
  engine.state.players[0].hand = [magePower];

  engine.activateSpell(0);
  const slot = engine.state.players[0].monsterZones[0];
  // 2 S/T cards on field -> +1000 ATK and +1000 DEF
  if (slot.currentAtk !== 3500 || slot.currentDef !== 3100) {
    throw new Error(`FAIL: Mage Power boost incorrect! ATK: ${slot.currentAtk}, DEF: ${slot.currentDef}`);
  }
  console.log('  PASS: Mage Power added +1000 ATK/DEF for 2 S/T cards.');
}

// 6. United We Stand (+800 per face-up monster)
console.log('Test 6: United We Stand scales with monster count...');
{
  const dm = findCard('Dark Magician');
  const celtic = findCard('Celtic Guardian');
  const uws = findCard('United We Stand');
  const engine = makeEngine();
  engine.state.players[0].monsterZones[0] = { card: dm, position: 'face_up_attack', currentAtk: 2500, currentDef: 2100 };
  engine.state.players[0].monsterZones[1] = { card: celtic, position: 'face_up_attack', currentAtk: 1400, currentDef: 1200 };
  engine.state.players[0].hand = [uws];

  engine.activateSpell(0);
  const slot = engine.state.players[0].monsterZones[0];
  // 2 face-up monsters -> 2 * 800 = +1600 ATK/DEF (2500 + 1600 = 4100)
  if (slot.currentAtk !== 4100 || slot.currentDef !== 3700) {
    throw new Error(`FAIL: United We Stand boost incorrect! ATK: ${slot.currentAtk}, DEF: ${slot.currentDef}`);
  }
  console.log('  PASS: United We Stand added +1600 ATK/DEF for 2 monsters.');
}

// 7. Riryoku (Halves 1 monster ATK, adds to another)
console.log('Test 7: Riryoku halves opponent ATK and gives to player...');
{
  const oppBewd = findCard('Blue-Eyes White Dragon'); // 3000 ATK
  const myDm = findCard('Dark Magician'); // 2500 ATK
  const riryoku = findCard('Riryoku');
  const engine = makeEngine();
  engine.state.players[1].monsterZones[0] = { card: oppBewd, position: 'face_up_attack', currentAtk: 3000, currentDef: 2500 };
  engine.state.players[0].monsterZones[0] = { card: myDm, position: 'face_up_attack', currentAtk: 2500, currentDef: 2100 };
  engine.state.players[0].hand = [riryoku];

  engine.activateSpell(0);
  const oppSlot = engine.state.players[1].monsterZones[0];
  const mySlot = engine.state.players[0].monsterZones[0];
  if (oppSlot.currentAtk !== 1500) throw new Error(`FAIL: Opponent ATK not halved! ${oppSlot.currentAtk}`);
  if (mySlot.currentAtk !== 4000) throw new Error(`FAIL: My ATK did not receive 1500! ${mySlot.currentAtk}`);
  console.log('  PASS: Riryoku reduced opponent 3000 -> 1500 and boosted player 2500 -> 4000.');
}

// 8. Scapegoat & Sheep Tokens cannot be tributed
console.log('Test 8: Scapegoat summons tokens and restricts tribute...');
{
  const scapegoat = findCard('Scapegoat');
  const bewd = findCard('Blue-Eyes White Dragon'); // Requires 2 tributes
  const engine = makeEngine();
  engine.state.players[0].monsterZones = [null, null, null, null, null];
  engine.state.players[0].hand = [scapegoat, bewd];

  engine.activateSpell(0);
  const p0Monsters = engine.state.players[0].monsterZones.filter(m => m !== null);
  if (p0Monsters.length !== 4) throw new Error(`FAIL: Scapegoat did not summon 4 tokens! Count: ${p0Monsters.length}`);
  if (p0Monsters[0].currentAtk !== 0 || p0Monsters[0].currentDef !== 0) throw new Error('FAIL: Token stats not 0/0');

  // Attempt to tribute tokens for Blue-Eyes
  let threwTribute = false;
  try {
    engine.normalSummon(0, 4, 'face_up_attack', [0, 1]);
  } catch (e) {
    threwTribute = true;
  }
  if (!threwTribute) throw new Error('FAIL: Sheep Tokens were illegally allowed as tributes!');
  console.log('  PASS: Scapegoat spawned 4 Sheep Tokens and prevented Tribute Summoning.');
}

// 9. Graceful Charity (Draw 3, discard 2)
console.log('Test 9: Graceful Charity...');
{
  const charity = findCard('Graceful Charity');
  const engine = makeEngine();
  engine.state.players[0].deck = [
    findCard('Celtic Guardian'),
    findCard('Silver Fang'),
    findCard('Kuriboh'),
    findCard('Giant Soldier of Stone'),
  ];
  engine.state.players[0].hand = [charity];
  engine.activateSpell(0);
  // Played 1, drew 3, discarded 2 -> hand has 1 card left, graveyard has 2 discarded + 1 charity = 3 cards
  if (engine.state.players[0].hand.length !== 1) {
    throw new Error(`FAIL: Graceful Charity hand length wrong: ${engine.state.players[0].hand.length}`);
  }
  if (engine.state.players[0].graveyard.length !== 3) {
    throw new Error(`FAIL: Graceful Charity graveyard count wrong: ${engine.state.players[0].graveyard.length}`);
  }
  console.log('  PASS: Graceful Charity drew 3 and discarded 2 cards.');
}

// 10. Card Destruction
console.log('Test 10: Card Destruction...');
{
  const cd = findCard('Card Destruction');
  const engine = makeEngine();
  engine.state.players[0].hand = [cd, findCard('Kuriboh'), findCard('Silver Fang')]; // 2 extra
  engine.state.players[1].hand = [findCard('Baby Dragon')]; // 1 card
  engine.state.players[0].deck = [findCard('Celtic Guardian'), findCard('Dark Magician')];
  engine.state.players[1].deck = [findCard('Feral Imp')];

  engine.activateSpell(0);
  if (engine.state.players[0].hand.length !== 2) throw new Error(`FAIL: P0 hand not 2: ${engine.state.players[0].hand.length}`);
  if (engine.state.players[1].hand.length !== 1) throw new Error(`FAIL: P1 hand not 1: ${engine.state.players[1].hand.length}`);
  console.log('  PASS: Card Destruction discarded and redrew exact hand sizes for both players.');
}

// 11. Snatch Steal
console.log('Test 11: Snatch Steal takes control of opponent monster...');
{
  const oppBewd = findCard('Blue-Eyes White Dragon');
  const snatch = findCard('Snatch Steal');
  const engine = makeEngine();
  engine.state.players[1].monsterZones[0] = { card: oppBewd, position: 'face_up_attack', currentAtk: 3000, currentDef: 2500 };
  engine.state.players[0].hand = [snatch];

  engine.activateSpell(0);
  if (engine.state.players[1].monsterZones[0] !== null) throw new Error('FAIL: Opponent still has monster');
  if (!engine.state.players[0].monsterZones.some(m => m && m.card.name === oppBewd.name)) {
    throw new Error('FAIL: Player did not gain control of monster');
  }
  console.log('  PASS: Snatch Steal successfully transferred control of opponent monster.');
}

// 12. Call of the Haunted
console.log('Test 12: Call of the Haunted revives monster from GY in ATK mode...');
{
  const bewd = findCard('Blue-Eyes White Dragon');
  const call = findCard('Call Of The Haunted');
  const engine = makeEngine();
  engine.state.players[0].graveyard = [bewd];
  const res = resolveTrapEffect(engine.state, 0, call);
  if (res.type !== 'call_of_the_haunted') throw new Error(`FAIL: Call of Haunted type: ${res.type}`);
  const slot = engine.state.players[0].monsterZones[0];
  if (!slot || slot.card.name !== bewd.name || slot.position !== 'face_up_attack') {
    throw new Error('FAIL: Monster not revived in face_up_attack');
  }
  console.log('  PASS: Call of the Haunted revived Blue-Eyes White Dragon to attack position.');
}

// 13. Spellbinding Circle and Shadow Spell
console.log('Test 13: Spellbinding Circle & Shadow Spell restrict opponent monster...');
{
  const bewd = findCard('Blue-Eyes White Dragon');
  const circle = findCard('Spellbinding Circle');
  const shadow = findCard('Shadow Spell');
  const engine = makeEngine();
  engine.state.players[1].monsterZones[0] = { card: bewd, position: 'face_up_attack', currentAtk: 3000, currentDef: 2500 };

  resolveTrapEffect(engine.state, 0, circle);
  const slot = engine.state.players[1].monsterZones[0];
  if (slot.canAttack !== false || slot.canChangePosition !== false) {
    throw new Error('FAIL: Spellbinding Circle did not disable attack/position');
  }

  resolveTrapEffect(engine.state, 0, shadow);
  if (slot.currentAtk !== 2300) {
    throw new Error(`FAIL: Shadow Spell did not reduce ATK by 700! Got: ${slot.currentAtk}`);
  }
  console.log('  PASS: Spellbinding Circle and Shadow Spell restricted attacks and decreased ATK.');
}

// 14. Mask of Darkness (Flip: return trap from GY to hand)
console.log('Test 14: Mask of Darkness flip effect...');
{
  const mask = findCard('Mask of Darkness');
  const mirror = findCard('Mirror Force');
  const engine = makeEngine();
  engine.state.players[0].graveyard = [mirror];
  const res = resolveMonsterEffect(engine.state, 0, mask, 'flip');
  if (!res || !res.success || res.card.name !== mirror.name) {
    throw new Error('FAIL: Mask of Darkness did not return Mirror Force to hand');
  }
  if (!engine.state.players[0].hand.some(c => c.name === mirror.name)) {
    throw new Error('FAIL: Mirror Force not in hand');
  }
  console.log('  PASS: Mask of Darkness returned Mirror Force from GY to hand.');
}

// 15. Breaker the Magical Warrior (onSummon: +300 ATK)
console.log('Test 15: Breaker the Magical Warrior onSummon boost...');
{
  const breaker = findCard('Breaker the Magical Warrior');
  const engine = makeEngine();
  engine.state.players[0].hand = [breaker];
  engine.normalSummon(0, 0);
  const slot = engine.state.players[0].monsterZones[0];
  if (slot.currentAtk !== 1900) {
    throw new Error(`FAIL: Breaker did not gain +300 ATK! Got: ${slot.currentAtk}`);
  }
  console.log('  PASS: Breaker gained +300 ATK on summon (1600 -> 1900).');
}

// 16. Recruiter Monster (Mystic Tomato)
console.log('Test 16: Mystic Tomato onDestroy recruiter effect...');
{
  const tomato = findCard('Mystic Tomato');
  const sangan = findCard('Sangan'); // DARK <= 1500
  const engine = makeEngine();
  engine.state.players[0].deck = [sangan];
  const res = resolveMonsterEffect(engine.state, 0, tomato, 'onDestroy');
  if (!res || !res.success || res.summonedCard.name !== sangan.name) {
    throw new Error('FAIL: Mystic Tomato did not recruit Sangan');
  }
  const summoned = engine.state.players[0].monsterZones[res.zoneIndex];
  if (!summoned || summoned.card.name !== sangan.name) {
    throw new Error('FAIL: Sangan not on field');
  }
  console.log('  PASS: Mystic Tomato recruited Sangan to field on destruction.');
}

console.log('\n=== ALL 16 MECHANIC & CARD TESTS PASSED WITH 100% SUCCESS! ===');
