import React, { useState } from 'react';
import { Code2, X, Copy, Check } from 'lucide-react';

interface DdlModalProps {
  tableName: string | null;
  ddl: string;
  onClose: () => void;
}

export const DdlModal: React.FC<DdlModalProps> = ({ tableName, ddl, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!tableName) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(ddl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">
              Estrutura DDL (CREATE TABLE): <span className="text-indigo-300 font-mono">{tableName}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 bg-slate-950 flex-1 overflow-y-auto">
          <pre className="p-4 bg-slate-900/90 rounded-xl font-mono text-xs text-cyan-300 border border-slate-800 whitespace-pre-wrap leading-relaxed select-text">
            {ddl}
          </pre>
        </div>

        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar DDL'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
