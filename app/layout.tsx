import "./globals.css";

export const metadata = {
  title: "One Million Yes",
  description: "Can 1,000,000 people each send €1?"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
