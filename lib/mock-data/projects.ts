export interface Project {
  id: string;
  name: string;
  suite: "dev" | "creative" | "business" | "automation";
  type: string;
  status: "active" | "completed" | "draft";
  lastUpdated: string;
  description: string;
}

export const projects: Project[] = [
  {
    id: "proj-001",
    name: "E-Commerce Platform",
    suite: "dev",
    type: "Website Build",
    status: "active",
    lastUpdated: "2024-01-15T10:30:00Z",
    description: "Full-stack e-commerce platform with payment integration and inventory management.",
  },
  {
    id: "proj-002",
    name: "Brand Identity Refresh",
    suite: "creative",
    type: "Logo Design",
    status: "active",
    lastUpdated: "2024-01-14T08:45:00Z",
    description: "Complete brand identity overhaul including logo, color palette, and typography.",
  },
  {
    id: "proj-003",
    name: "Sales Pipeline Automation",
    suite: "business",
    type: "CRM Pipeline",
    status: "active",
    lastUpdated: "2024-01-13T16:20:00Z",
    description: "Automated lead scoring and pipeline management for the sales team.",
  },
  {
    id: "proj-004",
    name: "Invoice Processing Bot",
    suite: "automation",
    type: "Workflow",
    status: "completed",
    lastUpdated: "2024-01-12T14:00:00Z",
    description: "Automated invoice extraction, validation, and accounting system sync.",
  },
  {
    id: "proj-005",
    name: "Mobile App Redesign",
    suite: "dev",
    type: "Mobile App",
    status: "draft",
    lastUpdated: "2024-01-11T09:15:00Z",
    description: "React Native mobile app redesign with improved UX and performance.",
  },
  {
    id: "proj-006",
    name: "Product Launch Video",
    suite: "creative",
    type: "Video Production",
    status: "completed",
    lastUpdated: "2024-01-10T11:30:00Z",
    description: "60-second animated explainer video for the new SaaS product launch.",
  },
  {
    id: "proj-007",
    name: "Customer Onboarding Flow",
    suite: "business",
    type: "Process Design",
    status: "active",
    lastUpdated: "2024-01-09T13:45:00Z",
    description: "Streamlined onboarding process reducing time-to-value for new customers.",
  },
  {
    id: "proj-008",
    name: "Data Sync Pipeline",
    suite: "automation",
    type: "Workflow",
    status: "active",
    lastUpdated: "2024-01-08T17:00:00Z",
    description: "Real-time data synchronization between CRM, ERP, and analytics platforms.",
  },
  {
    id: "proj-009",
    name: "API Gateway Service",
    suite: "dev",
    type: "Backend Service",
    status: "active",
    lastUpdated: "2024-01-07T10:00:00Z",
    description: "Centralized API gateway with rate limiting, auth, and request routing.",
  },
  {
    id: "proj-010",
    name: "Social Media Kit",
    suite: "creative",
    type: "Design System",
    status: "draft",
    lastUpdated: "2024-01-06T15:30:00Z",
    description: "Templated social media assets for Instagram, LinkedIn, and Twitter campaigns.",
  },
];
