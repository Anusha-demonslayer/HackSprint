import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Incident, Severity, TabType } from '../types';

interface LiveIncidentsProps {
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
  setActiveTab: (tab: TabType) => void;
  onRefresh?: () => void;
}

export const LiveIncidents: React.FC<LiveIncidentsProps> = ({
  incidents,
  onSelectIncident,
  setActiveTab,
  onRefresh
}) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = incidents.filter(inc => {
    const matchSearch = 
      inc.incident_id.toLowerCase().includes(search.toLowerCase()) ||
      inc.detection.toLowerCase().includes(search.toLowerCase()) ||
      inc.user.toLowerCase().includes(search.toLowerCase()) ||
      inc.source_ip.includes(search) ||
      inc.mitre_technique.toLowerCase().includes(search.toLowerCase());

    const matchSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    const matchStatus = statusFilter === 'ALL' || inc.status === statusFilter;

    return matchSearch && matchSeverity && matchStatus;
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Security Incidents Console
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Active, investigating, and contained security anomalies with AI confidence ratings and MITRE mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors flex items-center gap-1.5"
              title="Refresh incidents"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, detection, user, IP, MITRE..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-cyan-500/60"
          />
        </div>

        {/* Severity Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                severityFilter === sev
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs text-slate-400 w-full md:w-auto">
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1 text-slate-200 text-xs focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="DECIDING">Deciding</option>
            <option value="CONTAINMENT_IN_PROGRESS">Containment in Progress</option>
            <option value="CONTAINED">Contained</option>
            <option value="ESCALATED">Escalated</option>
            <option value="MONITORING">Monitoring</option>
          </select>
        </div>
      </div>

      {/* Incident Table */}
      <div className="bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Detection</th>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Source IP</th>
                <th className="py-3 px-3">MITRE Technique</th>
                <th className="py-3 px-3">AI Confidence</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Primary Action</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No incidents match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => {
                  const severityBadge =
                    inc.severity === 'CRITICAL' ? 'text-rose-400 bg-rose-950/40 border-rose-800/60' :
                    inc.severity === 'HIGH' ? 'text-amber-400 bg-amber-950/40 border-amber-800/60' :
                    inc.severity === 'MEDIUM' ? 'text-yellow-400 bg-yellow-950/40 border-yellow-800/60' :
                    'text-slate-400 bg-slate-800 border-slate-700';

                  const statusBadge =
                    inc.status === 'CONTAINED' ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/60' :
                    inc.status === 'CONTAINMENT_IN_PROGRESS' ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-600 animate-pulse' :
                    inc.status === 'INVESTIGATING' ? 'text-indigo-300 bg-indigo-950/40 border border-indigo-800' :
                    inc.status === 'ESCALATED' ? 'text-rose-400 bg-rose-950/30 border border-rose-800' :
                    'text-amber-400 bg-amber-950/30 border border-amber-800/40';

                  return (
                    <tr
                      key={inc.id}
                      onClick={() => {
                        onSelectIncident(inc);
                        setActiveTab('investigation');
                      }}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono-nums font-bold text-cyan-400 group-hover:text-cyan-300">
                        {inc.incident_id}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${severityBadge}`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200">
                        {inc.detection}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono-nums truncate max-w-[130px]">
                        {inc.user}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono-nums">
                        {inc.source_ip}
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono-nums text-[11px]">
                        {inc.mitre_technique}
                      </td>
                      <td className="py-3 px-3 font-mono-nums text-slate-200 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div 
                              style={{ width: `${inc.confidence}%` }}
                              className={`h-full ${inc.confidence >= 90 ? 'bg-cyan-400' : 'bg-amber-400'}`}
                            ></div>
                          </div>
                          <span>{inc.confidence}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge}`}>
                          {inc.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 truncate max-w-[140px]">
                        {inc.actions && inc.actions.length > 0
                          ? inc.actions[0].action
                          : inc.status === 'CONTAINED'
                          ? 'Account disabled'
                          : 'Pending evaluation'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-nums text-slate-400 text-[11px]">
                        {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-900/40 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filtered.length} of {incidents.length} security incidents</span>
          <span className="font-mono-nums text-[11px]">Click row to open deep AI investigation</span>
        </div>
      </div>
    </div>
  );
};
