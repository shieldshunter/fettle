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

## 🧠 Future Vision

- [ ] Predictive diagnostics powered by cluster machine learning
- [ ] Live BOM editing tied to manufacturing data
- [ ] Role-based views for engineers, service techs, and operators
- [ ] Report generation & export to ERP systems

---

## 📦 Dev Notes

- Web Components used over frameworks for full control and reusability
- State, transitions, and events handled via `CustomEvent`s
- Modular pages load dynamically via `slideTransition()`
- SSO & dark mode built with user preference persistence

## 🌍 Environment Configuration

This project supports different API endpoints for development and production environments:

### Development (localhost)
- API Base URL: `http://localhost:3000/api`
- Used when running `npm run dev`
- Environment file: `.env.development`

### Production (Vercel/Render)
- API Base URL: `https://trebro-api.onrender.com/api`
- Used when running `npm run build`
- Environment file: `.env.production`

### Setup Instructions

1. **Development Environment:**
   ```bash
   # Copy the development environment template
   cp .env.development .env.local
   
   # Edit .env.local with your actual API keys
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_JB2_CLIENT_ID=your_jb2_client_id_here
   VITE_JB2_CLIENT_SECRET=your_jb2_client_secret_here
   VITE_ASSISTANT_ID=your_assistant_id_here
   ```

2. **Production Environment:**
   ```bash
   # For Vercel deployment, set these environment variables in your Vercel dashboard:
   VITE_API_BASE_URL=https://trebro-api.onrender.com/api
   VITE_OPENAI_API_KEY=your_production_openai_key
   VITE_JB2_CLIENT_ID=your_production_jb2_client_id
   VITE_JB2_CLIENT_SECRET=your_production_jb2_client_secret
   VITE_ASSISTANT_ID=your_production_assistant_id
   ```

3. **Running the Application:**
   ```bash
   # Development mode (uses localhost:3000)
   npm run dev
   
   # Production build (uses trebro-api.onrender.com)
   npm run build
   ```

### Environment Variables

- `VITE_API_BASE_URL`: The base URL for API calls
- `VITE_OPENAI_API_KEY`: OpenAI API key for AI features
- `VITE_JB2_CLIENT_ID`: JobBoss2 client ID
- `VITE_JB2_CLIENT_SECRET`: JobBoss2 client secret
- `VITE_ASSISTANT_ID`: OpenAI assistant ID for cluster features

