/**
 * Generates src/data/stars.json, constellations.json and constellations-info.json
 * from the hand-curated seed data below.
 *
 * This MVP seed is a bright-star subset (10 well-known constellations, both
 * hemispheres) rather than a full HYG/IAU-88 import — good enough to demo the
 * sky map end to end. Swapping in a full magnitude<6 catalog later only
 * requires replacing STARS/CONSTELLATIONS below (or the source they come
 * from) and re-running `npm run build:catalog`; nothing downstream changes.
 *
 * Run with: npm run build:catalog
 */
import * as fs from 'fs';
import * as path from 'path';
import type { Star, Constellation, ConstellationInfo } from '../src/services/catalog/types';

const STARS: Star[] = [
  // Ursa Major
  { id: 'dubhe', name: 'Dubhe', ra: 11.062, dec: 61.751, magnitude: 1.79 },
  { id: 'merak', name: 'Merak', ra: 11.031, dec: 56.382, magnitude: 2.37 },
  { id: 'phecda', name: 'Phecda', ra: 11.897, dec: 53.695, magnitude: 2.44 },
  { id: 'megrez', name: 'Megrez', ra: 12.257, dec: 57.033, magnitude: 3.31 },
  { id: 'alioth', name: 'Alioth', ra: 12.9, dec: 55.96, magnitude: 1.77 },
  { id: 'mizar', name: 'Mizar', ra: 13.399, dec: 54.925, magnitude: 2.23 },
  { id: 'alkaid', name: 'Alkaid', ra: 13.792, dec: 49.313, magnitude: 1.86 },

  // Ursa Minor
  { id: 'polaris', name: 'Polaris', ra: 2.5303, dec: 89.264, magnitude: 1.98 },
  { id: 'kochab', name: 'Kochab', ra: 14.845, dec: 74.156, magnitude: 2.08 },
  { id: 'pherkad', name: 'Pherkad', ra: 15.345, dec: 71.834, magnitude: 3.05 },

  // Cassiopeia
  { id: 'caph', name: 'Caph', ra: 0.153, dec: 59.15, magnitude: 2.28 },
  { id: 'schedar', name: 'Schedar', ra: 0.675, dec: 56.537, magnitude: 2.24 },
  { id: 'gamma-cas', name: 'Gamma Cassiopeiae', ra: 0.945, dec: 60.717, magnitude: 2.47 },
  { id: 'ruchbah', name: 'Ruchbah', ra: 1.43, dec: 60.235, magnitude: 2.68 },
  { id: 'segin', name: 'Segin', ra: 1.907, dec: 63.67, magnitude: 3.35 },

  // Orion
  { id: 'betelgeuse', name: 'Betelgeuse', ra: 5.919, dec: 7.407, magnitude: 0.45 },
  { id: 'rigel', name: 'Rigel', ra: 5.242, dec: -8.202, magnitude: 0.13 },
  { id: 'bellatrix', name: 'Bellatrix', ra: 5.418, dec: 6.35, magnitude: 1.64 },
  { id: 'mintaka', name: 'Mintaka', ra: 5.533, dec: -0.299, magnitude: 2.23 },
  { id: 'alnilam', name: 'Alnilam', ra: 5.603, dec: -1.202, magnitude: 1.69 },
  { id: 'alnitak', name: 'Alnitak', ra: 5.679, dec: -1.943, magnitude: 1.88 },
  { id: 'saiph', name: 'Saiph', ra: 5.796, dec: -9.67, magnitude: 2.09 },

  // Canis Major
  { id: 'sirius', name: 'Sirius', ra: 6.752, dec: -16.716, magnitude: -1.46 },
  { id: 'murzim', name: 'Murzim', ra: 6.378, dec: -17.956, magnitude: 1.98 },
  { id: 'wezen', name: 'Wezen', ra: 7.14, dec: -26.393, magnitude: 1.83 },
  { id: 'adhara', name: 'Adhara', ra: 6.977, dec: -28.972, magnitude: 1.5 },
  { id: 'aludra', name: 'Aludra', ra: 7.402, dec: -29.303, magnitude: 2.45 },

  // Taurus
  { id: 'aldebaran', name: 'Aldebaran', ra: 4.599, dec: 16.509, magnitude: 0.87 },
  { id: 'elnath', name: 'Elnath', ra: 5.438, dec: 28.608, magnitude: 1.65 },
  { id: 'hyadum-1', name: 'Hyadum I', ra: 4.329, dec: 15.627, magnitude: 3.65 },
  { id: 'hyadum-2', name: 'Hyadum II', ra: 4.383, dec: 17.543, magnitude: 3.76 },
  { id: 'ain', name: 'Ain', ra: 4.477, dec: 19.181, magnitude: 3.53 },

  // Leo
  { id: 'regulus', name: 'Regulus', ra: 10.139, dec: 11.967, magnitude: 1.35 },
  { id: 'denebola', name: 'Denebola', ra: 11.818, dec: 14.572, magnitude: 2.14 },
  { id: 'algieba', name: 'Algieba', ra: 10.333, dec: 19.842, magnitude: 2.08 },
  { id: 'zosma', name: 'Zosma', ra: 11.235, dec: 20.524, magnitude: 2.56 },
  { id: 'chertan', name: 'Chertan', ra: 11.237, dec: 15.43, magnitude: 3.34 },
  { id: 'adhafera', name: 'Adhafera', ra: 10.278, dec: 23.417, magnitude: 3.44 },
  { id: 'rasalas', name: 'Rasalas', ra: 9.881, dec: 26.007, magnitude: 3.88 },
  { id: 'eps-leo', name: 'Epsilon Leonis', ra: 9.764, dec: 23.774, magnitude: 2.98 },

  // Crux (Southern Cross)
  { id: 'acrux', name: 'Acrux', ra: 12.443, dec: -63.099, magnitude: 0.77 },
  { id: 'mimosa', name: 'Mimosa', ra: 12.795, dec: -59.689, magnitude: 1.25 },
  { id: 'gacrux', name: 'Gacrux', ra: 12.519, dec: -57.113, magnitude: 1.63 },
  { id: 'delta-cru', name: 'Delta Crucis', ra: 12.252, dec: -58.749, magnitude: 2.79 },

  // Scorpius
  { id: 'antares', name: 'Antares', ra: 16.49, dec: -26.432, magnitude: 0.96 },
  { id: 'graffias', name: 'Graffias', ra: 16.09, dec: -19.805, magnitude: 2.56 },
  { id: 'dschubba', name: 'Dschubba', ra: 16.006, dec: -22.622, magnitude: 2.29 },
  { id: 'sargas', name: 'Sargas', ra: 17.622, dec: -42.998, magnitude: 1.87 },
  { id: 'shaula', name: 'Shaula', ra: 17.56, dec: -37.104, magnitude: 1.62 },
  { id: 'lesath', name: 'Lesath', ra: 17.512, dec: -37.296, magnitude: 2.7 },

  // Cygnus
  { id: 'deneb', name: 'Deneb', ra: 20.69, dec: 45.28, magnitude: 1.25 },
  { id: 'albireo', name: 'Albireo', ra: 19.512, dec: 27.96, magnitude: 3.18 },
  { id: 'sadr', name: 'Sadr', ra: 20.37, dec: 40.257, magnitude: 2.2 },
  { id: 'gienah-cyg', name: 'Gienah Cygni', ra: 20.77, dec: 33.97, magnitude: 2.46 },
  { id: 'fawaris', name: 'Fawaris', ra: 19.749, dec: 45.131, magnitude: 2.87 },
];

const CONSTELLATIONS: Constellation[] = [
  {
    id: 'ursa-major',
    segments: [
      ['dubhe', 'merak'],
      ['merak', 'phecda'],
      ['phecda', 'megrez'],
      ['megrez', 'dubhe'],
      ['megrez', 'alioth'],
      ['alioth', 'mizar'],
      ['mizar', 'alkaid'],
    ],
  },
  {
    id: 'ursa-minor',
    segments: [
      ['polaris', 'kochab'],
      ['kochab', 'pherkad'],
    ],
  },
  {
    id: 'cassiopeia',
    segments: [
      ['caph', 'schedar'],
      ['schedar', 'gamma-cas'],
      ['gamma-cas', 'ruchbah'],
      ['ruchbah', 'segin'],
    ],
  },
  {
    id: 'orion',
    segments: [
      ['bellatrix', 'betelgeuse'],
      ['betelgeuse', 'alnitak'],
      ['alnitak', 'alnilam'],
      ['alnilam', 'mintaka'],
      ['mintaka', 'bellatrix'],
      ['alnitak', 'saiph'],
      ['mintaka', 'rigel'],
      ['saiph', 'rigel'],
    ],
  },
  {
    id: 'canis-major',
    segments: [
      ['murzim', 'sirius'],
      ['sirius', 'adhara'],
      ['adhara', 'wezen'],
      ['wezen', 'aludra'],
    ],
  },
  {
    id: 'taurus',
    segments: [
      ['hyadum-1', 'hyadum-2'],
      ['hyadum-2', 'ain'],
      ['ain', 'aldebaran'],
      ['aldebaran', 'elnath'],
    ],
  },
  {
    id: 'leo',
    segments: [
      ['eps-leo', 'rasalas'],
      ['rasalas', 'adhafera'],
      ['adhafera', 'algieba'],
      ['algieba', 'regulus'],
      ['regulus', 'zosma'],
      ['zosma', 'denebola'],
      ['zosma', 'chertan'],
      ['chertan', 'denebola'],
    ],
  },
  {
    id: 'crux',
    segments: [
      ['gacrux', 'acrux'],
      ['mimosa', 'delta-cru'],
    ],
  },
  {
    id: 'scorpius',
    segments: [
      ['graffias', 'dschubba'],
      ['dschubba', 'antares'],
      ['antares', 'sargas'],
      ['sargas', 'shaula'],
      ['shaula', 'lesath'],
    ],
  },
  {
    id: 'cygnus',
    segments: [
      ['deneb', 'sadr'],
      ['sadr', 'albireo'],
      ['fawaris', 'sadr'],
      ['sadr', 'gienah-cyg'],
    ],
  },
];

const CONSTELLATIONS_INFO: ConstellationInfo[] = [
  {
    id: 'ursa-major',
    name: 'Osa Mayor',
    latinName: 'Ursa Major',
    mythology:
      'En la mitología griega representa a Calisto, transformada en osa por Hera. Sus siete estrellas más brillantes forman el asterismo conocido como "El Carro" o "La Cacerola".',
    mainStars: ['dubhe', 'merak', 'phecda', 'megrez', 'alioth', 'mizar', 'alkaid'],
  },
  {
    id: 'ursa-minor',
    name: 'Osa Menor',
    latinName: 'Ursa Minor',
    mythology:
      'Contiene a Polaris, la estrella polar, casi exactamente alineada con el eje de rotación terrestre — por eso apenas se mueve en el cielo nocturno y sirve para encontrar el norte.',
    mainStars: ['polaris', 'kochab', 'pherkad'],
  },
  {
    id: 'cassiopeia',
    name: 'Casiopea',
    latinName: 'Cassiopeia',
    mythology:
      'Representa a una reina castigada por Poseidón por su vanidad. Sus cinco estrellas principales forman una "W" fácilmente reconocible cerca del polo norte celeste.',
    mainStars: ['caph', 'schedar', 'gamma-cas', 'ruchbah', 'segin'],
  },
  {
    id: 'orion',
    name: 'Orión',
    latinName: 'Orion',
    mythology:
      'El cazador de la mitología griega. Su "cinturón" de tres estrellas alineadas es uno de los patrones más reconocibles del cielo, visible desde casi cualquier lugar del planeta.',
    mainStars: ['betelgeuse', 'rigel', 'bellatrix', 'mintaka', 'alnilam', 'alnitak', 'saiph'],
  },
  {
    id: 'canis-major',
    name: 'Can Mayor',
    latinName: 'Canis Major',
    mythology:
      'Uno de los perros de caza de Orión. Contiene a Sirio, la estrella más brillante del cielo nocturno.',
    mainStars: ['sirius', 'murzim', 'wezen', 'adhara', 'aludra'],
  },
  {
    id: 'taurus',
    name: 'Tauro',
    latinName: 'Taurus',
    mythology:
      'Representa al toro en el que Zeus se transformó para raptar a Europa. Su ojo, Aldebarán, es una estrella gigante roja al frente del cúmulo de las Hyades.',
    mainStars: ['aldebaran', 'elnath', 'hyadum-1', 'hyadum-2', 'ain'],
  },
  {
    id: 'leo',
    name: 'Leo',
    latinName: 'Leo',
    mythology:
      'El león de Nemea derrotado por Hércules. Su "hoz" de estrellas dibuja la cabeza y melena del león, con Régulo marcando su corazón.',
    mainStars: ['regulus', 'denebola', 'algieba', 'zosma', 'chertan', 'adhafera', 'rasalas', 'eps-leo'],
  },
  {
    id: 'crux',
    name: 'Cruz del Sur',
    latinName: 'Crux',
    mythology:
      'La constelación más pequeña del cielo, visible desde el hemisferio sur y latitudes tropicales como Colombia. Se usa tradicionalmente para ubicar el polo sur celeste.',
    mainStars: ['acrux', 'mimosa', 'gacrux', 'delta-cru'],
  },
  {
    id: 'scorpius',
    name: 'Escorpión',
    latinName: 'Scorpius',
    mythology:
      'El escorpión que, según el mito, causó la muerte de Orión — por eso ambas constelaciones nunca se ven juntas en el cielo. Antares, su corazón, es una supergigante roja.',
    mainStars: ['antares', 'graffias', 'dschubba', 'sargas', 'shaula', 'lesath'],
  },
  {
    id: 'cygnus',
    name: 'Cisne',
    latinName: 'Cygnus',
    mythology:
      'También conocida como la "Cruz del Norte". Deneb, su estrella principal, forma parte del asterismo del Triángulo de Verano junto con Vega y Altair.',
    mainStars: ['deneb', 'sadr', 'albireo', 'gienah-cyg', 'fawaris'],
  },
];

function validate(): void {
  const starIds = new Set(STARS.map((s) => s.id));
  const errors: string[] = [];

  if (starIds.size !== STARS.length) errors.push('Duplicate star ids found.');

  for (const star of STARS) {
    if (star.ra < 0 || star.ra >= 24) errors.push(`${star.id}: ra out of range [0,24): ${star.ra}`);
    if (star.dec < -90 || star.dec > 90) errors.push(`${star.id}: dec out of range [-90,90]: ${star.dec}`);
    if (star.magnitude >= 6) errors.push(`${star.id}: magnitude ${star.magnitude} is fainter than naked-eye cutoff (6).`);
  }

  for (const constellation of CONSTELLATIONS) {
    for (const [a, b] of constellation.segments) {
      if (!starIds.has(a)) errors.push(`${constellation.id}: unknown star id "${a}" in segments.`);
      if (!starIds.has(b)) errors.push(`${constellation.id}: unknown star id "${b}" in segments.`);
    }
  }

  const constellationIds = new Set(CONSTELLATIONS.map((c) => c.id));
  for (const info of CONSTELLATIONS_INFO) {
    if (!constellationIds.has(info.id)) errors.push(`constellations-info: "${info.id}" has no matching constellation entry.`);
    for (const starId of info.mainStars) {
      if (!starIds.has(starId)) errors.push(`${info.id}: unknown main star id "${starId}".`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Star catalog validation failed:\n${errors.join('\n')}`);
  }
}

function main(): void {
  validate();

  const outDir = path.join(process.cwd(), 'src', 'data');
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, 'stars.json'), JSON.stringify(STARS, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, 'constellations.json'), JSON.stringify(CONSTELLATIONS, null, 2) + '\n');
  fs.writeFileSync(
    path.join(outDir, 'constellations-info.json'),
    JSON.stringify(CONSTELLATIONS_INFO, null, 2) + '\n'
  );

  console.log(
    `Wrote ${STARS.length} stars, ${CONSTELLATIONS.length} constellations to ${outDir}`
  );
}

main();
