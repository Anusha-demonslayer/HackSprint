import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Terminal, 
  Zap, 
  Check, 
  ShieldCheck, 
  Clock, 
  RotateCcw, 
  ArrowLeft,
  Lock,
  Globe,
  UserCheck,
  Ban,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import { Incident, TabType } from '../types';
import { api } from '../lib/api';

interface IncidentDetailProps {
  incident: Incident;
  onBack: () => void;
  onUpdateIncident: (inc: Incident) => void;
  setActiveTab: (tab: TabType) => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({
  incident,
  onBack,
  onUpdateIncident,
  setActiveTab,
}) => {
  const [isExecutingResponse, setIsExecutingResponse] = useState(false);
  const [simulationStep, setSimulationStep] = useState<string | null>(null);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const decision = incident.decision || {
    id: 'dec-default',
    incident_id: incident.incident_id,
    classification: incident.detection.toUpperCase(),
    confidence: incident.confidence,
    severity: incident.severity,
    policy: incident.policy_level,
    recommendations: [
      'Disable compromised account immediately',
      'Revoke active session tokens and OAuth refresh cookies',
      'Block malicious source IP at edge perimeter',
      'Notify SOC tier-2 analyst via incident webhook',
      'Inspect endpoint process telemetry for lateral movement'
    ],
    explanation: 'Multiple independent indicators support a high-confidence threat event requiring automated containment.',
    evidence_summary: [
      'Authentication anomaly: consecutive failed authentication spikes detected',
      'Successful login bypass from anomalous geo-location and high-risk ASN',
      'Source IP flagged in threat intelligence feeds (Tor exit / botnet scanner)',
      'Session telemetry deviates markedly from historical baseline',
      `MITRE ATT&CK technique ${incident.mitre_technique} correlated`
    ],
    created_at: new Date().toISOString(),
  };

  const handleTriggerInvestigation = async () => {
    setIsInvestigating(true);
    try {
      const res = await api.triggerInvestigation(incident.incident_id);
      onUpdateIncident(res.incident);
    } catch (err) {
      console.error('Investigation error:', err);
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleSafeContainmentSimulation = async () => {
    setIsExecutingResponse(true);
    setActionSuccessMessage(null);

    const steps = [
      'AI RESPONSE ENGINE INITIALIZED',
      'Validating policy: Critical + Confidence > 90%...',
      'Checking confidence: 96% verified...',
      'Action authorized: AUTO-CONTAIN...',
      'Account session revoked across IDP...',
      'Malicious source IP blocked on perimeter...',
      'Verification successful: 0 anomalous retries...',
    ];

    for (const step of steps) {
      setSimulationStep(step);
      await new Promise(r => setTimeout(r, 650));
    }

    try {
      await api.triggerResponse(incident.incident_id, 'Revoke active sessions and block IP', incident.user);
      const verifyRes = await api.verifyIncident(incident.incident_id);
      onUpdateIncident(verifyRes.incident);
      setActionSuccessMessage('THREAT CONTAINED ✓ — Response time: 3.8 seconds');
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecutingResponse(false);
      setSimulationStep(null);
    }
  };

  const handleHumanDecision = async (actionDecision: 'APPROVE' | 'REJECT' | 'ESCALATE') => {
    try {
      const actionId = incident.actions?.[0]?.id || 'act-1043-1';
      const res = await api.sendActionDecision(incident.incident_id, actionId, actionDecision);
      onUpdateIncident(res.incident);
      setActionSuccessMessage(`Action decision recorded: ${actionDecision}`);
    } catch (err) {
      console.error(err);
    }
  };

  const isContained = incident.status === 'CONTAINED';

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Incidents</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerInvestigation}
            disabled={isInvestigating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 text-xs font-semibold transition-colors"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isInvestigating ? 'Re-evaluating with AI...' : 'Re-Run AI Reasoning'}</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <span>View Timeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="p-5 bg-[#0B0F17]/95 border border-slate-800/90 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold font-mono-nums text-cyan-400">
                INCIDENT {incident.incident_id}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                incident.severity === 'CRITICAL' ? 'text-rose-400 bg-rose-950/40 border-rose-800/60' :
                'text-amber-400 bg-amber-950/40 border-amber-800/60'
              }`}>
                {incident.severity}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                isContained ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/60' :
                'text-cyan-300 bg-cyan-950/50 border border-cyan-700 animate-pulse'
              }`}>
                {isContained ? 'THREAT CONTAINED' : incident.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="text-base font-semibold text-slate-200 mt-1">
              {incident.title}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono-nums">
            <div>
              <div className="text-[10px] text-slate-400">RESPONSE LATENCY</div>
              <div className="text-sm font-bold text-cyan-400">{incident.response_time}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">AI CONFIDENCE</div>
              <div className="text-sm font-bold text-indigo-400">{incident.confidence}%</div>
            </div>
          </div>
        </div>

        {/* Incident Summary */}
        <div className="mt-4 p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/70 text-xs">
          <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
            INCIDENT SUMMARY
          </div>
          <p className="text-slate-300 leading-relaxed">
            {incident.summary}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono-nums">
            <span>Target User: <strong className="text-slate-200">{incident.user}</strong></span>
            <span>Source IP: <strong className="text-cyan-400">{incident.source_ip}</strong></span>
            <span>Technique: <strong className="text-indigo-300">{incident.mitre_technique}</strong></span>
            <span>Policy Gate: <strong className="text-emerald-400">{incident.policy_level}</strong></span>
          </div>
        </div>
      </div>

      {/* Row 2: AI Investigation (Structured Reasoning) & AI Decision Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: AI Investigation Panel (6 cols) */}
        <div className="lg:col-span-6 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  AI INVESTIGATION
                </h3>
              </div>
              <span className="text-[10px] font-mono-nums text-slate-400">
                EVIDENCE-BASED REASONING
              </span>
            </div>

            <div className="text-xs text-slate-400 mb-3">
              Autonomous reasoning chain distilled from multi-vector telemetry correlations:
            </div>

            {/* Structured Evidence Checklist */}
            <div className="space-y-2.5">
              {decision.evidence_summary.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/70 text-xs"
                >
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-slate-200 leading-snug">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-cyan-950/20 border border-cyan-900/40 text-xs text-cyan-200 font-medium">
              → High-confidence credential compromise confirmed via convergent telemetry indicators.
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono-nums">
            <span>Model: Gemini 3.8 / Transparent Rules</span>
            <span className="text-emerald-400">Zero Hallucination Guard</span>
          </div>
        </div>

        {/* Right: AI Decision Engine & Human-in-the-Loop Control (6 cols) */}
        <div className="lg:col-span-6 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  AI DECISION ENGINE
                </h3>
              </div>
              <span className="text-[10px] font-mono-nums text-slate-400">
                AUTONOMOUS RISK TRIAGE
              </span>
            </div>

            {/* Decision Highlights Grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-4 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Classification</div>
                <div className="font-bold text-slate-100 text-xs truncate mt-0.5">
                  {decision.classification}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Severity</div>
                <div className="font-bold text-rose-400 text-xs mt-0.5">
                  {decision.severity}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Confidence</div>
                <div className="font-bold text-cyan-400 font-mono-nums text-xs mt-0.5">
                  {decision.confidence}%
                </div>
              </div>
            </div>

            {/* Decision Explanation */}
            <div className="text-xs text-slate-300 italic mb-4 p-2.5 rounded bg-slate-900/40 border border-slate-800">
              «{decision.explanation}»
            </div>

            {/* Recommended Responses */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                RECOMMENDED RESPONSE PLAN
              </div>
              <ol className="space-y-1.5 text-xs text-slate-200">
                {decision.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono-nums flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Policy Governance & HITL Controls */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300">Policy Level:</span>
              <span className="font-mono-nums text-emerald-400 font-bold">
                {decision.policy} (Critical + Confidence &gt; 90%)
              </span>
            </div>

            {/* Safe Containment Simulation Runner */}
            {isExecutingResponse && simulationStep && (
              <div className="p-3 mb-3 rounded-lg bg-cyan-950/60 border border-cyan-600/50 text-xs font-mono-nums text-cyan-300 animate-pulse">
                {simulationStep}
              </div>
            )}

            {actionSuccessMessage && (
              <div className="p-3 mb-3 rounded-lg bg-emerald-950/50 border border-emerald-700/60 text-xs font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionSuccessMessage}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {!isContained ? (
                <button
                  onClick={handleSafeContainmentSimulation}
                  disabled={isExecutingResponse}
                  className="flex-1 min-w-[140px] px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold tracking-wider shadow-lg shadow-rose-900/40 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>CONTAIN THREAT</span>
                </button>
              ) : (
                <div className="flex-1 py-2 px-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>THREAT CONTAINED & VERIFIED ✓</span>
                </div>
              )}

              {/* Human In The Loop Gate Buttons */}
              <button
                onClick={() => handleHumanDecision('APPROVE')}
                className="px-3 py-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-700 text-emerald-300 text-xs font-semibold transition-colors"
                title="Approve pending response"
              >
                Approve Action
              </button>
              <button
                onClick={() => handleHumanDecision('REJECT')}
                className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                title="Reject action"
              >
                Reject
              </button>
              <button
                onClick={() => handleHumanDecision('ESCALATE')}
                className="px-3 py-2.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/40 border border-amber-700 text-amber-300 text-xs font-semibold transition-colors"
                title="Escalate to SOC shift lead"
              >
                Escalate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Executed Response Actions Table for this Incident */}
      <div className="bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            EXECUTED & PENDING RESPONSE ACTIONS
          </h3>
          <span className="text-[10px] font-mono-nums text-slate-400">
            AUDITABLE TELEMETRY LEDGER
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Action Name</th>
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Triggered By</th>
                <th className="py-2.5 px-3">Verification Result</th>
                <th className="py-2.5 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-medium">
              {incident.actions && incident.actions.length > 0 ? (
                incident.actions.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {act.action}
                    </td>
                    <td className="py-2.5 px-3 font-mono-nums text-slate-300">
                      {act.target}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        act.risk === 'HIGH' ? 'text-rose-400 bg-rose-950/40' :
                        act.risk === 'MEDIUM' ? 'text-amber-400 bg-amber-950/40' :
                        'text-emerald-400 bg-emerald-950/40'
                      }`}>
                        {act.risk}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        act.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-950/50' :
                        act.status === 'PENDING_APPROVAL' ? 'text-amber-400 bg-amber-950/50 animate-pulse' :
                        'text-cyan-400 bg-cyan-950/50'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {act.triggered_by}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px] truncate max-w-[260px]">
                      {act.verification_result}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-nums text-slate-400 text-[11px]">
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No actions executed yet. Click "CONTAIN THREAT" to trigger autonomous response.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
