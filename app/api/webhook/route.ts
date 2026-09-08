import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecret || !webhookSecret) return new NextResponse("Webhook not configured", { status: 500 });

  const stripe = new Stripe(stripeSecret);
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new NextResponse("Missing Stripe-Signature", { status: 400 });

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      const m = session.metadata || {};
      const lat = m.geo_lat ? Number(m.geo_lat) : null;
      const lon = m.geo_lon ? Number(m.geo_lon) : null;

      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from("payments").upsert({
        stripe_checkout_session_id: session.id,
        amount_cents: session.amount_total ?? 0,
        currency: (session.currency ?? "eur").toLowerCase(),
        city: m.geo_city || null,
        region: m.geo_region || null,
        country: m.geo_country || session.customer_details?.address?.country || null,
        latitude: Number.isFinite(lat) ? lat : null,
        longitude: Number.isFinite(lon) ? lon : null,
        paid_at: new Date().toISOString()
      }, { onConflict: "stripe_checkout_session_id", ignoreDuplicates: true });

      if (error) {
        console.error("Supabase insert error", error);
        return new NextResponse("Database error", { status: 500 });
      }
    }
  }
  return NextResponse.json({ received: true });
}
