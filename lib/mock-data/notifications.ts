export interface Notification {
  id: string;
  title: string;
  description: string;
  type: "info" | "warning" | "success" | "error";
  suite: "dev" | "creative" | "business" | "automation" | "system";
  timestamp: string;
  read: boolean;
}

export const notifications: Notification[] = [
  {
    id: "notif-001",
    title: "Deployment Successful",
    description: "E-Commerce Platform deployed to production successfully.",
    type: "success",
    suite: "dev",
    timestamp: "2024-01-15T10:30:00Z",
    read: false,
  },
  {
    id: "notif-002",
    title: "Design Review Pending",
    description: "Brand Identity Refresh assets are awaiting client approval.",
    type: "info",
    suite: "creative",
    timestamp: "2024-01-15T09:15:00Z",
    read: false,
  },
  {
    id: "notif-003",
    title: "Pipeline Stage Alert",
    description: "3 deals have been stuck in negotiation for over 14 days.",
    type: "warning",
    suite: "business",
    timestamp: "2024-01-14T16:45:00Z",
    read: true,
  },
  {
    id: "notif-004",
    title: "Workflow Failure",
    description: "Invoice Processing Bot encountered a parsing error on batch #847.",
    type: "error",
    suite: "automation",
    timestamp: "2024-01-14T14:20:00Z",
    read: false,
  },
  {
    id: "notif-005",
    title: "New Team Member Joined",
    description: "Sarah Chen has accepted the invitation and joined the workspace.",
    type: "info",
    suite: "system",
    timestamp: "2024-01-14T11:00:00Z",
    read: true,
  },
  {
    id: "notif-006",
    title: "Token Usage Warning",
    description: "You have used 85% of your monthly AI token allocation.",
    type: "warning",
    suite: "system",
    timestamp: "2024-01-13T18:30:00Z",
    read: false,
  },
  {
    id: "notif-007",
    title: "Build Failed",
    description: "API Gateway Service build failed due to type errors in auth module.",
    type: "error",
    suite: "dev",
    timestamp: "2024-01-13T15:10:00Z",
    read: true,
  },
  {
    id: "notif-008",
    title: "Automation Completed",
    description: "Data Sync Pipeline processed 12,400 records successfully.",
    type: "success",
    suite: "automation",
    timestamp: "2024-01-13T12:00:00Z",
    read: true,
  },
  {
    id: "notif-009",
    title: "Invoice Payment Received",
    description: "Client Acme Corp paid invoice #INV-2024-003 ($4,500).",
    type: "success",
    suite: "business",
    timestamp: "2024-01-12T09:30:00Z",
    read: true,
  },
];
