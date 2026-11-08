import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ChatScreen } from './components/ChatScreen';
import { PlannerScreen } from './components/PlannerScreen';
import { AgentsScreen } from './components/AgentsScreen';
import { MemoryScreen } from './components/MemoryScreen';
import { KnowledgeScreen } from './components/KnowledgeScreen';
import { WorkspaceScreen } from './components/WorkspaceScreen';
import { ToolsScreen } from './components/ToolsScreen';
import { ModelsScreen } from './components/ModelsScreen';
import { EvaluationScreen } from './components/EvaluationScreen';
import { AndroidScreen } from './components/AndroidScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AndroidFrame } from './components/AndroidFrame';
import { ActiveScreen, ChatSession, ChatMessage, UserProfile, ModelOption } from './types';
import { api } from './services/api';
import { Sparkles, Brain, Cpu } from 'lucide-react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('chat');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [activeModel, setActiveModel] = useState<string>('gemini-3.8-flash');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    // Initial splash sequence
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1100);

    initApp();
    return () => clearTimeout(timer);
  }, []);

  const initApp = async () => {
    try {
      const [meRes, modelsList, sessionsList, auditList] = await Promise.all([
        api.getMe(),
        api.getModels(),
        api.getSessions(),
        api.getToolAudit(),
      ]);

      setUser(meRes.user);
      setModels(modelsList);
      setSessions(sessionsList);

      const pending = auditList.filter((a) => a.status === 'awaiting_approval').length;
      setPendingApprovalsCount(pending);

      if (sessionsList.length > 0) {
        const firstId = sessionsList[0].id;
        setCurrentSessionId(firstId);
        loadMessages(firstId);
      } else {
        // Create initial default session
        const newSess = await api.createSession('Autonomous Intelligence Task', 'gemini-3.8-flash');
        setSessions([newSess]);
        setCurrentSessionId(newSess.id);
        loadMessages(newSess.id);
      }
    } catch (err: unknown) {
      console.error('App init failed:', err);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const msgs = await api.getMessages(sessionId);
      setMessages(msgs);
    } catch (err: unknown) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (content: string) => {
    let targetSessionId = currentSessionId;

    if (!targetSessionId) {
      const title = content.slice(0, 32) || 'New Intelligence Task';
      const newSession = await api.createSession(title, activeModel);
      setSessions((prev) => [newSession, ...prev]);
      targetSessionId = newSession.id;
      setCurrentSessionId(targetSessionId);
    }

    // Optimistic user turn
    const optimisticUser: ChatMessage = {
      id: 'optimistic-' + Date.now(),
      sessionId: targetSessionId,
      role: 'user',
      content,
      sequence: messages.length + 1,
      provider: 'gemini',
      model: activeModel,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setIsLoading(true);

    try {
      const result = await api.sendMessage(targetSessionId, content, undefined, activeModel);
      setMessages((prev) => {
        // Replace optimistic with real turn
        const filtered = prev.filter((m) => m.id !== optimisticUser.id);
        return [...filtered, result.userMessage, result.assistantMessage];
      });

      // Refresh audits in case a tool was triggered
      const updatedAudit = await api.getToolAudit();
      const pending = updatedAudit.filter((a) => a.status === 'awaiting_approval').length;
      setPendingApprovalsCount(pending);
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sessionId: targetSessionId,
        role: 'assistant',
        content: `⚠️ Execution Alert: ${(err as Error).message}. Triaging through verification recovery.`,
        sequence: messages.length + 2,
        provider: 'orchestrator',
        model: activeModel,
        confidenceScore: 0,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = async () => {
    try {
      const newSess = await api.createSession('New Task Execution', activeModel);
      setSessions((prev) => [newSess, ...prev]);
      setCurrentSessionId(newSess.id);
      setMessages([]);
      setActiveScreen('chat');
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    loadMessages(sessionId);
    setActiveScreen('chat');
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.deleteSession(sessionId);
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setSessions(remaining);
      if (currentSessionId === sessionId) {
        if (remaining.length > 0) {
          setCurrentSessionId(remaining[0].id);
          loadMessages(remaining[0].id);
        } else {
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleApproveTool = async (auditId: string, approved: boolean) => {
    try {
      await api.approveTool(auditId, approved);
      const updatedAudit = await api.getToolAudit();
      const pending = updatedAudit.filter((a) => a.status === 'awaiting_approval').length;
      setPendingApprovalsCount(pending);
      if (currentSessionId) {
        loadMessages(currentSessionId);
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const activeSession = sessions.find((s) => s.id === currentSessionId) || null;

  // Render current screen content
  const renderScreenContent = () => {
    switch (activeScreen) {
      case 'chat':
        return (
          <ChatScreen
            currentSession={activeSession}
            messages={messages}
            isLoading={isLoading}
            activeModel={activeModel}
            models={models}
            onSendMessage={handleSendMessage}
            onNewSession={handleNewSession}
            onSelectPrompt={(prompt) => handleSendMessage(prompt)}
            onApproveTool={handleApproveTool}
          />
        );
      case 'planner':
        return <PlannerScreen />;
      case 'agents':
        return <AgentsScreen />;
      case 'memory':
        return <MemoryScreen />;
      case 'knowledge':
        return <KnowledgeScreen />;
      case 'workspace':
        return <WorkspaceScreen />;
      case 'tools':
        return <ToolsScreen />;
      case 'models':
        return (
          <ModelsScreen
            activeModel={activeModel}
            onSelectModel={(id) => setActiveModel(id)}
            models={models}
          />
        );
      case 'evaluation':
        return <EvaluationScreen />;
      case 'android':
        return <AndroidScreen />;
      case 'history':
        return (
          <HistoryScreen
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onNewSession={handleNewSession}
          />
        );
      case 'settings':
        return <SettingsScreen user={user} onUserUpdate={initApp} />;
      default:
        return (
          <ChatScreen
            currentSession={activeSession}
            messages={messages}
            isLoading={isLoading}
            activeModel={activeModel}
            models={models}
            onSendMessage={handleSendMessage}
            onNewSession={handleNewSession}
            onSelectPrompt={(prompt) => handleSendMessage(prompt)}
            onApproveTool={handleApproveTool}
          />
        );
    }
  };

  // Splash Screen Overlay
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 select-none">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 animate-pulse">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-xl sm:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
            SUPER INTELLIGENCE AI
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-wider">
            INITIALIZING MULTI-AGENT NEURAL FABRIC...
          </p>
        </div>

        <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden mt-8">
          <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-indigo-500 animate-[loading_1.1s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Header */}
      <Header
        user={user}
        activeModel={activeModel}
        onModelChange={(m) => setActiveModel(m)}
        models={models}
        isMobileFrame={isMobileFrame}
        onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenApprovals={() => setActiveScreen('tools')}
        onOpenMenu={() => setIsMobileDrawerOpen(true)}
      />

      {/* Main Body Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Navigation
          activeScreen={activeScreen}
          onSelectScreen={(screen) => setActiveScreen(screen)}
          isMobileDrawerOpen={isMobileDrawerOpen}
          onCloseDrawer={() => setIsMobileDrawerOpen(false)}
          pendingApprovalsCount={pendingApprovalsCount}
        />

        {/* Workspace Canvas (Full desktop or Android Device Mockup) */}
        <main className="flex-1 overflow-hidden relative">
          {isMobileFrame ? (
            <AndroidFrame>{renderScreenContent()}</AndroidFrame>
          ) : (
            renderScreenContent()
          )}
        </main>
      </div>
    </div>
  );
}
