import { adminDoctorsApi } from '../../api/adminDoctors.ts';
import { useEffect, useState } from 'react';
import { specialtiesApi } from '../../api/specialties';
import type { CreateDoctorData, Specialty } from '../../types';
interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const emptyForm: CreateDoctorData = {
  first_name: '', last_name: '', email: '', phone: '',
  specialty_id: 0, bio: '', address: '', city: '',
  consultation_duration: 30, consultation_price: undefined,
  secretary_first_name: '', secretary_last_name: '', secretary_email: '', secretary_phone: '',
};

export default function CreateDoctorModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState<CreateDoctorData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
const [specialties, setSpecialties] = useState<Specialty[]>([]);
useEffect(() => {
  specialtiesApi.list().then((res) => setSpecialties(res.data)).catch(console.error);
}, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await adminDoctorsApi.create(form);
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
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Nouveau médecin</h2>
        <p className="form-hint">
          Un compte secrétaire sera automatiquement créé et lié à ce médecin.
          Les identifiants seront envoyés par email aux deux comptes.
        </p>

        <form onSubmit={handleSubmit} className="modal-form">
          <h3 className="form-section-title">Informations du médecin</h3>
          <div className="form-row">
            <input className="form-input" placeholder="Prénom" required
              value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <input className="form-input" placeholder="Nom" required
              value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
          <input className="form-input" type="email" placeholder="Email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <span className="form-error">{errors.email[0]}</span>}

          <input className="form-input" placeholder="Téléphone" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />

         <select
  className="form-input"
  required
  value={form.specialty_id || ''}
  onChange={(e) => setForm({ ...form, specialty_id: Number(e.target.value) })}
>
  <option value="" disabled>Sélectionner une spécialité</option>
  {specialties.map((s) => (
    <option key={s.id} value={s.id}>{s.name}</option>
  ))}
</select>
{errors.specialty_id && <span className="form-error">{errors.specialty_id[0]}</span>}

          <textarea className="form-input" placeholder="Bio" value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })} />

          <div className="form-row">
            <input className="form-input" placeholder="Adresse" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <input className="form-input" placeholder="Ville" value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>

          <div className="form-row">
            <input className="form-input" type="number" min={10} placeholder="Durée consultation (min)"
              value={form.consultation_duration}
              onChange={(e) => setForm({ ...form, consultation_duration: Number(e.target.value) })} />
            <input className="form-input" type="number" min={0} step="0.01" placeholder="Prix consultation"
              value={form.consultation_price ?? ''}
              onChange={(e) => setForm({ ...form, consultation_price: e.target.value ? Number(e.target.value) : undefined })} />
          </div>

          <h3 className="form-section-title">Informations de la secrétaire</h3>
          <div className="form-row">
            <input className="form-input" placeholder="Prénom secrétaire" required
              value={form.secretary_first_name}
              onChange={(e) => setForm({ ...form, secretary_first_name: e.target.value })} />
            <input className="form-input" placeholder="Nom secrétaire" required
              value={form.secretary_last_name}
              onChange={(e) => setForm({ ...form, secretary_last_name: e.target.value })} />
          </div>
          <input className="form-input" type="email" placeholder="Email secrétaire" required
            value={form.secretary_email}
            onChange={(e) => setForm({ ...form, secretary_email: e.target.value })} />
          {errors.secretary_email && <span className="form-error">{errors.secretary_email[0]}</span>}

          <input className="form-input" placeholder="Téléphone secrétaire" value={form.secretary_phone}
            onChange={(e) => setForm({ ...form, secretary_phone: e.target.value })} />

          {errors.general && <span className="form-error">{errors.general[0]}</span>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Création...' : 'Créer le médecin + secrétaire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}