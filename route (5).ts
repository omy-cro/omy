import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function nullableNumber(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function save(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn("Supabase is not configured.");
    return;
  }

  if (typeof session.amount_total !== "number") return;

  const metadata = session.metadata || {};

  const { error } = await supabase.from("payments").upsert(
    {
      stripe_checkout_session_id: session.id,
      amount_cents: session.amount_total,
      currency: session.currency || "eur",
      city: metadata.city || null,
      region: metadata.region || null,
      country: metadata.country || null,
      latitude: nullableNumber(metadata.latitude),
      longitude: nullableNumber(metadata.longitude),
      paid_at: new Date(session.created * 1000).toISOString(),
    },
    {
      onConflict: "stripe_checkout_session_id",
      ignoreDuplicates: true,
    }
  );

  if (error) throw error;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  const body = await request.text();

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, secret);

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await save(event.data.object as Stripe.Checkout.Session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 400 });
  }
}
