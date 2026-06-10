"use client";

import { useEffect, useState } from "react";

export function useScrollCompressed(threshold = 80) {
  const [compressed, setCompressed] = useState(false);

  useEffect(() => {
    const handler = () => setCompressed(window.scrollY > threshold);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);

  return compressed;
}
