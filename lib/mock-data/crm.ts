export interface CRMContact {
  id: string;
  name: string;
  email: string;
  company: string;
  stage: string;
  value: number;
}

export const crmContacts: CRMContact[] = [
  {
    id: "crm-001",
    name: "Elena Rodriguez",
    email: "elena@acmecorp.com",
    company: "Acme Corp",
    stage: "Negotiation",
    value: 12000,
  },
  {
    id: "crm-002",
    name: "David Park",
    email: "david@novatech.io",
    company: "NovaTech",
    stage: "Proposal Sent",
    value: 8200,
  },
  {
    id: "crm-003",
    name: "Lisa Thompson",
    email: "lisa@brightwave.co",
    company: "BrightWave",
    stage: "Discovery",
    value: 5500,
  },
  {
    id: "crm-004",
    name: "Raj Mehta",
    email: "raj@cloudnine.dev",
    company: "CloudNine",
    stage: "Closed Won",
    value: 24000,
  },
  {
    id: "crm-005",
    name: "Sophie Laurent",
    email: "sophie@zenith.fr",
    company: "Zenith Digital",
    stage: "Qualification",
    value: 15000,
  },
];
