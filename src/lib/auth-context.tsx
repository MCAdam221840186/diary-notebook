"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthContextType {
  isEditor: boolean;
  loaded: boolean;
  enableEdit: (token: string) => void;
  disableEdit: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isEditor: false,
  loaded: false,
  enableEdit: () => {},
  disableEdit: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isEditor, setIsEditor] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("diary_auth_token");
    if (stored) setIsEditor(true);
    setLoaded(true);
  }, []);

  const enableEdit = (token: string) => {
    localStorage.setItem("diary_auth_token", token);
    setIsEditor(true);
  };

  const disableEdit = () => {
    localStorage.removeItem("diary_auth_token");
    setIsEditor(false);
  };

  return (
    <AuthContext.Provider value={{ isEditor, loaded, enableEdit, disableEdit }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
