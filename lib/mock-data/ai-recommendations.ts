export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  suite: "dev" | "creative" | "business" | "automation";
  confidence: number;
}

export const aiRecommendations: AIRecommendation[] = [
  {
    id: "rec-001",
    title: "Optimize Bundle Size",
    description: "Your e-commerce build has 3 unused dependencies adding 120KB to the bundle. Removing them could improve load time by 0.8s.",
    actionLabel: "View Dependencies",
    actionHref: "/dev?action=optimize-bundle",
    suite: "dev",
    confidence: 92,
  },
  {
    id: "rec-002",
    title: "A/B Test Hero Banner",
    description: "Based on engagement data, a shorter headline with a CTA button above the fold could increase conversions by 15%.",
    actionLabel: "Create Variant",
    actionHref: "/creative?action=ab-test",
    suite: "creative",
    confidence: 78,
  },
  {
    id: "rec-003",
    title: "Follow Up Stale Leads",
    description: "5 leads in the negotiation stage haven't been contacted in 10+ days. Re-engagement now has a 3x higher close rate.",
    actionLabel: "View Leads",
    actionHref: "/business?action=stale-leads",
    suite: "business",
    confidence: 85,
  },
  {
    id: "rec-004",
    title: "Schedule Off-Peak Syncs",
    description: "Moving the Data Sync Pipeline to run at 2 AM could reduce API rate limit errors by 60%.",
    actionLabel: "Reschedule",
    actionHref: "/automation?action=reschedule-sync",
    suite: "automation",
    confidence: 88,
  },
  {
    id: "rec-005",
    title: "Add Error Boundary",
    description: "The checkout flow lacks error boundaries. Adding them would prevent full-page crashes from payment API failures.",
    actionLabel: "Implement Fix",
    actionHref: "/dev?action=error-boundary",
    suite: "dev",
    confidence: 95,
  },
];
