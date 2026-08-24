"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import {
  Wand2,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileCode,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit3,
  X,
  Undo2,
  Redo2,
  Sparkles,
  Smartphone,
  Tablet as TabletIcon,
  Monitor,
  Maximize
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { BuilderShell } from "@/components/shared/BuilderShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AiGeneratePanel, PillGroup, SliderField } from "@/components/creative/AiGeneratePanel";
import {
  COMPONENT_DEFINITIONS,
  CATEGORIES,
  renderThumbnail,
  renderComponentOnCanvas,
  type ComponentType
} from "./componentLibrary";

export interface PlacedComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, any>;
}

export interface Frame {
  id: string;
  name: string;
  preset: "desktop" | "tablet" | "mobile" | "custom";
  width: number;
  height: number;
  components: PlacedComponent[];
}

export default function UiUxLayoutFrameWorkspace() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  // Frames state
  const [frames, setFrames] = useState<Frame[]>([
    {
      id: "frame-1",
      name: "Dashboard Web View",
      preset: "desktop",
      width: 1000,
      height: 600,
      components: [
        {
          id: "comp-nav",
          type: "navbar",
          x: 20,
          y: 20,
          width: 960,
          height: 55,
          props: { title: "Admin Portal", items: ["Overview", "Users", "Alerts"] }
        },
        {
          id: "comp-stat-1",
          type: "stat-card",
          x: 20,
          y: 100,
          width: 220,
          height: 110,
          props: { title: "Active Users", value: "14,821", subtitle: "+8% from yesterday", accent: "#7C3AED" }
        },
        {
          id: "comp-stat-2",
          type: "stat-card",
          x: 260,
          y: 100,
          width: 220,
          height: 110,
          props: { title: "Procurement Requests", value: "392", subtitle: "24 pending review", accent: "#3B82F6" }
        },
        {
          id: "comp-chart",
          type: "card-container",
          x: 500,
          y: 100,
          width: 480,
          height: 240,
          props: { title: "Monthly Performance Overview" }
        }
      ]
    },
    {
      id: "frame-2",
      name: "Auth Panel Modal",
      preset: "mobile",
      width: 390,
      height: 700,
      components: [
        {
          id: "comp-modal",
          type: "modal",
          x: 20,
          y: 150,
          width: 350,
          height: 380,
          props: { title: "MaVionix Suite", bodyText: "Log in with your administrator organization credentials." }
        }
      ]
    }
  ]);

  const [activeFrameId, setActiveFrameId] = useState<string>("frame-1");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState<number>(0.8);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // History Undo/Redo Stacks
  const [history, setHistory] = useState<Frame[][]>([]);
  const [redoStack, setRedoStack] = useState<Frame[][]>([]);

  // Dialog / Modal state
  const [addFrameOpen, setAddFrameOpen] = useState(false);
  const [newFrameName, setNewFrameName] = useState("");
  const [newFramePreset, setNewFramePreset] = useState<"desktop" | "tablet" | "mobile" | "custom">("desktop");
  const [newFrameWidth, setNewFrameWidth] = useState(1000);
  const [newFrameHeight, setNewFrameHeight] = useState(600);

  const [exportOpen, setExportOpen] = useState(false);
  const [exportType, setExportType] = useState<"json" | "react">("json");

  const [aiAssistOpen, setAiAssistOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  // Two-panel generate mode
  const [generateMode, setGenerateMode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [density, setDensity] = useState("Comfortable");
  const [componentStyle, setComponentStyle] = useState("Minimal");
  const [colorScheme, setColorScheme] = useState("Dark");
  const [complexitySlider, setComplexitySlider] = useState(50);
  const [gridCols, setGridCols] = useState(12);
  const [viewport, setViewport] = useState("Desktop");

  const [editingFrameId, setEditingFrameId] = useState<string | null>(null);
  const [frameRenameValue, setFrameRenameValue] = useState("");

  // Snapping guidelines coordinates
  const [snapLines, setSnapLines] = useState<{ x?: number; y?: number }>({});

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [marqueeBox, setMarqueeBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const activeFrame = useMemo(() => {
    return frames.find((f) => f.id === activeFrameId) || frames[0];
  }, [frames, activeFrameId]);

  // Push state to history for undo action
  const pushHistory = (newFramesState: Frame[]) => {
    setHistory((prev) => [...prev.slice(-19), frames]); // cap history at 20 steps
    setRedoStack([]);
    setFrames(newFramesState);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [...prev, frames]);
    setHistory((prev) => prev.slice(0, -1));
    setFrames(previous);
    toast.success("Action undone");
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, frames]);
    setRedoStack((prev) => prev.slice(0, -1));
    setFrames(next);
    toast.success("Action redone");
  };

  // Keyboard navigation & Nudges
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement?.tagName;
      if (activeEl === "INPUT" || activeEl === "TEXTAREA" || activeEl === "SELECT") {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.size > 0 && activeFrame) {
          e.preventDefault();
          const updated = activeFrame.components.filter((c) => !selectedIds.has(c.id));
          pushHistory(
            frames.map((f) => (f.id === activeFrame.id ? { ...f, components: updated } : f))
          );
          setSelectedIds(new Set());
          toast.message("Deleted components");
        }
      }

      // Nudging with arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if (selectedIds.size > 0 && activeFrame) {
          e.preventDefault();
          const amount = e.shiftKey ? 10 : 1;
          let dx = 0;
          let dy = 0;
          if (e.key === "ArrowUp") dy = -amount;
          if (e.key === "ArrowDown") dy = amount;
          if (e.key === "ArrowLeft") dx = -amount;
          if (e.key === "ArrowRight") dx = amount;

          const updated = activeFrame.components.map((c) => {
            if (selectedIds.has(c.id)) {
              return { ...c, x: Math.max(0, c.x + dx), y: Math.max(0, c.y + dy) };
            }
            return c;
          });
          pushHistory(
            frames.map((f) => (f.id === activeFrame.id ? { ...f, components: updated } : f))
          );
        }
      }

      // Ctrl + D / Cmd + D (Duplicate)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        if (selectedIds.size > 0 && activeFrame) {
          e.preventDefault();
          const duplicated: PlacedComponent[] = [];
          activeFrame.components.forEach((c) => {
            if (selectedIds.has(c.id)) {
              duplicated.push({
                ...c,
                id: `comp-dup-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                x: c.x + 20,
                y: c.y + 20
              });
            }
          });
          const updated = [...activeFrame.components, ...duplicated];
          pushHistory(
            frames.map((f) => (f.id === activeFrame.id ? { ...f, components: updated } : f))
          );
          setSelectedIds(new Set(duplicated.map((d) => d.id)));
          toast.success(`Duplicated ${duplicated.length} components`);
        }
      }

      // Ctrl + Z (Undo)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Ctrl + Y / Ctrl + Shift + Z (Redo)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, activeFrame, frames]);

  // Resize handler math
  const handleResizeStart = (
    e: React.MouseEvent,
    component: PlacedComponent,
    handle: string
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = component.x;
    const startTop = component.y;
    const startWidth = component.width;
    const startHeight = component.height;

    const minW = COMPONENT_DEFINITIONS[component.type].minWidth || 40;
    const minH = COMPONENT_DEFINITIONS[component.type].minHeight || 20;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;

      let nextX = startLeft;
      let nextY = startTop;
      let nextW = startWidth;
      let nextH = startHeight;

      if (handle.includes("e")) {
        nextW = Math.max(minW, startWidth + dx);
      }
      if (handle.includes("w")) {
        const potentialW = startWidth - dx;
        if (potentialW >= minW) {
          nextX = startLeft + dx;
          nextW = potentialW;
        }
      }
      if (handle.includes("s")) {
        nextH = Math.max(minH, startHeight + dy);
      }
      if (handle.includes("n")) {
        const potentialH = startHeight - dy;
        if (potentialH >= minH) {
          nextY = startTop + dy;
          nextH = potentialH;
        }
      }

      // Snap logic for resize
      const snapTarget = snapCheck(nextX, nextY, nextW, nextH, component.id);
      if (snapTarget.snappedX) {
        nextX = snapTarget.x;
        nextW = startWidth + (startX - moveEvent.clientX) / zoom; // Adjust W if X snaps
      }
      if (snapTarget.snappedY) {
        nextY = snapTarget.y;
      }

      setFrames(
        frames.map((f) => {
          if (f.id === activeFrameId) {
            return {
              ...f,
              components: f.components.map((c) =>
                c.id === component.id ? { ...c, x: Math.round(nextX), y: Math.round(nextY), width: Math.round(nextW), height: Math.round(nextH) } : c
              )
            };
          }
          return f;
        })
      );
    };

    const handleMouseUp = () => {
      setSnapLines({});
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      pushHistory(frames);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Alignment snapping system
  const snapCheck = (
    x: number,
    y: number,
    w: number,
    h: number,
    ignoreId: string
  ): { x: number; y: number; snappedX: boolean; snappedY: boolean } => {
    if (!activeFrame) return { x, y, snappedX: false, snappedY: false };

    const threshold = 6;
    let snapX = x;
    let snapY = y;
    let snappedX = false;
    let snappedY = false;
    let helperX: number | undefined;
    let helperY: number | undefined;

    // Check alignments against coordinates of other elements
    for (const c of activeFrame.components) {
      if (c.id === ignoreId) continue;

      const targetsX = [c.x, c.x + c.width, c.x + c.width / 2];
      const sourcesX = [x, x + w, x + w / 2];

      for (const tx of targetsX) {
        for (const sx of sourcesX) {
          if (Math.abs(sx - tx) < threshold) {
            snappedX = true;
            helperX = tx;
            if (sx === x) snapX = tx;
            if (sx === x + w) snapX = tx - w;
            if (sx === x + w / 2) snapX = tx - w / 2;
          }
        }
      }

      const targetsY = [c.y, c.y + c.height, c.y + c.height / 2];
      const sourcesY = [y, y + h, y + h / 2];

      for (const ty of targetsY) {
        for (const sy of sourcesY) {
          if (Math.abs(sy - ty) < threshold) {
            snappedY = true;
            helperY = ty;
            if (sy === y) snapY = ty;
            if (sy === y + h) snapY = ty - h;
            if (sy === y + h / 2) snapY = ty - h / 2;
          }
        }
      }
    }

    setSnapLines({ x: helperX, y: helperY });
    return { x: snapX, y: snapY, snappedX, snappedY };
  };

  // HTML5 drag start from library panel
  const handleDragStartFromLibrary = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData("text/plain", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOverCanvas = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current || !activeFrame) return;

    const type = e.dataTransfer.getData("text/plain") as ComponentType;
    if (!COMPONENT_DEFINITIONS[type]) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);

    const def = COMPONENT_DEFINITIONS[type];
    const newComponent: PlacedComponent = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      x: x - def.defaultWidth / 2,
      y: y - def.defaultHeight / 2,
      width: def.defaultWidth,
      height: def.defaultHeight,
      props: { ...def.defaultProps }
    };

    const updated = [...activeFrame.components, newComponent];
    pushHistory(
      frames.map((f) => (f.id === activeFrame.id ? { ...f, components: updated } : f))
    );
    setSelectedIds(new Set([newComponent.id]));
    toast.message(`Added ${def.label}`);
  };

  // Quick addition fallbacks on hover "+" click
  const handleQuickAdd = (type: ComponentType) => {
    if (!activeFrame) return;
    const def = COMPONENT_DEFINITIONS[type];
    const newComponent: PlacedComponent = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      x: Math.round(activeFrame.width / 2 - def.defaultWidth / 2),
      y: Math.round(activeFrame.height / 2 - def.defaultHeight / 2),
      width: def.defaultWidth,
      height: def.defaultHeight,
      props: { ...def.defaultProps }
    };

    const updated = [...activeFrame.components, newComponent];
    pushHistory(
      frames.map((f) => (f.id === activeFrame.id ? { ...f, components: updated } : f))
    );
    setSelectedIds(new Set([newComponent.id]));
    toast.message(`Added ${def.label} to center`);
  };

  // Drag select marquee & single click reposition pointer math
  const handleCanvasPointerDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).classList.contains("marquee-target")) {
      return;
    }

    e.preventDefault();
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const startX = (e.clientX - rect.left) / zoom;
    const startY = (e.clientY - rect.top) / zoom;

    dragStartPos.current = { x: startX, y: startY };

    const handlePointerMove = (moveEvent: MouseEvent) => {
      const currentX = (moveEvent.clientX - rect.left) / zoom;
      const currentY = (moveEvent.clientY - rect.top) / zoom;

      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      const w = Math.abs(startX - currentX);
      const h = Math.abs(startY - currentY);

      setMarqueeBox({ x, y, w, h });

      // Identify selected IDs based on intersection
      if (activeFrame) {
        const selected = new Set<string>();
        activeFrame.components.forEach((c) => {
          if (c.x >= x && c.x + c.width <= x + w && c.y >= y && c.y + c.height <= y + h) {
            selected.add(c.id);
          }
        });
        setSelectedIds(selected);
      }
    };

    const handlePointerUp = () => {
      setMarqueeBox(null);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
  };

  // Reposition elements free-form
  const handleComponentPointerDown = (e: React.MouseEvent, component: PlacedComponent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!selectedIds.has(component.id)) {
      if (e.shiftKey) {
        setSelectedIds(new Set([...Array.from(selectedIds), component.id]));
      } else {
        setSelectedIds(new Set([component.id]));
      }
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const initialCoords = activeFrame.components
      .filter((c) => selectedIds.has(c.id) || c.id === component.id)
      .map((c) => ({ id: c.id, x: c.x, y: c.y, w: c.width, h: c.height }));

    const handlePointerMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;

      // Handle snapped coordinates for the primary element being dragged
      let snappedDx = dx;
      let snappedDy = dy;
      if (initialCoords.length === 1) {
        const nextX = component.x + dx;
        const nextY = component.y + dy;
        const snaps = snapCheck(nextX, nextY, component.width, component.height, component.id);
        snappedDx = snaps.x - component.x;
        snappedDy = snaps.y - component.y;
      }

      const updated = activeFrame.components.map((c) => {
        const original = initialCoords.find((ic) => ic.id === c.id);
        if (original) {
          return {
            ...c,
            x: Math.round(original.x + snappedDx),
            y: Math.round(original.y + snappedDy)
          };
        }
        return c;
      });

      setFrames(
        frames.map((f) => (f.id === activeFrame.id ? { ...f, components: updated } : f))
      );
    };

    const handlePointerUp = () => {
      setSnapLines({});
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      pushHistory(frames);
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
  };

  // Duplicate single component from floating action box
  const handleDuplicateComponent = (compId: string) => {
    if (!activeFrame) return;
    const item = activeFrame.components.find((c) => c.id === compId);
    if (!item) return;

    const newItem = {
      ...item,
      id: `comp-dup-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      x: item.x + 20,
      y: item.y + 20
    };

    const updated = [...activeFrame.components, newItem];
    pushHistory(
      frames.map((f) => (f.id === activeFrame.id ? { ...f, components: updated } : f))
    );
    setSelectedIds(new Set([newItem.id]));
    toast.success("Component duplicated");
  };

  // Delete single component
  const handleDeleteComponent = (compId: string) => {
    if (!activeFrame) return;
    const updated = activeFrame.components.filter((c) => c.id !== compId);
    pushHistory(
      frames.map((f) => (f.id === activeFrame.id ? { ...f, components: updated } : f))
    );
    setSelectedIds(new Set());
    toast.message("Component deleted");
  };

  // Layer order actions (Bring to Front / Send to Back)
  const handleLayerAction = (compId: string, action: "front" | "back") => {
    if (!activeFrame) return;
    const item = activeFrame.components.find((c) => c.id === compId);
    if (!item) return;

    let updated = activeFrame.components.filter((c) => c.id !== compId);
    if (action === "front") {
      updated = [...updated, item];
    } else {
      updated = [item, ...updated];
    }

    pushHistory(
      frames.map((f) => (f.id === activeFrame.id ? { ...f, components: updated } : f))
    );
    toast.message(action === "front" ? "Brought to front" : "Sent to back");
  };

  // Add a frame flow
  const handleCreateFrame = () => {
    if (!newFrameName.trim()) return;
    const widthMap = { desktop: 1440, tablet: 768, mobile: 390, custom: newFrameWidth };
    const heightMap = { desktop: 900, tablet: 1024, mobile: 844, custom: newFrameHeight };

    const newFrame: Frame = {
      id: `frame-${Date.now()}`,
      name: newFrameName.trim(),
      preset: newFramePreset,
      width: widthMap[newFramePreset],
      height: heightMap[newFramePreset],
      components: []
    };

    const updated = [...frames, newFrame];
    setFrames(updated);
    setActiveFrameId(newFrame.id);
    setAddFrameOpen(false);
    setNewFrameName("");
    toast.success(`Created frame "${newFrame.name}"`);
  };

  const handleDuplicateFrame = (frame: Frame) => {
    const duplicated: Frame = {
      ...frame,
      id: `frame-dup-${Date.now()}`,
      name: `${frame.name} (Copy)`,
      components: frame.components.map((c) => ({ ...c, id: `comp-copy-${Date.now()}-${Math.random()}` }))
    };
    setFrames([...frames, duplicated]);
    setActiveFrameId(duplicated.id);
    toast.success("Frame duplicated");
  };

  const handleDeleteFrame = (frameId: string) => {
    if (frames.length === 1) {
      if (confirm("This is your only frame — delete anyway?")) {
        setFrames([
          { id: `frame-new`, name: "Untitled Layout", preset: "desktop", width: 1000, height: 600, components: [] }
        ]);
        setActiveFrameId("frame-new");
        setSelectedIds(new Set());
      }
      return;
    }

    const updated = frames.filter((f) => f.id !== frameId);
    setFrames(updated);
    if (activeFrameId === frameId) {
      setActiveFrameId(updated[0].id);
    }
    setSelectedIds(new Set());
    toast.message("Frame deleted");
  };

  // Rename frame
  const handleRenameFrame = (id: string, newName: string) => {
    if (!newName.trim()) return;
    setFrames(frames.map((f) => (f.id === id ? { ...f, name: newName.trim() } : f)));
    setEditingFrameId(null);
    toast.success("Frame renamed");
  };

  // Properties form value binding
  const handlePropChange = (compId: string, propKey: string, val: any) => {
    if (!activeFrame) return;
    const updated = activeFrame.components.map((c) => {
      if (c.id === compId) {
        return {
          ...c,
          props: { ...c.props, [propKey]: val }
        };
      }
      return c;
    });

    setFrames(
      frames.map((f) => (f.id === activeFrame.id ? { ...f, components: updated } : f))
    );
  };

  // Properties size/position coordinate input binding
  const handleCoordinateChange = (compId: string, key: "x" | "y" | "width" | "height", val: number) => {
    if (!activeFrame) return;
    const updated = activeFrame.components.map((c) => {
      if (c.id === compId) {
        return { ...c, [key]: val };
      }
      return c;
    });
    pushHistory(
      frames.map((f) => (f.id === activeFrame.id ? { ...f, components: updated } : f))
    );
  };

  // AI assist prompt heuristical generator
  const handleAiAssistGenerate = () => {
    if (!aiPrompt.trim() || !activeFrame) return;

    const lower = aiPrompt.toLowerCase();
    const mockCreated: PlacedComponent[] = [];

    // Simple heuristical keyword analyzer
    if (lower.includes("login") || lower.includes("sign")) {
      mockCreated.push(
        {
          id: `comp-ai-modal`,
          type: "modal",
          x: Math.round(activeFrame.width / 2 - 160),
          y: 80,
          width: 320,
          height: 380,
          props: { title: "Secure Authentication", bodyText: "Log in with credentials." }
        },
        {
          id: `comp-ai-inp-1`,
          type: "input-text",
          x: Math.round(activeFrame.width / 2 - 130),
          y: 160,
          width: 260,
          height: 45,
          props: { labelText: "Email address", placeholder: "e.g. dev@vance.io" }
        },
        {
          id: `comp-ai-inp-2`,
          type: "input-text",
          x: Math.round(activeFrame.width / 2 - 130),
          y: 220,
          width: 260,
          height: 45,
          props: { labelText: "Password", placeholder: "••••••••" }
        },
        {
          id: `comp-ai-btn`,
          type: "button-primary",
          x: Math.round(activeFrame.width / 2 - 130),
          y: 300,
          width: 260,
          height: 40,
          props: { text: "Sign In securely", accent: "#7C3AED" }
        }
      );
    } else if (lower.includes("dashboard") || lower.includes("table") || lower.includes("analytics")) {
      mockCreated.push(
        {
          id: `comp-ai-nav`,
          type: "navbar",
          x: 20,
          y: 20,
          width: activeFrame.width - 40,
          height: 55,
          props: { title: "Metrics Analytics Hub", items: ["System", "Workspace", "Settings"] }
        },
        {
          id: `comp-ai-card-1`,
          type: "stat-card",
          x: 20,
          y: 100,
          width: 220,
          height: 110,
          props: { title: "Total Accounts", value: "8,924", subtitle: "+15.6% month-over-month", accent: "#7C3AED" }
        },
        {
          id: `comp-ai-card-2`,
          type: "stat-card",
          x: 260,
          y: 100,
          width: 220,
          height: 110,
          props: { title: "Telemetry Logs", value: "3.2M", subtitle: "Latency average: 18ms", accent: "#10B981" }
        },
        {
          id: `comp-ai-tbl`,
          type: "data-table",
          x: 20,
          y: 230,
          width: activeFrame.width - 40,
          height: 250,
          props: { headers: ["User", "Privileges", "Joined"], rows: [["Alpha Dev", "Admin", "10m ago"], ["Beta Analyst", "User", "2h ago"], ["Gamma Lead", "Operator", "1d ago"]] }
        }
      );
    } else {
      // General fallbacks
      mockCreated.push(
        {
          id: `comp-ai-head`,
          type: "heading",
          x: 40,
          y: 40,
          width: 300,
          height: 40,
          props: { text: "Visual Wireframe Canvas", size: "lg" }
        },
        {
          id: `comp-ai-lbl`,
          type: "label",
          x: 40,
          y: 90,
          width: 300,
          height: 40,
          props: { text: "This layout draft was autonomously generated using your natural language brief parameters." }
        },
        {
          id: `comp-ai-card`,
          type: "card-container",
          x: 40,
          y: 150,
          width: 300,
          height: 180,
          props: { title: "Generated Layout Section" }
        }
      );
    }

    const updated = [...activeFrame.components, ...mockCreated];
    pushHistory(
      frames.map((f) => (f.id === activeFrame.id ? { ...f, components: updated } : f))
    );
    setSelectedIds(new Set(mockCreated.map((m) => m.id)));
    setAiPrompt("");
    setAiAssistOpen(false);
    toast.success("AI Layout applied successfully!");
  };

  // Generate Handoff Code Snippets
  const getGeneratedReactCode = (frame: Frame) => {
    let code = `import React from 'react';\n\n`;
    code += `export default function ${frame.name.replace(/\s+/g, "")}Mock() {\n`;
    code += `  return (\n`;
    code += `    <div style={{ position: 'relative', width: '${frame.width}px', height: '${frame.height}px', backgroundColor: '#07070f', overflow: 'hidden' }}>\n`;

    frame.components.forEach((c) => {
      const colorStyle = c.props.accent ? `, backgroundColor: '${c.props.accent}'` : "";
      code += `      {/* ${c.type} component ID: ${c.id} */}\n`;
      code += `      <div style={{ position: 'absolute', left: '${c.x}px', top: '${c.y}px', width: '${c.width}px', height: '${c.height}px', border: '1px solid rgba(255,255,255,0.1)' }}>\n`;
      code += `        <span style={{ color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}>${c.type}</span>\n`;
      code += `      </div>\n`;
    });

    code += `    </div>\n`;
    code += `  );\n`;
    code += `}\n`;
    return code;
  };

  // Search filtered component library list
  const filteredDefinitions = useMemo(() => {
    return Object.values(COMPONENT_DEFINITIONS).filter((c) =>
      c.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const activeSelectedComponent = useMemo(() => {
    if (selectedIds.size !== 1 || !activeFrame) return null;
    const selectedId = Array.from(selectedIds)[0];
    return activeFrame.components.find((c) => c.id === selectedId) || null;
  }, [selectedIds, activeFrame]);

  const handleUiUxGenerate = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 1200));
    handleAiAssistGenerate();
    setIsGenerating(false);
    setGenerateMode(false);
  };

  return (
    <BuilderShell
      title="UI/UX Visual Design Canvas"
      accent="pulse"
      isEmpty={false}
    >
      {generateMode ? (
        <AiGeneratePanel
          promptPlaceholder="Describe the layout you want to build in detail..."
          secondaryLabel="Device / Viewport"
          secondaryInput={
            <select
              value={viewport}
              onChange={e => setViewport(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              {["Desktop","Tablet","Mobile"].map(v => <option key={v}>{v}</option>)}
            </select>
          }
          chips={["SaaS Dashboard","Mobile Onboarding","Admin Settings Panel","Landing Page","Auth Flow","E-commerce Product Page"]}
          generateLabel="GENERATE LAYOUT"
          enhanceSuffix="with clear visual hierarchy, accessible spacing, and responsive component structure"
          modelOptions={["MaVionix Layout Engine v2","MaVionix Layout Engine v1 Turbo","MaVionix Wireframe v1"]}
          settings={
            <>
              <PillGroup label="Layout Density" options={["Compact","Comfortable","Spacious"]} value={density} onChange={setDensity} />
              <PillGroup label="Component Style" options={["Minimal","Detailed"]} value={componentStyle} onChange={setComponentStyle} />
              <PillGroup label="Color Scheme" options={["Light","Dark","Match Theme"]} value={colorScheme} onChange={setColorScheme} />
              <SliderField label="Complexity" value={complexitySlider} onChange={setComplexitySlider} />
              <SliderField label="Grid Columns" value={gridCols} onChange={setGridCols} min={1} max={24} />
            </>
          }
          resultsLabel="RESULTS"
          emptyResultsText="Your generated layout will appear here — then open the canvas to edit it."
          resultTiles={
            <div className="space-y-3">
              <p className="text-sm text-slate-300">Layout generated. <button type="button" onClick={() => setGenerateMode(false)} className="text-purple-400 underline font-semibold">Open canvas to edit →</button></p>
              <div className="grid grid-cols-2 gap-3">
                {["bg-gradient-to-br from-purple-500/20 to-slate-900","bg-gradient-to-br from-pink-500/15 to-slate-900","bg-gradient-to-br from-cyan-500/15 to-slate-900","bg-gradient-to-br from-purple-500/10 to-slate-900"].map((g,i)=>(
                  <div key={i} className={`rounded-xl border border-slate-800 aspect-video ${g} flex items-center justify-center`}>
                    <Sparkles className="w-5 h-5 text-slate-600" />
                  </div>
                ))}
              </div>
            </div>
          }
          onGenerate={handleUiUxGenerate}
          isGenerating={isGenerating}
          hasResults={false}
        />
      ) : (
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden min-h-0 relative">
        
        {/* Left Side: Frames List */}
        <aside className="w-full md:w-56 border-r border-border/20 flex flex-col shrink-0 bg-void/10 p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold">Frames List</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setAddFrameOpen(true)}
              className="text-pulse hover:bg-pulse/10 rounded-lg"
              title="Add UI Frame"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {frames.map((frame) => {
              const isActive = frame.id === activeFrameId;
              const isEditing = editingFrameId === frame.id;

              return (
                <div
                  key={frame.id}
                  onClick={() => {
                    setActiveFrameId(frame.id);
                    setSelectedIds(new Set());
                  }}
                  className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-left cursor-pointer transition-all ${
                    isActive
                      ? "bg-pulse/10 border-pulse text-pulse font-semibold"
                      : "border-transparent text-muted-foreground hover:bg-void/45 hover:text-bone"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs">📐</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={frameRenameValue}
                        onChange={(e) => setFrameRenameValue(e.target.value)}
                        onBlur={() => handleRenameFrame(frame.id, frameRenameValue)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameFrame(frame.id, frameRenameValue);
                          if (e.key === "Escape") setEditingFrameId(null);
                        }}
                        autoFocus
                        className="bg-void/60 border border-pulse text-[11px] px-1 h-5 text-bone focus:outline-none w-28 rounded"
                      />
                    ) : (
                      <span className="text-[11px] font-sans truncate">{frame.name}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFrameId(frame.id);
                          setFrameRenameValue(frame.name);
                        }}
                        className="text-muted-foreground hover:text-bone"
                        title="Rename"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateFrame(frame);
                        }}
                        className="text-muted-foreground hover:text-bone"
                        title="Duplicate"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFrame(frame.id);
                        }}
                        className="text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-surface/50 border border-border/20 rounded-xl p-3 text-[10px] space-y-1.5 text-muted-foreground">
            <p className="font-bold text-bone uppercase tracking-wider">Canvas Info</p>
            <p>Active Layout: <span className="text-pulse">{activeFrame.name}</span></p>
            <p>Preset Device: <span className="text-pulse uppercase">{activeFrame.preset}</span></p>
            <p>Placed Blocks: <span className="text-pulse">{activeFrame.components.length}</span></p>
          </div>
        </aside>

        {/* Center: Canvas Viewport */}
        <div className="flex-1 flex flex-col min-w-0 bg-void/5">
          {/* Top Control Bar */}
          <div className="h-12 border-b border-border/20 px-4 flex items-center justify-between bg-surface/5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-bone uppercase">Viewport: {activeFrame.name}</span>
              <span className="text-[10px] font-mono bg-void/60 text-muted-foreground px-2 py-0.5 rounded-full border border-border/20">
                {activeFrame.width}x{activeFrame.height}
              </span>
            </div>

            {/* Undo / Redo / Zoom Toolbar Controls */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleUndo}
                disabled={history.length === 0}
                className="text-bone disabled:opacity-40 hover:bg-void/40"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="text-bone disabled:opacity-40 hover:bg-void/40"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </Button>

              <div className="h-4 w-px bg-border/20 mx-1" />

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setZoom(Math.max(0.4, zoom - 0.1))}
                className="text-bone hover:bg-void/40"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <span className="text-[10.5px] font-mono text-muted-foreground w-12 text-center select-none">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setZoom(Math.min(1.6, zoom + 0.1))}
                className="text-bone hover:bg-void/40"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  if (activeFrame.preset === "desktop") setZoom(0.6);
                  else if (activeFrame.preset === "tablet") setZoom(0.7);
                  else setZoom(0.9);
                }}
                className="text-bone hover:bg-void/40 text-[10px]"
                title="Fit to Screen"
              >
                Fit
              </Button>

              <div className="h-4 w-px bg-border/20 mx-1" />

              <Button
                variant="outline"
                size="xs"
                onClick={() => setExportOpen(true)}
                className="border-pulse/30 text-pulse hover:bg-pulse/10 gap-1 text-[10px]"
              >
                <FileCode className="w-3 h-3" /> Export Snippet
              </Button>
            </div>
          </div>

          {/* Interactive Workspace Area */}
          <div className="flex-1 overflow-auto p-8 flex items-start justify-center relative">
            
            {/* Snap Alignment Lines Overlay */}
            {snapLines.x !== undefined && (
              <div
                className="absolute border-l border-dashed border-pulse/60 z-30 pointer-events-none"
                style={{
                  left: `${snapLines.x * zoom}px`,
                  top: 0,
                  bottom: 0,
                  transform: `scaleX(1)`,
                  transformOrigin: "left"
                }}
              />
            )}
            {snapLines.y !== undefined && (
              <div
                className="absolute border-t border-dashed border-pulse/60 z-30 pointer-events-none"
                style={{
                  top: `${snapLines.y * zoom}px`,
                  left: 0,
                  right: 0,
                  transform: `scaleY(1)`,
                  transformOrigin: "top"
                }}
              />
            )}

            {/* Simulated Device Frame Container */}
            <div
              className={`rounded-2xl border border-border/40 shadow-2xl bg-surface transition-transform duration-75 origin-top relative`}
              style={{
                width: `${activeFrame.width}px`,
                height: `${activeFrame.height}px`,
                transform: `scale(${zoom})`,
                backgroundImage: isLightMode
                  ? "radial-gradient(#CBD5E1 1px, transparent 1px)"
                  : "radial-gradient(#1E1B4B 1.2px, transparent 1px)",
                backgroundSize: "20px 20px"
              }}
            >
              {/* Traffic Light Bar (Device Chrome Header) */}
              <div className="h-8 border-b border-border/20 bg-void/10 px-3 flex items-center justify-between select-none">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-black/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-black/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-black/10" />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                  Viewport: {activeFrame.preset} Mode
                </span>
                <span className="w-4" />
              </div>

              {/* Placed components rendering canvas */}
              <div
                ref={canvasRef}
                onDragOver={handleDragOverCanvas}
                onDrop={handleDropOnCanvas}
                onMouseDown={handleCanvasPointerDown}
                className="absolute inset-x-0 bottom-0 top-8 overflow-hidden marquee-target"
              >
                {activeFrame.components.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-muted-foreground select-none marquee-target">
                    <LayoutGrid className="w-8 h-8 opacity-45 mb-2 text-pulse marquee-target" />
                    <p className="text-[11px] font-mono uppercase tracking-wider marquee-target">
                      Drop Component Blocks Here
                    </p>
                  </div>
                )}

                {activeFrame.components.map((c) => {
                  const isSelected = selectedIds.has(c.id);

                  return (
                    <div
                      key={c.id}
                      onMouseDown={(e) => handleComponentPointerDown(e, c)}
                      className={`absolute group cursor-move select-none rounded-xl border ${
                        isSelected
                          ? "border-pulse ring-2 ring-pulse/25 z-40 bg-pulse/5"
                          : "border-transparent hover:border-pulse/35 z-20 bg-transparent"
                      }`}
                      style={{
                        left: `${c.x}px`,
                        top: `${c.y}px`,
                        width: `${c.width}px`,
                        height: `${c.height}px`
                      }}
                    >
                      {/* Live Canvas Mock Component */}
                      {renderComponentOnCanvas(c, isLightMode)}

                      {/* Hover action bar (Toolbar overlay) */}
                      {isSelected && (
                        <div
                          className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-void/90 border border-border/40 rounded-xl px-2 py-1 shadow-2xl z-[50]"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleDuplicateComponent(c.id)}
                            className="p-1 rounded text-bone hover:bg-pulse/20 hover:text-pulse"
                            title="Duplicate"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLayerAction(c.id, "front")}
                            className="p-1 rounded text-bone hover:bg-pulse/20 hover:text-pulse"
                            title="Bring to Front"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLayerAction(c.id, "back")}
                            className="p-1 rounded text-bone hover:bg-pulse/20 hover:text-pulse"
                            title="Send to Back"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <div className="w-px h-3 bg-border/40" />
                          <button
                            type="button"
                            onClick={() => handleDeleteComponent(c.id)}
                            className="p-1 rounded text-bone hover:bg-destructive/20 hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Resize handles */}
                      {isSelected && (
                        <>
                          {["n", "s", "e", "w", "nw", "ne", "sw", "se"].map((dir) => {
                            const dirClasses: Record<string, string> = {
                              n: "-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize",
                              s: "-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize",
                              e: "-right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize",
                              w: "-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize",
                              nw: "-top-1.5 -left-1.5 cursor-nwse-resize",
                              ne: "-top-1.5 -right-1.5 cursor-nesw-resize",
                              sw: "-bottom-1.5 -left-1.5 cursor-nesw-resize",
                              se: "-bottom-1.5 -right-1.5 cursor-nwse-resize"
                            };

                            return (
                              <div
                                key={dir}
                                onMouseDown={(e) => handleResizeStart(e, c, dir)}
                                className={`absolute w-3 h-3 bg-pulse border-2 border-surface rounded-full z-40 ${dirClasses[dir]}`}
                              />
                            );
                          })}
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Marquee outline selection visual box */}
                {marqueeBox && (
                  <div
                    className="absolute border border-pulse bg-pulse/10 rounded pointer-events-none z-50"
                    style={{
                      left: `${marqueeBox.x}px`,
                      top: `${marqueeBox.y}px`,
                      width: `${marqueeBox.w}px`,
                      height: `${marqueeBox.h}px`
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Component Library OR Properties Panel */}
        <aside className="w-full md:w-64 border-l border-border/20 bg-void/10 flex flex-col shrink-0">
          
          {/* Header tabs toggle contextual panels */}
          <div className="flex border-b border-border/20 px-2 py-1.5 justify-around bg-void/35">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
              {activeSelectedComponent ? "Block Properties" : "Blocks Library"}
            </span>
            {activeSelectedComponent && (
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-[9px] font-mono uppercase tracking-wider text-pulse hover:text-pulse/80"
              >
                ← Clear Selection
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeSelectedComponent ? (
              // Contextual Component Properties Panel
              <div className="space-y-4 text-scale-xs">
                <div className="border-b border-border/10 pb-2">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Selected Element</span>
                  <p className="font-display font-bold text-bone mt-0.5 uppercase tracking-wide">
                    {COMPONENT_DEFINITIONS[activeSelectedComponent.type].label}
                  </p>
                </div>

                {/* Dimensions Coordinates */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest font-bold">Layout Frame Dimensions</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] text-muted-foreground uppercase">Pos X</label>
                      <Input
                        type="number"
                        value={activeSelectedComponent.x}
                        onChange={(e) => handleCoordinateChange(activeSelectedComponent.id, "x", parseInt(e.target.value) || 0)}
                        className="h-7 text-[10px] bg-void/40 border-border/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-muted-foreground uppercase">Pos Y</label>
                      <Input
                        type="number"
                        value={activeSelectedComponent.y}
                        onChange={(e) => handleCoordinateChange(activeSelectedComponent.id, "y", parseInt(e.target.value) || 0)}
                        className="h-7 text-[10px] bg-void/40 border-border/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-muted-foreground uppercase">Width</label>
                      <Input
                        type="number"
                        value={activeSelectedComponent.width}
                        onChange={(e) => handleCoordinateChange(activeSelectedComponent.id, "width", parseInt(e.target.value) || 0)}
                        className="h-7 text-[10px] bg-void/40 border-border/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-muted-foreground uppercase">Height</label>
                      <Input
                        type="number"
                        value={activeSelectedComponent.height}
                        onChange={(e) => handleCoordinateChange(activeSelectedComponent.id, "height", parseInt(e.target.value) || 0)}
                        className="h-7 text-[10px] bg-void/40 border-border/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Component Properties Config */}
                <div className="space-y-3 pt-2 border-t border-border/10">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest font-bold">Properties Configuration</span>

                  {/* Label Text custom override */}
                  {activeSelectedComponent.props.hasOwnProperty("text") && (
                    <div className="space-y-1">
                      <label className="text-[8px] text-muted-foreground uppercase">Display Label / Text</label>
                      <Input
                        value={activeSelectedComponent.props.text || ""}
                        onChange={(e) => handlePropChange(activeSelectedComponent.id, "text", e.target.value)}
                        className="h-7 text-[10px] bg-void/40 border-border/30 text-bone"
                      />
                    </div>
                  )}

                  {/* Placeholder text for forms */}
                  {activeSelectedComponent.props.hasOwnProperty("placeholder") && (
                    <div className="space-y-1">
                      <label className="text-[8px] text-muted-foreground uppercase">Input Placeholder</label>
                      <Input
                        value={activeSelectedComponent.props.placeholder || ""}
                        onChange={(e) => handlePropChange(activeSelectedComponent.id, "placeholder", e.target.value)}
                        className="h-7 text-[10px] bg-void/40 border-border/30 text-bone"
                      />
                    </div>
                  )}

                  {/* Form Label Text override */}
                  {activeSelectedComponent.props.hasOwnProperty("labelText") && (
                    <div className="space-y-1">
                      <label className="text-[8px] text-muted-foreground uppercase">Field Title / Label</label>
                      <Input
                        value={activeSelectedComponent.props.labelText || ""}
                        onChange={(e) => handlePropChange(activeSelectedComponent.id, "labelText", e.target.value)}
                        className="h-7 text-[10px] bg-void/40 border-border/30 text-bone"
                      />
                    </div>
                  )}

                  {/* Accent Color Picker swatch */}
                  {activeSelectedComponent.props.hasOwnProperty("accent") && (
                    <div className="space-y-1.5">
                      <label className="text-[8px] text-muted-foreground uppercase">Accent Color Swatch</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={activeSelectedComponent.props.accent || "#7C3AED"}
                          onChange={(e) => handlePropChange(activeSelectedComponent.id, "accent", e.target.value)}
                          className="w-7 h-7 rounded border border-border/30 bg-transparent cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-bone">{activeSelectedComponent.props.accent}</span>
                      </div>
                    </div>
                  )}

                  {/* Checkbox checks */}
                  {activeSelectedComponent.props.hasOwnProperty("checked") && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeSelectedComponent.props.checked}
                        onChange={(e) => handlePropChange(activeSelectedComponent.id, "checked", e.target.checked)}
                        className="rounded border-border/30 accent-pulse w-3.5 h-3.5 bg-transparent"
                      />
                      <label className="text-[9px] text-muted-foreground uppercase font-bold">Default Checked</label>
                    </div>
                  )}

                  {/* Toggle switches */}
                  {activeSelectedComponent.props.hasOwnProperty("active") && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeSelectedComponent.props.active}
                        onChange={(e) => handlePropChange(activeSelectedComponent.id, "active", e.target.checked)}
                        className="rounded border-border/30 accent-pulse w-3.5 h-3.5 bg-transparent"
                      />
                      <label className="text-[9px] text-muted-foreground uppercase font-bold">Default Active State</label>
                    </div>
                  )}

                  {/* Heading Size selection override */}
                  {activeSelectedComponent.type === "heading" && (
                    <div className="space-y-1">
                      <label className="text-[8px] text-muted-foreground uppercase">Heading Size Variant</label>
                      <select
                        value={activeSelectedComponent.props.size || "lg"}
                        onChange={(e) => handlePropChange(activeSelectedComponent.id, "size", e.target.value)}
                        className="flex w-full rounded border border-border/40 bg-void/50 text-bone px-2 h-7 text-[10px] focus:outline-none"
                      >
                        <option value="sm">Small H3 (14px)</option>
                        <option value="md">Medium H2 (18px)</option>
                        <option value="lg">Large H1 (24px)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Searchable Drag-and-Drop blocks panel list
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-void/50 border border-border/40 p-1.5 rounded-lg w-full relative">
                  <Search className="w-3.5 h-3.5 text-muted-foreground pl-0.5 shrink-0" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search UI blocks..."
                    className="bg-transparent border-0 h-5 p-0 text-[10px] focus-visible:ring-0 focus-visible:ring-offset-0 text-bone placeholder:text-muted-foreground/60"
                  />
                </div>

                <div className="space-y-3.5 pr-0.5">
                  {CATEGORIES.map((category) => {
                    const items = filteredDefinitions.filter((def) => def.category === category);
                    if (items.length === 0) return null;

                    const isCollapsed = collapsedCategories[category];

                    return (
                      <div key={category} className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => setCollapsedCategories({ ...collapsedCategories, [category]: !isCollapsed })}
                          className="flex items-center justify-between w-full text-[9px] font-mono text-muted-foreground/80 uppercase tracking-widest font-black"
                        >
                          <span>{category} Blocks ({items.length})</span>
                          {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                        </button>

                        {!isCollapsed && (
                          <div className="grid grid-cols-2 gap-2">
                            {items.map((def) => (
                              <div
                                key={def.type}
                                draggable
                                onDragStart={(e) => handleDragStartFromLibrary(e, def.type)}
                                className="group relative border border-border/40 hover:border-pulse/35 bg-surface/40 hover:bg-surface rounded-xl p-2 cursor-grab flex flex-col items-center justify-between text-center select-none shadow-sm min-h-[65px]"
                                title="Drag over canvas to place"
                              >
                                <div className="flex-1 w-full flex items-center justify-center py-1">
                                  {renderThumbnail(def.type)}
                                </div>
                                <span className="text-[9px] font-sans font-medium text-muted-foreground group-hover:text-bone mt-1 truncate w-full">
                                  {def.label}
                                </span>

                                {/* Quick-add hover trigger */}
                                <button
                                  type="button"
                                  onClick={() => handleQuickAdd(def.type)}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-pulse hover:bg-pulse/90 text-void p-0.5 rounded shadow"
                                  title="Add to canvas center"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* AI Brief Assist FAB Drawer */}
        <button
          type="button"
          onClick={() => setAiAssistOpen((v) => !v)}
          className="fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full bg-surface border border-pulse/45 text-pulse shadow-xl shadow-pulse/25 flex items-center justify-center hover:bg-pulse/10 transition-colors"
          aria-label="Generate layout brief with AI"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {aiAssistOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="fixed bottom-40 right-6 z-50 w-[min(100vw-2rem,320px)] rounded-2xl border border-border/40 bg-surface shadow-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-border/20 pb-1.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-black flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pulse" /> AI Layout Synth Assist
                </span>
                <button type="button" onClick={() => setAiAssistOpen(false)} className="text-muted-foreground hover:text-bone">
                  ✕
                </button>
              </div>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
                placeholder="e.g. 'a registration login form wireframe' or 'a dashboard layout grid with navigation table'"
                className="w-full rounded-xl border border-border/40 bg-void/50 text-bone px-3 py-2 text-scale-xs focus:outline-none focus:ring-1 focus:ring-pulse resize-none font-sans"
              />
              <div className="flex justify-end gap-2 text-scale-xs">
                <Button type="button" variant="ghost" size="xs" onClick={() => setAiAssistOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" size="xs" className="bg-pulse text-void font-bold" onClick={handleAiAssistGenerate}>
                  Apply Layout
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Preset Frame Setup Dialog */}
        <AnimatePresence>
          {addFrameOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/70 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm rounded-2xl border border-border/40 bg-surface shadow-2xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border/10 pb-2">
                  <span className="font-display font-bold text-bone text-scale-base">Create Preset UI Frame</span>
                  <button type="button" onClick={() => setAddFrameOpen(false)} className="text-muted-foreground hover:text-bone">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-scale-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">Frame Name</label>
                    <Input
                      value={newFrameName}
                      onChange={(e) => setNewFrameName(e.target.value)}
                      placeholder="e.g. Checkout page, Settings panel..."
                      className="bg-void/50 border-border/40 text-bone"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">Device Form Factor</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "desktop", label: "Desktop", icon: Monitor },
                        { id: "tablet", label: "Tablet", icon: TabletIcon },
                        { id: "mobile", label: "Mobile", icon: Smartphone },
                        { id: "custom", label: "Custom", icon: Maximize }
                      ].map((preset) => {
                        const Icon = preset.icon;
                        const isSel = preset.id === newFramePreset;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setNewFramePreset(preset.id as any)}
                            className={`p-2 border rounded-xl flex flex-col items-center gap-1.5 transition-all text-center ${
                              isSel ? "border-pulse bg-pulse/10 text-pulse font-bold" : "border-border/30 text-muted-foreground"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[9px] uppercase tracking-wider">{preset.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {newFramePreset === "custom" && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[9px] text-muted-foreground uppercase">Width (px)</label>
                        <Input
                          type="number"
                          value={newFrameWidth}
                          onChange={(e) => setNewFrameWidth(parseInt(e.target.value) || 800)}
                          className="bg-void/50 border-border/30"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-muted-foreground uppercase">Height (px)</label>
                        <Input
                          type="number"
                          value={newFrameHeight}
                          onChange={(e) => setNewFrameHeight(parseInt(e.target.value) || 600)}
                          className="bg-void/50 border-border/30"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 text-scale-xs">
                  <Button variant="ghost" size="sm" onClick={() => setAddFrameOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-pulse text-void font-bold"
                    onClick={handleCreateFrame}
                    disabled={!newFrameName.trim()}
                  >
                    Create Frame
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Export Handoff Snippet */}
        <AnimatePresence>
          {exportOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/75 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl rounded-2xl border border-border/40 bg-surface shadow-2xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border/10 pb-2">
                  <div>
                    <span className="font-display font-bold text-bone text-scale-base">Export UI Layout Schema</span>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase mt-0.5">
                      Exporting layout specifications for &quot;{activeFrame.name}&quot;
                    </p>
                  </div>
                  <button type="button" onClick={() => setExportOpen(false)} className="text-muted-foreground hover:text-bone">
                    ✕
                  </button>
                </div>

                <div className="flex gap-2 border-b border-border/10 pb-2">
                  <button
                    type="button"
                    onClick={() => setExportType("json")}
                    className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-wider border transition-colors ${
                      exportType === "json" ? "bg-pulse/15 border-pulse text-pulse" : "border-border/30 text-muted-foreground"
                    }`}
                  >
                    JSON Layout Schema
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportType("react")}
                    className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-wider border transition-colors ${
                      exportType === "react" ? "bg-pulse/15 border-pulse text-pulse" : "border-border/30 text-muted-foreground"
                    }`}
                  >
                    React Wireframe Snippet
                  </button>
                </div>

                <div className="max-h-[300px] overflow-y-auto bg-void/80 border border-border/40 rounded-xl p-3.5">
                  <pre className="text-[10.5px] font-mono text-bone leading-relaxed whitespace-pre-wrap select-text">
                    {exportType === "json"
                      ? JSON.stringify({ frame: activeFrame }, null, 2)
                      : getGeneratedReactCode(activeFrame)}
                  </pre>
                </div>

                <div className="flex justify-between items-center text-scale-xs pt-2 border-t border-border/10">
                  <button
                    type="button"
                    onClick={() => {
                      const data =
                        exportType === "json"
                          ? JSON.stringify({ frame: activeFrame }, null, 2)
                          : getGeneratedReactCode(activeFrame);
                      navigator.clipboard.writeText(data);
                      toast.success("Copied specifications snippet to clipboard");
                    }}
                    className="px-4 h-8 bg-pulse hover:bg-pulse/90 text-void font-bold rounded-lg flex items-center gap-1.5"
                  >
                    Copy to Clipboard
                  </button>
                  <Button variant="ghost" size="sm" onClick={() => setExportOpen(false)}>
                    Close
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
      )}
    </BuilderShell>
  );
}
