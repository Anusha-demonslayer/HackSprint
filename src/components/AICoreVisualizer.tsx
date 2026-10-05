import React from 'react';
import { Shield, Radio, Database, ShieldAlert, Cpu, CheckCircle2, Lock } from 'lucide-react';

interface AICoreVisualizerProps {
  currentStage?: string;
  isSimulating?: boolean;
}

export const AICoreVisualizer: React.FC<AICoreVisualizerProps> = ({
  currentStage = 'IDLE',
  isSimulating = false
}) => {
  const nodes = [
    { id: 'events', label: 'Security Events', icon: <Radio className="w-4 h-4" />, angle: 0, sub: 'SIEM / Webhooks' },
    { id: 'intel', label: 'Threat Intel', icon: <Database className="w-4 h-4" />, angle: 60, sub: 'AlienVault / AbuseIP' },
    { id: 'mitre', label: 'MITRE ATT&CK', icon: <ShieldAlert className="w-4 h-4" />, angle: 120, sub: 'T1078 Mapping' },
    { id: 'risk', label: 'Risk Engine', icon: <Cpu className="w-4 h-4" />, angle: 180, sub: 'Rules + LLM Triage' },
    { id: 'response', label: 'Response Ops', icon: <Lock className="w-4 h-4" />, angle: 240, sub: 'API Enforcement' },
    { id: 'verify', label: 'Verification', icon: <CheckCircle2 className="w-4 h-4" />, angle: 300, sub: 'SHA-256 Audit' },
  ];

  return (
    <div className="relative w-full h-[320px] bg-[#0A0E17]/80 rounded-xl border border-slate-800/80 p-4 flex items-center justify-center overflow-hidden select-none">
      {/* Background subtle cyber grid & glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
      <div className="absolute w-72 h-72 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute w-56 h-56 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none"></div>

      {/* SVG Connecting orbits & data rays */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 320">
        <defs>
          <linearGradient id="cyberLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Orbit Rings */}
        <circle cx="250" cy="160" r="110" fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="250" cy="160" r="60" fill="none" stroke="#0E7490" strokeWidth="1" strokeOpacity="0.3" />

        {/* Dynamic ray lines connecting center to peripheral nodes */}
        {nodes.map((node) => {
          const rad = (node.angle * Math.PI) / 180;
          const x = 250 + 110 * Math.cos(rad);
          const y = 160 + 95 * Math.sin(rad);
          return (
            <g key={node.id}>
              <line
                x1="250"
                y1="160"
                x2={x}
                y2={y}
                stroke="url(#cyberLineGrad)"
                strokeWidth={isSimulating ? '1.5' : '1'}
                strokeDasharray={isSimulating ? '3 3' : 'none'}
              />
              {isSimulating && (
                <circle cx={x} cy={y} r="2.5" fill="#38BDF8">
                  <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Central Hexagonal / Circular Core */}
      <div className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-b from-slate-900 via-[#0B132B] to-slate-900 border-2 border-cyan-500/50 flex flex-col items-center justify-center p-2 text-center shadow-xl shadow-cyan-950/60 ring-4 ring-cyan-500/10">
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mb-1">
          <Shield className="w-4 h-4 text-cyan-300" />
        </div>
        <div className="text-[10px] font-extrabold tracking-widest text-white leading-tight">
          SECOPS-PULSE
        </div>
        <div className="text-[8px] font-mono-nums tracking-widest text-cyan-400 uppercase mt-0.5">
          AI AGENT CORE
        </div>
        <div className="mt-1 flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`}></span>
          <span className="text-[8px] text-slate-400 font-medium">
            {isSimulating ? currentStage : 'AUTONOMOUS'}
          </span>
        </div>
      </div>

      {/* Peripheral 6 Domain Nodes */}
      {nodes.map((node) => {
        const rad = (node.angle * Math.PI) / 180;
        // scaled coordinates for container
        const left = 50 + 44 * Math.cos(rad);
        const top = 50 + 38 * Math.sin(rad);

        return (
          <div
            key={node.id}
            style={{ left: `${left}%`, top: `${top}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-auto"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 shadow-md hover:border-cyan-500/60 transition-colors cursor-default">
              <span className="text-cyan-400">{node.icon}</span>
              <div className="text-left">
                <div className="text-[11px] font-bold text-slate-200 whitespace-nowrap leading-tight">
                  {node.label}
                </div>
                <div className="text-[9px] text-slate-400 whitespace-nowrap">
                  {node.sub}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
