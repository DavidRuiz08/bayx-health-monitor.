/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Top Navigation Bar
 * Conforms strictly to Section 2: Top Bar Contract (1-line Brand, 4-5 Nav Links, 1 Primary Action)
 */

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Activity,
  User as UserIcon,
  Shield,
  Radio,
  Bell,
  Cpu,
  Code2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';

export type NavTab = 'dashboard' | 'camera' | 'tasks' | 'history' | 'hardware' | 'alerts' | 'code';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, switchUserRole, availableUsers } = useAuth();
  const { isConnected, activeAlertCount } = useHealthData();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#07090e]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single text element in display face, whitespace-nowrap shrink-0) */}
        <button
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-2.5 text-left text-slate-900 dark:text-white whitespace-nowrap shrink-0 group focus:outline-hidden"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-base font-extrabold tracking-tight">
            BAYX Health Monitor
          </span>
        </button>

        {/* Zone 2: 4-5 Concise Single-line Nav Links (whitespace-nowrap shrink-0) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-cyan-600 dark:hover:text-cyan-400 ${
              activeTab === 'dashboard'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                : ''
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => onTabChange('camera')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-cyan-600 dark:hover:text-cyan-400 ${
              activeTab === 'camera'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                : ''
            }`}
          >
            Cámara & Gestos
          </button>

          <button
            onClick={() => onTabChange('tasks')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-cyan-600 dark:hover:text-cyan-400 ${
              activeTab === 'tasks'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                : ''
            }`}
          >
            Tareas Clínicas
          </button>

          <button
            onClick={() => onTabChange('history')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-cyan-600 dark:hover:text-cyan-400 ${
              activeTab === 'history'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                : ''
            }`}
          >
            Historial
          </button>

          <button
            onClick={() => onTabChange('hardware')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-cyan-600 dark:hover:text-cyan-400 ${
              activeTab === 'hardware'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                : ''
            }`}
          >
            Hardware & POST
          </button>

          <button
            onClick={() => onTabChange('code')}
            className={`flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 hover:text-cyan-600 dark:hover:text-cyan-400 ${
              activeTab === 'code'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                : ''
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Código fuente
          </button>

          <button
            onClick={() => onTabChange('alerts')}
            className={`relative transition-colors whitespace-nowrap shrink-0 hover:text-cyan-600 dark:hover:text-cyan-400 ${
              activeTab === 'alerts'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                : ''
            }`}
          >
            Alertas
            {activeAlertCount > 0 && (
              <span className="ml-1 text-[10px] font-mono font-bold text-rose-500">
                ({activeAlertCount})
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Theme & User Profile Menu */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Real-time SSE Connection Indicator (clean text metadata) */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-500' : 'text-slate-400'}`} />
            <span>{isConnected ? 'IoT Sync' : 'Reconectando'}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Profile / Role Switcher Modal Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5 text-cyan-500" />
              <span className="hidden sm:inline font-mono">{user?.role || 'Médico'}</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl z-50">
                <div className="pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>

                <p className="text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                  Cambiar Rol de Sesión:
                </p>
                <div className="space-y-1">
                  {availableUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUserRole(u.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors ${
                        user?.role === u.role
                          ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="font-medium">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button (Zone 3) */}
          <button
            onClick={() => onTabChange('hardware')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <Cpu className="w-3.5 h-3.5" />
            Configurar ESP32
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-medium bg-slate-50 dark:bg-[#07090e]">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`py-1 ${activeTab === 'dashboard' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onTabChange('camera')}
          className={`py-1 ${activeTab === 'camera' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Cámara
        </button>
        <button
          onClick={() => onTabChange('tasks')}
          className={`py-1 ${activeTab === 'tasks' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Tareas
        </button>
        <button
          onClick={() => onTabChange('hardware')}
          className={`py-1 ${activeTab === 'hardware' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}
        >
          ESP32 POST
        </button>
        <button
          onClick={() => onTabChange('code')}
          className={`py-1 ${activeTab === 'code' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Código
        </button>
      </div>
    </header>
  );
};
