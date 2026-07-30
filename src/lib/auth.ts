/**
 * Auth abstraction over Clerk (ACC-1/3/6/7 arrive via Clerk's providers:
 * Google, Apple, Facebook, email magic link, phone OTP, TOTP 2FA, device
 * sessions). When Clerk keys are absent (local dev, CI) the app runs in
 * guest-only mode — guest checkout must work end to end regardless (ACC-2).
 *
 * ACC-12/ACC-13: roles are scoped per organisation. Clerk carries identity
 * only; organisation membership and roles live in our organisation_members
 * table so that a person can hold different roles across N organisations,
 * and payout eligibility stays on the Organisation.
 */

export function authEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
}

export interface SessionUser {
  clerkUserId: string;
  email: string | null;
}

export async function currentUser(): Promise<SessionUser | null> {
  if (!authEnabled()) return null;
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) return null;
  return { clerkUserId: userId, email: null };
}

export type OrgRole = "owner" | "admin" | "manager" | "staff";

/** Permission checks are organisation-scoped (ACC-12). */
export function canManageOrganisation(role: OrgRole): boolean {
  return role === "owner" || role === "admin";
}

export function canManageSchedule(role: OrgRole): boolean {
  return role === "owner" || role === "admin" || role === "manager";
}
