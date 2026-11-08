export interface Challenge {
  id: string;
  dbId: 'ecommerce' | 'hr_corp' | 'cinestream';
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  title: string;
  description: string;
  concept: string;
  hint: string;
  expectedQuery: string;
  starterCode: string;
}

export const CHALLENGES: Challenge[] = [
  // Nível Iniciante
  {
    id: 'ch-1',
    dbId: 'ecommerce',
    level: 'Iniciante',
    title: '1. Seleção Básica com SELECT',
    description: 'Selecione o nome, o email e a cidade de todos os clientes cadastrados.',
    concept: 'O comando `SELECT coluna1, coluna2 FROM tabela` é o fundamento do SQL para projetar atributos específicos.',
    hint: 'Use `SELECT nome, email, cidade FROM clientes;`',
    expectedQuery: 'SELECT nome, email, cidade FROM clientes;',
    starterCode: '-- Escreva sua query aqui\nSELECT nome, email, cidade FROM clientes;'
  },
  {
    id: 'ch-2',
    dbId: 'ecommerce',
    level: 'Iniciante',
    title: '2. Filtros Condicionais com WHERE',
    description: 'Encontre todos os produtos cujo preço seja estritamente maior que 500 reais. Retorne o nome e o preço.',
    concept: 'A cláusula `WHERE` filtra linhas antes que o agrupamento ou projeção final ocorra.',
    hint: 'Use `WHERE preco > 500` e selecione as colunas `nome, preco`.',
    expectedQuery: 'SELECT nome, preco FROM produtos WHERE preco > 500;',
    starterCode: 'SELECT nome, preco FROM produtos\nWHERE preco > 500;'
  },
  {
    id: 'ch-3',
    dbId: 'cinestream',
    level: 'Iniciante',
    title: '3. Ordenação (ORDER BY) e Limite (LIMIT)',
    description: 'Obtenha os 5 filmes com maior nota IMDb. Mostre o título, o ano de lançamento e a nota IMDb, em ordem decrescente.',
    concept: 'Use `ORDER BY coluna DESC` para ordenar do maior para o menor e `LIMIT n` para restringir a quantidade de resultados.',
    hint: 'Combine `ORDER BY nota_imdb DESC LIMIT 5;`',
    expectedQuery: 'SELECT titulo, ano_lancamento, nota_imdb FROM filmes ORDER BY nota_imdb DESC LIMIT 5;',
    starterCode: 'SELECT titulo, ano_lancamento, nota_imdb\nFROM filmes\nORDER BY nota_imdb DESC\nLIMIT 5;'
  },
  {
    id: 'ch-4',
    dbId: 'ecommerce',
    level: 'Iniciante',
    title: '4. Filtros Combinados (AND & OR)',
    description: 'Liste todos os pedidos que foram pagos via "pix" E cujo status seja "entregue". Mostre o id, data_pedido e valor_total.',
    concept: 'Operadores lógicos `AND` e `OR` permitem combinar múltiplos critérios de validação na cláusula `WHERE`.',
    hint: 'Use `WHERE metodo_pagamento = \'pix\' AND status = \'entregue\';`',
    expectedQuery: 'SELECT id, data_pedido, valor_total FROM pedidos WHERE metodo_pagamento = \'pix\' AND status = \'entregue\';',
    starterCode: 'SELECT id, data_pedido, valor_total\nFROM pedidos\nWHERE metodo_pagamento = \'pix\' AND status = \'entregue\';'
  },
  {
    id: 'ch-5',
    dbId: 'hr_corp',
    level: 'Iniciante',
    title: '5. Busca por Padrão de Texto (LIKE)',
    description: 'Encontre todos os funcionários cujo email termine com "@techcorp.io" e comecem com a letra "R" ou "L". Retorne nome e email ordenados por nome.',
    concept: 'O operador `LIKE` com `%` funciona como coringa para busca textual.',
    hint: 'Use `WHERE (nome LIKE \'R%\' OR nome LIKE \'L%\') ORDER BY nome;`',
    expectedQuery: "SELECT nome, email FROM funcionarios WHERE (nome LIKE 'R%' OR nome LIKE 'L%') ORDER BY nome;",
    starterCode: "SELECT nome, email\nFROM funcionarios\nWHERE (nome LIKE 'R%' OR nome LIKE 'L%')\nORDER BY nome;"
  },

  // Nível Intermediário
  {
    id: 'ch-6',
    dbId: 'ecommerce',
    level: 'Intermediário',
    title: '6. Agrupamento (GROUP BY) e Contagem',
    description: 'Descubra a quantidade de produtos cadastrados em cada categoria_id. Renomeie a contagem para `total_produtos`.',
    concept: 'O `GROUP BY` agrega linhas com valores idênticos em linhas de resumo, frequentemente combinado com `COUNT()`, `SUM()` ou `AVG()`.',
    hint: 'Use `SELECT categoria_id, COUNT(*) AS total_produtos FROM produtos GROUP BY categoria_id;`',
    expectedQuery: 'SELECT categoria_id, COUNT(*) AS total_produtos FROM produtos GROUP BY categoria_id;',
    starterCode: 'SELECT categoria_id, COUNT(*) AS total_produtos\nFROM produtos\nGROUP BY categoria_id;'
  },
  {
    id: 'ch-7',
    dbId: 'ecommerce',
    level: 'Intermediário',
    title: '7. Funções de Agregação (SUM, AVG)',
    description: 'Calcule a soma total faturada e o ticket médio (média de valor_total) agrupados por `metodo_pagamento` para todos os pedidos concluídos ("entregue"). Arredonde a média para 2 casas decimais usando ROUND(..., 2).',
    concept: '`SUM()` soma valores numéricos e `AVG()` calcula a média aritmética de um grupo.',
    hint: 'Use `SELECT metodo_pagamento, ROUND(SUM(valor_total), 2) AS faturamento, ROUND(AVG(valor_total), 2) AS ticket_medio FROM pedidos WHERE status = \'entregue\' GROUP BY metodo_pagamento;`',
    expectedQuery: "SELECT metodo_pagamento, ROUND(SUM(valor_total), 2) AS faturamento, ROUND(AVG(valor_total), 2) AS ticket_medio FROM pedidos WHERE status = 'entregue' GROUP BY metodo_pagamento;",
    starterCode: "SELECT \n  metodo_pagamento,\n  ROUND(SUM(valor_total), 2) AS faturamento,\n  ROUND(AVG(valor_total), 2) AS ticket_medio\nFROM pedidos\nWHERE status = 'entregue'\nGROUP BY metodo_pagamento;"
  },
  {
    id: 'ch-8',
    dbId: 'hr_corp',
    level: 'Intermediário',
    title: '8. Filtrando Agrupamentos com HAVING',
    description: 'Liste os departamentos que possuem folha salarial média superior a R$ 10.000. Mostre o nome do departamento e a média salarial arredondada com 2 casas decimais.',
    concept: '`HAVING` é como um `WHERE` para grupos; ele filtra os resultados APÓS a agregação do `GROUP BY`.',
    hint: 'Faça JOIN entre departamentos e funcionarios, `GROUP BY d.nome` e use `HAVING AVG(f.salario) > 10000;`',
    expectedQuery: `SELECT d.nome, ROUND(AVG(f.salario), 2) AS media_salarial FROM departamentos d JOIN funcionarios f ON d.id = f.departamento_id GROUP BY d.nome HAVING AVG(f.salario) > 10000;`,
    starterCode: `SELECT \n  d.nome,\n  ROUND(AVG(f.salario), 2) AS media_salarial\nFROM departamentos d\nJOIN funcionarios f ON d.id = f.departamento_id\nGROUP BY d.nome\nHAVING AVG(f.salario) > 10000;`
  },
  {
    id: 'ch-9',
    dbId: 'cinestream',
    level: 'Intermediário',
    title: '9. Junção de Tabelas (INNER JOIN)',
    description: 'Exiba o título do filme, o nome do gênero correspondente e a nota IMDb para todos os filmes. Ordene alfabeticamente pelo título.',
    concept: 'O `INNER JOIN` retorna apenas as linhas quando há correspondência em ambas as tabelas envolvidas na condição `ON`.',
    hint: 'Junte `filmes f JOIN generos g ON f.genero_id = g.id` e ordene por `f.titulo`.',
    expectedQuery: 'SELECT f.titulo, g.nome AS genero, f.nota_imdb FROM filmes f JOIN generos g ON f.genero_id = g.id ORDER BY f.titulo;',
    starterCode: 'SELECT \n  f.titulo,\n  g.nome AS genero,\n  f.nota_imdb\nFROM filmes f\nJOIN generos g ON f.genero_id = g.id\nORDER BY f.titulo;'
  },
  {
    id: 'ch-10',
    dbId: 'ecommerce',
    level: 'Intermediário',
    title: '10. Junção Múltipla (3 Tabelas)',
    description: 'Descubra os nomes dos produtos comprados no pedido de ID 1, incluindo o nome do cliente que fez o pedido e a quantidade comprada.',
    concept: 'É possível encadear múltiplos `JOIN`s sequenciais para conectar entidades distantes no modelo relacional.',
    hint: 'Junte `pedidos p JOIN clientes c ON p.cliente_id = c.id JOIN itens_pedido ip ON p.id = ip.pedido_id JOIN produtos prod ON ip.produto_id = prod.id WHERE p.id = 1;`',
    expectedQuery: `SELECT c.nome AS cliente, prod.nome AS produto, ip.quantidade FROM pedidos p JOIN clientes c ON p.cliente_id = c.id JOIN itens_pedido ip ON p.id = ip.pedido_id JOIN produtos prod ON ip.produto_id = prod.id WHERE p.id = 1;`,
    starterCode: `SELECT \n  c.nome AS cliente,\n  prod.nome AS produto,\n  ip.quantidade\nFROM pedidos p\nJOIN clientes c ON p.cliente_id = c.id\nJOIN itens_pedido ip ON p.id = ip.pedido_id\nJOIN produtos prod ON ip.produto_id = prod.id\nWHERE p.id = 1;`
  },

  // Nível Avançado
  {
    id: 'ch-11',
    dbId: 'ecommerce',
    level: 'Avançado',
    title: '11. Identificando Ausências com LEFT JOIN & NULL',
    description: 'Encontre todos os clientes que NUNCA realizaram nenhum pedido na loja. Mostre o id, nome e email do cliente.',
    concept: 'O `LEFT JOIN` preserva todos os registros da tabela da esquerda. Se a tabela da direita não possuir correspondência, suas colunas serão `NULL`.',
    hint: 'Faça `clientes c LEFT JOIN pedidos p ON c.id = p.cliente_id WHERE p.id IS NULL;`',
    expectedQuery: 'SELECT c.id, c.nome, c.email FROM clientes c LEFT JOIN pedidos p ON c.id = p.cliente_id WHERE p.id IS NULL;',
    starterCode: 'SELECT c.id, c.nome, c.email\nFROM clientes c\nLEFT JOIN pedidos p ON c.id = p.cliente_id\nWHERE p.id IS NULL;'
  },
  {
    id: 'ch-12',
    dbId: 'ecommerce',
    level: 'Avançado',
    title: '12. Subquery Escalar no WHERE',
    description: 'Liste todos os produtos cujo preço seja estritamente superior ao preço médio de todos os produtos da loja.',
    concept: 'Uma subquery escalar retorna um único valor que pode ser usado em comparações no `WHERE`.',
    hint: 'Use `WHERE preco > (SELECT AVG(preco) FROM produtos) ORDER BY preco DESC;`',
    expectedQuery: 'SELECT nome, preco FROM produtos WHERE preco > (SELECT AVG(preco) FROM produtos) ORDER BY preco DESC;',
    starterCode: 'SELECT nome, preco\nFROM produtos\nWHERE preco > (SELECT AVG(preco) FROM produtos)\nORDER BY preco DESC;'
  },
  {
    id: 'ch-13',
    dbId: 'hr_corp',
    level: 'Avançado',
    title: '13. Subquery Correlacionada',
    description: 'Selecione os funcionários que ganham um salário superior à média salarial de seu respectivo departamento. Mostre nome, departamento_id e salario.',
    concept: 'Uma subquery correlacionada faz referência a colunas da consulta externa (f1.departamento_id = f2.departamento_id), sendo avaliada linha a linha.',
    hint: 'Use `WHERE f1.salario > (SELECT AVG(f2.salario) FROM funcionarios f2 WHERE f2.departamento_id = f1.departamento_id);`',
    expectedQuery: `SELECT f1.nome, f1.departamento_id, f1.salario FROM funcionarios f1 WHERE f1.salario > (SELECT AVG(f2.salario) FROM funcionarios f2 WHERE f2.departamento_id = f1.departamento_id);`,
    starterCode: `SELECT f1.nome, f1.departamento_id, f1.salario\nFROM funcionarios f1\nWHERE f1.salario > (\n  SELECT AVG(f2.salario)\n  FROM funcionarios f2\n  WHERE f2.departamento_id = f1.departamento_id\n);`
  },
  {
    id: 'ch-14',
    dbId: 'ecommerce',
    level: 'Avançado',
    title: '14. Expressões Condicionais (CASE WHEN)',
    description: 'Crie uma classificação de produtos: se o estoque for menor que 20, classifique como "Crítico"; se for entre 20 e 50, "Atenção"; caso contrário, "Confortável". Exiba nome, estoque e a nova coluna `status_estoque`.',
    concept: 'A instrução `CASE WHEN ... THEN ... ELSE ... END` traz lógica condicional do tipo if/else para dentro do SQL.',
    hint: 'Use `CASE WHEN estoque < 20 THEN \'Crítico\' WHEN estoque <= 50 THEN \'Atenção\' ELSE \'Confortável\' END AS status_estoque`',
    expectedQuery: `SELECT nome, estoque, CASE WHEN estoque < 20 THEN 'Crítico' WHEN estoque <= 50 THEN 'Atenção' ELSE 'Confortável' END AS status_estoque FROM produtos;`,
    starterCode: `SELECT \n  nome,\n  estoque,\n  CASE \n    WHEN estoque < 20 THEN 'Crítico'\n    WHEN estoque <= 50 THEN 'Atenção'\n    ELSE 'Confortável'\n  END AS status_estoque\nFROM produtos;`
  },
  {
    id: 'ch-15',
    dbId: 'ecommerce',
    level: 'Avançado',
    title: '15. CTEs (Common Table Expressions com WITH)',
    description: 'Utilize uma CTE chamada `resumo_clientes` para calcular o total gasto por cada cliente e em seguida retorne apenas os clientes com gasto total superior a R$ 2.000.',
    concept: 'CTEs (`WITH nome_cte AS (...)`) tornam consultas complexas muito mais limpas, legíveis e modulares que subconsultas aninhadas.',
    hint: 'Use `WITH resumo_clientes AS (SELECT c.nome, SUM(p.valor_total) AS total_gasto FROM clientes c JOIN pedidos p ON c.id = p.cliente_id GROUP BY c.id, c.nome) SELECT * FROM resumo_clientes WHERE total_gasto > 2000 ORDER BY total_gasto DESC;`',
    expectedQuery: `WITH resumo_clientes AS (SELECT c.nome, SUM(p.valor_total) AS total_gasto FROM clientes c JOIN pedidos p ON c.id = p.cliente_id GROUP BY c.id, c.nome) SELECT * FROM resumo_clientes WHERE total_gasto > 2000 ORDER BY total_gasto DESC;`,
    starterCode: `WITH resumo_clientes AS (\n  SELECT c.nome, SUM(p.valor_total) AS total_gasto\n  FROM clientes c\n  JOIN pedidos p ON c.id = p.cliente_id\n  GROUP BY c.id, c.nome\n)\nSELECT *\nFROM resumo_clientes\nWHERE total_gasto > 2000\nORDER BY total_gasto DESC;`
  },
  {
    id: 'ch-16',
    dbId: 'hr_corp',
    level: 'Avançado',
    title: '16. Window Functions (DENSE_RANK)',
    description: 'Crie um ranking salarial para os funcionários dentro de cada departamento usando a função analítica `DENSE_RANK() OVER (PARTITION BY departamento_id ORDER BY salario DESC)`. Mostre nome, departamento_id, salario e `rank_salarial`.',
    concept: 'Window Functions realizam cálculos através de um conjunto de linhas relacionadas sem colapsar as linhas como faz o `GROUP BY`.',
    hint: 'Use `DENSE_RANK() OVER (PARTITION BY departamento_id ORDER BY salario DESC) AS rank_salarial`',
    expectedQuery: `SELECT nome, departamento_id, salario, DENSE_RANK() OVER (PARTITION BY departamento_id ORDER BY salario DESC) AS rank_salarial FROM funcionarios;`,
    starterCode: `SELECT \n  nome,\n  departamento_id,\n  salario,\n  DENSE_RANK() OVER (PARTITION BY departamento_id ORDER BY salario DESC) AS rank_salarial\nFROM funcionarios;`
  }
];
