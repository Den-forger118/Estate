import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { findStalledInstallments } from "@/lib/repos/paymentPlans"
import { findStalledReservations } from "@/lib/repos/units"
import { findStalledMilestones } from "@/lib/repos/milestones"

const THRESHOLD_DAYS = 30

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role === "BUYER") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const now = new Date()
  const cutoff = new Date(now.getTime() - THRESHOLD_DAYS * 24 * 60 * 60 * 1000)

  const [stalledInstallments, stalledReservations, stalledMilestones] = await Promise.all([
    findStalledInstallments(developerId, cutoff),
    findStalledReservations(developerId, cutoff),
    findStalledMilestones(developerId, cutoff, now),
  ])

  return NextResponse.json({
    stalledInstallments: {
      count: stalledInstallments.length,
      items: stalledInstallments.map((i) => ({
        id: i.id,
        label: `Installment #${i.sequence} — ${i.unitCode}`,
        detail: i.dueDate ? `Due ${i.dueDate.toISOString().slice(0, 10)}` : "No due date",
        stalledDays: daysSince(i.updatedAt),
      })),
    },
    stalledReservations: {
      count: stalledReservations.length,
      items: stalledReservations.map((u) => ({
        id: u.id,
        label: `${u.code} — ${u.projectName}`,
        detail: u.buyerName ?? "No buyer linked",
        stalledDays: daysSince(u.updatedAt),
      })),
    },
    stalledMilestones: {
      count: stalledMilestones.length,
      items: stalledMilestones.map((m) => ({
        id: m.id,
        label: m.name,
        detail: m.projectName,
        stalledDays: m.targetDate ? daysSince(m.targetDate) : daysSince(m.updatedAt),
      })),
    },
    thresholdDays: THRESHOLD_DAYS,
  })
}
