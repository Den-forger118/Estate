import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { findOwnerOccupierByBuyer } from "@/lib/repos/residents"
import { CommunityShell } from "./CommunityShell"

export default async function CommunityLayout({ children }: { children: ReactNode }) {
  const session = await requireUser()
  const { role, buyerId } = session.user

  // Community is for homeowners (OWNER_OCCUPIER residents) only.
  // Staff use REMS; buyers who haven't been handed over use /portal.
  if (role !== "BUYER") redirect("/dashboard")

  if (!buyerId) redirect("/portal")
  const homeowner = await findOwnerOccupierByBuyer(buyerId)
  if (!homeowner) redirect("/portal?notice=homeowner_required")

  return (
    <CommunityShell
      residentName={homeowner.fullName}
      unitCode={homeowner.unitCode ?? "Your unit"}
    >
      {children}
    </CommunityShell>
  )
}
