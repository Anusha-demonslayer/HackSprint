import React, { useState } from 'react';
import { 
  Search, 
  Database, 
  ShieldAlert, 
  Globe, 
  Server, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  Fingerprint,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ThreatIntelResult } from '../types';
import { api } from '../lib/api';

export const ThreatIntelligence: React.FC = () => {
  const [query, setQuery] = useState('185.220.101.5');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThreatIntelResult | null>({
    ioc: '185.220.101.5',
    ioc_type: 'IP',
    reputation: 'MALICIOUS',
    confidence: 98,
    threat_categories: ['Tor Exit Node', 'Credential Stuffing Botnet', 'Brute Force Scanner'],
    geo: {
      country: 'Nigeria',
      city: 'Lagos',
      asn: 'AS208294',
      org: 'Zwiebelfreunde Tor Infrastructure'
    },
    passive_dns: ['vpn-exit-node-09.relay.net', 'tor-exit.secured-gw.org'],
    sightings_count: 1420,
    first_seen: '2024-03-12T00:00:00Z',
    last_seen: '2026-10-05T05:30:00Z',
    recommended_action: 'Immediate perimeter block; inspect all ingress traffic from /24 subnet.'
  });

  const handleLookup = async (iocToLookup?: string) => {
    const target = iocToLookup || query;
    if (!target.trim()) return;
    setLoading(true);
    try {
      const data = await api.lookupThreatIntel(target);
      setResult(data);
    } catch (err) {
      console.error('Threat intel lookup failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const sampleIOCs = [
    { label: 'Tor Exit Node (IP)', val: '185.220.101.5' },
    { label: 'C2 Domain', val: 'query.ns1-sync.org' },
    { label: 'Compromised User', val: 'employee_247' },
    { label: 'Anonymous Proxy (IP)', val: '91.241.19.4' },
    { label: 'Stager URL', val: 'raw.githubusercontent.com/apt-c2/beacon.ps1' },
  ];

  return (
    <div className="space-y-6 pb-14">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">
          Threat Intelligence & MITRE ATT&CK Matrix
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Query IOC reputation across IP, Domain, Hash, URL, and User entities. Real-time correlation with MITRE matrices.
        </p>
      </div>

      {/* Search Bar & Quick Samples */}
      <div className="p-5 bg-[#0B0F17]/95 border border-slate-800/80 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              placeholder="Enter IP / DOMAIN / HASH / USER / URL..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono-nums text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-cyan-500/60"
            />
          </div>
          <button
            onClick={() => handleLookup()}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold tracking-wider transition-colors shrink-0 shadow-lg shadow-cyan-950/40"
          >
            {loading ? 'INVESTIGATING...' : 'INVESTIGATE IOC'}
          </button>
        </div>

        {/* Quick Sample Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
          <span className="text-[11px] font-semibold text-slate-400">Quick Samples:</span>
          {sampleIOCs.map((s) => (
            <button
              key={s.val}
              onClick={() => {
                setQuery(s.val);
                handleLookup(s.val);
              }}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono-nums text-slate-300 hover:text-cyan-300 transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* IOC Reputation Overview (7 cols) */}
          <div className="lg:col-span-7 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  IOC REPUTATION SCORECARD
                </span>
                <div className="text-lg font-bold font-mono-nums text-slate-100 mt-0.5 break-all">
                  {result.ioc}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-nums font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                TYPE: {result.ioc_type}
              </span>
            </div>

            {/* Score & Risk Highlight */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Reputation</div>
                <div className={`text-base font-extrabold mt-0.5 ${
                  result.reputation === 'MALICIOUS' ? 'text-rose-400' :
                  result.reputation === 'SUSPICIOUS' ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {result.reputation}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Confidence</div>
                <div className="text-base font-extrabold font-mono-nums text-cyan-400 mt-0.5">
                  {result.confidence}%
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Global Sightings</div>
                <div className="text-base font-extrabold font-mono-nums text-indigo-400 mt-0.5">
                  {result.sightings_count.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Threat Categories */}
            <div>
              <div className="text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Threat Classifications:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.threat_categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-rose-950/40 border border-rose-800/60 text-xs font-semibold text-rose-300"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Containment */}
            <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs">
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                RECOMMENDED MITIGATION
              </div>
              <p className="text-slate-300 leading-relaxed">
                {result.recommended_action}
              </p>
            </div>

            {/* Geolocation & Network ASN */}
            {result.geo && (
              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 grid grid-cols-2 gap-2 font-mono-nums">
                <div>Geo: <span className="text-slate-200">{result.geo.city}, {result.geo.country}</span></div>
                <div>ASN: <span className="text-slate-200">{result.geo.asn} ({result.geo.org})</span></div>
              </div>
            )}
          </div>

          {/* Right: Interactive MITRE ATT&CK Mapping (5 cols) */}
          <div className="lg:col-span-5 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    MITRE ATT&CK CORRELATION
                  </h3>
                </div>
                <span className="text-[10px] font-mono-nums text-slate-400">ENTERPRISE v14</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase">TACTIC</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    Credential Access (TA0006)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Techniques used for stealing credentials like account names and passwords.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase">TECHNIQUE</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    T1078 — Valid Accounts
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase">CORRELATED EVIDENCE</div>
                  <ul className="mt-1.5 space-y-1 text-slate-300 text-[11px]">
                    <li>• 17 rapid failed authentication burst attempts</li>
                    <li>• Geographically anomalous successful login</li>
                    <li>• Known malicious Tor Exit IP classification</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Automatic Technique Ingestion</span>
              <span className="text-cyan-400 font-mono-nums">100% Match</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
