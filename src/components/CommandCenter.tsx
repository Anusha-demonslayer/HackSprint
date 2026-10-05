import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Check, 
  ArrowUpRight, 
  Activity,
  Flame,
  Radio,
  Sliders
} from 'lucide-react';
import { Stats, SecurityEvent, Incident, TabType } from '../types';
import { AICoreVisualizer } from './AICoreVisualizer';
import { ResponseLoopBar } from './ResponseLoopBar';

interface CommandCenterProps {
  stats: Stats | null;
  events: SecurityEvent[];
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
  setActiveTab: (tab: TabType) => void;
  isSimulating: boolean;
  simulationPhase: number;
  simulationStage: string;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  stats,
  events,
  incidents,
  onSelectIncident,
  setActiveTab,
  isSimulating,
  simulationPhase,
  simulationStage,
}) => {
  const agentStages = [
    { name: 'OBSERVE', desc: 'Telemetry ingested' },
    { name: 'INVESTIGATE', desc: 'Context & IOC enrichment' },
    { name: 'CORRELATE', desc: 'MITRE ATT&CK mapping' },
    { name: 'REASON', desc: 'Evidence & LLM analysis' },
    { name: 'DECIDE', desc: 'Policy authorization' },
    { name: 'RESPOND', desc: 'Autonomous containment' },
    { name: 'VERIFY', desc: 'Zero threat validation' },
  ];

  // 24h timeline hourly mock buckets for visualization
  const hourlyData = [
    { hour: '00:00', critical: 1, high: 2, medium: 4, low: 8 },
    { hour: '04:00', critical: 0, high: 1, medium: 3, low: 5 },
    { hour: '08:00', critical: 2, high: 4, medium: 9, low: 14 },
    { hour: '12:00', critical: 3, high: 6, medium: 12, low: 18 },
    { hour: '16:00', critical: 4, high: 7, medium: 15, low: 22 },
    { hour: '20:00', critical: 2, high: 5, medium: 8, low: 16 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
            SECOPS-PULSE · TIER-1 SOC AUTOMATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-0.5">
            Autonomous AI Incident Response
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            «Don't just detect threats. Understand them and act on them.» Continuous reasoning, policy-governed containment, and immutable auditability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('incidents')}
            className="px-3.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            Browse All Incidents
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className="px-3.5 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-semibold text-cyan-300 border border-cyan-500/30 transition-colors"
          >
            n8n Webhook Status
          </button>
        </div>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono-nums text-slate-100 mt-2">
            {String(stats?.activeIncidents ?? 7).padStart(2, '0')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Requires triage</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-900/40 shadow-sm hover:border-rose-700/60 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Critical Threats</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono-nums text-rose-400 mt-2">
            {String(stats?.criticalThreats ?? 2).padStart(2, '0')}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1">
            <span>Immediate risk</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>AI Actions</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono-nums text-cyan-300 mt-2">
            {String(stats?.aiActions ?? 34).padStart(2, '0')}
          </div>
          <div className="text-[11px] text-cyan-400/80 mt-1">
            <span>Autonomous enforcement</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Average Response</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono-nums text-indigo-300 mt-2">
            {stats?.averageResponse ?? '3.8s'}
          </div>
          <div className="text-[11px] text-indigo-400/80 mt-1">
            <span>Ingest to containment</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-900/40 shadow-sm hover:border-emerald-700/60 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Threats Contained</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono-nums text-emerald-400 mt-2">
            {String(stats?.threatsContained ?? 28).padStart(2, '0')}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            <span>Zero residual risk</span>
          </div>
        </div>
      </div>

      {/* Autonomous Closed-Loop Bar */}
      <ResponseLoopBar 
        stats={stats} 
        activeStage={simulationStage as any || 'REASON'} 
        isSimulating={isSimulating}
      />

      {/* Center 2-Column: AI Core Visualizer & AI Agent Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Hexagonal AI Agent Core Visualizer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Autonomous Agent Neural Core
            </div>
            <span className="text-[10px] font-mono-nums text-slate-400">
              REAL-TIME INTERCEPT & REASONING
            </span>
          </div>
          <AICoreVisualizer 
            currentStage={simulationStage} 
            isSimulating={isSimulating} 
          />
        </div>

        {/* Right: AI Agent Status & 7-Stage Checklist (5 cols) */}
        <div className="lg:col-span-5 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  AI INCIDENT RESPONSE AGENT
                </div>
                <div className="text-[11px] text-slate-400">
                  Tier-1 Autonomous Operations
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/50 text-[10px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </div>
            </div>

            {/* Stage Checklist */}
            <div className="mt-3.5 space-y-2">
              {agentStages.map((stage, idx) => {
                const isPassed = !isSimulating || (idx + 1 <= simulationPhase);
                const isCurrent = isSimulating && (idx + 1 === simulationPhase);

                return (
                  <div
                    key={stage.name}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                        : isPassed
                        ? 'bg-slate-900/40 border-slate-800/60 text-slate-300'
                        : 'bg-slate-900/20 border-slate-800/30 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isPassed ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                      </div>
                      <div>
                        <span className="font-semibold tracking-wide">{stage.name}</span>
                        <span className="text-slate-400 text-[10px] ml-2 hidden sm:inline">
                          {stage.desc}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono-nums text-slate-400">
                      {isPassed ? '✓' : '...'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
            <span>Governance: Dual Policy Gate</span>
            <span className="text-cyan-400 font-mono-nums">HITL &gt; 90%</span>
          </div>
        </div>
      </div>

      {/* Row 3: Live Threat Activity Stream & Threat Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Real-time Live Event Feed (6 cols) */}
        <div className="lg:col-span-6 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                LIVE THREAT ACTIVITY
              </h2>
            </div>
            <span className="text-[10px] font-mono-nums text-slate-400">
              REAL-TIME EVENT STREAM
            </span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {events.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No telemetry events logged yet.
              </div>
            ) : (
              events.slice(0, 7).map((ev) => {
                const timeStr = ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : '18:42:31';
                const severityClass = 
                  ev.severity === 'CRITICAL' ? 'text-rose-400 bg-rose-950/40 border-rose-800/50' :
                  ev.severity === 'HIGH' ? 'text-amber-400 bg-amber-950/40 border-amber-800/50' :
                  ev.severity === 'MEDIUM' ? 'text-yellow-400 bg-yellow-950/40 border-yellow-800/50' :
                  'text-slate-400 bg-slate-900 border-slate-800';

                return (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/70 hover:border-slate-700 transition-colors flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="font-mono-nums text-[11px] text-slate-400 shrink-0 mt-0.5">
                        {timeStr}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 border ${severityClass}`}>
                        {ev.severity}
                      </span>
                      <div>
                        <div className="font-medium text-slate-200 text-xs leading-snug">
                          {ev.description}
                        </div>
                        {ev.user && (
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono-nums">
                            user: <span className="text-slate-300">{ev.user}</span>
                            {ev.source_ip && <> · ip: <span className="text-cyan-400">{ev.source_ip}</span></>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Threat Overview & Decision Distribution (6 cols) */}
        <div className="lg:col-span-6 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                THREAT OVERVIEW & AI DECISION DISTRIBUTION
              </h2>
              <span className="text-[10px] font-mono-nums text-slate-400">LAST 24 HOURS</span>
            </div>

            {/* 24-hour timeline bar chart */}
            <div className="space-y-1.5 mb-5">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">
                Events by Severity (24h)
              </div>
              <div className="grid grid-cols-6 gap-2 pt-2">
                {hourlyData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-full bg-slate-800/60 rounded-t h-20 flex flex-col justify-end p-1 gap-0.5">
                      <div style={{ height: `${d.critical * 8}%` }} className="w-full bg-rose-500 rounded-xs"></div>
                      <div style={{ height: `${d.high * 6}%` }} className="w-full bg-amber-500 rounded-xs"></div>
                      <div style={{ height: `${d.medium * 4}%` }} className="w-full bg-yellow-500 rounded-xs"></div>
                      <div style={{ height: `${d.low * 2}%` }} className="w-full bg-slate-600 rounded-xs"></div>
                    </div>
                    <span className="text-[9px] font-mono-nums text-slate-400 mt-1">{d.hour}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-rose-500"></span> Critical</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-amber-500"></span> High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-yellow-500"></span> Medium</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-slate-600"></span> Low</span>
              </div>
            </div>

            {/* AI Decision Distribution */}
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase mb-2">
                AI Decision Distribution
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                  <div className="text-emerald-400 font-bold font-mono-nums text-lg">68%</div>
                  <div className="text-[10px] text-slate-300 font-medium">Auto-Contained</div>
                  <div className="text-[9px] text-slate-400">Reversible/Zero risk</div>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30">
                  <div className="text-amber-400 font-bold font-mono-nums text-lg">22%</div>
                  <div className="text-[10px] text-slate-300 font-medium">Escalated to SOC</div>
                  <div className="text-[9px] text-slate-400">High blast radius</div>
                </div>

                <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-900/30">
                  <div className="text-cyan-400 font-bold font-mono-nums text-lg">7%</div>
                  <div className="text-[10px] text-slate-300 font-medium">Monitoring</div>
                  <div className="text-[9px] text-slate-400">Low confidence</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
                  <div className="text-slate-400 font-bold font-mono-nums text-lg">3%</div>
                  <div className="text-[10px] text-slate-300 font-medium">False Positive</div>
                  <div className="text-[9px] text-slate-400">Benign baseline</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Decision latency: 420ms average</span>
            <span className="text-emerald-400 font-mono-nums">0 False Drops</span>
          </div>
        </div>
      </div>

      {/* Row 4: Active Incidents Table Snapshot */}
      <div className="bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              PRIORITY INCIDENT QUEUE
            </h2>
            <p className="text-[11px] text-slate-400">
              Click any incident to open the complete structured AI investigation and decision panel
            </p>
          </div>
          <button
            onClick={() => setActiveTab('incidents')}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2.5 font-semibold">Incident ID</th>
                <th className="pb-2.5 font-semibold">Severity</th>
                <th className="pb-2.5 font-semibold">Detection</th>
                <th className="pb-2.5 font-semibold">User</th>
                <th className="pb-2.5 font-semibold">Source IP</th>
                <th className="pb-2.5 font-semibold">MITRE</th>
                <th className="pb-2.5 font-semibold">AI Confidence</th>
                <th className="pb-2.5 font-semibold">Status</th>
                <th className="pb-2.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incidents.slice(0, 4).map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => {
                    onSelectIncident(inc);
                    setActiveTab('investigation');
                  }}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 font-mono-nums font-bold text-cyan-400 group-hover:text-cyan-300">
                    {inc.incident_id}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      inc.severity === 'CRITICAL' ? 'text-rose-400 bg-rose-950/40 border-rose-800/60' :
                      inc.severity === 'HIGH' ? 'text-amber-400 bg-amber-950/40 border-amber-800/60' :
                      'text-yellow-400 bg-yellow-950/40 border-yellow-800/60'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-200">
                    {inc.detection}
                  </td>
                  <td className="py-3 text-slate-400 font-mono-nums truncate max-w-[140px]">
                    {inc.user}
                  </td>
                  <td className="py-3 text-slate-400 font-mono-nums">
                    {inc.source_ip}
                  </td>
                  <td className="py-3 text-slate-300 font-mono-nums text-[11px]">
                    {inc.mitre_technique.split('—')[0].trim()}
                  </td>
                  <td className="py-3 font-mono-nums text-slate-200 font-semibold">
                    {inc.confidence}%
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.status === 'CONTAINED' ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/50' :
                      inc.status === 'CONTAINMENT_IN_PROGRESS' ? 'text-cyan-300 bg-cyan-950/50 border border-cyan-700 animate-pulse' :
                      inc.status === 'INVESTIGATING' ? 'text-indigo-300 bg-indigo-950/40 border border-indigo-800' :
                      'text-amber-400 bg-amber-950/40 border border-amber-800/50'
                    }`}>
                      {inc.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-cyan-400 text-xs font-semibold group-hover:underline">
                      Investigate →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
