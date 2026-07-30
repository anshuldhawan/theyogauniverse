import { describe, expect, it } from "vitest";
import {
  migrateTermSlugs,
  resolveTerm,
  termLabel,
  vocabulary,
} from "./taxonomy";

describe("controlled taxonomy (LST-12/13)", () => {
  it("includes every cross-cutting controlled vocabulary", () => {
    expect(vocabulary("intensity").map((term) => term.slug)).toContain("vigorous");
    expect(vocabulary("temperature").map((term) => term.slug)).toContain("hot");
    expect(vocabulary("propUse").map((term) => term.slug)).toContain("props-used");
    expect(vocabulary("music").map((term) => term.slug)).toContain("music-led");
  });

  it("resolves synonyms accent-insensitively and displays translated labels", () => {
    expect(resolveTerm("yogaStyle", "VÍNYASA FLOW")?.slug).toBe("vinyasa");
    const beginner = resolveTerm("level", "beginner")!;
    expect(termLabel(beginner, "de")).toBe("Anfänger");
    expect(termLabel(beginner, "en")).toBe("Beginner");
  });

  it("migrates explicit replacements without orphaning unknown terms", () => {
    expect(
      migrateTermSlugs(["old-flow", "lineage-specific", "old-flow"], {
        fromVersion: "1",
        toVersion: "2",
        replacements: { "old-flow": "vinyasa" },
      }),
    ).toEqual({
      slugs: ["vinyasa", "lineage-specific"],
      taxonomyVersion: "2",
    });
  });
});
