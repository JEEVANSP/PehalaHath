import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = "http://localhost:5000/api/auth/dashboard";

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect if not logged in
      return;
    }

    axios.get(BACKEND_URL)
      .then(res => setDashboardData(res.data))
      .catch(err => {
        console.error("Dashboard fetch error:", err);
        logout(); // If token invalid, log out
      });
  }, [user, navigate, logout]);

  if (!user) return null; // Prevents flashing

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {dashboardData ? <p>{dashboardData.message}</p> : <p>Loading...</p>}
      <button onClick={logout} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">Logout</button>
    </div>
  );
}
