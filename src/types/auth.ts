/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Authentication & User Roles
 */

export type UserRole = 'Médico' | 'Cuidador' | 'Ingeniero IoT' | 'Familiar';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  institution: string;
}
