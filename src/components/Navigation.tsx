import React from 'react';
import {
  MessageSquare,
  Workflow,
  BrainCircuit,
  Database,
  BookOpen,
  Code2,
  Wrench,
  Cpu,
  LineChart,
  Smartphone,
  History,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';
import { ActiveScreen } from '../types';

interface NavigationProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  isMobileDrawerOpen: boolean;
  onCloseDrawer: () => void;
  pendingApprovalsCount: number;
}

export const NAV_ITEMS = [
  { id: 'chat', label: 'AI Chat', icon: MessageSquare, category: 'Core' },
  { id: 'planner', label: 'Task Planner', icon: Workflow, category: 'Intelligence' },
  { id: 'agents', label: 'Agents Mesh', icon: BrainCircuit, category: 'Intelligence' },
  { id: 'memory', label: 'Memory', icon: Database, category: 'Knowledge' },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, category: 'Knowledge' },
  { id: 'workspace', label: 'Code Sandbox', icon: Code2, category: 'Engineering' },
  { id: 'tools', label: 'Agent Tools', icon: Wrench, category: 'Engineering' },
  { id: 'models', label: 'Models & Fallback', icon: Cpu, category: 'System' },
  { id: 'evaluation', label: 'Evaluation & Benchmarks', icon: LineChart, category: 'System' },
  { id: 'android', label: 'Android / APK', icon: Smartphone, category: 'Engineering' },
  { id: 'history', label: 'Sessions', icon: History, category: 'Core' },
  { id: 'settings', label: 'Settings', icon: Settings, category: 'System' },
] as const;

export const Navigation: React.FC<NavigationProps> = ({
  activeScreen,
  onSelectScreen,
  isMobileDrawerOpen,
  onCloseDrawer,
  pendingApprovalsCount,
}) => {
  // Mobile Quick Bottom Bar (Top 5 primary screens)
  const mobileBottomScreens: ActiveScreen[] = ['chat', 'planner', 'agents', 'workspace', 'android'];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-56 lg:w-64 border-r border-slate-800/80 bg-slate-950/80 select-none flex-shrink-0">
        <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
          {/* Quick System Badge */}
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-950/50 via-slate-900 to-indigo-950/40 border border-cyan-800/30">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>SUPER INTELLIGENCE</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              8 Autonomous Agents • Reasoning Engine • Memory Graph
            </p>
          </div>

          {/* Navigation Sections */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
              Autonomous Suite
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectScreen(item.id as ActiveScreen)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'tools' && pendingApprovalsCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                      {pendingApprovalsCount}
                    </span>
                  )}
                  {item.id === 'android' && (
                    <span className="text-[9px] font-bold px-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                      APK
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Engine v1.0.0</span>
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Ready</span>
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Slide-in menu) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-sm flex">
          <div className="w-72 bg-slate-950 h-full border-r border-slate-800 p-4 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold text-xs">
                    SI
                  </div>
                  <span className="font-bold text-sm text-slate-100">Super Intelligence</span>
                </div>
                <button
                  onClick={onCloseDrawer}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectScreen(item.id as ActiveScreen);
                        onCloseDrawer();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.id === 'tools' && pendingApprovalsCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                          {pendingApprovalsCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              Android-Ready Agentic Architecture
            </div>
          </div>

          <div className="flex-1" onClick={onCloseDrawer} />
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around px-2 z-40 select-none">
        {mobileBottomScreens.map((screenId) => {
          const item = NAV_ITEMS.find((n) => n.id === screenId);
          if (!item) return null;
          const Icon = item.icon;
          const isActive = activeScreen === screenId;
          return (
            <button
              key={screenId}
              onClick={() => onSelectScreen(screenId)}
              className={`flex flex-col items-center justify-center w-14 py-1 transition ${
                isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-medium leading-none">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
