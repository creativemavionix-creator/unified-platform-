// Static mock data for the AI Presentation Builder dashboard.
// Backend integration is not wired up yet — everything here simulates
// realistic API responses so the UI has real-feeling content to render.

export type Presentation = {
  id: string;
  title: string;
  cover: string;
  slideCount: number;
  updatedAt: string;
  owner: string;
  favorite: boolean;
  status: 'draft' | 'in-review' | 'published';
};

export const RECENT_PRESENTATIONS: Presentation[] = [
  { id: 'p1', title: 'Series A Investor Deck', cover: '/images/blog1.png', slideCount: 18, updatedAt: '2 hours ago', owner: 'You', favorite: true, status: 'in-review' },
  { id: 'p2', title: 'Q3 Product Launch', cover: '/images/blog2.png', slideCount: 24, updatedAt: 'Yesterday', owner: 'You', favorite: false, status: 'draft' },
  { id: 'p3', title: 'Annual Report 2026', cover: '/images/blog3.png', slideCount: 32, updatedAt: '3 days ago', owner: 'Aditi Rao', favorite: true, status: 'published' },
  { id: 'p4', title: 'Sales Enablement Kit', cover: '/images/blog4.jpg', slideCount: 15, updatedAt: '5 days ago', owner: 'You', favorite: false, status: 'published' },
  { id: 'p5', title: 'Onboarding Training Deck', cover: '/images/blog5.jpg', slideCount: 21, updatedAt: '1 week ago', owner: 'Rohan Mehta', favorite: false, status: 'draft' },
  { id: 'p6', title: 'Marketing Strategy 2026', cover: '/images/blog6.jpg', slideCount: 12, updatedAt: '2 weeks ago', owner: 'You', favorite: true, status: 'in-review' },
];

export const QUICK_TEMPLATES = [
  { id: 't1', label: 'Pitch Deck', prompt: 'A crisp investor pitch deck covering problem, solution, market, and ask.' },
  { id: 't2', label: 'Product Launch', prompt: 'Announce a new product with a bold cover, features, and roadmap.' },
  { id: 't3', label: 'Sales Deck', prompt: 'A persuasive sales presentation with case studies and pricing.' },
  { id: 't4', label: 'Annual Report', prompt: 'A corporate annual report with financials and highlights.' },
  { id: 't5', label: 'Training Deck', prompt: 'An educational deck for onboarding new team members.' },
  { id: 't6', label: 'Project Proposal', prompt: 'A proposal outlining scope, timeline, and budget.' },
];

export const FEATURED_THEMES = [
  { id: 'th1', name: 'Aurora', thumb: '/images/blog7.jpg', popular: true },
  { id: 'th2', name: 'Slate Pro', thumb: '/images/blog8.jpg', popular: true },
  { id: 'th3', name: 'Sunrise', thumb: '/images/blog9.jpg', popular: false },
  { id: 'th4', name: 'Minimal Ink', thumb: '/images/blog10.jpg', popular: true },
  { id: 'th5', name: 'Gradient Pop', thumb: '/images/blog1.png', popular: false },
  { id: 'th6', name: 'Corporate Blue', thumb: '/images/blog2.png', popular: false },
];

export const AI_SUGGESTIONS = [
  'Pitch deck for an AI tutoring startup targeting high school parents',
  'Product launch presentation for a new developer API platform',
  'Quarterly business review with goals, metrics, and next bets',
  'Sales enablement deck covering problem, solution, proof, and pricing',
];

export const TEMPLATE_LIBRARY = [
  { id: 'tl1', name: 'Startup Pitch Deck', category: 'Business Pitch Decks', slides: 16, thumb: '/images/blog3.png' },
  { id: 'tl2', name: 'Investor Update', category: 'Investor Decks', slides: 14, thumb: '/images/blog4.jpg' },
  { id: 'tl3', name: 'Sales Playbook', category: 'Sales Presentations', slides: 20, thumb: '/images/blog5.jpg' },
  { id: 'tl4', name: 'Go-To-Market Plan', category: 'Marketing Presentations', slides: 18, thumb: '/images/blog6.jpg' },
  { id: 'tl5', name: 'Product Launch Reveal', category: 'Product Launch', slides: 22, thumb: '/images/blog7.jpg' },
  { id: 'tl6', name: 'University Lecture', category: 'Educational Presentations', slides: 26, thumb: '/images/blog8.jpg' },
  { id: 'tl7', name: 'Corporate Quarterly', category: 'Corporate Reports', slides: 19, thumb: '/images/blog9.jpg' },
  { id: 'tl8', name: 'Annual Shareholder Report', category: 'Annual Reports', slides: 30, thumb: '/images/blog10.jpg' },
  { id: 'tl9', name: 'Client Project Proposal', category: 'Project Proposals', slides: 12, thumb: '/images/blog1.png' },
  { id: 'tl10', name: 'New Hire Training', category: 'Training Materials', slides: 17, thumb: '/images/blog2.png' },
  { id: 'tl11', name: 'Research Findings', category: 'Research Presentations', slides: 15, thumb: '/images/blog3.png' },
  { id: 'tl12', name: 'Startup Fundraise Deck', category: 'Startup Presentations', slides: 16, thumb: '/images/blog4.jpg' },
];

export type SlideLayer = { id: string; type: 'text' | 'image' | 'chart' | 'shape'; label: string };

export type Slide = {
  id: string;
  title: string;
  layout: string;
  thumb: string;
  notes: string;
  layers: SlideLayer[];
  bullets?: string[];
  subtitle?: string;
  body?: string;
};

export const ACTIVE_DECK_SLIDES: Slide[] = [
  {
    id: 's1',
    title: 'Cover — Series A Investor Deck',
    layout: 'Title',
    thumb: '/images/blog5.jpg',
    subtitle: 'One clear thesis for the room',
    body: 'Open with the outcome you want investors to believe by the end of this deck.',
    bullets: [
      'Introduce the category and why now in one sentence.',
      'State the product wedge and who feels the pain first.',
      'Preview the ask so the narrative has a destination.',
    ],
    notes: 'Open with the one-line pitch, pause for questions.',
    layers: [{ id: 'l1', type: 'text', label: 'Title' }, { id: 'l2', type: 'image', label: 'Background' }],
  },
  {
    id: 's2',
    title: 'The Problem',
    layout: 'Text + Image',
    thumb: '/images/blog6.jpg',
    subtitle: 'Why status quo is failing',
    body: 'Make the pain concrete with who is hurt, how often, and what it costs.',
    bullets: [
      'Name the customer segment that feels this friction daily.',
      'Quantify cost of inaction across time, money, or trust.',
      'Show why existing tools and workflows fall short.',
    ],
    notes: 'Lead with the customer pain point, cite the survey stat.',
    layers: [{ id: 'l3', type: 'text', label: 'Body' }, { id: 'l4', type: 'image', label: 'Illustration' }],
  },
  {
    id: 's3',
    title: 'Our Solution',
    layout: 'Two Column',
    thumb: '/images/blog7.jpg',
    subtitle: 'A practical approach, not a pitch slogan',
    body: 'Explain the product motion in plain language before diving into features.',
    bullets: [
      'Describe the approach in language a non-expert can repeat.',
      'Call out the differentiator that competitors cannot copy easily.',
      'Share early proof that the approach works in the wild.',
    ],
    notes: 'Demo the product screenshot live if time allows.',
    layers: [{ id: 'l5', type: 'text', label: 'Body' }, { id: 'l6', type: 'shape', label: 'Divider' }],
  },
  {
    id: 's4',
    title: 'Market Size',
    layout: 'Chart',
    thumb: '/images/blog8.jpg',
    subtitle: 'Bottoms-up opportunity',
    body: 'Anchor TAM/SAM/SOM in a believable bottoms-up count, not vanity tops-down math.',
    bullets: [
      'Start with reachable customers you can sell this year.',
      'Show expansion paths that unlock SAM over time.',
      'Connect market math to your go-to-market motion.',
    ],
    notes: 'TAM/SAM/SOM — emphasize the bottoms-up number.',
    layers: [{ id: 'l7', type: 'chart', label: 'TAM/SAM/SOM' }],
  },
  {
    id: 's5',
    title: 'Traction',
    layout: 'Chart',
    thumb: '/images/blog9.jpg',
    subtitle: 'Evidence the wedge is working',
    body: 'Lead with the metric that proves retention and expansion, not vanity signups.',
    bullets: [
      'Highlight MoM growth and the driver behind it.',
      'Call out quality signals: retention, NPS, or expansion.',
      'Name the risk you have already de-risked.',
    ],
    notes: 'Highlight the MoM growth curve.',
    layers: [{ id: 'l8', type: 'chart', label: 'Growth chart' }],
  },
  {
    id: 's6',
    title: 'Business Model',
    layout: 'Text + Table',
    thumb: '/images/blog10.jpg',
    subtitle: 'How value turns into revenue',
    body: 'Walk pricing as a system: who pays, what they buy, and how margins improve.',
    bullets: [
      'Explain packaging and who buys each tier.',
      'Show unit economics that improve with scale.',
      'Tie pricing to the outcomes customers care about.',
    ],
    notes: 'Walk through pricing tiers briefly.',
    layers: [{ id: 'l9', type: 'text', label: 'Body' }],
  },
  {
    id: 's7',
    title: 'The Ask',
    layout: 'Title',
    thumb: '/images/blog1.png',
    subtitle: 'Clear next step for this room',
    body: 'Close with the raise amount, use of funds, and the decision you need today.',
    bullets: [
      'State the raise and runway it unlocks.',
      'Map funds to hiring, product, and GTM milestones.',
      'Leave a single, concrete ask for follow-up.',
    ],
    notes: 'Close with the raise amount and use of funds.',
    layers: [{ id: 'l10', type: 'text', label: 'Title' }],
  },
];

export const ASSET_LIBRARY = {
  images: Array.from({ length: 8 }).map((_, i) => ({ id: `img${i}`, url: [
    "/images/blog1.png","/images/blog2.png","/images/blog3.png","/images/blog4.jpg","/images/blog5.jpg","/images/blog6.jpg","/images/blog7.jpg","/images/blog8.jpg"
  ][i] })),
  icons: ['Rocket', 'TrendingUp', 'Target', 'Users', 'PieChart', 'Globe', 'Shield', 'Zap'],
  charts: ['Bar', 'Line', 'Pie', 'Donut', 'Funnel', 'Area'],
  brandAssets: [
    { id: 'b1', name: 'MaVionix Logo (Light)', type: 'Logo' },
    { id: 'b2', name: 'MaVionix Logo (Dark)', type: 'Logo' },
    { id: 'b3', name: 'Brand Guideline PDF', type: 'Document' },
  ],
};

export const BRAND_KIT = {
  colors: [
    { name: 'Royal Purple', hex: '#6d28d9' },
    { name: 'Electric Magenta', hex: '#C800FF' },
    { name: 'Ink Slate', hex: '#0f172a' },
    { name: 'Cloud', hex: '#f8fafc' },
  ],
  fonts: [
    { role: 'Heading', family: 'Space Grotesk' },
    { role: 'Body', family: 'Inter' },
  ],
  logos: ['mavionix-logo.png', 'mavionix-robo-face.png'],
  templates: ['Startup Pitch Deck', 'Corporate Quarterly'],
};

export const COMMENTS = [
  { id: 'c1', author: 'Aditi Rao', avatarColor: '#C800FF', slide: 'Market Size', text: 'Can we cite the source for the TAM number?', time: '10m ago' },
  { id: 'c2', author: 'Rohan Mehta', avatarColor: '#7C3AED', slide: 'The Ask', text: 'Love this close — keep it exactly as is.', time: '1h ago' },
  { id: 'c3', author: 'You', avatarColor: '#6d28d9', slide: 'Traction', text: 'Swap this chart for the Q3 numbers before Friday.', time: '3h ago' },
];

export const COLLABORATORS = [
  { id: 'u1', name: 'Aditi Rao', role: 'Editor', online: true, color: '#C800FF' },
  { id: 'u2', name: 'Rohan Mehta', role: 'Commenter', online: true, color: '#7C3AED' },
  { id: 'u3', name: 'Priya Nair', role: 'Viewer', online: false, color: '#6d28d9' },
];

export const VERSION_HISTORY = [
  { id: 'v1', label: 'Auto-save', author: 'You', time: 'Just now' },
  { id: 'v2', label: 'Added traction slide', author: 'Aditi Rao', time: '2 hours ago' },
  { id: 'v3', label: 'Applied Aurora theme', author: 'You', time: 'Yesterday' },
  { id: 'v4', label: 'Initial AI generation', author: 'You', time: '3 days ago' },
];

export const EXPORT_HISTORY = [
  { id: 'e1', name: 'Series A Investor Deck', format: 'PPTX', time: '2 hours ago', size: '4.2 MB' },
  { id: 'e2', name: 'Annual Report 2026', format: 'PDF', time: 'Yesterday', size: '8.7 MB' },
  { id: 'e3', name: 'Sales Enablement Kit', format: 'PNG (all slides)', time: '5 days ago', size: '12.1 MB' },
];

export const ANALYTICS = {
  totals: {
    totalPresentations: 48,
    totalSlidesGenerated: 972,
    totalExports: 136,
    activeCollaborators: 9,
  },
  usageByWeek: [12, 18, 14, 22, 26, 19, 30],
  templatesUsed: [
    { name: 'Startup Pitch Deck', count: 14 },
    { name: 'Sales Playbook', count: 11 },
    { name: 'Corporate Quarterly', count: 8 },
    { name: 'Investor Update', count: 7 },
  ],
};

export const NOTIFICATIONS = [
  { id: 'n1', text: 'Aditi Rao commented on "Series A Investor Deck".', time: '10m ago', unread: true },
  { id: 'n2', text: 'Your "Annual Report 2026" finished exporting to PDF.', time: '1h ago', unread: true },
  { id: 'n3', text: 'AI generated 12 new slides for "Q3 Product Launch".', time: '3h ago', unread: false },
  { id: 'n4', text: 'Rohan Mehta shared "Sales Enablement Kit" with you.', time: '1d ago', unread: false },
];

export const RECENT_ACTIVITY = [
  { id: 'a1', text: 'You generated an outline from "meeting-notes.docx".', time: '20m ago' },
  { id: 'a2', text: 'Aditi Rao edited slide "Market Size".', time: '1h ago' },
  { id: 'a3', text: 'You exported "Sales Enablement Kit" to PPTX.', time: '5h ago' },
  { id: 'a4', text: 'Priya Nair viewed "Annual Report 2026".', time: '1d ago' },
];
