export interface Activity {
  id: string;
  title: string;
  description: string;
  type: "dev" | "creative" | "business" | "automation";
  timestamp: string;
  user: string;
}

export const activities: Activity[] = [
  {
    id: "act-001",
    title: "Deployed to Production",
    description: "E-Commerce Platform v2.1.0 deployed successfully.",
    type: "dev",
    timestamp: "2024-01-15T10:30:00Z",
    user: "Marcus Rivera",
  },
  {
    id: "act-002",
    title: "Logo Approved",
    description: "Client approved the final logo variation for Brand Identity Refresh.",
    type: "creative",
    timestamp: "2024-01-15T09:00:00Z",
    user: "Aisha Patel",
  },
  {
    id: "act-003",
    title: "Deal Closed",
    description: "Closed $12,000 deal with Acme Corp for annual subscription.",
    type: "business",
    timestamp: "2024-01-14T17:30:00Z",
    user: "Jordan Kim",
  },
  {
    id: "act-004",
    title: "Workflow Triggered",
    description: "Data Sync Pipeline processed 12,400 records from Salesforce.",
    type: "automation",
    timestamp: "2024-01-14T14:00:00Z",
    user: "Sarah Chen",
  },
  {
    id: "act-005",
    title: "Pull Request Merged",
    description: "Merged PR #142: Add rate limiting to API Gateway.",
    type: "dev",
    timestamp: "2024-01-14T11:20:00Z",
    user: "Marcus Rivera",
  },
  {
    id: "act-006",
    title: "Asset Uploaded",
    description: "Uploaded 24 social media templates to the shared library.",
    type: "creative",
    timestamp: "2024-01-13T16:45:00Z",
    user: "Aisha Patel",
  },
  {
    id: "act-007",
    title: "Invoice Sent",
    description: "Sent invoice #INV-2024-004 to client NovaTech ($8,200).",
    type: "business",
    timestamp: "2024-01-13T13:30:00Z",
    user: "Jordan Kim",
  },
  {
    id: "act-008",
    title: "Automation Created",
    description: "New Slack notification bot configured for daily standups.",
    type: "automation",
    timestamp: "2024-01-13T10:15:00Z",
    user: "Sarah Chen",
  },
  {
    id: "act-009",
    title: "Database Migration",
    description: "Successfully migrated user table schema to v3.",
    type: "dev",
    timestamp: "2024-01-12T15:00:00Z",
    user: "Marcus Rivera",
  },
];
