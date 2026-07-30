/**
 * The eight limbs as concentric rings — outward conduct on the rim, samadhi
 * at the centre. Built in CSS so it stays crisp and readable at any width.
 */

interface Limb {
  name: string;
  note: string;
  /** Ring fill, and the border only the palest ring needs to stay visible. */
  swatch: string;
  swatchBorder?: string;
  /** Ring diameter as a percentage of the square. */
  size: number;
  /** Vertical position of the numeral, as in the design. */
  top: string;
  numeralOnDark?: boolean;
}

const LIMBS: Limb[] = [
  {
    name: "Yama",
    note: "How you treat others. Non-violence, truthfulness, non-stealing, restraint, non-grasping.",
    swatch: "var(--color-ring-1)",
    swatchBorder: "var(--color-ring-3)",
    size: 100,
    top: "1.4%",
  },
  {
    name: "Niyama",
    note: "How you treat yourself. Cleanliness, contentment, discipline, self-study, surrender.",
    swatch: "var(--color-ring-2)",
    size: 87.5,
    top: "7.6%",
  },
  {
    name: "Asana",
    note: "A seat that is steady and comfortable. That is the entire instruction given.",
    swatch: "var(--color-ring-3)",
    size: 75,
    top: "13.8%",
  },
  {
    name: "Pranayama",
    note: "Regulation of the breath, and through it the regulation of attention.",
    swatch: "var(--color-ring-4)",
    size: 62.5,
    top: "20%",
  },
  {
    name: "Pratyahara",
    note: "Withdrawing the senses from what they habitually chase.",
    swatch: "var(--color-ring-5)",
    size: 50,
    top: "26.2%",
  },
  {
    name: "Dharana",
    note: "Concentration — holding attention on one thing, deliberately.",
    swatch: "var(--color-ring-6)",
    size: 37.5,
    top: "32.4%",
    numeralOnDark: true,
  },
  {
    name: "Dhyana",
    note: "Meditation — when that holding becomes continuous and no longer needs effort.",
    swatch: "var(--color-ring-7)",
    size: 25,
    top: "38.6%",
    numeralOnDark: true,
  },
  {
    name: "Samadhi",
    note: "Absorption, in which the separation between observer and observed drops away.",
    swatch: "var(--color-ring-8)",
    size: 12.5,
    top: "46.4%",
    numeralOnDark: true,
  },
];

export function EightLimbs() {
  return (
    <div className="rounded-[18px] border border-mint-200 bg-mint-wash p-[clamp(22px,3.4vw,40px)]">
      <div className="flex flex-wrap items-center justify-center gap-[clamp(24px,4vw,44px)]">
        <div
          className="relative aspect-square w-[min(380px,82vw)] flex-none"
          role="img"
          aria-label="The eight limbs as concentric circles, from yama on the outer rim to samadhi at the centre"
        >
          {LIMBS.map((limb, i) => (
            <div
              key={limb.name}
              className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full"
              style={{
                width: `${limb.size}%`,
                height: `${limb.size}%`,
                background: limb.swatch,
                border: i === 0 ? `1px solid var(--color-ring-2)` : undefined,
              }}
            />
          ))}
          {LIMBS.map((limb, i) => (
            <span
              key={`n-${limb.name}`}
              aria-hidden
              className={`absolute left-1/2 text-[12px] font-medium ${
                limb.numeralOnDark ? "text-white" : "text-forest"
              } ${i === LIMBS.length - 1 ? "-translate-1/2" : "-translate-x-1/2"}`}
              style={{ top: limb.top }}
            >
              {i + 1}
            </span>
          ))}
          <span
            aria-hidden
            className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap tracking-[0.2em] text-faint"
          >
            OUTWARD CONDUCT
          </span>
          <span
            aria-hidden
            className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[26px] text-[10px] whitespace-nowrap tracking-[0.2em] text-white"
          >
            INWARD
          </span>
        </div>

        <ol className="flex min-w-65 flex-[1_1_300px] flex-col">
          {LIMBS.map((limb, i) => (
            <li
              key={limb.name}
              className={`flex items-baseline gap-3.5 py-2.75 ${
                i < LIMBS.length - 1 ? "border-b border-mint-200" : ""
              }`}
            >
              <span
                aria-hidden
                className="h-3.5 flex-[0_0_14px] rounded-full"
                style={{
                  background: limb.swatch,
                  border: limb.swatchBorder ? `1px solid ${limb.swatchBorder}` : undefined,
                }}
              />
              <span className="flex-[0_0_118px] font-heading text-[19px] text-forest">
                {i + 1} · {limb.name}
              </span>
              <span className="flex-[1_1_160px] text-[14px] leading-[1.55] text-muted">
                {limb.note}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
