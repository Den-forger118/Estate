import { NextResponse } from "next/server"
import { getSession, deleteSession, COOKIE_NAME } from "@/lib/auth"
import { createAuditLog } from "@/lib/repos/auditLog"

export async function POST() {
  const session = await getSession()

  if (session) {
    const cookieStore = await import("next/headers").then((m) => m.cookies())
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (token) await deleteSession(token).catch(() => {})

    await createAuditLog({
      developerId: session.user.developerId,
      actorUserId: session.user.id,
      action: "AUTH_LOGOUT",
      target: session.user.email,
    }).catch(() => {})
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" })
  return res
}
