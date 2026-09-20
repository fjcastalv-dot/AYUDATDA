'use client';

import React, { useState } from 'react';
import { Task, SubTask, TrafficLightState, TimerStatus } from '@/types/task';
import { HourglassTimer } from './HourglassTimer';
import {
  Target,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Calendar,
  RefreshCw,
  Layers,
  PictureInPicture2,
  Plus,
  Trash2,
  Play,
  Clock,
  ListTodo,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';
import { sound } from '@/lib/audio';

interface SingleTaskViewProps {
  task: Task | null;
  activeSubtask: SubTask | null;
  timerStatus: TimerStatus;
  trafficState: TrafficLightState;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onAddMinutes: (minutes: number) => void;
  onCompleteTask: (taskId: string) => void;
  onOpenParkingLot: () => void;
  onOpenCalendarSync: () => void;
  onOpenTaskManager: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isPipActive?: boolean;
  onTogglePip?: () => void;
  onAddSubtask: (taskId: string, title: string, durationMinutes: number) => void;
  onSelectSubtask: (taskId: string, subtaskId: string) => void;
  onCompleteSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

export function SingleTaskView({
  task,
  activeSubtask,
  timerStatus,
  trafficState,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onAddMinutes,
  onCompleteTask,
  onOpenParkingLot,
  onOpenCalendarSync,
  onOpenTaskManager,
  soundEnabled,
  onToggleSound,
  isPipActive = false,
  onTogglePip,
  onAddSubtask,
  onSelectSubtask,
  onCompleteSubtask,
  onDeleteSubtask,
}: SingleTaskViewProps) {
  // Estado local para el formulario de subdivisión
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [subtaskDuration, setSubtaskDuration] = useState<number>(20);
  const [isSubtasksOpen, setIsSubtasksOpen] = useState(true);

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mb-6 text-emerald-400 shadow-xl shadow-emerald-500/10">
          <Target className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">
          ¿En qué vas a enfocarte ahora?
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mb-8 leading-relaxed">
          Para evitar la parálisis y la dispersión, el sistema solo te mostrará <span className="text-emerald-400 font-semibold">una única tarea</span> a la vez.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={onOpenTaskManager}
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Layers className="w-5 h-5" />
            Elegir o Crear Tarea
          </button>
          <button
            onClick={onOpenParkingLot}
            type="button"
            className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-all"
          >
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Aparcar Idea Rápida
          </button>
        </div>
      </div>
    );
  }

  // Cálculos de presupuesto de tiempo
  const subtasks = task.subtasks || [];
  const assignedMinutes = subtasks.reduce((acc, st) => acc + st.durationMinutes, 0);
  const remainingBudget = Math.max(0, task.durationMinutes - assignedMinutes);
  const completedSubtasks = subtasks.filter((st) => st.status === 'completed');
  const activeStepNumber = activeSubtask
    ? subtasks.findIndex((st) => st.id === activeSubtask.id) + 1
    : 1;

  const handleCreateSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskTitle.trim()) return;

    const duration = Number(subtaskDuration) > 0 ? Number(subtaskDuration) : 15;
    onAddSubtask(task.id, subtaskTitle.trim(), duration);
    setSubtaskTitle('');
    sound.playQuickClick();

    // Reajustar sugerencia de duración para la siguiente subtarea al remanente disponible
    const newAssigned = assignedMinutes + duration;
    const newRemaining = task.durationMinutes - newAssigned;
    if (newRemaining > 0) {
      setSubtaskDuration(newRemaining);
    } else {
      setSubtaskDuration(15);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 py-4">
      {/* Título y Cabecera de Foco */}
      <div className="w-full text-center space-y-2">
        {activeSubtask ? (
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {task.title} <span className="text-slate-400 font-mono">({task.durationMinutes} min totales)</span>
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-400 font-mono font-bold">
                Paso {activeStepNumber} de {subtasks.length}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight">
              {activeSubtask.title}
            </h1>
            <p className="text-sm font-mono text-emerald-400 font-semibold">
              ⏱️ Bloque designado: {activeSubtask.durationMinutes} minutos
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              MODO FOCO ÚNICO ACTIVO
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight">
              {task.title}
            </h1>
            {task.description && (
              <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
                {task.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Grid Central: Temporizador Semáforo + Tarjetas de Guía */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Principal: Temporizador Semáforo */}
        <div className="lg:col-span-7 flex flex-col items-center gap-4">
          <HourglassTimer
            status={timerStatus}
            trafficState={trafficState}
            onStart={onStartTimer}
            onPause={onPauseTimer}
            onReset={onResetTimer}
            onAddMinutes={onAddMinutes}
            onComplete={() => {
              if (activeSubtask) {
                onCompleteSubtask(task.id, activeSubtask.id);
              } else {
                onCompleteTask(task.id);
              }
            }}
            soundEnabled={soundEnabled}
            onToggleSound={onToggleSound}
          />

          {/* Avance rápido de subtarea si está activa */}
          {activeSubtask && (
            <button
              onClick={() => onCompleteSubtask(task.id, activeSubtask.id)}
              type="button"
              className="w-full max-w-md py-3 px-4 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ¡Subtarea lista! Avanzar a la siguiente ({completedSubtasks.length + 1}/{subtasks.length})
            </button>
          )}
        </div>

        {/* Columna Lateral: Definición de Terminado y Subtareas */}
        <div className="lg:col-span-5 flex flex-col gap-5 w-full">
          {/* Card Esencial: DEFINICIÓN DE TERMINADO */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Target className="w-4 h-4" />
              Definición de Terminado (DoD)
            </div>
            <p className="text-slate-100 text-lg sm:text-xl font-semibold leading-relaxed">
              &ldquo;{task.definitionOfDone || 'Dar por concluido el entregable principal sin perfeccionismo.'}&rdquo;
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Búfer de cierre: {task.bufferMinutes || 10} min</span>
              <span className="text-slate-400 font-medium">Meta: Terminar sin bifurcarse</span>
            </div>
          </div>

          {/* Módulo de Subdivisión de Tarea con Presupuestación de Minutos */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                <ListTodo className="w-4 h-4 text-emerald-400" />
                <span>Subdividir en Bloques Pequeños</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSubtasksOpen(!isSubtasksOpen)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
              >
                {isSubtasksOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Visualizador de Presupuesto de Tiempo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">
                  Total Tarea: <strong className="text-slate-200">{task.durationMinutes}m</strong>
                </span>
                <span className={remainingBudget === 0 ? 'text-emerald-400 font-bold' : remainingBudget < 0 ? 'text-rose-400 font-bold' : 'text-amber-400'}>
                  {remainingBudget > 0
                    ? `Quedan ${remainingBudget}m sin asignar`
                    : remainingBudget === 0
                    ? '100% asignado'
                    : `Excedido por ${Math.abs(remainingBudget)}m`}
                </span>
              </div>

              {/* Barra de progreso de distribución */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                {subtasks.map((st, i) => {
                  const widthPct = Math.min(100, (st.durationMinutes / task.durationMinutes) * 100);
                  const colors = ['bg-emerald-500', 'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-amber-500'];
                  const colorClass = st.status === 'completed' ? 'bg-slate-600' : colors[i % colors.length];
                  return (
                    <div
                      key={st.id}
                      style={{ width: `${widthPct}%` }}
                      className={`h-full ${colorClass} border-r border-slate-900 transition-all`}
                      title={`${st.title}: ${st.durationMinutes} min`}
                    />
                  );
                })}
              </div>
            </div>

            {isSubtasksOpen && (
              <div className="space-y-4 pt-1">
                {/* Formulario para agregar subtarea */}
                <form onSubmit={handleCreateSubtask} className="space-y-2.5 p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <input
                    type="text"
                    value={subtaskTitle}
                    onChange={(e) => setSubtaskTitle(e.target.value)}
                    placeholder="Nombre del paso o subtarea..."
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" /> Minutos:
                    </span>
                    {[10, 15, 20, 30].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSubtaskDuration(m)}
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                          subtaskDuration === m
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                    {remainingBudget > 0 && remainingBudget !== 10 && remainingBudget !== 15 && remainingBudget !== 20 && remainingBudget !== 30 && (
                      <button
                        type="button"
                        onClick={() => setSubtaskDuration(remainingBudget)}
                        className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-amber-950/40 text-amber-300 border border-amber-800/50"
                      >
                        Restante ({remainingBudget}m)
                      </button>
                    )}
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={subtaskDuration}
                      onChange={(e) => setSubtaskDuration(Number(e.target.value))}
                      className="w-14 px-2 py-1 text-xs font-mono text-center bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!subtaskTitle.trim()}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Asignar Subtarea ({subtaskDuration} min)
                  </button>
                </form>

                {/* Lista de Subtareas creadas */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {subtasks.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">
                      Sin subtareas. Agrega una arriba para desmenuzar los {task.durationMinutes} minutos.
                    </p>
                  ) : (
                    subtasks.map((st, idx) => {
                      const isActive = activeSubtask?.id === st.id;
                      const isCompleted = st.status === 'completed';

                      return (
                        <div
                          key={st.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                            isActive
                              ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                              : isCompleted
                              ? 'bg-slate-800/20 border-slate-800/60 opacity-60'
                              : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-mono text-[10px] text-slate-400 font-bold shrink-0">
                              #{idx + 1}
                            </span>
                            <span className={`truncate font-medium ${isCompleted ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                              {st.title}
                            </span>
                            <span className="font-mono text-[10px] text-emerald-400 font-semibold bg-emerald-950/50 px-1.5 py-0.5 rounded shrink-0">
                              {st.durationMinutes}m
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {!isCompleted && !isActive && (
                              <button
                                type="button"
                                onClick={() => onSelectSubtask(task.id, st.id)}
                                title="Poner esta subtarea en el foco y temporizador"
                                className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
                              >
                                <Play className="w-3 h-3 fill-current" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onCompleteSubtask(task.id, st.id)}
                              title={isCompleted ? 'Reabrir subtarea' : 'Marcar subtarea como terminada'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isCompleted
                                  ? 'text-emerald-400 hover:bg-emerald-950/40'
                                  : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteSubtask(task.id, st.id)}
                              title="Eliminar subtarea"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botón Destacado: Fijar en Ventanita Flotante Siempre Visible (Picture-in-Picture) */}
          {onTogglePip && (
            <button
              onClick={onTogglePip}
              type="button"
              className={`w-full py-3.5 px-4 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] ${
                isPipActive
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-emerald-950/60 to-slate-900 hover:from-emerald-900/60 text-emerald-300 border-emerald-500/40 shadow-emerald-950/40'
              }`}
            >
              <PictureInPicture2 className="w-5 h-5 text-emerald-400" />
              <span>
                {isPipActive
                  ? 'Ventanita Flotante Abierta (Clic para cerrar)'
                  : '📌 Fijar en Ventanita Flotante (Siempre Visible)'}
              </span>
            </button>
          )}

          {/* Botón de Emergencia Anti-Yak Shaving (Parking Lot) */}
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Lightbulb className="w-4 h-4" />
                ¿Se te ocurrió otra idea?
              </div>
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                Ctrl + Espacio
              </kbd>
            </div>
            <p className="text-xs text-slate-400">
              No dejes que el efecto cascada te desvíe. Sácala de tu mente y sigue enfocado.
            </p>
            <button
              onClick={onOpenParkingLot}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/20 font-medium text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Lightbulb className="w-4 h-4" />
              Aparcar en Parking Lot
            </button>
          </div>

          {/* Acciones de Flujo de Tarea */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onCompleteTask(task.id)}
              type="button"
              className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle className="w-4 h-4" />
              Concluir Toda la Tarea
            </button>
            <button
              onClick={onOpenTaskManager}
              type="button"
              title="Cambiar a otra tarea de la lista"
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-medium text-sm flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Cambiar
            </button>
          </div>

          {/* Acceso a Sincronización Google Calendar */}
          <button
            onClick={onOpenCalendarSync}
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 font-medium text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            Agendar bloque con búfer en Google Calendar
            <ArrowRight className="w-3.5 h-3.5 ml-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}
