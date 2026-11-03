/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Root Application Component
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { HealthDataProvider } from './context/HealthDataContext';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { LiveCameraView } from './components/LiveCameraView';
import { TaskManager } from './components/TaskManager';
import { HistoryAnalytics } from './components/HistoryAnalytics';
import { HardwareApiGuide } from './components/HardwareApiGuide';
import { AlertsCenter } from './components/AlertsCenter';
import { CodeViewer } from './components/CodeViewer';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
        {activeTab === 'camera' && <LiveCameraView />}
        {activeTab === 'tasks' && <TaskManager />}
        {activeTab === 'history' && <HistoryAnalytics />}
        {activeTab === 'hardware' && <HardwareApiGuide />}
        {activeTab === 'alerts' && <AlertsCenter />}
        {activeTab === 'code' && <CodeViewer />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HealthDataProvider>
          <MainLayout />
        </HealthDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
