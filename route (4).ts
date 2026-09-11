import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({
      supporters: 0,
      amountCents: 0,
      countries: 0,
      cities: [],
    });
  }

  const { data, error } = await supabase
    .from("payments")
    .select("amount_cents,city,region,country");

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Stats unavailable." }, { status: 500 });
  }

  const rows = data || [];
  const amountCents = rows.reduce((sum, row) => sum + (row.amount_cents || 0), 0);
  const countries = new Set(rows.map((row) => row.country).filter(Boolean)).size;

  const grouped = new Map<
    string,
    { city: string; region: string | null; country: string | null; yeses: number }
  >();

  for (const row of rows) {
    if (!row.city) continue;

    const key = `${row.city}|${row.region || ""}|${row.country || ""}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.yeses += 1;
    } else {
      grouped.set(key, {
        city: row.city,
        region: row.region || null,
        country: row.country || null,
        yeses: 1,
      });
    }
  }

  return NextResponse.json({
    supporters: rows.length,
    amountCents,
    countries,
    cities: [...grouped.values()].sort((a, b) => b.yeses - a.yeses),
  });
}
