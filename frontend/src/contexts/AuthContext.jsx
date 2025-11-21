import { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();// Create the AuthContext to manage authentication state and actions

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      // Set the Authorization header for all Axios requests when accessToken changes 
      api.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
    } else {
      // Remove the Authorization header when accessToken is null or undefined 
      delete api.defaults.headers.common["Authorization"];
    }
  }, [accessToken]);// Effect to update Axios headers when accessToken changes

  // Refresh token on page load
  useEffect(() => {
// Load session on component mount 
    const loadSession = async () => {
      try {
        const res = await api.post("/auth/refresh_token");// Request to refresh the token
        setAccessToken(res.data.accessToken);// Update the accessToken state 
        setUser(res.data.user);// Update the user state
      } catch {}// Ignore errors silently
    };
    loadSession();// Call the loadSession function on mount
  }, []);

  const login = async (data) => {
    const res = await api.post("/auth/login", data);// Login request
    setAccessToken(res.data.accessToken);// Update accessToken state
    setUser(res.data.user);// Update user state 

    if (res.data.user.role === "admin") navigate("/admin");// Navigate based on user role
    else if (res.data.user.role === "seller") navigate("/seller");// Navigate based on user role
    else navigate("/customer");// Navigate based on user role
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);// Registration request
    setAccessToken(res.data.accessToken);// Update accessToken state
    setUser(res.data.user);// Update user state

    if (res.data.user.role === "admin") navigate("/admin");// Navigate based on user role
    else if (res.data.user.role === "seller") navigate("/seller");// Navigate based on user role
    else navigate("/customer");// Navigate based on user role
  };

  const logout = async () => {
    await api.post("/auth/logout");// Logout request
    setUser(null);// Clear user state
    setAccessToken(null);// Clear accessToken state
    navigate("/");// Navigate to home page
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
