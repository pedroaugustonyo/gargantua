# Initial local validation — 2026-10-11

Configuration: macOS arm64, Node.js 26.7.0, npm 11.19.0, Vite 7.3.7, Three.js 0.180.0, Playwright 1.64.0 with headless Chromium 156.0.8078.4. Fresh standalone directory, without a Git revision. Development server: loopback `127.0.0.1:5173`, strict port. No remote services or database.

Source identities (SHA-256):

```text
439f5d933f835abb66ba346737946e1626a46d03c5fce9cbf69838aef257f76a  src/main.js
2b7f79401932a48e8212ca516d69a818fdee53ed0f84472bc0076df350810863  src/scene.js
a600c237e08d344accd44d5cf0bd34164320d7bb723acfd18ba3c452d629548b  src/blackhole.glsl
255797dcf1386694f18c0bd90e69a139f964e6b5126b246df35f079798fa4302  src/style.css
ae784d4f6bff70a815e322a8e04520f2a3c3416f443f3cb4f7d5760a98b712e4  package-lock.json
```

- `npm run build`: passed after final shader refinement. Vite reported its advisory for the 520 kB renderer bundle (131 kB gzip).
- `npm audit`: passed, zero known vulnerabilities at execution time.
- `node scripts/check-browser.mjs`: passed on final source. Verified WebGL initialization without JS/rendering errors, pause, luminosity output, star switch interaction, camera preset selection, reset, hide/restore interface, information dialog, keyboard zoom, mouse orbit, mobile layout, and reduced-motion defaults.
- `curl -I http://127.0.0.1:5173`: HTTP 200.
- Desktop and mobile screenshots were inspected. Glow was reduced and radial disk opacity was smoothed after initial inspection; the final desktop image was inspected again. Generated screenshots are under ignored `test-results/`.

Limits: Chrome desktop emulation only; no physical mobile-device, Safari, Firefox, exhaustive accessibility, GPU benchmark, scientific-accuracy, or deployed-production acceptance. The app was built but not published. Fonts are self-hosted. Documentation assessment completed through the README, canonical project guide, and documentation standard.
