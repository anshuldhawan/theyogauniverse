/**
 * Avatar tints. The prototype assigns one of six background/foreground pairs
 * by list position; server rendering needs the same listing to keep the same
 * tint on every page, so we hash the id instead.
 */
export interface Tint {
  bg: string;
  fg: string;
}

const TINTS: Tint[] = [
  { bg: "#a2d1a2", fg: "#1b391c" },
  { bg: "#ff6540", fg: "#ffffff" },
  { bg: "#fbac49", fg: "#1b391c" },
  { bg: "#157a3d", fg: "#ffffff" },
  { bg: "#1b391c", fg: "#a2d1a2" },
  { bg: "#f0d9cf", fg: "#1b391c" },
];

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) % 100000;
  }
  return h;
}

/**
 * On a forest hero the forest tint would be invisible, so it swaps for its
 * inverse there. Everywhere else the pair is used as authored.
 */
export function tintFor(id: string, onDark = false): Tint {
  const tint = TINTS[hash(id) % TINTS.length];
  if (onDark && tint.bg === "#1b391c") return { bg: tint.fg, fg: tint.bg };
  return tint;
}

/** "Maya Iyer" -> "MI". Three initials at most, as in the prototype. */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
}
