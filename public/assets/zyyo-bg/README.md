# Zyyo background reference

Extracted from https://zyyo.cc/ for frontend UI redesign reference.

Zyyo does not use a bitmap background image for the page background. It uses CSS gradients and theme variables:

- Light: `linear-gradient(50deg, #a2d1ff, #ffffff)`
- Dark: `linear-gradient(50deg, #1f2327, #000000)` via `html[data-theme="Dark"]`

Files:
- `zyyo-light.css`
- `zyyo-dark.css`
- `zyyo-theme-reference.css` original relevant merged snippets
