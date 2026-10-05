import { db } from './db.js';
import { Incident, SecurityEvent, AIDecision, ResponseAction } from './types.js';

let isSimulationRunning = false;
let currentPhase = 0;
let simulationTimeout: NodeJS.Timeout | null = null;

export function getSimulationStatus() {
  return {
    isRunning: isSimulationRunning,
    currentPhase,
    totalPhases: 8,
    activeIncidentId: 'INC-1042',
  };
}

export function startAttackSimulation() {
  if (isSimulationRunning) {
    return { status: 'already_running', phase: currentPhase };
  }

  isSimulationRunning = true;
  currentPhase = 1;

  // Reset or create flagship incident INC-1042
  const resetIncident: Incident = {
    id: 'inc-1042',
    incident_id: 'INC-1042',
    title: 'Potential account compromise detected',
    detection: 'Credential Compromise',
    severity: 'MEDIUM',
    type: 'Account Takeover / Brute Force',
    status: 'NEW',
    user: 'employee_247 (analyst@company.com)',
    source_ip: '185.220.101.5',
    confidence: 35,
    mitre_technique: 'T1078 — Valid Accounts',
    mitre_tactic: 'Credential Access',
    policy_level: 'AUTO-CONTAIN',
    summary: 'Initial authentication anomalies observed for employee_247 from external IP.',
    response_time: 'Pending...',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    current_stage: 'OBSERVE',
  };

  db.upsertIncident(resetIncident);

  // Broadcast simulation started
  db.broadcast('simulation_started', {
    incident_id: 'INC-1042',
    total_phases: 8,
    start_time: new Date().toISOString(),
  });

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  (async () => {
    try {
      // PHASE 1: Suspicious authentication begins
      currentPhase = 1;
      const ev1: SecurityEvent = {
        id: 'sim-ev-' + Date.now() + '-1',
        incident_id: 'INC-1042',
        event_type: 'authentication_failure',
        user: 'employee_247',
        source_ip: '185.220.101.5',
        timestamp: new Date().toISOString(),
        severity: 'LOW',
        description: 'Single anomalous password failure against SSO OAuth endpoint',
        payload: { attempt: 1, user_agent: 'python-requests/2.28.1' }
      };
      db.addEvent(ev1);
      db.addAgentActivity({
        incident_id: 'INC-1042',
        stage: 'OBSERVE',
        timestamp: new Date().toISOString(),
        message: 'Telemetry ingestion: Single authentication failure logged',
        details: 'Source IP 185.220.101.5 attempting password spray against employee_247',
        latency_ms: 85
      });
      db.broadcast('simulation_phase', { phase: 1, title: 'Suspicious authentication begins', stage: 'OBSERVE' });

      await sleep(1800);

      // PHASE 2: Multiple failed attempts
      currentPhase = 2;
      const ev2: SecurityEvent = {
        id: 'sim-ev-' + Date.now() + '-2',
        incident_id: 'INC-1042',
        event_type: 'authentication_failure',
        user: 'employee_247',
        source_ip: '185.220.101.5',
        timestamp: new Date().toISOString(),
        severity: 'MEDIUM',
        description: '17 consecutive failed authentication attempts within 180 seconds',
        payload: { attempts: 17, threshold: 'EXCEEDED', velocity: '5.6 attempts/min' }
      };
      db.addEvent(ev2);
      resetIncident.severity = 'HIGH';
      resetIncident.confidence = 58;
      resetIncident.status = 'INVESTIGATING';
      resetIncident.current_stage = 'INVESTIGATE';
      db.upsertIncident(resetIncident);

      db.addAgentActivity({
        incident_id: 'INC-1042',
        stage: 'INVESTIGATE',
        timestamp: new Date().toISOString(),
        message: 'Threshold breach: 17 failed authentication spikes detected',
        details: 'Velocity exceeded brute-force limit. Triggered automated context enrichment.',
        latency_ms: 140
      });
      db.broadcast('simulation_phase', { phase: 2, title: 'Multiple failed attempts (17 in 3m)', stage: 'INVESTIGATE' });

      await sleep(2000);

      // PHASE 3: Successful login from anomalous location
      currentPhase = 3;
      const ev3: SecurityEvent = {
        id: 'sim-ev-' + Date.now() + '-3',
        incident_id: 'INC-1042',
        event_type: 'authentication_success',
        user: 'employee_247',
        source_ip: '185.220.101.5',
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
        description: 'Successful authentication token issued from anomalous geo (Lagos, Nigeria)',
        payload: { geo: 'Lagos, Nigeria', baseline_geo: 'Boston, MA, USA', delta_km: 9200 }
      };
      db.addEvent(ev3);
      resetIncident.severity = 'CRITICAL';
      resetIncident.confidence = 78;
      resetIncident.status = 'INVESTIGATING';
      resetIncident.current_stage = 'CORRELATE';
      db.upsertIncident(resetIncident);

      db.addAgentActivity({
        incident_id: 'INC-1042',
        stage: 'CORRELATE',
        timestamp: new Date().toISOString(),
        message: 'High-risk authentication: Successful login from Tor Exit Node',
        details: 'User authenticated from Lagos, Nigeria. Physical impossibility given active Boston session 12m prior.',
        latency_ms: 290
      });
      db.broadcast('simulation_phase', { phase: 3, title: 'Successful login from anomalous location', stage: 'CORRELATE' });

      await sleep(2000);

      // PHASE 4: Threat intelligence match
      currentPhase = 4;
      const ev4: SecurityEvent = {
        id: 'sim-ev-' + Date.now() + '-4',
        incident_id: 'INC-1042',
        event_type: 'threat_intel_match',
        user: 'employee_247',
        source_ip: '185.220.101.5',
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
        description: 'Threat Intel: IP 185.220.101.5 confirmed Tor Exit Relay / Credential Stuffing Botnet',
        payload: { reputation_score: 98, malicious: true, categories: ['Tor Exit', 'Botnet', 'Brute Force'] }
      };
      db.addEvent(ev4);
      resetIncident.confidence = 88;
      resetIncident.current_stage = 'REASON';
      db.upsertIncident(resetIncident);

      db.addAgentActivity({
        incident_id: 'INC-1042',
        stage: 'ENRICH',
        timestamp: new Date().toISOString(),
        message: 'Threat intelligence lookup completed: 98% malicious reputation score',
        details: 'Cross-referenced against AbuseIPDB & AlienVault OTX. IP tagged as active botnet scanner.',
        latency_ms: 310
      });
      db.broadcast('simulation_phase', { phase: 4, title: 'Threat intelligence match: 98% malicious', stage: 'REASON' });

      await sleep(2200);

      // PHASE 5: AI correlation & MITRE mapping
      currentPhase = 5;
      db.addAgentActivity({
        incident_id: 'INC-1042',
        stage: 'REASON',
        timestamp: new Date().toISOString(),
        message: 'AI Reasoning: Correlated multi-stage attack to MITRE ATT&CK T1078',
        details: 'Technique T1078 (Valid Accounts) confirmed. Multi-factor indicators converge on account takeover.',
        latency_ms: 540
      });
      db.broadcast('simulation_phase', { phase: 5, title: 'AI correlation & MITRE T1078 mapping', stage: 'REASON' });

      await sleep(2000);

      // PHASE 6: AI decision engine
      currentPhase = 6;
      const decision: AIDecision = {
        id: 'sim-dec-' + Date.now(),
        incident_id: 'INC-1042',
        classification: 'CREDENTIAL COMPROMISE',
        confidence: 96,
        severity: 'CRITICAL',
        policy: 'AUTO-CONTAIN',
        recommendations: [
          'Disable compromised user account employee_247',
          'Revoke active sessions and OAuth refresh tokens',
          'Block malicious source IP 185.220.101.5 on perimeter firewall',
          'Notify SOC lead analyst via webhook',
          'Verify containment via subsequent telemetry probes'
        ],
        explanation: 'Multiple independent indicators support a high-confidence malicious authentication event: 17 failed authentication spikes within 3 minutes, subsequent login bypass from high-risk ASN, IP classified as Tor exit relay in threat intelligence feeds.',
        evidence_summary: [
          'Authentication anomaly: 17 failed attempts within 180 seconds',
          'Successful login from unusual geography (Lagos, Nigeria vs Boston baseline)',
          'Source IP 185.220.101.5 classified as known Tor exit relay / brute-force botnet node',
          'Session behavior inconsistent with 90-day historical user baseline',
          'MITRE ATT&CK technique T1078 (Valid Accounts) confirmed'
        ],
        created_at: new Date().toISOString()
      };
      db.setDecision(decision);

      resetIncident.confidence = 96;
      resetIncident.status = 'DECIDING';
      resetIncident.current_stage = 'DECIDE';
      db.upsertIncident(resetIncident);

      db.addAgentActivity({
        incident_id: 'INC-1042',
        stage: 'DECIDE',
        timestamp: new Date().toISOString(),
        message: 'Risk Decision: Auto-Containment Policy triggered (Confidence 96% > 90% threshold)',
        details: 'Autonomous execution authorized for reversible low/medium risk containment actions.',
        latency_ms: 190
      });
      db.broadcast('simulation_phase', { phase: 6, title: 'AI decision: CRITICAL, 96% confidence, AUTO-CONTAIN', stage: 'DECIDE' });

      await sleep(2200);

      // PHASE 7: Automated containment execution
      currentPhase = 7;
      resetIncident.status = 'CONTAINMENT_IN_PROGRESS';
      resetIncident.current_stage = 'RESPOND';
      db.upsertIncident(resetIncident);

      const action1: ResponseAction = {
        id: 'sim-act-' + Date.now() + '-1',
        incident_id: 'INC-1042',
        action: 'Revoke active sessions',
        target: 'employee_247 (session_token_sim)',
        risk: 'LOW',
        status: 'COMPLETED',
        result: '2 active web sessions terminated across all IDP providers',
        triggered_by: 'AI Autonomous Agent',
        timestamp: new Date().toISOString(),
        verification_result: 'Token invalidated in Redis cache (HTTP 401 on retry)',
        latency_ms: 420
      };
      db.addAction(action1);

      const action2: ResponseAction = {
        id: 'sim-act-' + Date.now() + '-2',
        incident_id: 'INC-1042',
        action: 'Disable user account',
        target: 'employee_247 (Azure AD / Okta)',
        risk: 'MEDIUM',
        status: 'COMPLETED',
        result: 'User status set to Suspended; MFA tokens frozen',
        triggered_by: 'AI Autonomous Agent',
        timestamp: new Date().toISOString(),
        verification_result: 'Directory query confirmed account status = SUSPENDED',
        latency_ms: 680
      };
      db.addAction(action2);

      const action3: ResponseAction = {
        id: 'sim-act-' + Date.now() + '-3',
        incident_id: 'INC-1042',
        action: 'Block malicious source IP',
        target: '185.220.101.5 (Edge Gateway Palo Alto)',
        risk: 'LOW',
        status: 'COMPLETED',
        result: 'IP appended to dynamic block list firewall group',
        triggered_by: 'AI Autonomous Agent',
        timestamp: new Date().toISOString(),
        verification_result: 'Subsequent TCP SYN packets dropped at edge perimeter (100% drop rate)',
        latency_ms: 310
      };
      db.addAction(action3);

      db.addAgentActivity({
        incident_id: 'INC-1042',
        stage: 'RESPOND',
        timestamp: new Date().toISOString(),
        message: 'Containment actions executed autonomously (3 API calls)',
        details: 'Sessions revoked, user account disabled, perimeter IP block synchronized.',
        latency_ms: 1410
      });
      db.broadcast('simulation_phase', { phase: 7, title: 'Automated containment actions executed', stage: 'RESPOND' });

      await sleep(2400);

      // PHASE 8: Verification & Audit
      currentPhase = 8;
      resetIncident.status = 'CONTAINED';
      resetIncident.current_stage = 'VERIFY';
      resetIncident.response_time = '3.8s';
      resetIncident.summary = 'Potential account compromise detected and successfully neutralized. Multiple failed login attempts were followed by a successful authentication from a Tor exit IP. Sessions terminated, account disabled, IP blocked.';
      db.upsertIncident(resetIncident);

      const audit = db.addAuditLog({
        incident_id: 'INC-1042',
        event: 'Autonomous Incident Containment Executed & Verified',
        evidence: [
          '17 failed logins within 180s',
          'Successful login from 185.220.101.5',
          'AbuseIPDB score 98% malicious',
          'Geo anomaly: Lagos vs Boston standard'
        ],
        ai_classification: 'CREDENTIAL COMPROMISE',
        confidence: 96,
        policy: 'AUTO-CONTAIN',
        action: 'Session Revocation + Account Suspension + Edge IP Block',
        action_result: 'Successful containment in 3.8s. Threat zeroed.',
        timestamp: new Date().toISOString(),
        actor: 'SecOps-Pulse Autonomous Agent v1.0',
      });

      db.addAgentActivity({
        incident_id: 'INC-1042',
        stage: 'VERIFY',
        timestamp: new Date().toISOString(),
        message: 'Verification complete: No subsequent malicious telemetry observed',
        details: `Threat zeroed. Cryptographic audit fingerprint generated: ${audit.fingerprint.substring(0, 16)}...`,
        latency_ms: 730
      });

      db.broadcast('simulation_phase', { 
        phase: 8, 
        title: 'Verification complete: Threat contained ✓', 
        stage: 'VERIFY',
        fingerprint: audit.fingerprint 
      });

      db.broadcast('simulation_completed', {
        incident_id: 'INC-1042',
        status: 'CONTAINED',
        response_time: '3.8s',
        fingerprint: audit.fingerprint,
      });

    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      isSimulationRunning = false;
    }
  })();

  return { status: 'started', phase: 1, totalPhases: 8 };
}
