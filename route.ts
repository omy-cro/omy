import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const PRICE_IDS = {
  1: process.env.STRIPE_PRICE_1,
  5: process.env.STRIPE_PRICE_5,
  10: process.env.STRIPE_PRICE_10,
  100: process.env.STRIPE_PRICE_100,
} as const;

function clean(value: string | null) {
  if (!value) return "";
  try {
    return decodeURIComponent(value).slice(0, 120);
  } catch {
    return value.slice(0, 120);
  }
}

function roundedCoordinate(value: string | null) {
  if (!value) return "";
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(1) : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = body?.amount;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://onemillionyes.com";

    let lineItems;

    if (amount === "custom") {
      const cents = Number(body?.customAmountCents);

      if (!Number.isInteger(cents) || cents < 100 || cents > 10_000_000) {
        return NextResponse.json(
          { error: "Custom amount must be between €1 and €100,000." },
          { status: 400 }
        );
      }

      lineItems = [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "One Million Yes",
              description:
                "Voluntary participation in a global social experiment. No product, service or reward in return.",
            },
            unit_amount: cents,
          },
          quantity: 1,
        },
      ];
    } else {
      const numeric = Number(amount) as 1 | 5 | 10 | 100;

      if (![1, 5, 10, 100].includes(numeric)) {
        return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
      }

      const priceId = PRICE_IDS[numeric];
      if (!priceId) {
        return NextResponse.json(
          { error: `Missing Stripe price configuration for €${numeric}.` },
          { status: 500 }
        );
      }

      lineItems = [{ price: priceId, quantity: 1 }];
    }

    const metadata = {
      project: "one-million-yes",
      city: clean(request.headers.get("x-vercel-ip-city")),
      region: clean(request.headers.get("x-vercel-ip-country-region")),
      country: clean(request.headers.get("x-vercel-ip-country")),
      latitude: roundedCoordinate(request.headers.get("x-vercel-ip-latitude")),
      longitude: roundedCoordinate(request.headers.get("x-vercel-ip-longitude")),
    };

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?checkout=cancelled`,
      allow_promotion_codes: false,
      billing_address_collection: "auto",
      phone_number_collection: { enabled: false },
      metadata,
      payment_intent_data: { metadata },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout could not be started." }, { status: 500 });
  }
}
