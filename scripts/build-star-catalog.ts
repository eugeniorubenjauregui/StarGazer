/**
 * Generates src/data/stars.json, constellations.json and constellations-info.json
 * from the d3-celestial dataset (devDependency), which packages the HYG-derived
 * naked-eye star catalog (mag < 6) and the IAU-88 constellation stick figures,
 * with Spanish names for both stars and constellations.
 *
 * Run with: npm run build:catalog
 */
import * as fs from 'fs';
import * as path from 'path';
import type { Star, Constellation, ConstellationInfo, LineVertex } from '../src/services/catalog/types';

const DATA_DIR = path.join(process.cwd(), 'node_modules', 'd3-celestial', 'data');

interface CelestialStarFeature {
  id: number | string;
  properties: { mag: number };
  geometry: { coordinates: [number, number] };
}

interface CelestialLinesFeature {
  id: string;
  geometry: { coordinates: [number, number][][] };
}

interface CelestialConstellationFeature {
  id: string;
  properties: { es?: string; en?: string; name?: string; la?: string; display: [number, number, number?] };
}

interface CelestialStarName {
  name?: string;
  es?: string;
  /** IAU constellation membership code, e.g. "Ori". */
  c?: string;
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
}

/** d3-celestial stores longitudes in degrees within [-180, 180]; we use sidereal hours [0, 24). */
function lonToRaHours(lonDeg: number): number {
  return (((lonDeg % 360) + 360) % 360) / 15;
}

/**
 * Brief Spanish blurbs for every IAU constellation. The ten from the original
 * curated MVP catalog keep their longer mythology texts below.
 */
const BLURBS: Record<string, string> = {
  And: 'Andrómeda, la princesa encadenada rescatada por Perseo. Alberga la galaxia espiral más cercana a la Vía Láctea, M31.',
  Ant: 'La Máquina Neumática, nombrada en el siglo XVIII por Lacaille en honor a la bomba de aire de los laboratorios de física.',
  Aps: 'El Ave del Paraíso, constelación austral tenue introducida por navegantes holandeses en el siglo XVI.',
  Aql: 'El Águila que llevaba los rayos de Zeus. Su estrella principal, Altair, forma el Triángulo de Verano con Vega y Deneb.',
  Aqr: 'Acuario, el aguador que sirve néctar a los dioses. Una de las constelaciones más antiguas del zodíaco.',
  Ara: 'El Altar donde los dioses del Olimpo sellaron su alianza antes de enfrentar a los titanes.',
  Ari: 'Aries, el carnero del vellocino de oro que buscaban Jasón y los argonautas.',
  Aur: 'El Cochero, asociado a Erictonio, inventor del carro de cuatro caballos. Capella, su estrella más brillante, es la sexta del cielo.',
  Boo: 'El Boyero, pastor que conduce las osas alrededor del polo. Arturo, su estrella principal, es la más brillante del hemisferio norte celeste.',
  CVn: 'Los Perros de Caza del Boyero, Asterión y Chara, que persiguen a la Osa Mayor.',
  Cae: 'El Cincel, pequeña constelación austral nombrada por Lacaille en honor a las herramientas del grabador.',
  Cam: 'La Jirafa, constelación boreal tenue introducida en el siglo XVII para llenar el espacio entre las osas y Casiopea.',
  Cap: 'Capricornio, la cabra marina asociada al dios Pan, que se transformó a medias en pez para escapar del monstruo Tifón.',
  Car: 'La Quilla del navío Argo. Canopus, su estrella principal, es la segunda más brillante de todo el cielo.',
  Cen: 'El Centauro Quirón, sabio maestro de héroes. Alfa Centauri, el sistema estelar más cercano al Sol, marca su pata delantera.',
  Cep: 'Cefeo, rey de Etiopía, esposo de Casiopea y padre de Andrómeda.',
  Cet: 'La Ballena (o monstruo marino) enviada a devorar a Andrómeda, petrificada por Perseo con la cabeza de Medusa.',
  Cha: 'El Camaleón, constelación austral introducida por navegantes holandeses en el siglo XVI.',
  Cir: 'El Compás de dibujo, pequeña constelación austral nombrada por Lacaille.',
  CMi: 'El Can Menor, el segundo perro de Orión. Proción, su estrella principal, forma el Triángulo de Invierno con Sirio y Betelgeuse.',
  Cnc: 'Cáncer, el cangrejo que atacó a Hércules durante su lucha con la Hidra. Alberga el cúmulo del Pesebre (M44).',
  Col: 'La Paloma que guió el arca de Noé, o la que soltaron los argonautas para cruzar las rocas Simplégades.',
  Com: 'La Cabellera de Berenice, reina de Egipto que ofreció su cabello a los dioses por el regreso de su esposo.',
  CrA: 'La Corona Austral, guirnalda a los pies de Sagitario.',
  CrB: 'La Corona Boreal, diadema de Ariadna lanzada al cielo por Dioniso.',
  Crt: 'La Copa de Apolo, junto al Cuervo y la Hidra en un mismo mito.',
  Crv: 'El Cuervo de Apolo, castigado por mentir sobre su tardanza en traer agua.',
  Del: 'El Delfín que convenció a Anfitrite de casarse con Poseidón.',
  Dor: 'El Pez Dorado (dorado o mahi-mahi), constelación austral que alberga la Gran Nube de Magallanes.',
  Dra: 'El Dragón Ladón que custodiaba las manzanas de oro del jardín de las Hespérides, vencido por Hércules.',
  Equ: 'El Caballito, la segunda constelación más pequeña del cielo, asociado al potro Celeris.',
  Eri: 'El río Erídano, por donde cayó Faetón tras perder el control del carro del Sol. Serpentea desde Orión hasta Achernar.',
  For: 'El Horno químico, nombrado por Lacaille en honor a los instrumentos de laboratorio.',
  Gem: 'Géminis, los gemelos Cástor y Pólux, protectores de los navegantes y compañeros de los argonautas.',
  Gru: 'La Grulla, ave sagrada de Hermes, constelación austral del siglo XVI.',
  Her: 'Hércules arrodillado, el héroe de los doce trabajos. Alberga el gran cúmulo globular M13.',
  Hor: 'El Reloj de péndulo, constelación austral tenue nombrada por Lacaille.',
  Hya: 'La Hidra de Lerna, el monstruo de múltiples cabezas vencido por Hércules. Es la constelación más extensa del cielo.',
  Hyi: 'La Hidra Macho, pequeña serpiente austral cerca de las Nubes de Magallanes.',
  Ind: 'El Indio, constelación austral del siglo XVI que representa a un nativo americano.',
  LMi: 'El León Menor, pequeño felino entre el León y la Osa Mayor.',
  Lac: 'La Lagartija, constelación boreal tenue creada por Hevelius en el siglo XVII.',
  Lep: 'La Liebre que huye eternamente de Orión y sus perros a los pies del cazador.',
  Lib: 'Libra, la balanza de la justicia sostenida por Astrea (Virgo). Único instrumento del zodíaco.',
  Lup: 'El Lobo, animal empalado por el Centauro como ofrenda en el Altar.',
  Lyn: 'El Lince, nombrado así por Hevelius porque "hace falta vista de lince" para distinguir sus estrellas tenues.',
  Lyr: 'La Lira de Orfeo, cuya música encantaba a todo ser viviente. Vega, su estrella principal, es la quinta más brillante del cielo.',
  Men: 'La Mesa, nombrada por Lacaille en honor a la Montaña de la Mesa de Ciudad del Cabo. La más tenue de las 88.',
  Mic: 'El Microscopio, constelación austral nombrada por Lacaille en honor al instrumento científico.',
  Mon: 'El Unicornio, constelación ecuatorial del siglo XVII situada dentro del Triángulo de Invierno.',
  Mus: 'La Mosca, pequeña constelación austral junto a la Cruz del Sur.',
  Nor: 'La Escuadra de carpintero, constelación austral nombrada por Lacaille.',
  Oct: 'El Octante, instrumento de navegación. Contiene el polo sur celeste, sin ninguna estrella brillante que lo marque.',
  Oph: 'Ofiuco, el portador de la serpiente: Asclepio, dios de la medicina, capaz de resucitar a los muertos.',
  Pav: 'El Pavo real, ave de Hera, constelación austral del siglo XVI.',
  Peg: 'Pegaso, el caballo alado nacido de la sangre de Medusa. Su Gran Cuadrado es una referencia del cielo otoñal boreal.',
  Per: 'Perseo, el héroe que decapitó a Medusa y rescató a Andrómeda. Algol, su "estrella demonio", representa el ojo de la gorgona.',
  Phe: 'El Fénix, el ave que renace de sus cenizas, constelación austral del siglo XVI.',
  Pic: 'El Caballete del pintor, constelación austral nombrada por Lacaille.',
  PsA: 'El Pez Austral, que bebe el agua vertida por Acuario. Fomalhaut, su boca, es la estrella brillante más solitaria del cielo.',
  Psc: 'Piscis, los dos peces atados por una cuerda: Afrodita y Eros transformados para escapar de Tifón.',
  Pup: 'La Popa del navío Argo, fragmento de la antigua gran constelación desmembrada por Lacaille.',
  Pyx: 'La Brújula del navío Argo, nombrada por Lacaille.',
  Ret: 'El Retículo, en honor a la retícula del ocular con que Lacaille midió las estrellas australes.',
  Scl: 'El Escultor (originalmente "el taller del escultor"), nombrada por Lacaille. Contiene el polo sur galáctico.',
  Sct: 'El Escudo de Sobieski, en honor al rey polaco Juan III. La única constelación moderna nombrada por una figura histórica real.',
  Ser: 'La Serpiente de Asclepio, única constelación dividida en dos mitades (cabeza y cola) separadas por Ofiuco.',
  Sex: 'El Sextante astronómico de Hevelius, con el que midió posiciones estelares a simple vista.',
  Sge: 'La Flecha, tercera constelación más pequeña, asociada a las flechas de Cupido o de Hércules.',
  Sgr: 'Sagitario, el centauro arquero que apunta al corazón del Escorpión. Hacia él se encuentra el centro de la Vía Láctea.',
  Tel: 'El Telescopio, constelación austral nombrada por Lacaille.',
  TrA: 'El Triángulo Austral, contraparte sureña del Triángulo boreal.',
  Tri: 'El Triángulo, pequeña constelación boreal que alberga la galaxia espiral M33.',
  Tuc: 'El Tucán, ave sudamericana llevada al cielo austral por navegantes del siglo XVI. Alberga la Pequeña Nube de Magallanes.',
  Vel: 'Las Velas del navío Argo, fragmento de la antigua constelación de la nave de los argonautas.',
  Vir: 'Virgo, la diosa de la justicia Astrea, o Deméter con la espiga de trigo (Spica) en la mano.',
  Vol: 'El Pez Volador, constelación austral del siglo XVI.',
  Vul: 'La Zorra (con el ganso), creada por Hevelius. Alberga la nebulosa planetaria Dumbbell (M27).',
};

/** Longer curated texts for the constellations of the original MVP catalog. */
const CURATED_MYTHOLOGY: Record<string, string> = {
  UMa: 'En la mitología griega representa a Calisto, transformada en osa por Hera. Sus siete estrellas más brillantes forman el asterismo conocido como "El Carro" o "La Cacerola".',
  UMi: 'Contiene a Polaris, la estrella polar, casi exactamente alineada con el eje de rotación terrestre — por eso apenas se mueve en el cielo nocturno y sirve para encontrar el norte.',
  Cas: 'Representa a una reina castigada por Poseidón por su vanidad. Sus cinco estrellas principales forman una "W" fácilmente reconocible cerca del polo norte celeste.',
  Ori: 'El cazador de la mitología griega. Su "cinturón" de tres estrellas alineadas es uno de los patrones más reconocibles del cielo, visible desde casi cualquier lugar del planeta.',
  CMa: 'Uno de los perros de caza de Orión. Contiene a Sirio, la estrella más brillante del cielo nocturno.',
  Tau: 'Representa al toro en el que Zeus se transformó para raptar a Europa. Su ojo, Aldebarán, es una estrella gigante roja al frente del cúmulo de las Hyades.',
  Leo: 'El león de Nemea derrotado por Hércules. Su "hoz" de estrellas dibuja la cabeza y melena del león, con Régulo marcando su corazón.',
  Cru: 'La constelación más pequeña del cielo, visible desde el hemisferio sur y latitudes tropicales como Colombia. Se usa tradicionalmente para ubicar el polo sur celeste.',
  Sco: 'El escorpión que, según el mito, causó la muerte de Orión — por eso ambas constelaciones nunca se ven juntas en el cielo. Antares, su corazón, es una supergigante roja.',
  Cyg: 'También conocida como la "Cruz del Norte". Deneb, su estrella principal, forma parte del asterismo del Triángulo de Verano junto con Vega y Altair.',
};

function main(): void {
  const starsGeo = readJson<{ features: CelestialStarFeature[] }>('stars.6.json');
  const linesGeo = readJson<{ features: CelestialLinesFeature[] }>('constellations.lines.json');
  const consGeo = readJson<{ features: CelestialConstellationFeature[] }>('constellations.json');
  const starNames = readJson<Record<string, CelestialStarName>>('starnames.json');

  // --- Stars ---
  const stars: Star[] = [];
  const memberIdsByConstellation = new Map<string, string[]>();
  for (const feature of starsGeo.features) {
    if (feature.properties.mag >= 6) continue;
    const id = String(feature.id);
    const nameEntry = starNames[id];
    const name = nameEntry?.es || nameEntry?.name || undefined;
    stars.push({
      id,
      ...(name ? { name } : {}),
      ra: Number(lonToRaHours(feature.geometry.coordinates[0]).toFixed(4)),
      dec: Number(feature.geometry.coordinates[1].toFixed(4)),
      magnitude: feature.properties.mag,
    });
    const constellation = nameEntry?.c;
    if (constellation) {
      const members = memberIdsByConstellation.get(constellation) ?? [];
      members.push(id);
      memberIdsByConstellation.set(constellation, members);
    }
  }
  const starsById = new Map(stars.map((star) => [star.id, star]));

  // --- Constellations (lines) ---
  // Serpens appears as two features with the same id (head + tail); merge them.
  const linesById = new Map<string, LineVertex[][]>();
  for (const feature of linesGeo.features) {
    const existing = linesById.get(feature.id) ?? [];
    for (const line of feature.geometry.coordinates) {
      existing.push(
        line.map(([lon, lat]): LineVertex => [Number(lonToRaHours(lon).toFixed(4)), Number(lat.toFixed(4))])
      );
    }
    linesById.set(feature.id, existing);
  }

  const constellations: Constellation[] = [];
  const infos: ConstellationInfo[] = [];
  for (const feature of consGeo.features) {
    const code = feature.id;
    if (constellations.some((c) => c.id === code)) continue; // merged duplicate (Ser)
    const lines = linesById.get(code);
    if (!lines) throw new Error(`No line data for constellation ${code}`);
    const [displayLon, displayLat] = feature.properties.display;
    constellations.push({
      id: code,
      lines,
      label: [Number(lonToRaHours(displayLon).toFixed(4)), Number(displayLat.toFixed(4))],
    });

    const mainStars = (memberIdsByConstellation.get(code) ?? [])
      .map((id) => starsById.get(id))
      .filter((star): star is Star => star !== undefined && star.name !== undefined)
      .sort((a, b) => a.magnitude - b.magnitude)
      .slice(0, 6)
      .map((star) => star.id);

    const mythology = CURATED_MYTHOLOGY[code] ?? BLURBS[code];
    if (!mythology) throw new Error(`Missing blurb for constellation ${code}`);

    infos.push({
      id: code,
      name: feature.properties.es || feature.properties.en || feature.properties.name || code,
      latinName: feature.properties.la || feature.properties.name || code,
      mythology,
      mainStars,
    });
  }

  validate(stars, constellations, infos);

  const outDir = path.join(process.cwd(), 'src', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'stars.json'), JSON.stringify(stars) + '\n');
  fs.writeFileSync(path.join(outDir, 'constellations.json'), JSON.stringify(constellations) + '\n');
  fs.writeFileSync(path.join(outDir, 'constellations-info.json'), JSON.stringify(infos, null, 1) + '\n');

  console.log(`Wrote ${stars.length} stars, ${constellations.length} constellations to ${outDir}`);
}

function validate(stars: Star[], constellations: Constellation[], infos: ConstellationInfo[]): void {
  const errors: string[] = [];
  const starIds = new Set(stars.map((s) => s.id));
  if (starIds.size !== stars.length) errors.push('Duplicate star ids found.');

  for (const star of stars) {
    if (star.ra < 0 || star.ra >= 24) errors.push(`${star.id}: ra out of range: ${star.ra}`);
    if (star.dec < -90 || star.dec > 90) errors.push(`${star.id}: dec out of range: ${star.dec}`);
    if (star.magnitude >= 6) errors.push(`${star.id}: magnitude ${star.magnitude} above naked-eye cutoff.`);
  }

  if (constellations.length !== 88) errors.push(`Expected 88 constellations, got ${constellations.length}.`);
  for (const constellation of constellations) {
    if (constellation.lines.length === 0) errors.push(`${constellation.id}: no line data.`);
    for (const line of constellation.lines) {
      for (const [ra, dec] of line) {
        if (ra < 0 || ra >= 24 || dec < -90 || dec > 90) {
          errors.push(`${constellation.id}: vertex out of range [${ra}, ${dec}]`);
        }
      }
    }
  }

  const infoIds = new Set(infos.map((i) => i.id));
  for (const constellation of constellations) {
    if (!infoIds.has(constellation.id)) errors.push(`${constellation.id}: missing info entry.`);
  }
  for (const info of infos) {
    for (const starId of info.mainStars) {
      if (!starIds.has(starId)) errors.push(`${info.id}: unknown main star ${starId}.`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Star catalog validation failed:\n${errors.slice(0, 20).join('\n')}`);
  }
}

main();
