"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ChatMessage } from "@/app/data/types";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatPanel({
  buyerId,
  unitId,
}: {
  buyerId: string;
  unitId: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/v1/chat/${buyerId}/${unitId}`)
      .then((r) => r.json())
      .then((data: ChatMessage[]) => setMessages(data))
      .catch(() => setError("Failed to load messages."))
      .finally(() => setLoading(false));
  }, [buyerId, unitId]);

  // Scroll to bottom when messages load or new one arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/chat/${buyerId}/${unitId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (res.status === 429) {
        setError("You're sending messages too quickly. Please wait a moment.");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        setError(body.error ?? "Failed to send message.");
        return;
      }
      const msg = await res.json() as ChatMessage;
      setMessages((prev) => [...prev, msg]);
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  // Build message list with phase dividers
  function renderMessages() {
    let lastMilestoneId: string | null | undefined = undefined;
    const elements: React.ReactNode[] = [];

    for (const msg of messages) {
      // Insert a phase divider when the milestone changes
      if (lastMilestoneId !== undefined && msg.milestoneId !== lastMilestoneId) {
        const label = msg.milestoneName ?? "General";
        elements.push(
          <div
            key={`divider-${msg.id}`}
            style={{
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "0.75rem",
              margin: "0.75rem 0",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span>{label}</span>
            <span style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>,
        );
      }
      lastMilestoneId = msg.milestoneId;

      const isBuyer = msg.senderRole === "BUYER";
      elements.push(
        <div
          key={msg.id}
          style={{
            display: "flex",
            justifyContent: isBuyer ? "flex-end" : "flex-start",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "72%",
              padding: "0.6rem 0.875rem",
              borderRadius: isBuyer ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
              background: isBuyer ? "var(--brand)" : "var(--surface-alt)",
              color: isBuyer ? "#fff" : "var(--text)",
              wordBreak: "break-word",
            }}
          >
            <p style={{ margin: 0, fontSize: "0.9rem" }}>{msg.body}</p>
            <p
              style={{
                margin: "0.25rem 0 0",
                fontSize: "0.7rem",
                opacity: 0.7,
                textAlign: isBuyer ? "right" : "left",
              }}
            >
              {isBuyer ? "You" : "Special Gardens"} · {fmtTime(msg.createdAt)}
              {msg.milestoneName && (
                <> · <em>{msg.milestoneName}</em></>
              )}
            </p>
          </div>
        </div>,
      );
    }
    return elements;
  }

  return (
    <section className="dashboard-card" style={{ marginBottom: "1.5rem" }}>
      <h2 style={{ padding: "1rem 1rem 0.5rem" }}>Messages</h2>

      {/* Thread */}
      <div
        style={{
          height: "320px",
          overflowY: "auto",
          padding: "0.75rem 1rem",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {loading ? (
          <p className="meta" style={{ textAlign: "center", marginTop: "2rem" }}>Loading…</p>
        ) : messages.length === 0 ? (
          <p className="meta" style={{ textAlign: "center", marginTop: "2rem" }}>
            No messages yet. Send us a question below.
          </p>
        ) : (
          <>
            {renderMessages()}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Compose */}
      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          alignItems: "flex-end",
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          rows={2}
          maxLength={2000}
          disabled={sending}
          style={{ flex: 1, resize: "none" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e as unknown as FormEvent);
            }
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={sending || !draft.trim()}
          style={{ alignSelf: "flex-end" }}
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
      {error && (
        <p className="meta" style={{ padding: "0 1rem 0.75rem", color: "var(--error)" }}>
          {error}
        </p>
      )}
    </section>
  );
}
