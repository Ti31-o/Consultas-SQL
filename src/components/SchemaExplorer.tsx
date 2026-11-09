import React, { useState } from 'react';
import { Table, Key, Link2, ChevronRight, ChevronDown, Search, Plus, Eye, Database, Code2, X } from 'lucide-react';
import { TableSchema } from '../lib/sqliteEngine';

interface SchemaExplorerProps {
  tables: TableSchema[];
  onSelectTableQuery: (tableName: string) => void;
  onInsertSampleRow: (tableName: string) => void;
  onViewDdl: (tableName: string, ddl: string) => void;
  isLoading?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SchemaExplorer: React.FC<SchemaExplorerProps> = ({
  tables,
  onSelectTableQuery,
  onInsertSampleRow,
  onViewDdl,
  isLoading,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>(() => {
    // Expand first 2 tables by default
    const initial: Record<string, boolean> = {};
    tables.slice(0, 2).forEach(t => {
      initial[t.name] = true;
    });
    return initial;
  });

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  const filteredTables = tables.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.columns.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const content = (
    <div className="w-72 md:w-64 lg:w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-200 select-none shadow-xl md:shadow-none">
      {/* Search Bar */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tabelas & Esquema ({tables.length})</span>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Filtrar tabelas ou colunas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Tables Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
        {isLoading ? (
          <div className="p-4 text-center text-slate-500 text-xs">
            Carregando esquema...
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs">
            Nenhuma tabela encontrada.
          </div>
        ) : (
          filteredTables.map(table => {
            const isExpanded = !!expandedTables[table.name];
            return (
              <div
                key={table.name}
                className="rounded-lg border border-slate-800/50 bg-slate-950/40 overflow-hidden"
              >
                {/* Table Header */}
                <div
                  className="flex items-center justify-between p-2 hover:bg-slate-800/60 transition cursor-pointer group"
                  onClick={() => toggleTable(table.name)}
                >
                  <div className="flex items-center gap-2 truncate">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <Table className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="font-medium text-slate-200 truncate">
                      {table.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                      {table.rowCount} {table.rowCount === 1 ? 'linha' : 'linhas'}
                    </span>

                    {/* Quick Query Button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectTableQuery(table.name);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      title={`SELECT * FROM ${table.name} LIMIT 50`}
                      className="p-1 rounded hover:bg-indigo-600/30 text-slate-400 hover:text-indigo-300 transition cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                    </button>

                    {/* View DDL */}
                    {table.sql && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onViewDdl(table.name, table.sql || '');
                        }}
                        title="Ver DDL (CREATE TABLE)"
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                      >
                        <Code2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Columns List (When Expanded) */}
                {isExpanded && (
                  <div className="border-t border-slate-800/60 bg-slate-950/80 px-2 py-1.5 space-y-1">
                    {table.columns.map(col => {
                      const fk = table.foreignKeys.find(f => f.fromColumn === col.name);
                      return (
                        <div
                          key={col.name}
                          className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-900 text-[11px] group"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {col.isPk ? (
                              <span title="Chave Primária (PK)">
                                <Key className="w-3 h-3 text-amber-400 shrink-0" />
                              </span>
                            ) : fk ? (
                              <span title={`Chave Estrangeira -> ${fk.toTable}.${fk.toColumn}`}>
                                <Link2 className="w-3 h-3 text-sky-400 shrink-0" />
                              </span>
                            ) : (
                              <span className="w-3 h-3 inline-block" />
                            )}
                            <span className={col.isPk ? 'font-semibold text-amber-200' : 'text-slate-300'}>
                              {col.name}
                            </span>
                            {col.notNull && (
                              <span className="text-[9px] text-rose-400 font-bold" title="NOT NULL">*</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {fk && (
                              <span className="text-[9px] text-sky-300/80 bg-sky-950/60 border border-sky-800/40 px-1 rounded">
                                → {fk.toTable}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-500">
                              {col.type}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-1 mt-1 border-t border-slate-800/40 flex items-center justify-between">
                      <button
                        onClick={() => {
                          onInsertSampleRow(table.name);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 py-0.5 hover:underline cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        Inserir Linha
                      </button>
                      <button
                        onClick={() => {
                          onSelectTableQuery(table.name);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 py-0.5 cursor-pointer"
                      >
                        Abrir Consulta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop view */}
      <div className="hidden md:flex h-full">
        {content}
      </div>

      {/* Mobile Drawer view */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 h-full animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
