import React, { useRef, useEffect } from 'react';
import { Play, Sparkles, Wand2, Trash2, History, Plus, X, Copy, Check } from 'lucide-react';

export interface QueryTab {
  id: string;
  title: string;
  query: string;
}

interface SqlEditorProps {
  tabs: QueryTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onNewTab: () => void;
  onCloseTab: (id: string) => void;
  onUpdateQuery: (id: string, newQuery: string) => void;
  onRunQuery: (queryToRun?: string) => void;
  isExecuting?: boolean;
  onExplainQuery: () => void;
  history: Array<{ query: string; timestamp: Date; executionTimeMs: number; error?: string }>;
  onRestoreHistory: (query: string) => void;
}

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
  'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'INSERT INTO', 'VALUES',
  'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE',
  'COUNT(*)', 'SUM()', 'AVG()', 'CASE WHEN', 'WITH', 'AS'
];

export const SqlEditor: React.FC<SqlEditorProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onNewTab,
  onCloseTab,
  onUpdateQuery,
  onRunQuery,
  isExecuting,
  onExplainQuery,
  history,
  onRestoreHistory,
}) => {
  const currentTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showHistory, setShowHistory] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Line numbers calculation
  const lines = (currentTab?.query || '').split('\n');
  const lineCount = Math.max(lines.length, 12);

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRunQuery();
    }
    // Tab indent support
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const updated = val.substring(0, start) + '  ' + val.substring(end);
      onUpdateQuery(currentTab.id, updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    const toInsert = ` ${snippet} `;
    const updated = val.substring(0, start) + toInsert + val.substring(end);
    onUpdateQuery(currentTab.id, updated);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + toInsert.length;
    }, 0);
  };

  const formatSql = () => {
    if (!currentTab) return;
    let sql = currentTab.query;
    // Format common keywords to UPPERCASE and clean breaks
    const keywordsToCapitalize = [
      'select', 'from', 'where', 'and', 'or', 'join', 'inner join', 'left join',
      'right join', 'group by', 'having', 'order by', 'limit', 'insert into',
      'values', 'update', 'set', 'delete', 'create table', 'drop table',
      'primary key', 'foreign key', 'references', 'auto_increment', 'autoincrement',
      'with', 'as', 'on', 'desc', 'asc', 'count', 'sum', 'avg', 'min', 'max',
      'case', 'when', 'then', 'else', 'end', 'in', 'between', 'like', 'is null', 'is not null'
    ];

    keywordsToCapitalize.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      sql = sql.replace(regex, kw.toUpperCase());
    });

    onUpdateQuery(currentTab.id, sql.trim());
  };

  const copyQuery = () => {
    if (!currentTab) return;
    navigator.clipboard.writeText(currentTab.query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 border-b border-slate-800">
      {/* Tabs Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border-b border-slate-800 px-2 pt-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map(tab => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-t-lg transition border-t border-x cursor-pointer ${
                  isActive
                    ? 'bg-slate-950 text-indigo-300 border-slate-800 border-b-transparent shadow-sm'
                    : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
                }`}
              >
                <span>{tab.title}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
          <button
            onClick={onNewTab}
            title="Nova Aba de Consulta"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Query Controls */}
        <div className="flex items-center gap-1.5 pb-1">
          <button
            onClick={formatSql}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-md transition"
            title="Formatar palavras-chave em MAIÚSCULAS"
          >
            <Wand2 className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Formatar</span>
          </button>

          <button
            onClick={copyQuery}
            className="p-1 px-2 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-md transition"
            title="Copiar código SQL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          <button
            onClick={() => onUpdateQuery(currentTab.id, '')}
            className="p-1 px-2 text-xs text-slate-400 hover:text-rose-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-md transition"
            title="Limpar editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition ${
              showHistory
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border-slate-700/60'
            }`}
            title="Histórico de consultas"
          >
            <History className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Histórico ({history.length})</span>
          </button>

          <button
            onClick={() => onRunQuery()}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 shadow"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Rodar</span>
          </button>
        </div>
      </div>

      {/* Snippet Toolbar */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/50 border-b border-slate-800/80 overflow-x-auto scrollbar-none text-[11px]">
        <span className="text-slate-500 font-semibold uppercase text-[10px] shrink-0 mr-1">
          Snippets:
        </span>
        {SQL_KEYWORDS.slice(0, 14).map(kw => (
          <button
            key={kw}
            onClick={() => insertSnippet(kw)}
            className="px-2 py-0.5 rounded bg-slate-800/70 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-slate-700/50 font-mono text-[10px] shrink-0 transition"
          >
            {kw}
          </button>
        ))}
      </div>

      {/* Main Editor Body */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className="w-10 bg-slate-950 text-slate-600 border-r border-slate-800/60 py-3 text-right pr-2 text-xs font-mono select-none overflow-hidden">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={currentTab?.query || ''}
            onChange={e => onUpdateQuery(currentTab.id, e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite suas queries SQL aqui... Ex: SELECT * FROM clientes;"
            spellCheck={false}
            className="w-full h-full p-3 bg-transparent text-slate-100 font-mono text-xs md:text-sm leading-6 resize-none focus:outline-none placeholder-slate-600 selection:bg-indigo-500/30 selection:text-indigo-200"
          />
        </div>

        {/* History Slide-over Drawer */}
        {showHistory && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-800 z-20 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-amber-400" />
                Histórico Recente
              </span>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 text-xs">
              {history.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs">
                  Nenhuma query executada ainda nesta sessão.
                </div>
              ) : (
                history.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition ${
                      item.error
                        ? 'bg-rose-950/20 border-rose-900/40 hover:bg-rose-950/40'
                        : 'bg-slate-950 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40'
                    }`}
                    onClick={() => {
                      onRestoreHistory(item.query);
                      setShowHistory(false);
                    }}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      <span className={item.error ? 'text-rose-400' : 'text-emerald-400 font-mono'}>
                        {item.error ? 'Erro' : `${item.executionTimeMs}ms`}
                      </span>
                    </div>
                    <pre className="font-mono text-[11px] text-slate-200 line-clamp-3 whitespace-pre-wrap">
                      {item.query}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
