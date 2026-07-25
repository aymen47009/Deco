import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const USERS_KEY = "deco_users_v1";
const SESSION_KEY = "deco_session_v1";

interface StoredUser extends User {
  passwordHash: string;
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return `h${h}`;
}

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      const seed: StoredUser[] = [
        { id: "u1", email: "admin@deco.sa", role: "admin", name: "المدير", passwordHash: hash("admin123") },
        { id: "u2", email: "worker@deco.sa", role: "worker", name: "خالد الدهان", passwordHash: hash("worker123") },
        { id: "u3", email: "customer@deco.sa", role: "customer", name: "أحمد محمد", passwordHash: hash("cust123") },
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      // ignore
    }
  }, []);

  const login = (email: string, password: string) => {
    const users = loadUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { ok: false, error: "البريد غير مسجّل" };
    if (found.passwordHash !== hash(password)) return { ok: false, error: "كلمة المرور غير صحيحة" };
    const safe: User = { id: found.id, email: found.email, role: found.role, name: found.name };
    setUser(safe);
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
