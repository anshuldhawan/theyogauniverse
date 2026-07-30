/**
 * Unit tests must never select live service rails merely because a developer
 * has pulled Vercel secrets into .env.local. Individual integration tests can
 * opt in by setting the exact variable they exercise.
 */
const externalServiceKeys = [
  "DATABASE_URL",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_CONNECT_WEBHOOK_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "RESEND_API_KEY",
] as const;

for (const key of externalServiceKeys) {
  delete process.env[key];
}
