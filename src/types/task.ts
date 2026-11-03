/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Clinical Task Management Types
 */

export type TaskCategory =
  | 'medication'
  | 'vital_check'
  | 'clinical_visit'
  | 'sensor_maintenance'
  | 'physiotherapy'
  | 'nutrition';

export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface CareTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  scheduledTime: string; // HH:mm or full timestamp
  dueDate: string; // YYYY-MM-DD
  assignedRole: 'Médico' | 'Enfermero/a' | 'Cuidador' | 'Familiar';
  assignedToName: string;
  patientId: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}
