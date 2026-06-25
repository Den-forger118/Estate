"use client";

import { useEffect, useState } from "react";
import { getBuyers, getUnits } from "../../lib/api-client";
import type { Buyer, Unit } from "../data/types";
import { formatGHS } from "../../lib/formatters";
import { showToast } from "../components/Toast";

export function BuyersView() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBuyer, setSelectedBuyer] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [buyersData, unitsData] = await Promise.all([
          getBuyers(),
          getUnits(),
        ]);
        setBuyers(buyersData);
        setUnits(unitsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load buyers");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Buyers</span>
          <h1>Loading buyers...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Buyers</span>
          <h1>Error</h1>
          <p className="form-error">{error}</p>
        </div>
      </div>
    );
  }

  const buyerUnitsMap = new Map<string, Unit[]>();
  units.forEach((unit) => {
    if (unit.buyerId) {
      const existing = buyerUnitsMap.get(unit.buyerId) || [];
      buyerUnitsMap.set(unit.buyerId, [...existing, unit]);
    }
  });

  const selectedBuyerData = selectedBuyer
    ? buyers.find((b) => b.id === selectedBuyer)
    : null;
  const selectedBuyerUnits = selectedBuyer
    ? buyerUnitsMap.get(selectedBuyer) || []
    : [];

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Buyers</span>
          <h1>Property Buyers</h1>
          <p>Off-plan buyers with active reservations and payment plans.</p>
        </div>
        <div className="dashboard-actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => showToast("Add buyer — feature available in full deployment.", "info")}
          >
            Add Buyer
          </button>
        </div>
      </div>

      <div className="dashboard-kpi-grid">
        <article className="dashboard-card kpi-card">
          <div>
            <span>Total Buyers</span>
            <strong className="font-data-lg">{buyers.length}</strong>
          </div>
          <small>Active purchasers</small>
        </article>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Units Sold</span>
            <strong className="font-data-lg">
              {units.filter((u) => u.status === "SOLD").length}
            </strong>
          </div>
          <small>Out of {units.length} total units</small>
        </article>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Diaspora Buyers</span>
            <strong className="font-data-lg">
              {buyers.filter((b) => b.isDiaspora).length}
            </strong>
          </div>
          <small>{Math.round((buyers.filter((b) => b.isDiaspora).length / buyers.length) * 100)}% of buyers</small>
        </article>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Reserved</span>
            <strong className="font-data-lg">
              {units.filter((u) => u.status === "RESERVED").length}
            </strong>
          </div>
          <small>Pending full payment</small>
        </article>
      </div>

      <div className="dashboard-card table-card">
        <table className="zebra-rows">
          <thead>
            <tr>
              <th>Buyer</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Units</th>
              <th>Total Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map((buyer) => {
              const buyerUnits = buyerUnitsMap.get(buyer.id) || [];
              const totalValue = buyerUnits.reduce((sum, u) => sum + u.priceTotal, 0);
              return (
                <tr key={buyer.id}>
                  <td>
                    <strong>{buyer.fullName}</strong>
                    {buyer.email ? (
                      <>
                        <br />
                        <span className="meta">{buyer.email}</span>
                      </>
                    ) : null}
                  </td>
                  <td>{buyer.phone}</td>
                  <td>
                    <span className={`status-chip ${buyer.isDiaspora ? "status-info" : "status-success"}`}>
                      {buyer.isDiaspora ? "Diaspora" : "Local"}
                    </span>
                  </td>
                  <td>{buyerUnits.length} unit{buyerUnits.length !== 1 ? "s" : ""}</td>
                  <td className="font-data-md">{formatGHS(totalValue)}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => setSelectedBuyer(buyer.id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedBuyerData && (
        <div className="dashboard-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
            <div>
              <h2>{selectedBuyerData.fullName}</h2>
              <p className="meta">
                {selectedBuyerData.phone} • {selectedBuyerData.email || "No email"}
              </p>
            </div>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setSelectedBuyer(null)}
            >
              Close
            </button>
          </div>

          <h3 style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>Units Purchased</h3>
          <div className="property-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {selectedBuyerUnits.map((unit) => (
              <div key={unit.id} className="dashboard-card" style={{ padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                  <strong className="font-data-md">{unit.code}</strong>
                  <span className={`status-chip status-${unit.status.toLowerCase()}`}>
                    {unit.status}
                  </span>
                </div>
                <p className="meta">{unit.type || "Unit"}</p>
                {unit.sizeSqm && <p className="meta">{unit.sizeSqm} m²</p>}
                <p style={{ marginTop: "0.75rem" }}>
                  <strong>{formatGHS(unit.priceTotal)}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
