# AGENTS.md — frog-rubik-cube

## Project overview
Static HTML5 rubik's cube simulator with a Two-Phase algorithm solver. No build step, no npm, no server — just open `index.html` locally.

## Architecture

```
index.html          — single-page app (HTML + inline scripts + CSS refs)
css/
  index.css         — dark glassmorphism theme, flex layout, button system
  colorcube.css     — 2D facelet panel styles (colored stickers grid)
js/
  threejs/          — vendored Three.js r138 (DO NOT MODIFY)
    three.min.js    — UMD build: creates window.THREE
    jsm/controls/OrbitControls-global.js — UMD build: adds THREE.OrbitControls
  translater.js     — IIFE, exports window.trans.translate(key, lang)
  cube-lexer.js     — IIFE, exports window.lexer.parse(cmdStr, errorCb)
  twophase.js       — IIFE, exports window.twoPhase.solve(cubeStatus)
  ruuubik.js        — IIFE, exports window.frog (init/render/doAction/getFaceColor/…)
```

## Critical: IIFE isolation

All 4 app JS files (`translater.js`, `cube-lexer.js`, `twophase.js`, `ruuubik.js`) are wrapped in `(function(){ ... })()`. This is **essential** because `twophase.js` and `ruuubik.js` both define an `init()` function. Without IIFEs, `ruuubik.init()` clobbers `twophase.init()`, causing `solve()` to call the wrong init with no arguments → `parentDom` is `undefined` → crash.

When adding new scripts, use the same IIFE pattern.

## Script load order (must be exact)

1. `js/threejs/three.min.js` → `window.THREE`
2. `js/threejs/jsm/controls/OrbitControls-global.js` → `THREE.OrbitControls`
3. `js/translater.js` → `window.trans`
4. `js/cube-lexer.js` → `window.lexer`
5. `js/twophase.js` → `window.twoPhase`
6. `js/ruuubik.js` → `window.frog`
7. Inline `<script>` (in `index.html`) — uses all above

All scripts are plain `<script src="...">` tags at the **end** of `<body>` to ensure DOM readiness.

## Initialization

The inline script calls `setTimeout(startApp, 0)` at the end. Inside `startApp()`:
- Guards with `if(!document.body){ requestAnimationFrame(startApp); return; }`
- Calls `frog.init(document.body, isDebug)` → mounts 3D canvas into `<body>`
- Then sets up UI event handlers and solver integration

Do **not** use `window.onload` or `DOMContentLoaded` — they interfere with the existing init sequence.

## Three.js constraints

- **Version**: r138 (matches `js/threejs/three.module.js` line 6: `REVISION = '138'`)
- **Vendored files in `js/threejs/`**: never modify any file under this directory
- **Must use UMD builds** (not ES modules): `file://` protocol blocks both `<script type="module">` imports and XHR-based loaders. Only plain `<script src="...">` tags work.

## Two-phase solver API

```js
// cubeStatus: flat array of 54 color indices (6 faces × 9 stickers)
//   faces order: U, R, F, D, L, B (matching FACES array in index.html:440)
//   each face read top-to-bottom, left-to-right (index 0-8)
//   color index 0-5 maps to face centers:
//     U=0(yellow), R=1(red), F=2(blue), D=3(white), L=4(orange), B=5(green)
// Returns: array of move strings like ["U", "R'", "F2", ...]
// Returns null/empty if cube is unsolvable or already solved
window.twoPhase.solve(cubeStatus)
```

The inline script builds `cubeStatus` by reading `frog.getFaceColor(face, 1..9)` for each face, then mapping colors → indices via `colorMap` (keyed by center sticker color).

## Key globals

| Global | Source | API |
|---|---|---|
| `window.THREE` | `three.min.js` | Three.js namespace |
| `THREE.OrbitControls` | `OrbitControls-global.js` | Camera orbit controls |
| `window.frog` | `ruuubik.js` | `init(dom, debug)`, `doAction(move)`, `getFaceColor(face, pos)`, `scramble(basic)`, `applyColorMap(map, failCb, okCb)`, `resize()`, `reset()`, `back()`, `rebase()`, `addActionDoneCallback(cb)` |
| `window.twoPhase` | `twophase.js` | `solve(cubeStatus)` |
| `window.lexer` | `cube-lexer.js` | `parse(cmdStr, errorCb)` returns move array |
| `window.trans` | `translater.js` | `translate(key, lang)` where lang is `'zh'` or `'en'` |

## UI conventions

- Dark theme (`#1a1a2e` → `#16213e` → `#0f3460` gradient), glassmorphism panels with `backdrop-filter: blur()`
- 2D color panel: 9 per face, uses `cube` CSS class, color editing via ctrl+click
- Bottom control panel uses `flex` layout (was `inline-block`, which caused overflow)
- SVG icons in `img/` (pen, error, right, eye, etc.)
