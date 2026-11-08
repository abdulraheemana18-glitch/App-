import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Globe,
  Code2,
  Workflow,
  Database,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { AgentProfile } from '../types';
import { api } from '../services/api';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Globe,
  Code2,
  Workflow,
  BrainCircuit,
  Database,
  ShieldCheck,
  Wrench,
  CheckCircle2,
};

export const AgentsScreen: React.FC = () => {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'agents' | 'bus'>('agents');
  const [busLogs, setBusLogs] = useState<{ id: string; from: string; to: string; message: string; timestamp: string }[]>([
    {
      id: 'log-1',
      from: 'AI Orchestrator',
      to: 'Planning Agent',
      message: 'Decompose user goal into Directed Acyclic Graph (DAG) with validation passes.',
      timestamp: '2 mins ago',
    },
    {
      id: 'log-2',
      from: 'Planning Agent',
      to: 'Coding Agent',
      message: 'Handoff subtask: Android Jetpack Compose Activity implementation with Material 3.',
      timestamp: '1 min ago',
    },
    {
      id: 'log-3',
      from: 'Coding Agent',
      to: 'Verification Agent',
      message: 'Source code generated. Commencing static analysis & contradiction check.',
      timestamp: '45 secs ago',
    },
    {
      id: 'log-4',
      from: 'Verification Agent',
      to: 'Quality-Control Agent',
      message: 'Verification pass: 0 syntax errors, 0 cyclic imports, 100% guardrails satisfied.',
      timestamp: '10 secs ago',
    },
  ]);

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      const data = await api.getAgents();
      setAgents(data);
    } catch (err: unknown) {
      console.error('Failed to load agents:', err);
    }
  };

  const handleTestTrigger = (agent: AgentProfile) => {
    // Add real simulated bus log
    const newLog = {
      id: 'log-' + Date.now(),
      from: 'Operator Manual Dispatch',
      to: agent.name,
      message: `Triggered autonomous benchmark check for ${agent.name}. Validation pass executing.`,
      timestamp: 'Just now',
    };
    setBusLogs([newLog, ...busLogs]);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>AUTONOMOUS MULTI-AGENT SWARM MESH</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            8 domain-specialized agents communicating via strict orchestration protocols. Each agent maintains role boundaries, memory feeds, and verification gates.
          </p>
        </div>

        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeTab === 'agents' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Agents Grid (8)
          </button>
          <button
            onClick={() => setActiveTab('bus')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeTab === 'bus' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inter-Agent Bus
          </button>
        </div>
      </div>

      {/* Agents Grid View */}
      {activeTab === 'agents' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => {
            const Icon = ICON_MAP[agent.avatarIcon] || BrainCircuit;
            const isWorking = agent.status === 'working' || agent.status === 'thinking';

            return (
              <div
                key={agent.id}
                className="flex flex-col justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group shadow-sm"
              >
                {/* Status indicator bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: agent.color }}
                />

                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: agent.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center space-x-1.5 text-[10px] font-mono">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isWorking ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                        }`}
                      />
                      <span className="uppercase text-slate-300 font-semibold">{agent.status}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{agent.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                      {agent.role}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Accuracy Rating:</span>
                    <span className="text-emerald-400 font-bold">{agent.accuracyRating}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Tasks Completed:</span>
                    <span className="text-slate-200">{agent.tasksCompleted}</span>
                  </div>

                  <button
                    onClick={() => handleTestTrigger(agent)}
                    className="w-full mt-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-cyan-300 transition flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>Dispatch Probe</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Inter-Agent Communication Bus Log */
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Inter-Agent Message Protocol</span>
            </span>
            <span className="text-[11px] text-slate-400">Zero-Trust Event Bus</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {busLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="text-cyan-400 font-bold">{log.from}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span className="text-indigo-300 font-bold">{log.to}</span>
                  </div>
                  <p className="text-slate-300 text-xs font-sans">{log.message}</p>
                </div>
                <span className="text-[10px] text-slate-500 self-end sm:self-center">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
