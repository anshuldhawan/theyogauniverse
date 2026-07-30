import { describe, expect, it } from "vitest";
import { assertDataRegion, dataRegionFor, LAUNCH_SCALE, SERVICE_LEVELS } from "./platform";

describe("platform NFR configuration", () => {
  it("encodes the contractual latency, recovery, and scale budgets", () => {
    expect(SERVICE_LEVELS.searchP95Ms).toBe(400);
    expect(SERVICE_LEVELS.bookingConfirmationP95Ms).toBe(2_000);
    expect(SERVICE_LEVELS.recoveryPointMinutes).toBe(15);
    expect(LAUNCH_SCALE.occurrences * LAUNCH_SCALE.headroomMultiplier).toBe(80_000_000);
  });

  it("routes EU/UK and Australian subjects to their required data regions", () => {
    expect(dataRegionFor("DE")).toBe("eu");
    expect(dataRegionFor("GB")).toBe("eu");
    expect(dataRegionFor("AU")).toBe("au");
    expect(dataRegionFor("US")).toBe("us");
    expect(() => assertDataRegion("DE", "us")).toThrow("Residency violation");
  });
});
