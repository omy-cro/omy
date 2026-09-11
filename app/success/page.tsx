export default function SuccessPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#fff", color: "#13213a", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <section style={{ maxWidth: 640, textAlign: "center" }}>
        <p style={{ textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 12, fontWeight: 800, color: "#2f9b66" }}>One Million Yes</p>
        <h1 style={{ fontSize: "clamp(42px, 8vw, 72px)", lineHeight: 1, margin: "18px 0" }}>You said yes.</h1>
        <p style={{ color: "#667085", fontSize: 18, lineHeight: 1.6 }}>Thank you for being part of the experiment. Your payment has been confirmed.</p>
        <a href="/" style={{ display: "inline-block", marginTop: 28, background: "#2f9b66", color: "#fff", textDecoration: "none", padding: "14px 22px", borderRadius: 12, fontWeight: 800 }}>Back to One Million Yes</a>
      </section>
    </main>
  );
}
