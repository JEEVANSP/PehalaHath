import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Import all exports from jwt-decode

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage for token on page refresh
    const token = localStorage.getItem('token');

    if (token) {
      try {
        // Decode the JWT token to get user data including role
        const decoded = jwtDecode(token);
        
        // Set axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Set user state with token and decoded data
        setUser({ 
          token,
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role
        });
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  useEffect(() => {
    console.log("Updated user state:", user);
  }, [user]);

  const updateUserInfo = (userData) => {
    if(user && userData) {
      setUser(prevUser => ({
        ...prevUser,
        ...userData
      }))
    }
  };

  const login = (token) => {
    try {
      // Decode the JWT token
      const decoded = jwtDecode(token);
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state with token and decoded data
      setUser({
        token,
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role
      });
      
      navigate('/'); // Redirect after login
    } catch (error) {
      console.error("Error processing login token:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login'); // Redirect after logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout,updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
