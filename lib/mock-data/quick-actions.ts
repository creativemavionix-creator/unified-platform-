export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  suite: "dev" | "creative" | "business" | "automation";
}

export const quickActions: QuickAction[] = [
  {
    id: "qa-001",
    label: "New Repository",
    description: "Create a new code repository with CI/CD templates.",
    icon: "GitBranch",
    href: "/dev?action=new-repo",
    suite: "dev",
  },
  {
    id: "qa-002",
    label: "Deploy Project",
    description: "Deploy the latest build to staging or production.",
    icon: "Rocket",
    href: "/dev?action=deploy",
    suite: "dev",
  },
  {
    id: "qa-003",
    label: "Create Design",
    description: "Start a new design project with AI-assisted templates.",
    icon: "Palette",
    href: "/creative?action=new-design",
    suite: "creative",
  },
  {
    id: "qa-004",
    label: "Generate Copy",
    description: "Use AI to generate marketing or product copy.",
    icon: "PenTool",
    href: "/creative?action=generate-copy",
    suite: "creative",
  },
  {
    id: "qa-005",
    label: "Add Contact",
    description: "Add a new lead or client to the CRM.",
    icon: "UserPlus",
    href: "/business?action=add-contact",
    suite: "business",
  },
  {
    id: "qa-006",
    label: "Create Invoice",
    description: "Generate and send a new invoice to a client.",
    icon: "Receipt",
    href: "/business?action=new-invoice",
    suite: "business",
  },
  {
    id: "qa-007",
    label: "New Workflow",
    description: "Build a new automation workflow from scratch or a template.",
    icon: "Workflow",
    href: "/automation?action=new-workflow",
    suite: "automation",
  },
  {
    id: "qa-008",
    label: "Schedule Task",
    description: "Set up a recurring automated task with triggers.",
    icon: "Clock",
    href: "/automation?action=schedule-task",
    suite: "automation",
  },
];
