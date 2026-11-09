export interface ExampleQuery {
  id: string;
  category: 'Vendas & Faturamento' | 'Clientes & CRM' | 'Produtos & Estoque' | 'RH & Performance' | 'Avançadas & Window Functions';
  title: string;
  description: string;
  dbId: 'ecommerce' | 'hr_corp' | 'cinestream' | 'any';
  sql: string;
  difficulty: 'Básico' | 'Intermediário' | 'Avançado';
}

export const EXAMPLE_QUERIES: ExampleQuery[] = [
  // Vendas & Faturamento
  {
    id: 'ex-vendas-1',
    category: 'Vendas & Faturamento',
    title: 'Faturamento Total e Ticket Médio por Método de Pagamento',
    description: 'Analisa o volume financeiro, quantidade de pedidos e média de valor gasto para cada meio de pagamento (PIX, Cartão, Boleto).',
    dbId: 'ecommerce',
    difficulty: 'Intermediário',
    sql: `SELECT 
  metodo_pagamento,
  COUNT(id) AS total_pedidos,
  ROUND(SUM(valor_total), 2) AS faturamento_total,
  ROUND(AVG(valor_total), 2) AS ticket_medio,
  ROUND(MIN(valor_total), 2) AS menor_pedido,
  ROUND(MAX(valor_total), 2) AS maior_pedido
FROM pedidos
WHERE status <> 'cancelado'
GROUP BY metodo_pagamento
ORDER BY faturamento_total DESC;`
  },
  {
    id: 'ex-vendas-2',
    category: 'Vendas & Faturamento',
    title: 'Top 5 Produtos Mais Lucrativos (Receita - Custo)',
    description: 'Calcula o faturamento bruto, custo de mercadoria vendida (CMV) e a margem de lucro líquido por produto.',
    dbId: 'ecommerce',
    difficulty: 'Intermediário',
    sql: `SELECT 
  p.nome AS produto,
  c.nome AS categoria,
  SUM(ip.quantidade) AS total_unidades_vendidas,
  ROUND(SUM(ip.quantidade * ip.preco_unitario), 2) AS faturamento_bruto,
  ROUND(SUM(ip.quantidade * p.custo), 2) AS custo_total,
  ROUND(SUM(ip.quantidade * (ip.preco_unitario - p.custo)), 2) AS lucro_estimado
FROM itens_pedido ip
JOIN produtos p ON ip.produto_id = p.id
JOIN categorias c ON p.categoria_id = c.id
JOIN pedidos ped ON ip.pedido_id = ped.id
WHERE ped.status = 'entregue'
GROUP BY p.id, p.nome, c.nome
ORDER BY lucro_estimado DESC
LIMIT 5;`
  },
  {
    id: 'ex-vendas-3',
    category: 'Vendas & Faturamento',
    title: 'Impacto de Cupons de Desconto nas Vendas',
    description: 'Compara pedidos com cupom promocional versus pedidos com preço cheio.',
    dbId: 'ecommerce',
    difficulty: 'Básico',
    sql: `SELECT 
  CASE 
    WHEN cupom_desconto IS NOT NULL THEN 'Com Cupom Promocional'
    ELSE 'Sem Cupom (Preço Cheio)'
  END AS tipo_pedido,
  COUNT(*) AS total_pedidos,
  ROUND(SUM(valor_total), 2) AS faturamento_acumulado,
  ROUND(AVG(valor_total), 2) AS ticket_medio
FROM pedidos
GROUP BY tipo_pedido;`
  },

  // Clientes & CRM
  {
    id: 'ex-clientes-1',
    category: 'Clientes & CRM',
    title: 'Ranking de Clientes VIP (RFM Simplificado)',
    description: 'Lista os clientes mais valiosos com contagem de pedidos, total investido e data da última compra.',
    dbId: 'ecommerce',
    difficulty: 'Intermediário',
    sql: `SELECT 
  c.id AS cliente_id,
  c.nome AS cliente,
  c.cidade || ' - ' || c.estado AS localizacao,
  c.saldo_pontos,
  COUNT(p.id) AS total_compras,
  ROUND(COALESCE(SUM(p.valor_total), 0), 2) AS valor_gasto_total,
  MAX(p.data_pedido) AS ultima_compra
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id AND p.status <> 'cancelado'
GROUP BY c.id, c.nome, c.cidade, c.estado, c.saldo_pontos
ORDER BY valor_gasto_total DESC;`
  },
  {
    id: 'ex-clientes-2',
    category: 'Clientes & CRM',
    title: 'Clientes Inativos (Sem Compras Realizadas)',
    description: 'Encontra clientes que se cadastraram mas ainda não realizaram nenhum pedido para campanhas de reativação.',
    dbId: 'ecommerce',
    difficulty: 'Básico',
    sql: `SELECT 
  c.id,
  c.nome,
  c.email,
  c.cidade,
  c.data_cadastro,
  c.saldo_pontos
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id
WHERE p.id IS NULL
ORDER BY c.data_cadastro ASC;`
  },
  {
    id: 'ex-clientes-3',
    category: 'Clientes & CRM',
    title: 'Distribuição Geográfica de Vendas por Estado (UF)',
    description: 'Mapeia onde estão concentrados os clientes e o volume financeiro gerado por região.',
    dbId: 'ecommerce',
    difficulty: 'Básico',
    sql: `SELECT 
  c.estado,
  COUNT(DISTINCT c.id) AS total_clientes,
  COUNT(p.id) AS total_pedidos,
  ROUND(SUM(p.valor_total), 2) AS faturamento_uf,
  ROUND(AVG(p.valor_total), 2) AS ticket_medio_uf
FROM clientes c
JOIN pedidos p ON c.id = p.cliente_id
WHERE p.status = 'entregue'
GROUP BY c.estado
ORDER BY faturamento_uf DESC;`
  },

  // Produtos & Estoque
  {
    id: 'ex-produtos-1',
    category: 'Produtos & Estoque',
    title: 'Alerta de Reposição de Estoque Crítico (< 25 unidades)',
    description: 'Identifica produtos com baixo estoque, calcula o valor imobilizado e a avaliação dos clientes.',
    dbId: 'ecommerce',
    difficulty: 'Básico',
    sql: `SELECT 
  p.nome AS produto,
  c.nome AS categoria,
  p.estoque,
  p.preco,
  ROUND(p.estoque * p.custo, 2) AS capital_parado_custo,
  p.avaliacao_media,
  CASE 
    WHEN p.estoque < 15 THEN '🚨 Reposição Urgente'
    WHEN p.estoque <= 25 THEN '⚠️ Estoque Baixo'
    ELSE '✅ Estoque Regular'
  END AS status_alerta
FROM produtos p
JOIN categorias c ON p.categoria_id = c.id
WHERE p.estoque <= 25
ORDER BY p.estoque ASC;`
  },
  {
    id: 'ex-produtos-2',
    category: 'Produtos & Estoque',
    title: 'Produtos Campeões de Avaliação com Comentários',
    description: 'Lista produtos com nota máxima (>= 4.8) e o total de resenhas registradas.',
    dbId: 'ecommerce',
    difficulty: 'Intermediário',
    sql: `SELECT 
  p.nome AS produto,
  c.nome AS categoria,
  p.avaliacao_media,
  COUNT(a.id) AS qtd_avaliacoes,
  ROUND(AVG(a.nota), 1) AS media_avaliacoes_reais
FROM produtos p
JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN avaliacoes a ON p.id = a.produto_id
GROUP BY p.id, p.nome, c.nome, p.avaliacao_media
HAVING p.avaliacao_media >= 4.7
ORDER BY p.avaliacao_media DESC, qtd_avaliacoes DESC;`
  },

  // RH & Performance
  {
    id: 'ex-rh-1',
    category: 'RH & Performance',
    title: 'Folha Salarial e Comparativo com Orçamento Departamental',
    description: 'Cruza a folha de pagamento real com a verba anual alocada para cada área da empresa.',
    dbId: 'hr_corp',
    difficulty: 'Intermediário',
    sql: `SELECT 
  d.sigla,
  d.nome AS departamento,
  COUNT(f.id) AS total_colaboradores,
  ROUND(SUM(f.salario), 2) AS folha_mensal,
  ROUND(SUM(f.salario) * 12, 2) AS projecao_anual_folha,
  d.orcamento_anual,
  ROUND(((SUM(f.salario) * 12) / d.orcamento_anual) * 100, 1) AS percentual_orcamento_comprometido
FROM departamentos d
LEFT JOIN funcionarios f ON d.id = f.departamento_id
GROUP BY d.id, d.sigla, d.nome, d.orcamento_anual
ORDER BY folha_mensal DESC;`
  },

  // Avançadas & Window Functions
  {
    id: 'ex-avancada-1',
    category: 'Avançadas & Window Functions',
    title: 'Window Function: Ranking DENSE_RANK de Salários por Departamento',
    description: 'Classifica os funcionários por nível de remuneração dentro de cada setor corporativo sem colapsar as linhas.',
    dbId: 'hr_corp',
    difficulty: 'Avançado',
    sql: `SELECT 
  f.nome AS colaborador,
  d.nome AS departamento,
  f.salario,
  DENSE_RANK() OVER (PARTITION BY f.departamento_id ORDER BY f.salario DESC) AS posicao_ranking,
  ROUND(f.salario - AVG(f.salario) OVER (PARTITION BY f.departamento_id), 2) AS diferenca_media_setor
FROM funcionarios f
JOIN departamentos d ON f.departamento_id = d.id
ORDER BY departamento, posicao_ranking;`
  },
  {
    id: 'ex-avancada-2',
    category: 'Avançadas & Window Functions',
    title: 'CTE Analítica: Participação de Cada Produto no Faturamento da Categoria',
    description: 'Usa uma Common Table Expression (WITH) para calcular a porcentagem de receita de cada item.',
    dbId: 'ecommerce',
    difficulty: 'Avançado',
    sql: `WITH VendasProdutos AS (
  SELECT 
    p.id AS produto_id,
    p.nome AS produto,
    c.id AS categoria_id,
    c.nome AS categoria,
    ROUND(SUM(ip.quantidade * ip.preco_unitario), 2) AS receita_produto
  FROM itens_pedido ip
  JOIN produtos p ON ip.produto_id = p.id
  JOIN categorias c ON p.categoria_id = c.id
  GROUP BY p.id, p.nome, c.id, c.nome
),
VendasCategorias AS (
  SELECT 
    categoria_id,
    SUM(receita_produto) AS receita_categoria_total
  FROM VendasProdutos
  GROUP BY categoria_id
)
SELECT 
  vp.categoria,
  vp.produto,
  vp.receita_produto,
  vc.receita_categoria_total,
  ROUND((vp.receita_produto / vc.receita_categoria_total) * 100, 1) || '%' AS participacao_na_categoria
FROM VendasProdutos vp
JOIN VendasCategorias vc ON vp.categoria_id = vc.categoria_id
ORDER BY vp.categoria, vp.receita_produto DESC;`
  }
];
