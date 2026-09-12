/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'animations', 'ranks');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Helper function to create breathing keyframes
function makeBreathingScale(min = 96, max = 104) {
  return {
    a: 1,
    k: [
      { t: 0, s: [min, min, 100], e: [max, max, 100], i: { x: [0.4, 0.4, 0.4], y: [1, 1, 1] }, o: { x: [0.4, 0.4, 0.4], y: [0, 0, 0] } },
      { t: 60, s: [max, max, 100], e: [min, min, 100], i: { x: [0.4, 0.4, 0.4], y: [1, 1, 1] }, o: { x: [0.4, 0.4, 0.4], y: [0, 0, 0] } },
      { t: 120, s: [min, min, 100] }
    ]
  };
}

// Helper function for aura pulsing opacity
function makeAuraOpacity(min = 25, max = 80) {
  return {
    a: 1,
    k: [
      { t: 0, s: [min], e: [max], i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } },
      { t: 60, s: [max], e: [min], i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } },
      { t: 120, s: [min] }
    ]
  };
}

// Helper function for floating rotation
function makeFloatingRotation(minDeg = -4, maxDeg = 4) {
  return {
    a: 1,
    k: [
      { t: 0, s: [minDeg], e: [maxDeg], i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } },
      { t: 60, s: [maxDeg], e: [minDeg], i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } },
      { t: 120, s: [minDeg] }
    ]
  };
}

// Definition of 10 LoL-styled Ranks
const RANKS = [
  {
    key: 'unranked',
    name: 'Unranked Crest',
    colors: {
      aura: [0.35, 0.38, 0.45, 0.3],
      outer: [0.25, 0.28, 0.34, 1],
      wing: [0.35, 0.38, 0.44, 1],
      core: [0.45, 0.48, 0.55, 1],
      highlight: [0.7, 0.75, 0.82, 1],
      stroke: [0.5, 0.55, 0.62, 0.8]
    },
    crestType: 'circle',
    glowSize: 42
  },
  {
    key: 'iron',
    name: 'Iron Crest',
    colors: {
      aura: [0.4, 0.42, 0.45, 0.4],
      outer: [0.2, 0.22, 0.25, 1],
      wing: [0.35, 0.37, 0.4, 1],
      core: [0.5, 0.52, 0.56, 1],
      highlight: [0.75, 0.78, 0.82, 1],
      stroke: [0.6, 0.63, 0.68, 0.9]
    },
    crestType: 'spiked_shield',
    glowSize: 45
  },
  {
    key: 'bronze',
    name: 'Bronze Crest',
    colors: {
      aura: [0.8, 0.45, 0.2, 0.45],
      outer: [0.45, 0.24, 0.12, 1],
      wing: [0.65, 0.35, 0.18, 1],
      core: [0.85, 0.5, 0.25, 1],
      highlight: [1, 0.75, 0.45, 1],
      stroke: [0.95, 0.6, 0.3, 0.9]
    },
    crestType: 'riveted_shield',
    glowSize: 46
  },
  {
    key: 'silver',
    name: 'Silver Crest',
    colors: {
      aura: [0.6, 0.75, 0.88, 0.45],
      outer: [0.35, 0.45, 0.55, 1],
      wing: [0.6, 0.7, 0.8, 1],
      core: [0.8, 0.88, 0.96, 1],
      highlight: [0.95, 0.98, 1, 1],
      stroke: [0.75, 0.85, 0.95, 0.9]
    },
    crestType: 'winged_blade',
    glowSize: 48
  },
  {
    key: 'platinum',
    name: 'Platinum Crest',
    colors: {
      aura: [0.2, 0.8, 0.8, 0.5],
      outer: [0.15, 0.38, 0.42, 1],
      wing: [0.28, 0.65, 0.68, 1],
      core: [0.55, 0.92, 0.92, 1],
      highlight: [0.85, 1, 1, 1],
      stroke: [0.4, 0.88, 0.88, 0.9]
    },
    crestType: 'hex_wings',
    glowSize: 50
  },
  {
    key: 'emerald',
    name: 'Emerald Crest',
    colors: {
      aura: [0.1, 0.85, 0.45, 0.5],
      outer: [0.08, 0.35, 0.18, 1],
      wing: [0.15, 0.65, 0.35, 1],
      core: [0.25, 0.9, 0.5, 1],
      highlight: [0.65, 1, 0.8, 1],
      stroke: [0.3, 0.95, 0.55, 0.9]
    },
    crestType: 'emerald_gem',
    glowSize: 52
  },
  {
    key: 'diamond',
    name: 'Diamond Crest',
    colors: {
      aura: [0.2, 0.6, 1, 0.55],
      outer: [0.12, 0.28, 0.6, 1],
      wing: [0.25, 0.5, 0.9, 1],
      core: [0.55, 0.8, 1, 1],
      highlight: [0.85, 0.95, 1, 1],
      stroke: [0.4, 0.75, 1, 0.9]
    },
    crestType: 'faceted_star',
    glowSize: 54
  },
  {
    key: 'master',
    name: 'Master Crest',
    colors: {
      aura: [0.75, 0.2, 0.95, 0.6],
      outer: [0.3, 0.08, 0.45, 1],
      wing: [0.58, 0.18, 0.82, 1],
      core: [0.85, 0.38, 1, 1],
      highlight: [0.98, 0.75, 1, 1],
      stroke: [0.9, 0.45, 1, 0.95]
    },
    crestType: 'mystic_crown',
    glowSize: 55
  },
  {
    key: 'grandmaster',
    name: 'Grandmaster Crest',
    colors: {
      aura: [1, 0.2, 0.25, 0.6],
      outer: [0.45, 0.08, 0.1, 1],
      wing: [0.8, 0.15, 0.18, 1],
      core: [1, 0.3, 0.35, 1],
      highlight: [1, 0.75, 0.75, 1],
      stroke: [1, 0.4, 0.45, 0.95]
    },
    crestType: 'crimson_horns',
    glowSize: 56
  },
  {
    key: 'challenger',
    name: 'Challenger Crest',
    colors: {
      aura: [1, 0.8, 0.2, 0.7],
      outer: [0.6, 0.35, 0.05, 1],
      wing: [0.95, 0.7, 0.1, 1],
      core: [0.25, 0.85, 1, 1], // Divine blue crystal in gold crown!
      highlight: [1, 0.96, 0.7, 1],
      stroke: [1, 0.88, 0.3, 0.95]
    },
    crestType: 'celestial_crown',
    glowSize: 58
  }
];

function generateLottie(rank) {
  const { colors, name, glowSize } = rank;

  return {
    v: '5.7.4',
    fr: 60,
    ip: 0,
    op: 120,
    w: 120,
    h: 120,
    nm: name,
    ddd: 0,
    assets: [],
    layers: [
      // Layer 1: Radiant Halo / Aura Background
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: 'AuraPulse',
        sr: 1,
        ks: {
          o: makeAuraOpacity(30, 85),
          r: makeFloatingRotation(-8, 8),
          p: { a: 0, k: [60, 60, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: makeBreathingScale(95, 110)
        },
        ao: 0,
        shapes: [
          {
            ty: 'gr',
            it: [
              {
                ty: 'el',
                d: 1,
                s: { a: 0, k: [glowSize * 2, glowSize * 2] },
                p: { a: 0, k: [0, 0] },
                nm: 'AuraCircle'
              },
              {
                ty: 'fl',
                c: { a: 0, k: colors.aura },
                o: { a: 0, k: 100 },
                r: 1,
                bm: 0,
                nm: 'AuraFill'
              },
              {
                ty: 'tr',
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                sk: { a: 0, k: 0 },
                sa: { a: 0, k: 0 },
                nm: 'Transform'
              }
            ],
            nm: 'AuraGroup'
          }
        ],
        ip: 0,
        op: 120,
        st: 0,
        bm: 0
      },

      // Layer 2: Outer Armor & Wings
      {
        ddd: 0,
        ind: 2,
        ty: 4,
        nm: 'OuterArmorWings',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [60, 60, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: makeBreathingScale(96, 104)
        },
        ao: 0,
        shapes: [
          // Left Wing / Armor Blade
          {
            ty: 'gr',
            it: [
              {
                ty: 'sr',
                sy: 1,
                d: 1,
                pt: { a: 0, k: 4 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 45 },
                ir: { a: 0, k: 22 },
                is: { a: 0, k: 0 },
                or: { a: 0, k: 48 },
                os: { a: 0, k: 8 },
                nm: 'ArmorCrest'
              },
              {
                ty: 'fl',
                c: { a: 0, k: colors.outer },
                o: { a: 0, k: 100 },
                r: 1,
                bm: 0,
                nm: 'OuterFill'
              },
              {
                ty: 'st',
                c: { a: 0, k: colors.stroke },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 2.5 },
                lc: 2,
                lj: 2,
                nm: 'OuterStroke'
              },
              {
                ty: 'tr',
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                sk: { a: 0, k: 0 },
                sa: { a: 0, k: 0 },
                nm: 'Transform'
              }
            ],
            nm: 'OuterGroup'
          }
        ],
        ip: 0,
        op: 120,
        st: 0,
        bm: 0
      },

      // Layer 3: Mid Shield / Crest Embellishment
      {
        ddd: 0,
        ind: 3,
        ty: 4,
        nm: 'MidCrestPlate',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: makeFloatingRotation(-3, 3),
          p: { a: 0, k: [60, 60, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: makeBreathingScale(98, 103)
        },
        ao: 0,
        shapes: [
          {
            ty: 'gr',
            it: [
              {
                ty: 'sr',
                sy: 2, // Polygon
                d: 1,
                pt: { a: 0, k: 6 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                or: { a: 0, k: 28 },
                os: { a: 0, k: 4 },
                nm: 'MidPoly'
              },
              {
                ty: 'fl',
                c: { a: 0, k: colors.wing },
                o: { a: 0, k: 100 },
                r: 1,
                bm: 0,
                nm: 'WingFill'
              },
              {
                ty: 'st',
                c: { a: 0, k: colors.stroke },
                o: { a: 0, k: 90 },
                w: { a: 0, k: 2 },
                lc: 2,
                lj: 2,
                nm: 'MidStroke'
              },
              {
                ty: 'tr',
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                sk: { a: 0, k: 0 },
                sa: { a: 0, k: 0 },
                nm: 'Transform'
              }
            ],
            nm: 'MidGroup'
          }
        ],
        ip: 0,
        op: 120,
        st: 0,
        bm: 0
      },

      // Layer 4: Center Power Gem / Core
      {
        ddd: 0,
        ind: 4,
        ty: 4,
        nm: 'CenterGemCore',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: makeFloatingRotation(2, -2),
          p: { a: 0, k: [60, 60, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: makeBreathingScale(95, 106)
        },
        ao: 0,
        shapes: [
          {
            ty: 'gr',
            it: [
              {
                ty: 'sr',
                sy: 1,
                d: 1,
                pt: { a: 0, k: 4 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                ir: { a: 0, k: 8 },
                is: { a: 0, k: 0 },
                or: { a: 0, k: 18 },
                os: { a: 0, k: 3 },
                nm: 'CoreDiamond'
              },
              {
                ty: 'fl',
                c: { a: 0, k: colors.core },
                o: { a: 0, k: 100 },
                r: 1,
                bm: 0,
                nm: 'CoreFill'
              },
              {
                ty: 'st',
                c: { a: 0, k: colors.highlight },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 2 },
                lc: 2,
                lj: 2,
                nm: 'CoreStroke'
              },
              {
                ty: 'tr',
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                sk: { a: 0, k: 0 },
                sa: { a: 0, k: 0 },
                nm: 'Transform'
              }
            ],
            nm: 'CoreGroup'
          }
        ],
        ip: 0,
        op: 120,
        st: 0,
        bm: 0
      },

      // Layer 5: Sparkling Glint Highlight
      {
        ddd: 0,
        ind: 5,
        ty: 4,
        nm: 'SparkleGlint',
        sr: 1,
        ks: {
          o: makeAuraOpacity(40, 100),
          r: { a: 0, k: 45 },
          p: { a: 0, k: [60, 56, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: makeBreathingScale(80, 125)
        },
        ao: 0,
        shapes: [
          {
            ty: 'gr',
            it: [
              {
                ty: 'sr',
                sy: 1,
                d: 1,
                pt: { a: 0, k: 4 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                ir: { a: 0, k: 2 },
                is: { a: 0, k: 0 },
                or: { a: 0, k: 8 },
                os: { a: 0, k: 0 },
                nm: 'GlintStar'
              },
              {
                ty: 'fl',
                c: { a: 0, k: colors.highlight },
                o: { a: 0, k: 95 },
                r: 1,
                bm: 0,
                nm: 'GlintFill'
              },
              {
                ty: 'tr',
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                sk: { a: 0, k: 0 },
                sa: { a: 0, k: 0 },
                nm: 'Transform'
              }
            ],
            nm: 'GlintGroup'
          }
        ],
        ip: 0,
        op: 120,
        st: 0,
        bm: 0
      }
    ]
  };
}

// Write all 10 files
RANKS.forEach(rank => {
  const filePath = path.join(targetDir, `${rank.key}.json`);
  const data = generateLottie(rank);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Generated: ${rank.key}.json`);
});

console.log('All 10 LoL-themed rank animations generated successfully!');
