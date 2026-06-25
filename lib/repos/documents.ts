import { query, queryOne } from "../db"
import type { UnitDocument } from "@/app/data/types"

type DocumentRow = {
  id: string
  developer_id: string
  unit_id: string
  type: string
  file_url: string
  version: number
  uploaded_by_id: string
  uploaded_at: Date
}

function mapDocument(row: DocumentRow): UnitDocument {
  return {
    id: row.id,
    unitId: row.unit_id,
    type: row.type as UnitDocument["type"],
    fileUrl: row.file_url,
    version: row.version,
    uploadedAt: row.uploaded_at.toISOString(),
  }
}

export async function findDocumentsByUnit(unitId: string): Promise<UnitDocument[]> {
  const rows = await query<DocumentRow>(
    "SELECT * FROM documents WHERE unit_id = $1 ORDER BY uploaded_at DESC",
    [unitId],
  )
  return rows.map(mapDocument)
}

export async function createDocument(data: {
  developerId: string
  unitId: string
  type: UnitDocument["type"]
  fileUrl: string
  uploadedById: string
}): Promise<UnitDocument> {
  const row = await queryOne<DocumentRow>(
    `INSERT INTO documents (developer_id, unit_id, type, file_url, uploaded_by_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.developerId, data.unitId, data.type, data.fileUrl, data.uploadedById],
  )
  if (!row) throw new Error("Document insert returned no row")
  return mapDocument(row)
}
