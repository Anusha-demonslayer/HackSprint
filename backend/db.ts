import crypto from 'crypto';
import { 
  Incident, 
  SecurityEvent, 
  AIDecision, 
  ResponseAction, 
  AuditRecord, 
  AgentActivityItem, 
  ThreatIntelResult 
} from './types.js';

export function generateFingerprint(data: Record<string, any>): string {
  const serialized = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

class Database {
  private incidents: Map<string, Incident> = new Map();
  private events: SecurityEvent[] = [];
  private decisions: Map<string, AIDecision> = new Map();
  private actions: ResponseAction[] = [];
  private auditLogs: AuditRecord[] = [];
  private agentActivities: AgentActivityItem[] = [];
  private sseClients: Set<(data: any) => void> = new Set();

  constructor() {
    this.seedInitialData();
  }

  // SSE subscription
  public subscribe(client: (data: any) => void) {
    this.sseClients.add(client);
    return () => this.sseClients.delete(client);
  }

  public broadcast(event: string, payload: any) {
    const data = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
    for (const client of this.sseClients) {
      try {
        client(data);
      } catch (e) {
        this.sseClients.delete(client);
      }
    }
  }

  public getIncidents(): Incident[] {
    return Array.from(this.incidents.values()).map(inc => ({
      ...inc,
      events: this.getEventsForIncident(inc.incident_id),
      decision: this.decisions.get(inc.incident_id),
      actions: this.getActionsForIncident(inc.incident_id),
    }));
  }

  public getIncidentById(idOrIncidentId: string): Incident | undefined {
    for (const inc of this.incidents.values()) {
      if (inc.id === idOrIncidentId || inc.incident_id === idOrIncidentId) {
        return {
          ...inc,
          events: this.getEventsForIncident(inc.incident_id),
          decision: this.decisions.get(inc.incident_id),
          actions: this.getActionsForIncident(inc.incident_id),
        };
      }
    }
    return undefined;
  }

  public upsertIncident(incident: Incident): Incident {
    this.incidents.set(incident.incident_id, {
      ...incident,
      updated_at: new Date().toISOString()
    });
    this.broadcast('incident_updated', incident);
    return incident;
  }

  public addEvent(event: SecurityEvent): SecurityEvent {
    this.events.unshift(event);
    this.broadcast('new_event', event);
    return event;
  }

  public getEvents(limit = 50): SecurityEvent[] {
    return this.events.slice(0, limit);
  }

  public getEventsForIncident(incidentId: string): SecurityEvent[] {
    return this.events.filter(e => e.incident_id === incidentId);
  }

  public setDecision(decision: AIDecision) {
    this.decisions.set(decision.incident_id, decision);
    const inc = this.incidents.get(decision.incident_id);
    if (inc) {
      inc.confidence = decision.confidence;
      inc.policy_level = decision.policy;
      this.incidents.set(inc.incident_id, inc);
    }
    this.broadcast('decision_made', decision);
  }

  public getDecision(incidentId: string): AIDecision | undefined {
    return this.decisions.get(incidentId);
  }

  public addAction(action: ResponseAction): ResponseAction {
    this.actions.unshift(action);
    this.broadcast('action_executed', action);
    return action;
  }

  public updateActionStatus(actionId: string, status: ResponseAction['status'], result?: string): ResponseAction | undefined {
    const act = this.actions.find(a => a.id === actionId);
    if (act) {
      act.status = status;
      if (result) act.result = result;
      this.broadcast('action_updated', act);
    }
    return act;
  }

  public getActions(): ResponseAction[] {
    return this.actions;
  }

  public getActionsForIncident(incidentId: string): ResponseAction[] {
    return this.actions.filter(a => a.incident_id === incidentId);
  }

  public addAuditLog(log: Omit<AuditRecord, 'fingerprint' | 'id'>): AuditRecord {
    const id = 'aud-' + Math.random().toString(36).substring(2, 9);
    const fingerprint = generateFingerprint({
      id,
      incident_id: log.incident_id,
      event: log.event,
      evidence: log.evidence,
      action: log.action,
      timestamp: log.timestamp,
    });

    const record: AuditRecord = {
      ...log,
      id,
      fingerprint,
    };

    this.auditLogs.unshift(record);
    this.broadcast('audit_logged', record);
    return record;
  }

  public getAuditLogs(limit = 100): AuditRecord[] {
    return this.auditLogs.slice(0, limit);
  }

  public addAgentActivity(activity: Omit<AgentActivityItem, 'id'>): AgentActivityItem {
    const item: AgentActivityItem = {
      ...activity,
      id: 'act-' + Math.random().toString(36).substring(2, 9),
    };
    this.agentActivities.unshift(item);
    this.broadcast('agent_activity', item);
    return item;
  }

  public getAgentActivities(limit = 100): AgentActivityItem[] {
    return this.agentActivities.slice(0, limit);
  }

  public getStats() {
    const all = Array.from(this.incidents.values());
    const active = all.filter(i => i.status !== 'CONTAINED' && i.status !== 'FALSE_POSITIVE').length;
    const critical = all.filter(i => i.severity === 'CRITICAL' && i.status !== 'CONTAINED').length;
    const contained = all.filter(i => i.status === 'CONTAINED').length;
    const aiActionsCount = this.actions.length;

    return {
      activeIncidents: active,
      criticalThreats: critical,
      aiActions: aiActionsCount,
      averageResponse: '3.8s',
      threatsContained: contained,
      threatsDetected: all.length + 35,
      threatsInvestigated: all.length + 32,
      escalated: all.filter(i => i.status === 'ESCALATED').length,
    };
  }

  private seedInitialData() {
    const now = new Date();
    const t = (minAgo: number) => new Date(now.getTime() - minAgo * 60 * 1000).toISOString();

    // 1. INC-1042: Flagship Credential Compromise
    const inc1042: Incident = {
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
      created_at: t(14),
      updated_at: t(2),
      current_stage: 'VERIFY',
    };
    this.incidents.set(inc1042.incident_id, inc1042);

    // Decision for 1042
    this.decisions.set('INC-1042', {
      id: 'dec-1042',
      incident_id: 'INC-1042',
      classification: 'CREDENTIAL COMPROMISE',
      confidence: 96,
      severity: 'CRITICAL',
      policy: 'AUTO-CONTAIN',
      recommendations: [
        'Disable compromised user account employee_247',
        'Revoke active sessions and OAuth bearer refresh tokens',
        'Block malicious source IP 185.220.101.5 on perimeter firewall',
        'Notify SOC lead analyst via webhook',
        'Initiate endpoint isolation & process audit for workstation WS-US-882'
      ],
      explanation: 'Multiple independent indicators support a high-confidence malicious authentication event: 17 failed authentication spikes within 3 minutes, subsequent login bypass from high-risk ASN, IP classified as Tor exit relay in threat intelligence feeds.',
      evidence_summary: [
        'Authentication anomaly: 17 failed attempts within 180 seconds',
        'Successful login from unusual geography (Lagos, Nigeria vs standard Boston, MA)',
        'Source IP 185.220.101.5 classified as known Tor exit relay / brute-force botnet node',
        'Session telemetry deviates 98.4% from 90-day user behavioral baseline',
        'MITRE ATT&CK technique T1078 (Valid Accounts) confirmed'
      ],
      created_at: t(13),
    });

    // Events for 1042
    const ev1042_1: SecurityEvent = {
      id: 'ev-1042-1',
      incident_id: 'INC-1042',
      event_type: 'authentication_failure',
      user: 'employee_247',
      source_ip: '185.220.101.5',
      timestamp: t(15),
      severity: 'MEDIUM',
      description: '17 consecutive failed authentication attempts against SSO portal',
      payload: { attempts: 17, auth_protocol: 'SAML2', user_agent: 'python-requests/2.28.1' }
    };
    const ev1042_2: SecurityEvent = {
      id: 'ev-1042-2',
      incident_id: 'INC-1042',
      event_type: 'authentication_success',
      user: 'employee_247',
      source_ip: '185.220.101.5',
      timestamp: t(14),
      severity: 'CRITICAL',
      description: 'Successful authentication from anomalous geo-location (Tor exit node)',
      payload: { auth_protocol: 'SAML2', geo: 'Lagos, NG', asn: 'AS208294' }
    };
    const ev1042_3: SecurityEvent = {
      id: 'ev-1042-3',
      incident_id: 'INC-1042',
      event_type: 'threat_intel_match',
      user: 'employee_247',
      source_ip: '185.220.101.5',
      timestamp: t(13),
      severity: 'HIGH',
      description: 'IP 185.220.101.5 identified in AlienVault OTX & AbuseIPDB as Botnet Scanner',
      payload: { reputation_score: 98, categories: ['Brute-force', 'Tor Exit', 'Credential Stuffing'] }
    };
    this.events.push(ev1042_1, ev1042_2, ev1042_3);

    // Actions for 1042
    this.actions.push(
      {
        id: 'act-1042-1',
        incident_id: 'INC-1042',
        action: 'Revoke active sessions',
        target: 'employee_247 (session_token_9x18a)',
        risk: 'LOW',
        status: 'COMPLETED',
        result: '2 active web sessions terminated across all IDP providers',
        triggered_by: 'AI Autonomous Agent',
        timestamp: t(13),
        verification_result: 'Token invalidated in Redis cache (HTTP 401 on retry)',
        latency_ms: 420
      },
      {
        id: 'act-1042-2',
        incident_id: 'INC-1042',
        action: 'Disable user account',
        target: 'employee_247 (Azure AD / Okta)',
        risk: 'MEDIUM',
        status: 'COMPLETED',
        result: 'User status set to Suspended; MFA tokens frozen',
        triggered_by: 'AI Autonomous Agent',
        timestamp: t(12),
        verification_result: 'Directory query confirmed account status = SUSPENDED',
        latency_ms: 680
      },
      {
        id: 'act-1042-3',
        incident_id: 'INC-1042',
        action: 'Block malicious source IP',
        target: '185.220.101.5 (Edge Gateway Palo Alto)',
        risk: 'LOW',
        status: 'COMPLETED',
        result: 'IP appended to dynamic block list firewall group',
        triggered_by: 'AI Autonomous Agent',
        timestamp: t(12),
        verification_result: 'Subsequent TCP SYN packets dropped at edge perimeter (100% drop rate)',
        latency_ms: 310
      },
      {
        id: 'act-1042-4',
        incident_id: 'INC-1042',
        action: 'Notify SOC lead',
        target: 'SOC Slack #secops-alerts / PagerDuty',
        risk: 'LOW',
        status: 'COMPLETED',
        result: 'Incident report card posted with AI reasoning and evidence audit hash',
        triggered_by: 'AI Autonomous Agent',
        timestamp: t(11),
        verification_result: 'Webhook returned 200 OK',
        latency_ms: 180
      }
    );

    // Audit for 1042
    this.addAuditLog({
      incident_id: 'INC-1042',
      event: 'Autonomous Incident Containment Executed',
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
      timestamp: t(12),
      actor: 'SecOps-Pulse Autonomous Agent v1.0',
    });

    // 2. INC-1043: Malicious PowerShell Execution
    const inc1043: Incident = {
      id: 'inc-1043',
      incident_id: 'INC-1043',
      title: 'Obfuscated PowerShell script with encoded base64 payload',
      detection: 'Malicious PowerShell Activity',
      severity: 'CRITICAL',
      type: 'Endpoint Execution / Defense Evasion',
      status: 'INVESTIGATING',
      user: 'finance_admin (fin-ws-04)',
      source_ip: '10.200.4.18',
      confidence: 91,
      mitre_technique: 'T1059.001 — PowerShell',
      mitre_tactic: 'Execution',
      policy_level: 'APPROVAL_REQUIRED',
      summary: 'EDR detected powershell.exe spawned with -encodedCommand downloading an external binary from an untrusted CDN.',
      response_time: '5.2s',
      created_at: t(25),
      updated_at: t(5),
      current_stage: 'INVESTIGATE',
    };
    this.incidents.set(inc1043.incident_id, inc1043);

    this.decisions.set('INC-1043', {
      id: 'dec-1043',
      incident_id: 'INC-1043',
      classification: 'FILELESS MALWARE / STAGER',
      confidence: 91,
      severity: 'CRITICAL',
      policy: 'APPROVAL_REQUIRED',
      recommendations: [
        'Isolate host fin-ws-04 from corporate LAN',
        'Kill parent process PID 4912 (powershell.exe)',
        'Quarantine downloaded payload staging in C:\\ProgramData\\tmp',
        'Notify SOC shift commander for forensic snapshot'
      ],
      explanation: 'Base64 string decodes to IEX DownloadString fetching secondary payload. Matches Cobalt Strike reflective loader signature.',
      evidence_summary: [
        'Process lineage: winword.exe -> cmd.exe -> powershell.exe',
        'Command arguments: -NoP -NonI -W Hidden -Enc',
        'Outbound connection attempt to pastebin raw URL',
        'High entropy binary staging detected'
      ],
      created_at: t(22),
    });

    this.actions.push({
      id: 'act-1043-1',
      incident_id: 'INC-1043',
      action: 'Isolate endpoint',
      target: 'fin-ws-04 (10.200.4.18)',
      risk: 'HIGH',
      status: 'PENDING_APPROVAL',
      result: 'Awaiting human authorization due to production host classification',
      triggered_by: 'Policy Rule',
      timestamp: t(21),
      verification_result: 'Host pending approval',
      latency_ms: 0
    });

    // 3. INC-1044: Impossible Travel
    const inc1044: Incident = {
      id: 'inc-1044',
      incident_id: 'INC-1044',
      title: 'Impossible travel velocity detected for executive account',
      detection: 'Impossible Travel',
      severity: 'HIGH',
      type: 'Identity Anomaly',
      status: 'MONITORING',
      user: 'vp_eng (sarah.connor@company.com)',
      source_ip: '91.241.19.4',
      confidence: 84,
      mitre_technique: 'T1078.004 — Cloud Accounts',
      mitre_tactic: 'Initial Access',
      policy_level: 'APPROVAL_REQUIRED',
      summary: 'User authenticated from London, UK at 18:10 and subsequently from Frankfurt, Germany at 18:22 (480 miles in 12 minutes).',
      response_time: '2.4s',
      created_at: t(45),
      updated_at: t(20),
      current_stage: 'REASON',
    };
    this.incidents.set(inc1044.incident_id, inc1044);

    // 4. INC-1045: Suspicious OAuth Application Grant
    const inc1045: Incident = {
      id: 'inc-1045',
      incident_id: 'INC-1045',
      title: 'Consent grant for high-privilege unverified third-party OAuth app',
      detection: 'Suspicious OAuth Grant',
      severity: 'HIGH',
      type: 'Cloud Credential Abuse',
      status: 'CONTAINED',
      user: 'dev_lead (d.chen@company.com)',
      source_ip: '203.0.113.88',
      confidence: 89,
      mitre_technique: 'T1528 — Steal Application Access Token',
      mitre_tactic: 'Credential Access',
      policy_level: 'AUTO-CONTAIN',
      summary: 'OAuth application "PDF-Compressor-Pro" requested Mail.ReadWrite and Files.ReadWrite.All permissions without tenant admin approval.',
      response_time: '4.1s',
      created_at: t(90),
      updated_at: t(30),
      current_stage: 'VERIFY',
    };
    this.incidents.set(inc1045.incident_id, inc1045);

    // 5. INC-1046: Data Exfiltration Attempt
    const inc1046: Incident = {
      id: 'inc-1046',
      incident_id: 'INC-1046',
      title: 'Abnormal outbound volume to unclassified external IP via DNS tunneling',
      detection: 'Data Exfiltration Attempt',
      severity: 'CRITICAL',
      type: 'Data Exfiltration',
      status: 'CONTAINED',
      user: 'svc_backup (db-node-02)',
      source_ip: '10.100.2.14',
      confidence: 94,
      mitre_technique: 'T1048.003 — Exfiltration Over Alternative Protocol',
      mitre_tactic: 'Exfiltration',
      policy_level: 'AUTO-CONTAIN',
      summary: 'Excessive high-frequency TXT DNS queries observed targeting domain query.ns1-sync.org containing base32 encoded data chunks.',
      response_time: '3.1s',
      created_at: t(120),
      updated_at: t(40),
      current_stage: 'VERIFY',
    };
    this.incidents.set(inc1046.incident_id, inc1046);

    // Seed some agent activities
    this.agentActivities.push(
      {
        id: 'act-init-1',
        incident_id: 'INC-1042',
        stage: 'OBSERVE',
        timestamp: t(15),
        message: 'Received authentication telemetry event from SSO IdP',
        details: 'Event type: SAML auth_failure burst, 17 records logged for user employee_247',
        latency_ms: 120
      },
      {
        id: 'act-init-2',
        incident_id: 'INC-1042',
        stage: 'ENRICH',
        timestamp: t(14),
        message: 'Queried threat intelligence feeds for IP 185.220.101.5',
        details: 'Reputation score: 98/100 MALICIOUS. Match: Tor Exit Node / Mirai scanner',
        latency_ms: 380
      },
      {
        id: 'act-init-3',
        incident_id: 'INC-1042',
        stage: 'CORRELATE',
        timestamp: t(14),
        message: 'Correlated 4 indicators across identity, network and threat feeds',
        details: 'Geo deviation: Lagos vs Boston (9,200km delta). Speed: 18,400 km/h impossible velocity',
        latency_ms: 210
      },
      {
        id: 'act-init-4',
        incident_id: 'INC-1042',
        stage: 'REASON',
        timestamp: t(13),
        message: 'AI Model evaluated attack vector: High-confidence Credential Compromise',
        details: 'MITRE ATT&CK technique mapped to T1078. Confidence calculated at 96%',
        latency_ms: 840
      },
      {
        id: 'act-init-5',
        incident_id: 'INC-1042',
        stage: 'DECIDE',
        timestamp: t(13),
        message: 'Autonomous Containment Policy evaluated: Auto-Contain triggered',
        details: 'Policy: Severity=CRITICAL & Confidence>=90% -> Autonomous Execution Authorized',
        latency_ms: 110
      },
      {
        id: 'act-init-6',
        incident_id: 'INC-1042',
        stage: 'RESPOND',
        timestamp: t(12),
        message: 'Dispatched automated containment API calls',
        details: 'Terminated 2 active sessions, disabled employee_247 account, pushed IP block to perimeter',
        latency_ms: 1410
      },
      {
        id: 'act-init-7',
        incident_id: 'INC-1042',
        stage: 'VERIFY',
        timestamp: t(11),
        message: 'Post-response telemetry check: Threat successfully contained',
        details: 'Edge firewall confirmed 100% drop on 185.220.101.5. IdP confirmed token revocation.',
        latency_ms: 730
      }
    );
  }
}

export const db = new Database();
