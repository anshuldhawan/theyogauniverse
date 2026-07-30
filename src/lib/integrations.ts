/**
 * INT-2..INT-7 provider boundaries. Every integration has a deterministic
 * local adapter; production adapters are selected only when explicitly
 * configured, so CI never calls a vendor accidentally.
 */

import { createHash, randomUUID } from "node:crypto";

export type IntegrationMode = "mock" | "provider";

export interface MeetingLink {
  provider: "zoom" | "google_meet" | "webrtc";
  joinUrl: string;
  externalId: string;
}

export interface MeetingRequest {
  occurrenceId: string;
  title: string;
  startsAt: Date;
  durationMinutes: number;
}

export interface MeetingAdapter {
  create(request: MeetingRequest): Promise<MeetingLink>;
}

export function meetingAdapter(
  provider: MeetingLink["provider"],
  options: { mode?: IntegrationMode; fetch?: typeof fetch } = {},
): MeetingAdapter {
  const mode = options.mode ?? (process.env.INTEGRATIONS_MODE === "provider" ? "provider" : "mock");
  const fetcher = options.fetch ?? fetch;
  if (mode === "mock") {
    return {
      async create(request) {
        const id = createHash("sha256").update(`${provider}:${request.occurrenceId}`).digest("hex").slice(0, 16);
        const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
        return { provider, externalId: `mock_${id}`, joinUrl: `${base}/meet/${id}` };
      },
    };
  }
  if (provider === "webrtc") {
    return {
      async create(request) {
        const id = randomUUID();
        const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
        return { provider, externalId: id, joinUrl: `${base}/meet/${id}` };
      },
    };
  }
  return {
    async create(request) {
      const endpoint =
        provider === "zoom" ? "https://api.zoom.us/v2/users/me/meetings" : process.env.GOOGLE_MEET_API_URL;
      const token = provider === "zoom" ? process.env.ZOOM_ACCESS_TOKEN : process.env.GOOGLE_MEET_ACCESS_TOKEN;
      if (!endpoint || !token) throw new Error(`${provider} integration is not configured`);
      const response = await fetcher(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: request.title,
          start_time: request.startsAt.toISOString(),
          duration: request.durationMinutes,
          occurrenceId: request.occurrenceId,
        }),
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) throw new Error(`${provider} meeting creation failed (${response.status})`);
      const body = (await response.json()) as { id?: string | number; join_url?: string; meetingUri?: string };
      const joinUrl = body.join_url ?? body.meetingUri;
      if (!joinUrl || body.id === undefined) throw new Error(`${provider} returned an invalid meeting`);
      return { provider, externalId: String(body.id), joinUrl };
    },
  };
}

export interface BusinessProfile {
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  hours: Record<string, string>;
  reviewCount: number | null;
  rating: number | null;
}

export async function fetchGoogleBusinessProfile(
  locationId: string,
  options: { accessToken?: string; fetch?: typeof fetch } = {},
): Promise<BusinessProfile> {
  const token = options.accessToken ?? process.env.GOOGLE_BUSINESS_ACCESS_TOKEN;
  if (!token) throw new Error("Google Business Profile is not configured");
  const response = await (options.fetch ?? fetch)(
    `https://mybusinessbusinessinformation.googleapis.com/v1/locations/${encodeURIComponent(locationId)}?readMask=name,title,storefrontAddress,phoneNumbers,websiteUri,regularHours`,
    { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8_000) },
  );
  if (!response.ok) throw new Error(`Google Business Profile lookup failed (${response.status})`);
  const body = (await response.json()) as Record<string, unknown>;
  return {
    name: String(body.title ?? body.name ?? ""),
    address: JSON.stringify(body.storefrontAddress ?? {}),
    phone: ((body.phoneNumbers as { primaryPhone?: string } | undefined)?.primaryPhone) ?? null,
    website: typeof body.websiteUri === "string" ? body.websiteUri : null,
    hours: (body.regularHours as Record<string, string> | undefined) ?? {},
    reviewCount: null,
    rating: null,
  };
}

export interface GeoResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  provider: "google" | "osm";
}

export async function geocode(
  query: string,
  options: { googleKey?: string; fetch?: typeof fetch } = {},
): Promise<GeoResult | null> {
  const fetcher = options.fetch ?? fetch;
  const key = options.googleKey ?? process.env.GOOGLE_MAPS_API_KEY;
  if (key) {
    const response = await fetcher(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${encodeURIComponent(key)}`,
      { signal: AbortSignal.timeout(6_000) },
    );
    if (response.ok) {
      const body = (await response.json()) as {
        results?: Array<{ formatted_address: string; geometry: { location: { lat: number; lng: number } } }>;
      };
      const first = body.results?.[0];
      if (first) return {
        latitude: first.geometry.location.lat,
        longitude: first.geometry.location.lng,
        formattedAddress: first.formatted_address,
        provider: "google",
      };
    }
  }
  const response = await fetcher(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
    { headers: { "User-Agent": "TheYogaUniverse/1.0" }, signal: AbortSignal.timeout(6_000) },
  );
  if (!response.ok) return null;
  const first = ((await response.json()) as Array<{ lat: string; lon: string; display_name: string }>)[0];
  return first
    ? { latitude: Number(first.lat), longitude: Number(first.lon), formattedAddress: first.display_name, provider: "osm" }
    : null;
}

export interface CredentialLookup {
  registry: string;
  registryId: string;
  name: string;
  status: "verified" | "lapsed" | "not_found";
  expiresAt: string | null;
}

export async function lookupCredential(
  registry: string,
  registryId: string,
  options: { endpoint?: string; apiKey?: string; fetch?: typeof fetch } = {},
): Promise<CredentialLookup> {
  const endpoint = options.endpoint ?? process.env.CREDENTIAL_REGISTRY_API_URL;
  const apiKey = options.apiKey ?? process.env.CREDENTIAL_REGISTRY_API_KEY;
  if (!endpoint || !apiKey) {
    return { registry, registryId, name: "", status: "not_found", expiresAt: null };
  }
  const response = await (options.fetch ?? fetch)(
    `${endpoint.replace(/\/$/, "")}/${encodeURIComponent(registry)}/${encodeURIComponent(registryId)}`,
    { headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(8_000) },
  );
  if (response.status === 404) return { registry, registryId, name: "", status: "not_found", expiresAt: null };
  if (!response.ok) throw new Error(`Credential registry failed (${response.status})`);
  const body = (await response.json()) as Omit<CredentialLookup, "registry" | "registryId">;
  return { registry, registryId, ...body };
}

export async function sendSms(
  input: { to: string; text: string },
  options: { fetch?: typeof fetch } = {},
): Promise<{ delivered: boolean; provider: "console" | "twilio" }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    console.info(`[sms:console] to=${input.to} text="${input.text}"`);
    return { delivered: false, provider: "console" };
  }
  const body = new URLSearchParams({ To: input.to, From: from, Body: input.text });
  const response = await (options.fetch ?? fetch)(
    `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}` },
      body,
      signal: AbortSignal.timeout(8_000),
    },
  );
  return { delivered: response.ok, provider: "twilio" };
}

export interface MediaUpload {
  uploadUrl: string;
  assetUrl: string;
  acceptedTypes: string[];
  maxBytes: number;
}

export async function createMediaUpload(
  input: { filename: string; contentType: string },
  options: { fetch?: typeof fetch } = {},
): Promise<MediaUpload> {
  const endpoint = process.env.MEDIA_PIPELINE_API_URL;
  const token = process.env.MEDIA_PIPELINE_API_KEY;
  if (!endpoint || !token) {
    const id = createHash("sha256").update(`${input.filename}:${input.contentType}`).digest("hex").slice(0, 20);
    return {
      uploadUrl: `mock://upload/${id}`,
      assetUrl: `/media/mock/${id}`,
      acceptedTypes: ["image/jpeg", "image/png", "video/mp4"],
      maxBytes: 250_000_000,
    };
  }
  const response = await (options.fetch ?? fetch)(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Media pipeline failed (${response.status})`);
  return (await response.json()) as MediaUpload;
}
