import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Circle, Lightbulb, Play, Eye, Award, BookOpen, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { CHALLENGES, Challenge } from '../data/challenges';
import { sqlEngine, QueryResult } from '../lib/sqliteEngine';

interface ChallengesLabProps {
  completedIds: string[];
  onToggleComplete: (id: string) => void;
  onOpenInMainEditor: (sql: string) => void;
}

export const ChallengesLab: React.FC<ChallengesLabProps> = ({
  completedIds,
  onToggleComplete,
  onOpenInMainEditor,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<'Todos' | 'Iniciante' | 'Intermediário' | 'Avançado'>('Todos');
  const [activeChallengeId, setActiveChallengeId] = useState<string>(CHALLENGES[0].id);
  const [userQuery, setUserQuery] = useState<string>(CHALLENGES[0].starterCode);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
    userResult?: QueryResult;
    expectedResult?: QueryResult;
  } | null>(null);

  const activeChallenge = CHALLENGES.find(c => c.id === activeChallengeId) || CHALLENGES[0];

  // When switching challenge, update query and reset feedback
  useEffect(() => {
    setUserQuery(activeChallenge.starterCode);
    setShowHint(false);
    setShowSolution(false);
    setValidationResult(null);
  }, [activeChallengeId]);

  const filteredChallenges = CHALLENGES.filter(
    c => selectedLevel === 'Todos' || c.level === selectedLevel
  );

  const handleRunAndValidate = () => {
    setValidationResult(null);
    if (!userQuery.trim()) {
      setValidationResult({
        success: false,
        message: 'Por favor, digite uma consulta SQL antes de testar.',
      });
      return;
    }

    // Execute user query
    const userRes = sqlEngine.execute(userQuery);
    if (userRes.error) {
      setValidationResult({
        success: false,
        message: `Erro na sua query: ${userRes.error}`,
        userResult: userRes,
      });
      return;
    }

    // Execute expected query
    const expectedRes = sqlEngine.execute(activeChallenge.expectedQuery);
    if (expectedRes.error) {
      setValidationResult({
        success: false,
        message: `Erro ao executar query esperada: ${expectedRes.error}`,
      });
      return;
    }

    // Comparison logic
    const userCols = userRes.columns.map(c => c.toLowerCase());
    const expCols = expectedRes.columns.map(c => c.toLowerCase());

    const userVals = JSON.stringify(userRes.values);
    const expVals = JSON.stringify(expectedRes.values);

    let isSuccess = false;
    let message = '';

    if (userVals === expVals) {
      isSuccess = true;
      message = '🎉 Parabéns! Sua consulta retornou exatamente o resultado esperado!';
    } else if (userRes.values.length !== expectedRes.values.length) {
      isSuccess = false;
      message = `Sua consulta retornou ${userRes.values.length} linha(s), mas o esperado são ${expectedRes.values.length} linha(s).`;
    } else if (userCols.length !== expCols.length) {
      isSuccess = false;
      message = `Sua consulta selecionou ${userCols.length} coluna(s), mas o esperado são ${expCols.length} coluna(s).`;
    } else {
      isSuccess = false;
      message = 'A quantidade de linhas bateu, porém os dados retornados diferem do esperado. Verifique seus filtros e ordenação.';
    }

    setValidationResult({
      success: isSuccess,
      message,
      userResult: userRes,
      expectedResult: expectedRes,
    });

    if (isSuccess) {
      if (!completedIds.includes(activeChallenge.id)) {
        onToggleComplete(activeChallenge.id);
      }
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const levelColor = (level: string) => {
    switch (level) {
      case 'Iniciante':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Intermediário':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Avançado':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Challenges List Sidebar */}
      <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Desafios & Tutoriais
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {completedIds.length} / {CHALLENGES.length} Concluídos
            </span>
          </div>

          {/* Level Filter Tabs */}
          <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg text-[11px] font-medium text-slate-400">
            {(['Todos', 'Iniciante', 'Intermediário', 'Avançado'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`py-1 rounded text-center truncate transition ${
                  selectedLevel === lvl
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Challenges List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-xs">
          {filteredChallenges.map(ch => {
            const isCompleted = completedIds.includes(ch.id);
            const isActive = ch.id === activeChallengeId;
            return (
              <div
                key={ch.id}
                onClick={() => setActiveChallengeId(ch.id)}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                  isActive
                    ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/30'
                    : isCompleted
                    ? 'bg-slate-950/40 border-emerald-900/30 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-semibold text-slate-200 truncate">
                      {ch.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${levelColor(ch.level)}`}>
                      {ch.level}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      Base: {ch.dbId}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Challenge Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950">
        {/* Challenge Header & Instructions */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/40">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${levelColor(activeChallenge.level)}`}>
                {activeChallenge.level}
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {activeChallenge.title}
              </h2>
            </div>
            {completedIds.includes(activeChallenge.id) && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Desafio Concluído!
              </span>
            )}
          </div>

          <p className="text-slate-300 text-sm mt-1 leading-relaxed">
            {activeChallenge.description}
          </p>

          {/* Theory / Concept Card */}
          <div className="mt-4 bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
            <BookOpen className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-indigo-200 block mb-0.5">Conceito Teórico:</span>
              <p className="leading-relaxed">{activeChallenge.concept}</p>
            </div>
          </div>
        </div>

        {/* Challenge Code Editor */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col gap-4">
          <div className="flex flex-col border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80 shadow-lg">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs">
              <span className="font-mono text-slate-400 text-[11px]">Sua Consulta SQL:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 px-2 py-1 rounded hover:bg-amber-500/10 transition"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Ocultar Dica' : 'Ver Dica'}</span>
                </button>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200 px-2 py-1 rounded hover:bg-indigo-500/10 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showSolution ? 'Ocultar Resposta' : 'Revelar Resposta'}</span>
                </button>
                <button
                  onClick={() => onOpenInMainEditor(userQuery)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition"
                >
                  Abrir no Editor Principal
                </button>
              </div>
            </div>

            {/* Hint Box */}
            {showHint && (
              <div className="bg-amber-950/30 border-b border-amber-900/40 p-3 text-xs text-amber-200 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Dica para resolver:</span>
                  <code className="text-[11px] font-mono mt-1 block bg-slate-950/80 p-2 rounded border border-amber-900/50">
                    {activeChallenge.hint}
                  </code>
                </div>
              </div>
            )}

            {/* Solution Box */}
            {showSolution && (
              <div className="bg-indigo-950/30 border-b border-indigo-900/40 p-3 text-xs text-indigo-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Query de Solução Esperada:</span>
                    <button
                      onClick={() => setUserQuery(activeChallenge.expectedQuery)}
                      className="text-[10px] text-indigo-300 hover:underline"
                    >
                      Copiar para meu editor
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono mt-1 bg-slate-950/80 p-2.5 rounded border border-indigo-900/50 whitespace-pre-wrap">
                    {activeChallenge.expectedQuery}
                  </pre>
                </div>
              </div>
            )}

            {/* Textarea */}
            <textarea
              value={userQuery}
              onChange={e => setUserQuery(e.target.value)}
              rows={6}
              spellCheck={false}
              className="p-3 bg-slate-950 font-mono text-xs sm:text-sm text-slate-100 resize-none focus:outline-none placeholder-slate-600 leading-relaxed"
            />

            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Execute para comparar automaticamente com o resultado esperado.
              </span>
              <button
                onClick={handleRunAndValidate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-900/30 transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Testar Minha Query</span>
              </button>
            </div>
          </div>

          {/* Validation Feedback */}
          {validationResult && (
            <div
              className={`p-4 rounded-xl border text-xs ${
                validationResult.success
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                {validationResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                )}
                <span>{validationResult.message}</span>
              </div>

              {/* Show Side-by-Side Results if Available */}
              {validationResult.userResult && validationResult.userResult.values && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                  {/* User Output */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 overflow-x-auto">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Seu Resultado ({validationResult.userResult.values.length} linhas):
                    </span>
                    <table className="w-full text-[11px] font-mono border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-left">
                          {validationResult.userResult.columns.map((c, i) => (
                            <th key={i} className="py-1 px-1.5">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {validationResult.userResult.values.slice(0, 5).map((row, rI) => (
                          <tr key={rI} className="border-b border-slate-900">
                            {row.map((val, cI) => (
                              <td key={cI} className="py-1 px-1.5 text-slate-200">
                                {val === null ? 'NULL' : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Expected Output */}
                  {validationResult.expectedResult && (
                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 overflow-x-auto">
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                        Resultado Esperado ({validationResult.expectedResult.values.length} linhas):
                      </span>
                      <table className="w-full text-[11px] font-mono border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 text-left">
                            {validationResult.expectedResult.columns.map((c, i) => (
                              <th key={i} className="py-1 px-1.5">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {validationResult.expectedResult.values.slice(0, 5).map((row, rI) => (
                            <tr key={rI} className="border-b border-slate-900">
                              {row.map((val, cI) => (
                                <td key={cI} className="py-1 px-1.5 text-slate-200">
                                  {val === null ? 'NULL' : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
