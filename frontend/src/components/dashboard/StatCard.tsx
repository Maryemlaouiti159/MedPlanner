interface StatCardProps {
  icon: string;
  iconBg: string;
  value: string | number;
  label: string;
}

export default function StatCard({ icon, iconBg, value, label }: StatCardProps) {
  return (
    <div className="bg-white rounded-[1.75rem] border border-slate-100 p-5 shadow-[0_2px_16px_rgba(15,23,42,0.04)] transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <span className="text-slate-300 text-sm">›</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-0.5 tracking-tight">{value}</div>
      <div className="text-xs text-slate-400 mb-1.5">{label}</div>
    </div>
  );
}
