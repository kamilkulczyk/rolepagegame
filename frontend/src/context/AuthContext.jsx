import { createContext, useState, useEffect } from "react";
import { api } from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = async (email, password) => {
    console.log("Im logging")
    const res = await api.login(email, password);
    setUser(res.user);
    localStorage.setItem("user", JSON.stringify(res.user));
  };

  const register = async (username, email, password) => {
    console.log("Im logging")
    const res = await api.login(username, email, password);
    setUser(res.user);
    localStorage.setItem("user", JSON.stringify(res.user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};