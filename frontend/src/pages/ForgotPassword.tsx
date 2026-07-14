import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';
import type { ApiErrorResponse } from '../types';
import anypliLogo from '../assets/anypli-logo.png';
import medplannerIcon from '../assets/medplanner-icon.svg';
type Step = 'email' | 'code' | 'password';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<{ message: string }>('/forgot-password', { email });
      setMessage(response.data.message);
      setStep('code');
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        setError(err.response?.data?.message || 'Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/verify-reset-code', { email, code });
      setStep('password');
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        setError(err.response?.data?.message || 'Code invalide.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/reset-password', {
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      });
      navigate('/login');
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        setError(err.response?.data?.message || 'Erreur lors de la réinitialisation.');
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
        {step === 'email' && (
          <>
            <h1 className="auth-title">Mot de passe oublié</h1>
            <p className="auth-subtitle">Entrez votre email pour recevoir un code</p>

            <form className="auth-form" onSubmit={handleSendEmail}>
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

              <button type="submit" className={`btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
                Envoyer le code
              </button>
            </form>
          </>
        )}

        {step === 'code' && (
          <>
            <h1 className="auth-title">Vérification</h1>
            <p className="auth-subtitle">Entrez le code à 6 chiffres reçu par email</p>

            <form className="auth-form" onSubmit={handleVerifyCode}>
              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label>Code de vérification</label>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '20px' }}
                />
              </div>

              <button type="submit" className={`btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
                Vérifier le code
              </button>
            </form>
          </>
        )}

        {step === 'password' && (
          <>
            <h1 className="auth-title">Nouveau mot de passe</h1>
            <p className="auth-subtitle">Choisissez un mot de passe sécurisé</p>

            <form className="auth-form" onSubmit={handleResetPassword}>
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
              </div>

              <button type="submit" className={`btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
                Réinitialiser
              </button>
            </form>
          </>
        )}

        <p className="auth-footer">
          <Link to="/login">← Retour à la connexion</Link>
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