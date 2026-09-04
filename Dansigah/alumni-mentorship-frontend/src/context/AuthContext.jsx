import { createContext, useContext, useState } from "react";
import api from "../api/client";
const AuthContext = createContext(null),
  USER_KEY = "alumniUser",
  TOKEN_KEY = "alumniToken";
const storedUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};
export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedUser);
  const login = async (email, password) => {
    const { data } = await api.post("/users/login", { email, password });
    const next = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(next));
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(next);
    return next;
  };
  const register = async (payload) =>
    (await api.post("/users/register", payload)).data;
  const updateUser = (next) => {
    localStorage.setItem(USER_KEY, JSON.stringify(next));
    setUser(next);
  };
  const logout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
