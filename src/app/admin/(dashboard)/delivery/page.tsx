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
      <div className="mt-8 space-y-3">
        {zones.map((z) => (
          <div key={z.id} className="flex justify-between rounded-2xl bg-white p-4 shadow">
            <span className="font-semibold">{z.name}</span>
            <span>{formatGhs(z.deliveryFeeGhs)} · {z.estimatedMins} mins</span>
          </div>
        ))}
      </div>
    </div>
  );
}
