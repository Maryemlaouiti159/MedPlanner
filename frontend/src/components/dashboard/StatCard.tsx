interface StatCardProps {
  icon: string;
  iconBg: string;
  value: string | number;
  label: string;
  sub: string;
  subColor: string;
}

export default function StatCard({ icon, iconBg, value, label, sub, subColor }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
        <span className="stat-arrow">›</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-sub" style={{ color: subColor }}>{sub}</div>
    </div>
  );
}