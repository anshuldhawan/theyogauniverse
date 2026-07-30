import prototype from "@/data/seed/prototype.json";
import type { Article, ArticleSection } from "@/lib/editorial/types";

/**
 * The six prototype posts, migrated into the BLG content model as supporting
 * cluster posts. Slugs are preserved (BLG-14: immutable once indexed — these
 * were live at /blog/{id} before the module landed). Bodies are the original
 * prototype paragraphs, structured into question-shaped sections (BLG-37)
 * with answer blocks, sources and marketplace links added at migration.
 */

interface PrototypePost {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  meta: string;
  tint: string;
  body: string[];
}

const PROTO = new Map((prototype.POSTS as PrototypePost[]).map((p) => [p.id, p]));

const PUBLISHED = "2026-06-15";
const MODIFIED = "2026-07-28"; // substantive: answer blocks + sources added (BLG-63)
const EVERGREEN_REVIEW = "2027-07-28";

/** Slice the original paragraphs into sections without duplicating the text. */
function sectionsOf(
  id: string,
  spec: { heading: string; take: number; qualifier?: string }[],
): ArticleSection[] {
  const body = PROTO.get(id)!.body;
  let cursor = 0;
  return spec.map(({ heading, take, qualifier }) => {
    const paragraphs = body.slice(cursor, cursor + take);
    cursor += take;
    return { heading, paragraphs, ...(qualifier ? { qualifier } : {}) };
  });
}

function proto(id: string) {
  const p = PROTO.get(id)!;
  const minutes = Number(/(\d+)\s*min/.exec(p.meta)?.[1] ?? 6);
  return { title: p.title, excerpt: p.excerpt, tint: p.tint, minutes };
}

export const POSTS: Article[] = [
  {
    slug: "styles",
    ...proto("styles"),
    format: "comparison",
    clusterId: "practice-fundamentals",
    state: "published",
    authorSlug: "mara-ellison",
    // The prenatal section makes pregnancy claims — clinical tier (BLG-22).
    reviewerSlug: "leila-haddad",
    reviewTier: "clinical",
    answerBlock:
      "Yoga styles differ mainly in pace, structure and intent: Ashtanga follows a fixed sequence, vinyasa flows freely, hatha holds postures slowly, Iyengar prioritises precision with props, yin and restorative work passively on the floor, and kundalini centres breath and repetition. Beginners are usually happiest starting slow — hatha, yin or beginner vinyasa.",
    disclaimer: "standard",
    topics: ["ashtanga", "vinyasa", "hatha", "iyengar", "yin", "restorative", "kundalini", "prenatal"],
    sections: sectionsOf("styles", [
      { heading: "What are the main styles you will see on a timetable?", take: 3 },
      { heading: "How do the slower and more precise styles differ?", take: 3 },
      {
        heading: "Which styles are for specific situations?",
        take: 3,
        qualifier:
          "Prenatal practice is differently sequenced for good physiological reasons — please consult your doctor or midwife before practising while pregnant.",
      },
    ]),
    faqs: [],
    sources: [
      {
        url: "https://www.nccih.nih.gov/health/yoga-what-you-need-to-know",
        publication: "NIH NCCIH",
        author: "NCCIH",
        publishedYear: 2023,
        dateAccessed: "2026-07-25",
        claim: "Style categories and general safety framing.",
        archiveUrl: null,
      },
      {
        url: "https://www.yogaalliance.org/About_Yoga/Types_of_Yoga",
        publication: "Yoga Alliance",
        author: "Yoga Alliance",
        publishedYear: 2025,
        dateAccessed: "2026-07-25",
        claim: "Style taxonomy conventions across registered schools.",
        archiveUrl: null,
      },
      {
        url: "https://journals.sagepub.com/doi/10.1177/2325967116671703",
        publication: "Orthopaedic Journal of Sports Medicine",
        author: "Swain TA, McGwin G",
        publishedYear: 2016,
        dateAccessed: "2026-07-25",
        claim: "Injury patterns informing the try-slow-first advice.",
        archiveUrl: null,
      },
    ],
    related: [
      { href: "/directory?styles=ashtanga", anchor: "Ashtanga teachers and rooms" },
      { href: "/blog/how-to-start-yoga", anchor: "How to start yoga as a complete beginner" },
      { href: "/directory?styles=yin", anchor: "Yin and restorative classes" },
    ],
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    dateReviewed: "2026-07-28",
    nextReviewDue: EVERGREEN_REVIEW,
    aiAssisted: false,
  },

  {
    slug: "breath",
    ...proto("breath"),
    format: "explainer",
    clusterId: "meditation-breathwork",
    state: "published",
    authorSlug: "mara-ellison",
    reviewerSlug: "leila-haddad",
    reviewTier: "clinical",
    answerBlock:
      "Breathwork covers two nearly opposite practices: slow, downregulating techniques such as extended exhales and gentle nasal breathing, and fast, activating protocols involving conscious connected breathing or hyperventilation. The slow kind is safe for nearly everyone; the fast kind is intense and not suitable for everyone, so please consult your doctor before trying it.",
    disclaimer: "high-risk",
    topics: ["breathwork", "pranayama"],
    sections: sectionsOf("breath", [
      { heading: "Why does 'breathwork' mean two different things?", take: 1 },
      { heading: "What is the difference between slow and fast breathwork?", take: 2 },
      {
        heading: "How do you book the right kind of class?",
        take: 3,
        qualifier:
          "Fast, activating protocols carry specific risks and are not suitable for everyone — please consult your doctor before trying them, particularly with cardiovascular conditions, epilepsy, pregnancy, or a history of fainting.",
      },
    ]),
    faqs: [
      {
        id: "breathwork-crying",
        question: "Why do people cry in breathwork sessions?",
        answer:
          "Fast-paced protocols alter blood chemistry and arousal enough to release strong emotion — facilitators consider it common and unremarkable. It is one reason screened, supervised settings matter for activating work. If you are managing a psychiatric condition, please consult your doctor before booking a fast-paced session.",
        health: true,
      },
      {
        id: "daily-slow-breathing",
        question: "Is slow breathing worth practising daily?",
        answer:
          "Yes — a few minutes of extended-exhale breathing reliably downregulates the stress response, requires no equipment, and carries minimal risk for nearly everyone. Research on slow-paced breathing around six breaths per minute (Zaccaro et al., 2018) supports measurable parasympathetic effects even in short sessions. If breathing exercises ever feel wrong for your body, consult your doctor.",
        health: true,
      },
      {
        id: "wim-hof-safe",
        question: "Are breath-hold methods like Wim Hof safe?",
        answer:
          "They are hyperventilation-plus-retention protocols: never practise them in or near water, standing, or while driving, because fainting is documented. This practice is not suitable for everyone — please consult your doctor first with cardiovascular conditions, epilepsy, pregnancy, or a history of fainting.",
        health: true,
      },
    ],
    sources: [
      {
        url: "https://www.frontiersin.org/articles/10.3389/fnhum.2018.00353/full",
        publication: "Frontiers in Human Neuroscience",
        author: "Zaccaro A, Piarulli A, Laurino M, et al.",
        publishedYear: 2018,
        dateAccessed: "2026-07-25",
        claim: "Physiological effects of slow-paced breathing.",
        archiveUrl: null,
      },
      {
        url: "https://pubmed.ncbi.nlm.nih.gov/34004177/",
        publication: "Cell Reports Medicine",
        author: "Balban MY, Neri E, Kogon MM, et al.",
        publishedYear: 2023,
        dateAccessed: "2026-07-25",
        claim: "Exhale-emphasised breathing and mood/arousal outcomes.",
        archiveUrl: null,
      },
      {
        url: "https://www.nccih.nih.gov/health/meditation-and-mindfulness-what-you-need-to-know",
        publication: "NIH NCCIH",
        author: "NCCIH",
        publishedYear: 2024,
        dateAccessed: "2026-07-25",
        claim: "Safety framing for breath-based practices.",
        archiveUrl: null,
      },
    ],
    related: [
      { href: "/directory?kind=breathwork", anchor: "Breathwork classes with verified teachers" },
      { href: "/blog/meditation-and-breathwork-guide", anchor: "Meditation and breathwork, compared honestly" },
      { href: "/directory?styles=pranayama", anchor: "Pranayama-focused teachers" },
    ],
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    dateReviewed: "2026-07-28",
    nextReviewDue: EVERGREEN_REVIEW,
    aiAssisted: false,
  },

  {
    slug: "first",
    ...proto("first"),
    format: "how-to",
    clusterId: "practice-fundamentals",
    state: "published",
    authorSlug: "mara-ellison",
    reviewerSlug: "koji-yamada",
    reviewTier: "practice",
    answerBlock:
      "Your first yoga class follows a predictable arc: arrive ten minutes early, tell the teacher about any injuries honestly, expect a quiet start that feels strange, copy your neighbours instead of decoding Sanskrit, distinguish sharp pain (stop) from dull stretch (stay), and remain for the final rest. Feeling emotional or sleepy afterwards is normal.",
    disclaimer: "standard",
    topics: ["hatha", "vinyasa"],
    sections: sectionsOf("first", [
      {
        heading: "What should you do before the class starts?",
        take: 2,
        qualifier:
          "If you are recovering from an injury, tell the teacher specifically what it is — and please consult your doctor first about whether class practice is appropriate yet.",
      },
      { heading: "What happens during the class itself?", take: 3 },
      { heading: "How does the class end, and what comes after?", take: 2 },
    ]),
    faqs: [],
    sources: [
      {
        url: "https://www.nccih.nih.gov/health/yoga-what-you-need-to-know",
        publication: "NIH NCCIH",
        author: "NCCIH",
        publishedYear: 2023,
        dateAccessed: "2026-07-25",
        claim: "Beginner safety guidance: pain signals and disclosure to teachers.",
        archiveUrl: null,
      },
      {
        url: "https://www.acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines",
        publication: "American College of Sports Medicine",
        author: "ACSM",
        publishedYear: 2024,
        dateAccessed: "2026-07-25",
        claim: "Discomfort vs pain distinction in new exercise.",
        archiveUrl: null,
      },
      {
        url: "https://www.yogaalliance.org/2016yogainamericastudy",
        publication: "Yoga Alliance / Yoga Journal",
        author: "Yoga Alliance",
        publishedYear: 2016,
        dateAccessed: "2026-07-25",
        claim: "Beginner drop-off patterns and first-class expectations.",
        archiveUrl: null,
      },
    ],
    related: [
      { href: "/directory", anchor: "Find a beginner-friendly class" },
      { href: "/blog/how-to-start-yoga", anchor: "The complete beginner's guide" },
      { href: "/blog/props", anchor: "The only props you need in year one" },
    ],
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    dateReviewed: "2026-07-28",
    nextReviewDue: EVERGREEN_REVIEW,
    aiAssisted: false,
  },

  {
    slug: "retreat",
    ...proto("retreat"),
    format: "how-to",
    clusterId: "retreats",
    state: "published",
    authorSlug: "mara-ellison",
    reviewerSlug: null,
    reviewTier: "none",
    answerBlock:
      "Choose a retreat by reading its schedule, not its photographs: check how much unstructured time exists, how many guests attend, whether silence is involved and optional, whether rooms are shared, and how far the venue sits from the airport. Book your first retreat close to home so an early exit costs a train ticket, not a flight.",
    disclaimer: "none",
    topics: ["retreat"],
    sections: sectionsOf("retreat", [
      { heading: "Why do retreats disappoint predictable people predictably?", take: 1 },
      { heading: "What three questions should you ask about the schedule?", take: 3 },
      { heading: "What small details change the week most?", take: 2 },
    ]),
    faqs: [],
    sources: [
      {
        url: "https://www.gwi.org/reports/global-wellness-economy-monitor",
        publication: "Global Wellness Institute",
        author: "Global Wellness Institute",
        publishedYear: 2024,
        dateAccessed: "2026-07-25",
        claim: "Retreat travel growth and guest expectations.",
        archiveUrl: null,
      },
      {
        url: "https://www.abta.com/tips-and-advice/planning-and-booking-a-holiday/travel-insurance",
        publication: "ABTA",
        author: "ABTA",
        publishedYear: 2025,
        dateAccessed: "2026-07-25",
        claim: "Pre-paid activity holiday protections.",
        archiveUrl: null,
      },
      {
        url: "https://www.condorferries.co.uk/solo-travel-statistics",
        publication: "Condor (travel statistics compilation)",
        author: "Condor Research",
        publishedYear: 2025,
        dateAccessed: "2026-07-25",
        claim: "Group size and solo-traveller dynamics on organised trips.",
        archiveUrl: null,
      },
    ],
    related: [
      { href: "/directory?kind=retreat", anchor: "Browse retreats with real schedules" },
      { href: "/blog/yoga-retreat-guide", anchor: "The complete retreat guide" },
      { href: "/help/how-booking-works", anchor: "How booking and deposits work" },
    ],
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    dateReviewed: null,
    nextReviewDue: EVERGREEN_REVIEW,
    aiAssisted: false,
  },

  {
    slug: "teacher",
    ...proto("teacher"),
    format: "explainer",
    clusterId: "practice-fundamentals",
    state: "published",
    authorSlug: "koji-yamada",
    reviewerSlug: null,
    reviewTier: "none",
    answerBlock:
      "A good yoga teacher is measured by attention, not attendance: they notice the struggling student at the back, offer genuine alternatives when a pose is unavailable, cue sensation rather than only shape, adapt the class to the room in front of them, and leave you feeling better two hours later — not just two minutes.",
    disclaimer: "none",
    topics: ["teacher-training"],
    sections: sectionsOf("teacher", [
      { heading: "What separates a good teacher from a popular one?", take: 2 },
      { heading: "What should you listen and watch for in class?", take: 2 },
      { heading: "What questions reveal a teacher's depth?", take: 2 },
    ]),
    faqs: [],
    sources: [
      {
        url: "https://www.yogaalliance.org/Credentialing/Credentials_for_Teachers",
        publication: "Yoga Alliance",
        author: "Yoga Alliance",
        publishedYear: 2025,
        dateAccessed: "2026-07-25",
        claim: "What teacher credentials do and do not certify.",
        archiveUrl: null,
      },
      {
        url: "https://www.ibisworld.com/united-states/market-research-reports/pilates-yoga-studios-industry/",
        publication: "IBISWorld",
        author: "IBISWorld",
        publishedYear: 2025,
        dateAccessed: "2026-07-25",
        claim: "Teacher supply growth underpinning the popularity-vs-quality gap.",
        archiveUrl: null,
      },
      {
        url: "https://www.nccih.nih.gov/health/yoga-what-you-need-to-know",
        publication: "NIH NCCIH",
        author: "NCCIH",
        publishedYear: 2023,
        dateAccessed: "2026-07-25",
        claim: "Instructor qualification guidance for practice safety.",
        archiveUrl: null,
      },
    ],
    related: [
      { href: "/teachers/koji", anchor: "An example of a verified teacher profile" },
      { href: "/help/verification", anchor: "What the verified marker means" },
      { href: "/blog/how-to-start-yoga", anchor: "Starting yoga as a beginner" },
    ],
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    dateReviewed: null,
    nextReviewDue: EVERGREEN_REVIEW,
    aiAssisted: false,
  },

  {
    slug: "props",
    ...proto("props"),
    format: "how-to",
    clusterId: "practice-fundamentals",
    state: "published",
    authorSlug: "mara-ellison",
    reviewerSlug: "koji-yamada",
    reviewTier: "practice",
    answerBlock:
      "Two foam blocks are the entire first-year shopping list for yoga: they bring the floor closer and fix most beginner complaints about hamstrings, wrists and lower back. A strap comes second, and a dressing-gown cord substitutes fine. Mats matter less than marketing suggests, and bolsters can wait until a teacher recommends one.",
    disclaimer: "standard",
    topics: ["iyengar", "restorative"],
    sections: sectionsOf("props", [
      {
        heading: "Why are blocks the only essential purchase?",
        take: 2,
        qualifier:
          "Props also make practice workable around a diagnosis or old injury — please consult your doctor or physiotherapist about what your body is ready for before working around pain.",
      },
      { heading: "What comes after blocks, and when?", take: 3 },
      { heading: "What about clothing?", take: 1 },
    ]),
    faqs: [],
    sources: [
      {
        url: "https://iynaus.org/about-iyengar-yoga/",
        publication: "Iyengar Yoga National Association of the US",
        author: "IYNAUS",
        publishedYear: 2025,
        dateAccessed: "2026-07-25",
        claim: "Prop methodology originating in the Iyengar tradition.",
        archiveUrl: null,
      },
      {
        url: "https://www.nccih.nih.gov/health/yoga-what-you-need-to-know",
        publication: "NIH NCCIH",
        author: "NCCIH",
        publishedYear: 2023,
        dateAccessed: "2026-07-25",
        claim: "Adaptation and prop use for safe practice.",
        archiveUrl: null,
      },
      {
        url: "https://journals.sagepub.com/doi/10.1177/2325967116671703",
        publication: "Orthopaedic Journal of Sports Medicine",
        author: "Swain TA, McGwin G",
        publishedYear: 2016,
        dateAccessed: "2026-07-25",
        claim: "Overreaching injuries that props mitigate.",
        archiveUrl: null,
      },
    ],
    related: [
      { href: "/directory?styles=iyengar", anchor: "Iyengar teachers (the prop specialists)" },
      { href: "/blog/yoga-safety-guide", anchor: "Practising with injury or limitation" },
      { href: "/directory?styles=restorative", anchor: "Restorative classes" },
    ],
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    dateReviewed: "2026-07-28",
    nextReviewDue: EVERGREEN_REVIEW,
    aiAssisted: false,
  },
];
