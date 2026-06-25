"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const FADE_MS = 220;

export function ContentTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [hidden, setHidden] = useState(false);
  const latestChildren = useRef(children);
  const previousPathname = useRef(pathname);
  const isFirstRender = useRef(true);

  latestChildren.current = children;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (previousPathname.current === pathname) {
      setDisplayChildren(children);
      return;
    }

    setHidden(true);

    const timer = window.setTimeout(() => {
      previousPathname.current = pathname;
      setDisplayChildren(latestChildren.current);
      requestAnimationFrame(() => {
        setHidden(false);
      });
    }, FADE_MS);

    return () => window.clearTimeout(timer);
  }, [pathname, children]);

  return (
    <div className={`content-transition${hidden ? " content-transition-hidden" : ""}`}>
      {displayChildren}
    </div>
  );
}
