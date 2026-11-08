import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Wrench,
  Clock,
  Layers,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { ChatMessage, ChatSession, ModelOption } from '../types';
import { api } from '../services/api';

interface ChatScreenProps {
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  activeModel: string;
  models: ModelOption[];
  onSendMessage: (content: string) => Promise<void>;
  onNewSession: () => void;
  onSelectPrompt: (prompt: string) => void;
  onApproveTool: (auditId: string, approved: boolean) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  currentSession,
  messages,
  isLoading,
  activeModel,
  models,
  onSendMessage,
  onNewSession,
  onSelectPrompt,
  onApproveTool,
}) => {
  const [input, setInput] = useState('');
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    onSendMessage(text);
  };

  const toggleReasoning = (msgId: string) => {
    setExpandedReasoning((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = async (messageId: string, rating: 'thumbs_up' | 'thumbs_down') => {
    try {
      await api.sendFeedback(messageId, rating);
      setFeedbackSent((prev) => ({ ...prev, [messageId]: rating }));
    } catch (err) {
      console.error('Feedback failed:', err);
    }
  };

  const promptSuggestions = [
    {
      label: 'Build Android Compose App',
      text: 'Scaffold an Android Jetpack Compose application with Material 3, Dark Mode, and Capacitor bridge configuration.',
      icon: '📱',
    },
    {
      label: 'Decompose Multi-Step Task',
      text: 'Create a hierarchical execution plan for developing a multi-agent autonomous research and verification pipeline.',
      icon: '⚡',
    },
    {
      label: 'Run Security & Logic Audit',
      text: 'Audit the tool execution framework for consequential actions and verify that human-in-the-loop guardrails are strictly enforced.',
      icon: '🛡️',
    },
    {
      label: 'Synthesize Research Literature',
      text: 'Synthesize recent consensus on autonomous multi-agent orchestration versus monolithic LLM reasoning.',
      icon: '🔬',
    },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-text overflow-hidden relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-5 pb-24 md:pb-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto text-center px-4 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-cyan-500/20">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100">
                SUPER INTELLIGENCE AI
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
                Autonomous agentic platform with multi-model routing (Gemini 3.8 Flash, Gemini 4 Argon, Groq), hierarchical task planning, and deep episodic memory.
              </p>
            </div>

            {/* Prompt Starter Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-2">
              {promptSuggestions.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(p.text);
                    onSelectPrompt(p.text);
                  }}
                  className="flex items-start text-left p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 transition group cursor-pointer"
                >
                  <span className="text-base mr-2.5 mt-0.5">{p.icon}</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                      {p.label}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {p.text}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === 'user';
            const hasReasoning = m.reasoningSteps && m.reasoningSteps.length > 0;
            const isReasoningOpen = expandedReasoning[m.id] ?? false;
            const userFeedback = feedbackSent[m.id] || m.feedback?.rating;

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-4xl mx-auto w-full`}
              >
                {/* Meta Header */}
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-1 px-1">
                  {isUser ? (
                    <>
                      <span className="font-semibold text-slate-300">You</span>
                      <User className="w-3 h-3 text-cyan-400" />
                    </>
                  ) : (
                    <>
                      <div className="w-3.5 h-3.5 rounded bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center">
                        <Bot className="w-2.5 h-2.5 text-cyan-400" />
                      </div>
                      <span className="font-semibold text-cyan-300">
                        {m.agentId ? m.agentId.replace('agent-', '').toUpperCase() + ' AGENT' : 'AI ORCHESTRATOR'}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {m.model || activeModel}
                      </span>
                      {m.latencyMs && (
                        <>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400 font-mono text-[10px] flex items-center">
                            <Clock className="w-2.5 h-2.5 mr-0.5" />
                            {m.latencyMs}ms
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`w-full max-w-[94%] sm:max-w-[88%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none shadow-md shadow-black/40'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words font-sans">{m.content}</div>

                  {/* Tools Executed Block */}
                  {m.toolsUsed && m.toolsUsed.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="text-[11px] font-bold text-amber-400 flex items-center space-x-1">
                        <Wrench className="w-3 h-3" />
                        <span>Tools Executed by Agent Mesh:</span>
                      </div>
                      {m.toolsUsed.map((t, tIdx) => (
                        <div
                          key={tIdx}
                          className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono"
                        >
                          <div className="flex items-center justify-between text-amber-300 mb-1">
                            <span>tool: {t.tool}</span>
                            <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                              {t.status}
                            </span>
                          </div>
                          {t.output && (
                            <div className="text-[11px] text-slate-400 overflow-x-auto max-h-24 whitespace-pre">
                              {t.output}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reasoning & Deliberation Accordion */}
                  {hasReasoning && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80">
                      <button
                        onClick={() => toggleReasoning(m.id)}
                        className="w-full flex items-center justify-between py-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Layers className="w-3.5 h-3.5 text-cyan-400" />
                          <span>
                            Deliberation Trace ({m.reasoningSteps?.length} verification passes)
                          </span>
                        </div>
                        {isReasoningOpen ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isReasoningOpen && (
                        <div className="mt-2 space-y-2 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80 text-xs">
                          {m.reasoningSteps?.map((s) => (
                            <div
                              key={s.step}
                              className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-cyan-300 flex items-center space-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                  <span>{s.agent}: {s.type.replace('_', ' ').toUpperCase()}</span>
                                </span>
                                {s.confidence && (
                                  <span className="text-[10px] font-mono text-emerald-400">
                                    {(s.confidence * 100).toFixed(1)}% verified
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-300">{s.description}</p>
                              {s.details && (
                                <p className="text-[10px] font-mono text-slate-400 bg-slate-950/60 p-1.5 rounded">
                                  {s.details}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions for Assistant Message */}
                {!isUser && (
                  <div className="flex items-center space-x-3 mt-1.5 px-2 text-slate-400 text-xs">
                    <button
                      onClick={() => copyToClipboard(m.content, m.id)}
                      className="flex items-center space-x-1 hover:text-slate-200 transition"
                      title="Copy response"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 text-[10px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px]">Copy</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleFeedback(m.id, 'thumbs_up')}
                        className={`p-1 rounded hover:bg-slate-800 transition ${
                          userFeedback === 'thumbs_up' ? 'text-emerald-400' : 'hover:text-slate-200'
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleFeedback(m.id, 'thumbs_down')}
                        className={`p-1 rounded hover:bg-slate-800 transition ${
                          userFeedback === 'thumbs_down' ? 'text-rose-400' : 'hover:text-slate-200'
                        }`}
                        title="Needs improvement"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>

                    {m.confidenceScore && (
                      <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Confidence {m.confidenceScore}%</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Live Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-3 max-w-4xl mx-auto w-full p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-xs text-cyan-300">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <div className="flex-1 font-mono flex items-center space-x-2">
              <span>Orchestrating agents across reasoning tree...</span>
              <span className="text-[10px] text-slate-400">[Planning → Coding → Verification]</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Action Console */}
      <div className="p-3 sm:p-4 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-md z-20">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex items-end space-x-2 bg-slate-900 border border-slate-800 focus-within:border-cyan-500/80 rounded-2xl p-2 transition shadow-inner">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything, formulate multi-step software tasks, or request Android build..."
              rows={2}
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none resize-none px-2 py-1 max-h-36 leading-relaxed"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold transition shadow-md shadow-cyan-950/50 flex-shrink-0 cursor-pointer"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4 text-slate-950" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Multi-Agent Swarm Ready</span>
            </div>
            <div className="hidden sm:block">
              <span>Enter to send • Shift+Enter for newline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
