import React, { useState } from 'react';
import { 
  Network, 
  Copy, 
  Check, 
  Send, 
  Workflow, 
  Code, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Terminal
} from 'lucide-react';
import { api } from '../lib/api';

export const Integrations: React.FC = () => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const webhookUrl = `${window.location.origin}/api/events`;

  const samplePayload = {
    event_type: "authentication",
    user: "employee_247",
    source_ip: "185.10.20.30",
    timestamp: new Date().toISOString(),
    failed_attempts: 17,
    successful_login: true,
    title: "Suspicious credential spray from anomalous IP",
    detection: "Credential Compromise"
  };

  const handleCopy = (text: string, type: 'url' | 'payload') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  const handleSendTestEvent = async () => {
    setIsSending(true);
    setTestResult(null);
    try {
      const res = await api.sendEvent(samplePayload);
      setTestResult(`Event successfully ingested! ID: ${res.event_id}, Incident: ${res.incident_id}`);
    } catch (err: any) {
      setTestResult(`Ingestion failed: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const n8nSteps = [
    { label: 'Security Event', sub: 'SIEM / CloudTrail / Okta' },
    { label: 'Webhook', sub: 'POST /api/events' },
    { label: 'Normalize Event', sub: 'JSON Parser' },
    { label: 'Threat Intel', sub: 'AbuseIPDB / OTX' },
    { label: 'AI Investigation', sub: 'SecOps-Pulse Core' },
    { label: 'Risk Decision', sub: 'Policy Triage' },
    { label: 'Response Action', sub: 'Firewall / IDP API' },
    { label: 'Verification', sub: 'Zero-threat probe' },
    { label: 'SecOps-Pulse', sub: 'Audit signature' },
  ];

  return (
    <div className="space-y-6 pb-14">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">
          Enterprise Workflow & n8n Orchestration Architecture
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Connect SecOps-Pulse with n8n, Slack, Splunk, CrowdStrike, and Microsoft Sentinel via bi-directional webhook pipelines.
        </p>
      </div>

      {/* Visual n8n Pipeline Flow */}
      <div className="p-5 bg-[#0B0F17]/95 border border-slate-800/80 rounded-xl shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              N8N ORCHESTRATION PIPELINE
            </h2>
          </div>
          <span className="text-[10px] font-mono-nums text-slate-400">
            END-TO-END AUTONOMOUS ARCHITECTURE
          </span>
        </div>

        {/* Pipeline steps scrollable horizontal grid */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center min-w-[900px] gap-2">
            {n8nSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex-1 p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
                  <span className="text-[10px] font-mono-nums text-slate-400 font-bold mb-1">
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-200 leading-tight">
                    {step.label}
                  </span>
                  <span className="text-[10px] text-cyan-400 mt-1 font-mono-nums">
                    {step.sub}
                  </span>
                </div>
                {idx < n8nSteps.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Webhook Configuration & Test Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Webhook URL & Payload details (7 cols) */}
        <div className="lg:col-span-7 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                INBOUND EVENT WEBHOOK
              </h3>
            </div>
            <span className="text-[10px] font-mono-nums text-emerald-400">
              HTTP 200 READY
            </span>
          </div>

          {/* Webhook Endpoint Box */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              POST Endpoint
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono-nums text-xs text-cyan-300 truncate">
                {webhookUrl}
              </div>
              <button
                onClick={() => handleCopy(webhookUrl, 'url')}
                className="px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied!' : 'Copy Webhook'}</span>
              </button>
            </div>
          </div>

          {/* Example Payload */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              <span>Example Event Ingestion Payload (JSON)</span>
              <button
                onClick={() => handleCopy(JSON.stringify(samplePayload, null, 2), 'payload')}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-normal"
              >
                {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPayload ? 'Copied' : 'Copy Payload'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono-nums text-xs text-emerald-300/90 overflow-x-auto">
              {JSON.stringify(samplePayload, null, 2)}
            </pre>
          </div>
        </div>

        {/* Right: Interactive Test Ingestion Controller (5 cols) */}
        <div className="lg:col-span-5 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  SEND TEST EVENT
                </h3>
              </div>
              <span className="text-[10px] font-mono-nums text-slate-400">
                LIVE INGESTION PROBE
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Simulate an external SIEM alert or n8n trigger. Clicking below will transmit the payload directly to <code className="text-cyan-400 font-mono">POST /api/events</code> and trigger live reasoning in SecOps-Pulse.
            </p>

            <button
              onClick={handleSendTestEvent}
              disabled={isSending}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'INGESTING EVENT...' : 'SEND TEST EVENT'}</span>
            </button>

            {testResult && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs font-medium text-emerald-300">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Success</span>
                </div>
                <div className="font-mono-nums text-[11px] text-slate-300">
                  {testResult}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono-nums">
            <span>Orchestration Layer</span>
            <span className="text-indigo-400">n8n / Node.js Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
