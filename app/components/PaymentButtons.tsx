"use client";

import { FormEvent, useMemo, useState } from "react";

type Preset = 1 | 5 | 10 | 100 | "custom";
const PRESETS: Preset[] = [1, 5, 10, 100, "custom"];

export default function PaymentButtons() {
  const [selected, setSelected] = useState<Preset>(1);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buttonLabel = useMemo(() => {
    if (selected === "custom") {
      const parsed = Number(customAmount.replace(",", "."));
      return Number.isFinite(parsed) && parsed >= 1
        ? `YES, I'LL SEND €${parsed.toFixed(2).replace(".00", "")}`
        : "YES, I'LL SEND A CUSTOM AMOUNT";
    }
    return `YES, I'LL SEND €${selected}`;
  }, [selected, customAmount]);

  async function startCheckout(event: FormEvent) {
    event.preventDefault();
    setError("");
    let customAmountCents: number | undefined;

    if (selected === "custom") {
      const parsed = Number(customAmount.replace(",", "."));
      if (!Number.isFinite(parsed) || parsed < 1) {
        setError("Please enter at least €1.");
        return;
      }
      customAmountCents = Math.round(parsed * 100);
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selected, customAmountCents }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || "Checkout could not be started.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout could not be started.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={startCheckout} style={{ width: "100%", maxWidth: 620, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10, marginBottom: 14 }}>
        {PRESETS.map((amount) => {
          const active = selected === amount;
          return (
            <button key={String(amount)} type="button" onClick={() => setSelected(amount)} aria-pressed={active}
              style={{ border: active ? "2px solid #2f9b66" : "1px solid #d8dee8", background: active ? "#eaf7f0" : "#ffffff", color: "#13213a", borderRadius: 12, padding: "13px 8px", fontWeight: 700, cursor: "pointer" }}>
              {amount === "custom" ? "Custom" : `€${amount}`}
            </button>
          );
        })}
      </div>

      {selected === "custom" && (
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="custom-amount" style={{ display: "block", textAlign: "left", fontSize: 14, marginBottom: 6 }}>Your amount</label>
          <div style={{ position: "relative" }}>
            <span aria-hidden="true" style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)" }}>€</span>
            <input id="custom-amount" inputMode="decimal" autoComplete="off" value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)} placeholder="10"
              style={{ width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: 12, padding: "13px 14px 13px 34px", fontSize: 16 }} />
          </div>
        </div>
      )}

      <button type="submit" disabled={loading}
        style={{ width: "100%", border: 0, borderRadius: 12, padding: "16px 18px", background: "#2f9b66", color: "white", fontWeight: 800, fontSize: 16, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.75 : 1 }}>
        {loading ? "OPENING CHECKOUT…" : buttonLabel}
      </button>

      {error && <p role="alert" style={{ color: "#b42318", fontSize: 14, marginTop: 10 }}>{error}</p>}
      <p style={{ color: "#667085", fontSize: 12, marginTop: 10, textAlign: "center" }}>Secure checkout powered by Stripe.</p>
    </form>
  );
}
