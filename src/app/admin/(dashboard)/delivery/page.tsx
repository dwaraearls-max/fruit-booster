"use client";

import { useEffect, useState } from "react";
import { formatGhs } from "@/lib/utils";

type Zone = {
  id: string;
  name: string;
  deliveryFeeGhs: number;
  estimatedMins: number;
  active: boolean;
};

export default function AdminDeliveryPage() {
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    fetch("/api/admin/delivery")
      .then((r) => r.json())
      .then((j) => j.success && setZones(j.data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-black text-plum">Delivery Zones</h1>
      <p className="mt-1 text-sm text-plum/55">Fees and ETA by area</p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-plum/10 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-plum text-gold">
            <tr>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">ETA</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z, i) => (
              <tr key={z.id} className={i % 2 ? "bg-plum/[0.03]" : ""}>
                <td className="px-4 py-3 font-semibold text-plum">{z.name}</td>
                <td className="px-4 py-3">{formatGhs(z.deliveryFeeGhs)}</td>
                <td className="px-4 py-3">{z.estimatedMins} mins</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      z.active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {z.active ? "Active" : "Off"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
