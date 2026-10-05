import React from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  Crosshair, 
  Cpu, 
  Search, 
  Zap, 
  GitCommit, 
  Activity, 
  FileCheck2, 
  Network, 
  Sliders,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { TabType, Stats } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  stats?: Stats | null;
  agentOnline?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  agentOnline = true
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    { id: 'command_center', label: 'Command Center', icon: <Terminal className="w-4 h-4" /> },
    { 
      id: 'incidents', 
      label: 'Live Incidents', 
      icon: <Crosshair className="w-4 h-4" />, 
      badge: stats?.activeIncidents ?? 7,
      badgeColor: 'text-rose-400 bg-rose-950/50 border border-rose-800/60'
    },
    { id: 'investigation', label: 'AI Investigation', icon: <Cpu className="w-4 h-4" /> },
    { id: 'threat_intel', label: 'Threat Intelligence', icon: <Search className="w-4 h-4" /> },
    { 
      id: 'actions', 
      label: 'Response Actions', 
      icon: <Zap className="w-4 h-4" />,
      badge: stats?.aiActions ?? 34,
      badgeColor: 'text-cyan-400 bg-cyan-950/50 border border-cyan-800/60'
    },
    { id: 'timeline', label: 'Attack Timeline', icon: <GitCommit className="w-4 h-4" /> },
    { id: 'agent_activity', label: 'Agent Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Trail', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations (n8n)', icon: <Network className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#0B0F17]/95 border-r border-slate-800/80 flex flex-col justify-between select-none">
      <div>
        {/* Brand Lockup */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold tracking-wider text-sm text-slate-100 flex items-center gap-1.5">
                SECOPS-PULSE
              </div>
              <div className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Autonomous SOC Agent
              </div>
            </div>
          </div>
        </div>

        {/* Agent Operational Status Pill */}
        <div className="p-3 mx-3 my-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 tracking-wide uppercase">
                {agentOnline ? 'Agent Active' : 'Connecting...'}
              </span>
            </div>
            <span className="text-[10px] font-mono-nums text-slate-400">v1.2-AI</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tier-1 Autonomous</span>
            <span className="text-cyan-400 font-mono-nums">3.8s avg</span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="px-2 py-1 space-y-0.5">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-mono-nums px-1.5 py-0.2 rounded ${item.badgeColor || 'text-slate-400 bg-slate-800'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080B10]/60 text-[11px]">
        <div className="flex items-center justify-between text-slate-400">
          <span>Engine</span>
          <span className="text-indigo-400 font-medium">Gemini 3.8 / Rules</span>
        </div>
        <div className="flex items-center justify-between text-slate-400 mt-1">
          <span>Policy Guard</span>
          <span className="text-emerald-400">HITL Enabled</span>
        </div>
      </div>
    </aside>
  );
};
