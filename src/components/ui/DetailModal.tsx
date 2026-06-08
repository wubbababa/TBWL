'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DetailField {
  label: string;
  value: React.ReactNode;
}

interface Props {
  title: string;
  fields: DetailField[];
  onClose: () => void;
}

export function DetailModal({ title, fields, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-[100px_1fr] gap-y-3 gap-x-4 text-sm">
            {fields.map((f, i) => (
              <React.Fragment key={i}>
                <span className="text-gray-500 text-right whitespace-nowrap">{f.label}</span>
                <span className="text-gray-800">{f.value ?? '-'}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">关闭</button>
        </div>
      </div>
    </div>
  );
}
