import type { ContentCluster } from "@/lib/editorial/types";

/** BLG-8 — the seven launch clusters, each anchored by a published pillar. */
export const CLUSTERS: ContentCluster[] = [
  {
    id: "practice-fundamentals",
    name: "Practice fundamentals",
    description: "Styles explained, what to expect, how to start, props, etiquette.",
    pillarSlug: "how-to-start-yoga",
  },
  {
    id: "teacher-training",
    name: "Teacher training",
    description: "200/300/500-hour training, choosing a school, accreditation, cost, careers.",
    pillarSlug: "yoga-teacher-training-guide",
  },
  {
    id: "retreats",
    name: "Retreats",
    description: "Choosing, budgeting, solo travel, what's included, destinations.",
    pillarSlug: "yoga-retreat-guide",
  },
  {
    id: "meditation-breathwork",
    name: "Meditation & breathwork",
    description: "Techniques, evidence, safety, getting started.",
    pillarSlug: "meditation-and-breathwork-guide",
  },
  {
    id: "safety-accessibility",
    name: "Safety, injury & accessibility",
    description: "Contraindications, adaptive practice, prenatal, trauma-informed teaching.",
    pillarSlug: "yoga-safety-guide",
  },
  {
    id: "teaching-business",
    name: "Teaching as a business",
    description: "For the supply side; doubles as a claim-conversion surface (ING-6).",
    pillarSlug: "teaching-yoga-as-a-business",
  },
  {
    id: "city-destination-guides",
    name: "City & destination guides",
    description: "The bridge between editorial and the 50 city hubs.",
    pillarSlug: "where-to-practice-yoga",
  },
];
