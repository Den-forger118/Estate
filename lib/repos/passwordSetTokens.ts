import { createHash, randomBytes } from "crypto"
import { query, queryOne } from "../db"

const TOKEN_TTL_MS = 48 * 60 * 60 * 1000 // 48 hours

type TokenRow = {
  id: string
  user_id: string
  token_hash: string
  expires_at: Date
  used_at: Date | null
  created_at: Date
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex")
}

/** Generate a raw token, store its hash, return the raw token (to embed in email link). */
export async function issueSetPasswordToken(userId: string): Promise<string> {
  const raw = randomBytes(40).toString("hex")
  const tokenHash = hashToken(raw)
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)

  await query(
    `INSERT INTO password_set_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  )

  return raw
}

/** Find a valid (unused, unexpired) token row by raw token string. */
export async function findValidToken(
  raw: string,
): Promise<TokenRow | null> {
  const tokenHash = hashToken(raw)
  const row = await queryOne<TokenRow>(
    `SELECT * FROM password_set_tokens
     WHERE token_hash = $1
       AND used_at IS NULL
       AND expires_at > now()`,
    [tokenHash],
  )
  return row ?? null
}

/** Mark a token as used by its DB id. */
export async function markTokenUsed(id: string): Promise<void> {
  await query(
    "UPDATE password_set_tokens SET used_at = now() WHERE id = $1",
    [id],
  )
}

/** Invalidate all unused tokens for a user (call before issuing a new one). */
export async function invalidatePriorTokens(userId: string): Promise<void> {
  await query(
    "UPDATE password_set_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL",
    [userId],
  )
}

/** Check if a user has a valid outstanding set-password token (for ledger display). */
export async function hasValidToken(userId: string): Promise<boolean> {
  const row = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM password_set_tokens
       WHERE user_id = $1 AND used_at IS NULL AND expires_at > now()
     ) AS exists`,
    [userId],
  )
  return row?.exists ?? false
}
