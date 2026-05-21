# [FEATURE] Interactive Learning Path Builder & Custom Roadmap Creator with Visual Node Graph

## Problem Statement
NexaSphere provides curated step-by-step learning roadmaps (Web Development, AI/ML, Android, etc.) which are fantastic resources for the community. However, learning is non-linear and highly personal. Users currently cannot:
1. Customize existing roadmaps to fit their own pace or interests.
2. Build new personalized learning paths from scratch.
3. Visually track progress interactively (marking nodes as "In Progress", "Completed", or "Stuck") with custom notes.
4. Export their personalized plans or share them with others.

By introducing an **Interactive Visual Learning Path Builder**, we can empower students and developers to design, track, and export customized learning paths. This feature would significantly elevate NexaSphere's educational value, transforming it from a static resource hub into an active learning workspace.

---

## Proposed Solution
An advanced, highly interactive workspace integrated directly into the `Roadmaps` page:
1. **Interactive Path Builder Canvas**:
   - A drag-and-drop or click-to-connect node canvas where users can add nodes (topics), define connections (prerequisites), and input resources (links, tutorials, descriptions).
   - Use simple SVGs or canvas rendering for smooth glowing connections matching NexaSphere's glassmorphic aesthetic.
2. **Path Customization & State Management**:
   - Ability to load an existing NexaSphere roadmap (e.g., Frontend Web Dev) directly into the builder canvas to customize it (add, delete, or re-order nodes).
   - Status tracking for each node: `Not Started` (default), `In Progress` (glowing amber), `Completed` (glowing emerald), `Stuck` (glowing ruby).
   - Node-level persistent quick notes/todos.
3. **Import/Export Utility**:
   - Export custom roadmaps as `.json` files to save locally.
   - Import a previously saved custom roadmap `.json` file to restore the interactive workspace instantly.
   - Export visual roadmap representation as an Image (`.png` / `.svg`) for easy sharing on social platforms (LinkedIn, Twitter) or printing.
4. **Local Persistence**:
   - Autosave progress and current active canvas state to `localStorage` so users never lose their work across page reloads.

---

## Technical Specifications & UX Design
- **Aesthetic**: Full glassmorphism, dynamic Framer Motion animations for node expansion/modal popups, glowing gradient connection lines, and CSS-variable powered dark/light mode compatibility.
- **Accessibility**: Full keyboard accessibility (Tab navigation between nodes, ESC to close modals, ARIA labels for screen readers).
- **Structure**:
  - `components/roadmaps/RoadmapBuilder.tsx` (Main workspace wrapper)
  - `components/roadmaps/NodeCanvas.tsx` (SVG/Canvas rendering area for connections)
  - `components/roadmaps/NodeModal.tsx` (Form for adding/editing node metadata, resources, and status)
  - `utils/roadmapParser.ts` (JSON validation, export, and image rendering utility)
- **Zero Heavy External Dependencies**: Pure React state, simple dynamic SVG lines, and HTML Canvas for image exporting to keep performance optimal and the bundle size light.

---

## Suggested Labels
- `level:advanced` / `level:critical`
- `type:feature`
- `type:design`
- `type:accessibility`
- `gssoc:approved`
