import { Link } from 'react-router-dom';
import medplannerIcon from '../assets/medplanner-icon.svg';
import anypliLogo from '../assets/anypli-logo.png';

export default function Home() {
  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header-logo">
          <img src={medplannerIcon} alt="MedPlanner" style={{ width: '36px', height: '36px' }} />
          <span>MedPlanner</span>
        </div>
        <nav className="home-header-nav">
          <Link to="/login" className="home-nav-link">Connexion</Link>
          <Link to="/register" className="home-nav-cta">Créer un compte</Link>
        </nav>
      </header>

      <section className="home-hero">
        <div className="home-blob home-blob-1"></div>
        <div className="home-blob home-blob-2"></div>
        <div className="home-blob home-blob-3"></div>

        <div className="home-hero-text">
          <span className="home-badge">✨ Nouveau · Réservation en ligne</span>

          <h1>
            Vos rendez-vous médicaux,{' '}
            <span className="highlight">
              tout en douceur
              <svg viewBox="0 0 200 10" preserveAspectRatio="none">
                <path d="M0,8 Q50,2 100,6 T200,4" stroke="var(--lilac)" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p>
            MedPlanner connecte patients et médecins dans une interface calme,
            claire et rassurante. Trouvez un créneau et réservez en quelques secondes.
          </p>

          <div className="home-hero-actions">
            <Link to="/register" className="home-btn-primary">Commencer gratuitement</Link>
            <Link to="/login" className="home-btn-secondary">J'ai déjà un compte</Link>
          </div>

          <div className="home-social-proof">
            <div className="home-avatars">
              <span>M</span>
              <span>K</span>
              <span>S</span>
            </div>
            <p><strong>500+</strong> patients nous font déjà confiance</p>
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="home-mockup">
            <div className="home-mockup-header">
              <h4>Planning aujourd'hui</h4>
              <span className="home-mockup-dot"></span>
            </div>

            <div className="home-appointment-card">
              <div className="home-appointment-avatar" style={{ background: 'var(--accent)' }}>KB</div>
              <div className="home-appointment-info">
                <p>Dr. Kamel Laouiti</p>
                <span>Cardiologie · 09:30</span>
              </div>
              <span className="home-appointment-status status-confirmed">Confirmé</span>
            </div>

            <div className="home-appointment-card">
              <div className="home-appointment-avatar" style={{ background: 'var(--lilac)' }}>AL</div>
              <div className="home-appointment-info">
                <p>Dr. Firas laouiti</p>
                <span>Dermatologue · 14:00</span>
              </div>
              <span className="home-appointment-status status-pending">En attente</span>
            </div>

            <div className="home-appointment-card" style={{ marginBottom: 0 }}>
              <div className="home-appointment-avatar" style={{ background: 'var(--success)' }}>LT</div>
              <div className="home-appointment-info">
                <p>Dr. Faouzia Trimech</p>
                <span>Pédiatrie · 16:15</span>
              </div>
              <span className="home-appointment-status status-confirmed">Confirmé</span>
            </div>
          </div>

          <div className="home-floating-card card-1">
            <div className="home-floating-icon" style={{ background: 'var(--success-bg)' }}>✓</div>
            <p>Rendez-vous confirmé</p>
          </div>

          <div className="home-floating-card card-2">
            <div className="home-floating-icon" style={{ background: 'var(--accent-bg)' }}>🔔</div>
            <p>Rappel envoyé</p>
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="home-section-header">
          <span>Pourquoi MedPlanner</span>
          <h2>Une expérience pensée pour vous</h2>
        </div>

        <div className="home-features-grid">
          <div className="home-feature-card">
            <div className="home-feature-icon blue">📅</div>
            <h3>Réservation rapide</h3>
            <p>Trouvez un créneau disponible et confirmez votre rendez-vous en quelques clics.</p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon lilac">💜</div>
            <h3>Suivi bienveillant</h3>
            <p>Historique clair, rappels doux, aucune paperasse. Votre suivi médical simplifié.</p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon success">🛡️</div>
            <h3>Données protégées</h3>
            <p>Vos informations médicales restent privées, chiffrées et sécurisées en permanence.</p>
          </div>
        </div>
      </section>

      <section className="home-cta-section">
        <div className="home-cta-box">
          <h2>Prêt à simplifier vos rendez-vous ?</h2>
          <p>Rejoignez MedPlanner gratuitement, en moins d'une minute.</p>
          <Link to="/register">Créer mon compte</Link>
        </div>
      </section>

      <footer className="home-footer">
        <p>© 2026 MedPlanner — Prenez soin de vous.</p>
        <img src={anypliLogo} alt="Anypli" style={{ height: '18px', opacity: 0.7 }} />
      </footer>
    </div>
  );
}