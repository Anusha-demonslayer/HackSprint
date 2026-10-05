export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type IncidentStatus = 
  | 'NEW'
  | 'INVESTIGATING'
  | 'REASONING'
  | 'DECIDING'
  | 'CONTAINMENT_IN_PROGRESS'
  | 'CONTAINED'
  | 'ESCALATED'
  | 'MONITORING'
  | 'FALSE_POSITIVE';

export type PolicyLevel = 'AUTO-CONTAIN' | 'APPROVAL_REQUIRED' | 'MONITOR';

export interface SecurityEvent {
  id: string;
  incident_id: string;
  event_type: string;
  user?: string;
  source_ip?: string;
  destination_ip?: string;
  timestamp: string;
  severity: Severity;
  description: string;
  payload?: Record<string, any>;
}

export interface AIDecision {
  id: string;
  incident_id: string;
  classification: string;
  confidence: number; // 0-100
  severity: Severity;
  policy: PolicyLevel;
  recommendations: string[];
  explanation: string;
  evidence_summary: string[];
  created_at: string;
}

export interface ResponseAction {
  id: string;
  incident_id: string;
  action: string;
  target: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'COMPLETED' | 'PENDING_APPROVAL' | 'IN_PROGRESS' | 'FAILED' | 'REJECTED';
  result: string;
  triggered_by: 'AI Autonomous Agent' | 'SOC Analyst' | 'Policy Rule';
  timestamp: string;
  verification_result: string;
  latency_ms?: number;
}

export interface AuditRecord {
  id: string;
  incident_id: string;
  event: string;
  evidence: string[];
  ai_classification: string;
  confidence: number;
  policy: PolicyLevel;
  action: string;
  action_result: string;
  timestamp: string;
  actor: string;
  fingerprint: string; // SHA-256 hash
}

export interface Incident {
  id: string;
  incident_id: string; // e.g. "INC-1042"
  title: string;
  detection: string;
  severity: Severity;
  type: string;
  status: IncidentStatus;
  user: string;
  source_ip: string;
  confidence: number;
  mitre_technique: string;
  mitre_tactic: string;
  policy_level: PolicyLevel;
  summary: string;
  response_time: string;
  created_at: string;
  updated_at: string;
  events?: SecurityEvent[];
  decision?: AIDecision;
  actions?: ResponseAction[];
  current_stage?: 'OBSERVE' | 'INVESTIGATE' | 'CORRELATE' | 'REASON' | 'DECIDE' | 'RESPOND' | 'VERIFY';
}

export interface AgentActivityItem {
  id: string;
  incident_id: string;
  timestamp: string;
  stage: 'OBSERVE' | 'INVESTIGATE' | 'ENRICH' | 'CORRELATE' | 'REASON' | 'DECIDE' | 'RESPOND' | 'VERIFY';
  message: string;
  details: string;
  latency_ms: number;
}

export interface ThreatIntelResult {
  ioc: string;
  ioc_type: 'IP' | 'DOMAIN' | 'HASH' | 'USER' | 'URL';
  reputation: 'MALICIOUS' | 'SUSPICIOUS' | 'SAFE' | 'UNKNOWN';
  confidence: number;
  threat_categories: string[];
  geo?: {
    country: string;
    city: string;
    asn: string;
    org: string;
  };
  passive_dns?: string[];
  sightings_count: number;
  first_seen: string;
  last_seen: string;
  recommended_action: string;
}
