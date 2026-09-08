export default function SuccessPage() {
  return (
    <main className="success-page">
      <div className="success-card">
        <div className="success-mark">✓</div>
        <p className="eyebrow">YOU SAID YES</p>
        <h1 style={{fontSize:56}}>You’re on the map.</h1>
        <p className="lead">
          Your payment was successful. Once Stripe confirms it to the site, the public counter and your city’s total update automatically.
        </p>
        <a className="primary success-button" href="/">See the generosity map →</a>
      </div>
    </main>
  );
}
