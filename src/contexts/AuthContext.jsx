import { createContext, useState, useEffect } from "react";
import { getMe } from "../services/authService";
import { useAuthStore } from "../store/authStore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ADD loading state

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await getMe();
          setUser(data.user);
        } catch (err) {
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false); // finished checking
    };
    loadUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    useAuthStore.getState().setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    useAuthStore.getState().clearToken();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
