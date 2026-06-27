import { query, queryOne } from "../db"
import type { Project } from "@/app/data/types"

export type NewProject = {
  developerId: string
  name: string
  location?: string
  status?: string
}

type ProjectRow = {
  id: string
  developer_id: string
  name: string
  location: string | null
  status: string
}

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    location: row.location ?? undefined,
    status: row.status,
  }
}

export async function findProjectsByDeveloper(developerId: string): Promise<Project[]> {
  const rows = await query<ProjectRow>(
    "SELECT * FROM projects WHERE developer_id = $1 ORDER BY name",
    [developerId],
  )
  return rows.map(mapProject)
}

export async function findProjectById(
  id: string,
  developerId: string,
): Promise<Project | null> {
  const row = await queryOne<ProjectRow>(
    "SELECT * FROM projects WHERE id = $1 AND developer_id = $2",
    [id, developerId],
  )
  return row ? mapProject(row) : null
}

export async function createProject(data: NewProject): Promise<Project> {
  const row = await queryOne<ProjectRow>(
    `INSERT INTO projects (developer_id, name, location, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.developerId, data.name, data.location ?? null, data.status ?? "ACTIVE"],
  )
  return mapProject(row!)
}
