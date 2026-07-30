/**
 * LST-12/LST-13 — controlled vocabularies, centrally managed, versioned.
 * Terms are stable slugs; labels are translated via the i18n layer; synonyms
 * feed search matching (SRCH-8). Changing a term must not orphan listings —
 * terms are only ever deprecated (`deprecatedIn`), never deleted.
 */

export const TAXONOMY_VERSION = "2026-07.1";

export interface Term {
  slug: string;
  label: string;
  synonyms?: string[];
  /** Locale-specific display labels; stable slugs remain language-neutral. */
  translations?: Partial<Record<SupportedTaxonomyLocale, string>>;
  /** Version in which the term was deprecated; deprecated terms still resolve. */
  deprecatedIn?: string;
}

export type SupportedTaxonomyLocale = "en" | "de" | "es" | "fr" | "it" | "nl" | "pt";

const term = (
  slug: string,
  label: string,
  synonyms: string[] = [],
  translations: Term["translations"] = {},
): Term => ({
  slug,
  label,
  synonyms,
  translations,
});

export const MODALITIES: Term[] = [
  term("yoga", "Yoga"),
  term("meditation", "Meditation"),
  term("breathwork", "Breathwork", ["breath work", "pranayama"]),
  term("movement-somatics", "Movement / somatics", ["somatics"]),
  term("sound", "Sound", ["sound bath", "sound healing"]),
  term("philosophy-study", "Philosophy / study", ["sutra study"]),
];

export const YOGA_STYLES: Term[] = [
  term("vinyasa", "Vinyasa", ["flow", "vinyasa flow"]),
  term("hatha", "Hatha"),
  term("ashtanga", "Ashtanga", ["mysore"]),
  term("iyengar", "Iyengar"),
  term("yin", "Yin"),
  term("restorative", "Restorative"),
  term("kundalini", "Kundalini"),
  term("bikram-hot-26", "Bikram / Hot 26", ["bikram", "hot 26", "hot yoga"]),
  term("power", "Power"),
  term("jivamukti", "Jivamukti"),
  term("sivananda", "Sivananda"),
  term("rocket", "Rocket"),
  term("forrest", "Forrest"),
  term("aerial", "Aerial", ["antigravity"]),
  term("acro", "Acro", ["acroyoga"]),
  term("nidra", "Nidra", ["yoga nidra"]),
  term("prenatal", "Prenatal", ["pregnancy yoga", "postnatal"]),
  term("chair-adaptive", "Chair / Adaptive", ["chair yoga", "adaptive"]),
  term("kids", "Kids", ["children", "family"]),
  term("slow-flow", "Slow Flow"),
  term("mysore", "Mysore", ["self practice"]),
];

export const MEDITATION_STYLES: Term[] = [
  term("vipassana", "Vipassana"),
  term("mindfulness-mbsr", "Mindfulness / MBSR", ["mbsr", "mindfulness"]),
  term("metta", "Metta", ["loving kindness"]),
  term("zen-zazen", "Zen / Zazen", ["zen", "zazen"]),
  term("transcendental-style", "Transcendental-style", ["tm"]),
  term("guided", "Guided"),
  term("yoga-nidra", "Yoga Nidra", ["nidra"]),
  term("sound-meditation", "Sound", ["sound bath"]),
  term("non-dual", "Non-dual", ["advaita"]),
  term("tonglen", "Tonglen"),
];

export const BREATHWORK_STYLES: Term[] = [
  term("pranayama", "Pranayama"),
  term("conscious-connected", "Conscious Connected", ["ccb", "circular breathing"]),
  term("holotropic-style", "Holotropic-style", ["holotropic"]),
  term("wim-hof-method", "Wim Hof method", ["whm", "wim hof"]),
  term("buteyko", "Buteyko"),
  term("box-tactical", "Box / Tactical", ["box breathing", "tactical breathing"]),
];

export const LEVELS: Term[] = [
  term("beginner", "Beginner", [], {
    de: "Anfänger",
    es: "Principiante",
    fr: "Débutant",
    it: "Principiante",
    nl: "Beginner",
    pt: "Iniciante",
  }),
  term("intermediate", "Intermediate", [], {
    de: "Mittelstufe",
    es: "Intermedio",
    fr: "Intermédiaire",
    it: "Intermedio",
    nl: "Gemiddeld",
    pt: "Intermédio",
  }),
  term("advanced", "Advanced", [], {
    de: "Fortgeschritten",
    es: "Avanzado",
    fr: "Avancé",
    it: "Avanzato",
    nl: "Gevorderd",
    pt: "Avançado",
  }),
];

export const INTENSITIES: Term[] = [
  term("gentle", "Gentle"),
  term("moderate", "Moderate"),
  term("vigorous", "Vigorous"),
];

export const TEMPERATURES: Term[] = [
  term("unheated", "Unheated"),
  term("warm", "Warm"),
  term("hot", "Hot"),
];

export const PROP_USE: Term[] = [
  term("no-props", "No props"),
  term("optional-props", "Props optional"),
  term("props-used", "Props used"),
];

export const MUSIC: Term[] = [
  term("no-music", "No music"),
  term("background-music", "Background music"),
  term("music-led", "Music-led"),
];

export const SPECIALISMS: Term[] = [
  term("prenatal-specialism", "Prenatal"),
  term("trauma-informed", "Trauma-informed"),
  term("adaptive-chair", "Adaptive / chair"),
  term("kids-specialism", "Kids"),
  term("seniors", "Seniors"),
  term("plus-size-affirming", "Plus-size-affirming"),
  term("lgbtq-affirming", "LGBTQ+-affirming"),
];

const ALL_VOCABULARIES = {
  modality: MODALITIES,
  yogaStyle: YOGA_STYLES,
  meditationStyle: MEDITATION_STYLES,
  breathworkStyle: BREATHWORK_STYLES,
  level: LEVELS,
  intensity: INTENSITIES,
  temperature: TEMPERATURES,
  propUse: PROP_USE,
  music: MUSIC,
  specialism: SPECIALISMS,
} as const;

export type VocabularyName = keyof typeof ALL_VOCABULARIES;

export function vocabulary(name: VocabularyName): Term[] {
  return ALL_VOCABULARIES[name];
}

export function termLabel(term: Term, locale: SupportedTaxonomyLocale): string {
  return locale === "en" ? term.label : (term.translations?.[locale] ?? term.label);
}

/** Resolve free text to a term slug via label/synonym match (accent-insensitive, SRCH-8). */
export function resolveTerm(name: VocabularyName, input: string): Term | undefined {
  const normalized = normalize(input);
  return ALL_VOCABULARIES[name].find(
    (t) =>
      normalize(t.label) === normalized ||
      t.slug === normalized ||
      (t.synonyms ?? []).some((s) => normalize(s) === normalized),
  );
}

export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** All style terms across modalities — used by directory filters and search. */
export function allStyleTerms(): Term[] {
  return [...YOGA_STYLES, ...MEDITATION_STYLES, ...BREATHWORK_STYLES].filter(
    (t, i, arr) => arr.findIndex((x) => x.slug === t.slug) === i,
  );
}

export interface TaxonomyMigration {
  fromVersion: string;
  toVersion: string;
  replacements: Readonly<Record<string, string>>;
}

/**
 * LST-13 migration helper. Unknown and deprecated slugs are retained unless a
 * versioned replacement is explicitly supplied, so existing listings cannot
 * be orphaned by a vocabulary release.
 */
export function migrateTermSlugs(
  slugs: string[],
  migration: TaxonomyMigration,
): { slugs: string[]; taxonomyVersion: string } {
  return {
    slugs: [...new Set(slugs.map((slug) => migration.replacements[slug] ?? slug))],
    taxonomyVersion: migration.toVersion,
  };
}
