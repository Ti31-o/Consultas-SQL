import { GoogleGenAI } from '@google/genai';

const apiKey = typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : '';

let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn('Failed to initialize GoogleGenAI client:', e);
  }
}

export async function askSqlAssistant(
  prompt: string,
  schemaContext: string,
  currentQuery?: string,
  mode: 'generate' | 'explain' | 'optimize' | 'fix' = 'generate'
): Promise<{ answer: string; suggestedSql?: string }> {
  // If real Gemini API is configured
  if (aiClient) {
    try {
      let systemInstruction = `Você é o Especialista Sênior em SQL e Engenharia de Banco de Dados Relacional do SQL Studio Pro.
Responda sempre em português do Brasil de forma concisa, técnica, didática e prática.
Siga o dialeto ANSI SQL / SQLite.
Contexto do Esquema do Banco de Dados Atual:
${schemaContext}
`;

      let userMessage = '';
      if (mode === 'generate') {
        userMessage = `Gere uma query SQL que atenda a este pedido: "${prompt}".
Seja direto. Inclua a query em um bloco de código \`\`\`sql ... \`\`\` e uma breve explicação dos comandos utilizados.`;
      } else if (mode === 'explain') {
        userMessage = `Explique didaticamente em português como esta consulta funciona passo a passo:\n\`\`\`sql\n${currentQuery || prompt}\n\`\`\``;
      } else if (mode === 'optimize') {
        userMessage = `Analise o desempenho desta consulta SQL e sugira otimizações e índices:\n\`\`\`sql\n${currentQuery || prompt}\n\`\`\``;
      } else {
        userMessage = `A consulta a seguir gerou um erro ou precisa de correção. Erro/Problema: "${prompt}".\nConsulta:\n\`\`\`sql\n${currentQuery}\n\`\`\`\nForneça a query corrigida e explique o que estava errado.`;
      }

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\n${userMessage}` }] }
        ]
      });

      const text = response.text || 'Sem resposta do assistente.';
      // Extract SQL snippet if present
      const match = text.match(/```sql\n([\s\S]*?)\n```/i);
      const suggestedSql = match ? match[1].trim() : undefined;

      return { answer: text, suggestedSql };
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to smart local assistant:', err);
    }
  }

  // Local Smart Rule-Based Fallback when API key is not yet set in environment
  return getLocalSmartSqlResponse(prompt, schemaContext, currentQuery, mode);
}

function getLocalSmartSqlResponse(
  prompt: string,
  schemaContext: string,
  currentQuery?: string,
  mode: 'generate' | 'explain' | 'optimize' | 'fix' = 'generate'
): { answer: string; suggestedSql?: string } {
  const p = prompt.toLowerCase();

  if (mode === 'explain') {
    const q = (currentQuery || prompt).toUpperCase();
    let parts: string[] = [];
    if (q.includes('SELECT')) parts.push('**SELECT**: Projeta as colunas específicas selecionadas.');
    if (q.includes('FROM')) parts.push('**FROM**: Define a tabela base de origem dos dados.');
    if (q.includes('JOIN')) parts.push('**JOIN**: Conecta tabelas relacionais associando chaves primárias e estrangeiras.');
    if (q.includes('WHERE')) parts.push('**WHERE**: Filtra os registros que satisfazem a condição especificada.');
    if (q.includes('GROUP BY')) parts.push('**GROUP BY**: Agrupa linhas com valores idênticos para cálculo de métricas agregadas (SUM, COUNT, AVG).');
    if (q.includes('HAVING')) parts.push('**HAVING**: Filtra os grupos agregados após o cálculo do GROUP BY.');
    if (q.includes('ORDER BY')) parts.push('**ORDER BY**: Ordena os resultados finais de forma ascendente (ASC) ou descendente (DESC).');
    if (q.includes('LIMIT')) parts.push('**LIMIT**: Restringe o número máximo de registros retornados para otimizar transferência e renderização.');

    return {
      answer: `### Análise da Consulta SQL\n\n${parts.join('\n\n')}\n\n**Dica Prática**: Esta consulta realiza operações relacionais padrão no SQLite e no padrão ANSI SQL. Verifique se as colunas filtradas possuem índices para melhor performance em grandes volumes.`
    };
  }

  if (mode === 'optimize') {
    return {
      answer: `### Recomendações de Otimização e Performance
1. **Indexação de Chaves Estrangeiras**: Certifique-se de criar índices em colunas usadas em cláusulas \`JOIN\` e \`WHERE\` (Ex: \`CREATE INDEX idx_cliente_id ON pedidos(cliente_id);\`).
2. **Evite \`SELECT *\` em Produção**: Projete apenas as colunas estritamente necessárias para economizar I/O de disco e largura de banda.
3. **Uso de \`EXPLAIN QUERY PLAN\`**: Você pode prefixar sua consulta com \`EXPLAIN QUERY PLAN\` para inspecionar se o SQLite está realizando \`SCAN TABLE\` (lento) ou \`SEARCH TABLE USING INDEX\` (rápido).`
    };
  }

  // Generate suggestions based on prompt keywords
  if (p.includes('cliente') && (p.includes('pedido') || p.includes('gasto') || p.includes('compr'))) {
    const sql = `SELECT 
  c.nome AS cliente,
  c.cidade,
  COUNT(p.id) AS total_pedidos,
  COALESCE(SUM(p.valor_total), 0) AS total_gasto
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id
GROUP BY c.id, c.nome
ORDER BY total_gasto DESC;`;
    return {
      answer: `Aqui está uma query que relaciona clientes com seus pedidos e calcula o gasto total acumulado:`,
      suggestedSql: sql
    };
  }

  if (p.includes('produto') || p.includes('caro') || p.includes('estoque') || p.includes('preço')) {
    const sql = `SELECT 
  p.nome AS produto,
  c.nome AS categoria,
  p.preco,
  p.estoque,
  p.avaliacao_media
FROM produtos p
JOIN categorias c ON p.categoria_id = c.id
ORDER BY p.preco DESC
LIMIT 10;`;
    return {
      answer: `Consulta para listar os produtos mais caros com a categoria correspondente:`,
      suggestedSql: sql
    };
  }

  if (p.includes('salario') || p.includes('departamento') || p.includes('funcionario')) {
    const sql = `SELECT 
  d.nome AS departamento,
  COUNT(f.id) AS total_colaboradores,
  ROUND(AVG(f.salario), 2) AS salario_medio,
  MAX(f.salario) AS maior_salario
FROM departamentos d
JOIN funcionarios f ON d.id = f.departamento_id
GROUP BY d.id, d.nome
ORDER BY salario_medio DESC;`;
    return {
      answer: `Consulta analítica de recursos humanos agrupada por departamento:`,
      suggestedSql: sql
    };
  }

  // Generic sample
  const defaultSql = `SELECT * FROM (
  SELECT 
    name AS tabela,
    type AS tipo
  FROM sqlite_master 
  WHERE type='table' AND name NOT LIKE 'sqlite_%'
);`;
  return {
    answer: `Sugestão de consulta adaptada ao seu objetivo:\nVocê pode executar ou personalizar os filtros conforme sua necessidade.`,
    suggestedSql: defaultSql
  };
}
