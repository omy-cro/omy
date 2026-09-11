"use client";

import { FormEvent, useMemo, useState } from "react";

type Preset = 1 | 5 | 10 | 100 | "custom";
const PRESETS: Preset[] = [1, 5, 10, 100, "custom"];

export default function PaymentButtons() {
  const [selected, setSelected] = useState<Preset>(1);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const label = useMemo(() => {
    if (selected !== "custom") return `YES, I'LL SEND €${selected}`;
    const amount = Number(customAmount.replace(",", "."));
    return Number.isFinite(amount) && amount >= 1
      ? `YES, I'LL SEND €${amount.toFixed(2).replace(".00", "")}`
      : "YES, I'LL SEND A CUSTOM AMOUNT";
  }, [selected, customAmount]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    let customAmountCents: number | undefined;

    if (selected === "custom") {
      const amount = Number(customAmount.replace(",", "."));
      if (!Number.isFinite(amount) || amount < 1) {
        setError("Please enter at least €1.");
        return;
      }
      customAmountCents = Math.round(amount * 100);
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selected,
          customAmountCents,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Checkout could not be started.");
      }

      window.location.assign(data.url);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Checkout could not be started.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="amount-grid">
        {PRESETS.map((item) => (
          <button
            className={`amount-button ${selected === item ? "active" : ""}`}
            type="button"
            key={String(item)}
            onClick={() => setSelected(item)}
            aria-pressed={selected === item}
          >
            {item === "custom" ? "Custom" : `€${item}`}
          </button>
        ))}
      </div>

      {selected === "custom" && (
        <div className="custom-wrap">
          <label htmlFor="customAmount">Your amount</label>
          <div className="input-wrap">
            <span>€</span>
            <input
              id="customAmount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="10"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
            />
          </div>
        </div>
      )}

      <button className="primary" type="submit" disabled={loading}>
        {loading ? "OPENING CHECKOUT…" : label}
      </button>

      {error && <p className="error">{error}</p>}
      <p className="microcopy">Secure checkout powered by Stripe.</p>
    </form>
  );
}
