import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthProvider';
import { useThemeStore } from './store/theme';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Register } from './pages/Register';
import { Alerts } from './pages/Alerts';
import { Chat } from './pages/Chat';
import { EmergencyContacts } from './pages/EmergencyContacts';
import { ReportDisaster } from './pages/ReportDisaster';
import { Resources } from './pages/Resources';
import { Settings } from './pages/Settings';
import { Volunteers } from './pages/Volunteers';
import { Layout } from './components/Layout';
import { Toaster } from 'react-hot-toast';
import { Profile } from './pages/Profile';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to login page with the attempted location stored
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth();
  const { isDarkMode } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Update document class when theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Listen for auth state changes and redirect if needed
  useEffect(() => {
    // If user is not logged in and trying to access a protected route
    if (!user && !['/', '/login', '/register'].includes(location.pathname)) {
      navigate('/login', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Toaster position='top-right'/>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/alerts" element={<Alerts/>}/>
          <Route path="/chat" element={<Chat/>}/>
          <Route path="/emergency-contacts" element={<EmergencyContacts/>}/>
          <Route path="/report-disaster" element={<ReportDisaster/>}/>
          <Route path="/resources" element={<Resources/>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/volunteers" element={<Volunteers/>}/>
          <Route path="/profile" element={<Profile/>}/>
        </Route>
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default App;
