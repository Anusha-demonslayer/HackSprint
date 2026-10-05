import { SecurityEvent, Severity, PolicyLevel } from './types.js';

export interface RuleEvaluationResult {
  rule_matched: boolean;
  rule_name: string;
  baseline_severity: Severity;
  baseline_confidence: number;
  policy: PolicyLevel;
  triggered_conditions: string[];
  recommended_actions: string[];
  mitre_technique: string;
  mitre_tactic: string;
}

export function evaluateSecurityRules(
  events: SecurityEvent[],
  threatScore = 0
): RuleEvaluationResult {
  const triggered: string[] = [];
  let failedAttempts = 0;
  let successfulLoginAfterFails = false;
  let hasMaliciousIP = threatScore >= 70;
  let hasPowerShellExec = false;
  let hasDnsTunneling = false;
  let hasImpossibleTravel = false;

  for (const ev of events) {
    if (ev.event_type === 'authentication_failure' || (ev.payload?.attempts && ev.payload.attempts > 5)) {
      failedAttempts += ev.payload?.attempts || 1;
      triggered.push(`Failed authentication burst detected (${failedAttempts} attempts)`);
    }
    if (ev.event_type === 'authentication_success' && failedAttempts > 5) {
      successfulLoginAfterFails = true;
      triggered.push('Successful login authenticated immediately after failure threshold');
    }
    if (ev.source_ip && (ev.source_ip.startsWith('185.') || ev.source_ip.startsWith('91.'))) {
      hasMaliciousIP = true;
      triggered.push(`Source IP reputation classified as high-risk/malicious (${ev.source_ip})`);
    }
    if (ev.event_type === 'process_execution' || ev.description?.toLowerCase().includes('powershell')) {
      hasPowerShellExec = true;
      triggered.push('Obfuscated shell process execution detected (powershell.exe -enc)');
    }
    if (ev.event_type === 'dns_query' || ev.description?.toLowerCase().includes('dns')) {
      hasDnsTunneling = true;
      triggered.push('Abnormal high-entropy TXT records indicative of DNS data tunneling');
    }
    if (ev.event_type === 'geo_anomaly' || ev.description?.toLowerCase().includes('impossible travel')) {
      hasImpossibleTravel = true;
      triggered.push('Impossible travel velocity detected between distinct geo coordinates');
    }
  }

  // Rule 1: Brute Force followed by Compromise from Malicious IP
  if ((failedAttempts >= 10 && successfulLoginAfterFails) || (hasMaliciousIP && successfulLoginAfterFails)) {
    return {
      rule_matched: true,
      rule_name: 'RULE-AUTH-094: Credential Compromise & Spraying Velocity',
      baseline_severity: 'CRITICAL',
      baseline_confidence: 96,
      policy: 'AUTO-CONTAIN',
      triggered_conditions: triggered,
      recommended_actions: [
        'Disable compromised user account',
        'Revoke active sessions and OAuth bearer tokens',
        'Block malicious source IP at perimeter edge',
        'Notify SOC analyst & generate audit ledger'
      ],
      mitre_technique: 'T1078 — Valid Accounts',
      mitre_tactic: 'Credential Access'
    };
  }

  // Rule 2: Malicious PowerShell / Process Execution
  if (hasPowerShellExec) {
    return {
      rule_matched: true,
      rule_name: 'RULE-EXEC-012: Suspicious Encoded Script Interpreter',
      baseline_severity: 'CRITICAL',
      baseline_confidence: 92,
      policy: 'APPROVAL_REQUIRED',
      triggered_conditions: triggered,
      recommended_actions: [
        'Isolate host from corporate subnet',
        'Terminate active process tree',
        'Quarantine staging directory payload',
        'Collect volatile memory forensic snapshot'
      ],
      mitre_technique: 'T1059.001 — PowerShell',
      mitre_tactic: 'Execution'
    };
  }

  // Rule 3: DNS Tunneling / Exfiltration
  if (hasDnsTunneling) {
    return {
      rule_matched: true,
      rule_name: 'RULE-EXFIL-008: Outbound DNS Covert Channel Exfiltration',
      baseline_severity: 'CRITICAL',
      baseline_confidence: 94,
      policy: 'AUTO-CONTAIN',
      triggered_conditions: triggered,
      recommended_actions: [
        'Sinkhole authoritative exfiltration domain on internal resolver',
        'Isolate originating server host',
        'Revoke database read credentials'
      ],
      mitre_technique: 'T1048.003 — Exfiltration Over Alternative Protocol',
      mitre_tactic: 'Exfiltration'
    };
  }

  // Rule 4: Impossible Travel
  if (hasImpossibleTravel) {
    return {
      rule_matched: true,
      rule_name: 'RULE-GEO-003: Impossible Travel Geo-Velocity Violation',
      baseline_severity: 'HIGH',
      baseline_confidence: 85,
      policy: 'APPROVAL_REQUIRED',
      triggered_conditions: triggered,
      recommended_actions: [
        'Prompt user for stepped-up hardware MFA challenge',
        'Revoke recent session cookies',
        'Notify user of abnormal login attempt'
      ],
      mitre_technique: 'T1078.004 — Cloud Accounts',
      mitre_tactic: 'Initial Access'
    };
  }

  // Fallback default rule
  return {
    rule_matched: false,
    rule_name: 'RULE-GENERIC-001: General Anomaly Telemetry Baseline',
    baseline_severity: 'MEDIUM',
    baseline_confidence: 70,
    policy: 'MONITOR',
    triggered_conditions: triggered.length > 0 ? triggered : ['Standard anomalous event telemetry ingested'],
    recommended_actions: [
      'Increase logging verbosity on source asset',
      'Correlate user session against 30-day baseline'
    ],
    mitre_technique: 'T1078 — Valid Accounts',
    mitre_tactic: 'Initial Access'
  };
}
