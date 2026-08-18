/**
 * Client-side persistence for the AI Presentation Builder.
 * Keeps decks, brand kit, comments, assets, and activity in localStorage
 * so every tab can share real state without a full backend.
 */
import type { Slide } from '@/components/creative/presentation-builder/presentationMockData';
import { BRAND_KIT } from '@/components/creative/presentation-builder/presentationMockData';

const STORAGE_KEY = 'mvx_presentation_workspace_v1';

export type SavedDeck = {
  id: string;
  title: string;
  cover: string;
  slideCount: number;
  updatedAt: string;
  updatedAtMs: number;
  owner: string;
  favorite: boolean;
  status: 'draft' | 'in-review' | 'published';
  slides: Slide[];
  themeId?: string;
  templateName?: string;
};

export type BrandColor = { name: string; hex: string };
export type BrandFont = { role: string; family: string };

export type BrandKitState = {
  colors: BrandColor[];
  fonts: BrandFont[];
  logos: string[];
  templates: string[];
  accentHex: string;
  appliedThemeId?: string;
};

export type CommentItem = {
  id: string;
  author: string;
  avatarColor: string;
  slide: string;
  text: string;
  time: string;
  createdAtMs: number;
};

export type Collaborator = {
  id: string;
  name: string;
  role: string;
  online: boolean;
  color: string;
  email?: string;
};

export type ActivityItem = { id: string; text: string; time: string; createdAtMs: number };
export type ExportItem = { id: string; name: string; format: string; time: string; size: string; createdAtMs: number };
export type NotificationItem = { id: string; text: string; time: string; unread: boolean; createdAtMs: number };
export type UploadedAsset = { id: string; url: string; name: string; createdAtMs: number };

export type WorkspaceState = {
  decks: SavedDeck[];
  activeDeckId: string | null;
  brandKit: BrandKitState;
  comments: CommentItem[];
  collaborators: Collaborator[];
  activity: ActivityItem[];
  exports: ExportItem[];
  notifications: NotificationItem[];
  uploadedAssets: UploadedAsset[];
  sharePermission: string;
};

function nowLabel(ms = Date.now()): string {
  const d = new Date(ms);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function defaultState(): WorkspaceState {
  return {
    decks: [],
    activeDeckId: null,
    brandKit: {
      colors: [...BRAND_KIT.colors],
      fonts: [...BRAND_KIT.fonts],
      logos: [...BRAND_KIT.logos],
      templates: [...BRAND_KIT.templates],
      accentHex: '#C800FF',
    },
    comments: [],
    collaborators: [
      {
        id: 'u-you',
        name: 'You',
        role: 'Owner',
        online: true,
        color: '#C800FF',
        email: 'you@mavionix.app',
      },
    ],
    activity: [],
    exports: [],
    notifications: [],
    uploadedAssets: [],
    sharePermission: 'Editor',
  };
}

function readState(): WorkspaceState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      brandKit: { ...base.brandKit, ...(parsed.brandKit || {}) },
      decks: Array.isArray(parsed.decks)
        ? parsed.decks.filter((d) => Array.isArray(d.slides) && d.slides.length > 0)
        : [],
      comments: Array.isArray(parsed.comments) ? parsed.comments : base.comments,
      collaborators: Array.isArray(parsed.collaborators) ? parsed.collaborators : base.collaborators,
      activity: Array.isArray(parsed.activity) ? parsed.activity : [],
      exports: Array.isArray(parsed.exports) ? parsed.exports : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      uploadedAssets: Array.isArray(parsed.uploadedAssets) ? parsed.uploadedAssets : [],
    };
  } catch {
    return defaultState();
  }
}

function writeState(state: WorkspaceState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded — drop heavy uploads and retry once
    try {
      const slim = { ...state, uploadedAssets: state.uploadedAssets.slice(0, 5) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch {
      console.warn('Presentation workspace could not be persisted (storage full).');
      return;
    }
  }
  window.dispatchEvent(new CustomEvent('mvx-presentation-store'));
}

export function getWorkspaceState(): WorkspaceState {
  return readState();
}

export function subscribeWorkspace(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener('mvx-presentation-store', listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener('mvx-presentation-store', listener);
    window.removeEventListener('storage', onStorage);
  };
}

function pushActivity(state: WorkspaceState, text: string): void {
  const item: ActivityItem = { id: uid('a'), text, time: 'Just now', createdAtMs: Date.now() };
  state.activity = [item, ...state.activity].slice(0, 40);
}

function pushNotification(state: WorkspaceState, text: string): void {
  const item: NotificationItem = {
    id: uid('n'),
    text,
    time: 'Just now',
    unread: true,
    createdAtMs: Date.now(),
  };
  state.notifications = [item, ...state.notifications].slice(0, 30);
}

export function saveGeneratedDeck(slides: Slide[], meta?: { templateName?: string; themeId?: string }): SavedDeck {
  const state = readState();
  const title = slides[0]?.title?.replace(/^Cover\s*[—–-]\s*/i, '') || 'Untitled Presentation';
  const deck: SavedDeck = {
    id: uid('deck'),
    title,
    cover: slides[0]?.thumb || '/images/blog1.png',
    slideCount: slides.length,
    updatedAt: 'Just now',
    updatedAtMs: Date.now(),
    owner: 'You',
    favorite: false,
    status: 'draft',
    slides,
    themeId: meta?.themeId,
    templateName: meta?.templateName,
  };
  state.decks = [deck, ...state.decks.filter((d) => d.id !== deck.id)];
  // Prefer real decks first
  const real = state.decks.filter((d) => d.slides.length > 0);
  const seeds = state.decks.filter((d) => d.slides.length === 0);
  state.decks = [...real, ...seeds].slice(0, 40);
  state.activeDeckId = deck.id;
  pushActivity(state, `You generated “${title}” (${slides.length} slides).`);
  pushNotification(state, `AI finished generating “${title}”.`);
  writeState(state);
  return deck;
}

export function updateDeckSlides(deckId: string, slides: Slide[]): void {
  const state = readState();
  state.decks = state.decks.map((d) =>
    d.id === deckId
      ? {
          ...d,
          slides,
          slideCount: slides.length,
          cover: slides[0]?.thumb || d.cover,
          title: slides[0]?.title?.replace(/^Cover\s*[—–-]\s*/i, '') || d.title,
          updatedAt: 'Just now',
          updatedAtMs: Date.now(),
        }
      : d,
  );
  state.activeDeckId = deckId;
  writeState(state);
}

export function setActiveDeck(deckId: string | null): void {
  const state = readState();
  state.activeDeckId = deckId;
  writeState(state);
}

export function deleteDeck(deckId: string): void {
  const state = readState();
  const target = state.decks.find((d) => d.id === deckId);
  state.decks = state.decks.filter((d) => d.id !== deckId);
  if (state.activeDeckId === deckId) {
    state.activeDeckId = state.decks[0]?.id || null;
  }
  if (target) pushActivity(state, `You deleted “${target.title}”.`);
  writeState(state);
}

export function duplicateDeck(deckId: string): SavedDeck | null {
  const state = readState();
  const source = state.decks.find((d) => d.id === deckId);
  if (!source) return null;
  const copy: SavedDeck = {
    ...source,
    id: uid('deck'),
    title: `${source.title} (Copy)`,
    favorite: false,
    status: 'draft',
    updatedAt: 'Just now',
    updatedAtMs: Date.now(),
    slides: source.slides.map((s) => ({
      ...s,
      id: `${s.id}-copy-${Math.random().toString(36).slice(2, 6)}`,
      bullets: [...(s.bullets || [])],
      layers: (s.layers || []).map((l) => ({ ...l, id: `${l.id}-c` })),
    })),
  };
  state.decks = [copy, ...state.decks].slice(0, 40);
  state.activeDeckId = copy.id;
  pushActivity(state, `You duplicated “${source.title}”.`);
  writeState(state);
  return copy;
}

export function renameDeck(deckId: string, title: string): void {
  const state = readState();
  const next = title.trim();
  if (!next) return;
  state.decks = state.decks.map((d) =>
    d.id === deckId ? { ...d, title: next, updatedAt: 'Just now', updatedAtMs: Date.now() } : d,
  );
  writeState(state);
}

export function toggleFavorite(deckId: string): void {
  const state = readState();
  state.decks = state.decks.map((d) => (d.id === deckId ? { ...d, favorite: !d.favorite } : d));
  writeState(state);
}

export function setDeckStatus(deckId: string, status: SavedDeck['status']): void {
  const state = readState();
  state.decks = state.decks.map((d) => (d.id === deckId ? { ...d, status, updatedAt: 'Just now', updatedAtMs: Date.now() } : d));
  pushActivity(state, `You marked a deck as ${status}.`);
  writeState(state);
}

export function getActiveDeck(): SavedDeck | null {
  const state = readState();
  if (!state.activeDeckId) return null;
  return state.decks.find((d) => d.id === state.activeDeckId) || null;
}

export function addBrandColor(name: string, hex: string): void {
  const state = readState();
  state.brandKit.colors = [...state.brandKit.colors, { name, hex }];
  pushActivity(state, `You added brand color ${name}.`);
  writeState(state);
}

export function setAccentColor(hex: string, themeId?: string): void {
  const state = readState();
  state.brandKit.accentHex = hex;
  if (themeId) state.brandKit.appliedThemeId = themeId;
  pushActivity(state, `You applied brand accent ${hex}.`);
  writeState(state);
}

export function addComment(text: string, slideTitle: string): CommentItem {
  const state = readState();
  const item: CommentItem = {
    id: uid('c'),
    author: 'You',
    avatarColor: state.brandKit.accentHex || '#6d28d9',
    slide: slideTitle || 'Deck',
    text,
    time: 'Just now',
    createdAtMs: Date.now(),
  };
  state.comments = [item, ...state.comments];
  pushActivity(state, `You commented on “${item.slide}”.`);
  pushNotification(state, `New comment on “${item.slide}”.`);
  writeState(state);
  return item;
}

export function inviteCollaborator(email: string, role = 'Viewer'): Collaborator {
  const state = readState();
  const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Teammate';
  const person: Collaborator = {
    id: uid('u'),
    name,
    email,
    role,
    online: false,
    color: ['#C800FF', '#7C3AED', '#6d28d9', '#2563eb'][state.collaborators.length % 4],
  };
  state.collaborators = [...state.collaborators, person];
  pushActivity(state, `You invited ${email} as ${role}.`);
  pushNotification(state, `Invite sent to ${email}.`);
  writeState(state);
  return person;
}

export function updateCollaboratorRole(id: string, role: string): void {
  const state = readState();
  state.collaborators = state.collaborators.map((c) => (c.id === id ? { ...c, role } : c));
  writeState(state);
}

export function setSharePermission(permission: string): void {
  const state = readState();
  state.sharePermission = permission;
  writeState(state);
}

export function recordExport(name: string, format: string, size = '~'): void {
  const state = readState();
  const item: ExportItem = {
    id: uid('e'),
    name,
    format,
    time: nowLabel(),
    size,
    createdAtMs: Date.now(),
  };
  state.exports = [item, ...state.exports].slice(0, 40);
  pushActivity(state, `You exported “${name}” as ${format}.`);
  pushNotification(state, `Export ready: “${name}” (${format}).`);
  writeState(state);
}

export function addUploadedAsset(file: File): Promise<UploadedAsset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const state = readState();
      const asset: UploadedAsset = {
        id: uid('asset'),
        url: String(reader.result),
        name: file.name,
        createdAtMs: Date.now(),
      };
      state.uploadedAssets = [asset, ...state.uploadedAssets].slice(0, 60);
      pushActivity(state, `You uploaded asset “${file.name}”.`);
      writeState(state);
      resolve(asset);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function computeAnalytics(state: WorkspaceState = readState()) {
  const realDecks = state.decks.filter((d) => d.slides.length > 0);
  const totalSlides = realDecks.reduce((sum, d) => sum + d.slideCount, 0);
  const week = [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  for (const a of state.activity) {
    const d = new Date(a.createdAtMs);
    if (now.getTime() - d.getTime() > 7 * 86_400_000) continue;
    week[d.getDay()] += 1;
  }
  // reorder Sun..Sat → Mon..Sun
  const usageByWeek = [...week.slice(1), week[0]];

  const templateCounts = new Map<string, number>();
  for (const d of realDecks) {
    const name = d.templateName || 'Custom AI Deck';
    templateCounts.set(name, (templateCounts.get(name) || 0) + 1);
  }
  const templatesUsed = Array.from(templateCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  if (!templatesUsed.length) {
    templatesUsed.push({ name: 'No templates used yet', count: 0 });
  }

  return {
    totals: {
      totalPresentations: realDecks.length,
      totalSlidesGenerated: totalSlides,
      totalExports: state.exports.length,
      activeCollaborators: state.collaborators.length,
    },
    usageByWeek,
    templatesUsed,
  };
}

export function getShareUrl(deck?: SavedDeck | null): string {
  if (typeof window === 'undefined') return '/share/deck';
  const id = deck?.id;
  if (!id) return `${window.location.origin}/share/demo`;
  return `${window.location.origin}/share/${encodeURIComponent(id)}`;
}

/** Resolve a /share/[slug] param to a local deck (same-browser share). */
export function findDeckByShareSlug(slug: string): SavedDeck | null {
  const decoded = decodeURIComponent(slug || '').trim();
  if (!decoded || decoded === 'demo' || decoded === 'deck') return null;
  const state = readState();
  const exact = state.decks.find((d) => d.id === decoded);
  if (exact) return exact;
  // Legacy URLs ended with `-{last6}` of the deck id
  const suffix = decoded.includes('-') ? decoded.slice(decoded.lastIndexOf('-') + 1) : decoded.slice(-6);
  if (suffix.length >= 4) {
    return state.decks.find((d) => d.id.endsWith(suffix)) || null;
  }
  return null;
}

export function markNotificationsRead(): void {
  const state = readState();
  state.notifications = state.notifications.map((n) => ({ ...n, unread: false }));
  writeState(state);
}
