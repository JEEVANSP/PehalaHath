import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Import all exports from jwt-decode

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const navigate = useNavigate();

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      console.error("Token expired:", error);
      return true;
    }
  }

  useEffect(() => {
    // Check localStorage for token on page refresh
    const token = localStorage.getItem('token');
    setIsLoading(true);

    if (token) {
      try {
        if(isTokenExpired(token)){
          console.log("Token expired, logging out");
          localStorage.removeItem('token');
          setUser(null);
        }
        else{
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
          role: decoded.role,
          phone: decoded.phone,
        });
      }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
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
        role: decoded.role,
        phone: decoded.phone,
      });
      
      navigate('/'); // Redirect after login
    } catch (error) {
      console.error("Error processing login token:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('chatHistory');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login'); // Redirect after logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout,updateUserInfo,isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
