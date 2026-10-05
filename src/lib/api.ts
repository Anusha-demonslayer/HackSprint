import { Incident, SecurityEvent, AIDecision, ResponseAction, AuditRecord, AgentActivityItem, ThreatIntelResult, Stats } from '../types';

export const api = {
  async getStats(): Promise<Stats> {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async getIncidents(): Promise<Incident[]> {
    const res = await fetch('/api/incidents');
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async getIncident(id: string): Promise<Incident> {
    const res = await fetch(`/api/incidents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch incident');
    return res.json();
  },

  async triggerInvestigation(id: string): Promise<{ incident: Incident; decision: AIDecision }> {
    const res = await fetch(`/api/incidents/${id}/investigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to trigger investigation');
    return res.json();
  },

  async triggerResponse(id: string, action?: string, target?: string): Promise<{ action: ResponseAction; incident: Incident }> {
    const res = await fetch(`/api/incidents/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, target }),
    });
    if (!res.ok) throw new Error('Failed to trigger response');
    return res.json();
  },

  async verifyIncident(id: string): Promise<{ incident: Incident; audit: AuditRecord }> {
    const res = await fetch(`/api/incidents/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to verify incident');
    return res.json();
  },

  async sendActionDecision(id: string, actionId: string, decision: 'APPROVE' | 'REJECT' | 'ESCALATE'): Promise<{ success: boolean; incident: Incident }> {
    const res = await fetch(`/api/incidents/${id}/action-decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, decision }),
    });
    if (!res.ok) throw new Error('Failed to submit action decision');
    return res.json();
  },

  async lookupThreatIntel(ioc: string): Promise<ThreatIntelResult> {
    const res = await fetch(`/api/threat-intel/${encodeURIComponent(ioc)}`);
    if (!res.ok) throw new Error('Failed to lookup IOC');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditRecord[]> {
    const res = await fetch('/api/audit');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getAgentActivities(): Promise<AgentActivityItem[]> {
    const res = await fetch('/api/activity');
    if (!res.ok) throw new Error('Failed to fetch agent activities');
    return res.json();
  },

  async getActions(): Promise<ResponseAction[]> {
    const res = await fetch('/api/actions');
    if (!res.ok) throw new Error('Failed to fetch actions');
    return res.json();
  },

  async startSimulation(): Promise<any> {
    const res = await fetch('/api/simulation/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to start simulation');
    return res.json();
  },

  async sendEvent(eventData: Record<string, any>): Promise<any> {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!res.ok) throw new Error('Failed to send event');
    return res.json();
  },

  subscribeStream(onMessage: (data: { event: string; payload: any; timestamp: string }) => void): () => void {
    const eventSource = new EventSource('/api/stream');
    eventSource.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        onMessage(parsed);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };
    return () => {
      eventSource.close();
    };
  }
};
