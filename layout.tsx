import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "One Million Yes",
  description: "A global social experiment about one tiny act of generosity.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://onemillionyes.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
