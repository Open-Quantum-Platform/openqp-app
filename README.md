# OpenQP Web

Frontend for `app.openqp.org`.

Baseline behavior:

- browser-only OpenQP input and XYZ file generation
- downloadable `.inp` and `.xyz` files without login
- local run commands and OS-specific run scripts without registration
- local run scripts for macOS/Linux shell, Windows PowerShell, and Windows
  Command Prompt
- local 3D structure/data inspection in the browser
- no cloud execution, browser-exposed credentials, or API keys

Pages:

- `/` is the prompt-first launcher. Users can describe the input in plain text,
  or choose one workflow example and view its details before opening the
  builder. It includes a passive 3D molecule demo, without exposing detailed
  workflow controls on the first page.
- `/workflow.html` is the focused input builder. It integrates generator
  controls, PubChem import, local data import, 3D structure controls,
  downloadable `.inp`/`.xyz` files, and cross-platform local run scripts.
- `/analysis.html` is the local post-run inspection page for OpenQP log/out,
  XYZ, JSON, Molden geometry, and cube geometry files.

The only external tool fallback kept in the UI is OpenqpView for true
cube/Molden isosurface rendering.

The GitHub Pages deployment should serve the contents of this directory at the
root of `app.openqp.org`.
