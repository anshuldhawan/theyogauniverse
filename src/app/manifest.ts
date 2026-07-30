import type { MetadataRoute } from "next";

/** WEB-1/WEB-2: installable PWA baseline. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Yoga Universe — Yoga & Meditation Index",
    short_name: "The Yoga Universe",
    description:
      "Find yoga teachers, studios, retreats and teacher training worldwide.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f0f6f0",
    theme_color: "#1b391c",
    icons: [
      { src: "/brand/mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    categories: ["health", "fitness", "lifestyle"],
    shortcuts: [
      { name: "Find yoga", short_name: "Directory", url: "/directory" },
      { name: "Provider check-in", short_name: "Check-in", url: "/dashboard/bookings" },
    ],
  };
}
