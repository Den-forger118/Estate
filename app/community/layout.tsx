import type { ReactNode } from "react"
import { requireUser } from "@/lib/auth"
import { CommunityShell } from "./CommunityShell"

export default async function CommunityLayout({ children }: { children: ReactNode }) {
  const session = await requireUser()
  // All authenticated roles have community access
  const displayName = session.user.email.split("@")[0]
  return (
    <CommunityShell displayName={displayName}>
      {children}
    </CommunityShell>
  )
}
