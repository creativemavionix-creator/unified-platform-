export interface SiteProject {
  id: string;
  name: string;
  domain: string;
  status: 'live' | 'draft' | 'building';
  template: string;
  pages: number;
  lastEdited: string;
  thumbnailColor: string;
  visitors30d: number;
}

export interface SitePage {
  id: string;
  name: string;
  slug: string;
  status: 'published' | 'draft';
  seoScore: number;
  lastEdited: string;
  isHome?: boolean;
}

export interface SectionBlock {
  id: string;
  name: string;
  category: string;
  uses: number;
  accent: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'svg' | 'document';
  size: string;
  folder: string;
  used: boolean;
  addedAt: string;
}

export interface AiActivity {
  id: string;
  action: string;
  detail: string;
  time: string;
}

export interface FormSubmission {
  id: string;
  name: string;
  email: string;
  page: string;
  time: string;
}

export interface AnalyticsPoint {
  label: string;
  visitors: number;
}

export interface BrandColor {
  id: string;
  label: string;
  hex: string;
}

export const SITES: SiteProject[] = [
  { id: 's1', name: 'Northline Studio', domain: 'northlinestudio.com', status: 'live', template: 'Agency Pro', pages: 8, lastEdited: '12 minutes ago', thumbnailColor: '#7C3AED', visitors30d: 18420 },
  { id: 's2', name: 'Verdant Cafe', domain: 'verdantcafe.co', status: 'live', template: 'Restaurant', pages: 6, lastEdited: '2 hours ago', thumbnailColor: '#059669', visitors30d: 9310 },
  { id: 's3', name: 'Pulse Fitness', domain: 'pulsefitness-app.dev', status: 'building', template: 'Fitness', pages: 5, lastEdited: 'Yesterday', thumbnailColor: '#EA580C', visitors30d: 2140 },
  { id: 's4', name: 'Anchor Legal', domain: 'anchorlegal.io', status: 'draft', template: 'Law Firm', pages: 4, lastEdited: '3 days ago', thumbnailColor: '#0EA5E9', visitors30d: 0 },
];

export const WORKSPACE_STATS = {
  activeSites: SITES.filter((s) => s.status === 'live').length,
  totalPages: SITES.reduce((sum, s) => sum + s.pages, 0),
  storageUsedGb: 6.4,
  storageLimitGb: 20,
  bandwidthUsedGb: 84,
  bandwidthLimitGb: 250,
  aiActionsToday: 37,
};

export const PAGES: SitePage[] = [
  { id: 'p1', name: 'Home', slug: '/', status: 'published', seoScore: 92, lastEdited: '12 minutes ago', isHome: true },
  { id: 'p2', name: 'About', slug: '/about', status: 'published', seoScore: 88, lastEdited: '1 hour ago' },
  { id: 'p3', name: 'Services', slug: '/services', status: 'published', seoScore: 81, lastEdited: '1 day ago' },
  { id: 'p4', name: 'Pricing', slug: '/pricing', status: 'draft', seoScore: 64, lastEdited: '2 days ago' },
  { id: 'p5', name: 'Blog', slug: '/blog', status: 'published', seoScore: 90, lastEdited: '3 days ago' },
  { id: 'p6', name: 'Contact', slug: '/contact', status: 'published', seoScore: 95, lastEdited: '4 days ago' },
];

export const SECTION_LIBRARY: SectionBlock[] = [
  { id: 'c1', name: 'Split Hero with Video', category: 'Hero', uses: 214, accent: '#7C3AED' },
  { id: 'c2', name: 'Gradient CTA Banner', category: 'CTA', uses: 178, accent: '#EA580C' },
  { id: 'c3', name: 'Pricing Table — 3 Tier', category: 'Pricing', uses: 156, accent: '#059669' },
  { id: 'c4', name: 'Logo Carousel', category: 'Social Proof', uses: 132, accent: '#0EA5E9' },
  { id: 'c5', name: 'Testimonial Grid', category: 'Testimonials', uses: 121, accent: '#DB2777' },
  { id: 'c6', name: 'FAQ Accordion', category: 'FAQ', uses: 109, accent: '#7C3AED' },
  { id: 'c7', name: 'Team Card Grid', category: 'Team', uses: 96, accent: '#059669' },
  { id: 'c8', name: 'Product Card Grid', category: 'E-commerce', uses: 88, accent: '#EA580C' },
  { id: 'c9', name: 'Footer — Mega Links', category: 'Footer', uses: 201, accent: '#0EA5E9' },
];

export const MEDIA_ASSETS: MediaAsset[] = [
  { id: 'm1', name: 'hero-banner.jpg', type: 'image', size: '1.2 MB', folder: 'Home', used: true, addedAt: '2 days ago' },
  { id: 'm2', name: 'team-photo.jpg', type: 'image', size: '860 KB', folder: 'About', used: true, addedAt: '5 days ago' },
  { id: 'm3', name: 'brand-logo.svg', type: 'svg', size: '14 KB', folder: 'Brand', used: true, addedAt: '2 weeks ago' },
  { id: 'm4', name: 'product-demo.mp4', type: 'video', size: '18.4 MB', folder: 'Home', used: true, addedAt: '1 week ago' },
  { id: 'm5', name: 'pricing-onepager.pdf', type: 'document', size: '640 KB', folder: 'Documents', used: false, addedAt: '3 weeks ago' },
  { id: 'm6', name: 'icon-check.svg', type: 'svg', size: '2 KB', folder: 'Icons', used: true, addedAt: '3 weeks ago' },
  { id: 'm7', name: 'texture-noise.png', type: 'image', size: '410 KB', folder: 'Assets', used: false, addedAt: '1 month ago' },
];

export const AI_ACTIVITIES: AiActivity[] = [
  { id: 'a1', action: 'Generated pricing section', detail: 'Created a 3-tier pricing table for Pulse Fitness', time: '10 min ago' },
  { id: 'a2', action: 'Rewrote hero headline', detail: 'Sharpened copy for Northline Studio homepage', time: '38 min ago' },
  { id: 'a3', action: 'Optimized SEO metadata', detail: 'Auto-filled title and description for /services', time: '1 hour ago' },
  { id: 'a4', action: 'Generated alt text', detail: 'Tagged 12 images across Verdant Cafe gallery', time: 'Today, 9:02 AM' },
  { id: 'a5', action: 'Suggested color palette', detail: 'Proposed a warm neutral palette for Anchor Legal', time: 'Yesterday' },
];

export const FORM_SUBMISSIONS: FormSubmission[] = [
  { id: 'f1', name: 'Priya Sharma', email: 'priya@brightlane.co', page: 'Contact — Northline Studio', time: '18 min ago' },
  { id: 'f2', name: 'Marcus Webb', email: 'marcus.webb@gmail.com', page: 'Reservations — Verdant Cafe', time: '2 hours ago' },
  { id: 'f3', name: 'Elena Cho', email: 'elena@choconsulting.com', page: 'Newsletter — Northline Studio', time: '5 hours ago' },
  { id: 'f4', name: 'Tom Reddy', email: 'tom.r@outlook.com', page: 'Trial Signup — Pulse Fitness', time: 'Yesterday' },
];

export const TRAFFIC_SERIES: AnalyticsPoint[] = [
  { label: 'Mon', visitors: 820 },
  { label: 'Tue', visitors: 960 },
  { label: 'Wed', visitors: 890 },
  { label: 'Thu', visitors: 1120 },
  { label: 'Fri', visitors: 1340 },
  { label: 'Sat', visitors: 980 },
  { label: 'Sun', visitors: 860 },
];

export const TRAFFIC_SOURCES = [
  { label: 'Organic Search', value: 44, color: '#7C3AED' },
  { label: 'Direct', value: 28, color: '#0EA5E9' },
  { label: 'Social', value: 18, color: '#EA580C' },
  { label: 'Referral', value: 10, color: '#059669' },
];

export const BRAND_COLORS: BrandColor[] = [
  { id: 'b1', label: 'Primary', hex: '#7C3AED' },
  { id: 'b2', label: 'Secondary', hex: '#C800FF' },
  { id: 'b3', label: 'Accent', hex: '#F59E0B' },
  { id: 'b4', label: 'Background', hex: '#0B0B14' },
  { id: 'b5', label: 'Surface', hex: '#F8FAFC' },
];

export const NOTIFICATIONS = [
  { id: 'n1', text: 'Northline Studio published to production', time: '12 min ago', unread: true },
  { id: 'n2', text: 'SSL certificate renewed for verdantcafe.co', time: '1 hour ago', unread: true },
  { id: 'n3', text: 'Bandwidth usage crossed 30% for this cycle', time: 'Yesterday', unread: false },
];

// ---------- Editor / Canvas ----------
export interface LayerNode {
  id: string;
  name: string;
  type: string;
  children?: LayerNode[];
}

export const DOM_TREE: LayerNode[] = [
  {
    id: 'l1', name: 'Navbar', type: 'section',
    children: [
      { id: 'l1a', name: 'Logo', type: 'element' },
      { id: 'l1b', name: 'Nav Links', type: 'element' },
      { id: 'l1c', name: 'CTA Button', type: 'element' },
    ],
  },
  {
    id: 'l2', name: 'Hero Section', type: 'section',
    children: [
      { id: 'l2a', name: 'Headline', type: 'text' },
      { id: 'l2b', name: 'Subheading', type: 'text' },
      { id: 'l2c', name: 'Hero Image', type: 'image' },
      { id: 'l2d', name: 'Button Group', type: 'element' },
    ],
  },
  {
    id: 'l3', name: 'Features Grid', type: 'section',
    children: [
      { id: 'l3a', name: 'Feature Card 1', type: 'card' },
      { id: 'l3b', name: 'Feature Card 2', type: 'card' },
      { id: 'l3c', name: 'Feature Card 3', type: 'card' },
    ],
  },
  { id: 'l4', name: 'Testimonials', type: 'section' },
  { id: 'l5', name: 'Pricing Table', type: 'section' },
  { id: 'l6', name: 'Footer', type: 'section' },
];

export const EDITOR_COMPONENT_PALETTE = [
  { id: 'ep1', name: 'Navbar', category: 'Layout' },
  { id: 'ep2', name: 'Hero', category: 'Layout' },
  { id: 'ep3', name: 'Container', category: 'Layout' },
  { id: 'ep4', name: 'Columns', category: 'Layout' },
  { id: 'ep5', name: 'Heading', category: 'Basic' },
  { id: 'ep6', name: 'Paragraph', category: 'Basic' },
  { id: 'ep7', name: 'Button', category: 'Basic' },
  { id: 'ep8', name: 'Image', category: 'Media' },
  { id: 'ep9', name: 'Video', category: 'Media' },
  { id: 'ep10', name: 'Icon', category: 'Media' },
  { id: 'ep11', name: 'Form', category: 'Forms' },
  { id: 'ep12', name: 'Input Field', category: 'Forms' },
  { id: 'ep13', name: 'Pricing Card', category: 'Advanced' },
  { id: 'ep14', name: 'Testimonial', category: 'Advanced' },
  { id: 'ep15', name: 'FAQ Item', category: 'Advanced' },
  { id: 'ep16', name: 'Footer', category: 'Layout' },
];

export const HISTORY_STACK = [
  { id: 'h1', label: 'Edited hero headline', time: '2 min ago' },
  { id: 'h2', label: 'Moved Features Grid up', time: '4 min ago' },
  { id: 'h3', label: 'Changed CTA button color', time: '9 min ago' },
  { id: 'h4', label: 'Added Testimonials section', time: '14 min ago' },
  { id: 'h5', label: 'Uploaded hero-banner.jpg', time: '22 min ago' },
];

export const CODE_VIEW_SNIPPET = `<section class="hero">
  <h1>Build stunning sites, faster.</h1>
  <p>AI-assisted design meets pixel-perfect control.</p>
  <div class="cta-group">
    <a class="btn-primary" href="/signup">Start Free</a>
    <a class="btn-ghost" href="/demo">Watch Demo</a>
  </div>
</section>`;

// ---------- Style & Theme ----------
export const TYPOGRAPHY_SCALE = [
  { tag: 'H1', size: '48px', weight: '900', lineHeight: '1.1' },
  { tag: 'H2', size: '36px', weight: '800', lineHeight: '1.15' },
  { tag: 'H3', size: '28px', weight: '800', lineHeight: '1.2' },
  { tag: 'H4', size: '22px', weight: '700', lineHeight: '1.25' },
  { tag: 'H5', size: '18px', weight: '700', lineHeight: '1.3' },
  { tag: 'H6', size: '15px', weight: '700', lineHeight: '1.35' },
  { tag: 'Paragraph', size: '16px', weight: '400', lineHeight: '1.6' },
];

export const SPACING_SCALE = [
  { token: 'xs', value: '4px' },
  { token: 'sm', value: '8px' },
  { token: 'md', value: '16px' },
  { token: 'lg', value: '24px' },
  { token: 'xl', value: '40px' },
  { token: '2xl', value: '64px' },
];

export const RADIUS_SCALE = [
  { token: 'sm', value: '6px' },
  { token: 'md', value: '12px' },
  { token: 'lg', value: '20px' },
  { token: 'full', value: '9999px' },
];

export const BUTTON_STYLES = ['Primary', 'Secondary', 'Outline', 'Ghost'];

export const BRAND_LOGOS = [
  { id: 'lg1', label: 'Primary Logo', kind: 'SVG · Light background' },
  { id: 'lg2', label: 'Secondary Logo', kind: 'SVG · Dark background' },
  { id: 'lg3', label: 'Icon Mark', kind: 'PNG · Favicon source' },
];

export const BRAND_FONTS = [
  { id: 'bf1', label: 'Display', name: 'Clash Display', weight: '700–900' },
  { id: 'bf2', label: 'Body', name: 'Inter', weight: '400–600' },
];

export const BRAND_ASSETS = [
  { id: 'ba1', name: 'Pattern — Dot Grid', type: 'Pattern' },
  { id: 'ba2', name: 'Illustration — Onboarding', type: 'Illustration' },
  { id: 'ba3', name: 'Texture — Grain Overlay', type: 'Texture' },
];

// ---------- AI Tools ----------
export const AI_TOOLS = [
  { id: 't1', name: 'Prompt-to-Website', description: 'Generate a full multi-page site from a single description.', icon: 'Sparkles' },
  { id: 't2', name: 'Section Generator', description: 'Generate a specific section like a pricing table or hero.', icon: 'LayoutTemplate' },
  { id: 't3', name: 'AI Copywriter', description: 'Rewrite, expand, or shorten any block of on-page copy.', icon: 'PenLine' },
  { id: 't4', name: 'Color Palette Generator', description: 'Generate a cohesive palette from a mood or brand word.', icon: 'Palette' },
  { id: 't5', name: 'SEO Optimizer', description: 'Auto-generate titles, meta descriptions, and keywords.', icon: 'Search' },
  { id: 't6', name: 'Alt-Text Generator', description: 'Tag every image in your library with descriptive alt text.', icon: 'ImagePlus' },
  { id: 't7', name: 'Layout Suggestions', description: 'Get AI recommendations for section order and structure.', icon: 'Wand2' },
];

// ---------- Analytics ----------
export const ANALYTICS_SUMMARY = {
  pageViews: 48210,
  uniqueVisitors: 31940,
  bounceRate: 38.2,
  avgSessionDuration: '2m 41s',
  loadSpeedScore: 94,
  conversions: 312,
};

export const PUBLISH_HISTORY = [
  { id: 'v1', version: 'v1.8', site: 'Northline Studio', time: '12 min ago', status: 'live' },
  { id: 'v2', version: 'v1.7', site: 'Northline Studio', time: '2 days ago', status: 'archived' },
  { id: 'v3', version: 'v1.6', site: 'Northline Studio', time: '5 days ago', status: 'archived' },
  { id: 'v4', version: 'v1.5', site: 'Northline Studio', time: '1 week ago', status: 'archived' },
];

export const DOMAIN_STATUS = [
  { id: 'd1', domain: 'northlinestudio.com', ssl: 'active', env: 'production' },
  { id: 'd2', domain: 'staging.northlinestudio.com', ssl: 'active', env: 'staging' },
  { id: 'd3', domain: 'verdantcafe.co', ssl: 'active', env: 'production' },
  { id: 'd4', domain: 'pulsefitness-app.dev', ssl: 'pending', env: 'staging' },
];

export const LANGUAGES = ['English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Hindi', 'Portuguese'];
