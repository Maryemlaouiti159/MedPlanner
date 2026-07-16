import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import type { ApiErrorResponse } from '../types';
import anypliLogo from '../assets/anypli-logo.png';
import medplannerIcon from '../assets/medplanner-icon.svg';

export default function Login() {

  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        setError(
          err.response?.data?.errors?.email?.[0] ||
          err.response?.data?.message ||
          'Identifiants incorrects.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
       <div className="auth-logo">
  <img src={medplannerIcon} alt="MedPlanner" style={{ width: '42px', height: '42px' }} />
  <span className="auth-logo-text">MedPlanner</span>
</div>

        <h1 className="auth-title">Content de vous revoir</h1>
        <p className="auth-subtitle">Connectez-vous pour gérer vos rendez-vous</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={`btn-primary ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            Se connecter
          </button>
        </form>

        <div className="auth-links-row">
          <Link to="/forgot-password">Mot de passe oublié ?</Link>
        </div>

        <p className="auth-footer">
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>

        <div style={{
          textAlign: 'center',
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border)'
        }}>
          <p style={{ fontSize: '11px', color: 'var(--text)', marginBottom: '8px', opacity: 0.7 }}>
            Un projet réalisé chez
          </p>
          <img src={anypliLogo} alt="Anypli" style={{ height: '20px', opacity: 0.8 }} />
        </div>
      </div>
    </div>
  );
}