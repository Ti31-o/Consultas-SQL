import React, { useMemo, useState } from 'react';
import { sqlEngine } from '../lib/sqliteEngine';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, Star, Award, TrendingUp, MapPin, RefreshCw, ArrowUpRight } from 'lucide-react';

interface KpiIndicatorsProps {
  onOpenQueryInEditor: (sql: string) => void;
}

export const KpiIndicators: React.FC<KpiIndicatorsProps> = ({ onOpenQueryInEditor }) => {
  const [refreshCount, setRefreshCount] = useState(0);

  // Sales KPIs
  const salesKpis = useMemo(() => {
    try {
      const res = sqlEngine.execute(`
        SELECT 
          ROUND(COALESCE(SUM(valor_total), 0), 2) AS faturamento_total,
          ROUND(COALESCE(AVG(valor_total), 0), 2) AS ticket_medio,
          COUNT(id) AS total_pedidos,
          SUM(CASE WHEN status = 'entregue' THEN 1 ELSE 0 END) AS entregues,
          SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) AS cancelados
        FROM pedidos;
      `);
      if (res.values.length > 0) {
        const row = res.values[0];
        return {
          faturamento: Number(row[0]) || 0,
          ticketMedio: Number(row[1]) || 0,
          totalPedidos: Number(row[2]) || 0,
          entregues: Number(row[3]) || 0,
          cancelados: Number(row[4]) || 0,
        };
      }
    } catch (e) {
      console.warn('Error loading sales KPIs:', e);
    }
    return { faturamento: 0, ticketMedio: 0, totalPedidos: 0, entregues: 0, cancelados: 0 };
  }, [refreshCount]);

  // Customer KPIs
  const customerKpis = useMemo(() => {
    try {
      const res = sqlEngine.execute(`
        SELECT 
          COUNT(DISTINCT c.id) AS total_clientes,
          COUNT(DISTINCT p.cliente_id) AS clientes_compradores,
          ROUND(AVG(c.saldo_pontos), 0) AS media_pontos
        FROM clientes c
        LEFT JOIN pedidos p ON c.id = p.cliente_id;
      `);

      const topClientRes = sqlEngine.execute(`
        SELECT c.nome, ROUND(SUM(p.valor_total), 2) AS gasto
        FROM clientes c
        JOIN pedidos p ON c.id = p.cliente_id
        WHERE p.status <> 'cancelado'
        GROUP BY c.id, c.nome
        ORDER BY gasto DESC
        LIMIT 1;
      `);

      const topCityRes = sqlEngine.execute(`
        SELECT c.cidade || '/' || c.estado, COUNT(c.id) AS qtd
        FROM clientes c
        GROUP BY c.cidade, c.estado
        ORDER BY qtd DESC
        LIMIT 1;
      `);

      const total = Number(res.values[0]?.[0]) || 0;
      const compradores = Number(res.values[0]?.[1]) || 0;
      const taxaAtivacao = total > 0 ? Math.round((compradores / total) * 100) : 0;

      return {
        totalClientes: total,
        clientesCompradores: compradores,
        taxaAtivacao,
        mediaPontos: Number(res.values[0]?.[2]) || 0,
        topCliente: String(topClientRes.values[0]?.[0] || 'N/A'),
        topClienteGasto: Number(topClientRes.values[0]?.[1] || 0),
        topCidade: String(topCityRes.values[0]?.[0] || 'N/A'),
      };
    } catch {
      return { totalClientes: 0, clientesCompradores: 0, taxaAtivacao: 0, mediaPontos: 0, topCliente: 'N/A', topClienteGasto: 0, topCidade: 'N/A' };
    }
  }, [refreshCount]);

  // Product & Inventory KPIs
  const productKpis = useMemo(() => {
    try {
      const res = sqlEngine.execute(`
        SELECT 
          COUNT(id) AS total_produtos,
          ROUND(SUM(estoque * custo), 2) AS capital_estoque,
          ROUND(SUM(estoque * preco), 2) AS valor_venda_estoque,
          ROUND(AVG(avaliacao_media), 2) AS media_avaliacao,
          SUM(CASE WHEN estoque < 20 THEN 1 ELSE 0 END) AS estoque_critico
        FROM produtos;
      `);

      // Critical stock list
      const criticalListRes = sqlEngine.execute(`
        SELECT nome, estoque, preco
        FROM produtos
        WHERE estoque < 20
        ORDER BY estoque ASC;
      `);

      const criticalList = criticalListRes.values.map(r => ({
        nome: String(r[0]),
        estoque: Number(r[1]),
        preco: Number(r[2]),
      }));

      const row = res.values[0];
      return {
        totalProdutos: Number(row?.[0]) || 0,
        capitalEstoque: Number(row?.[1]) || 0,
        valorVendaEstoque: Number(row?.[2]) || 0,
        mediaAvaliacao: Number(row?.[3]) || 0,
        estoqueCriticoQtd: Number(row?.[4]) || 0,
        criticalList,
      };
    } catch {
      return { totalProdutos: 0, capitalEstoque: 0, valorVendaEstoque: 0, mediaAvaliacao: 0, estoqueCriticoQtd: 0, criticalList: [] };
    }
  }, [refreshCount]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-4 sm:p-6 text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Painel de Indicadores (KPIs)
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Vendas • Clientes • Produtos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas estratégicas consolidadas com atualização dinâmica a partir dos dados relacionais do SQLite.
          </p>
        </div>

        <button
          onClick={() => setRefreshCount(c => c + 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Atualizar Indicadores</span>
        </button>
      </div>

      {/* SEÇÃO 1: INDICADORES DE VENDAS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-sm text-white">Indicadores de Vendas</h3>
          </div>
          <button
            onClick={() => onOpenQueryInEditor(`SELECT 
  ROUND(SUM(valor_total), 2) AS faturamento,
  ROUND(AVG(valor_total), 2) AS ticket_medio,
  COUNT(id) AS total_pedidos
FROM pedidos;`)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Ver Consulta</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Faturamento Líquido</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              R$ {salesKpis.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-400">Total acumulado de pedidos</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Ticket Médio por Venda</span>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
              R$ {salesKpis.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400">Gasto médio por checkout</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Pedidos Fechados</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {salesKpis.totalPedidos}
            </div>
            <span className="text-[10px] text-cyan-400">{salesKpis.entregues} pedidos entregues</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Taxa de Cancelamento</span>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
              {salesKpis.totalPedidos > 0 ? ((salesKpis.cancelados / salesKpis.totalPedidos) * 100).toFixed(1) : 0}%
            </div>
            <span className="text-[10px] text-slate-400">{salesKpis.cancelados} pedidos cancelados</span>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: INDICADORES DE CLIENTES */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-sm text-white">Indicadores de Clientes & CRM</h3>
          </div>
          <button
            onClick={() => onOpenQueryInEditor(`SELECT 
  COUNT(DISTINCT c.id) AS total_clientes,
  COUNT(DISTINCT p.cliente_id) AS compradores_ativos,
  ROUND(AVG(c.saldo_pontos), 0) AS media_pontos
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id;`)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Ver Consulta</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Total de Clientes</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {customerKpis.totalClientes} cadastros
            </div>
            <span className="text-[10px] text-indigo-300">{customerKpis.clientesCompradores} compradores ativos</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Taxa de Conversão (Ativação)</span>
            <div className="text-2xl font-bold font-mono text-indigo-300 mt-1">
              {customerKpis.taxaAtivacao}%
            </div>
            <span className="text-[10px] text-slate-400">Clientes com pelo menos 1 compra</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Cliente Campeão (VIP)</span>
            <div className="text-base font-bold text-white mt-1 truncate" title={customerKpis.topCliente}>
              {customerKpis.topCliente}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              Total gasto: R$ {customerKpis.topClienteGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Região com Maior Base</span>
            <div className="text-base font-bold text-white mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">{customerKpis.topCidade}</span>
            </div>
            <span className="text-[10px] text-slate-400">Concentração geográfica líder</span>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: INDICADORES DE PRODUTOS & ESTOQUE */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-sm text-white">Indicadores de Produtos & Estoque</h3>
          </div>
          <button
            onClick={() => onOpenQueryInEditor(`SELECT 
  p.nome,
  p.estoque,
  p.preco,
  p.avaliacao_media
FROM produtos p
WHERE p.estoque < 20
ORDER BY p.estoque ASC;`)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Ver Consulta</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Itens no Catálogo</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {productKpis.totalProdutos} produtos
            </div>
            <span className="text-[10px] text-slate-400">Distribuídos em 5 categorias</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Capital Imobilizado (Custo)</span>
            <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
              R$ {productKpis.capitalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400">
              Valor de venda: R$ {productKpis.valorVendaEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Satisfação Média</span>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1 flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>{productKpis.mediaAvaliacao} / 5.0</span>
            </div>
            <span className="text-[10px] text-slate-400">Média geral das avaliações</span>
          </div>

          <div className={`rounded-2xl p-4 shadow-sm border ${productKpis.estoqueCriticoQtd > 0 ? 'bg-rose-950/20 border-rose-900/50' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[11px] text-rose-300 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Estoque Crítico (&lt; 20 un)
            </span>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
              {productKpis.estoqueCriticoQtd} itens
            </div>
            <span className="text-[10px] text-rose-300/80">Necessitam reposição imediata</span>
          </div>
        </div>

        {/* Critical Stock Alert List */}
        {productKpis.criticalList.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Produtos com Estoque Baixo / Alerta de Reposição
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {productKpis.criticalList.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <span className="font-medium text-slate-200 block truncate">{item.nome}</span>
                    <span className="text-[10px] text-slate-500 font-mono">R$ {item.preco.toFixed(2)}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-mono font-bold shrink-0">
                    {item.estoque} un
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
