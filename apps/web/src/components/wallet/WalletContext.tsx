'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';
const TOKEN_KEY = 'hederanet_token';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  hederaAccountId: string;
  hederaPublicKey: string | null;
  role: string;
  kycStatus: string;
}

interface WalletState {
  user: AuthUser | null;
  loading: boolean;
  // Backward-compat aliases consumed by existing dashboard components
  accountId: string | null;
  connected: boolean;
  connecting: boolean;
}

interface WalletContextValue extends WalletState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: (accessToken: string) => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => void;
  refreshAuth: (newToken: string) => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  // Restore session from saved token
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }

    axios
      .get<{ success: boolean; data: AuthUser }>(`${API}/auth/me`, { headers: authHeader(token) })
      .then((res) => setUser(res.data.data))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const handleAuthResponse = useCallback((token: string, authUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(authUser);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setConnecting(true);
    try {
      const res = await axios.post<{ success: boolean; data: { token: string; user: AuthUser } }>(
        `${API}/auth/signin`,
        { email, password },
      );
      handleAuthResponse(res.data.data.token, res.data.data.user);
    } finally {
      setConnecting(false);
    }
  }, [handleAuthResponse]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setConnecting(true);
    try {
      const res = await axios.post<{ success: boolean; data: { token: string; user: AuthUser } }>(
        `${API}/auth/signup`,
        { email, password, name },
      );
      handleAuthResponse(res.data.data.token, res.data.data.user);
    } finally {
      setConnecting(false);
    }
  }, [handleAuthResponse]);

  const signInWithGoogle = useCallback(async (accessToken: string) => {
    setConnecting(true);
    try {
      const res = await axios.post<{ success: boolean; data: { token: string; user: AuthUser } }>(
        `${API}/auth/google`,
        { accessToken },
      );
      handleAuthResponse(res.data.data.token, res.data.data.user);
    } finally {
      setConnecting(false);
    }
  }, [handleAuthResponse]);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => prev ? { ...prev, ...patch } : prev);
  }, []);

  const refreshAuth = useCallback(async (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    const res = await axios.get<{ success: boolean; data: AuthUser }>(
      `${API}/auth/me`,
      { headers: authHeader(newToken) },
    );
    setUser(res.data.data);
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        user,
        loading,
        connecting,
        accountId: user?.hederaAccountId ?? null,
        connected: user !== null,
        signIn,
        signUp,
        signInWithGoogle,
        updateUser,
        refreshAuth,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
