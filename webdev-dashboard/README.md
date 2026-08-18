# Site Builder Dashboard — MaVionix Unified Platform

An AI-powered website builder and management dashboard module, built as a companion to the MaVionix platform's Lead CRM module.

## Stack
- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- Motion (Framer Motion successor) for canvas and UI animation
- lucide-react for icons

## Structure
```
src/
  components/product/modules/
    SiteBuilderWorkspace.tsx      # shell: sidebar, header, tab routing
    tabs/
      DashboardTab.tsx            # overview: sites, usage, AI activity, leads
      EditorTab.tsx                # visual canvas + drag/drop panels
      PagesTab.tsx                 # page manager
      ComponentsTab.tsx            # section/block library
      MediaTab.tsx                 # asset manager
      ThemeTab.tsx                  # style system + brand kit
      AiToolsTab.tsx                # AI generation tools
      AnalyticsTab.tsx              # traffic & conversions
      PublishTab.tsx                 # domains, staging, export
      SettingsTab.tsx                 # global/page settings
  data/siteBuilderMockData.ts      # all mock data for the module
```

## State management
Tab navigation is local `useState` in the workspace shell. As the canvas grows (undo/redo history, DOM tree, drag state) this is the natural place to introduce Zustand — a single store per open site, persisted per project id, with the DOM tree as the source of truth for the canvas.

## Setup
```
npm install
npm run dev
```

## Notes
- No backend calls are made; every screen is backed by static mock data in `siteBuilderMockData.ts`.
- Built as a standalone module intended to sit inside the MaVionix Unified Platform shell, matching the visual language of the existing Lead CRM module (purple/violet brand gradient, Inter typeface, card-based layout).
