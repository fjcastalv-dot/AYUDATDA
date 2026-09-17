'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TrafficColor, TrafficLightState, TimerStatus } from '@/types/task';
import { sound, sendDesktopNotification } from '@/lib/audio';

interface UseHourglassTimerOptions {
  initialMinutes: number;
  taskTitle?: string;
  onComplete?: () => void;
  soundEnabled?: boolean;
}

export function useHourglassTimer({
  initialMinutes,
  taskTitle = 'Tarea Activa',
  onComplete,
  soundEnabled = true,
}: UseHourglassTimerOptions) {
  const totalSeconds = Math.max(1, initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(totalSeconds);
  const [status, setStatus] = useState<TimerStatus>('idle');

  // Referencias para evitar desfases causados por el throttling de fondo en navegadores
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousColorRef = useRef<TrafficColor>('green');

  // Sincronizar si cambia initialMinutes mientras está inactivo
  useEffect(() => {
    if (status === 'idle') {
      setRemainingSeconds(Math.max(1, initialMinutes * 60));
    }
  }, [initialMinutes, status]);

  // Cálculo del porcentaje restante (0 a 100)
  const percentageRemaining = Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100));

  // Lógica cromática estricta para TDAH:
  // - Rojo: últimos 5 minutos (<= 300s) o menos
  // - Amarillo: menos del 25% restante (y más de 5 min)
  // - Verde: más del 25% y más de 5 minutos
  let currentColor: TrafficColor = 'green';
  let label = 'Tiempo Holgado';
  let description = 'Zona verde: mantén un ritmo cómodo y enfocado.';
  let isUrgent = false;

  if (remainingSeconds <= 300) {
    currentColor = 'red';
    label = 'Zona de Cierre';
    description = 'Últimos 5 minutos: concluye la definición de terminado.';
    isUrgent = true;
  } else if (percentageRemaining <= 25) {
    currentColor = 'yellow';
    label = 'Aceleración';
    description = 'Menos del 25% restante: prioriza lo esencial.';
    isUrgent = false;
  }

  // Notificación sonora al cambiar de franja cromática hacia amarillo o rojo
  useEffect(() => {
    if (status === 'running' && soundEnabled) {
      if (currentColor !== previousColorRef.current) {
        if (currentColor === 'yellow' || currentColor === 'red') {
          sound.playWarningTone();
        }
      }
    }
    previousColorRef.current = currentColor;
  }, [currentColor, status, soundEnabled]);

  // Limpiar temporizador al desmontar
  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleComplete = useCallback(() => {
    clearCurrentInterval();
    setStatus('completed');
    setRemainingSeconds(0);
    if (soundEnabled) {
      sound.playCompletionTone();
    }
    sendDesktopNotification(
      '¡Bloque de foco concluido!',
      `Has terminado el tiempo para: "${taskTitle}". Revisa tu Definición de Terminado.`
    );
    if (onComplete) {
      onComplete();
    }
  }, [clearCurrentInterval, soundEnabled, taskTitle, onComplete]);

  // Manejo del ciclo de cuenta regresiva
  useEffect(() => {
    if (status === 'running') {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + remainingSeconds * 1000;
      }

      intervalRef.current = setInterval(() => {
        if (!endTimeRef.current) return;
        const now = Date.now();
        const diffInSeconds = Math.ceil((endTimeRef.current - now) / 1000);

        if (diffInSeconds <= 0) {
          handleComplete();
        } else {
          setRemainingSeconds(diffInSeconds);
        }
      }, 250); // Muestreo a 250ms para respuesta fluida sin carga excesiva
    } else {
      clearCurrentInterval();
      endTimeRef.current = null;
    }

    return () => clearCurrentInterval();
  }, [status, remainingSeconds, clearCurrentInterval, handleComplete]);

  // Controladores
  const start = useCallback(() => {
    if (remainingSeconds <= 0) {
      const resetSecs = totalSeconds;
      setRemainingSeconds(resetSecs);
      endTimeRef.current = Date.now() + resetSecs * 1000;
    } else {
      endTimeRef.current = Date.now() + remainingSeconds * 1000;
    }
    setStatus('running');
  }, [remainingSeconds, totalSeconds]);

  const pause = useCallback(() => {
    clearCurrentInterval();
    endTimeRef.current = null;
    setStatus('paused');
  }, [clearCurrentInterval]);

  const toggle = useCallback(() => {
    if (status === 'running') {
      pause();
    } else {
      start();
    }
  }, [status, pause, start]);

  const reset = useCallback(
    (newMinutes?: number) => {
      clearCurrentInterval();
      endTimeRef.current = null;
      setStatus('idle');
      const secs = newMinutes ? Math.max(1, newMinutes * 60) : totalSeconds;
      setRemainingSeconds(secs);
    },
    [clearCurrentInterval, totalSeconds]
  );

  // Búfer de emergencia: añadir minutos (ej. +5 min) sin reiniciar la sesión
  const addMinutes = useCallback(
    (extraMinutes: number) => {
      setRemainingSeconds((prev) => {
        const updated = prev + extraMinutes * 60;
        if (status === 'running') {
          endTimeRef.current = Date.now() + updated * 1000;
        }
        return updated;
      });
      if (soundEnabled) {
        sound.playQuickClick();
      }
    },
    [status, soundEnabled]
  );

  // Formato MM:SS o HH:MM:SS
  const formatTime = (secs: number): string => {
    const totalSec = Math.max(0, Math.floor(secs));
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const trafficState: TrafficLightState = {
    color: currentColor,
    label,
    description,
    percentageRemaining,
    formattedTime: formatTime(remainingSeconds),
    isUrgent,
  };

  return {
    remainingSeconds,
    totalSeconds,
    status,
    trafficState,
    start,
    pause,
    toggle,
    reset,
    addMinutes,
    formatTime,
  };
}
