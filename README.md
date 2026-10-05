# SECOPS-PULSE — Autonomous AI Incident Response Agent

> **«Detect. Reason. Decide. Contain.»**  
> *Autonomous defense. Faster than the attack.*

SecOps-Pulse is an Autonomous Tier-1 AI Incident Response Agent designed for modern SOC (Security Operations Center) teams. Rather than merely alerting humans with static telemetry, SecOps-Pulse autonomously executes the complete response loop:

```
SECURITY EVENT → DETECT → ENRICH → INVESTIGATE → AI REASONING → RISK DECISION → RESPONSE → VERIFY → AUDIT
```

---

## 1. Product Overview

SecOps-Pulse functions as an autonomous Tier-1 AI SOC analyst that:
- Ingests real-time events via SIEM webhooks (e.g. n8n, Splunk, Microsoft Sentinel).
- Queries threat intelligence feeds (AbuseIPDB, AlienVault OTX) for reputation and IOC correlation.
- Maps observed behaviors to MITRE ATT&CK techniques (e.g. T1078 Valid Accounts, T1059.001 PowerShell).
- Employs a dual-engine architecture: transparent deterministic security rules + Google Gemini 3.8 LLM reasoning.
- Executes automated, policy-governed containment actions (session revocation, account freezing, edge IP blocking) in an average of **3.8 seconds**.
- Verifies post-containment telemetry to confirm the threat has been neutralized.
- Produces immutable SHA-256 cryptographic audit logs for every decision and action.

---

## 2. Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                       SecOps-Pulse UI                         │
│   (Command Center, AI Core Visualizer, Live Incidents, SSE)   │
└───────────────────────────────▲───────────────────────────────┘
                                │ REST + Server-Sent Events (SSE)
┌───────────────────────────────▼───────────────────────────────┐
│                    Express Full-Stack Server                  │
│                     (Port 3000 / server.ts)                   │
├───────────────────────────────────────────────────────────────┤
│  API Routes        Simulation Engine     SSE Broadcaster      │
│  (/api/*)          (8-Phase Attack)      (Real-time stream)   │
├───────────────────────────────────────────────────────────────┤
│  Security Rule Engine       AI Service Abstraction            │
│  (Rules + Evidence)         (@google/genai / Gemini 3.8)      │
├───────────────────────────────────────────────────────────────┤
│  Threat Intel Engine        Cryptographic Audit Store         │
│  (IOC Lookup / Geo)         (SHA-256 Fingerprints)            │
└───────────────────────────────▲───────────────────────────────┘
                                │ Webhook Ingestion
┌───────────────────────────────┴───────────────────────────────┐
│                      n8n Orchestration Layer                  │
│          (workflows/n8n/incident-response-workflow.json)      │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. Installation & Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Start the unified development server (Express backend + Vite client)
npm run dev

# 3. Open in your browser
# Dev server runs on http://localhost:3000
```

---

## 4. Environment Variables

Create or configure `.env` (sample provided in `.env.example`):

```bash
# GEMINI_API_KEY: Required for live LLM reasoning (automatically injected in AI Studio)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Port to bind
PORT=3000
```

*Note: If no API key is provided, SecOps-Pulse smoothly falls back to its deterministic rule engine so the application remains 100% operational.*

---

## 5. Flagship Hackathon Demo: Attack Simulation

To experience SecOps-Pulse in action:
1. Open the application.
2. Click **`▶ LAUNCH ATTACK SIMULATION`** in the top header or Command Center.
3. Observe the live 8-phase attack unfold across 10–18 seconds:
   - **Phase 1 (OBSERVE)**: Suspicious authentication begins.
   - **Phase 2 (INVESTIGATE)**: 17 rapid failed logins (velocity threshold exceeded).
   - **Phase 3 (CORRELATE)**: Successful login bypass from Lagos, Nigeria (Tor Exit Node).
   - **Phase 4 (REASON)**: Threat intel match (98% malicious botnet scanner).
   - **Phase 5 (REASON)**: MITRE ATT&CK T1078 technique correlated.
   - **Phase 6 (DECIDE)**: Auto-contain policy triggered (Critical severity + 96% confidence).
   - **Phase 7 (RESPOND)**: Autonomous execution (sessions revoked, account disabled, IP blocked).
   - **Phase 8 (VERIFY)**: Zero subsequent telemetry, SHA-256 cryptographic audit signature generated (`CONTAINED ✓`).

---

## 6. n8n Integration

SecOps-Pulse provides webhook endpoints tailored for n8n:
- **Webhook Endpoint**: `POST /api/events`
- **Orchestration Workflow**: Check `workflows/n8n/incident-response-workflow.json`

Example payload:
```json
{
  "event_type": "authentication",
  "user": "employee_247",
  "source_ip": "185.10.20.30",
  "timestamp": "2026-10-05T18:42:31Z",
  "failed_attempts": 17,
  "successful_login": true
}
```

---

## 7. API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats` | High-level metrics (active incidents, containment latency, totals) |
| `GET` | `/api/incidents` | List all tracked security incidents |
| `GET` | `/api/incidents/:id` | Fetch detailed incident context |
| `POST` | `/api/incidents/:id/investigate` | Trigger AI investigation with Gemini / Rules |
| `POST` | `/api/incidents/:id/respond` | Trigger or execute containment action |
| `POST` | `/api/incidents/:id/verify` | Verify post-containment telemetry |
| `POST` | `/api/incidents/:id/action-decision` | Human-in-the-loop action approval/rejection |
| `POST` | `/api/events` | Ingest external SIEM/n8n security event |
| `GET` | `/api/threat-intel/:ioc` | Reputation & MITRE lookup for IP, domain, hash, user |
| `GET` | `/api/audit` | Fetch immutable compliance audit logs with SHA-256 hashes |
| `POST` | `/api/simulation/start` | Launch end-to-end 8-phase attack simulation |
| `GET` | `/api/stream` | Server-Sent Events (SSE) live telemetry stream |

---

## 8. Security Considerations

- **Dual Policy Gate**: Destructive or high-blast-radius actions require explicit Human-in-the-loop approval. Low/medium risk reversible actions are auto-contained when confidence exceeds policy thresholds.
- **No Unsafe Execution**: External actions operate through strictly validated API calls or simulation sandboxes.
- **Cryptographic Auditability**: Every action creates a SHA-256 fingerprint verifiable against tampering.
