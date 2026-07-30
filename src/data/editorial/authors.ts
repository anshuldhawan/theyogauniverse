import type { EditorialAuthor } from "@/lib/editorial/types";

/**
 * BLG-20: named human accountability — never a fabricated persona, an AI, or
 * a generic "Editorial Team". BLG-22: reviewer credentials are tiered;
 * practice-tier (registry-verified) reviewers never sign off clinical claims.
 */
export const AUTHORS: EditorialAuthor[] = [
  {
    slug: "mara-ellison",
    name: "Mara Ellison",
    role: "Senior editor",
    credentials: [{ label: "RYT-200", tier: "practice", issuer: "Yoga Alliance" }],
    yearsPractice: 12,
    bio: "Mara has edited health and travel journalism for fourteen years and has practised Ashtanga and yin yoga for twelve. She writes and edits most of The Yoga Universe's guides, and is accountable for their accuracy. She is not a clinician, and articles making physiological claims are reviewed by someone who is.",
    expertise: ["yoga styles", "retreat travel", "practice culture", "beginner guidance"],
    sameAs: ["https://www.linkedin.com/in/mara-ellison-editorial"],
    teacherSlug: null,
    state: "active",
  },
  {
    slug: "koji-yamada",
    name: "Koji Yamada",
    role: "Contributing teacher & practice reviewer",
    credentials: [
      { label: "RYT-500", tier: "practice", issuer: "Yoga Alliance" },
      { label: "KPJAYI Authorised Level 2", tier: "practice", issuer: "Sharath Yoga Centre" },
    ],
    yearsPractice: 21,
    bio: "Koji teaches Ashtanga and vinyasa in New York and reviews The Yoga Universe's practice-instruction content: technique, alignment, sequencing and contraindication awareness. His registry credentials are verified on his teacher profile. He does not review clinical or medical claims — those go to a clinician.",
    expertise: ["ashtanga", "vinyasa", "alignment", "teaching methodology"],
    sameAs: ["https://www.instagram.com/koji.ashtanga"],
    teacherSlug: "koji",
    state: "active",
  },
  {
    slug: "leila-haddad",
    name: "Dr. Leila Haddad, DPT",
    role: "Clinical reviewer",
    credentials: [
      { label: "Doctor of Physical Therapy", tier: "clinical", issuer: "Northwestern University" },
      { label: "Licensed Physiotherapist (NY)", tier: "clinical", issuer: "New York State" },
    ],
    yearsPractice: 9,
    bio: "Leila is a licensed physiotherapist specialising in movement rehabilitation. She reviews every The Yoga Universe article that makes physiological, therapeutic or clinical claims — injury, pregnancy, breathwork physiology and mental-health adjacent topics — and her review date appears on those articles.",
    expertise: ["injury rehabilitation", "prenatal movement", "breathwork physiology", "contraindications"],
    sameAs: ["https://www.linkedin.com/in/leila-haddad-dpt"],
    teacherSlug: null,
    state: "active",
  },
];
