'use client';

import React, { useState } from 'react';
import { Task, SubTask, TrafficLightState, TimerStatus } from '@/types/task';
import { Play, Pause, Plus, CheckCircle2, ShieldAlert, Sparkles, AlertTriangle, Lightbulb, Check, ChevronRight } from 'lucide-react';

interface FloatingPipWidgetProps {
  task: Task | null;
  activeSubtask: SubTask | null;
  timerStatus: TimerStatus;
  trafficState: TrafficLightState;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onAddMinutes: (minutes: number) => void;
  onCompleteTask: (taskId: string) => void;
  onCompleteSubtask?: (taskId: string, subtaskId: string) => void;
  onAddParkingItem: (content: string) => void;
}

export function FloatingPipWidget({
  task,
  activeSubtask,
  timerStatus,
  trafficState,
  onStartTimer,
  onPauseTimer,
  onAddMinutes,
  onCompleteTask,
  onCompleteSubtask,
  onAddParkingItem,
}: FloatingPipWidgetProps) {
  const [quickIdea, setQuickIdea] = useState('');
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [ideaSaved, setIdeaSaved] = useState(false);

  const { color, label, formattedTime, percentageRemaining } = trafficState;

  const colorStyles = {
    green: {
      border: 'border-emerald-500/50',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
      bgHeader: 'from-emerald-950/70 to-slate-900',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      text: 'text-emerald-400',
      bar: 'bg-emerald-500',
    },
    yellow: {
      border: 'border-amber-500/50',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
      bgHeader: 'from-amber-950/70 to-slate-900',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      text: 'text-amber-400',
      bar: 'bg-amber-500',
    },
    red: {
      border: 'border-rose-500/60',
      glow: 'shadow-[0_0_25px_rgba(244,63,94,0.3)]',
      bgHeader: 'from-rose-950/80 to-slate-900',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse',
      text: 'text-rose-400',
      bar: 'bg-rose-500',
    },
  }[color];

  const handleIdeaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickIdea.trim()) return;
    onAddParkingItem(quickIdea.trim());
    setQuickIdea('');
    setIdeaSaved(true);
    setTimeout(() => {
      setIdeaSaved(false);
      setIsAddingIdea(false);
    }, 1500);
  };

  if (!task) {
    return (
      <div className="h-full w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 text-center select-none font-sans">
        <p className="text-xs text-slate-400">Sin tarea activa en foco</p>
        <p className="text-[11px] text-slate-500 mt-1">Selecciona una tarea en la ventana principal</p>
      </div>
    );
  }

  const subtasks = task.subtasks || [];
  const activeStepIdx = activeSubtask ? subtasks.findIndex((st) => st.id === activeSubtask.id) + 1 : 0;

  return (
    <div
      className={`h-full w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-3 select-none overflow-hidden font-sans border-2 ${colorStyles.border} ${colorStyles.glow}`}
    >
      {/* Barra superior: Título (y Subtarea si existe) y Estado Semáforo */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="min-w-0 flex-1">
            {activeSubtask ? (
              <div className="leading-tight">
                <span className="text-[9px] text-slate-400 truncate block">
                  📁 {task.title}
                </span>
                <span className="text-[11px] font-black text-slate-100 truncate block">
                  Paso {activeStepIdx}/{subtasks.length}: {activeSubtask.title}
                </span>
              </div>
            ) : (
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 truncate block max-w-[160px]">
                {task.title}
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${colorStyles.badge}`}
          >
            {color === 'green' && <Sparkles className="w-2.5 h-2.5" />}
            {color === 'yellow' && <AlertTriangle className="w-2.5 h-2.5" />}
            {color === 'red' && <ShieldAlert className="w-2.5 h-2.5" />}
            {label}
          </span>
        </div>

        {/* Barra de progreso sutil */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full ${colorStyles.bar} transition-all duration-300 rounded-full`}
            style={{ width: `${percentageRemaining}%` }}
          />
        </div>
      </div>

      {/* Zona Central: Contador Gigante y Definición de Terminado */}
      <div className="flex flex-col items-center justify-center py-1">
        <div className={`font-mono font-black text-4xl tracking-tight leading-none ${colorStyles.text}`}>
          {formattedTime}
        </div>

        {/* Definición de Terminado o subtarea fija */}
        <div className="mt-1 px-2.5 py-0.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center max-w-full">
          <p className="text-[10px] text-slate-300 font-semibold line-clamp-1 leading-tight">
            🎯 <span className="text-emerald-400 font-bold">DoD:</span> {task.definitionOfDone || 'Terminar el objetivo sin perfeccionismo.'}
          </p>
        </div>
      </div>

      {/* Mini Parking Lot desplegable */}
      {isAddingIdea ? (
        <form onSubmit={handleIdeaSubmit} className="mt-1">
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={quickIdea}
              onChange={(e) => setQuickIdea(e.target.value)}
              placeholder="Aparcar idea..."
              className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-amber-500/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-1">
            <span>Enter para guardar</span>
            {ideaSaved && (
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5" /> ¡Guardada!
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsAddingIdea(false)}
              className="text-slate-500 hover:text-slate-300 underline"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        /* Controles de la Ventana Flotante */
        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-900">
          <button
            onClick={timerStatus === 'running' ? onPauseTimer : onStartTimer}
            type="button"
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-bold text-xs shadow-md transition-all ${
              timerStatus === 'running'
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {timerStatus === 'running' ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Iniciar
              </>
            )}
          </button>

          <button
            onClick={() => onAddMinutes(5)}
            type="button"
            title="Añadir 5 min"
            className="p-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold border border-slate-700 transition-all flex items-center gap-0.5"
          >
            <Plus className="w-3 h-3 text-emerald-400" />
            5m
          </button>

          <button
            onClick={() => setIsAddingIdea(true)}
            type="button"
            title="Aparcar distracción"
            className="p-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 transition-all"
          >
            <Lightbulb className="w-3.5 h-3.5" />
          </button>

          {/* Si hay subtarea activa, botón de avance rápido de paso; si no, completar toda la tarea */}
          {activeSubtask && onCompleteSubtask ? (
            <button
              onClick={() => onCompleteSubtask(task.id, activeSubtask.id)}
              type="button"
              title="Completar subtarea y avanzar a la siguiente"
              className="p-1.5 px-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 font-bold text-xs flex items-center gap-1 transition-all"
            >
              <span>Paso</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onCompleteTask(task.id)}
              type="button"
              title="Marcar como terminada"
              className="p-1.5 px-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/50 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
