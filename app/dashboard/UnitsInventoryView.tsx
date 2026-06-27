"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getUnits, getProjects, createUnit, createProject } from "../../lib/api-client";
import type { Unit, Project } from "../data/types";
import { formatGHS } from "../../lib/formatters";
import { showToast } from "../components/Toast";

// ─── Add Project Form ─────────────────────────────────────────────────────────

function AddProjectForm({ onDone }: { onDone: (project: Project) => void }) {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [status, setStatus] = useState("ACTIVE")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) { showToast("Project name is required", "error"); return }
    setSubmitting(true)
    try {
      const project = await createProject({ name: name.trim(), location: location.trim() || undefined, status })
      showToast(`Project "${project.name}" created`, "success")
      onDone(project)
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create project", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="dashboard-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }} onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: "0.75rem" }}>New Project</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Oakwood Heights"
            maxLength={120}
            required
          />
        </label>
        <label>
          Location
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. East Legon, Accra"
            maxLength={200}
          />
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </label>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create project"}
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => onDone({} as Project)}>
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── Add Unit Form ────────────────────────────────────────────────────────────

function AddUnitForm({
  projects,
  onDone,
}: {
  projects: Project[]
  onDone: (unit: Unit) => void
}) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "")
  const [code, setCode] = useState("")
  const [type, setType] = useState("")
  const [sizeSqm, setSizeSqm] = useState("")
  const [priceTotal, setPriceTotal] = useState("")
  const [status, setStatus] = useState("AVAILABLE")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!projectId) { showToast("Select a project", "error"); return }
    if (!code.trim()) { showToast("Unit code is required", "error"); return }
    const price = parseFloat(priceTotal)
    if (isNaN(price) || price <= 0) { showToast("Invalid price", "error"); return }

    setSubmitting(true)
    try {
      const unit = await createUnit({
        projectId,
        code: code.trim(),
        type: type.trim() || undefined,
        sizeSqm: sizeSqm ? parseFloat(sizeSqm) : undefined,
        priceTotal: price,
        status,
      })
      showToast(`Unit ${unit.code} created`, "success")
      onDone(unit)
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create unit", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="dashboard-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }} onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: "0.75rem" }}>New Unit</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <label>
          Project
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
            <option value="">Select project…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
        <label>
          Unit code
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. OH-101"
            maxLength={40}
            required
          />
        </label>
        <label>
          Type
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="e.g. Detached Villa"
            maxLength={80}
          />
        </label>
        <label>
          Size (sqm)
          <input
            type="number"
            min="1"
            step="0.1"
            value={sizeSqm}
            onChange={(e) => setSizeSqm(e.target.value)}
            placeholder="e.g. 250"
          />
        </label>
        <label>
          Price (GHS)
          <input
            type="number"
            min="1"
            step="0.01"
            value={priceTotal}
            onChange={(e) => setPriceTotal(e.target.value)}
            placeholder="e.g. 450000"
            required
          />
        </label>
        <label>
          Initial status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
          </select>
        </label>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create unit"}
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => onDone({} as Unit)}>
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function UnitsInventoryView() {
  const [units, setUnits] = useState<Unit[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUnit, setShowAddUnit] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)

  async function reload() {
    setLoading(true)
    try {
      const [u, p] = await Promise.all([getUnits(), getProjects()])
      setUnits(u)
      setProjects(p)
    } catch {
      showToast("Failed to load inventory", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  const projectById = useMemo(() => {
    const map = new Map<string, string>()
    projects.forEach((p) => map.set(p.id, p.name))
    return map
  }, [projects])

  const availableCount = units.filter((u) => u.status === "AVAILABLE").length

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Inventory</span>
          <h1>Units</h1>
          <p>{availableCount} available · {units.length} total</p>
        </div>
        <div className="dashboard-actions" style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => { setShowAddProject((v) => !v); setShowAddUnit(false) }}
          >
            {showAddProject ? "Cancel" : "Add Project"}
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => { setShowAddUnit((v) => !v); setShowAddProject(false) }}
          >
            {showAddUnit ? "Cancel" : "Add Unit"}
          </button>
        </div>
      </div>

      {showAddProject && (
        <AddProjectForm
          onDone={(project) => {
            setShowAddProject(false)
            if (project.id) {
              setProjects((prev) => [...prev, project].sort((a, b) => a.name.localeCompare(b.name)))
            }
          }}
        />
      )}

      {showAddUnit && (
        <AddUnitForm
          projects={projects}
          onDone={(unit) => {
            setShowAddUnit(false)
            if (unit.id) {
              setUnits((prev) => [...prev, unit].sort((a, b) => a.code.localeCompare(b.code)))
            }
          }}
        />
      )}

      {loading ? (
        <p className="meta" style={{ padding: "1rem" }}>Loading…</p>
      ) : (
        <div className="dashboard-card table-card">
          <table className="zebra-rows">
            <thead>
              <tr>
                <th>Code</th>
                <th>Project</th>
                <th>Type</th>
                <th>Size (sqm)</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => (
                <tr key={u.id}>
                  <td><strong className="font-data-md">{u.code}</strong></td>
                  <td>{projectById.get(u.projectId) ?? "—"}</td>
                  <td>{u.type ?? "—"}</td>
                  <td className="font-data-md">{u.sizeSqm != null ? u.sizeSqm.toFixed(1) : "—"}</td>
                  <td className="font-data-md">{formatGHS(u.priceTotal)}</td>
                  <td>
                    <span className={`status-chip status-${u.status.toLowerCase()}`}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
