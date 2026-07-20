import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { patientDoctorsApi } from '../../api/patientDoctors';
import { specialtiesApi } from '../../api/specialties';
import type { Doctor, Specialty } from '../../types';

export default function DoctorsList() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [activeSpecialty, setActiveSpecialty] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDoctors = useCallback((specialtyId?: number) => {
    setLoading(true);
    patientDoctorsApi.list(specialtyId)
      .then((res) => setDoctors(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDoctors();
    specialtiesApi.list().then((res) => setSpecialties(res.data));
  }, [fetchDoctors]);

  const handlePillClick = (id: number | null) => {
    setActiveSpecialty(id);
    fetchDoctors(id ?? undefined);
  };

  const filteredDoctors = useMemo(() => {
    if (!search.trim()) return doctors;
    const q = search.toLowerCase();
    return doctors.filter((d) =>
      `${d.user.first_name} ${d.user.last_name}`.toLowerCase().includes(q) ||
      d.specialty.name.toLowerCase().includes(q)
    );
  }, [doctors, search]);

  const initials = (d: Doctor) => `${d.user.first_name[0]}${d.user.last_name[0]}`.toUpperCase();

  return (
    <DashboardLayout>
      <div className="find-doctor-header">
        <div className="find-doctor-eyebrow">Recherche</div>
        <h1 className="find-doctor-title">Trouver un médecin</h1>
        <p className="find-doctor-count">{filteredDoctors.length} médecin{filteredDoctors.length > 1 ? 's' : ''} disponible{filteredDoctors.length > 1 ? 's' : ''}</p>
      </div>

      <div className="find-filters-card">
        <div className="find-filters-row">
          <div className="find-search-input">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Nom du médecin ou spécialité..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="find-specialty-pills">
          <button
            className={`find-specialty-pill ${activeSpecialty === null ? 'active' : ''}`}
            onClick={() => handlePillClick(null)}
          >
            Toutes
          </button>
          {specialties.map((s) => (
            <button
              key={s.id}
              className={`find-specialty-pill ${activeSpecialty === s.id ? 'active' : ''}`}
              onClick={() => handlePillClick(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Chargement...</div>
      ) : filteredDoctors.length === 0 ? (
        <div className="empty-state">Aucun médecin trouvé.</div>
      ) : (
        <div className="find-doctors-grid">
          {filteredDoctors.map((d) => (
            <div className="find-doctor-card" key={d.id}>
              <div className="find-doctor-top">
                <div className="find-doctor-avatar">{initials(d)}</div>
                <div>
                  <p className="find-doctor-name">Dr. {d.user.first_name} {d.user.last_name}</p>
                  <div className="find-doctor-specialty">{d.specialty.name}</div>
                  {d.city && <div className="find-doctor-place">📍 {d.address ? `${d.address}, ` : ''}{d.city}</div>}
                </div>
              </div>

              <div className="find-doctor-price-row">
                <div>
                  <div className="find-doctor-dispo-label">Consultation</div>
                  <div className="find-doctor-dispo-value">⏱ {d.consultation_duration} min</div>
                </div>
                <div>
                  <div className="find-doctor-price-label">Tarif</div>
                  <div className="find-doctor-price-value">{d.consultation_price ? `${d.consultation_price} DT` : '—'}</div>
                </div>
              </div>

              <button className="find-doctor-btn" onClick={() => navigate(`/doctors/${d.id}`)}>
                Prendre rendez-vous
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}