# Project guide

## Scope and behavior

Gargantua is a single-page visual experience, inspired by the black hole in *Interstellar*. It prioritizes visual quality and camera interaction. It is an artistic approximation, not a numerical Kerr spacetime simulation. There are no accounts, backend services, databases, or persistence.

The accretion disk spans 2.65–10 scene units. Units are illustrative; no physical mass or real elapsed-time conversion is implied. Plasma animation runs at a fixed speed; automatic camera orbit has its own speed. Switch off auto orbit to stop automatic camera movement. There is no time-flow slider.

Camera distance is constrained to 13–38 units. Camera presets smoothly transition between cinematic, edge-on, and above views. Dragging cancels a transition. The UI consists of the Gargantua title with a compact factual introduction, a minimizable settings panel, and a help button. The introduction identifies the object as fictional and links to an excerpt of Kip Thorne’s The Science of Interstellar for its 100-million-solar-mass and near-maximum-spin descriptions. These are facts about the film’s object, not parameters measured by this visualization. On mobile, expanding the settings temporarily hides the introduction to prevent overlap. Branding, promotional copy, playback toolbar, elapsed time, observer distance, and photon-ring labels are omitted. The tab title is simply Gargantua.

Reduced-motion users get static plasma and automatic orbit disabled. They can enable automatic camera orbit with its switch. On narrow screens the settings panel starts collapsed. Click its heading or press H to minimize/expand it. All sliders and switches are labeled; controls can be reached by keyboard. The help dialog contains only orbit, zoom, and minimize/expand instructions.

## Architecture and style

- `src/main.js`: UI bindings, playback clock, keyboard controls, responsive panel, initialization/error handling, and animation lifecycle.
- `src/scene.js`: Three.js renderer, orbital camera, deterministic star texture, fullscreen shader, bloom, tone mapping, and resource disposal.
- `src/blackhole.glsl`: per-pixel curved-ray integration, disk intersections, procedural rotating plasma, photon-ring accent, and background sampling.
- `src/style.css`: layout, color/type tokens, responsive behavior, focus states, and reduced-motion styles.
- `index.html`: accessible static interface and metadata.

The shader integrates a Schwarzschild-inspired central acceleration with adaptive steps and a finite iteration budget. Disk crossings emit light, while background stars are sampled using the ray's final direction. The narrow photon-ring accent and disk emission are artistic treatments. Finite steps, an infinitesimally thin emitting surface, and approximate gravity introduce deviations from physical black-hole images, especially at extreme viewing angles.

Three.js `OrbitControls` drives a perspective camera whose transform is supplied to the shader. The visible scene is a fullscreen quad, followed by `UnrealBloomPass` and `OutputPass`. All imagery is generated locally; no downloaded images or models are required. DM Sans and Manrope are bundled locally through Fontsource, with system sans-serif fallbacks. JavaScript modules use named functions, `const` by default, and two-space indentation. There is no configured formatter or linter.

Official references: [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html), [ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html).

## Development and checks

Run commands from this repository directory. Dependencies are locked in `package-lock.json`.

```sh
npm ci
npm run dev -- --port 5173 --strictPort
npm run build
npm run preview -- --port 4173 --strictPort
npm audit
```

The development and preview servers bind to loopback. Use a different explicit port for a concurrent checkout. Production output is `dist/`; local generation does not publish or deploy it. The bundle includes the Three.js renderer and postprocessing, so Vite may report a chunk-size advisory. That advisory does not indicate a failed build.

Browser regression checks require Playwright's Chromium installation and a running local server:

```sh
npx playwright install chromium
node scripts/check-browser.mjs
# To check a running production preview instead:
APP_URL=http://127.0.0.1:4173 node scripts/check-browser.mjs
```

The browser script verifies WebGL initialization, simplified interface, settings minimization, control values, switches, preset selection, controls-only help, keyboard camera controls, mouse orbit, mobile overflow, and initial reduced-motion behavior. It saves desktop, above-view, mobile, and mobile-control screenshots under ignored `test-results/`. Inspect those images for visual quality. These checks do not establish physical accuracy or performance on every GPU. WebGL compilation/context errors show a recovery screen. Hardware acceleration is recommended.

## Security, operations, and workflow

No secrets or personal data are needed. The app sends no messages, makes no API calls, and bundles its fonts locally; no third-party runtime network requests are needed. Host the generated static assets using an owner-selected deployment process. Deployment is outside the local build workflow.

Read the applicable user/workspace instructions before making changes. Use focused feature branches and repository-owned `.worktrees/<task>` only when isolation is useful. Preserve existing work. No remote, production branch, release process, or mandatory commit prefix is configured by this project. Use focused descriptive commits when a commit is requested.

Review shader changes using rendered screenshots, browser console output, and controls from more than one camera angle. Review interaction changes with keyboard and mobile viewport checks. Use frontend-design and webapp-testing skills where useful, with proportionate implementation and validation; independent work can be delegated when it benefits the task. Changes to behavior or setup must update this guide. See [documentation standard](documentation-standard.md).
