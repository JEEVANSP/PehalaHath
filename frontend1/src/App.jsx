import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const { user } = useAuth();
  const { isDarkMode } = useThemeStore();

  // Update document class when theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Toaster position='top-right'/>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="/register" element={<Register/>}/>
        <Route element={<Layout />}>
          <Route path="/alerts" element={<Alerts/>}/>
          <Route path="/chat" element={<Chat/>}/>
          <Route path="/emergency-contacts" element={<EmergencyContacts/>}/>
          <Route path="/report-disaster" element={<ReportDisaster/>}/>
          <Route path="/resources" element={<Resources/>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/volunteers" element={<Volunteers/>}/>
          <Route path='/profile' element={<Profile/>}/>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
