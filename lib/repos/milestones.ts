import { query, queryOne } from "../db"
import type { Milestone, MilestoneStatus } from "@/app/data/types"
import type { PoolClient } from "pg"

// ─── Internal row ─────────────────────────────────────────────────────────────

type MilestoneRow = {
  id: string
  developer_id: string
  project_id: string
  name: string
  sequence: number
  status: string
  target_date: Date | null
  completed_at: Date | null
  updated_at: Date
}

function mapMilestone(row: MilestoneRow): Milestone {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    sequence: row.sequence,
    status: row.status as MilestoneStatus,
    targetDate: row.target_date ? row.target_date.toISOString().slice(0, 10) : undefined,
    completedAt: row.completed_at ? row.completed_at.toISOString().slice(0, 10) : undefined,
    updatedAt: row.updated_at.toISOString(),
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function findMilestonesByProject(projectId: string): Promise<Milestone[]> {
  const rows = await query<MilestoneRow>(
    "SELECT * FROM milestones WHERE project_id = $1 ORDER BY sequence",
    [projectId],
  )
  return rows.map(mapMilestone)
}

export async function findMilestoneById(
  id: string,
  developerId: string,
): Promise<Milestone | null> {
  const row = await queryOne<MilestoneRow>(
    "SELECT * FROM milestones WHERE id = $1 AND developer_id = $2",
    [id, developerId],
  )
  return row ? mapMilestone(row) : null
}

/** Mark COMPLETED and set completedAt. Must be called inside a transaction. */
export async function completeMilestone(
  id: string,
  completedAt: Date,
  client: PoolClient,
): Promise<void> {
  await client.query(
    `UPDATE milestones
     SET status = 'COMPLETED', completed_at = $1
     WHERE id = $2`,
    [completedAt, id],
  )
}

/**
 * Activate the next milestone in sequence within the same project.
 * Only transitions NOT_STARTED → IN_PROGRESS; no-ops if already active/completed or if
 * this was the last milestone. Must be called inside the same transaction as completeMilestone.
 * Returns the activated milestone's id, or null if there was no next milestone.
 */
export async function activateNextMilestone(
  currentMilestoneId: string,
  client: PoolClient,
): Promise<string | null> {
  const result = await client.query<{ id: string }>(
    `UPDATE milestones
     SET status = 'IN_PROGRESS'
     WHERE project_id = (SELECT project_id FROM milestones WHERE id = $1)
       AND sequence   = (SELECT sequence   FROM milestones WHERE id = $1) + 1
       AND status = 'NOT_STARTED'
     RETURNING id`,
    [currentMilestoneId],
  )
  return result.rows[0]?.id ?? null
}

// ─── Stalled-ops query ────────────────────────────────────────────────────────

export type StalledMilestone = {
  id: string
  name: string
  projectName: string
  targetDate: Date | null
  updatedAt: Date
}

export async function findStalledMilestones(
  developerId: string,
  cutoff: Date,
  now: Date,
): Promise<StalledMilestone[]> {
  type Row = {
    id: string
    name: string
    target_date: Date | null
    updated_at: Date
    project_name: string
  }
  const rows = await query<Row>(
    `SELECT
       m.id,
       m.name,
       m.target_date,
       m.updated_at,
       p.name AS project_name
     FROM milestones m
     JOIN projects p ON p.id = m.project_id
     WHERE m.developer_id = $1
       AND m.status = 'IN_PROGRESS'
       AND (
         (m.target_date IS NOT NULL AND m.target_date < $2)
         OR (m.target_date IS NULL     AND m.updated_at < $3)
       )
     ORDER BY m.updated_at ASC`,
    [developerId, now, cutoff],
  )
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    projectName: r.project_name,
    targetDate: r.target_date,
    updatedAt: r.updated_at,
  }))
}
