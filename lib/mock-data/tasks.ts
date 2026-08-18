export interface Task {
  id: string;
  title: string;
  description: string;
  suite: "dev" | "creative" | "business" | "automation";
  assignee: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
}

export const tasks: Task[] = [
  {
    id: "task-001",
    title: "Implement checkout flow",
    description: "Build the multi-step checkout with Stripe integration and order confirmation.",
    suite: "dev",
    assignee: "Marcus Rivera",
    status: "in-progress",
    priority: "high",
    dueDate: "2024-01-20",
  },
  {
    id: "task-002",
    title: "Design app icon variations",
    description: "Create 5 icon variations for the mobile app in both light and dark themes.",
    suite: "creative",
    assignee: "Aisha Patel",
    status: "todo",
    priority: "medium",
    dueDate: "2024-01-18",
  },
  {
    id: "task-003",
    title: "Update CRM contact fields",
    description: "Add custom fields for lead source tracking and lifecycle stage.",
    suite: "business",
    assignee: "Jordan Kim",
    status: "done",
    priority: "low",
    dueDate: "2024-01-12",
  },
  {
    id: "task-004",
    title: "Configure email trigger workflow",
    description: "Set up automated welcome email sequence for new signups.",
    suite: "automation",
    assignee: "Sarah Chen",
    status: "in-progress",
    priority: "high",
    dueDate: "2024-01-17",
  },
  {
    id: "task-005",
    title: "Write API documentation",
    description: "Document all REST endpoints with request/response examples using OpenAPI.",
    suite: "dev",
    assignee: "Marcus Rivera",
    status: "todo",
    priority: "medium",
    dueDate: "2024-01-22",
  },
  {
    id: "task-006",
    title: "Create social media templates",
    description: "Design reusable Figma templates for weekly social media posts.",
    suite: "creative",
    assignee: "Aisha Patel",
    status: "in-progress",
    priority: "medium",
    dueDate: "2024-01-19",
  },
  {
    id: "task-007",
    title: "Quarterly revenue report",
    description: "Compile Q4 revenue data and prepare executive summary presentation.",
    suite: "business",
    assignee: "Jordan Kim",
    status: "todo",
    priority: "high",
    dueDate: "2024-01-25",
  },
  {
    id: "task-008",
    title: "Set up Slack notification bot",
    description: "Create automation to post daily standup summaries to the #team channel.",
    suite: "automation",
    assignee: "Sarah Chen",
    status: "done",
    priority: "low",
    dueDate: "2024-01-10",
  },
  {
    id: "task-009",
    title: "Performance audit",
    description: "Run Lighthouse audits and fix critical performance issues on landing page.",
    suite: "dev",
    assignee: "Marcus Rivera",
    status: "todo",
    priority: "high",
    dueDate: "2024-01-21",
  },
];
