import React from "react";
import {
  Type,
  Square,
  Minus,
  Settings,
  AlignLeft,
  ChevronDown,
  CheckSquare,
  ToggleLeft,
  Circle,
  TrendingUp,
  Table,
  Tag,
  User,
  Activity,
  Layers,
  Columns,
  CreditCard,
  Layout,
  PanelLeft,
  ExternalLink,
  BookOpen
} from "lucide-react";

export type ComponentType =
  | "heading"
  | "label"
  | "button-primary"
  | "button-secondary"
  | "divider"
  | "icon"
  | "input-text"
  | "textarea"
  | "select"
  | "checkbox"
  | "toggle"
  | "radio"
  | "stat-card"
  | "data-table"
  | "badge"
  | "avatar"
  | "progress"
  | "card-container"
  | "two-column"
  | "navbar"
  | "sidebar"
  | "modal"
  | "tabs";

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  category: "Basic" | "Forms" | "Data Display" | "Layout";
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
  icon: React.ElementType;
  defaultProps: Record<string, any>;
}

export const COMPONENT_DEFINITIONS: Record<ComponentType, ComponentDefinition> = {
  heading: {
    type: "heading",
    label: "Heading",
    category: "Basic",
    defaultWidth: 200,
    defaultHeight: 40,
    minWidth: 80,
    minHeight: 20,
    icon: Type,
    defaultProps: { text: "Heading Text", size: "lg", color: "text-bone" }
  },
  label: {
    type: "label",
    label: "Text Label",
    category: "Basic",
    defaultWidth: 150,
    defaultHeight: 30,
    minWidth: 50,
    minHeight: 15,
    icon: AlignLeft,
    defaultProps: { text: "Label/Paragraph text goes here.", size: "sm", color: "text-muted-foreground" }
  },
  "button-primary": {
    type: "button-primary",
    label: "Primary Button",
    category: "Basic",
    defaultWidth: 140,
    defaultHeight: 40,
    minWidth: 80,
    minHeight: 30,
    icon: Square,
    defaultProps: { text: "Primary Button", accent: "#7C3AED" }
  },
  "button-secondary": {
    type: "button-secondary",
    label: "Secondary Button",
    category: "Basic",
    defaultWidth: 140,
    defaultHeight: 40,
    minWidth: 80,
    minHeight: 30,
    icon: Square,
    defaultProps: { text: "Secondary Button" }
  },
  divider: {
    type: "divider",
    label: "Divider",
    category: "Basic",
    defaultWidth: 300,
    defaultHeight: 10,
    minWidth: 50,
    minHeight: 2,
    icon: Minus,
    defaultProps: {}
  },
  icon: {
    type: "icon",
    label: "Icon",
    category: "Basic",
    defaultWidth: 40,
    defaultHeight: 40,
    minWidth: 20,
    minHeight: 20,
    icon: Settings,
    defaultProps: { iconName: "Settings", color: "#7C3AED" }
  },
  "input-text": {
    type: "input-text",
    label: "Text Input Form",
    category: "Forms",
    defaultWidth: 250,
    defaultHeight: 45,
    minWidth: 100,
    minHeight: 30,
    icon: Type,
    defaultProps: { placeholder: "Enter details...", labelText: "Label" }
  },
  textarea: {
    type: "textarea",
    label: "Textarea",
    category: "Forms",
    defaultWidth: 250,
    defaultHeight: 90,
    minWidth: 100,
    minHeight: 50,
    icon: AlignLeft,
    defaultProps: { placeholder: "Type multiline text...", labelText: "Message" }
  },
  select: {
    type: "select",
    label: "Select Dropdown",
    category: "Forms",
    defaultWidth: 200,
    defaultHeight: 45,
    minWidth: 80,
    minHeight: 30,
    icon: ChevronDown,
    defaultProps: { labelText: "Dropdown", placeholder: "Select option..." }
  },
  checkbox: {
    type: "checkbox",
    label: "Checkbox",
    category: "Forms",
    defaultWidth: 120,
    defaultHeight: 24,
    minWidth: 60,
    minHeight: 16,
    icon: CheckSquare,
    defaultProps: { text: "Accept terms", checked: true }
  },
  toggle: {
    type: "toggle",
    label: "Toggle Switch",
    category: "Forms",
    defaultWidth: 120,
    defaultHeight: 24,
    minWidth: 60,
    minHeight: 16,
    icon: ToggleLeft,
    defaultProps: { text: "Enable AI", active: true, accent: "#7C3AED" }
  },
  radio: {
    type: "radio",
    label: "Radio Group",
    category: "Forms",
    defaultWidth: 150,
    defaultHeight: 55,
    minWidth: 80,
    minHeight: 30,
    icon: Circle,
    defaultProps: { labelText: "Choose Option", options: ["Option A", "Option B"] }
  },
  "stat-card": {
    type: "stat-card",
    label: "Stat Card Grid",
    category: "Data Display",
    defaultWidth: 220,
    defaultHeight: 110,
    minWidth: 120,
    minHeight: 80,
    icon: TrendingUp,
    defaultProps: { title: "Total MRR", value: "$45,210", subtitle: "+12.4% this week", accent: "#7C3AED" }
  },
  "data-table": {
    type: "data-table",
    label: "Data Table",
    category: "Data Display",
    defaultWidth: 340,
    defaultHeight: 160,
    minWidth: 200,
    minHeight: 100,
    icon: Table,
    defaultProps: { headers: ["Name", "Status", "Date"], rows: [["User Alpha", "Active", "Jul 28"], ["User Beta", "Pending", "Jul 27"]] }
  },
  badge: {
    type: "badge",
    label: "Badge/Tag",
    category: "Data Display",
    defaultWidth: 80,
    defaultHeight: 28,
    minWidth: 40,
    minHeight: 15,
    icon: Tag,
    defaultProps: { text: "Active", accent: "#7C3AED" }
  },
  avatar: {
    type: "avatar",
    label: "Avatar",
    category: "Data Display",
    defaultWidth: 40,
    defaultHeight: 40,
    minWidth: 20,
    minHeight: 20,
    icon: User,
    defaultProps: { fallback: "JD", imageUrl: "" }
  },
  progress: {
    type: "progress",
    label: "Progress Bar",
    category: "Data Display",
    defaultWidth: 200,
    defaultHeight: 20,
    minWidth: 60,
    minHeight: 8,
    icon: Activity,
    defaultProps: { value: 72, accent: "#7C3AED" }
  },
  "card-container": {
    type: "card-container",
    label: "Card Container",
    category: "Layout",
    defaultWidth: 280,
    defaultHeight: 180,
    minWidth: 100,
    minHeight: 50,
    icon: CreditCard,
    defaultProps: { title: "Card Title" }
  },
  "two-column": {
    type: "two-column",
    label: "Two-Column Section",
    category: "Layout",
    defaultWidth: 360,
    defaultHeight: 150,
    minWidth: 150,
    minHeight: 60,
    icon: Columns,
    defaultProps: {}
  },
  navbar: {
    type: "navbar",
    label: "Navbar Block",
    category: "Layout",
    defaultWidth: 400,
    defaultHeight: 55,
    minWidth: 150,
    minHeight: 40,
    icon: Layout,
    defaultProps: { title: "Dashboard", items: ["Home", "Creative", "Settings"] }
  },
  sidebar: {
    type: "sidebar",
    label: "Sidebar Block",
    category: "Layout",
    defaultWidth: 180,
    defaultHeight: 400,
    minWidth: 60,
    minHeight: 150,
    icon: PanelLeft,
    defaultProps: { title: "Creative Workspace" }
  },
  modal: {
    type: "modal",
    label: "Modal Frame",
    category: "Layout",
    defaultWidth: 320,
    defaultHeight: 200,
    minWidth: 150,
    minHeight: 100,
    icon: ExternalLink,
    defaultProps: { title: "Confirm Action", bodyText: "Are you sure you want to deploy?" }
  },
  tabs: {
    type: "tabs",
    label: "Tab Group",
    category: "Layout",
    defaultWidth: 280,
    defaultHeight: 40,
    minWidth: 100,
    minHeight: 25,
    icon: BookOpen,
    defaultProps: { items: ["Details", "Activity", "Analytics"], activeIdx: 0 }
  }
};

export const CATEGORIES = ["Basic", "Forms", "Data Display", "Layout"] as const;

// Inline Visual Preview Thumbnails (Simplified Mock SVGs for the library sidebar)
export function renderThumbnail(type: ComponentType): React.ReactNode {
  switch (type) {
    case "heading":
      return (
        <svg viewBox="0 0 40 30" className="w-full h-8 text-muted-foreground/60 fill-current">
          <text x="5" y="20" fontSize="16" fontWeight="bold">H1</text>
          <rect x="5" y="24" width="30" height="2" />
        </svg>
      );
    case "label":
      return (
        <svg viewBox="0 0 40 30" className="w-full h-8 text-muted-foreground/60 fill-current">
          <rect x="5" y="8" width="30" height="3" rx="1.5" />
          <rect x="5" y="14" width="22" height="3" rx="1.5" />
          <rect x="5" y="20" width="15" height="3" rx="1.5" />
        </svg>
      );
    case "button-primary":
      return (
        <div className="w-full h-8 bg-pulse/20 border border-pulse/40 rounded flex items-center justify-center text-[9px] text-pulse font-bold uppercase tracking-wider">
          Btn
        </div>
      );
    case "button-secondary":
      return (
        <div className="w-full h-8 bg-muted/40 border border-border/60 rounded flex items-center justify-center text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
          Btn
        </div>
      );
    case "divider":
      return (
        <div className="w-full h-8 flex items-center justify-center px-4">
          <div className="w-full h-px bg-border/80" />
        </div>
      );
    case "icon":
      return (
        <div className="w-full h-8 flex items-center justify-center text-xs">
          ⚙️
        </div>
      );
    case "input-text":
      return (
        <div className="w-full h-8 px-2 flex flex-col justify-center gap-1 border border-border/40 bg-void/30 rounded">
          <div className="w-8 h-1 bg-muted-foreground/45 rounded-sm" />
          <div className="w-full h-3 border border-border/50 rounded bg-void/50" />
        </div>
      );
    case "textarea":
      return (
        <div className="w-full h-8 px-2 flex flex-col justify-center gap-1 border border-border/40 bg-void/30 rounded">
          <div className="w-8 h-1 bg-muted-foreground/45 rounded-sm" />
          <div className="w-full h-4 border border-border/50 rounded bg-void/50" />
        </div>
      );
    case "select":
      return (
        <div className="w-full h-8 px-2 flex items-center justify-between border border-border/40 bg-void/30 rounded">
          <div className="w-12 h-2 bg-muted-foreground/40 rounded-sm" />
          <div className="w-2 h-2 border-r border-b border-muted-foreground rotate-45" />
        </div>
      );
    case "checkbox":
      return (
        <div className="w-full h-8 flex items-center gap-2 px-2">
          <div className="w-3.5 h-3.5 border border-pulse rounded bg-pulse/10 flex items-center justify-center text-pulse text-[8px] font-bold">✓</div>
          <div className="w-12 h-2 bg-muted-foreground/40 rounded-sm" />
        </div>
      );
    case "toggle":
      return (
        <div className="w-full h-8 flex items-center gap-2 px-2">
          <div className="w-7 h-4 rounded-full bg-pulse/35 relative border border-pulse/50">
            <div className="w-2.5 h-2.5 rounded-full bg-pulse absolute right-0.5 top-0.5" />
          </div>
          <div className="w-10 h-2 bg-muted-foreground/40 rounded-sm" />
        </div>
      );
    case "radio":
      return (
        <div className="w-full h-8 flex flex-col justify-center gap-1.5 px-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border border-pulse bg-pulse/10 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-pulse" /></div>
            <div className="w-10 h-1.5 bg-muted-foreground/40 rounded-sm" />
          </div>
        </div>
      );
    case "stat-card":
      return (
        <div className="w-full h-8 border border-border/40 bg-void/30 rounded p-1.5 flex flex-col justify-between">
          <div className="w-10 h-1 bg-muted-foreground/40 rounded-sm" />
          <div className="w-14 h-2.5 bg-bone rounded-sm" />
        </div>
      );
    case "data-table":
      return (
        <div className="w-full h-8 border border-border/40 bg-void/30 rounded overflow-hidden flex flex-col">
          <div className="h-2 bg-muted/60 border-b border-border/20" />
          <div className="h-2 bg-void border-b border-border/10" />
          <div className="h-2 bg-void" />
        </div>
      );
    case "badge":
      return (
        <div className="w-full h-8 flex items-center justify-center">
          <div className="px-2 py-0.5 rounded-full bg-pulse/15 border border-pulse/25 text-[8px] text-pulse font-bold">Tag</div>
        </div>
      );
    case "avatar":
      return (
        <div className="w-full h-8 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-border/60 border border-border/80 flex items-center justify-center text-[8px] text-muted-foreground font-black">JD</div>
        </div>
      );
    case "progress":
      return (
        <div className="w-full h-8 flex items-center px-2">
          <div className="w-full h-2 rounded-full bg-muted/65 overflow-hidden">
            <div className="w-[70%] h-full bg-pulse" />
          </div>
        </div>
      );
    case "card-container":
      return (
        <div className="w-full h-8 border border-border/50 bg-void/40 rounded p-1">
          <div className="w-full h-full border border-dashed border-border/30 rounded" />
        </div>
      );
    case "two-column":
      return (
        <div className="w-full h-8 grid grid-cols-2 gap-1 px-1 py-1">
          <div className="border border-dashed border-border/35 rounded" />
          <div className="border border-dashed border-border/35 rounded" />
        </div>
      );
    case "navbar":
      return (
        <div className="w-full h-8 border-b border-border/50 bg-void/40 px-2 flex items-center justify-between">
          <div className="w-6 h-2 bg-bone rounded-sm" />
          <div className="flex gap-1.5"><div className="w-3 h-1 bg-muted-foreground/40 rounded-sm" /><div className="w-3 h-1 bg-muted-foreground/40 rounded-sm" /></div>
        </div>
      );
    case "sidebar":
      return (
        <div className="w-full h-8 flex border border-border/40 rounded overflow-hidden">
          <div className="w-1/4 bg-void border-r border-border/30" />
          <div className="w-3/4 bg-void/20" />
        </div>
      );
    case "modal":
      return (
        <div className="w-full h-8 flex items-center justify-center px-4">
          <div className="w-full h-6 border border-border/60 bg-surface rounded shadow-md" />
        </div>
      );
    case "tabs":
      return (
        <div className="w-full h-8 flex items-end justify-center gap-1 border-b border-border/30">
          <div className="w-5 h-2 bg-pulse/20 border-b-2 border-pulse rounded-t-sm" />
          <div className="w-5 h-1.5 bg-muted-foreground/20 rounded-t-sm" />
        </div>
      );
  }
}

// Live Canvas Wireframe Mock Renderer
export function renderComponentOnCanvas(
  component: { id: string; type: ComponentType; props: any },
  isLightMode: boolean
): React.ReactNode {
  const { props } = component;
  const textColor = isLightMode ? "text-slate-800" : "text-bone";
  const subtextColor = isLightMode ? "text-slate-500" : "text-muted-foreground";
  const bgSubtle = isLightMode ? "bg-slate-100" : "bg-void/40";
  const bgSurface = isLightMode ? "bg-white" : "bg-surface";
  const borderColor = isLightMode ? "border-slate-200" : "border-border/30";
  const textInputBg = isLightMode ? "bg-slate-50" : "bg-void/60";

  switch (component.type) {
    case "heading":
      const sizes: Record<string, string> = { sm: "text-base font-bold", md: "text-lg font-extrabold", lg: "text-2xl font-black" };
      return (
        <div className="w-full h-full flex items-center px-1 truncate select-none">
          <span className={`${sizes[props.size || "lg"]} ${textColor}`}>{props.text || "Heading"}</span>
        </div>
      );
    case "label":
      return (
        <div className="w-full h-full flex items-center px-1 select-none overflow-hidden leading-normal">
          <p className={`text-xs ${subtextColor}`}>{props.text || "Label text"}</p>
        </div>
      );
    case "button-primary":
      return (
        <div
          className="w-full h-full rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-wider text-white shadow-lg active:scale-95 transition-transform select-none"
          style={{ backgroundColor: props.accent || "#7C3AED" }}
        >
          {props.text || "Primary button"}
        </div>
      );
    case "button-secondary":
      return (
        <div className={`w-full h-full rounded-xl border ${borderColor} ${bgSubtle} flex items-center justify-center font-bold text-xs uppercase tracking-wider ${textColor} transition-colors select-none`}>
          {props.text || "Secondary button"}
        </div>
      );
    case "divider":
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className={`w-full h-px ${isLightMode ? "bg-slate-300" : "bg-border/60"}`} />
        </div>
      );
    case "icon":
      return (
        <div className="w-full h-full flex items-center justify-center select-none text-xl" style={{ color: props.color || "#7C3AED" }}>
          ⚙️
        </div>
      );
    case "input-text":
      return (
        <div className="w-full h-full flex flex-col justify-center px-1 select-none">
          <label className={`text-[10px] font-bold uppercase tracking-wider ${subtextColor} mb-1`}>{props.labelText || "Label"}</label>
          <div className={`w-full h-9 rounded-lg border ${borderColor} ${textInputBg} px-3 flex items-center text-xs ${subtextColor}`}>
            {props.placeholder || "Enter details..."}
          </div>
        </div>
      );
    case "textarea":
      return (
        <div className="w-full h-full flex flex-col justify-center px-1 select-none">
          <label className={`text-[10px] font-bold uppercase tracking-wider ${subtextColor} mb-1`}>{props.labelText || "Message"}</label>
          <div className={`w-full h-full border ${borderColor} rounded-lg ${textInputBg} p-2 text-xs ${subtextColor} leading-normal`}>
            {props.placeholder || "Type multiline text..."}
          </div>
        </div>
      );
    case "select":
      return (
        <div className="w-full h-full flex flex-col justify-center px-1 select-none">
          <label className={`text-[10px] font-bold uppercase tracking-wider ${subtextColor} mb-1`}>{props.labelText || "Dropdown"}</label>
          <div className={`w-full h-9 rounded-lg border ${borderColor} ${textInputBg} px-3 flex items-center justify-between text-xs ${textColor}`}>
            <span>{props.placeholder || "Select option..."}</span>
            <span className="text-xs">▼</span>
          </div>
        </div>
      );
    case "checkbox":
      return (
        <div className="w-full h-full flex items-center gap-2.5 px-1 select-none">
          <div
            className={`w-4.5 h-4.5 rounded border flex items-center justify-center text-[10px] font-bold text-white transition-colors`}
            style={{ backgroundColor: props.checked ? (props.accent || "#7C3AED") : "transparent", borderColor: props.accent || "#7C3AED" }}
          >
            {props.checked && "✓"}
          </div>
          <span className={`text-xs ${textColor}`}>{props.text || "Accept details"}</span>
        </div>
      );
    case "toggle":
      return (
        <div className="w-full h-full flex items-center gap-3 px-1 select-none">
          <div
            className="w-8 h-4.5 rounded-full relative transition-colors"
            style={{ backgroundColor: props.active ? (props.accent || "#7C3AED") : (isLightMode ? "#CBD5E1" : "#3F3F46") }}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${props.active ? "right-0.5" : "left-0.5"}`} />
          </div>
          <span className={`text-xs ${textColor}`}>{props.text || "Toggle switch"}</span>
        </div>
      );
    case "radio":
      const options = props.options || ["Option Alpha", "Option Beta"];
      return (
        <div className="w-full h-full flex flex-col justify-center px-1 select-none">
          <label className={`text-[10px] font-bold uppercase tracking-wider ${subtextColor} mb-1.5`}>{props.labelText || "Select One"}</label>
          <div className="space-y-1.5">
            {options.map((opt: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center`} style={{ borderColor: props.accent || "#7C3AED" }}>
                  {idx === 0 && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: props.accent || "#7C3AED" }} />}
                </div>
                <span className={`text-xs ${textColor}`}>{opt}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "stat-card":
      return (
        <div className={`w-full h-full border ${borderColor} ${bgSurface} rounded-2xl p-4 shadow-lg flex flex-col justify-between select-none`}>
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-mono uppercase tracking-wider ${subtextColor}`}>{props.title || "Stat Title"}</span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: props.accent || "#7C3AED" }} />
          </div>
          <p className={`text-xl font-black ${textColor} mt-1`}>{props.value || "1,250"}</p>
          <p className={`text-[10px] ${textColor} opacity-60 mt-0.5`}>{props.subtitle || "+4.2% since yesterday"}</p>
        </div>
      );
    case "data-table":
      const hdrs = props.headers || ["Entity", "Role", "Timestamp"];
      const rws = props.rows || [["Vance", "SDR", "11m ago"], ["Harris", "Manager", "1h ago"]];
      return (
        <div className={`w-full h-full border ${borderColor} ${bgSurface} rounded-2xl overflow-hidden shadow-sm flex flex-col select-none text-[10px]`}>
          <div className={`grid grid-cols-3 bg-slate-100/50 dark:bg-void/45 border-b ${borderColor} px-3 py-2 font-bold uppercase tracking-wider ${textColor}`}>
            {hdrs.map((h: string) => <span key={h}>{h}</span>)}
          </div>
          <div className="flex-grow overflow-y-auto divide-y divide-border/20">
            {rws.map((row: string[], rIdx: number) => (
              <div key={rIdx} className={`grid grid-cols-3 px-3 py-2 ${textColor}`}>
                {row.map((cell: string, cIdx: number) => <span key={cIdx} className="truncate">{cell}</span>)}
              </div>
            ))}
          </div>
        </div>
      );
    case "badge":
      return (
        <div className="w-full h-full flex items-center justify-center select-none">
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm"
            style={{ backgroundColor: props.accent || "#7C3AED" }}
          >
            {props.text || "Badge"}
          </span>
        </div>
      );
    case "avatar":
      return (
        <div className="w-full h-full flex items-center justify-center select-none animate-in fade-in duration-200">
          <div className={`w-full h-full rounded-full ${bgSubtle} border ${borderColor} flex items-center justify-center text-xs font-black ${textColor}`}>
            {props.fallback || "MA"}
          </div>
        </div>
      );
    case "progress":
      return (
        <div className="w-full h-full flex flex-col justify-center px-1 select-none">
          <div className="flex justify-between text-[9px] font-mono uppercase text-muted-foreground mb-1">
            <span>Progress Status</span>
            <span>{props.value || 50}%</span>
          </div>
          <div className={`w-full h-2.5 rounded-full ${isLightMode ? "bg-slate-200" : "bg-muted/30"} overflow-hidden`}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${props.value || 50}%`, backgroundColor: props.accent || "#7C3AED" }} />
          </div>
        </div>
      );
    case "card-container":
      return (
        <div className={`w-full h-full border ${borderColor} ${bgSurface} rounded-2xl p-4 shadow-xl flex flex-col select-none`}>
          <div className="border-b border-border/10 pb-2 mb-3">
            <h4 className={`font-display font-bold text-xs uppercase tracking-wider ${textColor}`}>{props.title || "Container header"}</h4>
          </div>
          <div className="flex-grow border border-dashed border-border/20 rounded-xl bg-void/5 flex items-center justify-center text-[10px] text-muted-foreground/60">
            Empty Container Area
          </div>
        </div>
      );
    case "two-column":
      return (
        <div className="w-full h-full grid grid-cols-2 gap-3 select-none">
          <div className={`border border-dashed ${borderColor} rounded-2xl flex items-center justify-center text-[10px] text-muted-foreground/50`}>Col Left</div>
          <div className={`border border-dashed ${borderColor} rounded-2xl flex items-center justify-center text-[10px] text-muted-foreground/50`}>Col Right</div>
        </div>
      );
    case "navbar":
      const nvItms = props.items || ["Home", "Workspace", "Analytics"];
      return (
        <div className={`w-full h-full border-b ${borderColor} ${bgSurface} px-4 flex items-center justify-between select-none`}>
          <span className={`font-display font-black text-xs uppercase tracking-widest ${textColor}`}>{props.title || "Brand logo"}</span>
          <div className="flex gap-4">
            {nvItms.map((itm: string) => (
              <span key={itm} className={`text-[10px] font-mono uppercase tracking-wider ${subtextColor} hover:${textColor} cursor-pointer`}>{itm}</span>
            ))}
          </div>
        </div>
      );
    case "sidebar":
      return (
        <div className={`w-full h-full border-r ${borderColor} ${bgSurface} p-3 flex flex-col gap-4 select-none`}>
          <div className="border-b border-border/10 pb-2">
            <span className={`font-display font-black text-[10px] uppercase tracking-wider ${textColor}`}>{props.title || "Workspace"}</span>
          </div>
          <div className="space-y-2 flex-grow">
            {[1, 2, 3].map((num) => (
              <div key={num} className={`h-7 rounded-lg ${bgSubtle} flex items-center px-2 text-[10px] font-semibold ${textColor}`}>
                Link Option #{num}
              </div>
            ))}
          </div>
        </div>
      );
    case "modal":
      return (
        <div className={`w-full h-full border border-pulse/30 ${bgSurface} rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden select-none`}>
          <div className="bg-pulse/10 border-b border-pulse/20 px-3 py-2 flex items-center justify-between">
            <span className={`font-display font-bold text-xs ${textColor}`}>{props.title || "Confirm Modal"}</span>
            <span className="text-[10px] opacity-60">✕</span>
          </div>
          <div className="p-4 flex-grow">
            <p className={`text-xs leading-relaxed ${subtextColor}`}>{props.bodyText || "Confirm layout setup operations."}</p>
          </div>
          <div className={`bg-void/10 border-t ${borderColor} p-2 flex justify-end gap-1.5`}>
            <div className={`px-3 py-1 rounded bg-muted/20 text-[10px] font-bold ${textColor}`}>Cancel</div>
            <div className="px-3 py-1 rounded bg-pulse text-[10px] font-bold text-void">Accept</div>
          </div>
        </div>
      );
    case "tabs":
      const tbs = props.items || ["Overview", "Settings"];
      const actIdx = props.activeIdx || 0;
      return (
        <div className={`w-full h-full flex border-b ${borderColor} gap-4 select-none px-2`}>
          {tbs.map((tab: string, idx: number) => {
            const isActive = idx === actIdx;
            return (
              <div
                key={tab}
                className={`h-full flex items-center border-b-2 px-1 text-xs font-bold transition-colors cursor-pointer ${
                  isActive ? "border-pulse text-pulse" : "border-transparent text-muted-foreground"
                }`}
              >
                {tab}
              </div>
            );
          })}
        </div>
      );
  }
}
