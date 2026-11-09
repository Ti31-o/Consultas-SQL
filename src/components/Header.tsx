import React, { useState } from 'react';
import { 
  Database, Play, Sparkles, Network, BookOpen, BarChart3, Download, 
  RefreshCw, ChevronDown, Check, Menu, X, FileCode2, LayoutDashboard, ShoppingBag, PanelLeft
} from 'lucide-react';
import { SAMPLE_DATABASES, SampleDatabase } from '../data/sampleDatabases';

export type ActiveTab = 'editor' | 'indicators' | 'sales_analytics' | 'diagram' | 'challenges';

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
  onOpenExampleQueries: () => void;
  onToggleMobileSchema?: () => void;
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
  onOpenExampleQueries,
  onToggleMobileSchema,
}) => {
  const [dbDropdownOpen, setDbDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'editor' as ActiveTab, label: 'Editor SQL', icon: Play },
    { id: 'indicators' as ActiveTab, label: 'Indicadores', icon: LayoutDashboard },
    { id: 'sales_analytics' as ActiveTab, label: 'Gráficos de Vendas', icon: BarChart3 },
    { id: 'diagram' as ActiveTab, label: 'Diagrama ER', icon: Network },
    { id: 'challenges' as ActiveTab, label: 'Desafios', icon: BookOpen, badge: `${completedChallengesCount}/${totalChallengesCount}` },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 select-none">
      <div className="flex items-center justify-between px-3 sm:px-4 h-14 sm:h-15 gap-2 sm:gap-4">
        {/* Brand & Mobile Schema Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Schema Toggle (Drawer button for tables) */}
          {(activeTab === 'editor' || activeTab === 'diagram') && onToggleMobileSchema && (
            <button
              onClick={onToggleMobileSchema}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              title="Abrir Esquema de Tabelas"
            >
              <PanelLeft className="w-4 h-4 text-indigo-400" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold shrink-0">
              <Database className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                  SQL Studio Pro
                </span>
                <span className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                  SQLite WASM
                </span>
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Database Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDbDropdownOpen(!dbDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium transition cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="max-w-[100px] sm:max-w-[140px] truncate text-slate-200">
                {currentDb.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {dbDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDbDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-1.5 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Bancos de Dados
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

        {/* Center Navigation Tabs (Desktop) */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 text-xs">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Example Queries Button */}
          <button
            onClick={onOpenExampleQueries}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 transition cursor-pointer"
            title="Abrir biblioteca de consultas SQL de exemplo"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exemplos SQL</span>
          </button>

          {/* Quick Run Query (Visible on Editor) */}
          {activeTab === 'editor' && (
            <button
              onClick={onRunCurrentQuery}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs transition shadow-lg shadow-emerald-900/30 cursor-pointer disabled:opacity-50"
              title="Executar consulta (Ctrl+Enter)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Executar</span>
            </button>
          )}

          {/* AI SQL Assistant Toggle */}
          <button
            onClick={onToggleAi}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              isAiOpen
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400/30 shadow-lg shadow-purple-900/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-purple-300 border-purple-500/30 hover:border-purple-500/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span className="hidden md:inline">Assistente IA</span>
          </button>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition cursor-pointer"
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

          {/* Mobile Hamburger Navigation Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 sm:p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            title="Menu de navegação"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu (xl:hidden) */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 space-y-1 text-xs animate-in slide-in-from-top-2 duration-150">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Módulos da Aplicação
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onChangeTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
