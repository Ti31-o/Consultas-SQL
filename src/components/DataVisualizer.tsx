import React, { useState, useMemo } from 'react';
import { BarChart3, LineChart, PieChart, TrendingUp, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import { QueryResult } from '../lib/sqliteEngine';

interface DataVisualizerProps {
  result: QueryResult | null;
  onRunSampleAnalytics: () => void;
}

export const DataVisualizer: React.FC<DataVisualizerProps> = ({ result, onRunSampleAnalytics }) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [labelColIndex, setLabelColIndex] = useState<number>(0);
  const [valueColIndex, setValueColIndex] = useState<number>(1);

  // Identify numeric columns
  const numericColumns = useMemo(() => {
    if (!result || result.values.length === 0) return [];
    return result.columns.map((col, idx) => {
      const isNum = result.values.some(row => typeof row[idx] === 'number');
      return { col, idx, isNum };
    }).filter(c => c.isNum);
  }, [result]);

  // Set default value col index if needed
  React.useEffect(() => {
    if (numericColumns.length > 0 && !numericColumns.some(c => c.idx === valueColIndex)) {
      setValueColIndex(numericColumns[0].idx);
    }
  }, [numericColumns, valueColIndex]);

  if (!result || result.values.length === 0 || result.error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
          <BarChart3 className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-1">
          Visualização Gráfica de Consultas SQL
        </h3>
        <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
          Execute uma consulta com agregações (como SUM, COUNT ou AVG agrupadas por categoria, cliente ou departamento) para visualizar gráficos de barras, linhas e proporções instantaneamente.
        </p>
        <button
          onClick={onRunSampleAnalytics}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Carregar e Executar Consulta Analítica de Exemplo</span>
        </button>
      </div>
    );
  }

  // If no numeric column found
  if (numericColumns.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-center">
        <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
        <h3 className="text-sm font-semibold text-slate-200">Nenhuma coluna numérica detectada</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
          Para plotar gráficos, a consulta precisa conter valores numéricos (ex: contagens, preços, salários ou totais).
        </p>
        <button
          onClick={onRunSampleAnalytics}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
        >
          Carregar Consulta com Agregação Numérica
        </button>
      </div>
    );
  }

  // Prepared data
  const data = result.values.slice(0, 15).map(row => ({
    label: String(row[labelColIndex] ?? 'N/A'),
    value: Number(row[valueColIndex] ?? 0),
  }));

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const totalValue = data.reduce((acc, d) => acc + d.value, 0);
  const avgValue = Math.round((totalValue / Math.max(data.length, 1)) * 100) / 100;

  const COLORS = [
    '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899',
    '#8b5cf6', '#3b82f6', '#14b8a6', '#84cc16', '#f43f5e'
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-4 sm:p-6 text-slate-100">
      {/* Controls & Column Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Tipo de Gráfico:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                chartType === 'bar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Barras</span>
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                chartType === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Linhas</span>
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                chartType === 'pie' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Pizza</span>
            </button>
          </div>
        </div>

        {/* Axis Selectors */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Eixo X (Rótulo):</span>
            <select
              value={labelColIndex}
              onChange={e => setLabelColIndex(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              {result.columns.map((c, i) => (
                <option key={i} value={i}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Eixo Y (Métrica):</span>
            <select
              value={valueColIndex}
              onChange={e => setValueColIndex(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              {numericColumns.map(c => (
                <option key={c.idx} value={c.idx}>{c.col}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Acumulado ({result.columns[valueColIndex]})
          </span>
          <div className="text-xl font-bold text-white mt-1">
            {totalValue.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Média por Registro
          </span>
          <div className="text-xl font-bold text-cyan-300 mt-1">
            {avgValue.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Valor Máximo
          </span>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {maxValue.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="flex-1 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center min-h-[360px]">
        {chartType === 'bar' && (
          <div className="space-y-3.5">
            {data.map((item, idx) => {
              const pct = Math.max(4, Math.round((item.value / maxValue) * 100));
              const color = COLORS[idx % COLORS.length];
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 truncate max-w-xs">{item.label}</span>
                    <span className="font-semibold text-slate-100">
                      {item.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      style={{ width: `${pct}%`, backgroundColor: color }}
                      className="h-full rounded-full transition-all duration-500 shadow-sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {chartType === 'line' && (
          <div className="h-64 w-full flex items-end gap-2 pt-6 pb-2">
            {data.map((item, idx) => {
              const heightPct = Math.max(10, Math.round((item.value / maxValue) * 85));
              const color = COLORS[idx % COLORS.length];
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition">
                    {item.value}
                  </span>
                  <div
                    style={{ height: `${heightPct}%`, backgroundColor: color }}
                    className="w-full max-w-[40px] rounded-t-lg transition-all duration-300 shadow-md group-hover:brightness-125"
                  />
                  <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {chartType === 'pie' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* SVG Donut / Pie */}
            <div className="flex justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    let cumulative = 0;
                    return data.map((item, idx) => {
                      const pct = item.value / (totalValue || 1);
                      const dashArray = `${pct * 314.159} 314.159`;
                      const dashOffset = -cumulative * 314.159;
                      cumulative += pct;
                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="35"
                          fill="transparent"
                          stroke={COLORS[idx % COLORS.length]}
                          strokeWidth="20"
                          strokeDasharray={dashArray}
                          strokeDashoffset={dashOffset}
                          className="transition-all duration-300 hover:opacity-90"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400">Total</span>
                  <span className="text-xs font-bold font-mono text-white">
                    {totalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {data.map((item, idx) => {
                const sharePct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : '0';
                return (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="text-slate-300 truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono text-slate-400">
                      <span>{item.value.toLocaleString('pt-BR')}</span>
                      <span className="text-[10px] text-slate-500">({sharePct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
