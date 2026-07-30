import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminDashboardApi } from '../../api/adminDashboard';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import StatCard from '../../components/dashboard/StatCard';

const PIE_COLORS = ['#3b82f6', '#14b8a6', '#10b981', '#a78bfa', '#f59e0b', '#ec4899', '#0ea5e9', '#84cc16'];

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  pending: 'En attente',
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-rose-50 text-rose-500',
  pending: 'bg-amber-50 text-amber-600',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDashboardApi.stats()
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="empty-state text-sm">Chargement des statistiques...</div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="empty-state text-sm">Impossible de charger les statistiques.</div>
      </DashboardLayout>
    );
  }

 

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 mx-auto px-8 py-6">

<section className="patient-welcome-banner">
        <div className="patient-welcome-left">
         <div>
          <p className="text-xs text-slate-400 mb-1 capitalize tracking-wide">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        <p className="patient-welcome-title">
  Bonjour, {user?.first_name || 'Admin'}
</p>
          <p className="text-sm text-slate-400">
            Voici le résumé de l'activité de votre plateforme aujourd'hui.
          </p>
        </div>
        </div>

        <div className="patient-welcome-card">
        
 <img
          src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=280&h=180&fit=crop&auto=format"
          alt="Medical"
          className="hidden lg:block w-48 h-32 object-cover rounded-2xl opacity-80"
        />          
        </div>
      </section>
        {/* Header */}
        

        {/* Stats */}
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <StatCard
            icon="👥"
            iconBg="linear-gradient(135deg, #dbeafe, #eff6ff)"
            value={data.stats.total_users}
            label="Utilisateurs total"
          />
          <StatCard
            icon="📅"
            iconBg="linear-gradient(135deg, #ccfbf1, #f0fdfa)"
            value={data.stats.total_appointments}
            label="Rendez-vous"
          />
          <StatCard
            icon="🩺"
            iconBg="linear-gradient(135deg, #ede9fe, #f5f3ff)"
            value={data.stats.active_doctors}
            label="Médecins actifs"
          />
          <StatCard
            icon="📈"
            iconBg="linear-gradient(135deg, #fef3c7, #fffbeb)"
            value={`${data.stats.confirmation_rate}%`}
            label="Taux confirmation"
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
          {/* Area chart */}
          <div className="bg-white rounded-[1.75rem] border border-slate-100 p-6 shadow-[0_2px_16px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Évolution des rendez-vous</h3>
<p className="text-[11px] text-slate-400 mt-0.5">
  {data.monthly_appointments[0]?.name} – {data.monthly_appointments[data.monthly_appointments.length - 1]?.name} {new Date().getFullYear()}
</p>              </div>
              <span className="text-[11px] bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-500 font-medium">
                {data.monthly_appointments.length} mois
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
  <AreaChart data={data.monthly_appointments}>
    <defs>
      <linearGradient id="confirmed" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
<YAxis
  tick={{ fontSize: 11, fill: '#94a3b8' }}
  axisLine={false}
  tickLine={false}
  allowDecimals={false}
  domain={[0, 1]}
  ticks={[0, 1]}
/> <Tooltip
      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px #0001', fontSize: 12 }}
    />
    <Area
      type="monotone"
      dataKey="confirmed"
      stroke="#3b82f6"
      strokeWidth={2}
      fill="url(#confirmed)"
      name="Confirmés"
    />
    <Area
      type="monotone"
      dataKey="pending"
      stroke="#f59e0b"
      strokeWidth={1.5}
      fill="none"
      strokeDasharray="4 2"
      name="En attente"
    />
    <Area
      type="monotone"
      dataKey="cancelled"
      stroke="#fb7185"
      strokeWidth={1.5}
      fill="none"
      strokeDasharray="4 2"
      name="Annulés"
    />
  </AreaChart>
</ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-[1.75rem] border border-slate-100 p-6 shadow-[0_2px_16px_rgba(15,23,42,0.04)]">
            <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Par spécialité</h3>
            <p className="text-[11px] text-slate-400 mb-3">Répartition des médecins</p>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={data.specialty_distribution}
                  dataKey="percentage"
                  cx="50%"
                  cy="50%"
                  outerRadius={62}
                  innerRadius={36}
                  paddingAngle={3}
                  cornerRadius={4}
                >
                  {data.specialty_distribution.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
<Tooltip
  content={({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "#fff",
            padding: "8px 12px",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            fontSize: "12px",
          }}
        >
          {payload[0].value}%
        </div>
      );
    }
    return null;
  }}
/>              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1 mt-2 overflow-y-auto pr-1">
              {data.specialty_distribution.map((entry: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-slate-500">{entry.name}</span>
                  </div>
                  <span className="font-semibold text-slate-700">{entry.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 2fr' }}>
          {/* Bar chart */}
          <div className="bg-white rounded-[1.75rem] border border-slate-100 p-6 shadow-[0_2px_16px_rgba(15,23,42,0.04)]">
            <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Cette semaine</h3>
            <p className="text-[11px] text-slate-400 mb-3">Rendez-vous par jour</p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={data.weekly_appointments} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
<YAxis
  tick={{ fontSize: 11, fill: '#94a3b8' }}
  axisLine={false}
  tickLine={false}
  allowDecimals={false}
  domain={[0, 1]}
  ticks={[0, 1]}
/>                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="appointments" fill="#3b82f6" radius={[6, 6, 0, 0]} name="RDV" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent appointments */}
          <div className="bg-white rounded-[1.75rem] border border-slate-100 p-6 shadow-[0_2px_16px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Rendez-vous récents</h3>
              <button
                onClick={() => navigate('/admin/appointments')}
                className="text-[11px] text-blue-600 font-medium hover:underline"
              >
                Voir tout
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {data.recent_appointments.slice(0, 4).map((appt: any) => (
                <div key={appt.id} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
                  <div className="w-7 h-7 rounded-full  from-slate-100 to-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                    {appt.patient_initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{appt.patient_name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{appt.doctor_name} · {appt.specialty}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[appt.status]}`}>
                    {STATUS_LABELS[appt.status] ?? appt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
