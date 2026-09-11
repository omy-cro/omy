"use client";

import { useEffect, useState } from "react";

type City = {
  city: string;
  region: string | null;
  country: string | null;
  yeses: number;
};

type Stats = {
  supporters: number;
  amountCents: number;
  countries: number;
  cities: City[];
};

const EMPTY: Stats = {
  supporters: 0,
  amountCents: 0,
  countries: 0,
  cities: [],
};

export default function LiveStats() {
  const [stats, setStats] = useState<Stats>(EMPTY);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/stats", { cache: "no-store" });

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled) {
          setStats(data);
        }
      } catch {
        // Solange Stats/Supabase noch nicht vollständig eingerichtet sind,
        // bleibt die Anzeige einfach bei 0.
      }
    }

    load();

    const interval = setInterval(load, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const euros = new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(stats.amountCents / 100);

  return (
    <>
      <section className="stats-section">
        <div className="container stats-grid">
          <div className="stat">
            <strong>{stats.supporters.toLocaleString("en")}</strong>
            <span>people said yes</span>
          </div>

          <div className="stat">
            <strong>{euros}</strong>
            <span>sent in total</span>
          </div>

          <div className="stat">
            <strong>{stats.countries.toLocaleString("en")}</strong>
            <span>countries represented</span>
          </div>
        </div>
      </section>

      <section className="section" id="map">
        <div className="container">
          <p className="eyebrow">Generosity map</p>

          <h2>Where people said yes</h2>

          <p>
            Only approximate city-level information is used. Exact addresses
            and raw IP addresses are not stored for this visualization.
          </p>

          <div className="city-list">
            {stats.cities.length === 0 ? (
              <div className="city-row">
                <span>
                  The first cities will appear here after confirmed payments.
                </span>
                <span>0</span>
              </div>
            ) : (
              stats.cities.slice(0, 12).map((city) => (
                <div
                  className="city-row"
                  key={`${city.city}-${city.region || ""}-${city.country || ""}`}
                >
                  <span>
                    {city.city}
                    {city.country ? `, ${city.country}` : ""}
                  </span>

                  <span>{city.yeses}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
