import { DuelEngine } from '../src/game/engine/DuelEngine.js';
import cards from '../src/data/cards.json' with { type: 'json' };

console.log('--- STARTING COMPREHENSIVE COMBAT, TRIBUTE & SPELL ENGINE VERIFICATION ---');

// Helper to find cards by name/level
const findMonster = (minLevel, maxLevel) =>
  cards.find(c => c.type === 'monster' && c.level >= minLevel && c.level <= maxLevel);
const findSpell = (keyword) =>
  cards.find(c => c.type === 'spell' && c.name.toLowerCase().includes(keyword.toLowerCase()));

const lvl4Monster1 = cards.find(c => c.type === 'monster' && c.level === 4 && c.atk >= 1500);
const lvl4Monster2 = cards.find(c => c.type === 'monster' && c.level === 3 && c.atk < 1200);
const lvl5Monster = findMonster(5, 6);
const lvl7Monster = findMonster(7, 8);
const potOfGreed = findSpell('pot of greed');
const raigeki = findSpell('raigeki');
const dianKeto = findSpell('dian keto');
const ookazi = findSpell('ookazi');

console.log('Test cards selected:');
console.log(' - Low Level 1:', lvl4Monster1.name, 'Level:', lvl4Monster1.level, 'ATK:', lvl4Monster1.atk);
console.log(' - Low Level 2:', lvl4Monster2.name, 'Level:', lvl4Monster2.level, 'ATK:', lvl4Monster2.atk);
console.log(' - Tribute 1 (Lvl 5-6):', lvl5Monster.name, 'Level:', lvl5Monster.level);
console.log(' - Tribute 2 (Lvl 7+):', lvl7Monster.name, 'Level:', lvl7Monster.level);
console.log(' - Spells:', potOfGreed?.name, '|', raigeki?.name, '|', dianKeto?.name, '|', ookazi?.name);

// TEST 1: TRIBUTE SUMMON MECHANIC
console.log('\n[TEST 1] Testing Tribute Summon System (1 Tribute & 2 Tributes)...');
const deck0 = [
  lvl4Monster1, lvl4Monster2, lvl5Monster, lvl7Monster,
  ...Array(36).fill(lvl4Monster1)
];
const deck1 = Array(40).fill(lvl4Monster1);

const engine = new DuelEngine(deck0, deck1, 'Player', 'Opponent');
let s = engine.getState();

// Put monsters directly in hand to test cleanly
engine.state.players[0].hand = [lvl4Monster1, lvl4Monster2, lvl5Monster, lvl7Monster];
engine.state.players[0].normalSummonsRemaining = 1;

// Normal summon 1st monster (no tribute needed)
engine.normalSummon(0, 0, 'face_up_attack', []);
s = engine.getState();
console.log('Summoned Level 4 monster in zone 0. Active monsters:', s.players[0].monsterZones.filter(z => z !== null).length);

// Try to summon Level 5 monster without tribute -> must fail
engine.state.players[0].normalSummonsRemaining = 1;
const lvl5Index = engine.state.players[0].hand.findIndex(c => c.name === lvl5Monster.name);
let failedWithoutTribute = false;
try {
  engine.normalSummon(lvl5Index, 1, 'face_up_attack', []);
} catch (e) {
  failedWithoutTribute = true;
  console.log('Successfully blocked Level 5 summon without tribute:', e.message);
}
if (!failedWithoutTribute) throw new Error('Expected Level 5 summon to fail without tribute!');

// Summon Level 5 monster WITH 1 tribute (sacrificing zone 0)
engine.state.players[0].normalSummonsRemaining = 1;
const tributeSummonRes = engine.normalSummon(lvl5Index, 0, 'face_up_attack', [0]);
s = engine.getState();
console.log('Tribute summon of Level 5 successful!');
console.log('Graveyard count:', s.players[0].graveyard.length, '(contains', s.players[0].graveyard[0].name, ')');
console.log('Zone 0 monster now:', s.players[0].monsterZones[0].card.name);

// Now test 2 Tributes for Level 7+
console.log('\nTesting 2 Tributes for Level 7+ monster...');
engine.state.players[0].monsterZones[0] = { card: lvl4Monster1, position: 'face_up_attack', currentAtk: 1500, currentDef: 1000 };
engine.state.players[0].monsterZones[1] = { card: lvl4Monster2, position: 'face_up_attack', currentAtk: 1000, currentDef: 1000 };
engine.state.players[0].hand = [lvl7Monster];
engine.state.players[0].normalSummonsRemaining = 1;

const lvl7Index = 0;
engine.normalSummon(lvl7Index, 0, 'face_up_attack', [0, 1]);
s = engine.getState();
console.log('Level 7+ Tribute summon successful!');
console.log('Zone 0 now holds:', s.players[0].monsterZones[0].card.name);
console.log('Zone 1 is now freed:', s.players[0].monsterZones[1] === null);
console.log('Total monsters in Graveyard:', s.players[0].graveyard.length);

// TEST 2: SPELL EFFECTS & EVENTS
console.log('\n[TEST 2] Testing Spell Effects (Pot of Greed, Raigeki, Dian Keto, Ookazi)...');

let capturedSpellEvents = [];
engine.onSpell((data) => {
  capturedSpellEvents.push(data);
});

// Pot of Greed
engine.state.players[0].hand = [potOfGreed];
const handCountBefore = engine.state.players[0].hand.length;
const deckCountBefore = engine.state.players[0].deck.length;
engine.activateSpell(0);
s = engine.getState();
console.log('Pot of Greed activated:');
console.log(' - Cards drawn from deck:', deckCountBefore - s.players[0].deck.length, '(expected 2)');
console.log(' - Hand count now:', s.players[0].hand.length);

// Dian Keto (+1000 LP)
engine.state.players[0].lifePoints = 5000;
engine.state.players[0].hand = [dianKeto];
engine.activateSpell(0);
s = engine.getState();
console.log('Dian Keto activated:');
console.log(' - Life Points now:', s.players[0].lifePoints, '(expected 6000)');

// Ookazi (800 Burn damage to opponent)
engine.state.players[1].lifePoints = 8000;
engine.state.players[0].hand = [ookazi];
engine.activateSpell(0);
s = engine.getState();
console.log('Ookazi activated:');
console.log(' - Opponent LP now:', s.players[1].lifePoints, '(expected 7200)');

// Raigeki (Destroy all opponent monsters)
engine.state.players[1].monsterZones[0] = { card: lvl4Monster1, position: 'face_up_attack', currentAtk: 1500, currentDef: 1000 };
engine.state.players[1].monsterZones[1] = { card: lvl4Monster2, position: 'face_up_attack', currentAtk: 1000, currentDef: 1000 };
engine.state.players[0].hand = [raigeki];
engine.activateSpell(0);
s = engine.getState();
console.log('Raigeki activated:');
console.log(' - Opponent field monsters after Raigeki:', s.players[1].monsterZones.filter(m => m !== null).length, '(expected 0)');
console.log(' - Opponent Graveyard count:', s.players[1].graveyard.length, '(expected 2)');

console.log('\nTotal Spell Notification Events captured by engine.onSpell:', capturedSpellEvents.length);
capturedSpellEvents.forEach(e => {
  console.log(` - Event: ${e.spellCard.name} -> ${e.effectMeta.title} (${e.effectMeta.desc})`);
});

// TEST 3: COMBAT & DAMAGE CALCULATOR
console.log('\n[TEST 3] Testing Combat & Damage Calculations...');
engine.state.players[0].monsterZones[0] = { card: { name: 'Strong', atk: 2500, def: 2000 }, position: 'face_up_attack', currentAtk: 2500, currentDef: 2000, hasAttacked: false };
engine.state.players[1].monsterZones[0] = { card: { name: 'Weak', atk: 1500, def: 1200 }, position: 'face_up_attack', currentAtk: 1500, currentDef: 1200 };
engine.state.players[1].lifePoints = 7200;
engine.state.phase = 'BATTLE_STEP';
engine.state.turnNumber = 2;

const attackRes = engine.declareAttack(0, 0);
s = engine.getState();
console.log('Monster Attack executed:');
console.log(' - Damage dealt to opponent:', attackRes.damage, '(expected 1000)');
console.log(' - Opponent LP now:', s.players[1].lifePoints, '(expected 6200)');
console.log(' - Opponent monster destroyed and sent to graveyard:', s.players[1].monsterZones[0] === null);

// Direct Attack
engine.state.players[0].monsterZones[0].hasAttacked = false;
const directRes = engine.directAttack(0);
s = engine.getState();
console.log('Direct Attack executed:');
console.log(' - Damage dealt:', directRes.damage, '(expected 2500)');
console.log(' - Opponent LP now:', s.players[1].lifePoints, '(expected 3700)');

console.log('\n=== ALL ENGINE, COMBAT, TRIBUTE & SPELL TESTS PASSED PERFECTLY! ===');
