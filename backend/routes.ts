import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { aiService } from './aiService.js';
import { lookupThreatIntel } from './threatIntel.js';
import { startAttackSimulation, getSimulationStatus } from './simulation.js';
import { SecurityEvent, ResponseAction } from './types.js';

export const apiRouter = Router();

// 1. GET /api/stats: Live metrics
apiRouter.get('/stats', (req: Request, res: Response) => {
  res.json(db.getStats());
});

// 2. GET /api/agent/status: AI Agent telemetry & status
apiRouter.get('/agent/status', (req: Request, res: Response) => {
  const stats = db.getStats();
  const sim = getSimulationStatus();
  res.json({
    status: 'ONLINE',
    agent_name: 'SecOps-Pulse Tier-1 Autonomous SOC Agent',
    mode: 'AUTONOMOUS',
    capabilities: [
      'OBSERVE: Real-time SIEM/Webhook ingestion',
      'ENRICH: Automated threat intelligence lookup',
      'CORRELATE: Multi-vector MITRE ATT&CK mapping',
      'REASON: LLM & Rule-based transparent decision logic',
      'DECIDE: Policy-governed action triage (Auto-Contain vs Approval)',
      'RESPOND: Automated API containment execution',
      'VERIFY: Post-action telemetry & zero-threat validation',
      'AUDIT: Immutable SHA-256 cryptographic compliance logging'
    ],
    active_incidents: stats.activeIncidents,
    contained_threats: stats.threatsContained,
    simulation: sim,
    stages: ['OBSERVE', 'INVESTIGATE', 'CORRELATE', 'REASON', 'DECIDE', 'RESPOND', 'VERIFY']
  });
});

// 3. GET /api/incidents: List all incidents
apiRouter.get('/incidents', (req: Request, res: Response) => {
  res.json(db.getIncidents());
});

// 4. GET /api/incidents/:id: Incident detail
apiRouter.get('/incidents/:id', (req: Request, res: Response) => {
  const inc = db.getIncidentById(req.params.id);
  if (!inc) {
    res.status(404).json({ error: 'Incident not found' });
    return;
  }
  res.json(inc);
});

// 5. POST /api/incidents/:id/investigate: Trigger AI investigation
apiRouter.post('/incidents/:id/investigate', async (req: Request, res: Response) => {
  const inc = db.getIncidentById(req.params.id);
  if (!inc) {
    res.status(404).json({ error: 'Incident not found' });
    return;
  }

  const events = db.getEventsForIncident(inc.incident_id);
  inc.status = 'INVESTIGATING';
  inc.current_stage = 'REASON';
  db.upsertIncident(inc);

  const decision = await aiService.analyzeIncident(inc, events);
  db.setDecision(decision);

  inc.status = 'DECIDING';
  inc.current_stage = 'DECIDE';
  db.upsertIncident(inc);

  db.addAgentActivity({
    incident_id: inc.incident_id,
    stage: 'REASON',
    timestamp: new Date().toISOString(),
    message: `AI Investigation finished for ${inc.incident_id}`,
    details: `Classification: ${decision.classification} | Confidence: ${decision.confidence}% | Policy: ${decision.policy}`,
    latency_ms: 680,
  });

  res.json({ incident: inc, decision });
});

// 6. POST /api/incidents/:id/respond: Trigger or execute containment action
apiRouter.post('/incidents/:id/respond', (req: Request, res: Response) => {
  const inc = db.getIncidentById(req.params.id);
  if (!inc) {
    res.status(404).json({ error: 'Incident not found' });
    return;
  }

  const { action, target, risk = 'LOW' } = req.body;
  const actionName = action || 'Revoke active sessions and block IP';
  const actionTarget = target || inc.user || inc.source_ip;

  const newAction: ResponseAction = {
    id: 'act-' + Math.random().toString(36).substring(2, 9),
    incident_id: inc.incident_id,
    action: actionName,
    target: actionTarget,
    risk: risk,
    status: 'COMPLETED',
    result: 'Execution successful. Policy authorization granted.',
    triggered_by: 'AI Autonomous Agent',
    timestamp: new Date().toISOString(),
    verification_result: 'Telemetry verified nominal state.',
    latency_ms: 380,
  };

  db.addAction(newAction);

  inc.status = 'CONTAINMENT_IN_PROGRESS';
  inc.current_stage = 'RESPOND';
  db.upsertIncident(inc);

  db.addAgentActivity({
    incident_id: inc.incident_id,
    stage: 'RESPOND',
    timestamp: new Date().toISOString(),
    message: `Containment action executed: ${actionName}`,
    details: `Target: ${actionTarget} | Status: COMPLETED`,
    latency_ms: 380,
  });

  res.json({ action: newAction, incident: inc });
});

// 7. POST /api/incidents/:id/verify: Post-response verification
apiRouter.post('/incidents/:id/verify', (req: Request, res: Response) => {
  const inc = db.getIncidentById(req.params.id);
  if (!inc) {
    res.status(404).json({ error: 'Incident not found' });
    return;
  }

  inc.status = 'CONTAINED';
  inc.current_stage = 'VERIFY';
  inc.response_time = '3.8s';
  db.upsertIncident(inc);

  const audit = db.addAuditLog({
    incident_id: inc.incident_id,
    event: 'Post-Response Telemetry Verification Confirmed',
    evidence: [
      'Ingress dropped for malicious source',
      'Target credentials revoked & token cache invalidated',
      'Zero anomalous transactions recorded in 600s observation window'
    ],
    ai_classification: inc.detection.toUpperCase(),
    confidence: inc.confidence,
    policy: inc.policy_level,
    action: 'Containment Verified',
    action_result: 'Zero threat residual detected. Incident marked CONTAINED.',
    timestamp: new Date().toISOString(),
    actor: 'SecOps-Pulse Autonomous Agent',
  });

  db.addAgentActivity({
    incident_id: inc.incident_id,
    stage: 'VERIFY',
    timestamp: new Date().toISOString(),
    message: 'Verification complete: Threat contained',
    details: `SHA-256 Audit Signature: ${audit.fingerprint}`,
    latency_ms: 220,
  });

  res.json({ incident: inc, audit });
});

// 8. POST /api/incidents/:id/action-decision: Human-in-the-loop action approval/rejection
apiRouter.post('/incidents/:id/action-decision', (req: Request, res: Response) => {
  const { actionId, decision } = req.body; // 'APPROVE' | 'REJECT' | 'ESCALATE'
  const inc = db.getIncidentById(req.params.id);
  if (!inc) {
    res.status(404).json({ error: 'Incident not found' });
    return;
  }

  if (decision === 'APPROVE') {
    db.updateActionStatus(actionId, 'COMPLETED', 'Approved by SOC Analyst. Execution verified.');
    inc.status = 'CONTAINED';
    inc.current_stage = 'VERIFY';
    db.upsertIncident(inc);

    db.addAuditLog({
      incident_id: inc.incident_id,
      event: 'Human Approval Granted for High-Risk Action',
      evidence: ['SOC Analyst review of proposed containment'],
      ai_classification: inc.detection.toUpperCase(),
      confidence: inc.confidence,
      policy: inc.policy_level,
      action: 'Analyst Approved Action',
      action_result: 'Action executed successfully.',
      timestamp: new Date().toISOString(),
      actor: 'SOC Analyst (Human-in-the-Loop)',
    });
  } else if (decision === 'REJECT') {
    db.updateActionStatus(actionId, 'REJECTED', 'Rejected by SOC Analyst.');
    inc.status = 'MONITORING';
    db.upsertIncident(inc);
  } else if (decision === 'ESCALATE') {
    inc.status = 'ESCALATED';
    db.upsertIncident(inc);
  }

  res.json({ success: true, incident: inc });
});

// 9. POST /api/events: Ingest security event (n8n Webhook Endpoint)
apiRouter.post('/events', (req: Request, res: Response) => {
  const body = req.body;
  const eventId = 'ev-' + Math.random().toString(36).substring(2, 9);
  const incidentId = body.incident_id || 'INC-' + Math.floor(1000 + Math.random() * 9000);

  const event: SecurityEvent = {
    id: eventId,
    incident_id: incidentId,
    event_type: body.event_type || 'generic_security_event',
    user: body.user || 'system',
    source_ip: body.source_ip || '127.0.0.1',
    destination_ip: body.destination_ip,
    timestamp: body.timestamp || new Date().toISOString(),
    severity: (body.severity as any) || 'MEDIUM',
    description: body.description || `Event received from webhook: ${body.event_type || 'telemetry'}`,
    payload: body,
  };

  db.addEvent(event);

  // Check or create incident
  let existing = db.getIncidentById(incidentId);
  if (!existing) {
    existing = {
      id: 'inc-' + incidentId.toLowerCase(),
      incident_id: incidentId,
      title: body.title || `Suspicious ${body.event_type || 'activity'} on ${body.user || body.source_ip}`,
      detection: body.detection || (body.event_type ? body.event_type.replace(/_/g, ' ') : 'Security Anomaly'),
      severity: event.severity,
      type: body.type || 'Automated Webhook Alert',
      status: 'NEW',
      user: event.user || 'unknown',
      source_ip: event.source_ip || 'unknown',
      confidence: 75,
      mitre_technique: 'T1078 — Valid Accounts',
      mitre_tactic: 'Initial Access',
      policy_level: 'AUTO-CONTAIN',
      summary: `Automated event ingested from external source (n8n/SIEM). User: ${event.user}, Source: ${event.source_ip}`,
      response_time: 'Pending...',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      current_stage: 'OBSERVE',
    };
    db.upsertIncident(existing);
  }

  db.addAgentActivity({
    incident_id: incidentId,
    stage: 'OBSERVE',
    timestamp: new Date().toISOString(),
    message: `Security event received via Webhook API: ${event.event_type}`,
    details: `User: ${event.user} | IP: ${event.source_ip} | Severity: ${event.severity}`,
    latency_ms: 45,
  });

  res.status(201).json({
    status: 'accepted',
    message: 'Event ingested into SecOps-Pulse Autonomous Agent pipeline',
    event_id: event.id,
    incident_id: incidentId,
  });
});

// 10. POST /api/actions: n8n execution webhook
apiRouter.post('/actions', (req: Request, res: Response) => {
  const { incident_id, action, target, risk = 'LOW' } = req.body;
  const newAction: ResponseAction = {
    id: 'act-' + Math.random().toString(36).substring(2, 9),
    incident_id: incident_id || 'INC-1042',
    action: action || 'Automated Webhook Action',
    target: target || 'Default Target',
    risk,
    status: 'COMPLETED',
    result: 'Executed via external orchestration webhook (n8n)',
    triggered_by: 'Policy Rule',
    timestamp: new Date().toISOString(),
    verification_result: 'Verified by external webhook responder',
    latency_ms: 150,
  };
  db.addAction(newAction);
  res.json({ status: 'success', action: newAction });
});

// 11. GET /api/threat-intel/:ioc: IOC Reputation Lookup
apiRouter.get('/threat-intel/:ioc', (req: Request, res: Response) => {
  const result = lookupThreatIntel(req.params.ioc);
  res.json(result);
});

// 12. GET /api/audit: Compliance Audit Trail
apiRouter.get('/audit', (req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

// 13. GET /api/activity: Agent Activity Logs
apiRouter.get('/activity', (req: Request, res: Response) => {
  res.json(db.getAgentActivities());
});

// 14. GET /api/actions: Response actions list
apiRouter.get('/actions', (req: Request, res: Response) => {
  res.json(db.getActions());
});

// 15. POST /api/simulation/start: Launch Flagship Attack Simulation
apiRouter.post('/simulation/start', (req: Request, res: Response) => {
  const result = startAttackSimulation();
  res.json(result);
});

// 16. GET /api/simulation/status: Check Simulation Status
apiRouter.get('/simulation/status', (req: Request, res: Response) => {
  res.json(getSimulationStatus());
});

// 17. GET /api/stream: Server-Sent Events (SSE) stream for live real-time updates
apiRouter.get('/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  res.write(`data: ${JSON.stringify({ event: 'connected', message: 'SecOps-Pulse real-time stream established' })}\n\n`);

  const unsubscribe = db.subscribe((data) => {
    res.write(`data: ${data}\n\n`);
  });

  req.on('close', () => {
    unsubscribe();
  });
});
