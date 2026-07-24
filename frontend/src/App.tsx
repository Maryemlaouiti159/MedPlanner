import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';

import Login from './pages/Login';

import Register from './pages/Register';
import Availabilities from './pages/doctor/Availabilities';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import PatientDoctorsList from './pages/patient/DoctorsList';
import DoctorDetail from './pages/patient/DoctorDetail';
import MyAppointments from './pages/patient/MyAppointments';
import UsersList from './pages/admin/UsersList';
import DoctorsList from './pages/admin/DoctorsList';
import SpecialtiesList from './pages/admin/SpecialtiesList';
import SecretariesList from './pages/admin/SecretariesList';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import UserProfile from './pages/admin/UserProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatients from './pages/doctor/Patients';
import AdminAppointmentsList from './pages/admin/AdminAppointmentsList';
import SecretaryDashboard from './pages/secretary/SecretaryDashboard';
import SecretaryAppointments 
from './pages/secretary/SecretaryAppointments';
function DashboardRouter() {
    const { user } = useAuth();

    if (user?.role === 'admin')
        return <AdminDashboard />;

    if (user?.role === 'doctor')
        return <DoctorDashboard />;

    if (user?.role === 'secretary')
        return <SecretaryDashboard />;

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
  path="/availabilities"
  element={
    <ProtectedRoute allowedRoles={['doctor']}>
      <Availabilities />
    </ProtectedRoute>
  }
/>
<Route
  path="/patients"
  element={
    <ProtectedRoute allowedRoles={['doctor']}>
      <DoctorPatients />
    </ProtectedRoute>
  }
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
  path="/admin/appointments"
  element={<ProtectedRoute allowedRoles={['admin']}><AdminAppointmentsList /></ProtectedRoute>}
/>
<Route
  path="/doctors"
  element={<ProtectedRoute allowedRoles={['patient']}><PatientDoctorsList /></ProtectedRoute>}
/>
<Route
  path="/doctors/:id"
  element={<ProtectedRoute allowedRoles={['patient']}><DoctorDetail /></ProtectedRoute>}
/>
<Route
  path="/appointments"
  element={<ProtectedRoute allowedRoles={['patient']}><MyAppointments /></ProtectedRoute>}
/>
<Route
  path="/settings"
  element={<ProtectedRoute><Settings /></ProtectedRoute>}
/>

<Route
 path="/secretary/appointments"
 element={
  <ProtectedRoute allowedRoles={['secretary']}>
    <SecretaryAppointments/>
  </ProtectedRoute>
 }
/>
<Route
  path="/notifications"
  element={<ProtectedRoute><Notifications /></ProtectedRoute>}
/>
        </Routes>
        
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;