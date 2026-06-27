"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ChatMessage, ChatThread } from "../data/types";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BuyerChatView() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selected, setSelected] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/v1/chat")
      .then((r) => r.json())
      .then((data: ChatThread[]) => setThreads(data))
      .catch(() => {})
      .finally(() => setLoadingThreads(false));
  }, []);

  async function openThread(thread: ChatThread) {
    setSelected(thread);
    setMessages([]);
    setDraft("");
    setError(null);
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/v1/chat/${thread.buyerId}/${thread.unitId}`);
      const data = await res.json() as ChatMessage[];
      setMessages(data);
    } catch {
      setError("Failed to load messages.");
    } finally {
      setLoadingMsgs(false);
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!selected || !draft.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/chat/${selected.buyerId}/${selected.unitId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft.trim() }),
      });
      if (res.status === 429) {
        setError("Rate limit reached. Please wait before sending again.");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        setError(body.error ?? "Failed to send.");
        return;
      }
      const msg = await res.json() as ChatMessage;
      setMessages((prev) => [...prev, msg]);
      setDraft("");
      // Refresh thread list so last-message preview updates
      setThreads((prev) =>
        prev.map((t) =>
          t.buyerId === selected.buyerId && t.unitId === selected.unitId
            ? { ...t, lastMessage: msg.body, lastMessageAt: msg.createdAt }
            : t,
        ),
      );
    } finally {
      setSending(false);
    }
  }

  // Render messages with phase dividers
  function renderMessages(msgs: ChatMessage[]) {
    let lastMilestoneId: string | null | undefined = undefined;
    const elements: React.ReactNode[] = [];

    for (const msg of msgs) {
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
            <span>— {label} —</span>
            <span style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>,
        );
      }
      lastMilestoneId = msg.milestoneId;

      const isStaff = msg.senderRole === "STAFF";
      elements.push(
        <div
          key={msg.id}
          style={{
            display: "flex",
            justifyContent: isStaff ? "flex-end" : "flex-start",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "72%",
              padding: "0.6rem 0.875rem",
              borderRadius: isStaff ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
              background: isStaff ? "var(--brand)" : "var(--surface-alt)",
              color: isStaff ? "#fff" : "var(--text)",
              wordBreak: "break-word",
            }}
          >
            <p style={{ margin: 0, fontSize: "0.9rem" }}>{msg.body}</p>
            <p
              style={{
                margin: "0.25rem 0 0",
                fontSize: "0.7rem",
                opacity: 0.7,
                textAlign: isStaff ? "right" : "left",
              }}
            >
              {isStaff ? "You" : "Buyer"} · {fmtTime(msg.createdAt)}
              {msg.milestoneName && <> · <em>{msg.milestoneName}</em></>}
            </p>
          </div>
        </div>,
      );
    }
    return elements;
  }

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Messages</span>
          <h1>Buyer Chat</h1>
          <p>One thread per buyer-unit. Messages are tagged with the active construction phase.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        {/* Thread list */}
        <section
          className="dashboard-card"
          style={{ width: "280px", flexShrink: 0, padding: 0, overflow: "hidden" }}
        >
          <h2 style={{ padding: "0.75rem 1rem", margin: 0, borderBottom: "1px solid var(--border)", fontSize: "0.875rem" }}>
            Threads {threads.length > 0 && `(${threads.length})`}
          </h2>
          {loadingThreads ? (
            <p className="meta" style={{ padding: "1rem" }}>Loading…</p>
          ) : threads.length === 0 ? (
            <p className="meta" style={{ padding: "1rem" }}>No messages yet.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {threads.map((t) => (
                <li key={`${t.buyerId}-${t.unitId}`}>
                  <button
                    type="button"
                    onClick={() => openThread(t)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.75rem 1rem",
                      background: selected?.buyerId === t.buyerId && selected?.unitId === t.unitId
                        ? "var(--surface-alt)"
                        : "transparent",
                      border: "none",
                      borderBottom: "1px solid var(--border)",
                      cursor: "pointer",
                    }}
                  >
                    <strong style={{ display: "block", fontSize: "0.875rem" }}>{t.buyerName}</strong>
                    <small className="meta">{t.unitCode}</small>
                    {t.lastMessage && (
                      <p
                        className="meta"
                        style={{
                          margin: "0.25rem 0 0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "220px",
                        }}
                      >
                        {t.lastMessage}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Thread view */}
        <section className="dashboard-card" style={{ flex: 1, padding: 0, overflow: "hidden" }}>
          {!selected ? (
            <p className="meta" style={{ padding: "2rem", textAlign: "center" }}>
              Select a thread to view the conversation.
            </p>
          ) : (
            <>
              <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)" }}>
                <strong>{selected.buyerName}</strong>
                <span className="meta" style={{ marginLeft: "0.5rem" }}>· {selected.unitCode}</span>
              </div>

              <div
                style={{
                  height: "380px",
                  overflowY: "auto",
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {loadingMsgs ? (
                  <p className="meta" style={{ textAlign: "center", marginTop: "2rem" }}>Loading…</p>
                ) : messages.length === 0 ? (
                  <p className="meta" style={{ textAlign: "center", marginTop: "2rem" }}>No messages yet.</p>
                ) : (
                  <>
                    {renderMessages(messages)}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>

              <form
                onSubmit={handleSend}
                style={{ display: "flex", gap: "0.5rem", padding: "0.75rem 1rem", alignItems: "flex-end" }}
              >
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Reply to buyer…"
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
                  {sending ? "Sending…" : "Reply"}
                </button>
              </form>
              {error && (
                <p className="meta" style={{ padding: "0 1rem 0.75rem", color: "var(--error)" }}>
                  {error}
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
