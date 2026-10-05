import { ThreatIntelResult } from './types.js';

const mockThreatDatabase: Record<string, ThreatIntelResult> = {
  '185.220.101.5': {
    ioc: '185.220.101.5',
    ioc_type: 'IP',
    reputation: 'MALICIOUS',
    confidence: 98,
    threat_categories: ['Tor Exit Node', 'Credential Stuffing Botnet', 'Brute Force Scanner'],
    geo: {
      country: 'Nigeria',
      city: 'Lagos',
      asn: 'AS208294',
      org: 'Zwiebelfreunde Tor Infrastructure'
    },
    passive_dns: ['vpn-exit-node-09.relay.net', 'tor-exit.secured-gw.org'],
    sightings_count: 1420,
    first_seen: '2024-03-12T00:00:00Z',
    last_seen: new Date().toISOString(),
    recommended_action: 'Immediate perimeter block; inspect all ingress traffic from /24 subnet.'
  },
  '91.241.19.4': {
    ioc: '91.241.19.4',
    ioc_type: 'IP',
    reputation: 'SUSPICIOUS',
    confidence: 82,
    threat_categories: ['Anonymous Proxy', 'Commercial VPN'],
    geo: {
      country: 'Germany',
      city: 'Frankfurt',
      asn: 'AS44034',
      org: 'Hostinger Data Centers'
    },
    passive_dns: ['proxy-frankfurt-02.mullvad-edge.net'],
    sightings_count: 312,
    first_seen: '2025-01-09T00:00:00Z',
    last_seen: new Date().toISOString(),
    recommended_action: 'Enforce Step-Up FIDO2 MFA challenge on associated session.'
  },
  'raw.githubusercontent.com/apt-c2/beacon.ps1': {
    ioc: 'raw.githubusercontent.com/apt-c2/beacon.ps1',
    ioc_type: 'URL',
    reputation: 'MALICIOUS',
    confidence: 96,
    threat_categories: ['Cobalt Strike Stager', 'Command & Control Payload'],
    sightings_count: 88,
    first_seen: '2026-08-14T00:00:00Z',
    last_seen: new Date().toISOString(),
    recommended_action: 'Block URL on corporate proxy; isolate downloading endpoints.'
  },
  'query.ns1-sync.org': {
    ioc: 'query.ns1-sync.org',
    ioc_type: 'DOMAIN',
    reputation: 'MALICIOUS',
    confidence: 95,
    threat_categories: ['DNS Tunneling C2', 'Data Exfiltration Channel'],
    geo: {
      country: 'Russia',
      city: 'Saint Petersburg',
      asn: 'AS49505',
      org: 'Serverel Hosting Ltd'
    },
    passive_dns: ['ns1.ns1-sync.org', 'ns2.ns1-sync.org'],
    sightings_count: 640,
    first_seen: '2026-09-01T00:00:00Z',
    last_seen: new Date().toISOString(),
    recommended_action: 'Blackhole DNS resolution globally; isolate querying hosts.'
  },
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855': {
    ioc: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    ioc_type: 'HASH',
    reputation: 'SAFE',
    confidence: 100,
    threat_categories: ['Null File'],
    sightings_count: 99999,
    first_seen: '2000-01-01T00:00:00Z',
    last_seen: new Date().toISOString(),
    recommended_action: 'No action required.'
  },
  'employee_247': {
    ioc: 'employee_247',
    ioc_type: 'USER',
    reputation: 'SUSPICIOUS',
    confidence: 88,
    threat_categories: ['Compromised Credentials', 'Credential Stuffing Victim'],
    sightings_count: 17,
    first_seen: '2026-10-05T00:00:00Z',
    last_seen: new Date().toISOString(),
    recommended_action: 'Reset credentials and revoke active refresh tokens.'
  }
};

export function lookupThreatIntel(ioc: string): ThreatIntelResult {
  const cleanIoc = ioc.trim().toLowerCase();
  for (const [key, value] of Object.entries(mockThreatDatabase)) {
    if (key.toLowerCase() === cleanIoc || cleanIoc.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Generate dynamic contextual analysis for arbitrary queries
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(cleanIoc);
  const isDomain = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanIoc);
  const isHash = /^[a-fA-F0-9]{32,64}$/.test(cleanIoc);

  return {
    ioc,
    ioc_type: isIp ? 'IP' : isDomain ? 'DOMAIN' : isHash ? 'HASH' : 'USER',
    reputation: cleanIoc.includes('mal') || cleanIoc.includes('evil') || cleanIoc.includes('bad') ? 'MALICIOUS' : 'SUSPICIOUS',
    confidence: 86,
    threat_categories: ['Unclassified Threat Actor Probing', 'Heuristic Telemetry Anomaly'],
    geo: {
      country: 'Unknown / Distributed ASN',
      city: 'Anonymous Cloud Infrastructure',
      asn: 'AS-DYNAMIC',
      org: 'Global Transit Provider'
    },
    passive_dns: [`dns-${cleanIoc.replace(/[^a-zA-Z0-9]/g, '-')}.threatgrid.net`],
    sightings_count: 42,
    first_seen: '2026-09-12T14:22:00Z',
    last_seen: new Date().toISOString(),
    recommended_action: 'Conduct deep packet inspection and correlate with firewall ingress logs.'
  };
}
