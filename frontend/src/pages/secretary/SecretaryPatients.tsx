import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { secretaryPatientsApi, type SecretaryPatient } from '../../api/secretaryPatients';

const AVATAR_COLORS = ['#0f9b8e', '#4f46e5', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

function avatarColor(name: string) {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function SecretaryPatients() {
  const [patients, setPatients] = useState<SecretaryPatient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
const [selectedPatient, setSelectedPatient] = useState<SecretaryPatient | null>(null);
  useEffect(() => {
    secretaryPatientsApi.listMine()
      .then((res) => setPatients(res.data))
      .catch(() => alert('Impossible de charger la liste des patients.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter((p) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-h)' }}>
          Patients
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0 }}>
          Liste des patients du médecin
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '8px 12px',
          background: 'var(--bg-secondary)',
          maxWidth: '360px',
          marginBottom: '20px',
        }}
      >
        <span>🔍</span>
        <input
          placeholder="Rechercher un patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', flex: 1, marginLeft: 10, background: 'transparent', color: 'var(--text)' }}
        />
      </div>

      {loading ? (
        <div className="empty-state">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          Aucun patient trouvé.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((p) => {
            const fullName = `${p.first_name} ${p.last_name}`;
            return (
             <div
  key={p.id}
  onClick={() => setSelectedPatient(p)}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '16px 20px',
    flexWrap: 'wrap',
    cursor: 'pointer',
  }}
>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: avatarColor(fullName),
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '15px',
                    flexShrink: 0,
                  }}
                >
                  {p.first_name[0]}{p.last_name[0]}
                </div>

                <div style={{ flex: 1, minWidth: '180px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-h)' }}>{fullName}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.email}</div>
                  {p.phone && (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{p.phone}</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-h)' }}>{p.total_consultations}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Consultations</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-h)' }}>{formatDate(p.last_visit)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Dernière visite</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-h)' }}>{formatDate(p.next_visit)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Prochain RDV</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {selectedPatient && (
  <div
    className="modal-overlay"
    onClick={() => setSelectedPatient(null)}
  >
    <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: avatarColor(`${selectedPatient.first_name} ${selectedPatient.last_name}`),
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '18px',
            flexShrink: 0,
          }}
        >
          {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px' }}>
            {selectedPatient.first_name} {selectedPatient.last_name}
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            {selectedPatient.email}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Téléphone</span>
          <p style={{ margin: '2px 0 0 0', fontWeight: 600 }}>{selectedPatient.phone || '—'}</p>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Consultations</span>
          <p style={{ margin: '2px 0 0 0', fontWeight: 600 }}>{selectedPatient.total_consultations}</p>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dernière visite</span>
          <p style={{ margin: '2px 0 0 0', fontWeight: 600 }}>{formatDate(selectedPatient.last_visit)}</p>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prochain RDV</span>
          <p style={{ margin: '2px 0 0 0', fontWeight: 600 }}>{formatDate(selectedPatient.next_visit)}</p>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Antécédents</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
            {selectedPatient.conditions.length > 0 ? (
              selectedPatient.conditions.map((c, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'rgba(107, 90, 205, 0.12)',
                    color: '#6b5acd',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  {c}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aucun</span>
            )}
          </div>
        </div>
      </div>

      <div className="modal-actions">
        <button className="cancel-btn" onClick={() => setSelectedPatient(null)}>
          Fermer
        </button>
      </div>
    </div>
  </div>
)}
    </DashboardLayout>
  );
}
