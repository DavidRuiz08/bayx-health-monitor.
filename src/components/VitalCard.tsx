/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Medical Telemetry Metric Card
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface VitalCardProps {
  title: string;
  sensor: string;
  value: string | number;
  unit?: string;
  statusText: string;
  isWarning?: boolean;
  isCritical?: boolean;
  icon: LucideIcon;
  subInfo?: string;
  children?: React.ReactNode;
}

export const VitalCard: React.FC<VitalCardProps> = ({
  title,
  sensor,
  value,
  unit,
  statusText,
  isWarning = false,
  isCritical = false,
  icon: Icon,
  subInfo,
  children,
}) => {
  // Color tokens
  const statusColor = isCritical
    ? 'text-rose-500 dark:text-rose-400'
    : isWarning
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-emerald-600 dark:text-emerald-400';

  const iconBg = isCritical
    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
    : isWarning
    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400';

  return (
    <div className="relative flex flex-col justify-between p-5 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl transition-all shadow-sm">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>{sensor}</span>
            {subInfo && (
              <>
                <span aria-hidden="true">·</span>
                <span>{subInfo}</span>
              </>
            )}
          </div>
        </div>

        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl lg:text-4xl font-mono font-bold tracking-tight tabular-nums text-slate-900 dark:text-white">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-mono font-medium text-slate-500 dark:text-slate-400 uppercase">
              {unit}
            </span>
          )}
        </div>

        {/* Status Text (No pills, clean typography) */}
        <div className="flex items-center gap-1.5 text-xs font-medium mt-1">
          <span className={statusColor}>● {statusText}</span>
        </div>
      </div>

      {/* Optional Child content (Sparkline or extra indicator) */}
      {children && <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">{children}</div>}
    </div>
  );
};
