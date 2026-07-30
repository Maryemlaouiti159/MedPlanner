import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { patientAppointmentsApi } from '../../api/patientAppointments';

export default function VideoConsultation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appointmentId = Number(id);

  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!appointmentId) return;

    patientAppointmentsApi.videoRoom(appointmentId)
      .then((res) => {
        setRoomUrl(res.data.room_url);
      })
      .catch((err: any) => {
        setError(err.response?.data?.message ?? "Impossible d'accéder à la téléconsultation.");
      })
      .finally(() => setLoading(false));
  }, [appointmentId]);

  if (loading) {
    return <DashboardLayout><div className="empty-state">Chargement...</div></DashboardLayout>;
  }

  if (error || !roomUrl) {
    return (
      <DashboardLayout>
        <button className="profile-back" onClick={() => navigate('/appointments')} style={{ marginBottom: '16px' }}>←</button>
        <div className="alert alert-error">{error || 'Salle de téléconsultation introuvable.'}</div>
      </DashboardLayout>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', background: '#1a1a1a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Téléconsultation en cours</span>
        <button onClick={() => navigate('/appointments')} style={{ color: '#fff', background: 'transparent', border: '1px solid #fff', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer' }}>
          Quitter
        </button>
      </div>
      <iframe
        src={roomUrl}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        style={{ flex: 1, border: 'none' }}
        title="Téléconsultation"
      />
    </div>
  );
}