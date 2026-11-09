import React, { useMemo, useState } from 'react';
import { sqlEngine } from '../lib/sqliteEngine';
import { TrendingUp, ShoppingBag, CreditCard, DollarSign, Package, PieChart, BarChart3, ArrowUpRight, Code, RefreshCw } from 'lucide-react';

interface SalesAnalyticsProps {
  onOpenQueryInEditor: (sql: string) => void;
}

export const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ onOpenQueryInEditor }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  // 1. Overall Sales Metrics
  const summaryMetrics = useMemo(() => {
    try {
      const res = sqlEngine.execute(`
        SELECT 
          COUNT(id) AS total_pedidos,
          ROUND(COALESCE(SUM(valor_total), 0), 2) AS faturamento_total,
          ROUND(COALESCE(AVG(valor_total), 0), 2) AS ticket_medio,
          SUM(CASE WHEN status = 'entregue' THEN 1 ELSE 0 END) AS pedidos_entregues,
          SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) AS pedidos_cancelados
        FROM pedidos;
      `);
      if (res.values.length > 0) {
        const row = res.values[0];
        return {
          totalPedidos: Number(row[0]) || 0,
          faturamentoTotal: Number(row[1]) || 0,
          ticketMedio: Number(row[2]) || 0,
          pedidosEntregues: Number(row[3]) || 0,
          pedidosCancelados: Number(row[4]) || 0,
        };
      }
    } catch (e) {
      console.warn('Error loading summary metrics:', e);
    }
    return { totalPedidos: 0, faturamentoTotal: 0, ticketMedio: 0, pedidosEntregues: 0, pedidosCancelados: 0 };
  }, [refreshKey]);

  // 2. Sales by Category
  const salesByCategory = useMemo(() => {
    try {
      const res = sqlEngine.execute(`
        SELECT 
          c.nome AS categoria,
          ROUND(SUM(ip.quantidade * ip.preco_unitario), 2) AS faturamento,
          SUM(ip.quantidade) AS unidades_vendidas
        FROM categorias c
        JOIN produtos p ON c.id = p.categoria_id
        JOIN itens_pedido ip ON p.id = ip.produto_id
        JOIN pedidos ped ON ip.pedido_id = ped.id
        WHERE ped.status <> 'cancelado'
        GROUP BY c.id, c.nome
        ORDER BY faturamento DESC;
      `);
      return res.values.map(row => ({
        categoria: String(row[0]),
        faturamento: Number(row[1]) || 0,
        unidades: Number(row[2]) || 0,
      }));
    } catch {
      return [];
    }
  }, [refreshKey]);

  // 3. Sales by Payment Method
  const paymentMethods = useMemo(() => {
    try {
      const res = sqlEngine.execute(`
        SELECT 
          metodo_pagamento,
          COUNT(id) AS total_pedidos,
          ROUND(SUM(valor_total), 2) AS faturamento
        FROM pedidos
        WHERE status <> 'cancelado'
        GROUP BY metodo_pagamento
        ORDER BY faturamento DESC;
      `);
      return res.values.map(row => ({
        metodo: String(row[0]).toUpperCase(),
        pedidos: Number(row[1]) || 0,
        faturamento: Number(row[2]) || 0,
      }));
    } catch {
      return [];
    }
  }, [refreshKey]);

  // 4. Top Selling Products
  const topProducts = useMemo(() => {
    try {
      const res = sqlEngine.execute(`
        SELECT 
          p.nome AS produto,
          c.nome AS categoria,
          p.preco,
          SUM(ip.quantidade) AS total_vendido,
          ROUND(SUM(ip.quantidade * ip.preco_unitario), 2) AS receita_total
        FROM itens_pedido ip
        JOIN produtos p ON ip.produto_id = p.id
        JOIN categorias c ON p.categoria_id = c.id
        JOIN pedidos ped ON ip.pedido_id = ped.id
        WHERE ped.status <> 'cancelado'
        GROUP BY p.id, p.nome, c.nome, p.preco
        ORDER BY receita_total DESC
        LIMIT 6;
      `);
      return res.values.map(row => ({
        produto: String(row[0]),
        categoria: String(row[1]),
        preco: Number(row[2]) || 0,
        quantidade: Number(row[3]) || 0,
        receita: Number(row[4]) || 0,
      }));
    } catch {
      return [];
    }
  }, [refreshKey]);

  // Calculations for charts
  const maxCategoryFaturamento = Math.max(...salesByCategory.map(c => c.faturamento), 1);
  const totalPaymentFaturamento = paymentMethods.reduce((acc, p) => acc + p.faturamento, 0) || 1;

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-4 sm:p-6 text-slate-100 space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Análise e Desempenho de Vendas
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Atualização em Tempo Real
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas financeiras calculadas dinamicamente via consultas SQL diretamente sobre a base de dados ativa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalcular Métricas</span>
          </button>
        </div>
      </div>

      {/* 5 Core Sales KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Faturamento Total</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              R$ {summaryMetrics.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">Pedidos confirmados e entregues</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Ticket Médio</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-300">
              R$ {summaryMetrics.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Média por pedido fechado</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Pedidos Registrados</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {summaryMetrics.totalPedidos} pedidos
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {summaryMetrics.pedidosEntregues} entregues ({Math.round((summaryMetrics.pedidosEntregues / Math.max(summaryMetrics.totalPedidos, 1)) * 100)}%)
            </span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Taxa de Conclusão</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold font-mono text-purple-300">
              {Math.round(((summaryMetrics.totalPedidos - summaryMetrics.pedidosCancelados) / Math.max(summaryMetrics.totalPedidos, 1)) * 100)}%
            </div>
            <span className="text-[10px] text-rose-400 font-medium">
              {summaryMetrics.pedidosCancelados} cancelados
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Vendas por Categoria */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Receita por Categoria de Produto</span>
              </h3>
              <p className="text-[11px] text-slate-400">Total gerado em vendas por segmento</p>
            </div>
            <button
              onClick={() => onOpenQueryInEditor(`SELECT 
  c.nome AS categoria,
  ROUND(SUM(ip.quantidade * ip.preco_unitario), 2) AS faturamento,
  SUM(ip.quantidade) AS unidades_vendidas
FROM categorias c
JOIN produtos p ON c.id = p.categoria_id
JOIN itens_pedido ip ON p.id = ip.produto_id
JOIN pedidos ped ON ip.pedido_id = ped.id
GROUP BY c.id, c.nome
ORDER BY faturamento DESC;`)}
              className="p-1 px-2 text-[10px] text-indigo-300 hover:text-white rounded bg-slate-800 border border-slate-700 flex items-center gap-1 transition"
              title="Abrir consulta SQL no editor"
            >
              <Code className="w-3 h-3" />
              <span>Ver SQL</span>
            </button>
          </div>

          <div className="flex-1 space-y-3.5 justify-center flex flex-col">
            {salesByCategory.map((cat, idx) => {
              const pct = Math.max(5, Math.round((cat.faturamento / maxCategoryFaturamento) * 100));
              const color = COLORS[idx % COLORS.length];
              return (
                <div key={cat.categoria} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{cat.categoria}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[11px] text-slate-400">{cat.unidades} un</span>
                      <span className="font-semibold text-slate-100">
                        R$ {cat.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      style={{ width: `${pct}%`, backgroundColor: color }}
                      className="h-full rounded-full transition-all duration-500 shadow-sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Métodos de Pagamento */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-cyan-400" />
                <span>Distribuição por Método de Pagamento</span>
              </h3>
              <p className="text-[11px] text-slate-400">Preferência dos clientes no checkout</p>
            </div>
            <button
              onClick={() => onOpenQueryInEditor(`SELECT 
  metodo_pagamento,
  COUNT(id) AS total_pedidos,
  ROUND(SUM(valor_total), 2) AS faturamento
FROM pedidos
WHERE status <> 'cancelado'
GROUP BY metodo_pagamento
ORDER BY faturamento DESC;`)}
              className="p-1 px-2 text-[10px] text-indigo-300 hover:text-white rounded bg-slate-800 border border-slate-700 flex items-center gap-1 transition"
              title="Abrir consulta SQL no editor"
            >
              <Code className="w-3 h-3" />
              <span>Ver SQL</span>
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* SVG Donut */}
            <div className="flex justify-center">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    let cumulative = 0;
                    return paymentMethods.map((pm, idx) => {
                      const share = pm.faturamento / totalPaymentFaturamento;
                      const dashArray = `${share * 314.159} 314.159`;
                      const dashOffset = -cumulative * 314.159;
                      cumulative += share;
                      return (
                        <circle
                          key={pm.metodo}
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
                  <span className="text-[10px] text-slate-400">Checkout</span>
                  <span className="text-xs font-bold font-mono text-white">
                    {paymentMethods.reduce((a, b) => a + b.pedidos, 0)} Pedidos
                  </span>
                </div>
              </div>
            </div>

            {/* Method Breakdown */}
            <div className="space-y-2.5">
              {paymentMethods.map((pm, idx) => {
                const sharePct = Math.round((pm.faturamento / totalPaymentFaturamento) * 100);
                return (
                  <div key={pm.metodo} className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="font-semibold text-slate-200">{pm.metodo}</span>
                    </div>
                    <div className="text-right font-mono text-[11px]">
                      <div className="text-slate-100 font-bold">R$ {pm.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      <div className="text-slate-400 text-[10px]">{pm.pedidos} pedidos ({sharePct}%)</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Top Produtos Campeões em Receita Gerada</span>
            </h3>
            <p className="text-[11px] text-slate-400">Produtos que mais contribuem para o faturamento da loja</p>
          </div>
          <button
            onClick={() => onOpenQueryInEditor(`SELECT 
  p.nome AS produto,
  c.nome AS categoria,
  p.preco,
  SUM(ip.quantidade) AS total_vendido,
  ROUND(SUM(ip.quantidade * ip.preco_unitario), 2) AS receita_total
FROM itens_pedido ip
JOIN produtos p ON ip.produto_id = p.id
JOIN categorias c ON p.categoria_id = c.id
JOIN pedidos ped ON ip.pedido_id = ped.id
WHERE ped.status <> 'cancelado'
GROUP BY p.id, p.nome, c.nome, p.preco
ORDER BY receita_total DESC
LIMIT 10;`)}
            className="p-1.5 px-3 text-xs text-indigo-300 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Editar Consulta Completa</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                <th className="py-2.5 px-3">Produto</th>
                <th className="py-2.5 px-3">Categoria</th>
                <th className="py-2.5 px-3 text-right">Preço Unitário</th>
                <th className="py-2.5 px-3 text-right">Unidades Vendidas</th>
                <th className="py-2.5 px-3 text-right">Receita Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {topProducts.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-950/40 transition">
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                    <span className="text-slate-500 mr-2 text-[10px]">#{idx + 1}</span>
                    {p.produto}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">{p.categoria}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    R$ {p.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">
                    {p.quantidade} un
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                    R$ {p.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
