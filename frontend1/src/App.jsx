import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthProvider';
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
import {Layout} from './components/Layout';

function App() {
  const { user } = useAuth();

  return (
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
      </Route>
    </Routes>
  );
}

export default App;
