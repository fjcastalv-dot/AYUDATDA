'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

// Declaración de tipos para la Document Picture-in-Picture API del estándar W3C / Chromium
declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
      window?: Window | null;
    };
  }
}

export function useDocumentPip() {
  const [isPipActive, setIsPipActive] = useState(false);
  const [pipContainer, setPipContainer] = useState<HTMLElement | null>(null);
  const pipWindowRef = useRef<Window | null>(null);

  const isSupported = typeof window !== 'undefined' && Boolean(window.documentPictureInPicture || window.open);

  const copyStylesToWindow = (targetDoc: Document) => {
    // Copiar todos los estilos de Tailwind y fuentes al documento flotante
    const allStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
    allStyles.forEach((el) => {
      targetDoc.head.appendChild(el.cloneNode(true));
    });

    // Inyectar un reset básico y fondo oscuro
    const baseStyle = targetDoc.createElement('style');
    baseStyle.textContent = `
      body {
        margin: 0;
        padding: 0;
        background-color: #020617;
        color: #f8fafc;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }
      * {
        box-sizing: border-box;
      }
    `;
    targetDoc.head.appendChild(baseStyle);
  };

  const closePip = useCallback(() => {
    if (pipWindowRef.current) {
      try {
        pipWindowRef.current.close();
      } catch {
        // Ignorar si ya estaba cerrada
      }
      pipWindowRef.current = null;
    }
    setPipContainer(null);
    setIsPipActive(false);
  }, []);

  const openPip = useCallback(async (width = 340, height = 240) => {
    if (typeof window === 'undefined') return;

    // Si ya está abierta, cerrarla (toggle)
    if (isPipActive && pipWindowRef.current) {
      closePip();
      return;
    }

    try {
      let win: Window | null = null;

      // 1. Prioridad: Document Picture-in-Picture API (Ventana fija por encima de todo el SO en Windows/Mac)
      if ('documentPictureInPicture' in window && window.documentPictureInPicture) {
        win = await window.documentPictureInPicture.requestWindow({
          width,
          height,
        });
      } else {
        // 2. Fallback: Ventana popup independiente
        const left = window.screen.width - width - 20;
        const top = window.screen.height - height - 80;
        win = window.open(
          '',
          'TDAH_Focus_Floating',
          `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
        );
      }

      if (!win) {
        console.warn('No se pudo abrir la ventana flotante (bloqueador de popups activo)');
        return;
      }

      pipWindowRef.current = win;
      win.document.title = '🎯 Foco TDAH | Siempre Visible';

      // Copiar estilos
      copyStylesToWindow(win.document);

      // Crear contenedor para React Portal
      const container = win.document.createElement('div');
      container.id = 'pip-root';
      container.style.width = '100vw';
      container.style.height = '100vh';
      win.document.body.appendChild(container);

      setPipContainer(container);
      setIsPipActive(true);

      // Detectar cuando el usuario cierra la ventana flotante
      win.addEventListener('pagehide', () => {
        setIsPipActive(false);
        setPipContainer(null);
        pipWindowRef.current = null;
      });
    } catch (err) {
      console.error('Error al abrir Picture-in-Picture:', err);
      setIsPipActive(false);
    }
  }, [isPipActive, closePip]);

  // Limpiar al desmontar la app principal
  useEffect(() => {
    return () => {
      closePip();
    };
  }, [closePip]);

  return {
    isPipActive,
    pipContainer,
    isSupported,
    openPip,
    closePip,
  };
}
