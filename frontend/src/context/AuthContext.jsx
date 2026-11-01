import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize and load token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);
      fetchProfile(storedToken);
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Fetch current user profile using JWT
  const fetchProfile = async (jwt) => {
    try {
      const res = await api.get("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      const data = res.data;

      // Handles both { success: true, data: user } and { user } formats
      const userData = data?.data || data?.user;

      if (userData) {
        setUser(userData);
      } else {
        logout();
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      // Only clear credentials if backend explicitly rejected auth
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const data = res.data;

      // Extract token and user payload
      const jwt = data?.data?.token || data?.token;
      const userData = data?.data?.user || data?.user;

      if (!jwt || !userData) {
        return { success: false, message: data?.message || "Login failed" };
      }

      localStorage.setItem("token", jwt);
      setToken(jwt);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      console.error("Login failed:", message);
      return { success: false, message };
    }
  };

  // Signup / Register handler
  const signup = async (username, email, password) => {
    try {
      const res = await api.post("/api/auth/signup", { username, email, password });
      const data = res.data;

      const jwt = data?.data?.token || data?.token;
      const userData = data?.data?.user || data?.user;

      if (!jwt || !userData) {
        return { success: false, message: data?.message || "Signup failed" };
      }

      localStorage.setItem("token", jwt);
      setToken(jwt);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed";
      console.error("Signup failed:", message);
      return { success: false, message };
    }
  };

  // Helper to update user state locally (e.g., when onboarding is finished)
  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  };

  // Logout handler
  const logout = async () => {
    try {
      if (token) {
        await api.post("/api/auth/logout", {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.warn("Logout request failed or server stateless:", err?.message);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
    }
  };

  // Optional: fetch all users for admin or list views
  const fetchAllUsers = async () => {
    if (!token) return [];

    try {
      const res = await api.get("/users/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data?.data || res.data || [];
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        updateUser,
        authLoading,
        isAuthenticated: !!user,
        isOnboarded: !!user?.is_on_boarded,
        fetchAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
export default AuthContext;
