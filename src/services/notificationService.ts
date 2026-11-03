/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Push Notification Service
 * Web Notifications API with permission management & fallbacks
 */

class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public getPermission(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
      return this.permission;
    }
    return 'denied';
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      return result === 'granted';
    } catch {
      return false;
    }
  }

  public showNotification(title: string, options?: NotificationOptions): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  public notifyAlert(alertTitle: string, alertBody: string, severity: 'critical' | 'warning' | 'info') {
    const iconTag = severity === 'critical' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️';
    this.showNotification(`${iconTag} BAYX: ${alertTitle}`, {
      body: alertBody,
      tag: 'bayx-vital-alert',
      requireInteraction: severity === 'critical',
    });
  }
}

export const notificationService = new NotificationService();
