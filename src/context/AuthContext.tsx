'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { College } from '@/lib/types';
import { findCollegeByEmail, hashPassword, registerCollege, seedInitialDataIfNeeded } from '@/lib/db';

interface AuthContextType {
  college: College | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_COLLEGE_KEY = 'cg_active_college';

const DEFAULT_DEMO_COLLEGE: College = {
  id: 'demo-college-id',
  collegeName: 'Code Galatta Institute of Technology',
  collegeEmail: 'admin@cgit.edu',
  password: '',
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [college, setCollege] = useState<College | null>(DEFAULT_DEMO_COLLEGE);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Seed initial demo data on first load
    seedInitialDataIfNeeded();

    try {
      const stored = localStorage.getItem(CURRENT_COLLEGE_KEY);
      if (stored) {
        setCollege(JSON.parse(stored));
      } else {
        setCollege(DEFAULT_DEMO_COLLEGE);
        localStorage.setItem(CURRENT_COLLEGE_KEY, JSON.stringify(DEFAULT_DEMO_COLLEGE));
      }
    } catch (e) {
      console.error('Failed to load active college session', e);
      setCollege(DEFAULT_DEMO_COLLEGE);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const existing = await findCollegeByEmail(email);
    if (!existing) {
      throw new Error('No college registered with this email.');
    }

    const hashed = await hashPassword(pass);
    if (existing.password !== hashed) {
      throw new Error('Invalid email or password.');
    }

    // Omit password from active session object
    const sessionCollege: College = { ...existing, password: '' };
    setCollege(sessionCollege);
    localStorage.setItem(CURRENT_COLLEGE_KEY, JSON.stringify(sessionCollege));
    return true;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    const newCollege = await registerCollege({
      collegeName: name,
      collegeEmail: email,
      password: pass,
    });
    
    // Registration redirects to Login page per spec requirement
    return true;
  };

  const logout = () => {
    setCollege(null);
    localStorage.removeItem(CURRENT_COLLEGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ college, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
