import React, { useState } from 'react';
import { Sparkles, Wand2, HelpCircle, Check, ArrowRight, X, Send, Copy, Zap, ShieldCheck } from 'lucide-react';
import { askSqlAssistant } from '../lib/geminiSqlHelper';
import { TableSchema } from '../lib/sqliteEngine';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuery: string;
  tables: TableSchema[];
  onApplySql: (sql: string) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  currentQuery,
  tables,
  onApplySql,
}) => {
  const [mode, setMode] = useState<'generate' | 'explain' | 'optimize' | 'fix'>('generate');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ answer: string; suggestedSql?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Schema summary context
  const schemaSummary = tables
    .map(t => `Tabela ${t.name}: colunas (${t.columns.map(c => `${c.name} ${c.type}${c.isPk ? ' PK' : ''}`).join(', ')})`)
    .join('\n');

  const handleAsk = async (customPrompt?: string) => {
    const p = customPrompt || prompt;
    if (!p.trim() && mode === 'generate') return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await askSqlAssistant(p, schemaSummary, currentQuery, mode);
      setResponse(res);
    } catch (err: any) {
      setResponse({
        answer: `Erro ao consultar assistente: ${err?.message || err}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const copySql = (sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const samplePrompts = [
    'Quais os 5 produtos com maior estoque e o nome de sua categoria?',
    'Liste os clientes que gastaram mais de 1000 reais no total.',
    'Calcule a média de salário dos colaboradores por departamento.',
    'Quais pedidos foram cancelados e qual foi o método de pagamento?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Assistente Inteligente SQL</h3>
              <p className="text-[11px] text-purple-200/70">
                Geração em linguagem natural, explicações didáticas e otimização
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-4 gap-1 p-3 bg-slate-950/60 border-b border-slate-800 text-xs font-medium">
          <button
            onClick={() => {
              setMode('generate');
              setResponse(null);
            }}
            className={`py-1.5 px-2 rounded-lg text-center transition ${
              mode === 'generate' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Gerar SQL
          </button>
          <button
            onClick={() => {
              setMode('explain');
              setResponse(null);
            }}
            className={`py-1.5 px-2 rounded-lg text-center transition ${
              mode === 'explain' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Explicar Query
          </button>
          <button
            onClick={() => {
              setMode('optimize');
              setResponse(null);
            }}
            className={`py-1.5 px-2 rounded-lg text-center transition ${
              mode === 'optimize' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Otimizar
          </button>
          <button
            onClick={() => {
              setMode('fix');
              setResponse(null);
            }}
            className={`py-1.5 px-2 rounded-lg text-center transition ${
              mode === 'fix' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Corrigir Erro
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {mode === 'generate' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Descreva em português a consulta que deseja construir:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Mostre os 3 produtos mais caros com o nome de sua categoria..."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAsk()}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleAsk()}
                  disabled={loading || !prompt.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </div>

              {/* Sample Suggestions */}
              <div className="mt-3">
                <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
                  Sugestões Rápidas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {samplePrompts.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setPrompt(s);
                        handleAsk(s);
                      }}
                      className="text-[11px] text-slate-400 hover:text-indigo-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-indigo-500/50 transition text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(mode === 'explain' || mode === 'optimize') && (
            <div>
              <span className="block text-slate-300 font-semibold mb-1">
                Consulta Ativa a ser Analisada:
              </span>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-cyan-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                {currentQuery || '-- Nenhuma query no editor no momento.'}
              </pre>
              <button
                onClick={() => handleAsk(currentQuery)}
                disabled={loading || !currentQuery.trim()}
                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{mode === 'explain' ? 'Explicar Consulta Agora' : 'Analisar Otimização Agora'}</span>
              </button>
            </div>
          )}

          {mode === 'fix' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Descreva o erro ou comportamento inesperado:
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Ocorreu erro no column name, ou o resultado veio vazio..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 mb-2"
              />
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-400 max-h-28 overflow-y-auto whitespace-pre-wrap">
                {currentQuery}
              </pre>
              <button
                onClick={() => handleAsk()}
                disabled={loading}
                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold disabled:opacity-50 transition"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Diagnosticar e Corrigir</span>
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="p-8 text-center text-purple-300 flex flex-col items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 animate-spin text-purple-400" />
              <span className="text-xs">Processando com conhecimento SQL...</span>
            </div>
          )}

          {/* Assistant Response Box */}
          {response && (
            <div className="bg-slate-950 border border-indigo-500/40 rounded-xl p-4 shadow-inner space-y-3">
              <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {response.answer}
              </div>

              {response.suggestedSql && (
                <div className="border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-emerald-400 text-[11px] flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Consulta Sugerida:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copySql(response.suggestedSql!)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                      <button
                        onClick={() => {
                          onApplySql(response.suggestedSql!);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-[11px] text-white font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition shadow"
                      >
                        <ArrowRight className="w-3 h-3" />
                        <span>Aplicar no Editor</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-cyan-300 overflow-x-auto border border-slate-800">
                    {response.suggestedSql}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
