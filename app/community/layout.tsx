import type { ReactNode } from "react";
import { CommunityShell } from "./CommunityShell";

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return <CommunityShell>{children}</CommunityShell>;
}
