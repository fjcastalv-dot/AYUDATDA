'use client';

import React from 'react';
import { TrafficLightState, TimerStatus } from '@/types/task';
import { Play, Pause, RotateCcw, Plus, CheckCircle2, Volume2, VolumeX, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

interface HourglassTimerProps {
  status: TimerStatus;
  trafficState: TrafficLightState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onAddMinutes: (minutes: number) => void;
  onComplete: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function HourglassTimer({
  status,
  trafficState,
  onStart,
  onPause,
  onReset,
  onAddMinutes,
  onComplete,
  soundEnabled,
  onToggleSound,
}: HourglassTimerProps) {
  const { color, label, description, percentageRemaining, formattedTime, isUrgent } = trafficState;

  // Clases dinámicas según el color del semáforo TDAH
  const colorStyles = {
    green: {
      ring: 'stroke-emerald-500',
      glow: 'shadow-[0_0_50px_rgba(16,185,129,0.25)]',
      border: 'border-emerald-500/40',
      bgGlow: 'from-emerald-500/10 via-slate-900/80 to-slate-950',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      text: 'text-emerald-400',
      btnPrimary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/50',
      sand: 'fill-emerald-400',
    },
    yellow: {
      ring: 'stroke-amber-500',
      glow: 'shadow-[0_0_50px_rgba(245,158,11,0.3)]',
      border: 'border-amber-500/40',
      bgGlow: 'from-amber-500/10 via-slate-900/80 to-slate-950',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      text: 'text-amber-400',
      btnPrimary: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-700/50',
      sand: 'fill-amber-400',
    },
    red: {
      ring: 'stroke-rose-500',
      glow: 'shadow-[0_0_60px_rgba(244,63,94,0.4)]',
      border: 'border-rose-500/50',
      bgGlow: 'from-rose-500/15 via-slate-900/80 to-slate-950',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
      text: 'text-rose-400',
      btnPrimary: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-700/50',
      sand: 'fill-rose-400',
    },
  }[color];

  // Geometría del medidor circular (Radio = 130, Circunferencia = 2 * PI * 130 ~ 816.8)
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentageRemaining / 100) * circumference;

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-8 rounded-3xl bg-gradient-to-b ${colorStyles.bgGlow} border ${colorStyles.border} ${colorStyles.glow} transition-all duration-700 w-full max-w-md mx-auto`}
    >
      {/* Botón mute/unmute discreto en la esquina superior derecha */}
      <button
        onClick={onToggleSound}
        type="button"
        title={soundEnabled ? 'Sonido activado' : 'Silenciado'}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors border border-slate-700/60"
      >
        {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
      </button>

      {/* Indicador de Estado Semáforo */}
      <div className="flex items-center gap-2 mb-6">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${colorStyles.badge}`}
        >
          {color === 'green' && <Sparkles className="w-3.5 h-3.5" />}
          {color === 'yellow' && <AlertTriangle className="w-3.5 h-3.5" />}
          {color === 'red' && <ShieldAlert className="w-3.5 h-3.5 animate-urgent-bounce" />}
          {label}
        </span>
        <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/40">
          {Math.round(percentageRemaining)}%
        </span>
      </div>

      {/* Reloj Circular y Reloj de Arena Central */}
      <div className="relative flex items-center justify-center my-2">
        <svg className="w-72 h-72 -rotate-90 transform" viewBox="0 0 300 300">
          {/* Círculo de fondo tenue */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Barra de progreso fluida */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            className={`${colorStyles.ring} transition-all duration-500 ease-out`}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Contenido Central: Tiempo Digital y Reloj de Arena Visual */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* Reloj de Arena SVG estilizado */}
          <div className="relative mb-2 opacity-90">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-slate-400 ${status === 'running' ? 'animate-pulse-slow' : ''}`}
            >
              {/* Vidrio del reloj */}
              <path d="M5 22h14" />
              <path d="M5 2h14" />
              <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
              <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
              {/* Arena cayendo */}
              {status === 'running' && (
                <circle cx="12" cy="14" r="1" className={`${colorStyles.sand} animate-ping`} />
              )}
            </svg>
          </div>

          {/* Contador numérico de alto contraste */}
          <span
            className={`font-mono font-black text-5xl tracking-tight ${colorStyles.text} select-none drop-shadow-md`}
          >
            {formattedTime}
          </span>

          {/* Subtítulo dinámico para mitigar la ceguera temporal */}
          <span className="text-xs text-slate-400 mt-2 text-center max-w-[200px] px-2 font-medium">
            {description}
          </span>
        </div>
      </div>

      {/* Barra de progreso lineal complementaria para estimación visual instantánea */}
      <div className="w-full bg-slate-800/80 rounded-full h-2.5 my-6 overflow-hidden border border-slate-700/50">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            color === 'green' ? 'bg-emerald-500' : color === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
          }`}
          style={{ width: `${percentageRemaining}%` }}
        />
      </div>

      {/* Controles de Acción Inmediata */}
      <div className="flex items-center justify-center gap-3 w-full mt-1">
        {/* Reiniciar */}
        <button
          onClick={onReset}
          type="button"
          title="Reiniciar temporizador"
          className="p-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Botón Principal: Play / Pausa */}
        <button
          onClick={status === 'running' ? onPause : onStart}
          type="button"
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-bold text-base shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${colorStyles.btnPrimary}`}
        >
          {status === 'running' ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              Pausar Foco
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              {status === 'paused' ? 'Reanudar' : 'Comenzar'}
            </>
          )}
        </button>

        {/* Botón de Emergencia Cognitiva: +5 min */}
        <button
          onClick={() => onAddMinutes(5)}
          type="button"
          title="Añadir 5 minutos más de búfer"
          className="flex items-center gap-1 py-3.5 px-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-mono text-sm font-semibold transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          5m
        </button>

        {/* Marcar como concluida */}
        <button
          onClick={onComplete}
          type="button"
          title="Marcar tarea como completada"
          className="p-3.5 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/50 transition-all hover:scale-105 active:scale-95"
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>

      {isUrgent && (
        <div className="mt-4 text-xs font-semibold text-rose-300/90 bg-rose-950/40 border border-rose-900/50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-center">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          Ventana de aterrizaje: Termina lo actual sin abrir nuevos frentes.
        </div>
      )}
    </div>
  );
}
