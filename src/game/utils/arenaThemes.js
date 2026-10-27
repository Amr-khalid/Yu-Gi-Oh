/**
 * Yu-Gi-Oh! Mobile Edition - Arena & Duel Field Themes
 * Curated authentic battlefields with high-res backgrounds & ambient lighting
 * Supports seamless dynamic Day/Light Mode and Night/Dark Mode switching
 */

function toSvgDataUri(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim()).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29')}`;
}

// --- 1. KaibaCorp Stadium SVGs ---
let _kaibaSvg = null;
export function getKaibaCorpSvg() {
  if (_kaibaSvg) return _kaibaSvg;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="kc-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f223d"/>
        <stop offset="50%" stop-color="#16385c"/>
        <stop offset="100%" stop-color="#0e233d"/>
      </linearGradient>
      <radialGradient id="kc-core-glow" cx="50%" cy="55%" r="45%">
        <stop offset="0%" stop-color="rgba(56,189,248,0.7)"/>
        <stop offset="50%" stop-color="rgba(6,182,212,0.25)"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
      <pattern id="kc-hex-pat" width="60" height="104" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
        <path d="M30 0 L60 17.32 L60 51.96 L30 69.28 L0 51.96 L0 17.32 Z" fill="none" stroke="rgba(56,189,248,0.3)" stroke-width="1.3"/>
        <path d="M30 69.28 L60 86.6 L60 121.24 L30 138.56 L0 121.24 L0 86.6 Z" fill="none" stroke="rgba(56,189,248,0.3)" stroke-width="1.3"/>
      </pattern>
    </defs>
    <rect width="1920" height="1080" fill="url(#kc-sky)"/>
    <path d="M 0 540 Q 960 260 1920 540 L 1920 1080 L 0 1080 Z" fill="#0b1e33"/>
    <polygon points="260,1080 340,1080 500,0 440,0" fill="rgba(56,189,248,0.12)"/>
    <polygon points="1660,1080 1580,1080 1420,0 1480,0" fill="rgba(56,189,248,0.12)"/>
    <polygon points="820,1080 860,1080 940,0 920,0" fill="rgba(56,189,248,0.15)"/>
    <polygon points="1100,1080 1060,1080 980,0 1000,0" fill="rgba(56,189,248,0.15)"/>
    <rect y="480" width="1920" height="600" fill="url(#kc-hex-pat)" opacity="0.75"/>
    <g stroke="rgba(56,189,248,0.6)" stroke-width="1.8">
      <line x1="960" y1="500" x2="0" y2="1080"/>
      <line x1="960" y1="500" x2="300" y2="1080"/>
      <line x1="960" y1="500" x2="600" y2="1080"/>
      <line x1="960" y1="500" x2="800" y2="1080"/>
      <line x1="960" y1="500" x2="960" y2="1080" stroke="#38bdf8" stroke-width="2.5"/>
      <line x1="960" y1="500" x2="1120" y2="1080"/>
      <line x1="960" y1="500" x2="1320" y2="1080"/>
      <line x1="960" y1="500" x2="1620" y2="1080"/>
      <line x1="960" y1="500" x2="1920" y2="1080"/>
      <line x1="720" y1="540" x2="1200" y2="540" opacity="0.45"/>
      <line x1="620" y1="600" x2="1320" y2="600" opacity="0.55"/>
      <line x1="480" y1="690" x2="1460" y2="690" opacity="0.65"/>
      <line x1="280" y1="820" x2="1660" y2="820" opacity="0.75"/>
      <line x1="60" y1="990" x2="1880" y2="990" opacity="0.9"/>
    </g>
    <rect width="1920" height="1080" fill="url(#kc-core-glow)"/>
    <g transform="translate(960, 520) scale(1.1)">
      <circle r="120" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-dasharray="14 10"/>
      <circle r="140" fill="none" stroke="rgba(56,189,248,0.5)" stroke-width="2" stroke-dasharray="4 8"/>
      <circle r="90" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <path d="M -45 -40 L -45 40 M -45 0 L -15 -40 M -45 0 L -15 40" stroke="#38bdf8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M 40 -35 C 10 -40 -10 -25 -10 0 C -10 25 10 40 40 35" stroke="#38bdf8" stroke-width="7" stroke-linecap="round" fill="none"/>
      <text x="0" y="80" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="900" letter-spacing="4">KAIBA CORPORATION</text>
    </g>
    <g transform="translate(240, 500)" stroke="rgba(6,182,212,0.4)" fill="none">
      <circle r="60" stroke-width="1.5" stroke-dasharray="6 4"/>
      <circle r="45" stroke-width="1"/>
      <line x1="-70" y1="0" x2="70" y2="0"/>
      <line x1="0" y1="-70" x2="0" y2="70"/>
      <text x="0" y="80" text-anchor="middle" fill="rgba(6,182,212,0.8)" font-family="sans-serif" font-size="11" font-weight="800">HOLOGRAM SYS-01</text>
    </g>
    <g transform="translate(1680, 500)" stroke="rgba(6,182,212,0.4)" fill="none">
      <circle r="60" stroke-width="1.5" stroke-dasharray="6 4"/>
      <circle r="45" stroke-width="1"/>
      <line x1="-70" y1="0" x2="70" y2="0"/>
      <line x1="0" y1="-70" x2="0" y2="70"/>
      <text x="0" y="80" text-anchor="middle" fill="rgba(6,182,212,0.8)" font-family="sans-serif" font-size="11" font-weight="800">HOLOGRAM SYS-02</text>
    </g>
  </svg>`;
  _kaibaSvg = toSvgDataUri(svg);
  return _kaibaSvg;
}

let _kaibaLightSvg = null;
export function getKaibaCorpLightSvg() {
  if (_kaibaLightSvg) return _kaibaLightSvg;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="kcl-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#bae6fd"/>
      </linearGradient>
      <radialGradient id="kcl-glow" cx="50%" cy="55%" r="45%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.7)"/>
        <stop offset="50%" stop-color="rgba(56,189,248,0.2)"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
      <pattern id="kcl-hex-pat" width="60" height="104" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
        <path d="M30 0 L60 17.32 L60 51.96 L30 69.28 L0 51.96 L0 17.32 Z" fill="none" stroke="rgba(2,132,199,0.25)" stroke-width="1.2"/>
        <path d="M30 69.28 L60 86.6 L60 121.24 L30 138.56 L0 121.24 L0 86.6 Z" fill="none" stroke="rgba(2,132,199,0.25)" stroke-width="1.2"/>
      </pattern>
      <linearGradient id="kcl-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="50%" stop-color="#f0f9ff"/>
        <stop offset="100%" stop-color="#e0f2fe"/>
      </linearGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#kcl-sky)"/>
    <path d="M 0 540 Q 960 260 1920 540 L 1920 1080 L 0 1080 Z" fill="url(#kcl-floor)"/>
    <polygon points="260,1080 340,1080 500,0 440,0" fill="rgba(255,255,255,0.4)"/>
    <polygon points="1660,1080 1580,1080 1420,0 1480,0" fill="rgba(255,255,255,0.4)"/>
    <polygon points="820,1080 860,1080 940,0 920,0" fill="rgba(56,189,248,0.15)"/>
    <polygon points="1100,1080 1060,1080 980,0 1000,0" fill="rgba(56,189,248,0.15)"/>
    <rect y="480" width="1920" height="600" fill="url(#kcl-hex-pat)" opacity="0.7"/>
    <g stroke="rgba(2,132,199,0.5)" stroke-width="1.8">
      <line x1="960" y1="500" x2="0" y2="1080"/>
      <line x1="960" y1="500" x2="300" y2="1080"/>
      <line x1="960" y1="500" x2="600" y2="1080"/>
      <line x1="960" y1="500" x2="800" y2="1080"/>
      <line x1="960" y1="500" x2="960" y2="1080" stroke="#0284c7" stroke-width="2.5"/>
      <line x1="960" y1="500" x2="1120" y2="1080"/>
      <line x1="960" y1="500" x2="1320" y2="1080"/>
      <line x1="960" y1="500" x2="1620" y2="1080"/>
      <line x1="960" y1="500" x2="1920" y2="1080"/>
      <line x1="720" y1="540" x2="1200" y2="540" opacity="0.4"/>
      <line x1="620" y1="600" x2="1320" y2="600" opacity="0.5"/>
      <line x1="480" y1="690" x2="1460" y2="690" opacity="0.6"/>
      <line x1="280" y1="820" x2="1660" y2="820" opacity="0.7"/>
      <line x1="60" y1="990" x2="1880" y2="990" opacity="0.85"/>
    </g>
    <rect width="1920" height="1080" fill="url(#kcl-glow)"/>
    <g transform="translate(960, 520) scale(1.1)">
      <circle r="120" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="14 10"/>
      <circle r="140" fill="none" stroke="rgba(56,189,248,0.5)" stroke-width="2" stroke-dasharray="4 8"/>
      <circle r="90" fill="#ffffff" stroke="#0284c7" stroke-width="3"/>
      <path d="M -45 -40 L -45 40 M -45 0 L -15 -40 M -45 0 L -15 40" stroke="#0284c7" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M 40 -35 C 10 -40 -10 -25 -10 0 C -10 25 10 40 40 35" stroke="#0284c7" stroke-width="7" stroke-linecap="round" fill="none"/>
      <text x="0" y="80" text-anchor="middle" fill="#0369a1" font-family="sans-serif" font-size="14" font-weight="900" letter-spacing="4">KAIBA CORPORATION</text>
    </g>
    <g transform="translate(240, 500)" stroke="#0284c7" fill="none">
      <circle r="60" stroke-width="1.8" stroke-dasharray="6 4"/>
      <circle r="45" stroke-width="1.2"/>
      <line x1="-70" y1="0" x2="70" y2="0"/>
      <line x1="0" y1="-70" x2="0" y2="70"/>
      <text x="0" y="80" text-anchor="middle" fill="#0369a1" font-family="sans-serif" font-size="11" font-weight="800">HOLOGRAM SYS-01</text>
    </g>
    <g transform="translate(1680, 500)" stroke="#0284c7" fill="none">
      <circle r="60" stroke-width="1.8" stroke-dasharray="6 4"/>
      <circle r="45" stroke-width="1.2"/>
      <line x1="-70" y1="0" x2="70" y2="0"/>
      <line x1="0" y1="-70" x2="0" y2="70"/>
      <text x="0" y="80" text-anchor="middle" fill="#0369a1" font-family="sans-serif" font-size="11" font-weight="800">HOLOGRAM SYS-02</text>
    </g>
  </svg>`;
  _kaibaLightSvg = toSvgDataUri(svg);
  return _kaibaLightSvg;
}

// --- 2. Cyber Matrix SVGs ---
let _matrixSvg = null;
export function getCyberMatrixSvg() {
  if (_matrixSvg) return _matrixSvg;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="cm-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#011409"/>
        <stop offset="60%" stop-color="#022312"/>
        <stop offset="100%" stop-color="#011208"/>
      </linearGradient>
      <radialGradient id="cm-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(16,185,129,0.3)"/>
        <stop offset="60%" stop-color="rgba(5,150,105,0.08)"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#cm-bg)"/>
    <g fill="rgba(52,211,153,0.35)" font-family="monospace" font-size="14" font-weight="bold">
      <text x="120" y="80">01011001 55AA 7F</text>
      <text x="120" y="110">11001010 FF02 C4</text>
      <text x="120" y="140">00101101 DUEL_SYS</text>
      <text x="380" y="120">SYSTEM_CORE: OK</text>
      <text x="380" y="150">VIRTUAL_MATRIX_09</text>
      <text x="750" y="70">NOAH_CYBER_DOMAIN</text>
      <text x="1450" y="90">01101001 88BB EF</text>
      <text x="1450" y="120">DATA_BUS_ACTIVE</text>
      <text x="1720" y="130">0x8F44A291</text>
    </g>
    <g stroke="rgba(16,185,129,0.45)" stroke-width="1.5">
      <line x1="960" y1="460" x2="-200" y2="1080"/>
      <line x1="960" y1="460" x2="150" y2="1080"/>
      <line x1="960" y1="460" x2="500" y2="1080"/>
      <line x1="960" y1="460" x2="800" y2="1080"/>
      <line x1="960" y1="460" x2="960" y2="1080" stroke="rgba(52,211,153,0.8)" stroke-width="2.5"/>
      <line x1="960" y1="460" x2="1120" y2="1080"/>
      <line x1="960" y1="460" x2="1420" y2="1080"/>
      <line x1="960" y1="460" x2="1770" y2="1080"/>
      <line x1="960" y1="460" x2="2120" y2="1080"/>
      <line x1="780" y1="500" x2="1140" y2="500" opacity="0.3"/>
      <line x1="680" y1="560" x2="1240" y2="560" opacity="0.4"/>
      <line x1="520" y1="650" x2="1400" y2="650" opacity="0.55"/>
      <line x1="300" y1="780" x2="1620" y2="780" opacity="0.7"/>
      <line x1="50" y1="960" x2="1870" y2="960" opacity="0.85"/>
    </g>
    <g stroke="#34d399" stroke-width="1.5" fill="none" opacity="0.45">
      <polygon points="960,340 1020,310 1020,380 960,410" fill="rgba(16,185,129,0.15)"/>
      <polygon points="960,340 900,310 900,380 960,410" fill="rgba(5,150,105,0.15)"/>
      <polygon points="960,340 1020,310 960,280 900,310" fill="rgba(52,211,153,0.2)"/>
    </g>
    <rect width="1920" height="1080" fill="url(#cm-glow)"/>
    <circle cx="960" cy="460" r="180" fill="none" stroke="rgba(16,185,129,0.3)" stroke-width="2" stroke-dasharray="10 6"/>
    <circle cx="960" cy="460" r="100" fill="none" stroke="rgba(52,211,153,0.6)" stroke-width="2"/>
  </svg>`;
  _matrixSvg = toSvgDataUri(svg);
  return _matrixSvg;
}

let _matrixLightSvg = null;
export function getCyberMatrixLightSvg() {
  if (_matrixLightSvg) return _matrixLightSvg;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="cml-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f0fdf4"/>
        <stop offset="50%" stop-color="#dcfce7"/>
        <stop offset="100%" stop-color="#bbf7d0"/>
      </linearGradient>
      <radialGradient id="cml-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(16,185,129,0.2)"/>
        <stop offset="60%" stop-color="rgba(5,150,105,0.06)"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#cml-bg)"/>
    <g fill="#047857" font-family="monospace" font-size="14" font-weight="bold">
      <text x="120" y="80">01011001 55AA 7F</text>
      <text x="120" y="110">11001010 FF02 C4</text>
      <text x="120" y="140">00101101 DUEL_SYS</text>
      <text x="380" y="120">SYSTEM_CORE: OK</text>
      <text x="380" y="150">VIRTUAL_MATRIX_09</text>
      <text x="750" y="70">NOAH_CYBER_DOMAIN</text>
      <text x="1450" y="90">01101001 88BB EF</text>
      <text x="1450" y="120">DATA_BUS_ACTIVE</text>
      <text x="1720" y="130">0x8F44A291</text>
    </g>
    <g stroke="#059669" stroke-width="1.8">
      <line x1="960" y1="460" x2="-200" y2="1080"/>
      <line x1="960" y1="460" x2="150" y2="1080"/>
      <line x1="960" y1="460" x2="500" y2="1080"/>
      <line x1="960" y1="460" x2="800" y2="1080"/>
      <line x1="960" y1="460" x2="960" y2="1080" stroke="#047857" stroke-width="3"/>
      <line x1="960" y1="460" x2="1120" y2="1080"/>
      <line x1="960" y1="460" x2="1420" y2="1080"/>
      <line x1="960" y1="460" x2="1770" y2="1080"/>
      <line x1="960" y1="460" x2="2120" y2="1080"/>
      <line x1="780" y1="500" x2="1140" y2="500" opacity="0.4"/>
      <line x1="680" y1="560" x2="1240" y2="560" opacity="0.5"/>
      <line x1="520" y1="650" x2="1400" y2="650" opacity="0.6"/>
      <line x1="300" y1="780" x2="1620" y2="780" opacity="0.75"/>
      <line x1="50" y1="960" x2="1870" y2="960" opacity="0.9"/>
    </g>
    <g stroke="#047857" stroke-width="2" fill="none">
      <polygon points="960,340 1020,310 1020,380 960,410" fill="rgba(16,185,129,0.2)"/>
      <polygon points="960,340 900,310 900,380 960,410" fill="rgba(5,150,105,0.2)"/>
      <polygon points="960,340 1020,310 960,280 900,310" fill="rgba(52,211,153,0.25)"/>
    </g>
    <rect width="1920" height="1080" fill="url(#cml-glow)"/>
    <circle cx="960" cy="460" r="180" fill="none" stroke="#059669" stroke-width="2.5" stroke-dasharray="10 6"/>
    <circle cx="960" cy="460" r="100" fill="none" stroke="#047857" stroke-width="3"/>
  </svg>`;
  _matrixLightSvg = toSvgDataUri(svg);
  return _matrixLightSvg;
}

// --- 3. Orichalcos Atlantis SVGs ---
let _atlantisSvg = null;
export function getOrichalcosAtlantisSvg() {
  if (_atlantisSvg) return _atlantisSvg;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="ori-abyss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#021f24"/>
        <stop offset="60%" stop-color="#04323b"/>
        <stop offset="100%" stop-color="#02191d"/>
      </linearGradient>
      <radialGradient id="ori-glow" cx="50%" cy="58%" r="45%">
        <stop offset="0%" stop-color="rgba(20,184,166,0.5)"/>
        <stop offset="40%" stop-color="rgba(13,148,136,0.2)"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#ori-abyss)"/>
    <polygon points="400,0 520,0 650,1080 480,1080" fill="rgba(45,212,191,0.08)"/>
    <polygon points="850,0 950,0 1080,1080 930,1080" fill="rgba(45,212,191,0.12)"/>
    <polygon points="1350,0 1480,0 1560,1080 1400,1080" fill="rgba(45,212,191,0.08)"/>
    <g fill="#022127" stroke="rgba(20,184,166,0.4)" stroke-width="2">
      <rect x="80" y="240" width="110" height="840" rx="6"/>
      <rect x="65" y="220" width="140" height="25" rx="3" fill="#032e36"/>
      <rect x="230" y="320" width="90" height="760" rx="5"/>
      <rect x="220" y="305" width="110" height="20" rx="3" fill="#032e36"/>
      <rect x="1730" y="240" width="110" height="840" rx="6"/>
      <rect x="1715" y="220" width="140" height="25" rx="3" fill="#032e36"/>
      <rect x="1600" y="320" width="90" height="760" rx="5"/>
      <rect x="1590" y="305" width="110" height="20" rx="3" fill="#032e36"/>
    </g>
    <polygon points="0,720 1920,720 1920,1080 0,1080" fill="#021c21" stroke="rgba(20,184,166,0.3)" stroke-width="1.5"/>
    <rect width="1920" height="1080" fill="url(#ori-glow)"/>
    <g transform="translate(960, 620) scale(1.3)" stroke="#14b8a6" fill="none">
      <circle r="140" stroke-width="3" stroke-dasharray="18 8"/>
      <circle r="125" stroke-width="1.8"/>
      <circle r="115" stroke-width="2.5"/>
      <polygon points="0,-110 95.26,55 -95.26,55" stroke="#2dd4bf" stroke-width="3.5" fill="rgba(20,184,166,0.06)"/>
      <polygon points="0,110 95.26,-55 -95.26,-55" stroke="#2dd4bf" stroke-width="3.5" fill="rgba(20,184,166,0.06)"/>
      <circle r="40" stroke="#5eead4" stroke-width="2.5" fill="rgba(13,148,136,0.2)"/>
      <circle r="12" fill="#2dd4bf"/>
    </g>
    <g fill="rgba(45,212,191,0.5)">
      <circle cx="580" cy="400" r="4"/><circle cx="620" cy="350" r="6"/><circle cx="710" cy="520" r="3"/>
      <circle cx="1250" cy="420" r="5"/><circle cx="1340" cy="370" r="3"/><circle cx="1400" cy="490" r="4"/>
    </g>
  </svg>`;
  _atlantisSvg = toSvgDataUri(svg);
  return _atlantisSvg;
}

let _atlantisLightSvg = null;
export function getOrichalcosAtlantisLightSvg() {
  if (_atlantisLightSvg) return _atlantisLightSvg;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="oril-abyss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#042f2e"/>
        <stop offset="40%" stop-color="#0f766e"/>
        <stop offset="80%" stop-color="#14b8a6"/>
        <stop offset="100%" stop-color="#99f6e4"/>
      </linearGradient>
      <radialGradient id="oril-glow" cx="50%" cy="58%" r="45%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.6)"/>
        <stop offset="40%" stop-color="rgba(45,212,191,0.25)"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#oril-abyss)"/>
    <polygon points="400,0 520,0 650,1080 480,1080" fill="rgba(255,255,255,0.15)"/>
    <polygon points="850,0 950,0 1080,1080 930,1080" fill="rgba(255,255,255,0.2)"/>
    <polygon points="1350,0 1480,0 1560,1080 1400,1080" fill="rgba(255,255,255,0.15)"/>
    <g fill="#f0fdfa" stroke="#0f766e" stroke-width="2">
      <rect x="80" y="240" width="110" height="840" rx="6"/>
      <rect x="65" y="220" width="140" height="25" rx="3" fill="#ccfbf1"/>
      <rect x="230" y="320" width="90" height="760" rx="5"/>
      <rect x="220" y="305" width="110" height="20" rx="3" fill="#ccfbf1"/>
      <rect x="1730" y="240" width="110" height="840" rx="6"/>
      <rect x="1715" y="220" width="140" height="25" rx="3" fill="#ccfbf1"/>
      <rect x="1600" y="320" width="90" height="760" rx="5"/>
      <rect x="1590" y="305" width="110" height="20" rx="3" fill="#ccfbf1"/>
    </g>
    <polygon points="0,720 1920,720 1920,1080 0,1080" fill="#ccfbf1" stroke="#0f766e" stroke-width="2"/>
    <rect width="1920" height="1080" fill="url(#oril-glow)"/>
    <g transform="translate(960, 620) scale(1.3)" stroke="#0f766e" fill="none">
      <circle r="140" stroke-width="3" stroke-dasharray="18 8"/>
      <circle r="125" stroke-width="2"/>
      <circle r="115" stroke-width="2.5"/>
      <polygon points="0,-110 95.26,55 -95.26,55" stroke="#0d9488" stroke-width="3.5" fill="rgba(45,212,191,0.15)"/>
      <polygon points="0,110 95.26,-55 -95.26,-55" stroke="#0d9488" stroke-width="3.5" fill="rgba(45,212,191,0.15)"/>
      <circle r="40" stroke="#0f766e" stroke-width="3" fill="#ffffff"/>
      <circle r="12" fill="#0d9488"/>
    </g>
  </svg>`;
  _atlantisLightSvg = toSvgDataUri(svg);
  return _atlantisLightSvg;
}

// --- 4. Machine Fortress SVGs ---
let _machineSvg = null;
export function getMachineFortressSvg() {
  if (_machineSvg) return _machineSvg;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="mf-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f0f12"/>
        <stop offset="50%" stop-color="#18181b"/>
        <stop offset="100%" stop-color="#100f13"/>
      </linearGradient>
      <radialGradient id="mf-furnace" cx="50%" cy="60%" r="45%">
        <stop offset="0%" stop-color="rgba(249,115,22,0.65)"/>
        <stop offset="40%" stop-color="rgba(234,88,12,0.25)"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
      <pattern id="mf-hazard" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="20" height="40" fill="#f59e0b"/>
        <rect x="20" width="20" height="40" fill="#18181b"/>
      </pattern>
    </defs>
    <rect width="1920" height="1080" fill="url(#mf-dark)"/>
    <g stroke="#3f3f46" stroke-width="3" fill="none">
      <line x1="0" y1="120" x2="1920" y2="120"/>
      <line x1="0" y1="180" x2="1920" y2="180"/>
      <line x1="0" y1="120" x2="80" y2="180"/><line x1="80" y1="180" x2="160" y2="120"/>
      <line x1="160" y1="120" x2="240" y2="180"/><line x1="240" y1="180" x2="320" y2="120"/>
      <line x1="1600" y1="120" x2="1680" y2="180"/><line x1="1680" y1="180" x2="1760" y2="120"/>
      <line x1="1760" y1="120" x2="1840" y2="180"/><line x1="1840" y1="180" x2="1920" y2="120"/>
    </g>
    <rect x="0" y="1050" width="1920" height="30" fill="url(#mf-hazard)" opacity="0.65"/>
    <rect x="0" y="0" width="1920" height="15" fill="url(#mf-hazard)" opacity="0.4"/>
    <g transform="translate(320, 520)" fill="#27272a" stroke="#d97706" stroke-width="3">
      <circle r="180" fill="#1c1917"/>
      <path d="M-20,-195 L20,-195 L15,-175 L-15,-175 Z" fill="#d97706"/>
      <path d="M-20,195 L20,195 L15,175 L-15,175 Z" fill="#d97706"/>
      <path d="M-195,-20 L-195,20 L-175,15 L-175,-15 Z" fill="#d97706"/>
      <path d="M195,-20 L195,20 L175,15 L175,-15 Z" fill="#d97706"/>
      <circle r="120" fill="none" stroke="#d97706" stroke-width="4"/>
      <circle r="60" fill="#292524" stroke="#f59e0b" stroke-width="3"/>
    </g>
    <g transform="translate(1600, 520)" fill="#27272a" stroke="#d97706" stroke-width="3">
      <circle r="180" fill="#1c1917"/>
      <path d="M-20,-195 L20,-195 L15,-175 L-15,-175 Z" fill="#d97706"/>
      <path d="M-20,195 L20,195 L15,175 L-15,175 Z" fill="#d97706"/>
      <path d="M-195,-20 L-195,20 L-175,15 L-175,-15 Z" fill="#d97706"/>
      <path d="M195,-20 L195,20 L175,15 L175,-15 Z" fill="#d97706"/>
      <circle r="120" fill="none" stroke="#d97706" stroke-width="4"/>
      <circle r="60" fill="#292524" stroke="#f59e0b" stroke-width="3"/>
    </g>
    <rect width="1920" height="1080" fill="url(#mf-furnace)"/>
    <g transform="translate(960, 540) scale(1.1)">
      <circle r="130" fill="#18181b" stroke="#f97316" stroke-width="4"/>
      <circle r="95" fill="none" stroke="#ea580c" stroke-width="3" stroke-dasharray="14 8"/>
      <circle r="65" fill="#f97316"/>
      <circle r="40" fill="#fed7aa"/>
      <line x1="-120" y1="0" x2="-80" y2="0" stroke="#f97316" stroke-width="5"/>
      <line x1="80" y1="0" x2="120" y2="0" stroke="#f97316" stroke-width="5"/>
      <line x1="0" y1="-120" x2="0" y2="-80" stroke="#f97316" stroke-width="5"/>
      <line x1="0" y1="80" x2="0" y2="120" stroke="#f97316" stroke-width="5"/>
    </g>
  </svg>`;
  _machineSvg = toSvgDataUri(svg);
  return _machineSvg;
}

let _machineLightSvg = null;
export function getMachineFortressLightSvg() {
  if (_machineLightSvg) return _machineLightSvg;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="mfl-light" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#52525b"/>
        <stop offset="50%" stop-color="#a1a1aa"/>
        <stop offset="100%" stop-color="#f4f4f5"/>
      </linearGradient>
      <radialGradient id="mfl-furnace" cx="50%" cy="60%" r="45%">
        <stop offset="0%" stop-color="rgba(249,115,22,0.5)"/>
        <stop offset="40%" stop-color="rgba(234,88,12,0.18)"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
      <pattern id="mfl-hazard" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="20" height="40" fill="#f59e0b"/>
        <rect x="20" width="20" height="40" fill="#27272a"/>
      </pattern>
    </defs>
    <rect width="1920" height="1080" fill="url(#mfl-light)"/>
    <g stroke="#3f3f46" stroke-width="3" fill="none">
      <line x1="0" y1="120" x2="1920" y2="120"/>
      <line x1="0" y1="180" x2="1920" y2="180"/>
      <line x1="0" y1="120" x2="80" y2="180"/><line x1="80" y1="180" x2="160" y2="120"/>
      <line x1="160" y1="120" x2="240" y2="180"/><line x1="240" y1="180" x2="320" y2="120"/>
      <line x1="1600" y1="120" x2="1680" y2="180"/><line x1="1680" y1="180" x2="1760" y2="120"/>
      <line x1="1760" y1="120" x2="1840" y2="180"/><line x1="1840" y1="180" x2="1920" y2="120"/>
    </g>
    <rect x="0" y="1050" width="1920" height="30" fill="url(#mfl-hazard)" opacity="0.8"/>
    <rect x="0" y="0" width="1920" height="15" fill="url(#mfl-hazard)" opacity="0.6"/>
    <g transform="translate(320, 520)" fill="#e4e4e7" stroke="#d97706" stroke-width="3">
      <circle r="180" fill="#f4f4f5"/>
      <path d="M-20,-195 L20,-195 L15,-175 L-15,-175 Z" fill="#d97706"/>
      <path d="M-20,195 L20,195 L15,175 L-15,175 Z" fill="#d97706"/>
      <circle r="120" fill="none" stroke="#d97706" stroke-width="4"/>
      <circle r="60" fill="#ffffff" stroke="#f59e0b" stroke-width="3"/>
    </g>
    <g transform="translate(1600, 520)" fill="#e4e4e7" stroke="#d97706" stroke-width="3">
      <circle r="180" fill="#f4f4f5"/>
      <path d="M-20,-195 L20,-195 L15,-175 L-15,-175 Z" fill="#d97706"/>
      <path d="M-20,195 L20,195 L15,175 L-15,175 Z" fill="#d97706"/>
      <circle r="120" fill="none" stroke="#d97706" stroke-width="4"/>
      <circle r="60" fill="#ffffff" stroke="#f59e0b" stroke-width="3"/>
    </g>
    <rect width="1920" height="1080" fill="url(#mfl-furnace)"/>
    <g transform="translate(960, 540) scale(1.1)">
      <circle r="130" fill="#ffffff" stroke="#f97316" stroke-width="4"/>
      <circle r="95" fill="none" stroke="#ea580c" stroke-width="3" stroke-dasharray="14 8"/>
      <circle r="65" fill="#f97316"/>
      <circle r="40" fill="#fed7aa"/>
    </g>
  </svg>`;
  _machineLightSvg = toSvgDataUri(svg);
  return _machineLightSvg;
}

// --- 5. Dragon Crag SVGs ---
let _dragonSvg = null;
export function getDragonCragSvg() {
  if (_dragonSvg) return _dragonSvg;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="dc-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#11091f"/>
        <stop offset="50%" stop-color="#2a0d2e"/>
        <stop offset="100%" stop-color="#120610"/>
      </linearGradient>
      <radialGradient id="dc-magma" cx="50%" cy="75%" r="55%">
        <stop offset="0%" stop-color="rgba(239,68,68,0.7)"/>
        <stop offset="40%" stop-color="rgba(185,28,28,0.25)"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#dc-sky)"/>
    <g stroke="rgba(251,191,36,0.8)" stroke-width="2" stroke-linecap="round">
      <line x1="300" y1="80" x2="160" y2="240" stroke-width="3"/>
      <line x1="900" y1="40" x2="720" y2="220" stroke-width="2"/>
      <line x1="1500" y1="60" x2="1320" y2="260" stroke-width="3.5"/>
      <line x1="1750" y1="120" x2="1620" y2="260" stroke-width="1.8"/>
    </g>
    <polygon points="0,580 320,380 640,560 960,340 1280,540 1600,360 1920,560 1920,1080 0,1080" fill="#14091a"/>
    <polygon points="60,1080 180,360 220,390 190,520 280,1080" fill="#0d0512" stroke="rgba(239,68,68,0.4)" stroke-width="2"/>
    <polygon points="180,360 240,480 200,680 340,1080" fill="#180a22"/>
    <polygon points="1860,1080 1740,360 1700,390 1730,520 1640,1080" fill="#0d0512" stroke="rgba(239,68,68,0.4)" stroke-width="2"/>
    <polygon points="1740,360 1680,480 1720,680 1580,1080" fill="#180a22"/>
    <rect width="1920" height="1080" fill="url(#dc-magma)"/>
    <g stroke="#f97316" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M 400 850 Q 600 780 960 820 T 1520 860"/>
      <path d="M 700 800 L 780 920 M 1150 810 L 1240 930" stroke="#fde047" stroke-width="3"/>
      <path d="M 960 760 L 960 980" stroke="#ef4444" stroke-width="5"/>
      <path d="M 850 880 Q 960 920 1070 880" stroke="#f59e0b" stroke-width="4"/>
    </g>
    <g transform="translate(960, 400) scale(0.9)" fill="none" stroke="#f43f5e" stroke-width="2.5">
      <path d="M -90 40 C -80 -20 -30 -60 0 -90 C 30 -60 80 -20 90 40 C 40 20 20 10 0 30 C -20 10 -40 20 -90 40 Z" fill="rgba(225,29,72,0.15)"/>
      <circle cx="0" cy="-35" r="14" fill="#fbbf24"/>
      <path d="M -140 10 Q -60 -40 0 -35 Q 60 -40 140 10" stroke="#fbbf24" stroke-width="2"/>
    </g>
  </svg>`;
  _dragonSvg = toSvgDataUri(svg);
  return _dragonSvg;
}

let _dragonLightSvg = null;
export function getDragonCragLightSvg() {
  if (_dragonLightSvg) return _dragonLightSvg;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="dcl-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="45%" stop-color="#ea580c"/>
        <stop offset="85%" stop-color="#fde047"/>
        <stop offset="100%" stop-color="#ffedd5"/>
      </linearGradient>
      <radialGradient id="dcl-sun" cx="50%" cy="30%" r="45%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="35%" stop-color="rgba(254,240,138,0.7)"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#dcl-sky)"/>
    <rect width="1920" height="1080" fill="url(#dcl-sun)"/>
    <polygon points="0,580 320,380 640,560 960,340 1280,540 1600,360 1920,560 1920,1080 0,1080" fill="#7c2d12" stroke="#ea580c" stroke-width="2"/>
    <polygon points="60,1080 180,360 220,390 190,520 280,1080" fill="#9a3412"/>
    <polygon points="1860,1080 1740,360 1700,390 1730,520 1640,1080" fill="#9a3412"/>
    <g stroke="#f59e0b" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M 400 850 Q 600 780 960 820 T 1520 860"/>
      <path d="M 960 760 L 960 980" stroke="#ea580c" stroke-width="5"/>
    </g>
    <g transform="translate(960, 400) scale(0.9)" fill="none" stroke="#ea580c" stroke-width="3">
      <path d="M -90 40 C -80 -20 -30 -60 0 -90 C 30 -60 80 -20 90 40 C 40 20 20 10 0 30 C -20 10 -40 20 -90 40 Z" fill="rgba(255,255,255,0.7)"/>
      <circle cx="0" cy="-35" r="14" fill="#fde047"/>
    </g>
  </svg>`;
  _dragonLightSvg = toSvgDataUri(svg);
  return _dragonLightSvg;
}

// --- 6. Curated & Complete Arenas Registry ---
export const ARENA_THEMES = [
  {
    id: 'random',
    name: 'عشوائي في بداية المعركة',
    tagline: 'حلبة مفاجئة وثابتة',
    description: 'يتم اختيار إحدى الساحات الأسطورية عشوائياً عند بدء النزال وتظل ثابتة طوال المعركة',
    bgNight: '/assets/fie_night.png',
    bgLight: '/assets/fie_light.png',
    thumb: '/assets/fie_night.png',
    isSpecial: true,
  },
  {
    id: 'pharaoh_tomb',
    name: 'الساحة الملكية الفرعونية',
    tagline: 'ذهب الفراعنة والأصلية',
    description: 'معبد الفراعنة الملكي المقدس بنقوشه الهيروغليفية وأعمدة الذهب وسماء النجوم الصافية',
    bgNight: '/assets/fie_night.png',
    bgLight: '/assets/fie_light.png',
    bgImage: '/assets/fie_night.png',
    thumb: '/assets/fie_night.png',
    fieldKey: 'default',
    auraGlow: 'rgba(245, 158, 11, 0.4)',
    borderGlow: '#facc15',
  },
  {
    id: 'pharaoh_millennium_temple',
    name: 'معبد قطع الألفية وعين وادجيت',
    tagline: 'عين الحكمة والنقوش الحجرية',
    description: 'معبد الألفية الملكي بنقوشه الحجرية لبطاقات الوحوش وعين حورس الذهبية وأرضية السبج المتوهجة',
    bgNight: '/assets/fie_millennium_temple.jpg',
    bgLight: '/assets/fie_millennium_temple.jpg',
    bgImage: '/assets/fie_millennium_temple.jpg',
    thumb: '/assets/fie_millennium_temple.jpg',
    fieldKey: 'millennium_temple',
    auraGlow: 'rgba(240, 203, 100, 0.45)',
    borderGlow: '#f0cb64',
  },
  {
    id: 'pharaoh_winged_ra',
    name: 'بهو قرص الشمس ومسلات رع العظمى',
    tagline: 'إشراق الشمس والمسلات الذهبية',
    description: 'بهو المعبد الشمسي بقرص رع المجنح وحيات الكوبرا والمسلات الجرانيتية المطلة على الأهرامات',
    bgNight: '/assets/fie_winged_ra.jpg',
    bgLight: '/assets/fie_winged_ra.jpg',
    bgImage: '/assets/fie_winged_ra.jpg',
    thumb: '/assets/fie_winged_ra.jpg',
    fieldKey: 'winged_ra',
    auraGlow: 'rgba(245, 158, 11, 0.45)',
    borderGlow: '#eab308',
  },
  {
    id: 'pharaoh_anubis_scales',
    name: 'قاعة ميزان أنوبيس ومحكمة الفراعنة',
    tagline: 'ميزان ماعت ونيران الروح الأثيرية',
    description: 'قاعة المحاكمة الملكية وميزان ماعت الذهبي بين تماثيل أنوبيس البازلتية وألسنة اللهب الفيروزية',
    bgNight: '/assets/fie_anubis_scales.jpg',
    bgLight: '/assets/fie_anubis_scales.jpg',
    bgImage: '/assets/fie_anubis_scales.jpg',
    thumb: '/assets/fie_anubis_scales.jpg',
    fieldKey: 'anubis_scales',
    auraGlow: 'rgba(6, 182, 212, 0.45)',
    borderGlow: '#06b6d4',
  },
  {
    id: 'black_hole_void',
    name: 'دوامة الثقب الأسود الكوني',
    tagline: 'جاذبية الفضاء والألوان الزرقاء',
    description: 'أفق حدث لثقب أسود عظيم في أعماق الفضاء يبتلع النور بأمواج طاقة زرقاء ونيليّة ومسلات كوكبية عائمة',
    bgNight: '/assets/fie_black_hole.jpg',
    bgLight: '/assets/fie_black_hole.jpg',
    bgImage: '/assets/fie_black_hole.jpg',
    thumb: '/assets/fie_black_hole.jpg',
    fieldKey: 'black_hole',
    auraGlow: 'rgba(14, 165, 233, 0.5)',
    borderGlow: '#38bdf8',
  },
  {
    id: 'crimson_thunder_citadel',
    name: 'معقل الصواعق الملكية وتنين السماء',
    tagline: 'صواعق حمراء وهيبة الفراعنة العظام',
    description: 'قلعة فرعونية منحوتة في صخور الجرانيت الأحمر تحرسها تماثيل الملوك العظام تحت صواعق البرق القرمزي المتوهج',
    bgNight: '/assets/fie_crimson_thunder.jpg',
    bgLight: '/assets/fie_crimson_thunder.jpg',
    bgImage: '/assets/fie_crimson_thunder.jpg',
    thumb: '/assets/fie_crimson_thunder.jpg',
    fieldKey: 'crimson_thunder',
    auraGlow: 'rgba(239, 68, 68, 0.55)',
    borderGlow: '#ef4444',
  },
  {
    id: 'silver_moon_sanctuary',
    name: 'محراب القمر الفضي والبلاتين',
    tagline: 'فضة خونسو وبريق البلاتين',
    description: 'معبد خونسو المقدس من الفضة المصقولة والبلاتين مع هلال فضي عملاق وعين حورس القمرية',
    bgNight: '/assets/fie_silver_sanctuary.jpg',
    bgLight: '/assets/fie_silver_sanctuary.jpg',
    bgImage: '/assets/fie_silver_sanctuary.jpg',
    thumb: '/assets/fie_silver_sanctuary.jpg',
    fieldKey: 'silver_sanctuary',
    auraGlow: 'rgba(226, 232, 240, 0.5)',
    borderGlow: '#e2e8f0',
  },
  {
    id: 'emerald_oasis_sanctuary',
    name: 'واحة الزمرد ومعبد الحياة الأبدي',
    tagline: 'بلورات الزمرد وزهور اللوتس',
    description: 'واحة مقدسة تفيض ببرك المياه الفيروزية وبوابات اليشم المتوجة بجعران الزمرد المشع وزهور اللوتس',
    bgNight: '/assets/fie_emerald_oasis.jpg',
    bgLight: '/assets/fie_emerald_oasis.jpg',
    bgImage: '/assets/fie_emerald_oasis.jpg',
    thumb: '/assets/fie_emerald_oasis.jpg',
    fieldKey: 'emerald_oasis',
    auraGlow: 'rgba(16, 185, 129, 0.55)',
    borderGlow: '#10b981',
  },
  {
    id: 'kaibacorp_stadium',
    name: 'حلبة كايبا كورب الرقمية',
    tagline: 'هولوغرام التكنولوجيا الفائقة',
    description: 'ملعب سيتو كايبا المتطور وأنظمة المحاكاة الافتراضية ثلاثية الأبعاد بمدينة دومينو',
    get bgNight() { return getKaibaCorpSvg(); },
    get bgLight() { return getKaibaCorpLightSvg(); },
    get bgImage() { return getKaibaCorpSvg(); },
    get thumb() { return getKaibaCorpSvg(); },
    fieldKey: 'cyber_kaiba',
    auraGlow: 'rgba(6, 182, 212, 0.45)',
    borderGlow: '#06b6d4',
  },
  {
    id: 'desert_pyramids',
    name: 'محراب الورد الفرعوني وقرص رع',
    tagline: 'ورود حتحور الوردية وأجنحة رع',
    description: 'معبد فرعوني وردي شاهق تحرسه مسلات الذهب وأجنحة قرص رع المحاطة ببساتين الورد الوردي وبتلات الزهور المتطايرة',
    bgNight: '/assets/fie_pharaoh_roses.jpg',
    bgLight: '/assets/fie_pharaoh_roses.jpg',
    bgImage: '/assets/fie_pharaoh_roses.jpg',
    thumb: '/assets/fie_pharaoh_roses.jpg',
    fieldKey: 'rose_garden',
    auraGlow: 'rgba(244, 114, 182, 0.55)',
    borderGlow: '#f472b6',
  },
  {
    id: 'sacred_nile_river',
    name: 'نهر النيل المقدس ومحراب الفراعنة',
    tagline: 'مياه النيل الزرقاء وزهور اللوتس',
    description: 'ضفاف نهر النيل الخالد تحت شفق الغروب الذهبي تتلألأ بمياهه الفيروزية الصافية ومسلات الذهب وزهور اللوتس المقدسة',
    bgNight: '/assets/fie_sacred_nile.jpg',
    bgLight: '/assets/fie_sacred_nile.jpg',
    bgImage: '/assets/fie_sacred_nile.jpg',
    thumb: '/assets/fie_sacred_nile.jpg',
    fieldKey: 'sacred_nile',
    auraGlow: 'rgba(6, 182, 212, 0.55)',
    borderGlow: '#06b6d4',
  },
  {
    id: 'umi_depths',
    name: 'أعماق المحيط السحيق (أومي)',
    tagline: 'أمواج وقاع البحار الزرقاء',
    description: 'خندق المحيط الهادر وأمواج المياه الفيروزية العميقة مع شُعب مرجانية متلألئة',
    bgNight: '/assets/fie_umi.png',
    bgLight: '/assets/fie_umi_light.png',
    bgImage: '/assets/fie_umi.png',
    thumb: '/assets/fie_umi.png',
    fieldKey: 'umi',
    auraGlow: 'rgba(2, 132, 199, 0.45)',
    borderGlow: '#38bdf8',
  },
  {
    id: 'molten_volcano',
    name: 'حلبة الحمم والبراكين الصاهرة',
    tagline: 'الجحيم الناري المشتعل',
    description: 'أرض ملتهبة بحمم بركانية حمراء متدفقة وشقوق نارية تصهر دروع الخصوم',
    bgNight: '/assets/fie_burn.png',
    bgLight: '/assets/fie_burn_light.png',
    bgImage: '/assets/fie_burn.png',
    thumb: '/assets/fie_burn.png',
    fieldKey: 'burn',
    auraGlow: 'rgba(220, 38, 38, 0.5)',
    borderGlow: '#ef4444',
  },
  {
    id: 'shadow_realm',
    name: 'عالم الظلال والغموض الأثيري',
    tagline: 'الهاوية الكونية البنفسجية',
    description: 'فضاء بعدي أسطوري يبتلع طاقات الظلام بتوهج بنفسجي وأمواج نيلية غامضة',
    bgNight: '/assets/fie_dark.png',
    bgLight: '/assets/fie_dark_light.png',
    bgImage: '/assets/fie_dark.png',
    thumb: '/assets/fie_dark.png',
    fieldKey: 'yami',
    auraGlow: 'rgba(126, 34, 206, 0.55)',
    borderGlow: '#a855f7',
  },
  {
    id: 'cyber_matrix',
    name: 'الفضاء السيبراني وشبكة البيانات',
    tagline: 'عالم نوح الافتراضي',
    description: 'مصفوفة البيانات الرقمية والخوارزميات الافتراضية لعالم الديجيتال اللانهائي',
    get bgNight() { return getCyberMatrixSvg(); },
    get bgLight() { return getCyberMatrixLightSvg(); },
    get bgImage() { return getCyberMatrixSvg(); },
    get thumb() { return getCyberMatrixSvg(); },
    fieldKey: 'cyber_virtual',
    auraGlow: 'rgba(16, 185, 129, 0.45)',
    borderGlow: '#10b981',
  },
  {
    id: 'orichalcos_atlantis',
    name: 'أطلانتس المفقودة وخاتم أوريكالكوس',
    tagline: 'القارة الغارقة والسر القديم',
    description: 'أطلال حضارة أطلانتس الغارقة في أعماق المحيط تتوهج برموز حجر الأوريكالكوس الأسطوري',
    get bgNight() { return getOrichalcosAtlantisSvg(); },
    get bgLight() { return getOrichalcosAtlantisLightSvg(); },
    get bgImage() { return getOrichalcosAtlantisSvg(); },
    get thumb() { return getOrichalcosAtlantisSvg(); },
    fieldKey: 'orichalcos_atlantis',
    auraGlow: 'rgba(20, 184, 166, 0.45)',
    borderGlow: '#14b8a6',
  },
  {
    id: 'machine_fortress',
    name: 'معقل الآلات العملاقة والتروس',
    tagline: 'قلعة الميكا والصناعة الحربية',
    description: 'منشأة صناعية هائلة ذات تروس ومحركات جبارة وأفران صهر مشتعلة لوحوش الآلات',
    get bgNight() { return getMachineFortressSvg(); },
    get bgLight() { return getMachineFortressLightSvg(); },
    get bgImage() { return getMachineFortressSvg(); },
    get thumb() { return getMachineFortressSvg(); },
    fieldKey: 'machine_foundry',
    auraGlow: 'rgba(249, 115, 22, 0.45)',
    borderGlow: '#f97316',
  },
  {
    id: 'dragon_crag',
    name: 'فوهة التنانين الأسطورية وأرض النيازك',
    tagline: 'عرين الوحوش المجنحة',
    description: 'قمم صخرية شاهقة تسقط عليها النيازك الكونية وتشهد صراع التنانين الأسطورية',
    get bgNight() { return getDragonCragSvg(); },
    get bgLight() { return getDragonCragLightSvg(); },
    get bgImage() { return getDragonCragSvg(); },
    get thumb() { return getDragonCragSvg(); },
    fieldKey: 'dragon_roost',
    auraGlow: 'rgba(239, 68, 68, 0.45)',
    borderGlow: '#ef4444',
  },
  {
    id: 'sun_sanctuary',
    name: 'بهو النور والضياء الشمسي',
    tagline: 'إشراق ملكي',
    description: 'غرفة الضياء الساطعة وأشعة الشمس المقدسة التي تنير ساحة المعركة بالذهب الخالص',
    bgNight: '/assets/fie_light.png',
    bgLight: '/assets/fie_light.png',
    bgImage: '/assets/fie_light.png',
    thumb: '/assets/fie_light.png',
    fieldKey: 'shine',
    auraGlow: 'rgba(250, 204, 21, 0.45)',
    borderGlow: '#fef08a',
  },
];

export const SELECTABLE_ARENAS = ARENA_THEMES.filter((a) => a.id !== 'random');

export const CLIMAX_ARENAS = [
  'silver_moon_sanctuary',
  'emerald_oasis_sanctuary',
  'black_hole_void',
  'crimson_thunder_citadel',
  'pharaoh_millennium_temple',
  'pharaoh_winged_ra',
  'pharaoh_anubis_scales',
  'kaibacorp_stadium',
  'cyber_matrix',
  'orichalcos_atlantis',
  'machine_fortress',
  'dragon_crag',
  'molten_volcano',
  'shadow_realm',
  'pharaoh_tomb',
  'desert_pyramids',
  'umi_depths',
];

/**
 * Returns a specific arena theme by ID, or fallback
 */
export const getArenaTheme = (arenaId, theme = 'dark') => {
  if (!arenaId || arenaId === 'random') {
    const pharaoh = ARENA_THEMES.find((a) => a.id === 'pharaoh_tomb');
    return pharaoh || ARENA_THEMES[1];
  }

  const found = ARENA_THEMES.find((a) => a.id === arenaId);
  return found || ARENA_THEMES.find((a) => a.id === 'pharaoh_tomb') || ARENA_THEMES[1];
};

/**
 * Picks a random arena from the selectable list
 */
export const getRandomArenaTheme = () => {
  const randIdx = Math.floor(Math.random() * SELECTABLE_ARENAS.length);
  return SELECTABLE_ARENAS[randIdx];
};

/**
 * Picks a different arena for climax moments
 */
export const getNextClimaxArena = (currentArenaId) => {
  const candidates = SELECTABLE_ARENAS.filter(
    (a) => CLIMAX_ARENAS.includes(a.id) && a.id !== currentArenaId
  );
  if (candidates.length === 0) return getRandomArenaTheme();
  const randIdx = Math.floor(Math.random() * candidates.length);
  return candidates[randIdx];
};

/**
 * Resolves the final background image URL given an arena and theme mode ('light' vs 'dark')
 */
export const resolveArenaBgImage = (arena, theme = 'dark') => {
  if (!arena) return theme === 'light' ? '/assets/fie_light.png' : '/assets/fie_night.png';

  if (theme === 'light') {
    return arena.bgLight || arena.bgImage || arena.thumb || '/assets/fie_light.png';
  }
  return arena.bgNight || arena.bgImage || arena.thumb || '/assets/fie_night.png';
};

/**
 * Returns dynamic cohesive color palette tailored to the active arena background
 * Colors the duel field borders, card slots, divider bars, and ambient motes
 */
export const getArenaPalette = (arena, theme = 'dark') => {
  const isLight = theme === 'light';
  const id = arena?.id || 'pharaoh_tomb';
  const fieldKey = arena?.fieldKey || 'default';

  // 0a. Pharaonic Millennium Temple / Wdjat Eye
  if (id === 'pharaoh_millennium_temple' || fieldKey === 'millennium_temple') {
    return {
      primary: '#f0cb64',
      secondary: '#c99e32',
      highlight: '#fde047',
      slotBorder: isLight ? 'rgba(180, 83, 9, 0.65)' : 'rgba(240, 203, 100, 0.62)',
      slotBg: isLight ? 'rgba(254, 252, 232, 0.45)' : 'rgba(22, 16, 10, 0.58)',
      slotGlow: 'rgba(240, 203, 100, 0.45)',
      arenaBorder: isLight ? 'rgba(180, 83, 9, 0.6)' : 'rgba(240, 203, 100, 0.78)',
      arenaMatGlow: 'rgba(240, 203, 100, 0.35)',
      dividerBg: isLight ? 'rgba(254, 243, 199, 0.88)' : 'rgba(28, 20, 10, 0.88)',
      dividerBorder: '#f0cb64',
      moteColor: '#fde047',
    };
  }

  // 0b. Winged Sun Disc of Ra / Solar Obelisks
  if (id === 'pharaoh_winged_ra' || fieldKey === 'winged_ra') {
    return {
      primary: '#facc15',
      secondary: '#ea580c',
      highlight: '#fef08a',
      slotBorder: isLight ? 'rgba(180, 83, 9, 0.65)' : 'rgba(234, 179, 8, 0.62)',
      slotBg: isLight ? 'rgba(254, 250, 230, 0.45)' : 'rgba(30, 20, 8, 0.58)',
      slotGlow: 'rgba(245, 158, 11, 0.45)',
      arenaBorder: isLight ? 'rgba(180, 83, 9, 0.6)' : 'rgba(234, 179, 8, 0.78)',
      arenaMatGlow: 'rgba(245, 158, 11, 0.35)',
      dividerBg: isLight ? 'rgba(254, 243, 199, 0.88)' : 'rgba(32, 18, 8, 0.88)',
      dividerBorder: '#facc15',
      moteColor: '#facc15',
    };
  }

  // 0c. Underworld Hall of Judgment / Anubis Scales of Ma'at
  if (id === 'pharaoh_anubis_scales' || fieldKey === 'anubis_scales') {
    return {
      primary: '#06b6d4',
      secondary: '#14b8a6',
      highlight: '#67e8f9',
      slotBorder: isLight ? 'rgba(8, 145, 178, 0.65)' : 'rgba(6, 182, 212, 0.62)',
      slotBg: isLight ? 'rgba(236, 254, 255, 0.45)' : 'rgba(8, 24, 30, 0.58)',
      slotGlow: 'rgba(6, 182, 212, 0.45)',
      arenaBorder: isLight ? 'rgba(8, 145, 178, 0.6)' : 'rgba(6, 182, 212, 0.78)',
      arenaMatGlow: 'rgba(6, 182, 212, 0.35)',
      dividerBg: isLight ? 'rgba(236, 254, 255, 0.88)' : 'rgba(8, 24, 30, 0.88)',
      dividerBorder: '#06b6d4',
      moteColor: '#22d3ee',
    };
  }

  // 0d. Cosmic Black Hole Void (Deep Electric Blue / Sapphire / Space Singularity)
  if (id === 'black_hole_void' || fieldKey === 'black_hole') {
    return {
      primary: '#38bdf8',
      secondary: '#0284c7',
      highlight: '#bae6fd',
      slotBorder: isLight ? 'rgba(2, 132, 199, 0.65)' : 'rgba(56, 189, 248, 0.65)',
      slotBg: isLight ? 'rgba(240, 249, 255, 0.45)' : 'rgba(6, 16, 32, 0.62)',
      slotGlow: 'rgba(56, 189, 248, 0.48)',
      arenaBorder: isLight ? 'rgba(2, 132, 199, 0.6)' : 'rgba(56, 189, 248, 0.8)',
      arenaMatGlow: 'rgba(14, 165, 233, 0.38)',
      dividerBg: isLight ? 'rgba(240, 249, 255, 0.88)' : 'rgba(6, 16, 30, 0.88)',
      dividerBorder: '#38bdf8',
      moteColor: '#38bdf8',
    };
  }

  // 0e. Crimson Thunder Citadel (Slifer Sky Dragon / Red Divine Lightning)
  if (id === 'crimson_thunder_citadel' || fieldKey === 'crimson_thunder') {
    return {
      primary: '#ef4444',
      secondary: '#b91c1c',
      highlight: '#fde047',
      slotBorder: isLight ? 'rgba(185, 28, 28, 0.65)' : 'rgba(239, 68, 68, 0.65)',
      slotBg: isLight ? 'rgba(254, 242, 242, 0.45)' : 'rgba(32, 10, 10, 0.6)',
      slotGlow: 'rgba(239, 68, 68, 0.52)',
      arenaBorder: isLight ? 'rgba(185, 28, 28, 0.6)' : 'rgba(239, 68, 68, 0.82)',
      arenaMatGlow: 'rgba(220, 38, 38, 0.38)',
      dividerBg: isLight ? 'rgba(254, 226, 226, 0.88)' : 'rgba(32, 10, 10, 0.88)',
      dividerBorder: '#ef4444',
      moteColor: '#f87171',
    };
  }

  // 0f. Silver Moon Sanctuary of Khonsu (Metallic Platinum / Moonstone / Pure Silver)
  if (id === 'silver_moon_sanctuary' || fieldKey === 'silver_sanctuary') {
    return {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
      highlight: '#ffffff',
      slotBorder: isLight ? 'rgba(100, 116, 139, 0.65)' : 'rgba(226, 232, 240, 0.65)',
      slotBg: isLight ? 'rgba(248, 250, 252, 0.45)' : 'rgba(15, 23, 42, 0.58)',
      slotGlow: 'rgba(226, 232, 240, 0.48)',
      arenaBorder: isLight ? 'rgba(100, 116, 139, 0.6)' : 'rgba(226, 232, 240, 0.8)',
      arenaMatGlow: 'rgba(203, 213, 225, 0.38)',
      dividerBg: isLight ? 'rgba(241, 245, 249, 0.88)' : 'rgba(15, 23, 42, 0.88)',
      dividerBorder: '#e2e8f0',
      moteColor: '#cbd5e1',
    };
  }

  // 0g. Emerald Oasis Sanctuary of Life (Lush Jade / Sacred Lotus / Emerald Crystals)
  if (id === 'emerald_oasis_sanctuary' || fieldKey === 'emerald_oasis') {
    return {
      primary: '#10b981',
      secondary: '#059669',
      highlight: '#6ee7b7',
      slotBorder: isLight ? 'rgba(5, 150, 105, 0.65)' : 'rgba(16, 185, 129, 0.65)',
      slotBg: isLight ? 'rgba(236, 253, 245, 0.45)' : 'rgba(6, 32, 20, 0.58)',
      slotGlow: 'rgba(16, 185, 129, 0.48)',
      arenaBorder: isLight ? 'rgba(5, 150, 105, 0.6)' : 'rgba(16, 185, 129, 0.8)',
      arenaMatGlow: 'rgba(16, 185, 129, 0.38)',
      dividerBg: isLight ? 'rgba(236, 253, 245, 0.88)' : 'rgba(6, 32, 20, 0.88)',
      dividerBorder: '#10b981',
      moteColor: '#34d399',
    };
  }

  // 1. Volcanic / Molten / Burn / Fire
  if (id === 'molten_volcano' || id === 'cosmic_fusion' || fieldKey === 'burn') {
    return {
      primary: '#ef4444',
      secondary: '#f97316',
      highlight: '#fde047',
      slotBorder: isLight ? 'rgba(239, 68, 68, 0.65)' : 'rgba(239, 68, 68, 0.55)',
      slotBg: isLight ? 'rgba(254, 242, 242, 0.42)' : 'rgba(32, 12, 10, 0.55)',
      slotGlow: 'rgba(239, 68, 68, 0.42)',
      arenaBorder: isLight ? 'rgba(239, 68, 68, 0.55)' : 'rgba(239, 68, 68, 0.72)',
      arenaMatGlow: 'rgba(220, 38, 38, 0.35)',
      dividerBg: isLight ? 'rgba(254, 226, 226, 0.88)' : 'rgba(32, 10, 10, 0.88)',
      dividerBorder: '#ef4444',
      moteColor: '#f97316',
    };
  }

  // 1b. Pink Rose Garden / Blossom Sanctuary
  if (id === 'desert_pyramids' || fieldKey === 'rose_garden') {
    return {
      primary: '#f472b6',
      secondary: '#ec4899',
      highlight: '#fdf2f8',
      slotBorder: isLight ? 'rgba(236, 72, 153, 0.65)' : 'rgba(244, 114, 182, 0.58)',
      slotBg: isLight ? 'rgba(253, 242, 248, 0.45)' : 'rgba(36, 12, 24, 0.55)',
      slotGlow: 'rgba(244, 114, 182, 0.42)',
      arenaBorder: isLight ? 'rgba(236, 72, 153, 0.55)' : 'rgba(244, 114, 182, 0.75)',
      arenaMatGlow: 'rgba(244, 114, 182, 0.35)',
      dividerBg: isLight ? 'rgba(253, 242, 248, 0.88)' : 'rgba(32, 12, 22, 0.88)',
      dividerBorder: '#f472b6',
      moteColor: '#f472b6',
    };
  }

  // 1c. Sacred Pharaonic Nile River (Lapis Nile Blue / Turquoise / Egyptian Gold)
  if (id === 'sacred_nile_river' || fieldKey === 'sacred_nile') {
    return {
      primary: '#06b6d4',
      secondary: '#0284c7',
      highlight: '#fde047',
      slotBorder: isLight ? 'rgba(2, 132, 199, 0.65)' : 'rgba(6, 182, 212, 0.65)',
      slotBg: isLight ? 'rgba(240, 253, 250, 0.45)' : 'rgba(8, 28, 44, 0.58)',
      slotGlow: 'rgba(6, 182, 212, 0.48)',
      arenaBorder: isLight ? 'rgba(2, 132, 199, 0.6)' : 'rgba(6, 182, 212, 0.8)',
      arenaMatGlow: 'rgba(2, 132, 199, 0.38)',
      dividerBg: isLight ? 'rgba(224, 242, 254, 0.88)' : 'rgba(8, 28, 44, 0.88)',
      dividerBorder: '#06b6d4',
      moteColor: '#38bdf8',
    };
  }

  // 2. Dark Magic / Occult / Shadow Realm / Yami
  if (id === 'shadow_realm' || id === 'yami_tomb' || id === 'shadow_colosseum' || fieldKey === 'yami') {
    return {
      primary: '#a855f7',
      secondary: '#c084fc',
      highlight: '#f3e8ff',
      slotBorder: isLight ? 'rgba(147, 51, 234, 0.65)' : 'rgba(168, 85, 247, 0.58)',
      slotBg: isLight ? 'rgba(250, 245, 255, 0.42)' : 'rgba(24, 10, 36, 0.55)',
      slotGlow: 'rgba(168, 85, 247, 0.42)',
      arenaBorder: isLight ? 'rgba(147, 51, 234, 0.55)' : 'rgba(168, 85, 247, 0.75)',
      arenaMatGlow: 'rgba(126, 34, 206, 0.35)',
      dividerBg: isLight ? 'rgba(243, 232, 255, 0.88)' : 'rgba(22, 10, 34, 0.88)',
      dividerBorder: '#a855f7',
      moteColor: '#c084fc',
    };
  }

  // 3. Deep Ocean / Umi / Water
  if (id === 'umi_depths' || id === 'crystal_shallows' || fieldKey === 'umi') {
    return {
      primary: '#06b6d4',
      secondary: '#38bdf8',
      highlight: '#a5f3fc',
      slotBorder: isLight ? 'rgba(2, 132, 199, 0.65)' : 'rgba(6, 182, 212, 0.58)',
      slotBg: isLight ? 'rgba(240, 253, 250, 0.42)' : 'rgba(8, 26, 44, 0.55)',
      slotGlow: 'rgba(6, 182, 212, 0.42)',
      arenaBorder: isLight ? 'rgba(2, 132, 199, 0.55)' : 'rgba(6, 182, 212, 0.75)',
      arenaMatGlow: 'rgba(2, 132, 199, 0.35)',
      dividerBg: isLight ? 'rgba(224, 242, 254, 0.88)' : 'rgba(8, 26, 44, 0.88)',
      dividerBorder: '#06b6d4',
      moteColor: '#38bdf8',
    };
  }

  // 4. Cyber Kaiba
  if (id === 'kaibacorp_stadium' || fieldKey === 'cyber_kaiba') {
    return {
      primary: '#00f0ff',
      secondary: '#38bdf8',
      highlight: '#bae6fd',
      slotBorder: isLight ? 'rgba(2, 132, 199, 0.65)' : 'rgba(6, 182, 212, 0.65)',
      slotBg: isLight ? 'rgba(240, 249, 255, 0.45)' : 'rgba(6, 24, 42, 0.58)',
      slotGlow: 'rgba(6, 182, 212, 0.45)',
      arenaBorder: 'rgba(6, 182, 212, 0.8)',
      arenaMatGlow: 'rgba(6, 182, 212, 0.35)',
      dividerBg: isLight ? 'rgba(224, 242, 254, 0.88)' : 'rgba(6, 24, 42, 0.88)',
      dividerBorder: '#00f0ff',
      moteColor: '#00f0ff',
    };
  }

  // 5. Cyber Virtual
  if (id === 'cyber_matrix' || fieldKey === 'cyber_virtual') {
    return {
      primary: '#10b981',
      secondary: '#34d399',
      highlight: '#a7f3d0',
      slotBorder: isLight ? 'rgba(5, 150, 105, 0.65)' : 'rgba(16, 185, 129, 0.65)',
      slotBg: isLight ? 'rgba(236, 253, 245, 0.45)' : 'rgba(6, 32, 20, 0.58)',
      slotGlow: 'rgba(16, 185, 129, 0.45)',
      arenaBorder: 'rgba(16, 185, 129, 0.8)',
      arenaMatGlow: 'rgba(16, 185, 129, 0.35)',
      dividerBg: isLight ? 'rgba(209, 250, 229, 0.88)' : 'rgba(6, 32, 20, 0.88)',
      dividerBorder: '#10b981',
      moteColor: '#10b981',
    };
  }

  // 6. Orichalcos Atlantis
  if (id === 'orichalcos_atlantis' || fieldKey === 'orichalcos_atlantis') {
    return {
      primary: '#14b8a6',
      secondary: '#2dd4bf',
      highlight: '#99f6e4',
      slotBorder: isLight ? 'rgba(13, 148, 136, 0.65)' : 'rgba(20, 184, 166, 0.65)',
      slotBg: isLight ? 'rgba(240, 253, 250, 0.45)' : 'rgba(8, 32, 30, 0.58)',
      slotGlow: 'rgba(20, 184, 166, 0.45)',
      arenaBorder: 'rgba(20, 184, 166, 0.8)',
      arenaMatGlow: 'rgba(20, 184, 166, 0.35)',
      dividerBg: isLight ? 'rgba(204, 251, 241, 0.88)' : 'rgba(8, 32, 30, 0.88)',
      dividerBorder: '#14b8a6',
      moteColor: '#14b8a6',
    };
  }

  // 7. Machine Fortress
  if (id === 'machine_fortress' || fieldKey === 'machine_foundry') {
    return {
      primary: '#f97316',
      secondary: '#ea580c',
      highlight: '#fed7aa',
      slotBorder: isLight ? 'rgba(234, 88, 12, 0.65)' : 'rgba(249, 115, 22, 0.65)',
      slotBg: isLight ? 'rgba(255, 247, 237, 0.45)' : 'rgba(32, 16, 8, 0.58)',
      slotGlow: 'rgba(249, 115, 22, 0.45)',
      arenaBorder: 'rgba(249, 115, 22, 0.8)',
      arenaMatGlow: 'rgba(249, 115, 22, 0.35)',
      dividerBg: isLight ? 'rgba(255, 237, 213, 0.88)' : 'rgba(32, 16, 8, 0.88)',
      dividerBorder: '#f97316',
      moteColor: '#f97316',
    };
  }

  // 8. Dragon Crag
  if (id === 'dragon_crag' || fieldKey === 'dragon_roost') {
    return {
      primary: '#ef4444',
      secondary: '#ea580c',
      highlight: '#fde047',
      slotBorder: isLight ? 'rgba(220, 38, 38, 0.65)' : 'rgba(239, 68, 68, 0.65)',
      slotBg: isLight ? 'rgba(254, 242, 242, 0.45)' : 'rgba(34, 10, 12, 0.58)',
      slotGlow: 'rgba(239, 68, 68, 0.45)',
      arenaBorder: 'rgba(239, 68, 68, 0.8)',
      arenaMatGlow: 'rgba(239, 68, 68, 0.35)',
      dividerBg: isLight ? 'rgba(254, 226, 226, 0.88)' : 'rgba(34, 10, 12, 0.88)',
      dividerBorder: '#ef4444',
      moteColor: '#ef4444',
    };
  }

  // 9. Sun / Sky Sanctuary
  if (id === 'sun_sanctuary' || id === 'sky_sanctuary' || fieldKey === 'shine' || fieldKey === 'sanctuary') {
    return {
      primary: '#facc15',
      secondary: '#38bdf8',
      highlight: '#ffffff',
      slotBorder: isLight ? 'rgba(202, 138, 4, 0.65)' : 'rgba(250, 204, 21, 0.65)',
      slotBg: isLight ? 'rgba(254, 252, 232, 0.45)' : 'rgba(26, 22, 12, 0.55)',
      slotGlow: 'rgba(250, 204, 21, 0.42)',
      arenaBorder: 'rgba(250, 204, 21, 0.75)',
      arenaMatGlow: 'rgba(250, 204, 21, 0.32)',
      dividerBg: isLight ? 'rgba(254, 249, 195, 0.88)' : 'rgba(26, 22, 12, 0.88)',
      dividerBorder: '#facc15',
      moteColor: '#fde047',
    };
  }

  // 10. Forest / Sogen
  if (id === 'sacred_forest' || id === 'sogen_meadows' || fieldKey === 'forest' || fieldKey === 'sogen') {
    return {
      primary: '#4ade80',
      secondary: '#22c55e',
      highlight: '#bbf7d0',
      slotBorder: isLight ? 'rgba(22, 163, 74, 0.65)' : 'rgba(34, 197, 94, 0.62)',
      slotBg: isLight ? 'rgba(240, 253, 244, 0.45)' : 'rgba(10, 28, 14, 0.55)',
      slotGlow: 'rgba(34, 197, 94, 0.4)',
      arenaBorder: 'rgba(34, 197, 94, 0.75)',
      arenaMatGlow: 'rgba(34, 197, 94, 0.3)',
      dividerBg: isLight ? 'rgba(220, 252, 231, 0.88)' : 'rgba(10, 28, 14, 0.88)',
      dividerBorder: '#4ade80',
      moteColor: '#4ade80',
    };
  }

  // 11. Mountain / Gaia / Wasteland
  if (id === 'mountain_peaks' || id === 'gaia_caverns' || id === 'rocky_wasteland' || fieldKey === 'mountain' || fieldKey === 'gaia') {
    return {
      primary: '#fbbf24',
      secondary: '#ea580c',
      highlight: '#fef08a',
      slotBorder: isLight ? 'rgba(202, 138, 4, 0.65)' : 'rgba(217, 119, 6, 0.62)',
      slotBg: isLight ? 'rgba(254, 243, 199, 0.45)' : 'rgba(30, 20, 10, 0.55)',
      slotGlow: 'rgba(217, 119, 6, 0.4)',
      arenaBorder: 'rgba(217, 119, 6, 0.75)',
      arenaMatGlow: 'rgba(217, 119, 6, 0.3)',
      dividerBg: isLight ? 'rgba(254, 243, 199, 0.88)' : 'rgba(30, 20, 10, 0.88)',
      dividerBorder: '#fbbf24',
      moteColor: '#fbbf24',
    };
  }

  // Default: Royal Pharaoh Tomb / Desert Gold
  return {
    primary: '#facc15',
    secondary: '#f59e0b',
    highlight: '#fef08a',
    slotBorder: isLight ? 'rgba(180, 83, 9, 0.65)' : 'rgba(240, 203, 100, 0.58)',
    slotBg: isLight ? 'rgba(254, 252, 232, 0.45)' : 'rgba(26, 20, 10, 0.55)',
    slotGlow: 'rgba(245, 158, 11, 0.42)',
    arenaBorder: isLight ? 'rgba(180, 83, 9, 0.55)' : 'rgba(240, 203, 100, 0.75)',
    arenaMatGlow: 'rgba(245, 158, 11, 0.3)',
    dividerBg: isLight ? 'rgba(254, 243, 199, 0.88)' : 'rgba(26, 20, 10, 0.88)',
    dividerBorder: '#facc15',
    moteColor: '#facc15',
  };
};
