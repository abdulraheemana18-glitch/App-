import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-2 sm:p-4 bg-slate-950">
      {/* Outer Phone Hardware Bezel */}
      <div className="relative w-full max-w-[420px] h-[860px] max-h-[92vh] bg-slate-900 border-[8px] border-slate-800 rounded-[48px] shadow-2xl shadow-cyan-950/40 flex flex-col overflow-hidden ring-1 ring-slate-700/50">
        {/* Android Hardware Volume / Power Button details on edges */}
        <div className="absolute -left-[10px] top-28 w-[3px] h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-[10px] top-44 w-[3px] h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -right-[10px] top-32 w-[3px] h-16 bg-slate-700 rounded-r-sm" />

        {/* Android Top Status Bar */}
        <div className="h-7 bg-slate-950 px-6 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none z-40 flex-shrink-0">
          <span>09:41</span>

          {/* Camera Notch / Dynamic Island */}
          <div className="w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-700" />
          </div>

          <div className="flex items-center space-x-1.5">
            <Signal className="w-3 h-3 text-slate-400" />
            <Wifi className="w-3 h-3 text-slate-400" />
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Phone Content Screen */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 relative">
          {children}
        </div>

        {/* Android Bottom Gesture Navigation Bar */}
        <div className="h-5 bg-slate-950 flex items-center justify-center flex-shrink-0 z-40">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
