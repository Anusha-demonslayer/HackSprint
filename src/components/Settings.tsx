import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Bell, 
  Save, 
  Check, 
  Lock, 
  Cpu, 
  Key,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [autoContainThreshold, setAutoContainThreshold] = useState(90);
  const [approvalThreshold, setApprovalThreshold] = useState(75);
  const [autonomousMode, setAutonomousMode] = useState(true);
  const [slackWebhook, setSlackWebhook] = useState('https://hooks.slack.com/services/T00/B00/secops-pulse-alerts');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-14 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Autonomous Policy Governance & Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure AI decision confidence gates, human-in-the-loop escalation rules, and outbound incident webhooks.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors shadow-md shadow-cyan-950/40"
        >
          {saved ? <Check className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'Saved!' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* Autonomous Mode Toggle */}
      <div className="p-5 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Autonomous Execution Engine</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Allow SecOps-Pulse to execute low/medium-risk reversible containment actions automatically without manual approval.
          </p>
        </div>

        <button
          onClick={() => setAutonomousMode(!autonomousMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
            autonomousMode
              ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <span>{autonomousMode ? 'ENABLED (AUTONOMOUS)' : 'DISABLED (ADVISORY)'}</span>
        </button>
      </div>

      {/* Policy Confidence Thresholds */}
      <div className="p-5 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            POLICY CONFIDENCE THRESHOLDS
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Define mathematical confidence requirements before triggering containment policies.
          </p>
        </div>

        {/* Auto Contain Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">
              Auto-Contain Threshold (Critical Severity)
            </span>
            <span className="font-mono-nums font-bold text-cyan-400 text-sm">
              &gt; {autoContainThreshold}% Confidence
            </span>
          </div>
          <input
            type="range"
            min={70}
            max={99}
            value={autoContainThreshold}
            onChange={(e) => setAutoContainThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="text-[11px] text-slate-400">
            Incidents scoring above {autoContainThreshold}% with critical severity automatically invoke session termination and perimeter IP isolation.
          </div>
        </div>

        {/* Approval Required Slider */}
        <div className="space-y-2 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">
              Approval Required Threshold (High Blast Radius)
            </span>
            <span className="font-mono-nums font-bold text-amber-400 text-sm">
              &gt; {approvalThreshold}% Confidence
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={89}
            value={approvalThreshold}
            onChange={(e) => setApprovalThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="text-[11px] text-slate-400">
            Actions affecting production servers or VIP accounts require manual Human-In-The-Loop approval when confidence is between {approvalThreshold}% and {autoContainThreshold}%.
          </div>
        </div>
      </div>

      {/* Outbound Webhook Routing */}
      <div className="p-5 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            OUTBOUND NOTIFICATIONS & WEBHOOKS
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Post autonomous incident summary cards and audit links to SOC communication channels.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Slack / Microsoft Teams Webhook URL
          </label>
          <input
            type="text"
            value={slackWebhook}
            onChange={(e) => setSlackWebhook(e.target.value)}
            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono-nums text-slate-100 focus:outline-hidden focus:border-cyan-500/60"
          />
        </div>
      </div>
    </div>
  );
};
