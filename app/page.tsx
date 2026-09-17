'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Task, ParkingItem } from '@/types/task';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useHourglassTimer } from '@/hooks/useHourglassTimer';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useDocumentPip } from '@/hooks/useDocumentPip';
import { requestNotificationPermission } from '@/lib/audio';

import { Navbar } from '@/components/Navbar';
import { SingleTaskView } from '@/components/SingleTaskView';
import { ParkingLotModal } from '@/components/ParkingLotModal';
import { CalendarSyncPanel } from '@/components/CalendarSyncPanel';
import { TaskManagerModal } from '@/components/TaskManagerModal';
import { FloatingPipWidget } from '@/components/FloatingPipWidget';

// Tareas iniciales de ejemplo si es la primera vez que se abre la app
const INITIAL_TASKS: Task[] = [
  {
    id: 'demo-task-1',
    title: 'Redactar informe ejecutivo semanal',
    description: 'Enfocarse únicamente en los 3 logros principales y los bloqueos.',
    definitionOfDone: 'Documento exportado en PDF y enviado sin repasar formato más de una vez.',
    durationMinutes: 25,
    remainingSeconds: 25 * 60,
    status: 'active',
    bufferMinutes: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-task-2',
    title: 'Revisión y depuración de bugs críticos',
    definitionOfDone: 'Corregir el error de autenticación y verificar en ambiente local.',
    durationMinutes: 45,
    remainingSeconds: 45 * 60,
    status: 'pending',
    bufferMinutes: 10,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_PARKING: ParkingItem[] = [
  {
    id: 'demo-parking-1',
    content: 'Revisar si hay que actualizar la versión de Tailwind en otro proyecto',
    createdAt: new Date().toISOString(),
    status: 'parked',
  },
];

export default function HomePage() {
  // Persistencia local en localStorage con fallback
  const [tasks, setTasks] = useLocalStorage<Task[]>('tdah_tasks_v1', INITIAL_TASKS);
  const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>('tdah_active_id_v1', 'demo-task-1');
  const [parkingItems, setParkingItems] = useLocalStorage<ParkingItem[]>('tdah_parking_v1', INITIAL_PARKING);
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('tdah_sound_enabled', true);

  // Estados de apertura de modales
  const [isParkingLotOpen, setIsParkingLotOpen] = useState(false);
  const [isCalendarSyncOpen, setIsCalendarSyncOpen] = useState(false);
  const [isTaskManagerOpen, setIsTaskManagerOpen] = useState(false);

  // Hook para la Ventana Flotante Siempre Visible (Picture-in-Picture)
  const { isPipActive, pipContainer, openPip, closePip } = useDocumentPip();

  // Módulo de Google Calendar
  const {
    isSignedIn,
    userEmail,
    isConfigured,
    isLoading: isCalendarLoading,
    error: calendarError,
    todayEvents,
    login: loginCalendar,
    logout: logoutCalendar,
    fetchTodayEvents,
    scheduleTaskWithBuffer,
  } = useGoogleCalendar();

  // Tarea activa calculada
  const activeTask = useMemo(() => {
    return tasks.find((t) => t.id === activeTaskId && t.status !== 'completed') || null;
  }, [tasks, activeTaskId]);

  // Manejador al terminar el temporizador
  const handleTimerComplete = useCallback(() => {
    // Si la tarea concluye el tiempo
  }, []);

  // Hook de temporizador semáforo
  const {
    status: timerStatus,
    trafficState,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
    addMinutes,
  } = useHourglassTimer({
    initialMinutes: activeTask ? activeTask.durationMinutes : 25,
    taskTitle: activeTask?.title || 'Bloque de Foco',
    onComplete: handleTimerComplete,
    soundEnabled,
  });

  // Atajo global de teclado: Ctrl + Space o Cmd + K para el Parking Lot
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Atajo Ctrl+Espacio o Cmd+Espacio
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        setIsParkingLotOpen((prev) => !prev);
      }
      // Atajo complementario Ctrl+K o Cmd+K
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsParkingLotOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Solicitar permiso de notificaciones una vez interactuado
  useEffect(() => {
    const handleFirstInteraction = () => {
      requestNotificationPermission();
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction, { once: true });
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, []);

  // Acciones sobre tareas
  const handleSelectActiveTask = useCallback(
    (taskId: string) => {
      setActiveTaskId(taskId);
      const target = tasks.find((t) => t.id === taskId);
      if (target) {
        resetTimer(target.durationMinutes);
      }
    },
    [setActiveTaskId, tasks, resetTimer]
  );

  const handleCreateTask = useCallback(
    (newTaskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
      const newTask: Task = {
        ...newTaskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      setTasks((prev) => [...prev, newTask]);

      // Si no había tarea activa, activar esta
      if (!activeTaskId) {
        setActiveTaskId(newTask.id);
        resetTimer(newTask.durationMinutes);
      }
    },
    [setTasks, activeTaskId, setActiveTaskId, resetTimer]
  );

  const handleCompleteTask = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: 'completed', completedAt: new Date().toISOString() }
            : t
        )
      );

      // Buscar siguiente tarea pendiente
      const remainingPending = tasks.filter((t) => t.id !== taskId && t.status !== 'completed');
      if (remainingPending.length > 0) {
        setActiveTaskId(remainingPending[0].id);
        resetTimer(remainingPending[0].durationMinutes);
      } else {
        setActiveTaskId(null);
        resetTimer(25);
      }
    },
    [setTasks, tasks, setActiveTaskId, resetTimer]
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (activeTaskId === taskId) {
        const remaining = tasks.filter((t) => t.id !== taskId && t.status !== 'completed');
        if (remaining.length > 0) {
          setActiveTaskId(remaining[0].id);
          resetTimer(remaining[0].durationMinutes);
        } else {
          setActiveTaskId(null);
          resetTimer(25);
        }
      }
    },
    [setTasks, activeTaskId, tasks, setActiveTaskId, resetTimer]
  );

  // Acciones sobre el Parking Lot
  const handleAddParkingItem = useCallback(
    (content: string) => {
      const newItem: ParkingItem = {
        id: `parking-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        content,
        createdAt: new Date().toISOString(),
        status: 'parked',
      };
      setParkingItems((prev) => [newItem, ...prev]);
    },
    [setParkingItems]
  );

  const handleDeleteParkingItem = useCallback(
    (id: string) => {
      setParkingItems((prev) => prev.filter((item) => item.id !== id));
    },
    [setParkingItems]
  );

  const handleConvertParkingToTask = useCallback(
    (item: ParkingItem) => {
      handleCreateTask({
        title: item.content,
        definitionOfDone: 'Realizar la acción concreta y cerrar el tema sin ramificaciones.',
        durationMinutes: 20,
        remainingSeconds: 20 * 60,
        bufferMinutes: 10,
      });

      // Marcar item como convertido
      setParkingItems((prev) =>
        prev.map((pi) => (pi.id === item.id ? { ...pi, status: 'converted' } : pi))
      );
    },
    [handleCreateTask, setParkingItems]
  );

  // Agendar tarea activa en Google Calendar con búfer
  const handleScheduleActiveTask = useCallback(
    async (bufferMinutes: number) => {
      if (!activeTask) {
        return { success: false, error: 'No hay tarea activa seleccionada' };
      }
      return await scheduleTaskWithBuffer(activeTask, bufferMinutes);
    },
    [activeTask, scheduleTaskWithBuffer]
  );

  // Importar evento de Google Calendar como tarea de foco
  const handleImportEventAsTask = useCallback(
    (event: { summary: string; description?: string; start: { dateTime: string }; end: { dateTime: string } }, bufferMinutes: number) => {
      const start = new Date(event.start.dateTime).getTime();
      const end = new Date(event.end.dateTime).getTime();
      const durationMin = Math.max(15, Math.min(120, Math.round((end - start) / (1000 * 60))));

      handleCreateTask({
        title: event.summary,
        description: event.description || 'Importado desde Google Calendar',
        definitionOfDone: 'Concluir el objetivo principal agendado en la reunión o sesión de trabajo.',
        durationMinutes: durationMin,
        remainingSeconds: durationMin * 60,
        bufferMinutes: bufferMinutes || 10,
      });

      setIsCalendarSyncOpen(false);
    },
    [handleCreateTask]
  );

  const parkedCount = parkingItems.filter((p) => p.status === 'parked').length;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Barra de Navegación Superior */}
      <Navbar
        parkedCount={parkedCount}
        onOpenParkingLot={() => setIsParkingLotOpen(true)}
        onOpenTaskManager={() => setIsTaskManagerOpen(true)}
        onOpenCalendarSync={() => setIsCalendarSyncOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        isCalendarConnected={isSignedIn}
        isPipActive={isPipActive}
        onTogglePip={() => (isPipActive ? closePip() : openPip())}
      />

      {/* Contenedor Principal: Vista de Foco Único */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center">
        <SingleTaskView
          task={activeTask}
          timerStatus={timerStatus}
          trafficState={trafficState}
          onStartTimer={startTimer}
          onPauseTimer={pauseTimer}
          onResetTimer={() => resetTimer(activeTask?.durationMinutes)}
          onAddMinutes={addMinutes}
          onCompleteTask={handleCompleteTask}
          onOpenParkingLot={() => setIsParkingLotOpen(true)}
          onOpenCalendarSync={() => setIsCalendarSyncOpen(true)}
          onOpenTaskManager={() => setIsTaskManagerOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          isPipActive={isPipActive}
          onTogglePip={() => (isPipActive ? closePip() : openPip())}
        />
      </div>

      {/* Renderizado en Ventanita Flotante Nativa (Always-on-Top / Picture-in-Picture) */}
      {pipContainer &&
        createPortal(
          <FloatingPipWidget
            task={activeTask}
            timerStatus={timerStatus}
            trafficState={trafficState}
            onStartTimer={startTimer}
            onPauseTimer={pauseTimer}
            onAddMinutes={addMinutes}
            onCompleteTask={handleCompleteTask}
            onAddParkingItem={handleAddParkingItem}
          />,
          pipContainer
        )}

      {/* Modal: Parking Lot de Ideas / Bloc de Estacionamiento */}
      <ParkingLotModal
        isOpen={isParkingLotOpen}
        onClose={() => setIsParkingLotOpen(false)}
        items={parkingItems}
        onAddItem={handleAddParkingItem}
        onDeleteItem={handleDeleteParkingItem}
        onConvertToTask={handleConvertParkingToTask}
      />

      {/* Modal: Gestión de Tareas y Definición de Terminado */}
      <TaskManagerModal
        isOpen={isTaskManagerOpen}
        onClose={() => setIsTaskManagerOpen(false)}
        tasks={tasks}
        activeTaskId={activeTaskId}
        onSelectActiveTask={handleSelectActiveTask}
        onCreateTask={handleCreateTask}
        onDeleteTask={handleDeleteTask}
        onCompleteTask={handleCompleteTask}
      />

      {/* Modal: Integración con Google Calendar y Búfers */}
      <CalendarSyncPanel
        isOpen={isCalendarSyncOpen}
        onClose={() => setIsCalendarSyncOpen(false)}
        activeTask={activeTask}
        isSignedIn={isSignedIn}
        userEmail={userEmail}
        isConfigured={isConfigured}
        isLoading={isCalendarLoading}
        error={calendarError}
        todayEvents={todayEvents}
        onLogin={loginCalendar}
        onLogout={logoutCalendar}
        onFetchEvents={fetchTodayEvents}
        onScheduleActiveTask={handleScheduleActiveTask}
        onImportEventAsTask={handleImportEventAsTask}
      />

      {/* Barra de atajo rápido inferior sutil */}
      <footer className="py-3 px-4 border-t border-slate-900 bg-slate-950/60 text-center text-xs text-slate-400">
        Tip TDAH: Presiona <kbd className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800">Ctrl + Espacio</kbd> para aparcar distracciones o haz clic en <span className="text-emerald-400 font-semibold">📌 Ventanita</span> para fijar el temporizador siempre visible sobre tus otras aplicaciones.
      </footer>
    </main>
  );
}
