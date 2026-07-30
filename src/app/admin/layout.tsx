import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { authEnabled } from "@/lib/auth";

export const metadata: Metadata = {
  title: { template: "%s · The Yoga Universe Admin", default: "Admin console" },
  robots: { index: false, follow: false },
};

/*
 * ADM: internal ops console. In production this sits behind Clerk with an
 * admin role check; in guest/dev mode it is a read-mostly demo over the seed
 * store (mirrors the dashboard's dev posture).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Authentication alone is insufficient for the internal console. Clerk
  // users must explicitly carry publicMetadata.role = "admin"; deny by
  // default so newly registered users cannot reach operational controls.
  if (authEnabled()) {
    const user = await clerkCurrentUser();
    if (user?.publicMetadata.role !== "admin") notFound();
  }

  return (
    <div className="min-h-screen bg-mint">
      <header className="border-b border-forest/10 bg-forest text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
          <Link href="/" className="font-heading text-xl font-bold">
            The Yoga Universe <span className="text-sm font-normal text-sage">/ ops</span>
          </Link>
          <nav className="flex gap-5 text-sm">
            <Link href="/admin" className="hover:text-sage">
              Transactability
            </Link>
            <Link href="/admin/moderation" className="hover:text-sage">
              Moderation
            </Link>
            <Link href="/admin/ingestion" className="hover:text-sage">
              Ingestion
            </Link>
            <Link href="/admin/operations" className="hover:text-sage">
              Operations
            </Link>
            <Link href="/admin/analytics" className="hover:text-sage">
              Analytics
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
