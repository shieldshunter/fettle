# ⚙️ Fettle Web Platform

This internal toolset supports engineering workflows, machine servicing, and BOM (Bill of Materials) generation — all built using custom Web Components, TailwindCSS, and modular TypeScript.

---

## 🔍 Project Purpose

Fettle’s platform combines field support, mechanical design visualization, and eventual predictive service logic into a unified web app designed for engineers, service techs, and operations teams.

---

## 🧩 Modules

###  `LogoPage`
> A visual playground to experiment with SVG animations.

- Pulse animations (single or grouped)
- Color flow/rotation
- Outward directional group transformations
- Click-to-replay functionality
- Responsive grid layout
- Built to support branding, UI loading states, or teaching animations

---

###  `TreeBOMPage`
> An interactive part tree + import panel for engineering BOM workflows.

- Drag-and-drop part entry (`drop-zone.ts`)
- Expandable/collapsible hierarchical BOM trees
- Integration point for part metadata, source tracking, or sub-assembly data
- Ready to evolve into a live part planning tool

---

###  `ClusterPage` *(WIP — coming soon)*
> A planned AI-powered analytics module.

- Designed to cluster machine models by telemetry, service issues, or common part families
- Will assist in predictive diagnostics, parts stocking, or preventative maintenance modeling
- Can ingest field service reports, BOM records, and historical failures

---

###  Authentication
> Magic link login for secure passwordless entry.

- Managed via `login-dialog.ts`
- Responsive, dark-mode aware
- Integrates session state via `auth.ts` utility
- Local storage persists dark mode and session state

---

##  UI Styling

- Built with **TailwindCSS**
- Global color variables & themes in `styles.css`
- Dynamic wave backgrounds for visual identity
- Smooth transitions, animation layering, and responsive layouts

---

## 🗂 Project Structure

