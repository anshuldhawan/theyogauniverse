import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { initialsOf, tintFor } from "@/lib/avatar";

/* ------------------------------------------------------------------ type */

/** Section eyebrow — 11px at 0.28em, leaf green on light, sage on dark. */
export function Eyebrow({
  children,
  tone = "leaf",
  className = "",
}: {
  children: ReactNode;
  tone?: "leaf" | "sage" | "amber" | "orange";
  className?: string;
}) {
  const color =
    tone === "sage"
      ? "text-sage"
      : tone === "amber"
        ? "text-amber"
        : tone === "orange"
          ? "text-orange"
          : "text-leaf";
  return <p className={`eyebrow ${color} ${className}`}>{children}</p>;
}

/**
 * Field/group label — 10.5px at 0.2em. Kept under its original name because
 * most pages already lean on it.
 */
export function SectionLabel({
  children,
  tone = "forest",
  className = "",
}: {
  children: ReactNode;
  tone?: "forest" | "sage" | "orange";
  className?: string;
}) {
  const color =
    tone === "sage" ? "text-sage" : tone === "orange" ? "text-orange" : "text-leaf";
  return <p className={`label ${color} ${className}`}>{children}</p>;
}

export function Display({
  level = 2,
  as,
  children,
  className = "",
}: {
  level?: "hero" | 1 | 2 | 3 | 4;
  as?: "h1" | "h2" | "h3" | "p";
  children: ReactNode;
  className?: string;
}) {
  const Tag = as ?? (level === "hero" || level === 1 ? "h1" : "h2");
  return (
    <Tag className={`display-${level === "hero" ? "hero" : level} ${className}`}>
      {children}
    </Tag>
  );
}

/* --------------------------------------------------------------- buttons */

type ButtonTone = "primary" | "orange" | "forest" | "invert" | "outline" | "ghost";

const buttonBase =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-7 py-4 text-[12px] font-medium uppercase tracking-[0.18em] transition-colors disabled:cursor-not-allowed disabled:bg-disabled disabled:text-faint disabled:border-transparent";

const buttonTones: Record<ButtonTone, string> = {
  // Orange call to action that darkens to forest, as on the hero and profile.
  primary: "bg-orange text-white hover:bg-forest",
  orange: "bg-orange text-white hover:bg-forest",
  // Forest pill that warms to orange.
  forest: "bg-forest text-white hover:bg-orange",
  // Forest pill on an orange band, which inverts to white instead.
  invert: "bg-forest text-white hover:bg-white hover:text-forest",
  outline: "border border-forest text-forest hover:border-orange hover:text-orange",
  ghost: "text-faint hover:text-orange",
};

export function Button({
  tone = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { tone?: ButtonTone }) {
  return (
    <button className={`${buttonBase} ${buttonTones[tone]} ${className}`} {...props} />
  );
}

export function ButtonLink({
  tone = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { tone?: ButtonTone }) {
  return <Link className={`${buttonBase} ${buttonTones[tone]} ${className}`} {...props} />;
}

/** Uppercase text link with the sage underline. */
export function TextLink({
  className = "",
  ...props
}: ComponentProps<typeof Link> & { className?: string }) {
  return <Link className={`link-text ${className}`} {...props} />;
}

export function BackLink({
  dark = false,
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { dark?: boolean }) {
  return (
    <Link className={`${dark ? "link-back-dark" : "link-back"} ${className}`} {...props}>
      {children}
    </Link>
  );
}

/* ----------------------------------------------------------------- chips */

const chipOn = "border-forest bg-forest text-white";
const chipOff = "border-mint-200 bg-white text-body hover:border-sage";

/** Filter/kind chip. Renders as a button by default. */
export function Chip({
  active = false,
  className = "",
  ...props
}: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      className={`cursor-pointer rounded-full border px-4.5 py-2.5 text-[13px] tracking-[0.06em] transition-colors ${
        active ? chipOn : chipOff
      } ${className}`}
      {...props}
    />
  );
}

/** Chip that navigates, used where filtering is expressed as a URL. */
export function ChipLink({
  active = false,
  className = "",
  ...props
}: ComponentProps<typeof Link> & { active?: boolean }) {
  return (
    <Link
      className={`rounded-full border px-4.5 py-2.5 text-[13px] tracking-[0.06em] transition-colors ${
        active ? chipOn : chipOff
      } ${className}`}
      {...props}
    />
  );
}

/** The narrower sidebar filter chip. */
export function ChipSmall({
  active = false,
  className = "",
  ...props
}: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] transition-colors ${
        active ? chipOn : chipOff
      } ${className}`}
      {...props}
    />
  );
}

/** Verified-only toggle, which turns leaf rather than forest. */
export function ChipVerified({
  active = false,
  className = "",
  ...props
}: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      className={`cursor-pointer rounded-full border px-3.5 py-2.5 text-[12.5px] transition-colors ${
        active ? "border-leaf bg-leaf text-white" : chipOff
      } ${className}`}
      {...props}
    />
  );
}

/** Popular-style chip on the dark hero. */
export function ChipDark({ className = "", ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={`rounded-full border border-sage/45 px-3.5 py-2 text-[13px] text-white transition-colors hover:border-amber hover:text-amber ${className}`}
      {...props}
    />
  );
}

/** Situation pill on the home "Start here" panel. */
export function ChipStart({
  active = false,
  className = "",
  ...props
}: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      className={`cursor-pointer rounded-full border px-4.5 py-3 text-[14px] transition-colors ${
        active
          ? "border-forest bg-forest text-white"
          : "border-mint-300 bg-white text-forest hover:border-sage"
      } ${className}`}
      {...props}
    />
  );
}

/* ----------------------------------------------------------- tags/badges */

/** Style tag — mint block, 6px radius. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-mint px-2.5 py-[5px] text-[11px] tracking-[0.08em] text-leaf">
      {children}
    </span>
  );
}

/** Style pill on a dark profile hero. */
export function TagHero({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-sage px-3.5 py-[7px] text-[12px] tracking-[0.08em] text-forest">
      {children}
    </span>
  );
}

/** Category badge on directory cards. */
export function BadgeKind({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-[5px] border border-kind-border px-2.25 py-1 text-[10px] uppercase tracking-[0.18em] text-orange">
      {children}
    </span>
  );
}

/**
 * CRD-1 trust-tier marker. Per PRO-13 this expresses verification only —
 * it must never be used to signal transactability.
 */
export function VerifiedMark({
  compact = false,
  onDark = false,
}: {
  compact?: boolean;
  onDark?: boolean;
}) {
  return (
    <span
      className={`inline-block rounded-[5px] px-2.25 py-[5px] text-[10px] uppercase tracking-[0.16em] ${
        onDark ? "bg-sage text-forest" : "bg-verified text-leaf"
      }`}
      title="Credentials verified"
    >
      {compact ? "✓ Verified" : "✓ Credentials verified"}
    </span>
  );
}

/* ----------------------------------------------------------------- cards */

/** Listing/category card: 16px radius, lifts on hover. */
export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-mint-200 bg-white ${
        hover
          ? "transition-[border-color,transform] duration-200 hover:-translate-y-[3px] hover:border-sage"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Flatter 14px card used for rows, slots and result items. */
export function CardFlat({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-[14px] border border-mint-200 bg-white ${
        hover ? "transition-colors duration-200 hover:border-sage" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-sage px-6 py-12 text-center">
      <h3 className="heading-card text-2xl">{title}</h3>
      {children && <div className="mt-2.5 text-[15px] text-muted">{children}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- fields */

const fieldBase =
  "w-full rounded-[10px] border border-mint-200 bg-white px-3.5 py-3 text-[15px] text-forest outline-none focus:border-sage";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${fieldBase} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select className={`${fieldBase} cursor-pointer ${className}`} {...props} />;
}

/** Label-above-control pairing used across search, booking and management. */
export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-[7px] ${className}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

/* ---------------------------------------------------------------- avatar */

/** Initials on a deterministic tint, matching the prototype's roundels. */
export function Avatar({
  id,
  name,
  size = 54,
  fontSize,
  onDark = false,
}: {
  id: string;
  name: string;
  /** A number of pixels, or any CSS length — the hero avatar uses a clamp(). */
  size?: number | string;
  fontSize?: string;
  /** Set on the forest heroes so the forest tint stays legible. */
  onDark?: boolean;
}) {
  const tint = tintFor(id, onDark);
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full font-heading"
      style={{
        width: size,
        height: size,
        background: tint.bg,
        color: tint.fg,
        fontSize:
          fontSize ?? (typeof size === "number" ? `${Math.round(size * 0.37)}px` : "20px"),
      }}
    >
      {initialsOf(name)}
    </span>
  );
}
