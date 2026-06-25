import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { randomBytes } from "crypto"
import { findSessionByToken, createSession as dbCreateSession, deleteSessionByToken } from "./repos/sessions"
import type { Role } from "@/app/data/types"

export const COOKIE_NAME = "estate_session"
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export type SessionUser = {
  id: string
  email: string
  role: Role
  developerId: string | null
  buyerId: string | null
}

export type AuthSession = {
  user: SessionUser
  sessionId: string
}

/** Read and validate the session from the httpOnly cookie. Returns null if absent or expired. */
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const row = await findSessionByToken(token)
  if (!row) return null

  if (row.expiresAt < new Date()) {
    await deleteSessionByToken(token).catch(() => {})
    return null
  }

  return {
    user: {
      id: row.user.id,
      email: row.user.email,
      role: row.user.role,
      developerId: row.user.developerId,
      buyerId: row.user.buyerId,
    },
    sessionId: row.id,
  }
}

/**
 * Server-component guard. Redirects to /login if no valid session.
 * If allowedRoles is provided, redirects if the user's role is not in the list.
 * Do NOT call from Route Handlers — use getSession() + return 401 there instead.
 */
export async function requireUser(allowedRoles?: Role[]): Promise<AuthSession> {
  const session = await getSession()
  if (!session) redirect("/login")
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    redirect("/login?error=unauthorized")
  }
  return session
}

/** Create a new session row and return the raw token to set as cookie. */
export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await dbCreateSession(userId, token, expiresAt)
  return token
}

/** Delete a session by token (hard logout). */
export async function deleteSession(token: string): Promise<void> {
  await deleteSessionByToken(token)
}
