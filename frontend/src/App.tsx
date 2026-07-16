import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import UsersList from './pages/admin/UsersList';
import DoctorsList from './pages/admin/DoctorsList';
import SpecialtiesList from './pages/admin/SpecialtiesList';
import SecretariesList from './pages/admin/SecretariesList';
import Settings from './pages/Settings';
import UserProfile from './pages/admin/UserProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  return <Dashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
           <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={<ProtectedRoute allowedRoles={['admin']}><UsersList /></ProtectedRoute>}
          />
          <Route
            path="/admin/doctors"
            element={<ProtectedRoute allowedRoles={['admin']}><DoctorsList /></ProtectedRoute>}
          />
          <Route
  path="/admin/specialties"
  element={<ProtectedRoute allowedRoles={['admin']}><SpecialtiesList /></ProtectedRoute>}
/>
<Route
  path="/admin/users/:id"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <UserProfile />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/secretaries"
  element={<ProtectedRoute allowedRoles={['admin']}><SecretariesList /></ProtectedRoute>}
/>
<Route
  path="/settings"
  element={<ProtectedRoute><Settings /></ProtectedRoute>}
/>
        </Routes>
        
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;