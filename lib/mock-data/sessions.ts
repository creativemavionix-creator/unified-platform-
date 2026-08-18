export interface Session {
  id: string;
  device: string;
  ip: string;
  lastActive: string;
}

export interface ApiKey {
  id: string;
  name: string;
  token: string;
  scope: string;
  revealed: boolean;
}

export const sessions: Session[] = [
  {
    id: "sess-001",
    device: "Chrome on macOS",
    ip: "192.168.1.42",
    lastActive: "2024-01-15T10:30:00Z",
  },
  {
    id: "sess-002",
    device: "Safari on iPhone",
    ip: "10.0.0.15",
    lastActive: "2024-01-14T22:10:00Z",
  },
  {
    id: "sess-003",
    device: "Firefox on Windows",
    ip: "172.16.0.88",
    lastActive: "2024-01-13T08:45:00Z",
  },
];

export const apiKeys: ApiKey[] = [
  {
    id: "key-001",
    name: "Production API",
    token: "mvx_prod_****************************a3f9",
    scope: "read:write",
    revealed: false,
  },
  {
    id: "key-002",
    name: "CI/CD Pipeline",
    token: "mvx_ci_******************************7b2e",
    scope: "read",
    revealed: false,
  },
];
