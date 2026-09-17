'use client';

import React from 'react';
import { Task, TrafficLightState, TimerStatus } from '@/types/task';
import { HourglassTimer } from './HourglassTimer';
import { Target, CheckCircle, ArrowRight, Lightbulb, Calendar, RefreshCw, Layers, PictureInPicture2 } from 'lucide-react';

interface SingleTaskViewProps {
  task: Task | null;
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
}

export function SingleTaskView({
  task,
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
}: SingleTaskViewProps) {
  // Estado vacío: Ninguna tarea seleccionada para foco
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

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 py-4">
      {/* Título de la Tarea en Foco */}
      <div className="w-full text-center space-y-2">
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

      {/* Grid Central: Temporizador Semáforo + Tarjetas de Guía */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Principal: Temporizador Semáforo */}
        <div className="lg:col-span-7 flex justify-center">
          <HourglassTimer
            status={timerStatus}
            trafficState={trafficState}
            onStart={onStartTimer}
            onPause={onPauseTimer}
            onReset={onResetTimer}
            onAddMinutes={onAddMinutes}
            onComplete={() => onCompleteTask(task.id)}
            soundEnabled={soundEnabled}
            onToggleSound={onToggleSound}
          />
        </div>

        {/* Columna Lateral: Definición de Terminado y Blindaje Anti-Distracciones */}
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
              <span className="text-slate-500">Regla: No abras subtareas nuevas</span>
            </div>
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
              Tarea Concluida
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
