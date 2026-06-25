import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { findRentPaymentsByDeveloper, findRentPaymentsByLease } from "@/lib/repos/rentPayments"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role === "BUYER") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const leaseId = req.nextUrl.searchParams.get("leaseId")
  const payments = leaseId
    ? await findRentPaymentsByLease(leaseId)
    : await findRentPaymentsByDeveloper(developerId)

  return NextResponse.json(payments)
}
