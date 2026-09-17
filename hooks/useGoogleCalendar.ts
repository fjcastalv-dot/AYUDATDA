'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoogleCalendarEvent, Task } from '@/types/task';

// Declaración de tipos para Google Identity Services global
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: unknown }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

export function useGoogleCalendar() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [todayEvents, setTodayEvents] = useState<GoogleCalendarEvent[]>([]);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const isConfigured = Boolean(clientId && clientId !== 'tu_cliente_id_aqui.apps.googleusercontent.com');

  // Recuperar token previo de sessionStorage si existe
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = window.sessionStorage.getItem('gcal_access_token');
      if (savedToken) {
        setAccessToken(savedToken);
      }
    }
  }, []);

  // Iniciar sesión con Google Identity Services
  const login = useCallback(() => {
    if (!isConfigured) {
      setError('Falta configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID en .env.local');
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      setError('El script de Google Identity Services aún se está cargando. Intenta de nuevo en unos segundos.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email',
        callback: async (tokenResponse) => {
          if (tokenResponse.error || !tokenResponse.access_token) {
            setError('No se pudo autenticar con Google');
            setIsLoading(false);
            return;
          }

          const token = tokenResponse.access_token;
          setAccessToken(token);
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('gcal_access_token', token);
          }

          // Obtener información del usuario
          try {
            const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              setUserEmail(userData.email || 'Conectado');
            }
          } catch {
            setUserEmail('Usuario Conectado');
          }

          setIsLoading(false);
        },
      });

      client.requestAccessToken();
    } catch (err) {
      console.error('Error al inicializar token client:', err);
      setError('Error al conectar con los servicios de Google');
      setIsLoading(false);
    }
  }, [clientId, isConfigured]);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUserEmail(null);
    setTodayEvents([]);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('gcal_access_token');
    }
  }, []);

  // Obtener eventos del día de hoy para sincronización
  const fetchTodayEvents = useCallback(async () => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
      url.searchParams.append('timeMin', startOfDay.toISOString());
      url.searchParams.append('timeMax', endOfDay.toISOString());
      url.searchParams.append('singleEvents', 'true');
      url.searchParams.append('orderBy', 'startTime');

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 401) {
        logout();
        setError('La sesión de Google expiró. Vuelve a conectar.');
        return;
      }

      if (!response.ok) {
        throw new Error(`Error en API de Calendar: ${response.statusText}`);
      }

      const data = await response.json();
      const events: GoogleCalendarEvent[] = (data.items || []).map((item: {
        id: string;
        summary?: string;
        description?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
      }) => ({
        id: item.id,
        summary: item.summary || '(Sin título)',
        description: item.description || '',
        start: {
          dateTime: item.start?.dateTime || `${item.start?.date}T09:00:00Z` || new Date().toISOString(),
        },
        end: {
          dateTime: item.end?.dateTime || `${item.end?.date}T10:00:00Z` || new Date().toISOString(),
        },
      }));

      setTodayEvents(events);
    } catch (err) {
      console.error('Error al obtener eventos de Google Calendar:', err);
      setError('No se pudieron obtener los eventos de hoy');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, logout]);

  // Crear evento de foco con búfer de descompresión automático
  const scheduleTaskWithBuffer = useCallback(
    async (task: Task, bufferMinutesOverride?: number): Promise<{ success: boolean; eventId?: string; error?: string }> => {
      if (!accessToken) {
        return { success: false, error: 'Debes iniciar sesión con Google para agendar en tu calendario' };
      }

      const bufferMinutes = bufferMinutesOverride ?? task.bufferMinutes ?? 10;
      const now = new Date();
      const taskEnd = new Date(now.getTime() + task.durationMinutes * 60 * 1000);
      const bufferEnd = new Date(taskEnd.getTime() + bufferMinutes * 60 * 1000);

      const description = `🎯 BLOQUE DE FOCO TDAH\n\n` +
        `• Tarea: ${task.title}\n` +
        `• Definición de Terminado: ${task.definitionOfDone}\n` +
        `• Duración de foco: ${task.durationMinutes} minutos\n` +
        `• Búfer de descompresión: ${bufferMinutes} minutos (hasta ${bufferEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})\n\n` +
        `🛡️ Agendado con TDAH Focus Shield.`;

      try {
        setIsLoading(true);

        // Creamos el evento principal que incluye el tiempo de la tarea y explicita el búfer
        const eventBody = {
          summary: `🎯 [FOCO] ${task.title}`,
          description,
          start: {
            dateTime: now.toISOString(),
          },
          end: {
            dateTime: bufferEnd.toISOString(),
          },
          colorId: '10', // Color verde esmeralda / albahaca en Google Calendar
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 5 },
            ],
          },
        };

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventBody),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || response.statusText);
        }

        const createdEvent = await response.json();
        return { success: true, eventId: createdEvent.id };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error desconocido al crear evento';
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  return {
    accessToken,
    userEmail,
    isSignedIn: Boolean(accessToken),
    isConfigured,
    isLoading,
    error,
    todayEvents,
    login,
    logout,
    fetchTodayEvents,
    scheduleTaskWithBuffer,
  };
}
