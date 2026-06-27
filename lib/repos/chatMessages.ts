import { query, queryOne } from "../db"
import type { ChatMessage, ChatThread } from "@/app/data/types"

type MessageRow = {
  id: string
  buyer_id: string
  unit_id: string
  sender_role: string
  sender_user_id: string
  body: string
  milestone_id: string | null
  milestone_name: string | null
  created_at: Date
}

function mapMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    buyerId: row.buyer_id,
    unitId: row.unit_id,
    senderRole: row.sender_role as "BUYER" | "STAFF",
    senderUserId: row.sender_user_id,
    body: row.body,
    milestoneId: row.milestone_id,
    milestoneName: row.milestone_name,
    createdAt: row.created_at.toISOString(),
  }
}

/** Fetch all messages for a buyer+unit thread, oldest first, with milestone name joined. */
export async function findMessages(
  buyerId: string,
  unitId: string,
  developerId: string,
): Promise<ChatMessage[]> {
  const rows = await query<MessageRow>(
    `SELECT
       cm.id,
       cm.buyer_id,
       cm.unit_id,
       cm.sender_role,
       cm.sender_user_id,
       cm.body,
       cm.milestone_id,
       m.name AS milestone_name,
       cm.created_at
     FROM chat_messages cm
     LEFT JOIN milestones m ON m.id = cm.milestone_id
     WHERE cm.developer_id = $1
       AND cm.buyer_id     = $2
       AND cm.unit_id      = $3
     ORDER BY cm.created_at ASC`,
    [developerId, buyerId, unitId],
  )
  return rows.map(mapMessage)
}

/** Insert a new message. milestoneId is the currently active phase (may be null). */
export async function sendMessage(data: {
  developerId: string
  buyerId: string
  unitId: string
  senderRole: "BUYER" | "STAFF"
  senderUserId: string
  body: string
  milestoneId: string | null
}): Promise<ChatMessage> {
  const rows = await query<MessageRow>(
    `INSERT INTO chat_messages
       (developer_id, buyer_id, unit_id, sender_role, sender_user_id, body, milestone_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING
       id, buyer_id, unit_id, sender_role, sender_user_id, body, milestone_id,
       NULL::text AS milestone_name,
       created_at`,
    [
      data.developerId,
      data.buyerId,
      data.unitId,
      data.senderRole,
      data.senderUserId,
      data.body,
      data.milestoneId,
    ],
  )
  return mapMessage(rows[0])
}

/** List one thread-summary per buyer-unit for a developer (staff inbox view). */
export async function findChatThreads(developerId: string): Promise<ChatThread[]> {
  type Row = {
    buyer_id: string
    buyer_name: string
    unit_id: string
    unit_code: string
    last_message: string | null
    last_message_at: Date | null
  }
  const rows = await query<Row>(
    `SELECT DISTINCT ON (cm.buyer_id, cm.unit_id)
       cm.buyer_id,
       b.full_name  AS buyer_name,
       cm.unit_id,
       u.code       AS unit_code,
       cm.body      AS last_message,
       cm.created_at AS last_message_at
     FROM chat_messages cm
     JOIN buyers b ON b.id = cm.buyer_id
     JOIN units  u ON u.id = cm.unit_id
     WHERE cm.developer_id = $1
     ORDER BY cm.buyer_id, cm.unit_id, cm.created_at DESC`,
    [developerId],
  )
  return rows.map((r) => ({
    buyerId: r.buyer_id,
    buyerName: r.buyer_name,
    unitId: r.unit_id,
    unitCode: r.unit_code,
    lastMessage: r.last_message,
    lastMessageAt: r.last_message_at ? r.last_message_at.toISOString() : null,
  }))
}

/**
 * Returns the currently IN_PROGRESS milestone for the unit's project.
 * Used to stamp new messages with the active construction phase.
 */
export async function getActiveMilestoneForUnit(
  unitId: string,
  developerId: string,
): Promise<{ id: string; name: string } | null> {
  const row = await queryOne<{ id: string; name: string }>(
    `SELECT m.id, m.name
     FROM milestones m
     JOIN units u ON u.project_id = m.project_id
     WHERE u.id            = $1
       AND m.developer_id  = $2
       AND m.status        = 'IN_PROGRESS'
     ORDER BY m.sequence
     LIMIT 1`,
    [unitId, developerId],
  )
  return row ?? null
}
