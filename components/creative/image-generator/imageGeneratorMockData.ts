// Mock data for the AI Image Generator module.
// No backend integration - this file simulates realistic API responses,
// user history, and library content for the workspace UI.

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  ratio: string;
  model: string;
  createdAt: string;
  favorite: boolean;
  collection?: string;
  width: number;
  height: number;
}

export interface StyleItem {
  id: string;
  name: string;
  category: string;
  thumb: string;
  popular?: boolean;
}

export interface PromptHistoryItem {
  id: string;
  prompt: string;
  negativePrompt?: string;
  style: string;
  createdAt: string;
  favorite: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
  cover: string;
  imageCount: number;
  updatedAt: string;
}

// Reuse existing MaVionix public imagery as believable placeholders for generated art.
const SAMPLE_IMAGES = [
  '/mavionix-robo.png',
  '/mavionix-robo-face.png',
  '/services-robot.png',
  '/buildAI.png',
  '/mavionix-about-campus.png',
];

const pick = (i: number) => SAMPLE_IMAGES[i % SAMPLE_IMAGES.length];

export const STYLE_CATEGORIES = [
  'All',
  'Realistic',
  'Cinematic',
  'Anime',
  '3D',
  'Illustration',
  'Minimal',
  'Painterly',
  'Design & Branding',
];

export const STYLE_LIBRARY: StyleItem[] = [
  { id: 'realistic', name: 'Realistic', category: 'Realistic', thumb: pick(0), popular: true },
  { id: 'cinematic', name: 'Cinematic', category: 'Cinematic', thumb: pick(1), popular: true },
  { id: 'anime', name: 'Anime', category: 'Anime', thumb: pick(2), popular: true },
  { id: '3d-render', name: '3D Render', category: '3D', thumb: pick(3) },
  { id: 'illustration', name: 'Illustration', category: 'Illustration', thumb: pick(4) },
  { id: 'minimal', name: 'Minimal', category: 'Minimal', thumb: pick(0) },
  { id: 'watercolor', name: 'Watercolor', category: 'Painterly', thumb: pick(1) },
  { id: 'oil-painting', name: 'Oil Painting', category: 'Painterly', thumb: pick(2) },
  { id: 'sketch', name: 'Sketch', category: 'Illustration', thumb: pick(3) },
  { id: 'pixel-art', name: 'Pixel Art', category: '3D', thumb: pick(4) },
  { id: 'cyberpunk', name: 'Cyberpunk', category: 'Cinematic', thumb: pick(0), popular: true },
  { id: 'futuristic', name: 'Futuristic', category: 'Cinematic', thumb: pick(1) },
  { id: 'product-photo', name: 'Product Photography', category: 'Realistic', thumb: pick(2) },
  { id: 'fashion', name: 'Fashion', category: 'Realistic', thumb: pick(3) },
  { id: 'interior', name: 'Interior Design', category: 'Design & Branding', thumb: pick(4) },
  { id: 'architecture', name: 'Architecture', category: 'Design & Branding', thumb: pick(0) },
  { id: 'logo-design', name: 'Logo Design', category: 'Design & Branding', thumb: pick(1) },
  { id: 'branding', name: 'Branding', category: 'Design & Branding', thumb: pick(2) },
  { id: 'ui-mockup', name: 'UI/UX Mockup', category: 'Design & Branding', thumb: pick(3) },
  { id: 'poster', name: 'Marketing Poster', category: 'Design & Branding', thumb: pick(4) },
  { id: 'social', name: 'Social Media Graphic', category: 'Design & Branding', thumb: pick(0) },
];

export const QUICK_TEMPLATES: { id: string; label: string; prompt: string }[] = [
  { id: 't1', label: 'Product Hero Shot', prompt: 'A premium product photo on a clean studio background, soft shadows, 8k, commercial lighting' },
  { id: 't2', label: 'Startup Logo', prompt: 'A minimal geometric logo mark for a tech startup, flat vector, two-color palette' },
  { id: 't3', label: 'Social Media Post', prompt: 'A bold, colorful social media graphic announcing a product launch, modern typography' },
  { id: 't4', label: 'Fantasy Landscape', prompt: 'An epic cinematic fantasy landscape at golden hour, dramatic clouds, ultra detailed' },
  { id: 't5', label: 'Interior Concept', prompt: 'A modern minimalist living room interior, warm natural light, scandinavian furniture' },
  { id: 't6', label: 'Character Portrait', prompt: 'A stylized anime character portrait, dynamic lighting, detailed line art' },
];

export const AI_SUGGESTIONS: string[] = [
  'Add "volumetric lighting" for more cinematic depth',
  'Try the Cyberpunk style for a neon-lit mood',
  'Increase guidance scale to 9 for tighter prompt adherence',
  'Add a negative prompt to remove blurry or low-res results',
  'Use a 16:9 ratio for presentation-ready visuals',
];

export const MOCK_GALLERY: GeneratedImage[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `img-${i + 1}`,
  url: pick(i),
  prompt: [
    'Futuristic AI robot assistant in a bright office, cinematic lighting',
    'Minimal product photography of a wireless speaker on marble',
    'Cyberpunk cityscape at night with neon reflections',
    'Warm campus building illustration, soft afternoon light',
    'Abstract 3D render of glass and light, studio background',
  ][i % 5],
  style: STYLE_LIBRARY[i % STYLE_LIBRARY.length].name,
  ratio: ['1:1', '16:9', '4:5', '3:2'][i % 4],
  model: ['MaVionix Vision v2', 'MaVionix Vision v2 Turbo', 'MaVionix Photoreal v1'][i % 3],
  createdAt: `2026-0${(i % 6) + 1}-${String((i % 27) + 1).padStart(2, '0')}`,
  favorite: i % 5 === 0,
  collection: i % 3 === 0 ? 'Brand Campaign' : i % 3 === 1 ? 'Product Shots' : undefined,
  width: 1024,
  height: [1024, 576, 1280, 683][i % 4],
}));

export const PROMPT_HISTORY: PromptHistoryItem[] = [
  { id: 'p1', prompt: 'A sleek AI robot mascot for a SaaS brand, isometric, purple accent lighting', style: 'Cinematic', createdAt: '2 hours ago', favorite: true },
  { id: 'p2', prompt: 'Minimalist logo, letter "M", gradient purple to blue, flat vector', style: 'Logo Design', createdAt: 'Yesterday', favorite: false },
  { id: 'p3', prompt: 'Cyberpunk street market at night, neon signs, rain reflections', style: 'Cyberpunk', createdAt: '2 days ago', favorite: true },
  { id: 'p4', prompt: 'Cozy scandinavian living room, natural light, plants', style: 'Interior Design', createdAt: '3 days ago', favorite: false },
  { id: 'p5', prompt: 'Product shot of a smartwatch on a marble pedestal', style: 'Product Photography', createdAt: '5 days ago', favorite: false },
];

export const RECENT_PROJECTS: ProjectItem[] = [
  { id: 'proj1', name: 'Brand Campaign Q3', cover: pick(0), imageCount: 24, updatedAt: '2 hours ago' },
  { id: 'proj2', name: 'Product Launch Shots', cover: pick(1), imageCount: 12, updatedAt: 'Yesterday' },
  { id: 'proj3', name: 'Social Media Pack', cover: pick(2), imageCount: 36, updatedAt: '3 days ago' },
  { id: 'proj4', name: 'App Onboarding Art', cover: pick(3), imageCount: 8, updatedAt: '1 week ago' },
];

export const CREDIT_USAGE = {
  used: 640,
  total: 1000,
  renewsIn: '12 days',
};

export const STORAGE_USAGE = {
  usedGB: 4.2,
  totalGB: 20,
};

export const ANALYTICS = {
  monthly: [
    { month: 'Feb', generations: 210 },
    { month: 'Mar', generations: 340 },
    { month: 'Apr', generations: 280 },
    { month: 'May', generations: 410 },
    { month: 'Jun', generations: 460 },
    { month: 'Jul', generations: 512 },
  ],
  mostUsedStyles: [
    { name: 'Cinematic', count: 312 },
    { name: 'Realistic', count: 268 },
    { name: 'Product Photography', count: 190 },
    { name: 'Cyberpunk', count: 144 },
    { name: 'Logo Design', count: 98 },
  ],
  totals: {
    totalGenerations: 2213,
    totalDownloads: 1408,
    totalFavorites: 356,
    activeProjects: 9,
  },
};

export const NOTIFICATIONS = [
  { id: 'n1', text: 'Your batch of 8 images finished generating', time: '5m ago', unread: true },
  { id: 'n2', text: 'Upscaling complete for "Product Launch Shots"', time: '1h ago', unread: true },
  { id: 'n3', text: 'You earned 50 bonus credits this week', time: '1d ago', unread: false },
];

export const BRAND_KIT = {
  colors: ['#C800FF', '#7C3AED', '#4C1D95', '#0F172A', '#FFFFFF'],
  fonts: ['Inter', 'Poppins', 'Sora'],
  logos: [pick(0), pick(1)],
  assets: [pick(2), pick(3), pick(4)],
};

export const MODEL_OPTIONS = ['MaVionix Vision v2', 'MaVionix Vision v2 Turbo', 'MaVionix Photoreal v1', 'MaVionix Anime v1'];
export const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:5', '3:2', '2:3'];
