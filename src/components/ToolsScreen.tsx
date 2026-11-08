import React, { useState, useEffect } from 'react';
import {
  Wrench,
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Check,
  X,
  RefreshCw,
  Search,
  Code,
  FileText,
  Calculator,
  Terminal,
} from 'lucide-react';
import { ToolDefinition, ToolAuditEntry } from '../types';
import { api } from '../services/api';

export const ToolsScreen: React.FC = () => {
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [auditLog, setAuditLog] = useState<ToolAuditEntry[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [toolArgsJson, setToolArgsJson] = useState('{}');
  const [testResult, setTestResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'registry' | 'audit'>('registry');

  useEffect(() => {
    loadToolsAndAudit();
  }, []);

  const loadToolsAndAudit = async () => {
    try {
      const [toolList, auditList] = await Promise.all([api.getTools(), api.getToolAudit()]);
      setTools(toolList);
      setAuditLog(auditList);
      if (toolList.length > 0 && !selectedTool) {
        setSelectedTool(toolList[0]);
        setToolArgsJson(JSON.stringify(getSampleArgs(toolList[0].name), null, 2));
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const getSampleArgs = (toolName: string) => {
    switch (toolName) {
      case 'web_search':
        return { query: 'Android 14 Jetpack Compose best practices', depth: 'deep' };
      case 'math_eval':
        return { expression: 'Math.sqrt(1024) * 3.14159' };
      case 'document_analysis':
        return { text: 'The multi-agent system uses 8 specialized agents with zero-trust audit verification.', focus: 'summary' };
      case 'file_read':
        return { path: 'src/android/MainActivity.kt' };
      case 'file_write':
        return { path: 'src/demo.ts', content: 'console.log("Hello Super Intelligence!");', language: 'typescript' };
      case 'code_runner':
        return { code: 'const a = [1, 2, 3]; console.log("Sum:", a.reduce((x, y) => x + y, 0));', language: 'javascript' };
      case 'knowledge_retrieval':
        return { query: 'Android Compose guidelines' };
      case 'android_scaffold':
        return { packageName: 'ai.superintelligence.app', appName: 'Super Intelligence AI' };
      default:
        return {};
    }
  };

  const handleSelectTool = (t: ToolDefinition) => {
    setSelectedTool(t);
    setToolArgsJson(JSON.stringify(getSampleArgs(t.name), null, 2));
    setTestResult(null);
  };

  const handleExecuteTool = async () => {
    if (!selectedTool) return;
    setIsExecuting(true);
    setTestResult(null);

    try {
      const parsedArgs = JSON.parse(toolArgsJson);
      const res = await api.executeTool(selectedTool.name, parsedArgs, false);
      setTestResult(res);
      const updatedAudit = await api.getToolAudit();
      setAuditLog(updatedAudit);
    } catch (err: unknown) {
      setTestResult({ status: 'failed', error: (err as Error).message });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleApprovePending = async (auditId: string, approved: boolean) => {
    try {
      await api.approveTool(auditId, approved);
      const updatedAudit = await api.getToolAudit();
      setAuditLog(updatedAudit);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const pendingApprovals = auditLog.filter((a) => a.status === 'awaiting_approval');

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8 space-y-6 select-text">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm mb-1">
            <Wrench className="w-4 h-4" />
            <span>CONTROLLED AGENT TOOL SYSTEM & AUDIT LEDGER</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Controlled execution environment with parameter validation, sandboxed runtimes, and human-in-the-loop verification for consequential operations.
          </p>
        </div>

        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'registry' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tools Registry ({tools.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1 ${
              activeTab === 'audit' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Audit Ledger</span>
            {pendingApprovals.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {pendingApprovals.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Consequential Action Approval Prompt (If Any Pending) */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/60 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Consequential Actions Awaiting Operator Verification</span>
          </div>

          <div className="space-y-2">
            {pendingApprovals.map((pa) => (
              <div
                key={pa.id}
                className="p-3 rounded-xl bg-slate-900 border border-amber-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-100">Tool: {pa.toolName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 font-mono">
                      Requested by {pa.requestedByAgent}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    Input: {JSON.stringify(pa.input)}
                  </p>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => handleApprovePending(pa.id, false)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApprovePending(pa.id, true)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Authorize</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === 'registry' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tool List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              Registered Framework Tools
            </h3>
            <div className="space-y-2">
              {tools.map((t) => {
                const isSelected = selectedTool?.name === t.name;
                return (
                  <button
                    key={t.name}
                    onClick={() => handleSelectTool(t)}
                    className={`w-full p-3 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/40 text-slate-100'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{t.name}</span>
                      {t.isConsequential && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                          Consequential
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                      {t.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tool Inspector & Interactive Execution Box */}
          <div className="lg:col-span-2 space-y-4">
            {selectedTool && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-slate-100">{selectedTool.name}</h3>
                    {selectedTool.isConsequential && (
                      <span className="text-[10px] text-amber-400 font-mono flex items-center space-x-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Requires Verification Gate</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{selectedTool.description}</p>
                </div>

                {/* Parameters Schema */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400">Parameter Schema</span>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                    {JSON.stringify(selectedTool.parameters, null, 2)}
                  </div>
                </div>

                {/* Arguments Editor */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400">Execution Arguments (JSON)</span>
                  <textarea
                    value={toolArgsJson}
                    onChange={(e) => setToolArgsJson(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={handleExecuteTool}
                  disabled={isExecuting}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  {isExecuting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>Execute Tool Test</span>
                </button>

                {/* Result Output */}
                {testResult && (
                  <div className="space-y-1 pt-2">
                    <span className="text-[11px] font-bold text-slate-400">Output Result</span>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {JSON.stringify(testResult, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Immutable Audit Ledger */
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            Immutable Tool Execution Ledger
          </div>

          <div className="space-y-2">
            {auditLog.map((audit) => (
              <div
                key={audit.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-amber-400">{audit.toolName}</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      by {audit.requestedByAgent}
                    </span>
                    {audit.consequential && (
                      <span className="text-[9px] uppercase font-bold px-1 rounded bg-amber-950 text-amber-400 border border-amber-900">
                        Consequential
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] font-mono">
                    <span className="text-slate-500">{audit.executionTimeMs}ms</span>
                    <span
                      className={`font-bold uppercase ${
                        audit.status === 'success'
                          ? 'text-emerald-400'
                          : audit.status === 'awaiting_approval'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {audit.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-400 truncate">
                    Input: {JSON.stringify(audit.input)}
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-emerald-300 truncate">
                    Output: {typeof audit.output === 'object' ? JSON.stringify(audit.output) : String(audit.output)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
