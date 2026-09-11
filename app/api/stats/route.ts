import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ supporters: 0, amountCents: 0, countries: 0, cities: [] });

  const { data, error } = await supabaseAdmin.from("payments").select("amount_cents,city,region,country,latitude,longitude");
  if (error) return NextResponse.json({ error: "Stats unavailable." }, { status: 500 });

  const rows = data || [];
  const amountCents = rows.reduce((sum, row) => sum + (row.amount_cents || 0), 0);
  const countries = new Set(rows.map((r) => r.country).filter(Boolean)).size;
  const grouped = new Map<string, any>();

  for (const row of rows) {
    if (!row.city) continue;
    const key = [row.city, row.region || "", row.country || ""].join("|");
    const existing = grouped.get(key);
    if (existing) {
      existing.yeses += 1;
      existing.amountCents += row.amount_cents || 0;
    } else {
      grouped.set(key, {
        city: row.city,
        region: row.region || null,
        country: row.country || null,
        latitude: row.latitude == null ? null : Number(row.latitude),
        longitude: row.longitude == null ? null : Number(row.longitude),
        yeses: 1,
        amountCents: row.amount_cents || 0,
      });
    }
  }

  return NextResponse.json({ supporters: rows.length, amountCents, countries, cities: Array.from(grouped.values()).sort((a, b) => b.yeses - a.yeses) });
}
