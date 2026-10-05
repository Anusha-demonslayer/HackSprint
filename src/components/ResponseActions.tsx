import React, { useState } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Lock, 
  AlertTriangle, 
  UserX, 
  Ban, 
  FileWarning, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { ResponseAction } from '../types';
import { api } from '../lib/api';

interface ResponseActionsProps {
  actions: ResponseAction[];
  onRefresh?: () => void;
}

export const ResponseActions: React.FC<ResponseActionsProps> = ({
  actions,
  onRefresh
}) => {
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = actions.filter(act => {
    const matchSearch = 
      act.action.toLowerCase().includes(search.toLowerCase()) ||
      act.target.toLowerCase().includes(search.toLowerCase()) ||
      act.incident_id.toLowerCase().includes(search.toLowerCase());

    const matchRisk = filterRisk === 'ALL' || act.risk === filterRisk;
    const matchStatus = filterStatus === 'ALL' || act.status === filterStatus;

    return matchSearch && matchRisk && matchStatus;
  });

  return (
    <div className="space-y-6 pb-14">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Response Actions Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time audit log of all autonomous and human-authorized containment countermeasures across identity, network, and endpoints.
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, target, incident ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-cyan-500/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Risk:</span>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs"
            >
              <option value="ALL">All Risks</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Action Name</th>
                <th className="py-3 px-3">Target Entity</th>
                <th className="py-3 px-3">Incident</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Triggered By</th>
                <th className="py-3 px-3">Verification Telemetry</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No response actions found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((act) => {
                  const riskBadge =
                    act.risk === 'HIGH' ? 'text-rose-400 bg-rose-950/40 border border-rose-800/60' :
                    act.risk === 'MEDIUM' ? 'text-amber-400 bg-amber-950/40 border border-amber-800/60' :
                    'text-emerald-400 bg-emerald-950/40 border border-emerald-800/60';

                  const statusBadge =
                    act.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-800/50' :
                    act.status === 'PENDING_APPROVAL' ? 'text-amber-400 bg-amber-950/50 border border-amber-800/60 animate-pulse' :
                    act.status === 'REJECTED' ? 'text-slate-400 bg-slate-900 border border-slate-800' :
                    'text-cyan-400 bg-cyan-950/50 border border-cyan-800';

                  return (
                    <tr key={act.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {act.action}
                      </td>
                      <td className="py-3 px-3 font-mono-nums text-slate-300">
                        {act.target}
                      </td>
                      <td className="py-3 px-3 font-mono-nums font-bold text-cyan-400">
                        {act.incident_id}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${riskBadge}`}>
                          {act.risk}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge}`}>
                          {act.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {act.triggered_by}
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-[11px] truncate max-w-[280px]">
                        {act.verification_result}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-nums text-slate-400 text-[11px]">
                        {new Date(act.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-900/40 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{filtered.length} total response actions tracked</span>
          <span className="text-emerald-400 font-mono-nums">100% Policy Compliant</span>
        </div>
      </div>
    </div>
  );
};
