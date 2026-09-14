"use client";

import { useEffect, useState } from "react";
import { formatGhs } from "@/lib/utils";

type Customer = {
  id: string;
  fullName: string | null;
  phone: string;
  email: string | null;
  orderCount: number;
  totalSpentGhs: number;
  createdAt: string;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCustomers(json.data);
        setLoading(false);
      });
  }, []);

  const filtered = customers.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.fullName || "").toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-plum">Customers</h1>
      <p className="mt-1 text-sm text-plum/55">People who ordered online</p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name, phone, email…"
        className="mt-6 w-full max-w-md rounded-xl border border-plum/20 bg-white px-4 py-2.5 text-sm focus:border-plum focus:outline-none"
      />

      {loading ? (
        <p className="mt-6 text-plum/60">Loading…</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-plum/10 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-plum text-gold">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Orders</th>
                <th className="px-4 py-3 font-semibold">Total spent</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className={i % 2 ? "bg-plum/[0.03]" : "bg-white"}>
                  <td className="px-4 py-3 font-semibold text-plum">{c.fullName || "—"}</td>
                  <td className="px-4 py-3 text-plum/80">{c.phone}</td>
                  <td className="px-4 py-3">{c.orderCount}</td>
                  <td className="px-4 py-3 font-semibold">{formatGhs(c.totalSpentGhs)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-plum/50">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
