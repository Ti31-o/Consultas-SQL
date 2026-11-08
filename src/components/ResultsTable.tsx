import React, { useState, useMemo } from 'react';
import { Download, Copy, Check, Search, AlertCircle, ChevronLeft, ChevronRight, FileSpreadsheet, FileJson, Table as TableIcon } from 'lucide-react';
import { QueryResult } from '../lib/sqliteEngine';

interface ResultsTableProps {
  result: QueryResult | null;
  onOpenAnalytics?: () => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ result, onOpenAnalytics }) => {
  const [filterText, setFilterText] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

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

  // Filtered values
  const filteredValues = useMemo(() => {
    if (!filterText.trim()) return result.values;
    const lower = filterText.toLowerCase();
    return result.values.filter(row =>
      row.some(val => val !== null && String(val).toLowerCase().includes(lower))
    );
  }, [result.values, filterText]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredValues.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedValues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredValues.slice(start, start + pageSize);
  }, [filteredValues, currentPage, pageSize]);

  // Export functions
  const exportAsCsv = () => {
    const header = result.columns.join(',');
    const rows = result.values.map(row =>
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
    const list = result.values.map(row => {
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
    const rows = result.values
      .slice(0, 100)
      .map(row => `| ${row.map(v => (v === null ? 'NULL' : String(v))).join(' | ')} |`);
    const md = [header, separator, ...rows].join('\n');
    navigator.clipboard.writeText(md);
    setCopiedFormat('md');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Table Header / Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        {/* Left Stats */}
        <div className="flex items-center gap-3 text-slate-300">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{result.values.length} linha(s)</span>
            <span className="text-slate-500">•</span>
            <span>{result.columns.length} coluna(s)</span>
          </div>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
            {result.executionTimeMs} ms
          </span>
        </div>

        {/* Search & Export Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar no resultado..."
              value={filterText}
              onChange={e => {
                setFilterText(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-md pl-7 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition w-36 sm:w-44"
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={exportAsCsv}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Baixar CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={exportAsJson}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Baixar JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          {/* Copy Markdown */}
          <button
            onClick={copyAsMarkdown}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Copiar tabela em Markdown"
          >
            {copiedFormat === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">MD</span>
          </button>
        </div>
      </div>

      {/* Table Scrollable Container */}
      <div className="flex-1 overflow-auto bg-slate-950">
        <table className="w-full border-collapse text-left text-xs font-mono">
          <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold z-10 shadow-sm">
            <tr>
              <th className="py-2 px-3 text-slate-500 border-r border-slate-800/80 w-12 text-center select-none font-sans text-[10px]">
                #
              </th>
              {result.columns.map((col, idx) => (
                <th
                  key={idx}
                  className="py-2 px-3 border-r border-slate-800/80 last:border-r-0 whitespace-nowrap tracking-wide text-slate-200"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {paginatedValues.length === 0 ? (
              <tr>
                <td
                  colSpan={result.columns.length + 1}
                  className="py-8 text-center text-slate-500 font-sans"
                >
                  Nenhuma linha encontrada com o filtro atual.
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
                    <td className="py-1.5 px-3 text-slate-600 border-r border-slate-800/60 text-center select-none text-[10px] font-sans">
                      {globalIndex}
                    </td>
                    {row.map((cell, cellIdx) => {
                      const isNull = cell === null;
                      const isNumber = typeof cell === 'number';
                      return (
                        <td
                          key={cellIdx}
                          className={`py-1.5 px-3 border-r border-slate-800/40 last:border-r-0 whitespace-nowrap ${
                            isNull
                              ? 'text-slate-600 italic font-sans'
                              : isNumber
                              ? 'text-cyan-300'
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
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 select-none">
          <div className="flex items-center gap-2">
            <span>Linhas por página:</span>
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
            <span className="text-slate-500">
              Mostrando {Math.min((currentPage - 1) * pageSize + 1, filteredValues.length)} -{' '}
              {Math.min(currentPage * pageSize, filteredValues.length)} de {filteredValues.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
