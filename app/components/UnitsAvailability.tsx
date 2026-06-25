"use client";

import { useEffect, useState } from "react";
import { PropertyInquiryForm } from "./forms/PropertyInquiryForm";
import { formatGHS } from "../../lib/formatters";

type PublicUnit = {
  id: string;
  code: string;
  type: string | null;
  sizeSqm: number | null;
  priceTotal: number;
  status: "AVAILABLE" | "RESERVED" | "SOLD" | "HANDED_OVER";
  project: { name: string; location: string | null };
};

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Available",
  RESERVED:  "Reserved",
  SOLD:      "Sold",
};

const STATUS_CLASS: Record<string, string> = {
  AVAILABLE: "status-available",
  RESERVED:  "status-reserved",
  SOLD:      "status-sold",
};

export function UnitsAvailability({ projectName }: { projectName?: string }) {
  const [units, setUnits] = useState<PublicUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/public/units")
      .then((r) => {
        if (!r.ok) throw new Error("Could not load unit availability");
        return r.json() as Promise<PublicUnit[]>;
      })
      .then((data) => {
        const filtered = projectName
          ? data.filter((u) => u.project.name === projectName)
          : data;
        setUnits(filtered);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectName]);

  if (loading) {
    return (
      <div className="units-availability-grid">
        {[1, 2, 3].map((n) => (
          <div key={n} className="dashboard-card kpi-card" style={{ minHeight: 160, opacity: 0.4 }} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="meta" style={{ padding: "1rem 0" }}>Unit availability temporarily unavailable.</p>;
  }

  if (units.length === 0) {
    return <p className="meta" style={{ padding: "1rem 0" }}>No units currently listed for this property.</p>;
  }

  return (
    <div>
      <div className="units-availability-grid">
        {units.map((unit) => {
          const isActive = activeUnitId === unit.id;
          const canInquire = unit.status === "AVAILABLE" || unit.status === "RESERVED";

          return (
            <div key={unit.id}>
              <article
                className={`dashboard-card kpi-card${canInquire ? " card-interactive" : ""}`}
                style={{ opacity: unit.status === "SOLD" ? 0.65 : 1 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <strong className="font-data-md">{unit.code}</strong>
                  <span className={`status-chip ${STATUS_CLASS[unit.status] ?? "status-default"}`}>
                    {STATUS_LABEL[unit.status] ?? unit.status}
                  </span>
                </div>

                {unit.type && <p className="meta" style={{ margin: "0 0 0.25rem" }}>{unit.type}</p>}

                <div style={{ display: "flex", gap: "1rem", margin: "0.5rem 0" }}>
                  {unit.sizeSqm && (
                    <span className="meta">{unit.sizeSqm.toLocaleString()} m²</span>
                  )}
                  <span className="font-data-md">{formatGHS(unit.priceTotal)}</span>
                </div>

                <p className="meta" style={{ margin: "0 0 0.75rem", fontSize: "0.8rem" }}>
                  {unit.project.name}
                  {unit.project.location ? ` · ${unit.project.location}` : ""}
                </p>

                {canInquire && (
                  <button
                    type="button"
                    className={`btn ${unit.status === "AVAILABLE" ? "btn-primary" : "btn-secondary"}`}
                    style={{ width: "100%", marginTop: "auto" }}
                    onClick={() => setActiveUnitId(isActive ? null : unit.id)}
                  >
                    {isActive
                      ? "Cancel"
                      : unit.status === "AVAILABLE"
                      ? "Reserve this unit"
                      : "Join waitlist"}
                  </button>
                )}

                {unit.status === "SOLD" && (
                  <p className="meta" style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.8rem" }}>
                    No longer available
                  </p>
                )}
              </article>

              {isActive && (
                <div style={{ marginTop: "0.5rem" }}>
                  <PropertyInquiryForm
                    propertyName={`${unit.code} — ${unit.project.name}`}
                    unitId={unit.id}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
