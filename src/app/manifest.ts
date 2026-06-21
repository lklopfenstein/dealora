import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dealora",
    short_name: "Dealora",
    description: "Great prices, minus the scavenger hunt.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5ed",
    theme_color: "#f7f5ed",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
