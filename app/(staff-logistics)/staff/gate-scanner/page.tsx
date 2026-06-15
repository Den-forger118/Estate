"use client";

import { SecurityGateWebview } from "../../../components/SecurityGateWebview";
import { useKioskMode } from "../KioskModeContext";

export default function SecurityGateWebviewPage() {
  const { kioskMode, setKioskMode } = useKioskMode();

  return (
    <>
      {!kioskMode && (
        <div className="dashboard-page-header">
          <div>
            <span className="eyebrow">Security · On-site</span>
            <h1>Gate Terminal</h1>
          </div>
          <div className="dashboard-actions">
            <button className="btn btn-secondary" onClick={() => setKioskMode(true)}>
              Fullscreen Kiosk
            </button>
          </div>
        </div>
      )}

      <SecurityGateWebview />

      {kioskMode && (
        <button
          className="staff-exit-kiosk-fab"
          onClick={() => setKioskMode(false)}
          aria-label="Exit fullscreen kiosk mode"
        >
          ✕ Exit Kiosk
        </button>
      )}
    </>
  );
}
