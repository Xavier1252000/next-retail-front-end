"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedInState] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("isLoggedIn");
    if (stored === "true") setIsLoggedInState(true);
  }, []);

  const setIsLoggedIn = (value: boolean) => {
    setIsLoggedInState(value);
    localStorage.setItem("isLoggedIn", value.toString());
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
