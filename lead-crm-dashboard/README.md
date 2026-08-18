# Lead CRM Dashboard

Standalone React + Vite + TypeScript + Tailwind v4 app for the AI Lead CRM module.

## Run it
npm install
npm run dev

## Structure
- src/components/product/modules/LeadCrmWorkspace.tsx — shell: sidebar, mobile nav, header, tab router
- src/components/product/modules/tabs/ — Dashboard, Leads, AI Assistant, Automation, Analytics
- src/data/leadCrmMockData.ts — mock data used across the tabs
- src/App.tsx — mounts the workspace; wire onViewChange to your router when embedding

## Notes
- Fully responsive: desktop shows a fixed left sidebar; mobile/tablet uses the dropdown nav button in the header.
- No build/typecheck was run on this export.
