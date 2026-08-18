export interface WeeklyToken {
  day: string;
  tokens: number;
}

export interface WorkspaceOverview {
  orgName: string;
  planTier: string;
  seatsUsed: number;
  seatsTotal: number;
  tokensUsed: number;
  tokensLimit: number;
  activeProjects: number;
}

export const weeklyTokens: WeeklyToken[] = [
  { day: "Mon", tokens: 12400 },
  { day: "Tue", tokens: 18200 },
  { day: "Wed", tokens: 15800 },
  { day: "Thu", tokens: 22100 },
  { day: "Fri", tokens: 19500 },
  { day: "Sat", tokens: 8300 },
  { day: "Sun", tokens: 5200 },
];

export const workspaceOverview: WorkspaceOverview = {
  orgName: "MaVionix Labs",
  planTier: "Pro",
  seatsUsed: 4,
  seatsTotal: 5,
  tokensUsed: 425000,
  tokensLimit: 500000,
  activeProjects: 7,
};
