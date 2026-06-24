'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import api from '../lib/api/axios';
import { useRouter, usePathname } from 'next/navigation';

import type { AuthProfile, Permission, User } from '@/types';

interface AuthContextType {
  user: User | null;
  permissions: Permission[];
  canAccessAdmin: boolean;
  loading: boolean;
  login: (authProfile: AuthProfile) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<AuthProfile | null>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const applyAuthProfile = useCallback((authProfile: AuthProfile) => {
    setUser(authProfile.user);
    setPermissions(authProfile.adminAccessPolicy?.globalActions ?? authProfile.permissions);
    setCanAccessAdmin(authProfile.adminAccessPolicy?.canAccessAdmin ?? authProfile.canAccessAdmin);
  }, []);

  const clearAuthProfile = useCallback(() => {
    setUser(null);
    setPermissions([]);
    setCanAccessAdmin(false);
  }, []);

  const refreshProfile = useCallback(async (): Promise<AuthProfile | null> => {
    if (typeof window !== 'undefined' && pathname === '/admin/login') {
      return null;
    }
    try {
      const response = await api.get<{ success: boolean; data: AuthProfile }>('/auth/profile');
      if (response.data.success) {
        const authProfile = response.data.data;
        applyAuthProfile(authProfile);
        return authProfile;
      }
    } catch {
      clearAuthProfile();
    }

    return null;
  }, [applyAuthProfile, clearAuthProfile, pathname]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshProfile();
      } catch {
        clearAuthProfile();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [clearAuthProfile, refreshProfile]);

  const login = (authProfile: AuthProfile) => {
    applyAuthProfile(authProfile);
    router.push('/admin/dashboard');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    }

    clearAuthProfile();
    router.push('/');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        canAccessAdmin,
        loading,
        login,
        logout,
        refreshProfile,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
