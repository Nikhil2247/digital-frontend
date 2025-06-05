// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axios'; // Assuming this is your configured axios instance

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  // Initialize userData by parsing the stored string, or null if not found/invalid
  const [userData, setUserData] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user'); // Clear corrupted data
      return null;
    }
  });

  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      const { access_token, payload } = res.data; // Destructure for clarity

      setToken(access_token);
      setUserData(payload); // Store payload as an object

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(payload)); // Stringify for localStorage

      return payload; // Return user data for immediate use after login
    } catch (error) {
      console.error("Login failed:", error.response ? error.response.data : error.message);
      // You might want to throw the error again or return a specific error object
      // so the calling component can handle it (e.g., show an error message to the user)
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUserData(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Optionally, redirect to login page after logout from here or in the component calling logout
    // window.location.href = '/login'; // Or use navigate if within a Router context
  };

  // Optional: You might want to fetch user data if token exists but userData is null (e.g., on page refresh)
  // This depends on whether your '/auth/login' is the only source of user data or if you have a '/auth/me' endpoint
  // useEffect(() => {
  //   if (token && !userData) {
  //     // Example: Fetch user profile if you have an endpoint like '/auth/me'
  //     // const fetchUser = async () => {
  //     //   try {
  //     //     const res = await axios.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  //     //     setUserData(res.data.payload);
  //     //     localStorage.setItem('user', JSON.stringify(res.data.payload));
  //     //   } catch (e) {
  //     //     console.error("Failed to fetch user with token", e);
  //     //     logout(); // Token might be invalid, so log out
  //     //   }
  //     // };
  //     // fetchUser();
  //   }
  // }, [token, userData]);


  return (
    <AuthContext.Provider value={{ token, userData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}