"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function OrderVerifyClient({
  token,
  reference,
  demo,
}: {
  token: string;
  reference?: string;
  demo?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pending = searchParams.get("pending") === "1";
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error" | "waiting">(
    pending ? "waiting" : "idle",
  );
  const [otp, setOtp] = useState("");
  const [sessionId] = useState(searchParams.get("sessionId") || undefined);
  const showOtp = searchParams.get("otp") === "1";

  useEffect(() => {
    const ref = reference || (demo ? token : null);
    if (!ref && !pending) return;

    function verify() {
      setStatus((s) => (s === "waiting" ? "waiting" : "processing"));
      fetch(`/api/track/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref || token }),
      })
        .then((r) => r.json())
        .then((j) => {
          if (j.success) {
            setStatus("done");
            router.refresh();
          } else if (pending) {
            setStatus("waiting");
          } else {
            setStatus("error");
          }
        })
        .catch(() => setStatus(pending ? "waiting" : "error"));
    }

    verify();
    if (pending || ref) {
      const interval = setInterval(verify, 5000);
      return () => clearInterval(interval);
    }
  }, [token, reference, demo, pending, router]);

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setStatus("processing");
    const res = await fetch("/api/payments/moolre/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderToken: token, otpCode: otp, sessionId }),
    });
    const json = await res.json();
    if (json.success && json.data?.paid) {
      setStatus("done");
      router.refresh();
    } else if (json.success && json.data?.pendingMoMo) {
      setStatus("waiting");
    } else {
      setStatus("error");
    }
  }

  if (showOtp && status !== "done") {
    return (
      <form onSubmit={submitOtp} className="mb-6 rounded-2xl bg-gold/10 p-6 shadow">
        <p className="font-semibold text-plum">Enter the OTP sent to your phone</p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="OTP code"
          className="mt-3 w-full rounded-xl border border-plum/20 px-4 py-3"
          required
        />
        <button type="submit" className="mt-3 w-full rounded-full bg-plum py-3 font-bold text-gold">
          Verify OTP
        </button>
      </form>
    );
  }

  if (status === "waiting") {
    return (
      <div className="mb-6 rounded-2xl bg-gold/20 p-4 text-center font-semibold text-plum">
        Approve the MoMo payment prompt on your phone. We&apos;ll confirm automatically…
      </div>
    );
  }

  if (status === "processing") {
    return (
      <div className="mb-6 rounded-2xl bg-gold/20 p-4 text-center font-semibold text-plum">
        Processing Payment...
      </div>
    );
  }
  if (status === "done") {
    return (
      <div className="mb-6 rounded-2xl bg-gold/25 p-4 text-center font-semibold text-plum">
        Payment Successful 🎉
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="mb-6 rounded-2xl bg-plum-dark/10 p-4 text-center font-semibold text-plum-dark">
        Payment verification pending. We&apos;ll update your order shortly.
      </div>
    );
  }
  return null;
}
