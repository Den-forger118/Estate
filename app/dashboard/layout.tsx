import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { DashboardShell } from "./DashboardShell"
import type { Role } from "@/app/data/types"
import type { DashboardRole } from "../data/dashboard"

function toDashboardRole(role: Role): DashboardRole {
  switch (role) {
    case "ADMIN": return "admin"
    case "SALES": return "manager"
    case "OPS":   return "maintenance"
    default:      return "tenant"
  }
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireUser()

  // BUYERs have their own portal — not the staff dashboard
  if (session.user.role === "BUYER") redirect("/portal")

  const dashRole = toDashboardRole(session.user.role)
  const displayName = session.user.email.split("@")[0]

  return (
    <DashboardShell displayName={displayName} role={dashRole}>
      {children}
    </DashboardShell>
  )
}
