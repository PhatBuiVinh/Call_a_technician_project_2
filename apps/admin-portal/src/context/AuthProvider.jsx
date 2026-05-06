import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../lib/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cat_user')) ||
             JSON.parse(sessionStorage.getItem('cat_user')) || null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() =>
    localStorage.getItem('cat_token') || sessionStorage.getItem('cat_token') || null
  );

  const login = async (email, password, remember=true) => {
    const { token, user } = await api('/auth/login', { method:'POST', body:{ email, password } });
    setUser(user); setToken(token);

    const store = remember ? localStorage : sessionStorage;
    store.setItem('cat_user', JSON.stringify(user));
    store.setItem('cat_token', token);

    // ensure the other store is clean
    (remember ? sessionStorage : localStorage).removeItem('cat_user');
    (remember ? sessionStorage : localStorage).removeItem('cat_token');

    return { token, user };
  };

  const register = async (name, email, password, remember=true) => {
    const { token, user } = await api('/auth/register', { method:'POST', body:{ name, email, password } });
    setUser(user); setToken(token);
    const store = remember ? localStorage : sessionStorage;
    store.setItem('cat_user', JSON.stringify(user));
    store.setItem('cat_token', token);
    (remember ? sessionStorage : localStorage).removeItem('cat_user');
    (remember ? sessionStorage : localStorage).removeItem('cat_token');

    return { token, user };
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('cat_user'); localStorage.removeItem('cat_token');
    sessionStorage.removeItem('cat_user'); sessionStorage.removeItem('cat_token');
  };

  const value = useMemo(() => ({ user, token, login, logout, register }), [user, token]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/* eslint-disable-next-line react-refresh/only-export-components */
export function useAuth(){ return useContext(AuthCtx); }
