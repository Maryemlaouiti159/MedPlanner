import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import type { RegisterData, ApiErrorResponse } from '../types';
import anypliLogo from '../assets/anypli-logo.png';
import medplannerIcon from '../assets/medplanner-icon.svg';

export default function Register() {
  const { register } = useAuth();

  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        if (err.response?.status === 422) {
          setErrors(err.response.data.errors || {});
        } else {
          setGeneralError(err.response?.data?.message || 'Une erreur est survenue.');
        }
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

        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-subtitle">Rejoignez MedPlanner en quelques secondes</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {generalError && <div className="alert alert-error">{generalError}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="first_name"
                placeholder="Maryem"
                value={formData.first_name}
                onChange={handleChange}
                className={errors.first_name ? 'input-error' : ''}
              />
              {errors.first_name && <span className="field-error">{errors.first_name[0]}</span>}
            </div>

            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="last_name"
                placeholder="Ben Ali"
                value={formData.last_name}
                onChange={handleChange}
                className={errors.last_name ? 'input-error' : ''}
              />
              {errors.last_name && <span className="field-error">{errors.last_name[0]}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="vous@exemple.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email[0]}</span>}
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="text"
              name="phone"
              placeholder="12345678"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <span className="field-error">{errors.password[0]}</span>}
            </div>

            <div className="form-group">
              <label>Confirmer</label>
              <input
                type="password"
                name="password_confirmation"
                placeholder="••••••••"
                value={formData.password_confirmation}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`btn-primary ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            S'inscrire
          </button>
        </form>

        <p className="auth-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
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