/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Clinical Care Task Manager
 * Minimalist design with real-time SSE synchronization
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  Filter,
  Pill,
  Activity,
  Wrench,
  HeartPulse,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { useHealthData } from '../context/HealthDataContext';
import { CareTask, TaskCategory, TaskPriority, TaskStatus } from '../types/task';
import { useAuth } from '../context/AuthContext';

export const TaskManager: React.FC = () => {
  const { tasks, createTask, updateTask, deleteTask } = useHealthData();
  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('vital_check');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [assignedRole, setAssignedRole] = useState<'Médico' | 'Enfermero/a' | 'Cuidador' | 'Familiar'>('Cuidador');
  const [assignedToName, setAssignedToName] = useState(user?.name || 'Personal de Turno');
  const [notes, setNotes] = useState('');

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    return true;
  });

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleToggleStatus = (task: CareTask) => {
    const nextStatus: TaskStatus =
      task.status === 'completed' ? 'pending' : 'completed';
    updateTask(task.id, {
      status: nextStatus,
      completedBy: nextStatus === 'completed' ? user?.name : undefined,
    });
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTask({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      scheduledTime,
      dueDate: new Date().toISOString().split('T')[0],
      assignedRole,
      assignedToName,
      notes: notes.trim(),
    });

    setTitle('');
    setDescription('');
    setNotes('');
    setIsModalOpen(false);
  };

  const getCategoryIcon = (cat: TaskCategory) => {
    switch (cat) {
      case 'medication':
        return <Pill className="w-4 h-4 text-purple-500" />;
      case 'vital_check':
        return <Activity className="w-4 h-4 text-cyan-500" />;
      case 'sensor_maintenance':
        return <Wrench className="w-4 h-4 text-amber-500" />;
      case 'physiotherapy':
        return <HeartPulse className="w-4 h-4 text-emerald-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryLabel = (cat: TaskCategory) => {
    switch (cat) {
      case 'medication':
        return 'Medicamento';
      case 'vital_check':
        return 'Signos Vitales';
      case 'sensor_maintenance':
        return 'Mantenimiento IoT';
      case 'physiotherapy':
        return 'Terapia & Movilidad';
      case 'clinical_visit':
        return 'Ronda Médica';
      default:
        return 'Cuidado General';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Progress Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Gestión de Tareas y Cuidados Clínicos
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Sincronización en tiempo real</span>
            <span aria-hidden="true">·</span>
            <span>{completedTasks} de {totalTasks} tareas completadas hoy</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">{progressPercent}%</span>
          </div>
          {/* Minimalist Progress Line */}
          <div className="w-48 sm:w-64 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-cyan-500 dark:bg-cyan-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-sm shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Nueva Tarea Clínica
        </button>
      </div>

      {/* Filter Bar (Segmented Controls) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status segmented control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          {(
            [
              { key: 'all', label: 'Todas' },
              { key: 'pending', label: 'Pendientes' },
              { key: 'in_progress', label: 'En Proceso' },
              { key: 'completed', label: 'Completadas' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === item.key
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Category filter select */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">Todas las categorías</option>
            <option value="vital_check">Signos Vitales</option>
            <option value="medication">Medicamento</option>
            <option value="sensor_maintenance">Mantenimiento IoT</option>
            <option value="physiotherapy">Terapia & Movilidad</option>
            <option value="clinical_visit">Ronda Médica</option>
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl text-center">
          <Clock className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No hay tareas en esta categoría
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Usa el botón "Nueva Tarea Clínica" para agendar un cuidado o recordatorio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`flex flex-col justify-between p-4 bg-white dark:bg-[#0e131f] border rounded-xl transition-all shadow-xs ${
                  isDone
                    ? 'border-slate-200/60 dark:border-slate-800/60 opacity-75'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleStatus(task)}
                        className={`mt-0.5 p-1 rounded-md transition-colors ${
                          isDone
                            ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800'
                        }`}
                        title={isDone ? 'Marcar como pendiente' : 'Marcar como completada'}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>

                      <div>
                        <h4
                          className={`text-sm font-semibold text-slate-900 dark:text-slate-100 ${
                            isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            {getCategoryIcon(task.category)}
                            {getCategoryLabel(task.category)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{task.scheduledTime}</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{task.priority}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Description / Instructions */}
                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 pl-8">
                      {task.description}
                    </p>
                  )}
                  {task.notes && (
                    <div className="mt-2 pl-8 text-[11px] font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20 p-2 rounded border border-cyan-100 dark:border-cyan-900/30">
                      Nota clínica: {task.notes}
                    </div>
                  )}
                </div>

                {/* Card Footer: Assignee & Status */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 pl-8">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{task.assignedToName} ({task.assignedRole})</span>
                  </div>

                  {isDone ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Completada
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        const next = task.status === 'pending' ? 'in_progress' : 'pending';
                        updateTask(task.id, { status: next });
                      }}
                      className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      {task.status === 'in_progress' ? '● En progreso' : 'Iniciar'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Crear Nueva Tarea */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Agendar Nueva Tarea Clínica
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título de la tarea
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Toma de SpO2 post-ejercicio, Dosis antibiótico..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="vital_check">Signos Vitales</option>
                    <option value="medication">Medicamento</option>
                    <option value="sensor_maintenance">Mantenimiento IoT</option>
                    <option value="physiotherapy">Terapia & Movilidad</option>
                    <option value="clinical_visit">Ronda Médica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="high">Alta (Urgente)</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hora programada
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rol asignado
                  </label>
                  <select
                    value={assignedRole}
                    onChange={(e) => setAssignedRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Médico">Médico</option>
                    <option value="Enfermero/a">Enfermero/a</option>
                    <option value="Cuidador">Cuidador</option>
                    <option value="Familiar">Familiar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Responsable
                </label>
                <input
                  type="text"
                  value={assignedToName}
                  onChange={(e) => setAssignedToName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción o dosis
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instrucciones específicas..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
