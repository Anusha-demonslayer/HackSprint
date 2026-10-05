import React, { useState, useEffect, useCallback } from 'react';
import { 
  TabType, 
  Incident, 
  SecurityEvent, 
  Stats, 
  AuditRecord, 
  AgentActivityItem, 
  ResponseAction 
} from './types';
import { api } from './lib/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandCenter } from './components/CommandCenter';
import { LiveIncidents } from './components/LiveIncidents';
import { IncidentDetail } from './components/IncidentDetail';
import { ThreatIntelligence } from './components/ThreatIntelligence';
import { ResponseActions } from './components/ResponseActions';
import { AttackTimeline } from './components/AttackTimeline';
import { AgentActivity } from './components/AgentActivity';
import { AuditTrail } from './components/AuditTrail';
import { Integrations } from './components/Integrations';
import { Settings } from './components/Settings';
import { LoginModal } from './components/LoginModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('command_center');
  const [stats, setStats] = useState<Stats | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [activities, setActivities] = useState<AgentActivityItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [actions, setActions] = useState<ResponseAction[]>([]);
  
  // Attack simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationPhase, setSimulationPhase] = useState(0);
  const [simulationStage, setSimulationStage] = useState('IDLE');
  
  // Login / Demo modal state
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      const [s, incs, acts, logs, actsList] = await Promise.all([
        api.getStats().catch(() => null),
        api.getIncidents().catch(() => []),
        api.getActions().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getAgentActivities().catch(() => []),
      ]);

      if (s) setStats(s);
      if (incs.length > 0) {
        setIncidents(incs);
        // Default selected to INC-1042
        const inc1042 = incs.find(i => i.incident_id === 'INC-1042') || incs[0];
        setSelectedIncident(inc1042);
        if (inc1042 && inc1042.events) {
          setEvents(inc1042.events);
        }
      }
      if (acts) setActions(acts);
      if (logs) setAuditLogs(logs);
      if (actsList) setActivities(actsList);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Subscribe to real-time SSE stream
  useEffect(() => {
    const unsubscribe = api.subscribeStream((msg) => {
      const { event, payload } = msg;

      if (event === 'simulation_started') {
        setIsSimulating(true);
        setSimulationPhase(1);
        setSimulationStage('OBSERVE');
      } else if (event === 'simulation_phase') {
        setSimulationPhase(payload.phase);
        setSimulationStage(payload.stage);
      } else if (event === 'simulation_completed') {
        setIsSimulating(false);
        loadInitialData();
      } else if (event === 'new_event') {
        setEvents((prev) => [payload, ...prev.slice(0, 49)]);
      } else if (event === 'incident_updated') {
        setIncidents((prev) => 
          prev.map((i) => i.incident_id === payload.incident_id ? { ...i, ...payload } : i)
        );
        setSelectedIncident((curr) => 
          curr && curr.incident_id === payload.incident_id ? { ...curr, ...payload } : curr
        );
        api.getStats().then(setStats).catch(() => {});
      } else if (event === 'action_executed') {
        setActions((prev) => [payload, ...prev]);
        api.getStats().then(setStats).catch(() => {});
      } else if (event === 'action_updated') {
        setActions((prev) => prev.map((a) => a.id === payload.id ? payload : a));
      } else if (event === 'audit_logged') {
        setAuditLogs((prev) => [payload, ...prev]);
      } else if (event === 'agent_activity') {
        setActivities((prev) => [payload, ...prev]);
      }
    });

    return () => unsubscribe();
  }, [loadInitialData]);

  // Launch Attack Simulation
  const handleLaunchSimulation = async () => {
    try {
      setIsSimulating(true);
      setSimulationPhase(1);
      setSimulationStage('OBSERVE');
      await api.startSimulation();
    } catch (err) {
      console.error('Simulation error:', err);
      setIsSimulating(false);
    }
  };

  // Helper when an incident is selected from a table
  const handleSelectIncident = (inc: Incident) => {
    setSelectedIncident(inc);
  };

  const handleUpdateIncident = (updated: Incident) => {
    setSelectedIncident(updated);
    setIncidents(prev => prev.map(i => i.incident_id === updated.incident_id ? updated : i));
    api.getStats().then(setStats).catch(() => {});
  };

  // Fallback incident if none selected
  const activeIncident: Incident = selectedIncident || incidents[0] || {
    id: 'inc-1042',
    incident_id: 'INC-1042',
    title: 'Potential account compromise detected',
    detection: 'Credential Compromise',
    severity: 'CRITICAL',
    type: 'Account Takeover / Brute Force',
    status: 'CONTAINED',
    user: 'employee_247 (analyst@company.com)',
    source_ip: '185.220.101.5',
    confidence: 96,
    mitre_technique: 'T1078 — Valid Accounts',
    mitre_tactic: 'Credential Access',
    policy_level: 'AUTO-CONTAIN',
    summary: 'Potential account compromise detected. Multiple failed login attempts were followed by a successful authentication from a geographically anomalous location and a known malicious IP.',
    response_time: '3.8s',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    current_stage: 'VERIFY',
  };

  return (
    <div className="flex h-screen bg-[#080B10] text-slate-100 overflow-hidden font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        agentOnline={true}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onLaunchSimulation={handleLaunchSimulation}
          isSimulating={isSimulating}
          simulationPhase={simulationPhase}
          simulationStage={simulationStage}
          onOpenLogin={() => setShowLoginModal(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Dynamic View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'command_center' && (
              <CommandCenter
                stats={stats}
                events={events}
                incidents={incidents}
                onSelectIncident={handleSelectIncident}
                setActiveTab={setActiveTab}
                isSimulating={isSimulating}
                simulationPhase={simulationPhase}
                simulationStage={simulationStage}
              />
            )}

            {activeTab === 'incidents' && (
              <LiveIncidents
                incidents={incidents}
                onSelectIncident={handleSelectIncident}
                setActiveTab={setActiveTab}
                onRefresh={loadInitialData}
              />
            )}

            {activeTab === 'investigation' && (
              <IncidentDetail
                incident={activeIncident}
                onBack={() => setActiveTab('incidents')}
                onUpdateIncident={handleUpdateIncident}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'threat_intel' && (
              <ThreatIntelligence />
            )}

            {activeTab === 'actions' && (
              <ResponseActions
                actions={actions}
                onRefresh={loadInitialData}
              />
            )}

            {activeTab === 'timeline' && (
              <AttackTimeline incident={activeIncident} />
            )}

            {activeTab === 'agent_activity' && (
              <AgentActivity
                activities={activities}
                onRefresh={loadInitialData}
              />
            )}

            {activeTab === 'audit' && (
              <AuditTrail logs={auditLogs} />
            )}

            {activeTab === 'integrations' && (
              <Integrations />
            )}

            {activeTab === 'settings' && (
              <Settings />
            )}
          </div>
        </main>
      </div>

      {/* Landing / Demo Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onEnterCommandCenter={() => {
          setActiveTab('command_center');
        }}
      />
    </div>
  );
}
