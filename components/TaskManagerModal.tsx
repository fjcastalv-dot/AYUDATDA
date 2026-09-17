'use client';

import React, { useState } from 'react';
import { Task } from '@/types/task';
import { X, Plus, Target, Clock, CheckCircle2, Play, Trash2, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { sound } from '@/lib/audio';

interface TaskManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  activeTaskId: string | null;
  onSelectActiveTask: (taskId: string) => void;
  onCreateTask: (newTask: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

export function TaskManagerModal({
  isOpen,
  onClose,
  tasks,
  activeTaskId,
  onSelectActiveTask,
  onCreateTask,
  onDeleteTask,
  onCompleteTask,
}: TaskManagerModalProps) {
  const [title, setTitle] = useState('');
  const [definitionOfDone, setDefinitionOfDone] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [bufferMinutes, setBufferMinutes] = useState<number>(10);
  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateTask({
      title: title.trim(),
      definitionOfDone: definitionOfDone.trim() || 'Completar el entregable principal sin distracciones accesorias.',
      durationMinutes: Number(durationMinutes) || 25,
      remainingSeconds: (Number(durationMinutes) || 25) * 60,
      bufferMinutes: Number(bufferMinutes) || 10,
    });

    setTitle('');
    setDefinitionOfDone('');
    sound.playQuickClick();
  };

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                Gestión de Tareas y Definición de Terminado
              </h3>
              <p className="text-xs text-slate-400">
                Define criterios concretos para no perderte en el perfeccionismo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-100 p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Formulario de Nueva Tarea */}
          <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Crear Nueva Tarea de Foco
            </div>

            {/* Título de la tarea */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nombre de la Tarea <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Redactar el informe de avance trimestral"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Definición de Terminado (DoD) - Clave para TDAH */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Definición de Terminado (Criterio Concreto de Cierre)</span>
                <span className="text-[11px] text-amber-400 font-semibold">Evita el bucle sin fin</span>
              </label>
              <input
                type="text"
                value={definitionOfDone}
                onChange={(e) => setDefinitionOfDone(e.target.value)}
                placeholder="Ej. Tener escritas las conclusiones y exportado en PDF (¡no revisar fuentes 10 veces!)"
                className="w-full px-4 py-3 bg-slate-800 border border-emerald-500/40 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Duración y Búfer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Duración de Foco (Minutos)
                </label>
                <div className="flex gap-2">
                  {[15, 25, 45, 60].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDurationMinutes(m)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                        durationMinutes === m
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Búfer Posterior (Descompresión)
                </label>
                <div className="flex gap-2">
                  {[5, 10, 15].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBufferMinutes(b)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                        bufferMinutes === b
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      +{b}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              Guardar Tarea en la Cola
            </button>
          </form>

          {/* Listado de Tareas Pendientes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Cola de Tareas ({pendingTasks.length})
              </span>
              <button
                type="button"
                onClick={() => setShowCompleted(!showCompleted)}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showCompleted ? 'Ocultar completadas' : `Ver completadas (${completedTasks.length})`}
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm bg-slate-800/20 rounded-2xl border border-slate-800">
                No tienes tareas pendientes. ¡Crea una arriba para entrar en Foco Único!
              </div>
            ) : (
              pendingTasks.map((t) => {
                const isActive = t.id === activeTaskId;
                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            EN FOCO AHORA
                          </span>
                        )}
                        <h4 className="font-bold text-slate-100 text-sm truncate">{t.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        <strong className="text-emerald-400/90 font-medium">DoD:</strong> {t.definitionOfDone}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 font-mono">
                        <span>⏱️ {t.durationMinutes} min</span>
                        <span>🛡️ Búfer: {t.bufferMinutes} min</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isActive && (
                        <button
                          onClick={() => {
                            onSelectActiveTask(t.id);
                            onClose();
                          }}
                          type="button"
                          className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Enfocar
                        </button>
                      )}

                      <button
                        onClick={() => onCompleteTask(t.id)}
                        type="button"
                        title="Marcar como completada"
                        className="p-2 rounded-xl bg-slate-700/50 hover:bg-emerald-950/50 text-slate-300 hover:text-emerald-400 border border-slate-600/50 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteTask(t.id)}
                        type="button"
                        title="Eliminar tarea"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Tareas Completadas (Opcional) */}
          {showCompleted && completedTasks.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Completadas recientemente ({completedTasks.length})
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {completedTasks.map((ct) => (
                  <div
                    key={ct.id}
                    className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 flex items-center justify-between text-xs text-slate-400"
                  >
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="line-through text-slate-500">{ct.title}</span>
                    </div>
                    <button
                      onClick={() => onDeleteTask(ct.id)}
                      type="button"
                      className="text-slate-600 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-900/70 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            Volver al Foco
          </button>
        </div>
      </div>
    </div>
  );
}
