import React from 'react';
import { Database, Play, Sparkles, Network, BookOpen, BarChart3, Download, RefreshCw, ChevronDown, Check } from 'lucide-react';
import { SAMPLE_DATABASES, SampleDatabase } from '../data/sampleDatabases';

export type ActiveTab = 'editor' | 'diagram' | 'challenges' | 'analytics';

interface HeaderProps {
  currentDb: SampleDatabase;
  onSelectDb: (db: SampleDatabase) => void;
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onResetDb: () => void;
  onExportDump: () => void;
  onExportBinary: () => void;
  onToggleAi: () => void;
  isAiOpen: boolean;
  isExecuting?: boolean;
  onRunCurrentQuery: () => void;
  completedChallengesCount: number;
  totalChallengesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentDb,
  onSelectDb,
  activeTab,
  onChangeTab,
  onResetDb,
  onExportDump,
  onExportBinary,
  onToggleAi,
  isAiOpen,
  isExecuting,
  onRunCurrentQuery,
  completedChallengesCount,
  totalChallengesCount,
}) => {
  const [dbDropdownOpen, setDbDropdownOpen] = React.useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = React.useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 select-none">
      <div className="flex items-center justify-between px-4 h-15 gap-4">
        {/* Brand & Database Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  SQL Studio Pro
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                  SQLite WASM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Ambiente Relacional Completo
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden md:block" />

          {/* Database Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDbDropdownOpen(!dbDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium transition cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate text-slate-200">
                {currentDb.name}
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded bg-slate-700 text-slate-300">
                {currentDb.badge}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dbDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDbDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-1.5 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Bancos de Dados Disponíveis
                  </div>
                  {SAMPLE_DATABASES.map(db => (
                    <button
                      key={db.id}
                      onClick={() => {
                        onSelectDb(db);
                        setDbDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition cursor-pointer ${
                        currentDb.id === db.id ? 'bg-indigo-600/15 text-indigo-300' : 'text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          {db.name}
                          {currentDb.id === db.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">
                          {db.description}
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {db.badge}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-slate-800 mt-1 pt-1 px-3 py-1">
                    <button
                      onClick={() => {
                        onResetDb();
                        setDbDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 py-1.5 text-xs text-rose-300 hover:text-rose-200 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Restaurar Banco Original
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 text-xs">
          <button
            onClick={() => onChangeTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Editor SQL</span>
          </button>

          <button
            onClick={() => onChangeTab('diagram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'diagram'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Diagrama ER</span>
          </button>

          <button
            onClick={() => onChangeTab('challenges')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer relative ${
              activeTab === 'challenges'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Desafios</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50">
              {completedChallengesCount}/{totalChallengesCount}
            </span>
          </button>

          <button
            onClick={() => onChangeTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Gráficos</span>
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Run Query (Visible on Editor) */}
          {activeTab === 'editor' && (
            <button
              onClick={onRunCurrentQuery}
              disabled={isExecuting}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs transition shadow-lg shadow-emerald-900/30 cursor-pointer disabled:opacity-50"
              title="Executar consulta (Ctrl+Enter)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Executar</span>
              <kbd className="hidden md:inline px-1 py-0.5 text-[9px] bg-emerald-700/60 rounded text-emerald-200 font-mono">
                Ctrl+Enter
              </kbd>
            </button>
          )}

          {/* AI SQL Assistant Toggle */}
          <button
            onClick={onToggleAi}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              isAiOpen
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400/30 shadow-lg shadow-purple-900/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-purple-300 border-purple-500/30 hover:border-purple-500/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span className="hidden sm:inline">Assistente IA</span>
          </button>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition cursor-pointer"
              title="Exportar Banco de Dados"
            >
              <Download className="w-4 h-4" />
            </button>

            {exportDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setExportDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Exportar Base
                  </div>
                  <button
                    onClick={() => {
                      onExportDump();
                      setExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 flex items-center justify-between transition"
                  >
                    <span>Script SQL Dump (.sql)</span>
                    <span className="text-[10px] text-slate-400">DDL + DML</span>
                  </button>
                  <button
                    onClick={() => {
                      onExportBinary();
                      setExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 flex items-center justify-between transition"
                  >
                    <span>Arquivo SQLite (.sqlite)</span>
                    <span className="text-[10px] text-slate-400">Binário</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
