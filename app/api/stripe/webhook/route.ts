import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function asNullableNumber(value: string | null | undefined) {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function saveSuccessfulCheckout(session: Stripe.Checkout.Session) {
  if (!supabaseAdmin || session.payment_status !== "paid" || typeof session.amount_total !== "number") return;
  const metadata = session.metadata || {};

  const { error } = await supabaseAdmin.from("payments").upsert({
    stripe_checkout_session_id: session.id,
    amount_cents: session.amount_total,
    currency: session.currency || "eur",
    city: metadata.city || null,
    region: metadata.region || null,
    country: metadata.country || null,
    latitude: asNullableNumber(metadata.latitude),
    longitude: asNullableNumber(metadata.longitude),
    paid_at: new Date((session.created || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
  }, { onConflict: "stripe_checkout_session_id", ignoreDuplicates: true });

  if (error) throw error;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 400 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Invalid Stripe webhook signature:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await saveSuccessfulCheckout(event.data.object as Stripe.Checkout.Session);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
