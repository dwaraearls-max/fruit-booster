"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (json.success) router.push("/admin");
    else setError(json.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-plum px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-plum/10 bg-white p-8 shadow-2xl"
      >
        <h1 className="text-2xl font-black text-plum">Fruit Booster Admin</h1>
        <p className="mt-1 text-sm text-plum/60">Sign in to manage orders and products</p>
        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-plum/25 bg-white px-4 py-3 text-plum placeholder:text-plum/45 focus:border-plum focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-plum/25 bg-white px-4 py-3 text-plum placeholder:text-plum/45 focus:border-plum focus:outline-none"
            required
          />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-full bg-plum py-3 font-bold text-gold transition hover:bg-plum-light"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
