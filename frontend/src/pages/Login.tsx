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
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearErrors();
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        const errors = err.response?.data?.errors;

        if (errors?.email?.[0]) {
          setEmailError(errors.email[0]);
        } else if (errors?.password?.[0]) {
          setPasswordError(errors.password[0]);
        } else {
          setGeneralError(
            err.response?.data?.message ||
            'Une erreur est survenue. Veuillez réessayer.'
          );
        }
      } else {
        setGeneralError('Une erreur est survenue. Veuillez réessayer.');
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
          {generalError && <div className="alert alert-error">{generalError}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
                if (generalError) setGeneralError('');
              }}
              style={{
                borderColor: emailError ? '#dc2626' : undefined,
              }}
            />
            {emailError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                  marginTop: '8px',
                  fontSize: '13px',
                  color: '#dc2626',
                  lineHeight: 1.4,
                }}
              >
                <span style={{ flexShrink: 0 }}>⚠️</span>
                <span>{emailError}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                  if (generalError) setGeneralError('');
                }}
                style={{
                  borderColor: passwordError ? '#dc2626' : undefined,
                  paddingRight: '40px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--muted-foreground)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {passwordError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                  marginTop: '8px',
                  fontSize: '13px',
                  color: '#dc2626',
                  lineHeight: 1.4,
                }}
              >
                <span style={{ flexShrink: 0 }}>⚠️</span>
                <span>{passwordError}</span>
              </div>
            )}
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
          <img
            src={anypliLogo}
            alt="Anypli"
            style={{
              height: '20px',
              opacity: 0.8,
              display: 'block',
              margin: '0 auto',
            }}
          />
        </div>
      </div>
    </div>
  );
}
