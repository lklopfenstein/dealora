"use client";

import { useState } from "react";
import { Gamepad2, House, Laptop, Plane, Shirt, Sparkles } from "lucide-react";
import type { Category } from "@/types/deal";

const icons = {
  Tech: Laptop,
  Home: House,
  Style: Shirt,
  Gaming: Gamepad2,
  Everyday: Sparkles,
  Travel: Plane,
};

export function DealImage({ src, alt, category, eager = false }: { src: string | null; alt: string; category: Category; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const Icon = icons[category];

  if (!src || failed) {
    return (
      <div className={`image-fallback image-fallback--${category.toLowerCase()}`} aria-hidden="true">
        <span className="fallback-orbit" />
        <Icon size={44} strokeWidth={1.6} />
      </div>
    );
  }

  return (
    // Feed images come from a changing set of source domains, so next/image cannot safely enumerate them.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
