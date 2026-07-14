import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

type TopbarProps = {
  toggleSidebar: () => void;
};

export default function Topbar({ toggleSidebar }: TopbarProps) {
      const { user } = useAuth();
  const [search, setSearch] = useState('');
  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : '';

  return (
   <header className="app-topbar">
  <button
    className="app-topbar-menu"
    onClick={toggleSidebar}
  >
    ☰
  </button>

  <div className="app-topbar-search">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Rechercher un médecin, spécialité..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="app-topbar-actions">
        <button className="app-topbar-bell">
          🔔
          <span className="app-topbar-dot" />
        </button>
        <div className="app-topbar-avatar">{initials}</div>
      </div>
    </header>
  );
}