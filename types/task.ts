export type TaskStatus = 'pending' | 'active' | 'completed';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export type TrafficColor = 'green' | 'yellow' | 'red';

export interface Task {
  id: string;
  title: string;
  description?: string;
  /** Criterio concreto e indiscutible para dar la tarea por terminada (evita bucles y perfeccionismo TDAH) */
  definitionOfDone: string;
  /** Duración total fijada en minutos */
  durationMinutes: number;
  /** Segundos que quedan por ejecutar */
  remainingSeconds: number;
  /** Estado operativo de la tarea */
  status: TaskStatus;
  /** Categoría opcional para agrupar */
  category?: string;
  /** Búfer de descompresión en minutos posterior a la tarea (ej. 5 o 10 min) */
  bufferMinutes: number;
  /** Fecha ISO de creación */
  createdAt: string;
  /** Fecha ISO de finalización */
  completedAt?: string;
  /** ID del evento en Google Calendar si fue sincronizado */
  calendarEventId?: string;
}

export interface ParkingItem {
  id: string;
  /** Pensamiento intrusivo o idea que se aparca para no romper el hiperfoco */
  content: string;
  /** Fecha y hora ISO de captura rápida */
  createdAt: string;
  /** Estado de la idea aparcada */
  status: 'parked' | 'converted' | 'dismissed';
}

export interface TrafficLightState {
  color: TrafficColor;
  label: string;
  description: string;
  percentageRemaining: number;
  formattedTime: string;
  isUrgent: boolean;
}

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
}

export interface UserSettings {
  defaultDurationMinutes: number;
  defaultBufferMinutes: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}
