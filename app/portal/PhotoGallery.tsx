"use client";

import { useState } from "react";
import type { ConstructionUpdate } from "@/app/data/types";

export function PhotoGallery({ updates }: { updates: ConstructionUpdate[] }) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (updates.length === 0) return null;

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
        {updates.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => setLightboxUrl(u.photoUrl)}
            title={u.caption ?? "View photo"}
            style={{
              padding: 0,
              border: "2px solid var(--border)",
              borderRadius: "4px",
              cursor: "zoom-in",
              background: "var(--surface)",
              overflow: "hidden",
              width: "68px",
              height: "68px",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={u.photoUrl}
              alt={u.caption ?? "Construction photo"}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </button>
        ))}
      </div>

      {lightboxUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo enlarged"
          onClick={() => setLightboxUrl(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            cursor: "zoom-out",
            padding: "1.5rem",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="Enlarged construction photo"
            style={{
              maxWidth: "100%",
              maxHeight: "90vh",
              borderRadius: "6px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              objectFit: "contain",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "1rem",
              right: "1.25rem",
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "1.75rem",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
