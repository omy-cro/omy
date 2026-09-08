"use client";

import { useEffect, useMemo, useState } from "react";

type Stats = {
  supporters: number;
  amountCents: number;
  countries: number;
  cities: Array<{
    city: string;
    region: string | null;
    country: string;
    latitude: number | null;
    longitude: number | null;
    supporters: number;
    amountCents: number;
  }>;
};

const GOAL_PEOPLE = 1_000_000;

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    supporters: 0,
    amountCents: 0,
    countries: 0,
    cities: []
  });
  const [loading, setLoading] = useState(false);

  async function loadStats() {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (res.ok) setStats(await res.json());
    } catch {}
  }

  useEffect(() => {
    loadStats();
    const timer = setInterval(loadStats, 10000);
    return () => clearInterval(timer);
  }, []);

  async function sendOneEuro() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Checkout failed");
      window.location.href = data.url;
    } catch {
      alert("Payment could not be started. Please try again.");
      setLoading(false);
    }
  }

  const percent = useMemo(
    () => Math.min(100, (stats.supporters / GOAL_PEOPLE) * 100),
    [stats.supporters]
  );

  const cityDots = stats.cities
    .filter(c => typeof c.latitude === "number" && typeof c.longitude === "number")
    .slice(0, 80);

  return (
    <main>
      <header className="nav">
        <a className="brand" href="#">One Million <span>Yes</span></a>
        <nav>
          <a href="#experiment">The experiment</a>
          <a href="#map">Generosity map</a>
          <a href="#how">How it works</a>
          <a href="#faq">FAQ</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A GLOBAL SOCIAL EXPERIMENT</p>
          <h1>Will one million people say yes to €1?</h1>
          <p className="lead">
            One tiny ask. No reward. No product.<br/>
            Just a test of human generosity.
          </p>

          <div className="actions">
            <button className="primary xl" onClick={sendOneEuro} disabled={loading}>
              {loading ? "Opening…" : "Yes, I’ll send €1"}
            </button>
            <a className="text-link" href="#experiment">Why this experiment ↓</a>
          </div>

          <div className="micro-proof">
            <strong>{stats.supporters.toLocaleString()}</strong> people have already said yes
          </div>
        </div>

        <div className="hero-visual" id="progress">
          <div className="counter-card">
            <p className="counter-label">PEOPLE WHO SAID YES</p>
            <div className="mega-counter">{stats.supporters.toLocaleString()}</div>
            <div className="goal-row">
              <span>of 1,000,000</span>
              <span>{percent.toFixed(4)}%</span>
            </div>
            <div className="bar"><div className="fill" style={{width: `${Math.max(percent, .15)}%`}} /></div>

            <div className="stats-grid">
              <div><strong>€{(stats.amountCents/100).toLocaleString("en-US", {maximumFractionDigits:2})}</strong><span>received</span></div>
              <div><strong>{stats.countries}</strong><span>countries</span></div>
              <div><strong>{stats.cities.length}</strong><span>cities</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="experiment-band" id="experiment">
        <div>
          <p className="eyebrow">THE QUESTION</p>
          <h2>How generous are we when there is nothing in return?</h2>
        </div>
        <div>
          <p>
            This experiment asks one simple question: if the amount is tiny and the request is honest,
            how many people will simply say yes?
          </p>
          <div className="clarity-note">
            <strong>Just to be clear:</strong> This is not a charity or a charitable donation, and it is not a purchase.
            There is no product, reward or service in return. Sending €1 is entirely voluntary and simply means taking part in the social experiment.
          </div>
        </div>
      </section>

      <section className="map-section" id="map">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE GENEROSITY MAP</p>
            <h2>Where are the yeses coming from?</h2>
          </div>
          <p className="map-note">
            City locations are approximate and aggregated. No individual person is shown on the map.
          </p>
        </div>

        <div className="map-layout">
          <div className="world-panel">
            <div className="world-grid" aria-label="Approximate world generosity map">
              <div className="continent c1"/>
              <div className="continent c2"/>
              <div className="continent c3"/>
              <div className="continent c4"/>
              <div className="continent c5"/>
              <div className="continent c6"/>
              {cityDots.map((c, i) => {
                const left = ((c.longitude! + 180) / 360) * 100;
                const top = ((90 - c.latitude!) / 180) * 100;
                const size = Math.max(8, Math.min(28, 7 + Math.sqrt(c.supporters) * 4));
                return (
                  <div
                    key={`${c.city}-${c.country}-${i}`}
                    className="map-dot"
                    style={{left:`${left}%`, top:`${top}%`, width:size, height:size}}
                    title={`${c.city}: ${c.supporters} yes${c.supporters === 1 ? "" : "es"}`}
                  />
                );
              })}
              {cityDots.length === 0 && (
                <>
                  <div className="demo-dot d1"/><div className="demo-dot d2"/><div className="demo-dot d3"/>
                  <div className="map-empty">The first confirmed payments will light up the map.</div>
                </>
              )}
            </div>
          </div>

          <aside className="leaderboard">
            <div className="leaderboard-title">Most generous cities</div>
            {stats.cities.length ? stats.cities.slice(0, 8).map((c, i) => (
              <div className="city-row" key={`${c.city}-${c.country}`}>
                <span className="rank">{String(i+1).padStart(2,"0")}</span>
                <div className="city-name">
                  <strong>{c.city}</strong>
                  <span>{[c.region, c.country].filter(Boolean).join(", ")}</span>
                </div>
                <strong className="city-count">{c.supporters}</strong>
              </div>
            )) : (
              <div className="empty-list">No city has taken the lead yet.</div>
            )}
          </aside>
        </div>
      </section>

      <section className="section" id="how">
        <p className="eyebrow">HOW IT WORKS</p>
        <h2>Ridiculously simple.</h2>
        <div className="cards">
          <article>
            <div className="icon">01</div>
            <h3>You get asked</h3>
            <p>One question. One euro. No pitch and no promise of anything in return.</p>
          </article>
          <article>
            <div className="icon">02</div>
            <h3>You say yes</h3>
            <p>Your payment is processed securely by Stripe. Only completed payments are counted.</p>
          </article>
          <article>
            <div className="icon">03</div>
            <h3>Your city lights up</h3>
            <p>The city is added only as an anonymous aggregate so we can see where generosity clusters.</p>
          </article>
        </div>
      </section>

      <section className="big-cta">
        <p className="eyebrow">ONE SMALL YES</p>
        <h2>Would you?</h2>
        <button className="primary xl" onClick={sendOneEuro} disabled={loading}>
          {loading ? "Opening…" : "Yes. Send €1 →"}
        </button>
      </section>

      <section className="faq section" id="faq">
        <p className="eyebrow">FAQ</p>
        <h2>The obvious questions.</h2>
        <details>
          <summary>Is this a charity or a donation?</summary>
          <p>No. This is a private social experiment, not a charitable fundraising campaign. Sending €1 is voluntary and does not buy a product, service, reward or membership.</p>
        </details>
        <details>
          <summary>Why €1?</summary>
          <p>Because the individual ask should be almost trivial. The interesting part is what happens at scale.</p>
        </details>
        <details>
          <summary>Can people be identified on the map?</summary>
          <p>No. The public map only uses aggregated approximate city-level information. Individual addresses and IP addresses are not displayed.</p>
        </details>
        <details>
          <summary>How does the counter work?</summary>
          <p>A person is counted only after Stripe confirms a completed payment.</p>
        </details>
      </section>

      <footer>
        <div><div className="brand">One Million <span>Yes</span></div><div className="footer-small">A global social experiment.</div></div>
        <div className="footer-links"><a href="#faq">FAQ</a><a href="/privacy">Privacy</a><a href="mailto:hello@example.com">Contact</a></div>
      </footer>
    </main>
  );
}
