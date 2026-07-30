export const SEO_PROVIDERS = ["google_search_console", "bing_webmaster", "ai_citation"] as const;
export type SeoProvider = (typeof SEO_PROVIDERS)[number];

export interface RawSeoMetric {
  query: string;
  url: string;
  observedAt: string;
  impressions?: number;
  clicks?: number;
  position?: number;
  cited?: boolean;
  citedPassage?: string;
  competitorCitations?: number;
}

export interface NormalizedSeoObservation {
  provider: SeoProvider;
  query: string;
  url: string;
  observedAt: Date;
  impressions: number;
  clicks: number;
  position: number | null;
  citationPresent: boolean | null;
  citedPassage: string | null;
  competitorCitations: number | null;
}

export interface SeoProviderAdapter {
  provider: SeoProvider;
  enabled: boolean;
  collect(from: Date, to: Date): Promise<RawSeoMetric[]>;
}

export function createHttpSeoAdapter(config: {
  provider: SeoProvider;
  endpoint?: string;
  token?: string;
  fetcher?: typeof fetch;
}): SeoProviderAdapter {
  const enabled = Boolean(config.endpoint && config.token);
  return {
    provider: config.provider,
    enabled,
    async collect(from, to) {
      if (!enabled) return [];
      const endpoint = new URL(config.endpoint!);
      endpoint.searchParams.set("from", from.toISOString());
      endpoint.searchParams.set("to", to.toISOString());
      const response = await (config.fetcher ?? fetch)(endpoint, {
        headers: { authorization: `Bearer ${config.token}`, accept: "application/json" },
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error(`${config.provider} collection failed (${response.status}).`);
      const body: unknown = await response.json();
      if (!Array.isArray(body)) throw new Error(`${config.provider} returned a non-array response.`);
      return body as RawSeoMetric[];
    },
  };
}

export function normalizeSeoMetrics(
  provider: SeoProvider,
  rows: RawSeoMetric[],
): NormalizedSeoObservation[] {
  return rows.map((row) => ({
    provider,
    query: row.query.trim(),
    url: new URL(row.url).toString(),
    observedAt: new Date(row.observedAt),
    impressions: Math.max(0, row.impressions ?? 0),
    clicks: Math.max(0, row.clicks ?? 0),
    position: row.position == null ? null : Math.max(1, row.position),
    citationPresent: row.cited ?? null,
    citedPassage: row.citedPassage?.trim() || null,
    competitorCitations: row.competitorCitations == null ? null : Math.max(0, row.competitorCitations),
  }));
}

export async function collectSeoObservations(
  adapters: SeoProviderAdapter[],
  from: Date,
  to: Date,
): Promise<{ status: "disabled" | "collected"; observations: NormalizedSeoObservation[]; disabled: SeoProvider[] }> {
  const enabled = adapters.filter((adapter) => adapter.enabled);
  const disabled = adapters.filter((adapter) => !adapter.enabled).map((adapter) => adapter.provider);
  if (enabled.length === 0) return { status: "disabled", observations: [], disabled };
  const batches = await Promise.all(
    enabled.map(async (adapter) => normalizeSeoMetrics(adapter.provider, await adapter.collect(from, to))),
  );
  return { status: "collected", observations: batches.flat(), disabled };
}

export function seoKpis(rows: NormalizedSeoObservation[]): {
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number | null;
  citationRate: number | null;
  citationShareOfVoice: number | null;
} {
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const positioned = rows.filter((row) => row.position != null);
  const citationRows = rows.filter((row) => row.citationPresent != null);
  const ownCitations = citationRows.filter((row) => row.citationPresent).length;
  const competitors = citationRows.reduce((sum, row) => sum + (row.competitorCitations ?? 0), 0);
  return {
    impressions,
    clicks,
    ctr: impressions === 0 ? 0 : clicks / impressions,
    averagePosition:
      positioned.length === 0
        ? null
        : positioned.reduce((sum, row) => sum + row.position!, 0) / positioned.length,
    citationRate: citationRows.length === 0 ? null : ownCitations / citationRows.length,
    citationShareOfVoice:
      ownCitations + competitors === 0 ? null : ownCitations / (ownCitations + competitors),
  };
}
