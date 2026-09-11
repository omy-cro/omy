import PaymentButtons from "./components/PaymentButtons";
import LiveStats from "./components/LiveStats";

export default function Home() {
  return (
    <main className="site">
      <header className="container header">
        <div className="brand">One Million Yes</div>
        <nav className="header-links" aria-label="Main navigation">
          <a href="#why">Why this experiment?</a>
          <a href="#map">Generosity map</a>
        </nav>
      </header>

      <section className="hero">
        <div className="container">
          <p className="eyebrow">A global social experiment</p>
          <h1>Will one million people say yes to €1?</h1>
          <p className="hero-subtitle">
            One tiny ask. No reward. No product. Just a test of human generosity.
          </p>

          <div className="checkout-card">
            <PaymentButtons />
          </div>
        </div>
      </section>

      <LiveStats />

      <section className="section" id="why">
        <div className="container">
          <p className="eyebrow">Why this experiment?</p>
          <h2>How generous are we when there is nothing in return?</h2>
          <p>
            One Million Yes asks a deliberately simple question: will people voluntarily
            send a tiny amount simply because they were asked? There is no product, reward,
            service or promise in return. The experiment is about the decision to say yes.
          </p>
        </div>
      </section>

      <section className="section disclaimer">
        <div className="container">
          <h2>Just the experiment.</h2>
          <p>
            This is not a charity, not a charitable donation and not a purchase. There is
            no product, reward, service or promise in return. Participation is entirely
            voluntary and exists only as part of this social experiment.
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} One Million Yes</span>
          <div className="footer-links">
            <a href="/privacy">Privacy</a>
            <a href="/imprint">Imprint</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
