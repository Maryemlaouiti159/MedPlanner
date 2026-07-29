import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminUsersApi } from '../../api/adminUsers';
import { patientDoctorsApi } from '../../api/patientDoctors';
import { fetchNotifications } from '../../api/notifications';
import type { User, AppNotification, Doctor } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { doctorPatientsApi } from '../../api/doctorPatients';
import type { DoctorPatient } from '../../api/doctorDashboard';
type TopbarProps = {
  toggleSidebar: () => void;
};

const SEARCH_PLACEHOLDER: Record<string, string> = {
  admin: 'Rechercher un utilisateur par nom ou email...',
  doctor: 'Rechercher un patient...',
  secretary: 'Rechercher un patient ou un rendez-vous...',
  patient: 'Rechercher un médecin, spécialité...',
};

const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient', doctor: 'Médecin', secretary: 'Secrétaire', admin: 'Administrateur',
};



export default function Topbar({ toggleSidebar }: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [doctorResults, setDoctorResults] = useState<Doctor[]>([]);
  const [patientResults, setPatientResults] = useState<DoctorPatient[]>([]);
  const [showResults, setShowResults] = useState(false);

  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : '';
  const role = user?.role ?? 'patient';

 const runSearch = useCallback((query: string) => {
 if (query.trim().length < 2) {
  setResults([]);
  setDoctorResults([]);
  setPatientResults([]);
  return;
}

  if (role === 'admin') {
    adminUsersApi.list({ search: query, page: 1 })
      .then((res) => setResults(res.data.data.slice(0, 6)))
      .catch(() => setResults([]));
  } else if (role === 'patient') {
    patientDoctorsApi.list()
      .then((res) => {
        const q = query.trim().toLowerCase();
        const filtered = res.data.filter((d) =>
          `${d.user.first_name} ${d.user.last_name}`.toLowerCase().includes(q) ||
          d.specialty.name.toLowerCase().includes(q)
        );
        setDoctorResults(filtered.slice(0, 6));
      })
      .catch(() => setDoctorResults([]));
  }
  else if (role === 'doctor') {
  doctorPatientsApi.list()
    .then((res) => {
      const q = query.trim().toLowerCase();

      const filtered = res.data.filter((p) =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
        (p.email ?? '').toLowerCase().includes(q) ||
        (p.phone ?? '').toLowerCase().includes(q)
      );

      setPatientResults(filtered.slice(0, 6));
    })
    .catch(() => setPatientResults([]));
}
}, [role]);

  useEffect(() => {
    const timeout = setTimeout(() => runSearch(search), 350);
    return () => clearTimeout(timeout);
  }, [search, runSearch]);

  // Charge les notifications au montage ET vérifie combien sont nouvelles depuis la dernière lecture
  const loadNotifications = useCallback(() => {
    if (!user) return;

    fetchNotifications().then((data) => {
      setNotifs(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    loadNotifications();
    // Rafraîchit périodiquement pour détecter une nouvelle notification (toutes les 60s)
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleOpenNotifs = () => {
    const next = !showNotifs;
    setShowNotifs(next);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setShowAvatarMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

const handleSelectResult = (u: User) => {
  setShowResults(false);
  setSearch('');
  navigate(`/admin/users/${u.id}`);
};

const handleSelectDoctor = (d: Doctor) => {
  setShowResults(false);
  setSearch('');
  navigate(`/doctors/${d.id}`);
};
 const handleSelectPatient = (patient: DoctorPatient) => {
  setShowResults(false);
  setSearch('');

  navigate('/patients', {
    state: {
      selectedPatientId: patient.id,
    },
  });
};

  if (!user) return null;
const confirmLogout = async () => {
  setShowLogoutModal(false);
  await logout();
  navigate('/login');
};
  return (
    <header className="app-topbar">
      <button className="app-topbar-menu" onClick={toggleSidebar}>☰</button>

      <div className="topbar-search-wrapper" ref={searchRef}>
        <div className="app-topbar-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder={SEARCH_PLACEHOLDER[role] || 'Rechercher...'}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
          />
        </div>

        {showResults && role === 'admin' && search.trim().length >= 2 && (
          <div className="search-dropdown">
            {results.length === 0 ? (
              <div className="search-empty">Aucun résultat pour "{search}"</div>
            ) : (
              results.map((u) => (
                <div key={u.id} className="search-result-item" onClick={() => handleSelectResult(u)}>
                  <div className="search-result-avatar">{u.first_name[0]}{u.last_name[0]}</div>
                  <div className="search-result-info">
                    <p>{u.first_name} {u.last_name}</p>
                    <span>{ROLE_LABELS[u.role]} · {u.email}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showResults && role === 'patient' && search.trim().length >= 2 && (
          <div className="search-dropdown">
            {doctorResults.length === 0 ? (
              <div className="search-empty">Aucun résultat pour "{search}"</div>
            ) : (
              doctorResults.map((d) => (
                <div key={d.id} className="search-result-item" onClick={() => handleSelectDoctor(d)}>
                  <div className="search-result-avatar">
                    {d.user.first_name[0]}{d.user.last_name[0]}
                  </div>
                  <div className="search-result-info">
                    <p>Dr. {d.user.first_name} {d.user.last_name}</p>
                    <span>{d.specialty.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
{showResults && role === 'doctor' && search.trim().length >= 2 && (
  <div className="search-dropdown">
    {patientResults.length === 0 ? (
      <div className="search-empty">
        Aucun patient pour "{search}"
      </div>
    ) : (
      patientResults.map((patient) => (
        <div
          key={patient.id}
          className="search-result-item"
          onClick={() => handleSelectPatient(patient)}
        >
          <div className="search-result-avatar">
            {patient.first_name[0]}
            {patient.last_name[0]}
          </div>

          <div className="search-result-info">
            <p>
              {patient.first_name} {patient.last_name}
            </p>
            <span>
              {patient.phone || patient.email || 'Patient'}
            </span>
          </div>
        </div>
      ))
    )}
  </div>
)}

      </div>

      <div className="app-topbar-actions">
        <div className="notif-wrapper" ref={notifRef}>
          <button className="app-topbar-bell" onClick={handleOpenNotifs}>
            🔔
            {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
          </button>

          {showNotifs && (
  <div className="notif-dropdown">
    <div className="notif-header">Notifications</div>
    {notifs.length === 0 ? (
      <div className="search-empty">Aucune notification.</div>
    ) : (
      notifs.slice(0, 3).map((n) => (
        <div key={n.id} className="notif-item">
          <div className="search-result-avatar" style={{ background: n.iconBg, color: 'var(--text-h)' }}>
            {n.icon}
          </div>
          <div>
            <p>{n.title}</p>
            <span>{n.subtitle} · {n.time}</span>
          </div>
        </div>
      ))
    )}
    <button
      className="notif-see-all"
      onClick={() => { setShowNotifs(false); navigate('/settings?tab=notifications'); }}
    >
      Voir toutes les notifications
    </button>
  </div>
)}
        </div>

        <div className="avatar-wrapper" ref={avatarRef}>
          <div className="app-topbar-avatar" onClick={() => setShowAvatarMenu(!showAvatarMenu)}>
            {initials}
          </div>

          {showAvatarMenu && (
            <div className="avatar-dropdown">
            <div
  className="avatar-dropdown-header"
  onClick={() => {
    setShowAvatarMenu(false);

    if (user.role === 'admin') {
      navigate(`/admin/users/${user.id}`);
    } else {
      navigate('/profile');
    }
  }}
>
                <div className="search-result-avatar">{initials}</div>
                <div>
                  <p>{user.first_name} {user.last_name}</p>
                  <span>{ROLE_LABELS[role]}</span>
                </div>
              </div>

             
              <button className="avatar-dropdown-item" onClick={() => { setShowAvatarMenu(false); navigate('/settings'); }}>
                ⚙️ Paramètres
              </button>

              <div className="avatar-dropdown-divider" />

              <div className="avatar-dropdown-section">Thème</div>
              <div className="theme-options">
                <button className={`theme-option ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
                  ☀️ Clair
                </button>
                <button className={`theme-option ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
                  🌙 Sombre
                </button>
                <button className={`theme-option ${theme === 'system' ? 'active' : ''}`} onClick={() => setTheme('system')}>
                  💻 Système
                </button>
              </div>

              <div className="avatar-dropdown-divider" />

              
 <button
  className="avatar-dropdown-item danger"
  onClick={() => {
    setShowLogoutModal(true);
    setShowAvatarMenu(false);
  }}
>
  ↪ Déconnexion
</button>
             
            </div>
          )}
        </div>
      </div>
      {showLogoutModal && (
  <div className="modal-overlay">

    <div className="delete-modal">

      <h3>Confirmation</h3>

      <p>
        Voulez-vous vraiment vous déconnecter ?
      </p>

      <div className="modal-actions">

        <button
          className="cancel-btn"
          onClick={() => setShowLogoutModal(false)}
        >
          Annuler
        </button>


        <button
          className="confirm-btn"
          onClick={confirmLogout}
        >
          Déconnexion
        </button>

      </div>

    </div>

  </div>
)}
    </header>
  );
}
