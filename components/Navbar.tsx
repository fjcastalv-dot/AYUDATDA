'use client';

import React from 'react';
import { Shield, Lightbulb, Calendar, Layers, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface NavbarProps {
  parkedCount: number;
  onOpenParkingLot: () => void;
  onOpenTaskManager: () => void;
  onOpenCalendarSync: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isCalendarConnected: boolean;
}

export function Navbar({
  parkedCount,
  onOpenParkingLot,
  onOpenTaskManager,
  onOpenCalendarSync,
  soundEnabled,
  onToggleSound,
  isCalendarConnected,
}: NavbarProps) {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Marca */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-black text-base sm:text-lg tracking-tight text-slate-100 flex items-center gap-1.5">
              TDAH <span className="text-emerald-400 font-extrabold">Focus Shield</span>
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 font-medium -mt-1">
              Blindaje contra Time Blindness &amp; Yak Shaving
            </span>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botón Parking Lot */}
          <button
            onClick={onOpenParkingLot}
            type="button"
            className="relative flex items-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
            title="Aparcar ideas (Ctrl + Espacio)"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Parking Lot</span>
            {parkedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black">
                {parkedCount}
              </span>
            )}
            <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 text-[9px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
              Ctrl+Space
            </kbd>
          </button>

          {/* Botón Lista de Tareas */}
          <button
            onClick={onOpenTaskManager}
            type="button"
            className="flex items-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            title="Gestor de Tareas"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Tareas</span>
          </button>

          {/* Botón Google Calendar */}
          <button
            onClick={onOpenCalendarSync}
            type="button"
            className="relative flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            title="Google Calendar & Búfers"
          >
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">Calendar</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isCalendarConnected
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                  : 'bg-slate-500'
              }`}
            />
          </button>

          {/* Silenciar / Activar Sonido */}
          <button
            onClick={onToggleSound}
            type="button"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
            title={soundEnabled ? 'Sonido activado' : 'Sonido silenciado'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
