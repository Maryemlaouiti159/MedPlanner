import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { doctorDashboardApi, type DoctorPatient } from '../../api/doctorDashboard';

const initials = (first: string, last: string) => `${first[0]}${last[0]}`.toUpperCase();

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export default function DoctorPatients() {
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPatients = async () => {
    try {
      const res = await doctorDashboardApi.getPatients();
      setPatients(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            color: 'var(--text-muted)', 
            fontSize: '13px', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            Suivi
          </div>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 700, 
            margin: '0 0 8px 0',
            color: 'var(--text-h)'
          }}>
            Mes patients
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: 'var(--text-muted)',
            margin: 0
          }}>
            {patients.length} patients suivis
          </p>
        </div>

        <div style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border)', 
          borderRadius: '20px', 
          overflow: 'hidden'
        }}>
          <div style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '14px 18px'
            }}>
              <span style={{ fontSize: '20px' }}>🔍</span>
              <input 
                type="text"
                placeholder="Rechercher un patient..."
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '16px',
                  outline: 'none',
                  color: 'var(--text)'
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 0.8fr 1fr 1fr 1.5fr 1fr',
            padding: '16px 24px',
            background: 'rgba(107, 90, 205, 0.05)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            fontSize: '13px',
            color: 'var(--text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.3px'
          }}>
            <div>Patient</div>
            <div>Âge</div>
            <div>Dernière visite</div>
            <div>Prochaine visite</div>
            <div>Antécédents</div>
            <div></div>
          </div>

          {loading ? (
            <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Chargement des patients...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Aucun patient trouvé
            </div>
          ) : (
            filteredPatients.map(patient => (
              <div 
                key={patient.id} 
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 0.8fr 1fr 1fr 1.5fr 1fr',
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6b5acd, #0e9f8e)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '16px'
                  }}>
                    {initials(patient.first_name, patient.last_name)}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '4px' }}>
                      {patient.first_name} {patient.last_name}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {patient.total_consultations} consultation{patient.total_consultations > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div style={{ color: 'var(--text)', fontSize: '14px' }}>
                  34 ans {/* TODO: Add real age from backend */}
                </div>

                <div style={{ color: 'var(--text)', fontSize: '14px' }}>
                  {formatDate(patient.last_visit)}
                </div>

                <div style={{ 
                  color: '#0e9f8e', 
                  fontSize: '14px',
                  fontWeight: 600,
                  background: 'rgba(14, 159, 142, 0.12)',
                  display: 'inline-block',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  justifySelf: 'start'
                }}>
                  {formatDate(patient.next_visit)}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {patient.conditions.map((condition, idx) => (
                    <span 
                      key={idx}
                      style={{
                        background: 'rgba(107, 90, 205, 0.12)',
                        color: '#6b5acd',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    >
                      {condition}
                    </span>
                  ))}
                  {patient.conditions.length === 0 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      Aucun
                    </span>
                  )}
                </div>

                <div style={{ justifySelf: 'end' }}>
                  <button style={{
                    padding: '8px 20px',
                    border: '1px solid #6b5acd',
                    borderRadius: '10px',
                    background: 'transparent',
                    color: '#6b5acd',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    Dossier
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
