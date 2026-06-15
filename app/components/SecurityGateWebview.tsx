"use client";

import { FormEvent, useEffect, useState } from "react";

type GateEntry = {
  ref: string;
  input: string;
  scannedAt: string;
};

const GATE_LOG_KEY = "ernest_gate_log";

function readGateLog(): GateEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(GATE_LOG_KEY) ?? "[]") as GateEntry[];
  } catch {
    return [];
  }
}

function writeGateLog(entries: GateEntry[]): void {
  window.localStorage.setItem(GATE_LOG_KEY, JSON.stringify(entries));
}

export function SecurityGateWebview() {
  const [scanInput, setScanInput] = useState("");
  const [log, setLog] = useState<GateEntry[]>([]);

  useEffect(() => {
    setLog(readGateLog());
  }, []);

  function handleScan(e: FormEvent) {
    e.preventDefault();
    if (!scanInput.trim()) return;
    const entry: GateEntry = {
      ref: `SCAN-${Date.now()}`,
      input: scanInput.trim(),
      scannedAt: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
    const updated = [entry, ...log];
    setLog(updated);
    writeGateLog(updated);
    setScanInput("");
  }

  return (
    <div className="gate-scanner">
      <div className="gate-scanner-header">
        <h1>Gate Scanner</h1>
        <p className="meta">Special Gardens — Security Station</p>
      </div>

      <form className="gate-scanner-input" onSubmit={handleScan}>
        <input
          value={scanInput}
          onChange={(e) => setScanInput(e.target.value)}
          placeholder="Scan or enter gate pass reference..."
          autoComplete="off"
          required
        />
        <button className="btn btn-primary" type="submit">
          Log Entry
        </button>
      </form>

      <div className="gate-scanner-log">
        <h2>Recent entries</h2>
        {log.length === 0 ? (
          <p className="meta">No entries logged yet.</p>
        ) : (
          <table className="zebra-rows">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Input</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {log.map((entry) => (
                <tr key={entry.ref}>
                  <td className="font-data-md">{entry.ref}</td>
                  <td>{entry.input}</td>
                  <td className="meta">{entry.scannedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
