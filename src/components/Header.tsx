import React from 'react';
import {
  Brain,
  Smartphone,
  Monitor,
  Cpu,
  AlertTriangle,
  Menu,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { UserProfile, ModelOption } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  activeModel: string;
  onModelChange: (model: string) => void;
  models: ModelOption[];
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  pendingApprovalsCount: number;
  onOpenApprovals: () => void;
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeModel,
  onModelChange,
  models,
  isMobileFrame,
  onToggleFrame,
  pendingApprovalsCount,
  onOpenApprovals,
  onOpenMenu,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-3 md:px-5 flex items-center justify-between z-30 select-none">
      {/* Brand & Status */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMenu}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/20">
            <Brain className="w-4 h-4 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
                SUPER INTELLIGENCE
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-400 tracking-widest hidden sm:inline-block">
                AI CORE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center space-x-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Multi-Agent Mesh Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Consequential action alert badge */}
        {pendingApprovalsCount > 0 && (
          <button
            onClick={onOpenApprovals}
            className="flex items-center space-x-1.5 text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-lg transition animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-semibold hidden sm:inline">Verification Req.</span>
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
              {pendingApprovalsCount}
            </span>
          </button>
        )}

        {/* Quick Model Selector */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 space-x-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={activeModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="bg-transparent text-xs text-slate-200 font-medium outline-none cursor-pointer max-w-[130px] sm:max-w-[180px] truncate"
            aria-label="Select AI Model"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Phone / Desktop View Toggle */}
        <button
          onClick={onToggleFrame}
          title={isMobileFrame ? 'Switch to Full Desktop View' : 'Preview Android Phone Frame'}
          className="flex items-center space-x-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg transition"
        >
          {isMobileFrame ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Desktop</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Android Frame</span>
            </>
          )}
        </button>

        {/* User tag */}
        <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
            {user?.username?.[0]?.toUpperCase() || 'O'}
          </div>
          <span className="text-xs text-slate-400 font-mono">@{user?.username || 'operator'}</span>
        </div>
      </div>
    </header>
  );
};
