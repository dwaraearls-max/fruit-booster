"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone") || undefined,
          message: form.get("message"),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setStatus("err");
        setMessage(json.message || "Could not send message.");
        return;
      }
      setStatus("ok");
      setMessage("Message sent — we’ll get back to you soon.");
      e.currentTarget.reset();
    } catch {
      setStatus("err");
      setMessage("Could not send message.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-4 rounded-2xl bg-gold/10 p-6 shadow">
      <h2 className="text-xl font-bold text-plum">Send a message</h2>
      <input
        name="name"
        required
        placeholder="Your name"
        className="w-full rounded-xl border border-plum/15 bg-white px-4 py-3 text-plum outline-none focus:border-plum"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="w-full rounded-xl border border-plum/15 bg-white px-4 py-3 text-plum outline-none focus:border-plum"
      />
      <input
        name="phone"
        placeholder="Phone (optional)"
        className="w-full rounded-xl border border-plum/15 bg-white px-4 py-3 text-plum outline-none focus:border-plum"
      />
      <textarea
        name="message"
        required
        rows={5}
        placeholder="How can we help?"
        className="w-full rounded-xl border border-plum/15 bg-white px-4 py-3 text-plum outline-none focus:border-plum"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-plum px-6 py-3 text-sm font-bold uppercase tracking-wide text-gold disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      {message ? (
        <p className={`text-sm ${status === "ok" ? "text-emerald-700" : "text-rose-700"}`}>{message}</p>
      ) : null}
    </form>
  );
}
