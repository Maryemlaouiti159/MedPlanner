import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS } from '../../config/navigation';
import medplannerIcon from '../../assets/medplanner-icon.svg';

type SidebarProps = {
  isOpen: boolean;
};

export default function Sidebar({ isOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const items = NAV_ITEMS[user.role];
  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();

  return (
<aside className={`app-sidebar ${isOpen ? '' : 'collapsed'}`}>     
     <div className="app-sidebar-brand">
  <img src={medplannerIcon} alt="MedPlanner" />
  {isOpen && <span>MedPlanner</span>}
</div>

      <nav className="app-sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}
          >
           <span className="app-sidebar-icon">{item.icon}</span>
{isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="app-sidebar-user">
        <div className="app-sidebar-avatar">{initials}</div>
      {isOpen && (
  <div className="app-sidebar-user-info">
    <p>{user.first_name} {user.last_name}</p>
    <span>{roleLabel(user.role)}</span>
  </div>
)}

{isOpen && (
  <button
    className="app-sidebar-logout"
    onClick={logout}
    title="Se déconnecter"
  >
    ↪
  </button>
)}
      </div>
    </aside>
  );
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    admin: 'Admin',
    doctor: 'Médecin',
    secretary: 'Secrétaire',
    patient: 'Patient',
  };
  return labels[role] || role;
}