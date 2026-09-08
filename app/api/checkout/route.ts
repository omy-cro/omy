import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function safeDecode(value: string | null) {
  if (!value) return "";
  try { return decodeURIComponent(value).slice(0, 100); } catch { return value.slice(0, 100); }
}

function coarseCoord(value: string | null) {
  if (!value) return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return (Math.round(n * 10) / 10).toFixed(1);
}

export async function POST(request: Request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!secret || !siteUrl) {
      return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
    }

    const stripe = new Stripe(secret);

    // Vercel derives these values from the requester's public IP.
    // We intentionally do NOT read or store the IP itself.
    const city = safeDecode(request.headers.get("x-vercel-ip-city"));
    const region = safeDecode(request.headers.get("x-vercel-ip-country-region"));
    const country = safeDecode(request.headers.get("x-vercel-ip-country"));
    const latitude = coarseCoord(request.headers.get("x-vercel-ip-latitude"));
    const longitude = coarseCoord(request.headers.get("x-vercel-ip-longitude"));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: 100,
          product_data: {
            name: "One Million Yes",
            description: "One €1 yes in a global social experiment"
          }
        },
        quantity: 1
      }],
      billing_address_collection: "auto",
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/`,
      metadata: {
        project: "one-million-yes",
        geo_city: city,
        geo_region: region,
        geo_country: country,
        geo_lat: latitude,
        geo_lon: longitude
      }
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 500 });
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("checkout error", error);
    return NextResponse.json({ error: "Could not create checkout." }, { status: 500 });
  }
}
