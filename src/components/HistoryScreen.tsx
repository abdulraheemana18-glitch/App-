import React, { useState } from 'react';
import {
  History,
  MessageSquare,
  Trash2,
  Download,
  Plus,
  Clock,
  Search,
  ExternalLink,
} from 'lucide-react';
import { ChatSession } from '../types';

interface HistoryScreenProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewSession: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onNewSession,
}) => {
  const [search, setSearch] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportAll = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'super-intelligence-sessions.json');
    dlAnchor.click();
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8 space-y-6 select-text">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800/40 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm mb-1">
            <History className="w-4 h-4" />
            <span>SESSION HISTORY & AUDIT LOGS</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Access previous intelligence sessions, multi-turn dialogues, tool execution records, and export task histories.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportAll}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Sessions</span>
          </button>

          <button
            onClick={onNewSession}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task Session</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search previous sessions by title or topic..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Session List */}
      <div className="space-y-2">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No previous chat sessions found. Start a new intelligence task in the AI Chat tab.
          </div>
        ) : (
          filteredSessions.map((s) => {
            const isCurrent = s.id === currentSessionId;
            return (
              <div
                key={s.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-slate-100'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                }`}
                onClick={() => onSelectSession(s.id)}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isCurrent ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-xs truncate">{s.title}</h4>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono mt-0.5">
                      <span>Model: {s.model}</span>
                      <span>•</span>
                      <span>{new Date(s.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(s.id);
                    }}
                    className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Delete Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
