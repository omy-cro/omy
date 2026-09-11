export default function PrivacyPage() {
  return (
    <main className="simple-page">
      <article>
        <p className="eyebrow">One Million Yes</p>
        <h1>Privacy</h1>
        <p>
          Payments are processed by Stripe. The site may use approximate city, region and
          country information supplied by the hosting platform to create aggregated
          geographic statistics. Raw IP addresses are not intentionally stored by this
          application for the public generosity map.
        </p>
        <p>
          Before public launch, replace this page with a complete privacy notice that
          accurately reflects your hosting, payment provider, analytics, email and any
          other services you actually use.
        </p>
        <a className="back-link" href="/">Back</a>
      </article>
    </main>
  );
}
