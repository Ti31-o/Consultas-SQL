import React, { useState } from 'react';
import { Table, Key, Link2, Search, ZoomIn, ZoomOut, RotateCcw, ArrowRight, Eye } from 'lucide-react';
import { TableSchema } from '../lib/sqliteEngine';

interface VisualErDiagramProps {
  tables: TableSchema[];
  onSelectTable: (tableName: string) => void;
}

export const VisualErDiagram: React.FC<VisualErDiagramProps> = ({ tables, onSelectTable }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(1);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const filteredTables = tables.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Collect all relationships
  const allRelationships = tables.flatMap(t =>
    t.foreignKeys.map(fk => ({
      fromTable: t.name,
      fromCol: fk.fromColumn,
      toTable: fk.toTable,
      toCol: fk.toColumn,
    }))
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Diagram Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Diagrama Entidade-Relacionamento (ER)</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {tables.length} Tabelas • {allRelationships.length} Relações (FK)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar tabela..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition w-40"
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoom(z => Math.max(0.6, z - 0.1))}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              title="Reduzir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[10px] font-mono text-slate-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              title="Resetar Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Relationships Legend Bar */}
      {allRelationships.length > 0 && (
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300 uppercase text-[10px] shrink-0">
            Ligações Detectadas:
          </span>
          {allRelationships.map((rel, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 font-mono text-[10px] shrink-0"
            >
              <span className="text-indigo-300 font-semibold">{rel.fromTable}.{rel.fromCol}</span>
              <ArrowRight className="w-3 h-3 text-cyan-400" />
              <span className="text-emerald-300 font-semibold">{rel.toTable}.{rel.toCol}</span>
            </div>
          ))}
        </div>
      )}

      {/* Canvas Area with Tables Grid */}
      <div className="flex-1 overflow-auto p-6 bg-radial from-slate-900/40 to-slate-950">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          className="transition-transform duration-150 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl"
        >
          {filteredTables.map(table => {
            const isSelected = selectedTable === table.name;
            const outboundFks = table.foreignKeys;
            const inboundFks = allRelationships.filter(r => r.toTable === table.name);

            return (
              <div
                key={table.name}
                onClick={() => setSelectedTable(table.name)}
                className={`bg-slate-900/90 border rounded-2xl overflow-hidden shadow-xl transition cursor-pointer flex flex-col ${
                  isSelected
                    ? 'border-indigo-500 shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Table Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Table className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{table.name}</h4>
                      <p className="text-[10px] text-slate-400">{table.rowCount} registros</p>
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onSelectTable(table.name);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white text-[11px] font-medium transition"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Consultar</span>
                  </button>
                </div>

                {/* Columns List */}
                <div className="p-3 divide-y divide-slate-800/40 flex-1">
                  {table.columns.map(col => {
                    const fk = table.foreignKeys.find(f => f.fromColumn === col.name);
                    return (
                      <div
                        key={col.name}
                        className="py-1.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {col.isPk ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <Key className="w-2.5 h-2.5" />
                              PK
                            </span>
                          ) : fk ? (
                            <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                              <Link2 className="w-2.5 h-2.5" />
                              FK
                            </span>
                          ) : (
                            <span className="w-8" />
                          )}

                          <span className={`font-mono text-xs ${col.isPk ? 'text-amber-200 font-semibold' : 'text-slate-200'}`}>
                            {col.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {fk && (
                            <span className="text-[10px] text-sky-300 bg-sky-950/80 border border-sky-800 px-1.5 py-0.2 rounded font-mono">
                              → {fk.toTable}.{fk.toColumn}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            {col.type}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Table Footer (Relationships summary) */}
                {(outboundFks.length > 0 || inboundFks.length > 0) && (
                  <div className="bg-slate-950/60 p-2.5 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                    {outboundFks.length > 0 && (
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-slate-500">Depende de:</span>
                        {outboundFks.map((fk, i) => (
                          <span key={i} className="text-sky-300 font-semibold">
                            {fk.toTable}
                          </span>
                        ))}
                      </div>
                    )}
                    {inboundFks.length > 0 && (
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-slate-500">Referenciada por:</span>
                        {inboundFks.map((rf, i) => (
                          <span key={i} className="text-emerald-300 font-semibold">
                            {rf.fromTable}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
