import { query, queryOne } from "../db"
import type { ConstructionUpdate } from "@/app/data/types"

type UpdateRow = {
  id: string
  developer_id: string
  milestone_id: string
  caption: string | null
  photo_url: string
  posted_by_id: string
  posted_at: Date
}

function mapUpdate(row: UpdateRow): ConstructionUpdate {
  return {
    id: row.id,
    milestoneId: row.milestone_id,
    caption: row.caption ?? undefined,
    photoUrl: row.photo_url,
    postedAt: row.posted_at.toISOString(),
  }
}

export async function findUpdatesByMilestone(milestoneId: string): Promise<ConstructionUpdate[]> {
  const rows = await query<UpdateRow>(
    "SELECT * FROM construction_updates WHERE milestone_id = $1 ORDER BY posted_at",
    [milestoneId],
  )
  return rows.map(mapUpdate)
}

export async function findUpdatesByProject(projectId: string): Promise<ConstructionUpdate[]> {
  const rows = await query<UpdateRow>(
    `SELECT cu.*
     FROM construction_updates cu
     JOIN milestones m ON m.id = cu.milestone_id
     WHERE m.project_id = $1
     ORDER BY cu.posted_at`,
    [projectId],
  )
  return rows.map(mapUpdate)
}

export async function countUpdatesByMilestone(milestoneId: string): Promise<number> {
  type Row = { count: string }
  const row = await queryOne<Row>(
    "SELECT COUNT(*) AS count FROM construction_updates WHERE milestone_id = $1",
    [milestoneId],
  )
  return parseInt(row?.count ?? "0", 10)
}

export async function createUpdate(data: {
  developerId: string
  milestoneId: string
  photoUrl: string
  caption?: string
  postedById: string
}): Promise<ConstructionUpdate> {
  const rows = await query<UpdateRow>(
    `INSERT INTO construction_updates
       (developer_id, milestone_id, photo_url, caption, posted_by_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.developerId, data.milestoneId, data.photoUrl, data.caption ?? null, data.postedById],
  )
  return mapUpdate(rows[0])
}
