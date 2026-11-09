import React, { useState } from 'react';
import { BookOpen, Search, Play, ArrowRight, Copy, Check, X, Filter } from 'lucide-react';
import { EXAMPLE_QUERIES, ExampleQuery } from '../data/exampleQueries';

interface ExampleQueriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadQuery: (sql: string, executeImmediately?: boolean) => void;
  currentDbId: string;
}

export const ExampleQueriesModal: React.FC<ExampleQueriesModalProps> = ({
  isOpen,
  onClose,
  onLoadQuery,
  currentDbId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['Todas', 'Vendas & Faturamento', 'Clientes & CRM', 'Produtos & Estoque', 'RH & Performance', 'Avançadas & Window Functions'];

  const filteredQueries = EXAMPLE_QUERIES.filter(item => {
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sql.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDifficultyBadge = (diff: ExampleQuery['difficulty']) => {
    switch (diff) {
      case 'Básico':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Intermediário':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Avançado':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Galeria de Consultas SQL de Exemplo</h3>
              <p className="text-[11px] text-slate-400">
                Queries testadas e prontas para análise de vendas, clientes, estoque e métricas avançadas
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

        {/* Search & Category Filter */}
        <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por palavras-chave (ex: ticket médio, estoque, clientes)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Chips Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Queries List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredQueries.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Nenhuma consulta encontrada para os termos pesquisados.
            </div>
          ) : (
            filteredQueries.map(item => (
              <div
                key={item.id}
                className="bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 transition shadow-sm space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDifficultyBadge(item.difficulty)}`}>
                      {item.difficulty}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(item.id, item.sql)}
                      className="p-1 px-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs border border-slate-800 flex items-center gap-1"
                      title="Copiar SQL"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">Copiar</span>
                    </button>

                    <button
                      onClick={() => {
                        onLoadQuery(item.sql, false);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs border border-slate-700 flex items-center gap-1 font-medium transition cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Abrir no Editor</span>
                    </button>

                    <button
                      onClick={() => {
                        onLoadQuery(item.sql, true);
                        onClose();
                      }}
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition shadow cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Executar</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-slate-100">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                </div>

                <div className="relative">
                  <pre className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-cyan-300 border border-slate-800/80 overflow-x-auto whitespace-pre-wrap max-h-40">
                    {item.sql}
                  </pre>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
