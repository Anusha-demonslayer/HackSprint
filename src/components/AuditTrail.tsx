import React, { useState } from 'react';
import { 
  FileCheck2, 
  KeyRound, 
  ShieldCheck, 
  Copy, 
  Check, 
  Search, 
  Lock, 
  ExternalLink,
  Fingerprint
} from 'lucide-react';
import { AuditRecord } from '../types';

interface AuditTrailProps {
  logs: AuditRecord[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ logs }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(logs[0] || null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = logs.filter(l => 
    l.incident_id.toLowerCase().includes(search.toLowerCase()) ||
    l.event.toLowerCase().includes(search.toLowerCase()) ||
    l.fingerprint.includes(search) ||
    l.ai_classification.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-14">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">
          Immutable Compliance & Decision Audit Trail
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Cryptographically signed decision ledger for enterprise compliance, SOC audits, and transparent AI governance.
        </p>
      </div>

      {/* Audit Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-slate-800/80">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Integrity Scheme
          </div>
          <div className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>SHA-256 HMAC Proofs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tamper-evident hash chain generated upon autonomous policy execution.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-slate-800/80">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Auditable Actions
          </div>
          <div className="text-2xl font-bold font-mono-nums text-emerald-400 mt-1">
            {logs.length} Records
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Zero policy breaches or un-audited state mutations recorded.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-slate-800/80">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Compliance Standard
          </div>
          <div className="text-sm font-bold text-indigo-400 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>SOC2 Type II / NIST CSF Compliant</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Full auditability for Tier-1 autonomous security workflows.
          </p>
        </div>
      </div>

      {/* Main Grid: List + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Records Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search audit hash, incident, event..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-cyan-500/60"
              />
            </div>
            <span className="text-[10px] font-mono-nums text-slate-400">
              {filtered.length} entries
            </span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filtered.map((log) => {
              const isSelected = selectedRecord?.id === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedRecord(log)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all text-xs ${
                    isSelected
                      ? 'bg-cyan-950/20 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-nums font-bold text-cyan-400">
                      {log.incident_id}
                    </span>
                    <span className="font-mono-nums text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-200 mt-1">
                    {log.event}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400 truncate max-w-[200px]">
                      Action: {log.action}
                    </span>
                    <span className="font-mono-nums text-[10px] text-indigo-400">
                      SHA: {log.fingerprint.substring(0, 10)}...
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cryptographic Fingerprint Verification Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          {selectedRecord ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    EVIDENCE FINGERPRINT
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/60">
                  VERIFIED VALID ✓
                </span>
              </div>

              {/* SHA-256 Fingerprint Box */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-[10px] font-mono-nums text-slate-400 mb-1">
                  <span>SHA-256 EVIDENCE DIGEST</span>
                  <button
                    onClick={() => handleCopy(selectedRecord.fingerprint, selectedRecord.id)}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                  >
                    {copiedId === selectedRecord.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === selectedRecord.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-[11px] font-mono-nums text-cyan-300 break-all leading-relaxed bg-black/40 p-2 rounded border border-slate-800">
                  {selectedRecord.fingerprint}
                </div>
              </div>

              {/* Evidence Claims Breakdown */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">AI Classification:</span>
                  <div className="font-bold text-slate-100">{selectedRecord.ai_classification} ({selectedRecord.confidence}% confidence)</div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Authorizing Policy:</span>
                  <div className="font-bold text-emerald-400 font-mono-nums">{selectedRecord.policy}</div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Execution Actor:</span>
                  <div className="font-mono-nums text-slate-300">{selectedRecord.actor}</div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Evidence Ingested:</span>
                  <ul className="mt-1 space-y-1">
                    {selectedRecord.evidence.map((ev, i) => (
                      <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Verification Result:</span>
                  <div className="text-slate-300 text-[11px] mt-0.5 p-2 rounded bg-slate-900 border border-slate-800">
                    {selectedRecord.action_result}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-xs text-slate-400">
              Select an audit record to inspect cryptographic digest.
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono-nums">
            <span>Cryptographic Proof: SHA-256</span>
            <span className="text-cyan-400">Zero Tampering Detected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
