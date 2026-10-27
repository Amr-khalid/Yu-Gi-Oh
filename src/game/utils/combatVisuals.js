/**
 * combatVisuals.js
 * Comprehensive combat archetypes, visual styles, and killer-based destruction effects
 * for Yu-Gi-Oh! Mobile Edition.
 */

// Determine attack archetype based on monster race and attribute
export function resolveAttackArchetype(card) {
  if (!card) {
    return {
      archetype: 'pharaoh',
      beamClass: 'attack-ray ray-pharaoh pharaoh',
      burstClass: 'impact-burst burst-pharaoh pharaoh',
      hasSlashCut: false,
      hasPharaohSeal: true,
      soundAction: 'playMagicBlast',
      titleAr: 'شعاع عين حورس الفرعوني المقدس',
    };
  }

  const race = (card.race || '').toLowerCase();
  const attr = (card.attribute || '').toUpperCase();

  // 1. Warrior & Beast-Warrior (Blade / Sword Slash)
  if (race.includes('warrior') || race.includes('beast-warrior')) {
    return {
      archetype: 'warrior',
      beamClass: 'attack-ray ray-warrior',
      burstClass: 'impact-burst burst-warrior',
      hasSlashCut: true,
      soundAction: 'playSwordSlash',
      titleAr: 'سيف المحارب الخاطف',
    };
  }

  // 2. Dragons & Pyro (Draconic Flame Breath)
  if (race.includes('dragon') || race.includes('pyro') || attr === 'FIRE') {
    return {
      archetype: 'dragon',
      beamClass: 'attack-ray ray-dragon',
      burstClass: 'impact-burst burst-dragon',
      hasSlashCut: false,
      soundAction: 'playDragonRoar',
      titleAr: 'طوفان نيران التنين',
    };
  }

  // 3. Spellcasters (Arcane Rune Blast)
  if (race.includes('spellcaster')) {
    return {
      archetype: 'spellcaster',
      beamClass: 'attack-ray ray-spellcaster',
      burstClass: 'impact-burst burst-spellcaster',
      hasSlashCut: false,
      soundAction: 'playMagicBlast',
      titleAr: 'طلاسم المانا الغامضة',
    };
  }

  // 4. Light & Fairy (Solar Ray & Photon Spear)
  if (attr === 'LIGHT' || race.includes('fairy')) {
    return {
      archetype: 'light',
      beamClass: 'attack-ray ray-light light',
      burstClass: 'impact-burst burst-light light',
      hasSlashCut: false,
      soundAction: 'playMagicBlast',
      titleAr: 'رمح النور الشمسي الساطع',
    };
  }

  // 4. Machines (Cyber Tech Laser)
  if (race.includes('machine')) {
    return {
      archetype: 'machine',
      beamClass: 'attack-ray ray-machine',
      burstClass: 'impact-burst burst-machine',
      hasSlashCut: false,
      soundAction: 'playLaserShoot',
      titleAr: 'ليزر كهرومغناطيسي مركز',
    };
  }

  // 5. Fiend & Zombie (Abyssal Void Strike)
  if (race.includes('fiend') || race.includes('zombie') || attr === 'DARK') {
    return {
      archetype: 'fiend',
      beamClass: 'attack-ray ray-fiend',
      burstClass: 'impact-burst burst-fiend',
      hasSlashCut: false,
      soundAction: 'playDarkConsume',
      titleAr: 'لهب الهاوية المظلمة',
    };
  }

  // 6. Thunder (Lightning Arc)
  if (race.includes('thunder')) {
    return {
      archetype: 'thunder',
      beamClass: 'attack-ray ray-thunder',
      burstClass: 'impact-burst burst-thunder',
      hasSlashCut: false,
      soundAction: 'playElectrocute',
      titleAr: 'صاعقة رعدية مدمرة',
    };
  }

  // 7. Aqua, Fish, Sea Serpent (Hydro Torrent)
  if (race.includes('aqua') || race.includes('fish') || race.includes('sea serpent') || attr === 'WATER') {
    return {
      archetype: 'aqua',
      beamClass: 'attack-ray ray-aqua',
      burstClass: 'impact-burst burst-aqua',
      hasSlashCut: false,
      soundAction: 'playAttack',
      titleAr: 'طوفان هيدروليكي جارف',
    };
  }

  // 8. Rock, Dinosaur (Seismic Boulder / Quake)
  if (race.includes('rock') || race.includes('dinosaur') || attr === 'EARTH') {
    return {
      archetype: 'rock',
      beamClass: 'attack-ray ray-rock',
      burstClass: 'impact-burst burst-rock',
      hasSlashCut: false,
      soundAction: 'playStoneCrush',
      titleAr: 'زلزال صخري ساحق',
    };
  }

  // 9. Winged Beast (Sonic Wind Scythe)
  if (race.includes('winged beast') || attr === 'WIND') {
    return {
      archetype: 'wind',
      beamClass: 'attack-ray ray-wind',
      burstClass: 'impact-burst burst-wind',
      hasSlashCut: true,
      soundAction: 'playSwordSlash',
      titleAr: 'شفرات الرياح القاطعة',
    };
  }

  // 10. Divine / Egyptian Gods
  if (race.includes('divine') || attr === 'DIVINE') {
    return {
      archetype: 'divine',
      beamClass: 'attack-ray ray-divine',
      burstClass: 'impact-burst burst-divine',
      hasSlashCut: false,
      soundAction: 'playMagicBlast',
      titleAr: 'الحكم الإلهي المقدس',
    };
  }

  // Fallback default: Pharaonic Egyptian Sacred Solar Ray (عين حورس الفرعونية)
  return {
    archetype: 'pharaoh',
    beamClass: 'attack-ray ray-pharaoh pharaoh',
    burstClass: 'impact-burst burst-pharaoh pharaoh',
    hasSlashCut: false,
    hasPharaohSeal: true,
    soundAction: 'playMagicBlast',
    titleAr: 'شعاع عين حورس الفرعوني المقدس',
  };
}

// Determine defense shield style based on defender card and combat outcome
export function resolveDefenseArchetype(defenderCard, isBlocked, isShatter) {
  const race = (defenderCard?.race || '').toLowerCase();
  const attr = (defenderCard?.attribute || '').toUpperCase();

  let shieldType = 'iron_aegis';
  let titleAr = 'درع الصد الحصين';

  if (race.includes('machine')) {
    shieldType = 'cyber_grid';
    titleAr = 'حاجز كهرومغناطيسي سداسي';
  } else if (race.includes('spellcaster') || race.includes('fairy')) {
    shieldType = 'arcane_ward';
    titleAr = 'ختم الطلاسم السحرية الواقي';
  } else if (race.includes('dragon') || race.includes('pyro') || attr === 'FIRE') {
    shieldType = 'dragon_barrier';
    titleAr = 'قبة نيران التنين المانعة';
  } else if (race.includes('fiend') || race.includes('zombie') || attr === 'DARK') {
    shieldType = 'void_mirror';
    titleAr = 'مرآة الظلام الماصة';
  } else if (race.includes('aqua') || race.includes('fish') || attr === 'WATER') {
    shieldType = 'crystal_ice';
    titleAr = 'درع الجليد البلوري';
  } else if (race.includes('rock') || attr === 'EARTH') {
    shieldType = 'rock_bastion';
    titleAr = 'حصن الصخور الصلب';
  } else if (race.includes('divine') || attr === 'DIVINE') {
    shieldType = 'divine_aegis';
    titleAr = 'درع الأهرامات الإلهية';
  }

  return {
    shieldType,
    titleAr,
    isBlocked: !!isBlocked,
    isShatter: !!isShatter,
    soundAction: isShatter ? 'playShieldShatter' : 'playShieldDeflect',
  };
}

// Determine killer-based destruction animation
export function resolveDestructionByKiller(destroyedCard, killerCard) {
  if (!killerCard) {
    return {
      type: 'generic_destroy',
      badgeAr: '💀 تدمير في المعركة!',
      containerClass: 'card-destroying destroy-generic',
      particleClass: 'destroy-particles-burst',
      soundAction: 'playDestroy',
    };
  }

  const race = (killerCard.race || '').toLowerCase();
  const attr = (killerCard.attribute || '').toUpperCase();

  // 1. Killed by Warrior / Beast-Warrior: Sliced in half!
  if (race.includes('warrior') || race.includes('beast-warrior')) {
    return {
      type: 'sever_slash',
      badgeAr: `⚔️ شطر بسيف ${killerCard.name || 'المحارب'}!`,
      killerName: killerCard.name,
      containerClass: 'card-destroying destroy-sever-slash',
      soundAction: 'playSwordSlash',
    };
  }

  // 2. Killed by Dragon / Pyro / FIRE: Incinerated to ashes!
  if (race.includes('dragon') || race.includes('pyro') || attr === 'FIRE') {
    return {
      type: 'incinerate',
      badgeAr: `🔥 حرق بنيران ${killerCard.name || 'التنين'}!`,
      killerName: killerCard.name,
      containerClass: 'card-destroying destroy-incinerate',
      soundAction: 'playDragonRoar',
    };
  }

  // 3. Killed by Spellcaster / Fairy / LIGHT: Arcane disintegration!
  if (race.includes('spellcaster') || race.includes('fairy')) {
    return {
      type: 'arcane_dissolve',
      badgeAr: `✨ تفكك سحري بواسطة ${killerCard.name || 'الساحر'}!`,
      killerName: killerCard.name,
      containerClass: 'card-destroying destroy-arcane-dissolve',
      soundAction: 'playMagicBlast',
    };
  }

  // 4. Killed by Machine / Thunder: Cyber electrocute & glitch explosion!
  if (race.includes('machine') || race.includes('thunder')) {
    return {
      type: 'cyber_overload',
      badgeAr: `⚡ صدمة كهربية من ${killerCard.name || 'الآلة'}!`,
      killerName: killerCard.name,
      containerClass: 'card-destroying destroy-cyber-overload',
      soundAction: 'playElectrocute',
    };
  }

  // 5. Killed by Fiend / Zombie / DARK: Consumed by the shadow abyss!
  if (race.includes('fiend') || race.includes('zombie') || attr === 'DARK') {
    return {
      type: 'abyssal_vortex',
      badgeAr: `🌑 سحب إلى ظلام ${killerCard.name || 'الشيطان'}!`,
      killerName: killerCard.name,
      containerClass: 'card-destroying destroy-abyssal-vortex',
      soundAction: 'playDarkConsume',
    };
  }

  // 6. Killed by Aqua / Fish / Sea Serpent / WATER: Frozen shatter!
  if (race.includes('aqua') || race.includes('fish') || race.includes('sea serpent') || attr === 'WATER') {
    return {
      type: 'frost_shatter',
      badgeAr: `❄️ تحطم بلوري بواسطة ${killerCard.name || 'الوحش المائي'}!`,
      killerName: killerCard.name,
      containerClass: 'card-destroying destroy-frost-shatter',
      soundAction: 'playShieldShatter',
    };
  }

  // 7. Killed by Rock / Dinosaur / EARTH: Stone crush & crumble!
  if (race.includes('rock') || race.includes('dinosaur') || attr === 'EARTH') {
    return {
      type: 'stone_crush',
      badgeAr: `🪨 سحق زلزالي بواسطة ${killerCard.name || 'الوحش الصخري'}!`,
      killerName: killerCard.name,
      containerClass: 'card-destroying destroy-stone-crush',
      soundAction: 'playStoneCrush',
    };
  }

  // 8. Killed by Divine / Egyptian Gods: Divine judgment vaporization!
  if (race.includes('divine') || attr === 'DIVINE') {
    return {
      type: 'divine_judgment',
      badgeAr: `☀️ فناء إلهي مقدس بنور ${killerCard.name || 'الوحش الإلهي'}!`,
      killerName: killerCard.name,
      containerClass: 'card-destroying destroy-divine-judgment',
      soundAction: 'playMagicBlast',
    };
  }

  // Fallback default
  return {
    type: 'generic_destroy',
    badgeAr: `💀 تدمير المعركة بواسطة ${killerCard.name || 'الخصم'}!`,
    killerName: killerCard.name,
    containerClass: 'card-destroying destroy-generic',
    soundAction: 'playDestroy',
  };
}
