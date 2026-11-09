import React, { useState, useMemo } from 'react';
import { 
  Download, Copy, Check, Search, AlertCircle, ChevronLeft, ChevronRight, 
  FileSpreadsheet, FileJson, Table as TableIcon, ArrowUpDown, ArrowUp, ArrowDown, 
  Filter, X, SlidersHorizontal, RotateCcw
} from 'lucide-react';
import { QueryResult } from '../lib/sqliteEngine';

interface ResultsTableProps {
  result: QueryResult | null;
  onOpenAnalytics?: () => void;
}

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  columnIndex: number;
  direction: SortDirection;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ result, onOpenAnalytics }) => {
  const [filterText, setFilterText] = useState('');
  const [selectedColIndex, setSelectedColIndex] = useState<number | 'all'>('all');
  const [exactValueFilter, setExactValueFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minNumericFilter, setMinNumericFilter] = useState<string>('');
  const [maxNumericFilter, setMaxNumericFilter] = useState<string>('');

  // Reset pagination when filter or sort changes
  const handleSort = (colIndex: number) => {
    setSortConfig(current => {
      if (!current || current.columnIndex !== colIndex) {
        return { columnIndex: colIndex, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { columnIndex: colIndex, direction: 'desc' };
      }
      return null; // Reset sort
    });
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilterText('');
    setSelectedColIndex('all');
    setExactValueFilter('');
    setMinNumericFilter('');
    setMaxNumericFilter('');
    setSortConfig(null);
    setPage(1);
  };

  // Distinct values for currently selected column (for quick categorical filtering)
  const distinctValuesForSelectedCol = useMemo(() => {
    if (!result || selectedColIndex === 'all') return [];
    const set = new Set<string>();
    result.values.forEach(row => {
      const val = row[selectedColIndex];
      if (val !== null && val !== undefined) {
        set.add(String(val));
      }
    });
    const arr = Array.from(set);
    return arr.length <= 35 ? arr.sort() : [];
  }, [result, selectedColIndex]);

  // Is selected column numeric?
  const isSelectedColNumeric = useMemo(() => {
    if (!result || selectedColIndex === 'all') return false;
    return result.values.some(row => typeof row[selectedColIndex] === 'number');
  }, [result, selectedColIndex]);

  // 1. Filtered and Sorted Values
  const processedValues = useMemo(() => {
    if (!result || result.values.length === 0) return [];

    let filtered = result.values;

    // Filter by text search
    if (filterText.trim()) {
      const lower = filterText.toLowerCase();
      filtered = filtered.filter(row => {
        if (selectedColIndex === 'all') {
          return row.some(val => val !== null && String(val).toLowerCase().includes(lower));
        } else {
          const val = row[selectedColIndex];
          return val !== null && String(val).toLowerCase().includes(lower);
        }
      });
    }

    // Filter by exact distinct value
    if (exactValueFilter && selectedColIndex !== 'all') {
      filtered = filtered.filter(row => String(row[selectedColIndex]) === exactValueFilter);
    }

    // Filter by min numeric
    if (minNumericFilter !== '' && selectedColIndex !== 'all') {
      const minVal = parseFloat(minNumericFilter);
      if (!isNaN(minVal)) {
        filtered = filtered.filter(row => {
          const val = Number(row[selectedColIndex]);
          return !isNaN(val) && val >= minVal;
        });
      }
    }

    // Filter by max numeric
    if (maxNumericFilter !== '' && selectedColIndex !== 'all') {
      const maxVal = parseFloat(maxNumericFilter);
      if (!isNaN(maxVal)) {
        filtered = filtered.filter(row => {
          const val = Number(row[selectedColIndex]);
          return !isNaN(val) && val <= maxVal;
        });
      }
    }

    // Sort
    if (sortConfig) {
      const { columnIndex, direction } = sortConfig;
      filtered = [...filtered].sort((rowA, rowB) => {
        const valA = rowA[columnIndex];
        const valB = rowB[columnIndex];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return direction === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return filtered;
  }, [result, filterText, selectedColIndex, exactValueFilter, minNumericFilter, maxNumericFilter, sortConfig]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processedValues.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedValues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedValues.slice(start, start + pageSize);
  }, [processedValues, currentPage, pageSize]);

  const hasActiveFilters = Boolean(
    filterText.trim() ||
    exactValueFilter ||
    minNumericFilter ||
    maxNumericFilter ||
    sortConfig
  );

  // If there's an error
  if (result?.error) {
    return (
      <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-rose-300 mb-1">
          Erro na Execução da Consulta SQL
        </h3>
        <div className="max-w-2xl bg-rose-950/30 border border-rose-900/50 rounded-lg p-3 text-left font-mono text-xs text-rose-200 mt-2 whitespace-pre-wrap select-text">
          {result.error}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Dica: Verifique os nomes das tabelas e colunas, vírgulas faltando ou parênteses não fechados.
        </p>
      </div>
    );
  }

  // If no result yet
  if (!result || (result.columns.length === 0 && !result.rowsAffected)) {
    return (
      <div className="flex-1 bg-slate-950 p-8 flex flex-col items-center justify-center text-center text-slate-500">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-3">
          <TableIcon className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-400">Nenhum resultado para exibir</p>
        <p className="text-xs text-slate-600 mt-1">
          Pressione <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Ctrl+Enter</kbd> ou clique em "Executar" para rodar a query.
        </p>
      </div>
    );
  }

  // Export functions
  const exportAsCsv = () => {
    const header = result.columns.join(',');
    const rows = processedValues.map(row =>
      row
        .map(val => {
          if (val === null) return '';
          const s = String(val).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([header, ...rows].join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `query_resultado_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsJson = () => {
    const list = processedValues.map(row => {
      const obj: Record<string, any> = {};
      result.columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(list, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `query_resultado_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyAsMarkdown = () => {
    const header = `| ${result.columns.join(' | ')} |`;
    const separator = `| ${result.columns.map(() => '---').join(' | ')} |`;
    const rows = processedValues
      .slice(0, 100)
      .map(row => `| ${row.map(v => (v === null ? 'NULL' : String(v))).join(' | ')} |`);
    const md = [header, separator, ...rows].join('\n');
    navigator.clipboard.writeText(md);
    setCopiedFormat('md');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col gap-2 p-2.5 sm:px-3 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left Stats */}
          <div className="flex items-center gap-2 sm:gap-3 text-slate-300">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                {processedValues.length !== result.values.length ? (
                  <span>{processedValues.length} de {result.values.length} linhas</span>
                ) : (
                  <span>{result.values.length} linhas</span>
                )}
              </span>
              <span className="text-slate-500">•</span>
              <span className="hidden sm:inline">{result.columns.length} colunas</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
              {result.executionTimeMs} ms
            </span>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Quick Text Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filtrar dados..."
                value={filterText}
                onChange={e => {
                  setFilterText(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-32 sm:w-44 transition"
              />
            </div>

            {/* Toggle Advanced Filters Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
              }`}
              title="Filtros avançados e ordenação de colunas"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filtros</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>

            {/* Clear Filters (if active) */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 text-xs transition cursor-pointer"
                title="Limpar todos os filtros e resetar ordenação"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Limpar</span>
              </button>
            )}

            {/* Export CSV */}
            <button
              onClick={exportAsCsv}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Baixar CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">CSV</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={exportAsJson}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Baixar JSON"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">JSON</span>
            </button>

            {/* Copy Markdown */}
            <button
              onClick={copyAsMarkdown}
              className="p-1 px-1.5 sm:px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Copiar tabela em Markdown"
            >
              {copiedFormat === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilters && (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2 mt-1">
            <div className="flex flex-wrap items-center gap-3">
              {/* Column Target */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Filtrar Coluna:</span>
                <select
                  value={selectedColIndex}
                  onChange={e => {
                    const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                    setSelectedColIndex(val);
                    setExactValueFilter('');
                    setMinNumericFilter('');
                    setMaxNumericFilter('');
                    setPage(1);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="all">Todas as Colunas</option>
                  {result.columns.map((col, idx) => (
                    <option key={idx} value={idx}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Exact Value Dropdown (if column picked and has <= 35 distinct values) */}
              {distinctValuesForSelectedCol.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Valor exato:</span>
                  <select
                    value={exactValueFilter}
                    onChange={e => {
                      setExactValueFilter(e.target.value);
                      setPage(1);
                    }}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="">Qualquer valor</option>
                    {distinctValuesForSelectedCol.map((v, i) => (
                      <option key={i} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Min/Max numeric range if numeric column */}
              {isSelectedColNumeric && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-slate-400">Faixa:</span>
                  <input
                    type="number"
                    placeholder="Mín"
                    value={minNumericFilter}
                    onChange={e => {
                      setMinNumericFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
                  />
                  <span className="text-slate-600">-</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={maxNumericFilter}
                    onChange={e => {
                      setMaxNumericFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
                  />
                </div>
              )}

              {/* Current Active Sort Status */}
              {sortConfig && (
                <div className="flex items-center gap-1 text-[11px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-800">
                  <span>Ordenado por: <strong>{result.columns[sortConfig.columnIndex]}</strong> ({sortConfig.direction.toUpperCase()})</span>
                  <button onClick={() => setSortConfig(null)} className="ml-1 text-indigo-400 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              💡 Dica: Clique diretamente no cabeçalho de qualquer coluna na tabela abaixo para alternar ordenação Crescente (▲) e Decrescente (▼).
            </p>
          </div>
        )}
      </div>

      {/* Table Scrollable Container */}
      <div className="flex-1 overflow-auto bg-slate-950">
        <table className="w-full border-collapse text-left text-xs font-mono">
          <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold z-10 shadow-sm select-none">
            <tr>
              <th className="py-2.5 px-3 text-slate-500 border-r border-slate-800/80 w-12 text-center select-none font-sans text-[10px]">
                #
              </th>
              {result.columns.map((col, idx) => {
                const isSorted = sortConfig?.columnIndex === idx;
                const sortDir = isSorted ? sortConfig?.direction : null;
                return (
                  <th
                    key={idx}
                    onClick={() => handleSort(idx)}
                    className={`py-2.5 px-3 border-r border-slate-800/80 last:border-r-0 whitespace-nowrap tracking-wide cursor-pointer transition group hover:bg-slate-800 ${
                      isSorted ? 'bg-indigo-950/60 text-indigo-300' : 'text-slate-200'
                    }`}
                    title={`Clique para ordenar por ${col}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{col}</span>
                      <span className="shrink-0">
                        {sortDir === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
                        ) : sortDir === 'desc' ? (
                          <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {paginatedValues.length === 0 ? (
              <tr>
                <td
                  colSpan={result.columns.length + 1}
                  className="py-10 text-center text-slate-500 font-sans"
                >
                  <p className="text-slate-400 font-medium">Nenhum registro encontrado com os filtros atuais.</p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-2 text-indigo-400 hover:underline text-xs"
                  >
                    Limpar filtros
                  </button>
                </td>
              </tr>
            ) : (
              paginatedValues.map((row, rowIdx) => {
                const globalIndex = (currentPage - 1) * pageSize + rowIdx + 1;
                return (
                  <tr
                    key={rowIdx}
                    className="hover:bg-slate-900/60 transition group odd:bg-slate-950 even:bg-slate-900/30"
                  >
                    <td className="py-2 px-3 text-slate-600 border-r border-slate-800/60 text-center select-none text-[10px] font-sans">
                      {globalIndex}
                    </td>
                    {row.map((cell, cellIdx) => {
                      const isNull = cell === null;
                      const isNumber = typeof cell === 'number';
                      const isSortedCol = sortConfig?.columnIndex === cellIdx;
                      return (
                        <td
                          key={cellIdx}
                          className={`py-2 px-3 border-r border-slate-800/40 last:border-r-0 whitespace-nowrap ${
                            isSortedCol ? 'bg-indigo-950/20' : ''
                          } ${
                            isNull
                              ? 'text-slate-600 italic font-sans'
                              : isNumber
                              ? 'text-cyan-300 font-bold'
                              : 'text-slate-200'
                          }`}
                        >
                          {isNull ? 'NULL' : String(cell)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 select-none gap-2">
          <div className="flex items-center gap-2">
            <span>Linhas:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-slate-500 hidden sm:inline">
              Mostrando {Math.min((currentPage - 1) * pageSize + 1, processedValues.length)} -{' '}
              {Math.min(currentPage * pageSize, processedValues.length)} de {processedValues.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-medium text-slate-300">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
