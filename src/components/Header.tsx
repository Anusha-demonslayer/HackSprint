import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Bell, 
  User, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Wifi,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  onLaunchSimulation: () => void;
  isSimulating: boolean;
  simulationPhase?: number;
  simulationStage?: string;
  onOpenLogin: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLaunchSimulation,
  isSimulating,
  simulationPhase = 0,
  simulationStage = 'IDLE',
  onOpenLogin,
  activeTab,
  setActiveTab,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 px-6 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs font-semibold tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>AUTONOMOUS AGENT ONLINE</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-mono-nums">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{time}</span>
        </div>

        {isSimulating && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-950/40 border border-cyan-700/50 text-cyan-300 text-xs font-medium animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>SIMULATION IN PROGRESS (Phase {simulationPhase}/8: {simulationStage})</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Flagship Hackathon Attack Simulation Button */}
        <button
          onClick={onLaunchSimulation}
          disabled={isSimulating}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all shadow-lg ${
            isSimulating
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-rose-900/30 border border-rose-500/40 hover:scale-[1.02] active:scale-[0.98]'
          }`}
          title="Trigger end-to-end 8-stage realistic attack simulation (10-18s)"
        >
          {isSimulating ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>SIMULATING ATTACK...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>LAUNCH ATTACK SIMULATION</span>
            </>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setActiveTab('agent_activity')}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800 transition-colors"
            title="Agent Activity stream"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400"></span>
          </button>
        </div>

        {/* User Profile / Demo Login */}
        <button
          onClick={onOpenLogin}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
            SOC
          </div>
          <span className="font-medium hidden sm:inline">Lead Analyst</span>
        </button>
      </div>
    </header>
  );
};
