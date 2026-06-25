"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  getProjects,
  getMilestones,
  getConstructionUpdates,
  completeMilestone,
  postConstructionUpdate,
} from "../../lib/api-client";
import type { Project, Milestone, ConstructionUpdate } from "../data/types";
import { formatDate } from "../../lib/formatters";
import { Modal } from "../components/Modal";
import { showToast } from "../components/Toast";
import { statusClassForLabel } from "../components/statusBadge";

function milestoneStatusLabel(status: string): string {
  if (status === "NOT_STARTED") return "Not started";
  if (status === "IN_PROGRESS") return "In progress";
  if (status === "COMPLETED") return "Completed";
  return status;
}

type AddPhotoTarget = { milestoneId: string; milestoneName: string };

export function MilestonesView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Map<string, Milestone[]>>(new Map());
  const [updates, setUpdates] = useState<Map<string, ConstructionUpdate[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [addPhotoFor, setAddPhotoFor] = useState<AddPhotoTarget | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [submittingPhoto, setSubmittingPhoto] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const projs = await getProjects();
        setProjects(projs);

        const [milestonesMap, updatesMap] = await Promise.all([
          Promise.all(projs.map((p) => getMilestones(p.id).then((ms) => [p.id, ms] as const))),
          Promise.all(projs.map((p) => getConstructionUpdates(p.id).then((us) => [p.id, us] as const))),
        ]);

        const newMilestones = new Map(milestonesMap);
        setMilestones(newMilestones);

        // Index updates by milestoneId
        const byMilestone = new Map<string, ConstructionUpdate[]>();
        for (const [, projectUpdates] of updatesMap) {
          for (const u of projectUpdates) {
            const existing = byMilestone.get(u.milestoneId) ?? [];
            byMilestone.set(u.milestoneId, [...existing, u]);
          }
        }
        setUpdates(byMilestone);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load milestones");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleComplete(milestone: Milestone) {
    setCompleting(milestone.id);
    try {
      const updated = await completeMilestone(milestone.id);
      setMilestones((prev) => {
        const next = new Map(prev);
        const list = next.get(milestone.projectId) ?? [];
        next.set(
          milestone.projectId,
          list.map((m) => (m.id === milestone.id ? { ...m, ...updated } : m)),
        );
        return next;
      });
      showToast(`"${milestone.name}" marked complete. Linked installments set to DUE.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to complete milestone", "error");
    } finally {
      setCompleting(null);
    }
  }

  async function handleAddPhoto(e: FormEvent) {
    e.preventDefault();
    if (!addPhotoFor || !photoUrl.trim()) return;
    setSubmittingPhoto(true);
    try {
      const update = await postConstructionUpdate(addPhotoFor.milestoneId, {
        photoUrl: photoUrl.trim(),
        caption: caption.trim() || undefined,
      });
      setUpdates((prev) => {
        const next = new Map(prev);
        const existing = next.get(addPhotoFor.milestoneId) ?? [];
        next.set(addPhotoFor.milestoneId, [...existing, update]);
        return next;
      });
      showToast("Progress photo added. You can now complete this milestone.");
      setPhotoUrl("");
      setCaption("");
      setAddPhotoFor(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add photo", "error");
    } finally {
      setSubmittingPhoto(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Milestones</span>
          <h1>Loading milestones...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Milestones</span>
          <h1>Error</h1>
          <p className="form-error">{error}</p>
        </div>
      </div>
    );
  }

  const totalMilestones = Array.from(milestones.values()).reduce((n, ms) => n + ms.length, 0);
  const completedCount = Array.from(milestones.values())
    .flat()
    .filter((m) => m.status === "COMPLETED").length;
  const inProgressCount = Array.from(milestones.values())
    .flat()
    .filter((m) => m.status === "IN_PROGRESS").length;

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Milestones</span>
          <h1>Construction Milestones</h1>
          <p>Track progress across all projects. A photo is required before marking a milestone complete.</p>
        </div>
        <div className="dashboard-actions">
          <span className="meta">
            {completedCount}/{totalMilestones} complete · {inProgressCount} in progress
          </span>
        </div>
      </div>

      {projects.map((project) => {
        const projectMilestones = (milestones.get(project.id) ?? []).sort(
          (a, b) => a.sequence - b.sequence,
        );
        if (projectMilestones.length === 0) return null;

        return (
          <section key={project.id} className="dashboard-card" style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0 }}>{project.name}</h2>
              <small className="meta">{project.location}</small>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {projectMilestones.map((milestone) => {
                const milestoneUpdates = updates.get(milestone.id) ?? [];
                const hasPhotos = milestoneUpdates.length > 0;
                const isCompleting = completing === milestone.id;
                const canComplete = milestone.status === "IN_PROGRESS" && hasPhotos && !isCompleting;
                const needsPhoto = milestone.status === "IN_PROGRESS" && !hasPhotos;

                return (
                  <article
                    key={milestone.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 1rem",
                      background: "var(--surface-alt)",
                      borderRadius: "var(--radius)",
                      border: needsPhoto ? "1px solid var(--accent)" : "1px solid transparent",
                    }}
                  >
                    <span
                      className="font-data-md"
                      style={{
                        minWidth: "1.5rem",
                        color: "var(--muted)",
                        textAlign: "center",
                      }}
                    >
                      {milestone.sequence}
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", marginBottom: "0.125rem" }}>
                        {milestone.name}
                      </strong>
                      <span className="meta">
                        {milestone.completedAt
                          ? `Completed ${formatDate(milestone.completedAt)}`
                          : milestone.targetDate
                          ? `Target ${formatDate(milestone.targetDate)}`
                          : null}
                        {milestoneUpdates.length > 0 && (
                          <> · {milestoneUpdates.length} photo{milestoneUpdates.length !== 1 ? "s" : ""}</>
                        )}
                      </span>
                    </div>

                    <span
                      className={`status-chip ${statusClassForLabel(milestoneStatusLabel(milestone.status))}`}
                    >
                      {milestoneStatusLabel(milestone.status)}
                    </span>

                    {milestone.status === "IN_PROGRESS" && (
                      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: "0.8125rem", padding: "0.25rem 0.625rem" }}
                          onClick={() =>
                            setAddPhotoFor({
                              milestoneId: milestone.id,
                              milestoneName: milestone.name,
                            })
                          }
                        >
                          Add photo
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ fontSize: "0.8125rem", padding: "0.25rem 0.625rem" }}
                          disabled={!canComplete}
                          title={needsPhoto ? "Add a progress photo before completing this milestone" : undefined}
                          onClick={() => handleComplete(milestone)}
                        >
                          {isCompleting ? "Completing…" : "Complete"}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <Modal
        open={!!addPhotoFor}
        onClose={() => {
          setAddPhotoFor(null);
          setPhotoUrl("");
          setCaption("");
        }}
        title={addPhotoFor ? `Add photo — ${addPhotoFor.milestoneName}` : "Add photo"}
      >
        <form className="form-grid" onSubmit={handleAddPhoto}>
          <label>
            Photo URL
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              required
            />
          </label>
          <label>
            Caption <span className="meta">(optional)</span>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              placeholder="Describe what was completed..."
              style={{ resize: "vertical" }}
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submittingPhoto || !photoUrl.trim()}
          >
            {submittingPhoto ? "Saving…" : "Save photo"}
          </button>
        </form>
      </Modal>
    </>
  );
}
