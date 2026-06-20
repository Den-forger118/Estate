"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

const PRIVATE_ROUTE_PREFIXES = ["/dashboard", "/community"];

export function PersistentPublicHeader() {
  const pathname = usePathname();
  if (PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }
  return <Header />;
}
