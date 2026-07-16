import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import medplannerIcon from '../assets/medplanner-icon.svg';
import anypliLogo from '../assets/anypli-logo.png';
import { publicApi } from '../api/public';

import type { PublicStats, FeaturedDoctor } from '../api/public';

const AVATAR_COLORS = ['var(--accent)', 'var(--lilac)', 'var(--success)'];
const STATUS_LABELS: Array<'status-confirmed' | 'status-pending'> = [
  'status-confirmed', 'status-pending', 'status-confirmed',
];

export default function Home() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [doctors, setDoctors] = useState<FeaturedDoctor[]>([]);

  useEffect(() => {
    publicApi.stats().then((res) => setStats(res.data)).catch(() => {});
    publicApi.featuredDoctors().then((res) => setDoctors(res.data)).catch(() => {});
  }, []);

  const initials = (name: string) =>
    name.replace('Dr. ', '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

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
            <p>
              <strong>{stats ? stats.patients_count : '···'}+</strong> patients nous font déjà confiance
            </p>
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="home-mockup">
            <div className="home-mockup-header">
              <h4>Nos médecins</h4>
              <span className="home-mockup-dot"></span>
            </div>

            {doctors.length === 0 ? (
              <div className="home-appointment-card">
                <div className="home-appointment-info">
                  <p>Aucun médecin disponible pour le moment</p>
                </div>
              </div>
            ) : (
              doctors.map((doc, i) => (
                <div
                  className="home-appointment-card"
                  key={doc.id}
                  style={{ marginBottom: i === doctors.length - 1 ? 0 : undefined }}
                >
                  <div className="home-appointment-avatar" style={{ background: AVATAR_COLORS[i % 3] }}>
                    {initials(doc.name)}
                  </div>
                  <div className="home-appointment-info">
                    <p>{doc.name}</p>
                    <span>{doc.specialty}{doc.city ? ` · ${doc.city}` : ''}</span>
                  </div>
                  <span className={`home-appointment-status ${STATUS_LABELS[i % 3]}`}>
                    Disponible
                  </span>
                </div>
              ))
            )}
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