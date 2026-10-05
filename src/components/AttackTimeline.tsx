import React from 'react';
import { 
  ShieldAlert, 
  Key, 
  LogIn, 
  Database, 
  Cpu, 
  Lock, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Incident } from '../types';

interface AttackTimelineProps {
  incident: Incident;
}

export const AttackTimeline: React.FC<AttackTimelineProps> = ({ incident }) => {
  const timelineMilestones = [
    {
      time: '18:40:12',
      title: 'Initial Failed Login Probe',
      desc: 'Single anomalous password failure against SSO OAuth endpoint from untrusted external IP.',
      actor: '185.220.101.5',
      icon: <Key className="w-4 h-4 text-amber-400" />,
      severity: 'LOW',
      badge: 'PROBE',
      stage: 'DETECT'
    },
    {
      time: '18:41:45',
      title: 'Multiple Failed Logins Spike',
      desc: '17 consecutive failed authentication attempts within 180 seconds. Velocity threshold breached.',
      actor: '185.220.101.5',
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
      severity: 'MEDIUM',
      badge: 'BURST DETECTED',
      stage: 'DETECT'
    },
    {
      time: '18:42:04',
      title: 'Successful Authentication Bypass',
      desc: 'Valid authentication session issued from Lagos, Nigeria. Geo-deviation flagged as physically impossible.',
      actor: 'employee_247',
      icon: <LogIn className="w-4 h-4 text-rose-400" />,
      severity: 'CRITICAL',
      badge: 'COMPROMISE',
      stage: 'DETECT'
    },
    {
      time: '18:42:08',
      title: 'Malicious IP & Threat Intel Match',
      desc: 'Autonomous lookup matches IP against AlienVault OTX and AbuseIPDB. 98% malicious Tor Exit Relay.',
      actor: 'Threat Intelligence Engine',
      icon: <Database className="w-4 h-4 text-cyan-400" />,
      severity: 'HIGH',
      badge: 'ENRICHMENT',
      stage: 'ENRICH'
    },
    {
      time: '18:42:15',
      title: 'AI Investigation & MITRE Mapping',
      desc: 'Correlated 5 convergent indicators. Model classifies T1078 Valid Accounts with 96% confidence.',
      actor: 'SecOps-Pulse AI Agent',
      icon: <Cpu className="w-4 h-4 text-indigo-400" />,
      severity: 'CRITICAL',
      badge: 'AI REASONING',
      stage: 'REASON'
    },
    {
      time: '18:42:22',
      title: 'Autonomous Containment Executed',
      desc: 'Policy rule authorized auto-containment: Sessions revoked, user account disabled, source IP blocked.',
      actor: 'Autonomous Response Worker',
      icon: <Lock className="w-4 h-4 text-emerald-400" />,
      severity: 'INFO',
      badge: 'CONTAINMENT',
      stage: 'RESPOND'
    },
    {
      time: '18:42:38',
      title: 'Threat Verified & Audit Signed',
      desc: 'Edge perimeter dropped subsequent probes (100%). Cryptographic SHA-256 fingerprint written to ledger.',
      actor: 'Verification Engine',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      severity: 'SAFE',
      badge: 'CONTAINED ✓',
      stage: 'VERIFY'
    }
  ];

  return (
    <div className="space-y-6 pb-14">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Attack Vector Timeline — {incident.incident_id}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Sequential progression of adversary reconnaissance, credential compromise, autonomous AI reasoning, and verified neutralization.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono-nums text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <span className="text-slate-400">Total Loop Duration:</span>
          <span className="text-cyan-400 font-bold">2m 26s (Containment: 3.8s)</span>
        </div>
      </div>

      {/* Horizontal Visual Stepper (Desktop) */}
      <div className="bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5 overflow-x-auto shadow-lg">
        <div className="min-w-[850px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center justify-between">
            <span>Attack Lifecycle Sequence</span>
            <span className="text-cyan-400 font-mono-nums">Deterministic Progression</span>
          </div>

          <div className="relative flex items-center justify-between">
            {/* Connecting Track Line */}
            <div className="absolute top-5 left-6 right-6 h-0.5 bg-gradient-to-r from-amber-500 via-rose-500 via-indigo-500 to-emerald-500 z-0"></div>

            {timelineMilestones.map((m, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center max-w-[110px] text-center">
                {/* Node circle */}
                <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-lg hover:border-cyan-400 transition-colors">
                  {m.icon}
                </div>
                {/* Time */}
                <span className="font-mono-nums text-[10px] text-slate-400 font-bold mt-2">
                  {m.time}
                </span>
                {/* Title */}
                <span className="text-[11px] font-semibold text-slate-200 mt-0.5 leading-tight">
                  {m.title}
                </span>
                {/* Stage tag */}
                <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold mt-1">
                  {m.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Chronological Event Cards */}
      <div className="bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3">
          Detailed Milestone Telemetry Records
        </div>

        <div className="space-y-3">
          {timelineMilestones.map((m, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800/90 border border-slate-700 flex items-center justify-center shrink-0">
                  {m.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{m.title}</span>
                    <span className="font-mono-nums text-[10px] text-slate-400">({m.time})</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
                      {m.stage}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right font-mono-nums text-[11px] text-slate-400">
                <div>Actor: <span className="text-slate-200">{m.actor}</span></div>
                <div className="text-cyan-400 font-semibold">{m.badge}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
