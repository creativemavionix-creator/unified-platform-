export interface Agent {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  rating: number;
  price: string;
  featured: boolean;
  tags: string[];
}

export const agents: Agent[] = [
  {
    id: "agent-001",
    title: "CodePilot",
    category: "Development",
    icon: "🤖",
    description: "AI pair programmer that suggests code, fixes bugs, and writes tests across multiple languages.",
    rating: 4.8,
    price: "Free",
    featured: true,
    tags: ["code-generation", "debugging", "testing"],
  },
  {
    id: "agent-002",
    title: "DesignMuse",
    category: "Creative",
    icon: "🎨",
    description: "Generates design concepts, color palettes, and layout suggestions based on your brand guidelines.",
    rating: 4.6,
    price: "$9/mo",
    featured: true,
    tags: ["design", "branding", "ui-ux"],
  },
  {
    id: "agent-003",
    title: "DealFlow",
    category: "Business",
    icon: "📊",
    description: "Analyzes sales pipelines, scores leads, and provides actionable insights to close deals faster.",
    rating: 4.5,
    price: "$19/mo",
    featured: false,
    tags: ["sales", "crm", "analytics"],
  },
  {
    id: "agent-004",
    title: "AutoScribe",
    category: "Automation",
    icon: "⚡",
    description: "Builds and optimizes automation workflows from natural language descriptions.",
    rating: 4.7,
    price: "Free",
    featured: true,
    tags: ["workflow", "no-code", "integration"],
  },
  {
    id: "agent-005",
    title: "ContentForge",
    category: "Creative",
    icon: "✍️",
    description: "AI copywriter that generates blog posts, social captions, and email campaigns in your brand voice.",
    rating: 4.4,
    price: "$12/mo",
    featured: false,
    tags: ["copywriting", "content", "marketing"],
  },
];
