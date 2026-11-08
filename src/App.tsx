/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header, ActiveTab } from './components/Header';
import { SchemaExplorer } from './components/SchemaExplorer';
import { SqlEditor, QueryTab } from './components/SqlEditor';
import { ResultsTable } from './components/ResultsTable';
import { VisualErDiagram } from './components/VisualErDiagram';
import { ChallengesLab } from './components/ChallengesLab';
import { DataVisualizer } from './components/DataVisualizer';
import { AiAssistantModal } from './components/AiAssistantModal';
import { DdlModal } from './components/DdlModal';
import { sqlEngine, TableSchema, QueryResult } from './lib/sqliteEngine';
import { SAMPLE_DATABASES, SampleDatabase } from './data/sampleDatabases';
import { CHALLENGES } from './data/challenges';
import { Database, Loader2 } from 'lucide-react';

export default function App() {
  const [currentDb, setCurrentDb] = useState<SampleDatabase>(SAMPLE_DATABASES[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [isInitializing, setIsInitializing] = useState(true);
  const [tables, setTables] = useState<TableSchema[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Query Tabs
  const [queryTabs, setQueryTabs] = useState<QueryTab[]>([
    {
      id: 'tab-1',
      title: 'Consulta 1',
      query: SAMPLE_DATABASES[0].initialSql,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // Query Results & History
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [history, setHistory] = useState<Array<{
    query: string;
    timestamp: Date;
    executionTimeMs: number;
    error?: string;
  }>>([]);

  // Challenges progress
  const [completedChallenges, setCompletedChallenges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sql_studio_completed_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // AI Modal & DDL Modal
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [ddlModal, setDdlModal] = useState<{ tableName: string | null; ddl: string }>({
    tableName: null,
    ddl: '',
  });

  // Active query text
  const currentQueryText = queryTabs.find(t => t.id === activeTabId)?.query || '';

  // Initialize DB
  const loadDatabase = useCallback(async (db: SampleDatabase) => {
    setIsInitializing(true);
    try {
      await sqlEngine.resetWithSql(db.schemaSql);
      const tbls = sqlEngine.getTables();
      setTables(tbls);
      setCurrentDb(db);

      // Set initial query in tab
      setQueryTabs([
        {
          id: 'tab-1',
          title: 'Consulta 1',
          query: db.initialSql,
        },
      ]);
      setActiveTabId('tab-1');

      // Execute initial query
      if (db.initialSql.trim()) {
        const res = sqlEngine.execute(db.initialSql);
        setQueryResult(res);
      } else {
        setQueryResult(null);
      }
    } catch (err) {
      console.error('Error loading database:', err);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // First boot
  useEffect(() => {
    loadDatabase(SAMPLE_DATABASES[0]);
  }, [loadDatabase]);

  // Execute query handler
  const handleRunQuery = useCallback((queryToRun?: string) => {
    const rawSql = queryToRun !== undefined ? queryToRun : currentQueryText;
    if (!rawSql.trim()) return;

    setIsExecuting(true);
    try {
      const res = sqlEngine.execute(rawSql);
      setQueryResult(res);

      // Append to history
      setHistory(prev => [
        {
          query: rawSql,
          timestamp: new Date(),
          executionTimeMs: res.executionTimeMs,
          error: res.error,
        },
        ...prev.slice(0, 49),
      ]);

      // If DDL or DML occurred, refresh tables list
      const upper = rawSql.toUpperCase();
      if (
        upper.includes('CREATE ') ||
        upper.includes('DROP ') ||
        upper.includes('ALTER ') ||
        upper.includes('INSERT ') ||
        upper.includes('DELETE ') ||
        upper.includes('UPDATE ')
      ) {
        setTables(sqlEngine.getTables());
      }
    } finally {
      setIsExecuting(false);
    }
  }, [currentQueryText]);

  // Tab management
  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: QueryTab = {
      id: newId,
      title: `Consulta ${queryTabs.length + 1}`,
      query: 'SELECT * FROM clientes LIMIT 10;',
    };
    setQueryTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string) => {
    if (queryTabs.length <= 1) return;
    const filtered = queryTabs.filter(t => t.id !== id);
    setQueryTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[filtered.length - 1].id);
    }
  };

  const handleUpdateQuery = (id: string, newQuery: string) => {
    setQueryTabs(prev =>
      prev.map(t => (t.id === id ? { ...t, query: newQuery } : t))
    );
  };

  // Quick Table Query
  const handleSelectTableQuery = (tableName: string) => {
    const sql = `SELECT * FROM "${tableName}" LIMIT 50;`;
    handleUpdateQuery(activeTabId, sql);
    handleRunQuery(sql);
    setActiveTab('editor');
  };

  // Insert sample row prompt
  const handleInsertSampleRow = (tableName: string) => {
    const tbl = tables.find(t => t.name === tableName);
    if (!tbl) return;
    const nonPkCols = tbl.columns.filter(c => !c.isPk);
    const colNames = nonPkCols.map(c => `"${c.name}"`).join(', ');
    const placeholderVals = nonPkCols
      .map(c => (c.type.includes('INT') || c.type.includes('REAL') ? '0' : "'Exemplo'"))
      .join(', ');
    const sql = `INSERT INTO "${tableName}" (${colNames})\nVALUES (${placeholderVals});\n\nSELECT * FROM "${tableName}" ORDER BY rowid DESC LIMIT 5;`;
    handleUpdateQuery(activeTabId, sql);
    setActiveTab('editor');
  };

  // Toggle challenge completed
  const handleToggleChallenge = (id: string) => {
    setCompletedChallenges(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('sql_studio_completed_challenges', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Open Challenge query in main editor
  const handleOpenInMainEditor = (sql: string) => {
    handleUpdateQuery(activeTabId, sql);
    setActiveTab('editor');
  };

  // Export SQL dump (.sql)
  const handleExportDump = () => {
    const dump = sqlEngine.exportSqlDump();
    const blob = new Blob([dump], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentDb.id}_dump_${Date.now()}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export SQLite binary (.sqlite)
  const handleExportBinary = () => {
    const binary = sqlEngine.exportDatabaseBinary();
    if (!binary) return;
    const blob = new Blob([binary.buffer as ArrayBuffer], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentDb.id}_database_${Date.now()}.sqlite`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Sample analytics query
  const handleRunSampleAnalytics = () => {
    let sql = '';
    if (currentDb.id === 'ecommerce') {
      sql = `SELECT 
  c.nome AS categoria,
  COUNT(p.id) AS total_produtos,
  ROUND(AVG(p.preco), 2) AS preco_medio,
  SUM(p.estoque) AS estoque_total
FROM categorias c
JOIN produtos p ON c.id = p.categoria_id
GROUP BY c.id, c.nome
ORDER BY estoque_total DESC;`;
    } else if (currentDb.id === 'hr_corp') {
      sql = `SELECT 
  d.nome AS departamento,
  COUNT(f.id) AS colaboradores,
  ROUND(AVG(f.salario), 2) AS media_salarial,
  ROUND(SUM(f.salario), 2) AS total_folha
FROM departamentos d
JOIN funcionarios f ON d.id = f.departamento_id
GROUP BY d.id, d.nome
ORDER BY media_salarial DESC;`;
    } else {
      sql = `SELECT 
  g.nome AS genero,
  COUNT(f.id) AS total_filmes,
  ROUND(AVG(f.nota_imdb), 1) AS media_imdb,
  ROUND(SUM(f.bilheteria_milhoes), 1) AS faturamento_milhoes
FROM generos g
JOIN filmes f ON g.id = f.genero_id
GROUP BY g.id, g.nome
ORDER BY faturamento_milhoes DESC;`;
    }
    handleUpdateQuery(activeTabId, sql);
    handleRunQuery(sql);
    setActiveTab('analytics');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-4 animate-pulse">
          <Database className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          SQL Studio Pro
        </h2>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          Inicializando motor SQLite em WebAssembly...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation */}
      <Header
        currentDb={currentDb}
        onSelectDb={loadDatabase}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onResetDb={() => loadDatabase(currentDb)}
        onExportDump={handleExportDump}
        onExportBinary={handleExportBinary}
        onToggleAi={() => setIsAiOpen(true)}
        isAiOpen={isAiOpen}
        isExecuting={isExecuting}
        onRunCurrentQuery={() => handleRunQuery()}
        completedChallengesCount={completedChallenges.length}
        totalChallengesCount={CHALLENGES.length}
      />

      {/* Main View Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Schema Explorer Sidebar (visible on Editor and Diagram) */}
        {(activeTab === 'editor' || activeTab === 'diagram') && (
          <SchemaExplorer
            tables={tables}
            onSelectTableQuery={handleSelectTableQuery}
            onInsertSampleRow={handleInsertSampleRow}
            onViewDdl={(name, ddl) => setDdlModal({ tableName: name, ddl })}
          />
        )}

        {/* Tab 1: SQL Editor + Results Table */}
        {activeTab === 'editor' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="h-[48%] min-h-[220px]">
              <SqlEditor
                tabs={queryTabs}
                activeTabId={activeTabId}
                onSelectTab={handleSelectTab}
                onNewTab={handleNewTab}
                onCloseTab={handleCloseTab}
                onUpdateQuery={handleUpdateQuery}
                onRunQuery={handleRunQuery}
                isExecuting={isExecuting}
                onExplainQuery={() => setIsAiOpen(true)}
                history={history}
                onRestoreHistory={q => handleUpdateQuery(activeTabId, q)}
              />
            </div>

            <div className="flex-1 overflow-hidden">
              <ResultsTable
                result={queryResult}
                onOpenAnalytics={() => setActiveTab('analytics')}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Visual ER Diagram */}
        {activeTab === 'diagram' && (
          <VisualErDiagram
            tables={tables}
            onSelectTable={handleSelectTableQuery}
          />
        )}

        {/* Tab 3: Interactive Challenges & Course */}
        {activeTab === 'challenges' && (
          <ChallengesLab
            completedIds={completedChallenges}
            onToggleComplete={handleToggleChallenge}
            onOpenInMainEditor={handleOpenInMainEditor}
          />
        )}

        {/* Tab 4: Data Visualizer (Analytics Charts) */}
        {activeTab === 'analytics' && (
          <DataVisualizer
            result={queryResult}
            onRunSampleAnalytics={handleRunSampleAnalytics}
          />
        )}
      </div>

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        currentQuery={currentQueryText}
        tables={tables}
        onApplySql={sql => handleUpdateQuery(activeTabId, sql)}
      />

      {/* DDL Structure Modal */}
      <DdlModal
        tableName={ddlModal.tableName}
        ddl={ddlModal.ddl}
        onClose={() => setDdlModal({ tableName: null, ddl: '' })}
      />
    </div>
  );
}
