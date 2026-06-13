import * as THREE from "../vendor/three.module.min.js";

const molecules = {
  water: {
    label: "Water",
    xyz: `3
water
O    0.000000    0.000000    0.000000
H    0.758602    0.000000    0.504284
H   -0.758602    0.000000    0.504284`
  },
  formaldehyde: {
    label: "Formaldehyde",
    xyz: `4
formaldehyde
C    0.000000    0.000000    0.000000
O    0.000000    0.000000    1.205000
H    0.934000    0.000000   -0.588000
H   -0.934000    0.000000   -0.588000`
  },
  ethylene: {
    label: "Ethylene",
    xyz: `6
ethylene
C   -0.669500    0.000000    0.000000
C    0.669500    0.000000    0.000000
H   -1.232100    0.928900    0.000000
H   -1.232100   -0.928900    0.000000
H    1.232100    0.928900    0.000000
H    1.232100   -0.928900    0.000000`
  }
};

const workflows = [
  {
    id: "single-point",
    title: "Ground-state single point",
    detail: "Small RHF/DFT starter for local OpenQP runs.",
    jobName: "water_hf_sp",
    runtype: "energy",
    method: "HF",
    basis: "STO-3G",
    molecule: "water",
    states: 0
  },
  {
    id: "optimize",
    title: "Geometry optimization",
    detail: "Editable optimization template for a closed-shell molecule.",
    jobName: "formaldehyde_b3lyp_opt",
    runtype: "optimize",
    method: "B3LYP",
    basis: "6-31G*",
    molecule: "formaldehyde",
    states: 0
  },
  {
    id: "tddft",
    title: "TDDFT absorption",
    detail: "Excited-state starter with a visible states block.",
    jobName: "ethylene_tddft_abs",
    runtype: "tddft",
    method: "PBE0",
    basis: "cc-pVDZ",
    molecule: "ethylene",
    states: 5
  },
  {
    id: "mrsf",
    title: "MRSF-TDDFT starter",
    detail: "Prepared as a reviewable template, not an online run.",
    jobName: "ethylene_mrsf_starter",
    runtype: "mrsf_tddft",
    method: "MRSF-TDDFT",
    basis: "cc-pVDZ",
    molecule: "ethylene",
    states: 4
  }
];

const state = {
  workflow: workflows[0]
};

const workflowList = document.querySelector("#workflowList");
const moleculeSelect = document.querySelector("#molecule");
const form = document.querySelector("#inputForm");
const preview = document.querySelector("#preview");
const jobName = document.querySelector("#jobName");
const charge = document.querySelector("#charge");
const multiplicity = document.querySelector("#multiplicity");
const method = document.querySelector("#method");
const basis = document.querySelector("#basis");
const conv = document.querySelector("#conv");
const notes = document.querySelector("#notes");
const moleculeLabel = document.querySelector("#moleculeLabel");
const moleculeCanvas = document.querySelector("#moleculeCanvas");
const moleculeFallback = document.querySelector("#moleculeFallback");

let renderer;
let scene;
let camera;
let moleculeRoot;
let lastMoleculeKey = "";
let fallbackMode = false;
let dragging = false;
let lastPointer = { x: 0, y: 0 };

const atomStyles = {
  H: { color: 0xf4f7fb, radius: 0.22, covalent: 0.31 },
  C: { color: 0x404a55, radius: 0.34, covalent: 0.76 },
  O: { color: 0xd84c3f, radius: 0.36, covalent: 0.66 },
  N: { color: 0x2c67d8, radius: 0.34, covalent: 0.71 },
  S: { color: 0xd8b72c, radius: 0.42, covalent: 1.05 }
};

const fallbackAtom = { color: 0x8aa1b4, radius: 0.34, covalent: 0.75 };

function init() {
  setupMoleculeViewer();

  for (const [key, molecule] of Object.entries(molecules)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = molecule.label;
    moleculeSelect.append(option);
  }

  workflowList.replaceChildren(...workflows.map(renderWorkflowButton));
  applyWorkflow(workflows[0]);

  form.addEventListener("input", renderPreview);
  form.addEventListener("change", renderPreview);
  document.querySelector("#downloadInput").addEventListener("click", downloadInput);
  document.querySelector("#downloadXyz").addEventListener("click", downloadXyz);
  document.querySelector("#copyInput").addEventListener("click", copyInput);
}

function renderWorkflowButton(workflow) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "workflow-card";
  button.setAttribute("aria-pressed", workflow.id === state.workflow.id ? "true" : "false");
  button.innerHTML = `<strong>${workflow.title}</strong><span>${workflow.detail}</span>`;
  button.addEventListener("click", () => applyWorkflow(workflow));
  return button;
}

function applyWorkflow(workflow) {
  state.workflow = workflow;
  jobName.value = workflow.jobName;
  method.value = workflow.method;
  basis.value = workflow.basis;
  moleculeSelect.value = workflow.molecule;

  for (const button of workflowList.querySelectorAll(".workflow-card")) {
    const isActive = button.textContent.includes(workflow.title);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  }

  renderPreview();
}

function safeJobName() {
  return jobName.value.trim().replace(/[^a-zA-Z0-9_.-]/g, "_") || "openqp_job";
}

function xyzBody() {
  return molecules[moleculeSelect.value].xyz;
}

function setupMoleculeViewer() {
  if (!moleculeCanvas) return;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.35, 6.2);

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: moleculeCanvas,
      antialias: true,
      alpha: true
    });
  } catch (error) {
    fallbackMode = true;
    moleculeCanvas.classList.add("is-hidden");
    moleculeFallback?.classList.add("is-visible");
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  moleculeRoot = new THREE.Group();
  scene.add(moleculeRoot);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x244c58, 2.1));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(3.5, 4.8, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x9df1df, 1.1);
  rimLight.position.set(-4, 1.2, -3);
  scene.add(rimLight);

  moleculeCanvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    lastPointer = { x: event.clientX, y: event.clientY };
    moleculeCanvas.setPointerCapture(event.pointerId);
  });

  moleculeCanvas.addEventListener("pointermove", (event) => {
    if (!dragging || !moleculeRoot) return;
    const dx = event.clientX - lastPointer.x;
    const dy = event.clientY - lastPointer.y;
    moleculeRoot.rotation.y += dx * 0.01;
    moleculeRoot.rotation.x += dy * 0.01;
    lastPointer = { x: event.clientX, y: event.clientY };
  });

  moleculeCanvas.addEventListener("pointerup", (event) => {
    dragging = false;
    moleculeCanvas.releasePointerCapture(event.pointerId);
  });

  moleculeCanvas.addEventListener("pointerleave", () => {
    dragging = false;
  });

  new ResizeObserver(resizeMoleculeViewer).observe(moleculeCanvas);
  resizeMoleculeViewer();
  animateMolecule();
}

function resizeMoleculeViewer() {
  if (!renderer || !camera || !moleculeCanvas) return;
  const rect = moleculeCanvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function parseXYZ(xyz) {
  return xyz
    .trim()
    .split(/\n/)
    .slice(2)
    .map((line) => {
      const [symbol, x, y, z] = line.trim().split(/\s+/);
      return {
        symbol,
        position: new THREE.Vector3(Number(x), Number(y), Number(z))
      };
    })
    .filter((atom) => atom.symbol && Number.isFinite(atom.position.x));
}

function updateMoleculeViewer() {
  const moleculeKey = moleculeSelect.value;
  if (moleculeKey === lastMoleculeKey) return;
  lastMoleculeKey = moleculeKey;

  moleculeLabel.textContent = molecules[moleculeKey].label;
  if (fallbackMode) {
    renderFallbackMolecule();
    return;
  }

  if (!moleculeRoot || !renderer) return;
  moleculeRoot.clear();

  const atoms = parseXYZ(xyzBody());
  const center = new THREE.Box3()
    .setFromPoints(atoms.map((atom) => atom.position))
    .getCenter(new THREE.Vector3());

  const normalizedAtoms = atoms.map((atom) => ({
    ...atom,
    position: atom.position.clone().sub(center)
  }));

  const bounds = new THREE.Box3().setFromPoints(normalizedAtoms.map((atom) => atom.position));
  const size = bounds.getSize(new THREE.Vector3()).length() || 1;
  const scale = 2.9 / size;

  const atomGeometryCache = new Map();
  const bondMaterial = new THREE.MeshStandardMaterial({
    color: 0xd7ece8,
    roughness: 0.42,
    metalness: 0.08
  });

  for (let i = 0; i < normalizedAtoms.length; i += 1) {
    for (let j = i + 1; j < normalizedAtoms.length; j += 1) {
      const a = normalizedAtoms[i];
      const b = normalizedAtoms[j];
      const styleA = atomStyles[a.symbol] || fallbackAtom;
      const styleB = atomStyles[b.symbol] || fallbackAtom;
      const distance = a.position.distanceTo(b.position);
      if (distance <= styleA.covalent + styleB.covalent + 0.45) {
        moleculeRoot.add(createBond(a.position.clone().multiplyScalar(scale), b.position.clone().multiplyScalar(scale), bondMaterial));
      }
    }
  }

  for (const atom of normalizedAtoms) {
    const style = atomStyles[atom.symbol] || fallbackAtom;
    const cacheKey = `${atom.symbol}-${style.radius}`;
    if (!atomGeometryCache.has(cacheKey)) {
      atomGeometryCache.set(cacheKey, new THREE.SphereGeometry(style.radius, 32, 20));
    }
    const material = new THREE.MeshStandardMaterial({
      color: style.color,
      roughness: 0.36,
      metalness: 0.04
    });
    const mesh = new THREE.Mesh(atomGeometryCache.get(cacheKey), material);
    mesh.position.copy(atom.position).multiplyScalar(scale);
    moleculeRoot.add(mesh);
  }

  moleculeRoot.rotation.set(-0.28, 0.55, 0.04);
}

function renderFallbackMolecule() {
  if (!moleculeFallback) return;
  moleculeFallback.replaceChildren();

  const atoms = parseXYZ(xyzBody());
  const center = new THREE.Box3()
    .setFromPoints(atoms.map((atom) => atom.position))
    .getCenter(new THREE.Vector3());
  const normalizedAtoms = atoms.map((atom) => ({
    ...atom,
    position: atom.position.clone().sub(center)
  }));
  const bounds = new THREE.Box3().setFromPoints(normalizedAtoms.map((atom) => atom.position));
  const size = bounds.getSize(new THREE.Vector3());
  const scale = 62 / Math.max(size.x || 1, size.z || 1, 1);

  const projectedAtoms = normalizedAtoms.map((atom) => ({
    ...atom,
    left: 50 + atom.position.x * scale,
    top: 50 - atom.position.z * scale
  }));

  for (let i = 0; i < projectedAtoms.length; i += 1) {
    for (let j = i + 1; j < projectedAtoms.length; j += 1) {
      const a = projectedAtoms[i];
      const b = projectedAtoms[j];
      const styleA = atomStyles[a.symbol] || fallbackAtom;
      const styleB = atomStyles[b.symbol] || fallbackAtom;
      if (a.position.distanceTo(b.position) > styleA.covalent + styleB.covalent + 0.45) continue;

      const dx = b.left - a.left;
      const dy = b.top - a.top;
      const bond = document.createElement("span");
      bond.className = "fallback-bond";
      bond.style.left = `${(a.left + b.left) / 2}%`;
      bond.style.top = `${(a.top + b.top) / 2}%`;
      bond.style.width = `${Math.hypot(dx, dy)}%`;
      bond.style.transform = `translate(-50%, -50%) rotate(${Math.atan2(dy, dx)}rad)`;
      moleculeFallback.append(bond);
    }
  }

  for (const atom of projectedAtoms) {
    const style = atomStyles[atom.symbol] || fallbackAtom;
    const marker = document.createElement("span");
    marker.className = "fallback-atom";
    marker.textContent = atom.symbol;
    marker.style.left = `${atom.left}%`;
    marker.style.top = `${atom.top}%`;
    marker.style.setProperty("--color", `#${style.color.toString(16).padStart(6, "0")}`);
    marker.style.setProperty("--size", `${Math.round(style.radius * 68)}px`);
    moleculeFallback.append(marker);
  }
}

function createBond(start, end, material) {
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(0.055, 0.055, length, 18);
  const cylinder = new THREE.Mesh(geometry, material);
  cylinder.position.copy(midpoint);
  cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return cylinder;
}

function animateMolecule() {
  if (!renderer || !scene || !camera) return;
  requestAnimationFrame(animateMolecule);
  if (moleculeRoot && !dragging) {
    moleculeRoot.rotation.y += 0.0045;
  }
  renderer.render(scene, camera);
}

function renderInput() {
  const workflow = state.workflow;
  const lines = [
    "# OpenQP input generated by OpenQP Web Phase 1",
    "# This static web app prepares files only; it does not run calculations online.",
    `# Notes: ${notes.value.trim() || "Review this starter input before production use."}`,
    "",
    "[input]",
    `system=${safeJobName()}.xyz`,
    `runtype=${workflow.runtype}`,
    `method=${method.value}`,
    `basis=${basis.value}`,
    `charge=${charge.value}`,
    `mult=${multiplicity.value}`,
    "",
    "[scf]",
    "type=restricted",
    "maxit=100",
    `conv=${conv.value}`
  ];

  if (workflow.states > 0) {
    lines.push(
      "",
      "[tdhf]",
      `nstate=${workflow.states}`,
      "mult=singlet",
      "tda=false"
    );
  }

  if (workflow.id === "mrsf") {
    lines.push(
      "",
      "[mrsf]",
      "enabled=true",
      "reference=review_required",
      "note=Confirm active-space and reference settings before running."
    );
  }

  lines.push(
    "",
    "# Save the XYZ block below as a separate .xyz file, or use the download button.",
    "# --- XYZ preview ---",
    xyzBody()
  );

  return `${lines.join("\n")}\n`;
}

function renderPreview() {
  preview.value = renderInput();
  updateMoleculeViewer();
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadInput() {
  downloadFile(`${safeJobName()}.inp`, renderInput(), "text/plain");
}

function downloadXyz() {
  downloadFile(`${safeJobName()}.xyz`, `${xyzBody()}\n`, "chemical/x-xyz");
}

async function copyInput() {
  await navigator.clipboard.writeText(renderInput());
  const button = document.querySelector("#copyInput");
  const original = button.textContent;
  button.textContent = "Copied";
  setTimeout(() => {
    button.textContent = original;
  }, 1200);
}

init();
