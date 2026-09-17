'use client';

import React, { useState } from 'react';
import { Task, GoogleCalendarEvent } from '@/types/task';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  LogIn,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';

interface CalendarSyncPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeTask: Task | null;
  isSignedIn: boolean;
  userEmail: string | null;
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
  todayEvents: GoogleCalendarEvent[];
  onLogin: () => void;
  onLogout: () => void;
  onFetchEvents: () => void;
  onScheduleActiveTask: (bufferMinutes: number) => Promise<{ success: boolean; error?: string }>;
  onImportEventAsTask: (event: GoogleCalendarEvent, bufferMinutes: number) => void;
}

export function CalendarSyncPanel({
  isOpen,
  onClose,
  activeTask,
  isSignedIn,
  userEmail,
  isConfigured,
  isLoading,
  error,
  todayEvents,
  onLogin,
  onLogout,
  onFetchEvents,
  onScheduleActiveTask,
  onImportEventAsTask,
}: CalendarSyncPanelProps) {
  const [selectedBuffer, setSelectedBuffer] = useState<number>(10);
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);
  const [schedulingLocal, setSchedulingLocal] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleScheduleTask = async () => {
    if (!activeTask) return;
    setSchedulingLocal(true);
    setScheduleSuccess(null);

    const result = await onScheduleActiveTask(selectedBuffer);
    setSchedulingLocal(false);

    if (result.success) {
      setScheduleSuccess(`¡Bloque agendado con éxito! Se programó con ${selectedBuffer} minutos de búfer de descompresión.`);
      setTimeout(() => setScheduleSuccess(null), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-blue-500/30 shadow-2xl shadow-blue-500/10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                Google Calendar & Blindaje de Búfer
              </h3>
              <p className="text-xs text-slate-400">
                Evita agendar tareas continuas que agoten tu energía ejecutiva.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-100 p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Mensajes de Alerta / Error */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/50 text-rose-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Error de sincronización</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Aviso si falta configuración del Client ID */}
          {!isConfigured && (
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 text-blue-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-blue-300">
                <Info className="w-4 h-4" />
                Modo Local Activo (Sin credenciales de Google aún)
              </div>
              <p className="text-slate-300 leading-relaxed">
                Puedes usar toda la aplicación con persistencia local. Para sincronizar con Google Calendar en tiempo real, añade tu <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> en el archivo <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">.env.local</code>.
              </p>
            </div>
          )}

          {/* Estado de Conexión OAuth */}
          <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isSignedIn ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'bg-slate-500'}`} />
              <div>
                <div className="text-sm font-semibold text-slate-200">
                  {isSignedIn ? 'Conectado a Google Calendar' : 'Cuenta de Google no vinculada'}
                </div>
                <div className="text-xs text-slate-400">
                  {userEmail || 'Inicia sesión para sincronizar bloques con búfer'}
                </div>
              </div>
            </div>

            {isSignedIn ? (
              <button
                onClick={onLogout}
                type="button"
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Desconectar
              </button>
            ) : (
              <button
                onClick={onLogin}
                disabled={!isConfigured || isLoading}
                type="button"
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
              >
                <LogIn className="w-4 h-4" />
                {isLoading ? 'Conectando...' : 'Conectar Google Calendar'}
              </button>
            )}
          </div>

          {/* Configuración de Búfer Cognitivo (5 - 10 - 15 min) */}
          <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Búfer de Transición Automático
              </label>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                +{selectedBuffer} min obligatorios
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              El cerebro con TDAH necesita tiempo para cambiar de contexto. Este búfer se añadirá automáticamente a tu calendario para que nadie agende reuniones pegadas a tu bloque de foco.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {[5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSelectedBuffer(mins)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all flex flex-col items-center gap-1 ${
                    selectedBuffer === mins
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span>{mins} Minutos</span>
                  <span className="text-[10px] font-normal opacity-80">
                    {mins === 5 ? 'Transición leve' : mins === 10 ? 'Recomendado' : 'Descompresión total'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Agendar Tarea Activa */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Tarea Activa a Agendar
              </span>
              {activeTask && (
                <span className="text-xs text-slate-400 font-mono">
                  {activeTask.durationMinutes} min foco + {selectedBuffer} min búfer
                </span>
              )}
            </div>

            {activeTask ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="font-bold text-slate-100 text-sm">{activeTask.title}</div>
                  <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                    Criterio DoD: {activeTask.definitionOfDone}
                  </div>
                </div>

                <button
                  onClick={handleScheduleTask}
                  disabled={!isSignedIn || schedulingLocal}
                  type="button"
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  {schedulingLocal ? 'Agendando...' : 'Agendar ahora en Google Calendar'}
                </button>

                {scheduleSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{scheduleSuccess}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-3 text-center">
                No hay ninguna tarea activa seleccionada para agendar.
              </div>
            )}
          </div>

          {/* Importar Eventos de Hoy de Google Calendar */}
          {isSignedIn && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Eventos de Hoy en Calendar ({todayEvents.length})
                </span>
                <button
                  onClick={onFetchEvents}
                  disabled={isLoading}
                  type="button"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>

              {todayEvents.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs bg-slate-800/20 rounded-2xl border border-slate-800">
                  Haz clic en &ldquo;Actualizar&rdquo; para consultar los eventos agendados para hoy.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {todayEvents.map((evt) => {
                    const startTime = new Date(evt.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endTime = new Date(evt.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={evt.id || evt.summary}
                        className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-200 truncate">{evt.summary}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {startTime} - {endTime}
                          </span>
                        </div>
                        <button
                          onClick={() => onImportEventAsTask(evt, selectedBuffer)}
                          type="button"
                          className="py-1 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all font-semibold text-[11px] shrink-0"
                        >
                          Importar como Foco
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tus datos de calendario solo se procesan en tu navegador.</span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
