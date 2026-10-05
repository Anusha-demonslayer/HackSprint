import React from 'react';
import { Eye, Search, GitFork, Brain, Scale, ShieldCheck, CheckCheck } from 'lucide-react';
import { Stats } from '../types';

interface ResponseLoopBarProps {
  stats: Stats | null;
  activeStage?: 'OBSERVE' | 'INVESTIGATE' | 'CORRELATE' | 'REASON' | 'DECIDE' | 'RESPOND' | 'VERIFY';
  isSimulating?: boolean;
}

export const ResponseLoopBar: React.FC<ResponseLoopBarProps> = ({
  stats,
  activeStage = 'REASON',
  isSimulating = false
}) => {
  const stages: { key: typeof activeStage; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'OBSERVE', label: 'OBSERVE', icon: <Eye className="w-3.5 h-3.5" />, desc: 'SIEM & Webhook ingest' },
    { key: 'INVESTIGATE', label: 'INVESTIGATE', icon: <Search className="w-3.5 h-3.5" />, desc: 'Threat intel query' },
    { key: 'CORRELATE', label: 'CORRELATE', icon: <GitFork className="w-3.5 h-3.5" />, desc: 'MITRE ATT&CK graph' },
    { key: 'REASON', label: 'REASON', icon: <Brain className="w-3.5 h-3.5" />, desc: 'Evidence & LLM reasoning' },
    { key: 'DECIDE', label: 'DECIDE', icon: <Scale className="w-3.5 h-3.5" />, desc: 'Policy gate & confidence' },
    { key: 'RESPOND', label: 'RESPOND', icon: <ShieldCheck className="w-3.5 h-3.5" />, desc: 'Autonomous containment' },
    { key: 'VERIFY', label: 'VERIFY', icon: <CheckCheck className="w-3.5 h-3.5" />, desc: 'SHA-256 audit proof' },
  ];

  return (
    <div className="bg-[#0D131F]/90 border border-slate-800/90 rounded-xl p-5 shadow-xl shadow-black/40">
      {/* Top row: Status & High-level counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="text-[11px] font-semibold text-cyan-400 tracking-wider uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            AUTONOMOUS RESPONSE STATUS
          </div>
          <div className="text-sm font-semibold text-slate-200 mt-0.5">
            Continuous Closed-Loop Detection & Neutralization
          </div>
        </div>

        {/* Quantified Counter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 text-xs">
          <div>
            <div className="text-[11px] text-slate-400">THREATS DETECTED</div>
            <div className="text-xl font-bold font-mono-nums text-slate-100">
              {stats?.threatsDetected ?? 42}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">THREATS INVESTIGATED</div>
            <div className="text-xl font-bold font-mono-nums text-indigo-400">
              {stats?.threatsInvestigated ?? 39}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">THREATS CONTAINED</div>
            <div className="text-xl font-bold font-mono-nums text-emerald-400">
              {stats?.threatsContained ?? 28}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">ESCALATED TO SOC</div>
            <div className="text-xl font-bold font-mono-nums text-amber-400">
              {stats?.escalated ?? 11}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: The Animated AI Loop */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider text-slate-300">
            Autonomous Incident Response Loop
          </span>
          <span className="font-mono-nums text-cyan-400/90 text-[10px]">
            {isSimulating ? '● Active Live Telemetry Trace' : 'Standing By / Real-Time Intercept'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {stages.map((st, idx) => {
            const isCurrent = activeStage === st.key;
            return (
              <div
                key={st.key}
                className={`relative p-2.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/40 border-slate-800/70 hover:border-slate-700/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`${isCurrent ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`}>
                      {st.icon}
                    </span>
                    <span className={`text-[11px] font-bold tracking-wider ${isCurrent ? 'text-cyan-200' : 'text-slate-300'}`}>
                      {st.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-nums text-slate-400">0{idx + 1}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {st.desc}
                </div>
                {isCurrent && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-cyan-400 animate-pulse"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
