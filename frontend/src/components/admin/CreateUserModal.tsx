import { useState } from 'react';
import { adminUsersApi } from '../../api/adminUsers';
import type { CreateUserData } from '../../types';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateUserModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState<CreateUserData>({
    first_name: '',
    last_name: '',
    email: '', 
    phone: '',
    password: '',
    role: 'patient',
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await adminUsersApi.create(form);
      onCreated();
      onClose();
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? { general: [err.response?.data?.message ?? 'Erreur inconnue'] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
<h2 className="modal-title">Nouveau patient</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <input
              className="form-input"
              placeholder="Prénom"
              required
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
            <input
              className="form-input"
              placeholder="Nom"
              required
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </div>

          <input
            className="form-input"
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && <span className="form-error">{errors.email[0]}</span>}

          <input
            className="form-input"
            placeholder="Téléphone (optionnel)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            className="form-input"
            type="password"
            placeholder="Mot de passe"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {errors.password && <span className="form-error">{errors.password[0]}</span>}

    
          <p className="form-hint">
            Pour créer un médecin (avec sa secrétaire), utilisez la page "Médecins".
          </p>

          {errors.general && <span className="form-error">{errors.general[0]}</span>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}