import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Trash2,
  Sparkles,
  Bot,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlanRecord, PlanSubtask } from '../types';
import { api } from '../services/api';

interface PlannerScreenProps {
  onPlanSelected?: (plan: PlanRecord) => void;
}

export const PlannerScreen: React.FC<PlannerScreenProps> = () => {
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState('');
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [executingSubtaskId, setExecutingSubtaskId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await api.getPlans();
      setPlans(data);
      if (data.length > 0 && !activePlanId) {
        setActivePlanId(data[0].id);
      }
    } catch (err: unknown) {
      console.error('Failed to load plans:', err);
    }
  };

  const handleCreatePlan = async (goalText?: string) => {
    const goalToUse = goalText || newGoal;
    if (!goalToUse.trim()) return;

    setIsCreating(true);
    setErrorMsg(null);
    try {
      const newPlan = await api.createPlan(goalToUse.trim());
      setPlans([newPlan, ...plans]);
      setActivePlanId(newPlan.id);
      setNewGoal('');
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleExecuteSubtask = async (planId: string, subtaskId: string) => {
    setExecutingSubtaskId(subtaskId);
    setErrorMsg(null);
    try {
      const res = await api.executeSubtask(planId, subtaskId);
      // Update plan in state
      setPlans((prev) => prev.map((p) => (p.id === planId ? res.plan : p)));

      // If plan completed, trigger confetti celebration!
      if (res.plan.status === 'completed') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    } finally {
      setExecutingSubtaskId(null);
    }
  };

  const handleRevisePlan = async () => {
    if (!activePlanId || !revisionFeedback.trim()) return;
    try {
      const revised = await api.revisePlan(activePlanId, revisionFeedback.trim());
      setPlans((prev) => prev.map((p) => (p.id === activePlanId ? revised : p)));
      setRevisionFeedback('');
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await api.deletePlan(id);
      const remaining = plans.filter((p) => p.id !== id);
      setPlans(remaining);
      if (activePlanId === id) {
        setActivePlanId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    }
  };

  const activePlan = plans.find((p) => p.id === activePlanId);

  const goalTemplates = [
    'Build & Package Production Android APK with Jetpack Compose & Capacitor',
    'Design Autonomous Multi-Agent Swarm with Hierarchical Consensus',
    'Execute Full-Stack Security, Guardrails & Token Optimization Audit',
  ];

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm mb-1">
            <Workflow className="w-4 h-4" />
            <span>HIERARCHICAL PLANNING ENGINE</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Autonomous goal decomposition into Directed Acyclic Graphs (DAG). Subtasks are assigned to specialized agents with prerequisite validation.
          </p>
        </div>

        {activePlan && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Status:</span>
            <span
              className={`font-semibold px-2.5 py-0.5 rounded-full uppercase text-[10px] tracking-wider ${
                activePlan.status === 'completed'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : activePlan.status === 'executing'
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse'
                  : activePlan.status === 'failed'
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {activePlan.status}
            </span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Goal Creation Input */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <label className="text-xs font-semibold text-slate-300">Formulate High-Level Goal</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreatePlan()}
            placeholder="e.g. Implement Android Jetpack Compose authentication screen with biometrics..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleCreatePlan()}
            disabled={isCreating || !newGoal.trim()}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold text-xs transition flex items-center space-x-1.5 flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Plan</span>
          </button>
        </div>

        {/* Quick Starter Templates */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-[11px] text-slate-400 mr-1 self-center">Templates:</span>
          {goalTemplates.map((t, idx) => (
            <button
              key={idx}
              onClick={() => handleCreatePlan(t)}
              className="text-[11px] text-slate-400 hover:text-cyan-300 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg px-2.5 py-1 transition cursor-pointer"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Active Plan View */}
      {activePlan ? (
        <div className="space-y-4">
          {/* Subtasks Progress Overview */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <span>Goal: {activePlan.goal}</span>
            </h3>
            <button
              onClick={() => handleDeletePlan(activePlan.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition"
              title="Delete Plan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Subtasks Execution DAG Cards */}
          <div className="space-y-3">
            {activePlan.subtasks.map((st, index) => {
              const isExecuting = executingSubtaskId === st.id;
              const hasPrereqs = st.prerequisites.length > 0;
              const isPrereqsMet = st.prerequisites.every((reqId) => {
                const p = activePlan.subtasks.find((s) => s.id === reqId);
                return p && p.status === 'completed';
              });

              return (
                <div
                  key={st.id}
                  className={`p-4 rounded-xl border transition ${
                    st.status === 'completed'
                      ? 'bg-slate-900/40 border-emerald-900/60'
                      : st.status === 'in_progress' || isExecuting
                      ? 'bg-cyan-950/30 border-cyan-700/80'
                      : st.status === 'failed'
                      ? 'bg-rose-950/30 border-rose-800'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {st.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : st.status === 'failed' ? (
                          <AlertCircle className="w-5 h-5 text-rose-400" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {index + 1}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-100">{st.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                            {st.agent.replace('agent-', '').toUpperCase()} AGENT
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{st.description}</p>

                        {/* Prerequisites badge */}
                        {hasPrereqs && (
                          <div className="text-[10px] text-slate-500 mt-1 flex items-center space-x-1">
                            <span>Requires:</span>
                            <span className="font-mono text-slate-400">
                              {st.prerequisites.join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Result Output */}
                        {st.result && (
                          <div className="mt-2 p-2 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-emerald-300">
                            {st.result}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      {st.status !== 'completed' && (
                        <button
                          onClick={() => handleExecuteSubtask(activePlan.id, st.id)}
                          disabled={isExecuting || !isPrereqsMet}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:pointer-events-none text-white font-semibold text-xs transition cursor-pointer shadow-sm"
                        >
                          {isExecuting ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Executing...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Execute Step</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plan Revision Box */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Operator Plan Revision & Constraint Feedback</span>
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={revisionFeedback}
                onChange={(e) => setRevisionFeedback(e.target.value)}
                placeholder="e.g. Add an extra step to run ProGuard obfuscation checks..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleRevisePlan}
                disabled={!revisionFeedback.trim()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
              >
                Apply Revision
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 text-xs">
          No active planning graphs. Formulate a goal above to initialize hierarchical decomposition.
        </div>
      )}
    </div>
  );
};
