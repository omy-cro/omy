export default function PrivacyPage() {
  return (
    <main className="section" style={{maxWidth:760}}>
      <a className="brand" href="/">One Million <span>Yes</span></a>
      <div style={{height:60}} />
      <p className="eyebrow">PRIVACY</p>
      <h2>Privacy at a glance</h2>
      <p style={{color:"#637287",lineHeight:1.7}}>
        To create the public generosity map, the hosting infrastructure may derive an approximate city,
        region, country and coarse location from a visitor's network connection when payment is started.
        The project database is designed to store only those coarse location fields after a successful payment,
        not the visitor's IP address. The public website shows city-level aggregates rather than individual people.
      </p>
      <p style={{color:"#637287",lineHeight:1.7}}>
        Stripe processes payment information separately under its own privacy terms. Before public launch,
        replace this short technical summary with the legally required privacy information for the operator
        and jurisdictions in which the site is offered.
      </p>
    </main>
  );
}
