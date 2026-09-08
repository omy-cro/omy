import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("payments")
      .select("amount_cents,currency,city,region,country,latitude,longitude");
    if (error) throw error;

    const payments = (data ?? []).filter(p => p.currency === "eur");
    const amountCents = payments.reduce((sum,p) => sum + Number(p.amount_cents || 0), 0);
    const countries = new Set(payments.map(p => p.country).filter(Boolean)).size;

    const grouped = new Map<string, any>();
    for (const p of payments) {
      if (!p.city || !p.country) continue;
      const key = `${p.city}|${p.region || ""}|${p.country}`;
      const existing = grouped.get(key) || {
        city:p.city, region:p.region || null, country:p.country,
        latitude:p.latitude ?? null, longitude:p.longitude ?? null,
        supporters:0, amountCents:0
      };
      existing.supporters += 1;
      existing.amountCents += Number(p.amount_cents || 0);
      grouped.set(key, existing);
    }

    const cities = Array.from(grouped.values())
      .sort((a,b) => b.supporters - a.supporters || b.amountCents - a.amountCents)
      .slice(0, 100);

    return NextResponse.json({
      supporters: payments.length,
      amountCents,
      countries,
      cities
    }, { headers: { "Cache-Control":"no-store" }});
  } catch (error) {
    console.error("stats error", error);
    return NextResponse.json({ supporters:0, amountCents:0, countries:0, cities:[] });
  }
}
