export interface Lead {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  industry: string;
  location: string;
  source: string;
  website: string;
  status: 'new' | 'contacted' | 'qualified' | 'nurturing' | 'proposal' | 'won' | 'lost';
  priority: 'high' | 'medium' | 'low';
  score: number;
  buyingIntent: number;
  engagementScore: number;
  conversionProbability: number;
  fitScore: number;
  tags: string[];
  assignedTo: string;
  createdAt: string;
  lastActivity: string;
  aiSummary: string;
  nextAction: string;
  avatarColor: string;
}

export interface ActivityItem {
  id: string;
  leadId: string;
  type: 'email' | 'call' | 'whatsapp' | 'note' | 'ai-action' | 'meeting';
  title: string;
  detail: string;
  time: string;
  aiGenerated?: boolean;
}

export interface AIRecommendation {
  id: string;
  leadName: string;
  leadId: string;
  message: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused';
  leadsProcessed: number;
  category: string;
}

const NAMES = [
  'Ananya Sharma', 'Rohan Mehta', 'Priya Nair', 'Arjun Kapoor', 'Sneha Iyer',
  'Vikram Singh', 'Kavya Reddy', 'Aditya Rao', 'Ishita Gupta', 'Karan Malhotra',
  'Neha Verma', 'Siddharth Joshi', 'Meera Pillai', 'Rahul Chawla', 'Divya Menon',
  'Aman Bhatia', 'Tanya Kohli', 'Nikhil Desai', 'Pooja Agarwal', 'Varun Chopra',
];
const COMPANIES = [
  'Orbital Systems', 'Northwind Retail', 'Bluepeak Logistics', 'Vertex Health',
  'Cascade Finance', 'Solaris Energy', 'Ironclad Manufacturing', 'Nimbus Cloud',
  'Harborview Realty', 'Crescent Media', 'Aster Biotech', 'Lumen Analytics',
];
const INDUSTRIES = ['SaaS', 'Retail', 'Logistics', 'Healthcare', 'Finance', 'Manufacturing', 'Real Estate', 'Media', 'Biotech'];
const SOURCES = ['Website Form', 'LinkedIn Outreach', 'Referral', 'Webinar', 'Cold Email Campaign', 'Paid Ads', 'Trade Show'];
const LOCATIONS = ['Mumbai, IN', 'Bengaluru, IN', 'Delhi, IN', 'Pune, IN', 'Hyderabad, IN', 'Chennai, IN', 'Austin, US', 'London, UK'];
const AVATAR_COLORS = ['#7C3AED', '#0EA5E9', '#F59E0B', '#10B981', '#EF4444', '#EC4899', '#6366F1'];
const OWNERS = ['AI SDR Agent', 'Rhea Kapoor', 'Dev Anand', 'Unassigned'];
const STATUSES: Lead['status'][] = ['new', 'contacted', 'qualified', 'nurturing', 'proposal', 'won', 'lost'];

const SUMMARIES = [
  'Actively comparing vendors this quarter; opened pricing page twice and downloaded the ROI calculator.',
  'Engaged with three outreach emails but has not replied yet; strong fit based on company size and industry.',
  'Attended the product webinar and asked a question about integrations — high buying intent signal.',
  'Cold so far, single form fill with no follow-up engagement; needs a nurture sequence.',
  'Requested a demo through the website; AI has proposed three time slots awaiting confirmation.',
  'Previously lost deal from last year, re-engaged after a funding announcement — worth re-approaching.',
  'Referral from an existing customer; AI has already sent a personalized intro email.',
];
const NEXT_ACTIONS = [
  'Send AI-drafted follow-up email', 'Schedule discovery call', 'Wait for reply (2 days)',
  'Escalate to sales rep', 'Send case study relevant to industry', 'Re-engage with new offer',
  'Confirm demo time slot', 'Add to nurture sequence',
];
const TAGS_POOL = ['Enterprise', 'High Intent', 'Budget Confirmed', 'Decision Maker', 'Re-engaged', 'Referral', 'Newsletter Subscriber', 'Trial User'];

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

export const LEADS: Lead[] = Array.from({ length: 24 }).map((_, i) => {
  const score = 40 + ((i * 17) % 60);
  const priority: Lead['priority'] = score > 75 ? 'high' : score > 55 ? 'medium' : 'low';
  return {
    id: `lead-${i + 1}`,
    name: pick(NAMES, i),
    company: pick(COMPANIES, i),
    title: pick(['VP of Operations', 'Head of Marketing', 'Founder', 'IT Director', 'Procurement Lead', 'CEO', 'Growth Manager'], i),
    email: `${pick(NAMES, i).toLowerCase().replace(' ', '.')}@${pick(COMPANIES, i).toLowerCase().replace(/\s/g, '')}.com`,
    phone: `+91 98${String(10000000 + i * 137).slice(0, 8)}`,
    industry: pick(INDUSTRIES, i),
    location: pick(LOCATIONS, i),
    source: pick(SOURCES, i),
    website: `www.${pick(COMPANIES, i).toLowerCase().replace(/\s/g, '')}.com`,
    status: pick(STATUSES, i),
    priority,
    score,
    buyingIntent: 30 + ((i * 23) % 70),
    engagementScore: 20 + ((i * 19) % 75),
    conversionProbability: 10 + ((i * 13) % 85),
    fitScore: 40 + ((i * 11) % 55),
    tags: [pick(TAGS_POOL, i), pick(TAGS_POOL, i + 3)],
    assignedTo: pick(OWNERS, i),
    createdAt: `2026-0${(i % 6) + 1}-${String((i % 27) + 1).padStart(2, '0')}`,
    lastActivity: ['2 hours ago', '5 hours ago', 'Yesterday', '2 days ago', '4 days ago', '1 week ago'][i % 6],
    aiSummary: pick(SUMMARIES, i),
    nextAction: pick(NEXT_ACTIONS, i),
    avatarColor: pick(AVATAR_COLORS, i),
  };
});

export const ACTIVITIES: ActivityItem[] = [
  { id: 'a1', leadId: 'lead-1', type: 'ai-action', title: 'AI qualified this lead', detail: 'Scored 82/100 based on company size, industry fit, and engagement signals.', time: '10 min ago', aiGenerated: true },
  { id: 'a2', leadId: 'lead-1', type: 'email', title: 'Outreach email sent', detail: 'Personalized intro referencing their recent product launch.', time: '2 hours ago', aiGenerated: true },
  { id: 'a3', leadId: 'lead-2', type: 'whatsapp', title: 'WhatsApp message sent', detail: 'Follow-up with case study link after webinar attendance.', time: '3 hours ago', aiGenerated: true },
  { id: 'a4', leadId: 'lead-3', type: 'call', title: 'Discovery call logged', detail: 'Rhea spoke with the lead for 18 minutes; budget confirmed for Q3.', time: '5 hours ago' },
  { id: 'a5', leadId: 'lead-4', type: 'note', title: 'Note added', detail: 'Prefers async communication; avoid cold calls.', time: 'Yesterday' },
  { id: 'a6', leadId: 'lead-2', type: 'meeting', title: 'Demo scheduled', detail: 'Meeting booked for Thursday, 4:00 PM IST.', time: 'Yesterday', aiGenerated: true },
  { id: 'a7', leadId: 'lead-5', type: 'ai-action', title: 'AI flagged for escalation', detail: 'No response after 3 touches — recommended human follow-up.', time: '2 days ago', aiGenerated: true },
];

export const AI_RECOMMENDATIONS: AIRecommendation[] = [
  { id: 'r1', leadName: 'Ananya Sharma', leadId: 'lead-1', message: 'High buying intent detected — pricing page visited twice this week.', action: 'Send pricing follow-up', priority: 'high' },
  { id: 'r2', leadName: 'Rohan Mehta', leadId: 'lead-2', message: 'No reply after 3 outreach attempts — consider a different channel.', action: 'Try WhatsApp outreach', priority: 'medium' },
  { id: 'r3', leadName: 'Sneha Iyer', leadId: 'lead-5', message: 'Lead has gone cold for 9 days despite high fit score.', action: 'Re-engage with new offer', priority: 'high' },
  { id: 'r4', leadName: 'Vikram Singh', leadId: 'lead-6', message: 'Company recently raised funding — good timing to re-approach.', action: 'Send re-engagement email', priority: 'medium' },
  { id: 'r5', leadName: 'Kavya Reddy', leadId: 'lead-7', message: 'Demo requested but time slot not yet confirmed by lead.', action: 'Send reminder', priority: 'low' },
];

export const WORKFLOWS: WorkflowItem[] = [
  { id: 'w1', name: 'New Lead Auto-Qualification', description: 'Scores and qualifies every new lead within 5 minutes of capture.', trigger: 'Lead created', action: 'Score + qualify + tag', status: 'active', leadsProcessed: 312, category: 'Qualification' },
  { id: 'w2', name: 'Cold Lead Re-engagement', description: 'Re-engages leads with no activity for 7+ days using a fresh angle.', trigger: 'No activity 7 days', action: 'Send re-engagement email', status: 'active', leadsProcessed: 148, category: 'Nurturing' },
  { id: 'w3', name: 'High-Intent Escalation', description: 'Notifies the assigned rep when a lead shows strong buying signals.', trigger: 'Buying intent > 75', action: 'Notify rep + prioritize', status: 'active', leadsProcessed: 96, category: 'Routing' },
  { id: 'w4', name: 'Round-Robin Assignment', description: 'Distributes qualified leads evenly across the sales team.', trigger: 'Lead qualified', action: 'Assign to next rep', status: 'active', leadsProcessed: 204, category: 'Assignment' },
  { id: 'w5', name: 'Demo No-Show Follow-up', description: 'Automatically reschedules when a lead misses a booked demo.', trigger: 'Meeting missed', action: 'Send reschedule link', status: 'paused', leadsProcessed: 27, category: 'Follow-up' },
  { id: 'w6', name: 'Duplicate Detection', description: 'Flags and merges duplicate lead records from multiple sources.', trigger: 'Lead created', action: 'Check + merge duplicates', status: 'active', leadsProcessed: 61, category: 'Data Quality' },
];

export const NOTIFICATIONS = [
  { id: 'n1', text: 'AI qualified 5 new leads from this morning\u2019s campaign', time: '20m ago', unread: true },
  { id: 'n2', text: 'High-priority lead Ananya Sharma requires your approval to proceed', time: '1h ago', unread: true },
  { id: 'n3', text: 'Weekly conversion report is ready', time: '1d ago', unread: false },
];

export const FUNNEL = [
  { stage: 'New', count: 420 },
  { stage: 'Contacted', count: 318 },
  { stage: 'Qualified', count: 214 },
  { stage: 'Nurturing', count: 142 },
  { stage: 'Proposal', count: 68 },
  { stage: 'Won', count: 39 },
];

export const LEAD_SOURCES = [
  { name: 'Website Form', count: 168, pct: 28 },
  { name: 'LinkedIn Outreach', count: 132, pct: 22 },
  { name: 'Cold Email Campaign', count: 96, pct: 16 },
  { name: 'Referral', count: 84, pct: 14 },
  { name: 'Webinar', count: 66, pct: 11 },
  { name: 'Paid Ads', count: 54, pct: 9 },
];

export const MONTHLY_GROWTH = [
  { month: 'Feb', leads: 210, conversions: 18 },
  { month: 'Mar', leads: 268, conversions: 24 },
  { month: 'Apr', leads: 302, conversions: 29 },
  { month: 'May', leads: 356, conversions: 34 },
  { month: 'Jun', leads: 398, conversions: 41 },
  { month: 'Jul', leads: 420, conversions: 47 },
];

export const AI_PERFORMANCE = {
  leadsProcessedAutonomously: 1284,
  emailsDrafted: 892,
  callScriptsGenerated: 214,
  avgResponseTime: '4 min',
  followUpSuccessRate: 68,
  humanApprovalsNeeded: 41,
};

export const DASHBOARD_STATS = {
  totalLeads: 1420,
  qualifiedLeads: 612,
  highPriorityLeads: 87,
  todaysAiActivities: 143,
  conversionRate: 9.8,
  avgResponseTime: '4 min',
};

export const TODAYS_AI_ACTIVITIES = [
  { id: 't1', text: 'Qualified 12 new leads from LinkedIn outreach', time: '08:14 AM' },
  { id: 't2', text: 'Drafted 9 personalized follow-up emails', time: '09:02 AM' },
  { id: 't3', text: 'Scheduled 3 discovery calls', time: '10:47 AM' },
  { id: 't4', text: 'Flagged 2 leads for human escalation', time: '11:20 AM' },
  { id: 't5', text: 'Sent 6 WhatsApp nurture messages', time: '12:05 PM' },
];

export const UPCOMING_FOLLOWUPS = [
  { id: 'f1', leadName: 'Kavya Reddy', company: 'Ironclad Manufacturing', type: 'Demo Call', time: 'Today, 4:00 PM' },
  { id: 'f2', leadName: 'Aditya Rao', company: 'Nimbus Cloud', type: 'Follow-up Email', time: 'Today, 6:00 PM' },
  { id: 'f3', leadName: 'Ishita Gupta', company: 'Harborview Realty', type: 'Discovery Call', time: 'Tomorrow, 11:00 AM' },
  { id: 'f4', leadName: 'Karan Malhotra', company: 'Crescent Media', type: 'Proposal Review', time: 'Tomorrow, 2:30 PM' },
];

export const CALL_SCRIPTS = [
  { id: 'cs1', title: 'Discovery Call Opener', preview: 'Hi {{name}}, thanks for taking the time today. I wanted to learn a bit more about how your team currently handles...' },
  { id: 'cs2', title: 'Objection Handling — Budget', preview: 'I understand budget is a concern. Many of our customers started on a smaller plan and scaled as they saw results...' },
  { id: 'cs3', title: 'Demo Follow-up', preview: 'Following up on our demo yesterday — wanted to check if you had any questions from the team...' },
];
