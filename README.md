# OpenQP Web Phase 1

Static app for `app.openqp.org`.

Phase 1 boundaries:

- no backend compute
- no user login
- no browser API keys
- no OpenQP jobs submitted online
- browser-only OpenQP input and XYZ file generation

Pages:

- `/` is the simple workflow launcher.
- `/workflow.html` is the focused input builder. It integrates the Phase 1
  generator controls, PubChem import, local data import, 3D structure controls,
  and downloadable `.inp`/`.xyz` files.
- `/analysis.html` is the local post-run inspection page for OpenQP log/out,
  XYZ, JSON, Molden geometry, and cube geometry files.

The only external tool fallback kept in the UI is OpenqpView for true
cube/Molden isosurface rendering.

The GitHub Pages deployment should serve the contents of this directory at the
root of `app.openqp.org`.
