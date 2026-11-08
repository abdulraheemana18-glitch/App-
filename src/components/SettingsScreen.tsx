import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  ShieldCheck,
  Cpu,
  Moon,
  Sun,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface SettingsScreenProps {
  user: UserProfile | null;
  onUserUpdate: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ user, onUserUpdate }) => {
  const [reasoningDepth, setReasoningDepth] = useState<'standard' | 'deep' | 'exhaustive'>(
    user?.preferences?.reasoningDepth || 'deep'
  );
  const [autoApproveTools, setAutoApproveTools] = useState<boolean>(
    user?.preferences?.autoApproveTools ?? false
  );
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserSwitch, setSelectedUserSwitch] = useState<string>(user?.id || 'usr-primary-001');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.getUsers();
      setAllUsers(res.users);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleSwitchUser = async (userId: string) => {
    api.setToken(userId);
    setSelectedUserSwitch(userId);
    onUserUpdate();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8 space-y-6 select-text">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800/40 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm mb-1">
            <Settings className="w-4 h-4" />
            <span>PLATFORM CONFIGURATION & PREFERENCES</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Configure agent deliberation depth, tool execution security gates, active operator profiles, and environment telemetry.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deliberation & Reasoning Depth */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Reasoning Engine Depth</span>
          </h3>
          <p className="text-xs text-slate-400">
            Controls the number of decomposition and contradiction verification passes performed before finalizing outputs:
          </p>

          <div className="space-y-2">
            {[
              { id: 'standard', name: 'Standard Reasoning', desc: '1-pass fast decomposition for simple tasks' },
              { id: 'deep', name: 'Deep Deliberation (Recommended)', desc: 'Multi-agent hypothesis testing & evidence review' },
              { id: 'exhaustive', name: 'Exhaustive STEM / Code Audit', desc: 'Full tree-of-thought verification & contradiction check' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition ${
                  reasoningDepth === opt.id
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-slate-100'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <input
                  type="radio"
                  name="reasoningDepth"
                  value={opt.id}
                  checked={reasoningDepth === opt.id}
                  onChange={() => setReasoningDepth(opt.id as any)}
                  className="mt-0.5 text-cyan-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-200">{opt.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Security & Tool Verification Gates */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Tool Security & Consequential Actions</span>
          </h3>
          <p className="text-xs text-slate-400">
            Consequential actions (file overwrites, destructive system commands, network sync) strictly require explicit human verification by default.
          </p>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Auto-Approve Safe Read Tools</div>
                <div className="text-[11px] text-slate-400">Allow web research and memory reads without prompting.</div>
              </div>
              <input
                type="checkbox"
                checked={true}
                disabled
                className="rounded text-cyan-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Require Verification on Consequential Actions</div>
                <div className="text-[11px] text-slate-400">Filesystem writes and Android APK compilation require operator sign-off.</div>
              </div>
              <input
                type="checkbox"
                checked={true}
                disabled
                className="rounded text-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* User Profile & Account Switcher */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Active Operator Profile</span>
          </h3>
          <p className="text-xs text-slate-400">
            Switch between simulated multi-user roles or verify credentials:
          </p>

          <div className="space-y-2">
            {allUsers.map((u) => {
              const isSelected = selectedUserSwitch === u.id;
              return (
                <div
                  key={u.id}
                  onClick={() => handleSwitchUser(u.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-slate-100'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-900/60 border border-cyan-700/60 flex items-center justify-center text-xs font-bold text-cyan-300">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-200">@{u.username}</span>
                      <span className="text-[10px] text-slate-500 block">{u.email}</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                    {u.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Runtime Diagnostics */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>System Information & Standards</span>
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-500">Platform:</span>
              <span className="text-slate-200">SUPER INTELLIGENCE AI</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-500">SDK:</span>
              <span className="text-slate-200">@google/genai &gt;= 2.25.0</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-500">Target Android SDK:</span>
              <span className="text-slate-200">API Level 34 (Android 14)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-slate-500">Architecture:</span>
              <span className="text-slate-200">Autonomous Multi-Agent Mesh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
