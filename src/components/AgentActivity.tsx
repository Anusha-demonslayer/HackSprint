import React, { useState } from 'react';
import { 
  Activity, 
  Eye, 
  Search, 
  GitFork, 
  Brain, 
  Scale, 
  ShieldCheck, 
  CheckCheck, 
  Clock, 
  RefreshCw,
  Zap,
  Filter
} from 'lucide-react';
import { AgentActivityItem } from '../types';

interface AgentActivityProps {
  activities: AgentActivityItem[];
  onRefresh?: () => void;
}

export const AgentActivity: React.FC<AgentActivityProps> = ({
  activities,
  onRefresh
}) => {
  const [selectedStage, setSelectedStage] = useState<string>('ALL');

  const stageIcons: Record<string, React.ReactNode> = {
    OBSERVE: <Eye className="w-3.5 h-3.5 text-cyan-400" />,
    ENRICH: <Search className="w-3.5 h-3.5 text-indigo-400" />,
    CORRELATE: <GitFork className="w-3.5 h-3.5 text-blue-400" />,
    REASON: <Brain className="w-3.5 h-3.5 text-purple-400" />,
    DECIDE: <Scale className="w-3.5 h-3.5 text-amber-400" />,
    RESPOND: <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />,
    VERIFY: <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />,
  };

  const filtered = activities.filter(a => selectedStage === 'ALL' || a.stage === selectedStage);

  return (
    <div className="space-y-6 pb-14">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            AI Agent Operational Activity Log
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Microsecond-resolved telemetry trace of autonomous agent perception, enrichment, reasoning, policy gating, and containment execution.
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Stream</span>
          </button>
        )}
      </div>

      {/* Stage Filter Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl text-xs">
        <span className="text-[11px] font-semibold text-slate-400 px-2">Filter Stage:</span>
        {['ALL', 'OBSERVE', 'ENRICH', 'CORRELATE', 'REASON', 'DECIDE', 'RESPOND', 'VERIFY'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStage(st)}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              selectedStage === st
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Activity Timeline Table / Stream */}
      <div className="bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5 shadow-lg">
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No activity logs recorded for this stage filter.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const timeFormatted = new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800/90 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      {stageIcons[item.stage] || <Activity className="w-3.5 h-3.5 text-slate-400" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono-nums font-bold text-slate-300 text-xs">
                          {timeFormatted}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                          {item.stage}
                        </span>
                        <span className="font-mono-nums text-[11px] text-slate-400">
                          [{item.incident_id}]
                        </span>
                      </div>

                      <div className="text-slate-100 font-semibold text-xs mt-1">
                        {item.message}
                      </div>

                      <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed font-mono-nums">
                        {item.details}
                      </div>
                    </div>
                  </div>

                  {/* Latency metric badge */}
                  <div className="shrink-0 flex items-center gap-2 md:flex-col md:items-end font-mono-nums text-[11px]">
                    <span className="text-slate-400">Execution Delta:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold border border-slate-700/80">
                      +{item.latency_ms}ms
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
