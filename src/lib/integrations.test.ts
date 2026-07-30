import { describe, expect, it, vi } from "vitest";
import { createMediaUpload, geocode, lookupCredential, meetingAdapter } from "./integrations";

describe("integration adapters (INT-2..INT-7)", () => {
  it("uses deterministic local meeting links without vendor calls", async () => {
    const request = {
      occurrenceId: "occ-1",
      title: "Flow",
      startsAt: new Date("2026-08-03T17:00:00Z"),
      durationMinutes: 60,
    };
    const adapter = meetingAdapter("zoom", { mode: "mock" });
    await expect(adapter.create(request)).resolves.toEqual(await adapter.create(request));
  });

  it("falls back to OSM geocoding when Google is not configured", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify([{ lat: "40.7", lon: "-74", display_name: "New York, USA" }])),
    );
    await expect(geocode("New York", { fetch: fetcher, googleKey: "" })).resolves.toMatchObject({
      provider: "osm",
      latitude: 40.7,
    });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("returns safe local states when credential and media vendors are absent", async () => {
    await expect(lookupCredential("yoga-alliance", "123")).resolves.toMatchObject({
      status: "not_found",
    });
    await expect(createMediaUpload({ filename: "class.jpg", contentType: "image/jpeg" })).resolves.toMatchObject({
      uploadUrl: expect.stringMatching(/^mock:\/\//),
      acceptedTypes: expect.arrayContaining(["image/jpeg"]),
    });
  });
});
