"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  EngineTicket,
  TicketStatus,
  generateScheduledEstateTask,
  readEngineTickets,
  submitResidentTicket,
  writeEngineTickets,
} from "../data/mockMaintenanceEngine";
import { Modal } from "./Modal";
import { showToast } from "./Toast";
import { statusClassForLabel } from "./statusBadge";

type NewTicketOrigin = "RESIDENT" | "ESTATE";

const columns: { title: string; status: TicketStatus }[] = [
  { title: "New", status: "New" },
  { title: "In progress", status: "In Progress" },
  { title: "Resolved", status: "Resolved" },
];

function NewEngineTicketModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (ticket: EngineTicket) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [property, setProperty] = useState("Special Gardens Estate");
  const [unit, setUnit] = useState("—");
  const [origin, setOrigin] = useState<NewTicketOrigin>("RESIDENT");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    const ticket =
      origin === "ESTATE"
        ? generateScheduledEstateTask(title.trim(), description.trim(), property)
        : submitResidentTicket({ title: title.trim(), description: description.trim(), property, unit });
    onCreated(ticket);
    setTitle("");
    setDescription("");
    setUnit("—");
    setOrigin("RESIDENT");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="New Engine Ticket">
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="kanban-origin-selector">
          <label className="kanban-origin-option">
            <input
              type="radio"
              name="origin"
              value="RESIDENT"
              checked={origin === "RESIDENT"}
              onChange={() => setOrigin("RESIDENT")}
            />
            <span className="origin-chip origin-resident">Resident request</span>
          </label>
          <label className="kanban-origin-option">
            <input
              type="radio"
              name="origin"
              value="ESTATE"
              checked={origin === "ESTATE"}
              onChange={() => setOrigin("ESTATE")}
            />
            <span className="origin-chip origin-estate">Estate scheduled</span>
          </label>
        </div>
        <label>
          Issue title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 6-Month Fumigation"
            required
          />
        </label>
        <label>
          Description
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the task"
            required
          />
        </label>
        <label>
          Property
          <input
            value={property}
            onChange={(e) => setProperty(e.target.value)}
          />
        </label>
        {origin === "RESIDENT" && (
          <label>
            Unit
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. Apt 4B"
            />
          </label>
        )}
        <button className="btn btn-primary" type="submit">
          Submit ticket
        </button>
      </form>
    </Modal>
  );
}

export function AdminMaintenanceKanban() {
  const [tickets, setTickets] = useState<EngineTicket[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setTickets(readEngineTickets());
  }, []);

  function onDrop(status: TicketStatus) {
    if (!dragId) return;
    const updated = tickets.map((t) => (t.id === dragId ? { ...t, status } : t));
    setTickets(updated);
    writeEngineTickets(updated);
    showToast(`Ticket ${dragId} moved to ${status}.`);
    setDragId(null);
  }

  function onTicketCreated(ticket: EngineTicket) {
    const updated = readEngineTickets();
    setTickets(updated);
    showToast(`Ticket ${ticket.id} submitted (${ticket.origin}).`);
  }

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Maintenance Engine</span>
          <h1>Dual-Engine Kanban</h1>
          <p>Estate-scheduled tasks and resident-submitted requests in one unified board.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-primary" type="button" onClick={() => setModalOpen(true)}>
            New Ticket
          </button>
        </div>
      </div>

      <NewEngineTicketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={onTicketCreated}
      />

      <div className="kanban-board">
        {columns.map((column) => (
          <section
            className="dashboard-card kanban-column"
            key={column.title}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(column.status)}
          >
            <h2>{column.title}</h2>
            {tickets
              .filter((t) => t.status === column.status)
              .map((ticket) => (
                <article
                  className="kanban-ticket card-interactive"
                  key={ticket.id}
                  draggable
                  onDragStart={() => setDragId(ticket.id)}
                  onDragEnd={() => setDragId(null)}
                >
                  <div className="kanban-ticket-chips">
                    <span className={`status-chip ${statusClassForLabel(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`origin-chip origin-${ticket.origin.toLowerCase()}`}>
                      {ticket.origin === "ESTATE" ? "Estate" : "Resident"}
                    </span>
                  </div>
                  <strong>{ticket.title}</strong>
                  <p className="meta">{ticket.id} · {ticket.property}</p>
                  <p>{ticket.description}</p>
                </article>
              ))}
          </section>
        ))}
      </div>
    </>
  );
}
