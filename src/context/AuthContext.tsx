/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Authentication & Role Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => void;
  switchUserRole: (role: UserRole) => void;
  logout: () => void;
  availableUsers: User[];
}

const DEMO_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Dra. Sofia Romero',
    email: 'sofia.romero@bayx-demo.health',
    role: 'Médico',
    institution: 'Hospital Demo / BAYX Health Unit',
    avatarUrl: '',
  },
  {
    id: 'usr-2',
    name: 'Lic. Camila Torres',
    email: 'camila.torres@bayx-demo.health',
    role: 'Cuidador',
    institution: 'Unidad de Cuidado Biométrico BAYX',
    avatarUrl: '',
  },
  {
    id: 'usr-3',
    name: 'Ing. Mateo Álvarez',
    email: 'mateo.alvarez@bayx-demo.health',
    role: 'Ingeniero IoT',
    institution: 'Laboratorio de Hardware y Sensores ESP32',
    avatarUrl: '',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bayx_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_USERS[0];
      }
    }
    return DEMO_USERS[0]; // Default logged-in user for instant usability
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('bayx_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bayx_current_user');
    }
  }, [user]);

  const login = (email: string, role?: UserRole) => {
    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setUser(matched);
    } else {
      setUser({
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: role || 'Cuidador',
        institution: 'BAYX Health Center',
      });
    }
  };

  const switchUserRole = (newRole: UserRole) => {
    const matched = DEMO_USERS.find((u) => u.role === newRole);
    if (matched) {
      setUser(matched);
    } else if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        switchUserRole,
        logout,
        availableUsers: DEMO_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
