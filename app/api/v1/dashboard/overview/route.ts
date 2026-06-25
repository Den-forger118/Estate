import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { queryOne } from "@/lib/db"
import { getRentCollectionStats } from "@/lib/repos/rentPayments"
import { getMaintenanceCounts } from "@/lib/repos/maintenance"
import type { DashboardOverview } from "@/app/data/types"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role === "BUYER") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  type UnitRow = {
    units_sold: string
    units_available: string
    total_units: string
    occupied_units: string
  }

  type InstallRow = {
    total_collected: string
    overdue_count: string
  }

  const [unitRow, installRow, rentStats, maintCounts] = await Promise.all([
    queryOne<UnitRow>(
      `SELECT
         COUNT(*) FILTER (WHERE status IN ('SOLD', 'HANDED_OVER')) AS units_sold,
         COUNT(*) FILTER (WHERE status = 'AVAILABLE')              AS units_available,
         COUNT(*)                                                    AS total_units,
         COUNT(*) FILTER (WHERE id IN (
           SELECT DISTINCT unit_id FROM leases
           WHERE developer_id = $1 AND status = 'ACTIVE'
         ))                                                          AS occupied_units
       FROM units
       WHERE developer_id = $1`,
      [developerId],
    ),
    queryOne<InstallRow>(
      `SELECT
         COALESCE(SUM(i.paid_amount), 0)                                AS total_collected,
         COUNT(*) FILTER (WHERE i.status = 'OVERDUE')                   AS overdue_count
       FROM installments i
       JOIN payment_plans pp ON pp.id = i.payment_plan_id
       WHERE i.developer_id = $1 AND pp.currency = 'GHS'`,
      [developerId],
    ),
    getRentCollectionStats(developerId),
    getMaintenanceCounts(developerId),
  ])

  const totalUnits = parseInt(unitRow?.total_units ?? "0", 10)
  const occupiedUnits = parseInt(unitRow?.occupied_units ?? "0", 10)
  const rentCollectionPct =
    rentStats.totalDue > 0
      ? Math.round((rentStats.totalPaid / rentStats.totalDue) * 100)
      : 100

  const overview: DashboardOverview = {
    offPlan: {
      unitsSold: parseInt(unitRow?.units_sold ?? "0", 10),
      unitsAvailable: parseInt(unitRow?.units_available ?? "0", 10),
      totalGhsCollected: parseFloat(installRow?.total_collected ?? "0"),
      installmentsOverdue: parseInt(installRow?.overdue_count ?? "0", 10),
    },
    residency: {
      totalUnits,
      occupiedUnits,
      occupancyPct: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
      activeLeases: occupiedUnits,
      rentCollectionPct,
      openTickets: maintCounts.open,
      urgentTickets: maintCounts.urgent,
    },
  }

  return NextResponse.json(overview)
}
