'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ParkingItem } from '@/types/task';
import { X, Plus, Trash2, ArrowUpRight, Lightbulb, Clock, Check } from 'lucide-react';
import { sound } from '@/lib/audio';

interface ParkingLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ParkingItem[];
  onAddItem: (content: string) => void;
  onDeleteItem: (id: string) => void;
  onConvertToTask: (item: ParkingItem) => void;
}

export function ParkingLotModal({
  isOpen,
  onClose,
  items,
  onAddItem,
  onDeleteItem,
  onConvertToTask,
}: ParkingLotModalProps) {
  const [content, setContent] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Manejo de atajo Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    onAddItem(trimmed);
    setContent('');
    sound.playQuickClick();
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 1500);
  };

  const activeItems = items.filter((item) => item.status === 'parked');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl shadow-amber-500/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del Modal */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                Parking Lot de Ideas
              </h3>
              <p className="text-xs text-slate-400">
                Aparca pensamientos intrusivos y no caigas en el efecto cascada.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Rápido con captura al dar Enter */}
        <form onSubmit={handleSubmit} className="p-6 pb-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe la idea o distracción que acaba de surgir..."
              className="w-full pl-4 pr-12 py-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
            <button
              type="submit"
              disabled={!content.trim()}
              className="absolute right-2 top-2 p-2 rounded-xl bg-amber-500 text-slate-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400 transition-all"
              title="Aparcar idea"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-2.5 px-1">
            <span className="text-[11px] text-slate-400">
              Presiona <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">Enter</kbd> para aparcar y despejar la mente.
            </span>
            {copiedNotification && (
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 animate-pulse">
                <Check className="w-3 h-3" /> ¡Aparcada a salvo!
              </span>
            )}
          </div>
        </form>

        {/* Listado de Ideas Aparcadas */}
        <div className="px-6 py-2 flex-1 max-h-72 overflow-y-auto space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Aparcadas ({activeItems.length})</span>
            <span className="text-[11px] font-normal text-slate-400">Se revisan al finalizar el bloque</span>
          </div>

          {activeItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Tu mente está despejada. Ninguna idea pendiente por ahora.
            </div>
          ) : (
            activeItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 flex items-center justify-between gap-3 group transition-all"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 break-words">
                    {item.content}
                  </p>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                  {/* Convertir en tarea formal */}
                  <button
                    onClick={() => onConvertToTask(item)}
                    type="button"
                    title="Convertir en tarea formal de la cola"
                    className="p-2 rounded-xl bg-slate-700/50 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-400 border border-slate-600/40 hover:border-emerald-500/30 transition-all text-xs flex items-center gap-1"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Hacer Tarea</span>
                  </button>

                  {/* Descartar / Borrar */}
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    type="button"
                    title="Descartar idea"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pie del modal */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Atajo global: <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-300">Ctrl</kbd> + <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-300">Espacio</kbd>
          </span>
          <button
            onClick={onClose}
            type="button"
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
