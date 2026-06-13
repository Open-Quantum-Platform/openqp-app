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
    states: 0,
    scfType: "rhf"
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
    states: 0,
    scfType: "rhf"
  },
  {
    id: "orbitals-density",
    title: "MO and density export",
    detail: "Save Molden/mol data for local MO, density, spin-density, and ESP viewing.",
    jobName: "water_mo_density",
    runtype: "energy",
    method: "B3LYP",
    basis: "6-31G*",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    saveMol: true,
    extraSections: [
      "# Use the saved Molden/mol data with a local cube or viewer tool for real MO, density, spin-density, and ESP surfaces."
    ]
  },
  {
    id: "tddft",
    title: "TDDFT absorption",
    detail: "Excited-state starter with a visible states block.",
    jobName: "ethylene_tddft_abs",
    runtype: "energy",
    method: "PBE0",
    basis: "cc-pVDZ",
    molecule: "ethylene",
    states: 5,
    inputMethod: "tdhf",
    functional: "pbe0",
    tdhfType: "rpa",
    scfType: "rhf"
  },
  {
    id: "mrsf",
    title: "MRSF-TDDFT starter",
    detail: "Prepared as a reviewable template, not an online run.",
    jobName: "ethylene_mrsf_starter",
    runtype: "energy",
    method: "MRSF-TDDFT",
    basis: "cc-pVDZ",
    molecule: "ethylene",
    states: 4,
    inputMethod: "tdhf",
    functional: "bhhlyp",
    tdhfType: "mrsf",
    scfType: "rohf",
    multiplicity: 3
  },
  {
    id: "hessian",
    title: "Hessian and frequencies",
    detail: "Closed-shell HF/DFT Hessian starter with normal-mode output.",
    jobName: "water_hessian_freq",
    runtype: "hess",
    method: "B3LYP",
    basis: "6-31G*",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    extraSections: ["[hess]", "type=analytical", "state=0", "clean=True"]
  },
  {
    id: "ir",
    title: "IR spectrum",
    detail: "Frequency workflow with IR intensities in the Hessian sidecar.",
    jobName: "water_ir_spectrum",
    runtype: "hess",
    method: "B3LYP",
    basis: "6-31G*",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    extraSections: ["[hess]", "type=analytical", "state=0", "clean=True", "# IR intensities are emitted with the frequency data."]
  },
  {
    id: "raman",
    title: "Raman spectrum",
    detail: "Frequency workflow with Raman activities and mode tensors.",
    jobName: "water_raman_spectrum",
    runtype: "hess",
    method: "B3LYP",
    basis: "6-31G*",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    extraSections: ["[hess]", "type=analytical", "state=0", "clean=True", "# Raman activities are emitted with the frequency data."]
  },
  {
    id: "nmr",
    title: "NMR shielding",
    detail: "Starter for NMR shielding workflows; review build-specific keywords.",
    jobName: "water_nmr_shielding",
    runtype: "prop",
    method: "B3LYP",
    basis: "6-31G*",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    extraSections: [
      "[properties]",
      "scf_prop=el_mom,mulliken",
      "export=true",
      "# nmr=shielding",
      "# NMR shielding support is OpenQP-version dependent; uncomment or replace the NMR keyword for your build."
    ]
  },
  {
    id: "pcm",
    title: "PCM solvent single point",
    detail: "Solvent-effect starter with a ddPCM/PCM review block.",
    jobName: "water_pcm_sp",
    runtype: "energy",
    method: "B3LYP",
    basis: "6-31G*",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    extraSections: [
      "# PCM/ddPCM block: confirm exact solvent keywords for your OpenQP build.",
      "# [pcm]",
      "# model=ddpcm",
      "# solvent=water",
      "# dielectric=78.3553"
    ]
  },
  {
    id: "ekt",
    title: "MRSF-EKT IP/EA",
    detail: "Ionization/electron-affinity starter with structured EKT output.",
    jobName: "water_mrsf_ekt_ip",
    runtype: "ekt",
    method: "MRSF-TDDFT",
    basis: "6-31G",
    molecule: "water",
    states: 10,
    inputMethod: "tdhf",
    functional: "bhhlyp",
    tdhfType: "mrsf",
    scfType: "rohf",
    multiplicity: 3,
    extraSections: ["[ekt]", "ip=True", "ea=False"]
  }
];

const resultPreviews = {
  "single-point": {
    title: "Energy and SCF summary",
    items: [
      "Final SCF energy and convergence history",
      "Mulliken charges and dipole-style properties when requested",
      "Molden orbitals when save_molden is enabled"
    ],
    sample: `OpenQP local output
final_scf_energy_hartree: -74.963123456
scf_iterations: 8
converged: true

Artifacts
water_hf_sp.log
water_hf_sp.molden`
  },
  optimize: {
    title: "Optimized structure",
    items: [
      "Final energy and gradient norm",
      "Optimized Cartesian coordinates",
      "Trajectory-style geometry steps from the local run"
    ],
    sample: `Optimization summary
step    energy_hartree       max_gradient
  1     -114.22180432        2.1e-03
  5     -114.22911877        8.4e-06

Final structure
formaldehyde_b3lyp_opt.xyz`
  },
  "orbitals-density": {
    title: "MO, density, spin-density, and ESP assets",
    items: [
      "Molden orbital file for HOMO/LUMO inspection",
      "Saved mol data for local post-processing into cube grids",
      "Viewer modes here are local previews, not calculated surfaces"
    ],
    sample: `Expected local artifacts
water_mo_density.log
water_mo_density.molden
water_mo_density.json

Post-process locally
HOMO.cube
LUMO.cube
electron_density.cube
spin_density.cube
esp.cube`
  },
  tddft: {
    title: "Excited-state roots",
    items: [
      "Vertical excitation energies",
      "Oscillator strengths and response-vector data where enabled",
      "Molden orbitals for the reference state"
    ],
    sample: `TDDFT roots
state   energy_eV   oscillator_strength
  1       7.21            0.018
  2       8.44            0.116
  3       9.03            0.002`
  },
  mrsf: {
    title: "MRSF-TDDFT roots",
    items: [
      "Spin-flip/MRSF response-state energies",
      "State vectors and MRSF density terms in structured output",
      "Review reference and active settings before production use"
    ],
    sample: `MRSF-TDDFT summary
state   relative_eV   dominant_character
  1        0.00        reference
  2        3.12        single excitation
  3        4.86        mixed`
  },
  hessian: {
    title: "Hessian and normal modes",
    items: [
      "Vibrational frequencies",
      "Normal-mode eigenvectors",
      "Frequency sidecar data for downstream plotting"
    ],
    sample: `Frequency table
mode   frequency_cm-1      IR_km_mol      Raman_activity
  1       1595.42             42.1              5.7
  2       3657.18              3.8             11.2
  3       3755.91             18.6              9.4

Artifacts
water_hessian_freq.hess.json
water_hessian_freq.freq.molden`
  },
  ir: {
    title: "IR spectrum",
    items: [
      "Frequency table with IR intensities",
      "Mode dipole derivatives in the Hessian sidecar",
      "Downloadable data ready for local plotting"
    ],
    sample: `IR stick spectrum
mode   frequency_cm-1      intensity_km_mol
  1       1595.42              42.1
  2       3657.18               3.8
  3       3755.91              18.6`
  },
  raman: {
    title: "Raman spectrum",
    items: [
      "Frequency table with Raman activities",
      "Mode polarizability derivatives in the Hessian sidecar",
      "Downloadable mode data for local spectrum broadening"
    ],
    sample: `Raman activity table
mode   frequency_cm-1      activity
  1       1595.42             5.7
  2       3657.18            11.2
  3       3755.91             9.4`
  },
  nmr: {
    title: "NMR shielding output",
    items: [
      "Shielding tensors and isotropic shielding when enabled by the OpenQP build",
      "Reference SCF properties included in the starter input",
      "Template keeps version-dependent NMR keywords as review comments"
    ],
    sample: `NMR shielding preview
atom   sigma_iso_ppm   anisotropy
 O       321.4           47.2
 H        31.8           12.5
 H        31.8           12.5`
  },
  pcm: {
    title: "Solvent-corrected energy",
    items: [
      "Gas-phase and solvent-corrected energy terms",
      "Reaction-field contribution when PCM/ddPCM is enabled",
      "PCM block is commented until exact build keywords are confirmed"
    ],
    sample: `PCM energy preview
gas_phase_energy_hartree:      -76.41234567
solvated_energy_hartree:       -76.42190231
reaction_field_hartree:         -0.00955664`
  },
  ekt: {
    title: "MRSF-EKT IP/EA results",
    items: [
      "EKT eigenvalues in Hartree/eV",
      "Pole strengths for ionization or electron attachment",
      "Dyson-like orbital data in structured output"
    ],
    sample: `MRSF-EKT summary
root   IP_eV    pole_strength
  1    10.42       0.83
  2    12.06       0.41

Structured fields
mrsf_ekt.eigenvalues_hartree
mrsf_ekt.pole_strengths
mrsf_ekt.orbitals_mo`
  }
};

const state = {
  workflow: workflows[0]
};

const workflowList = document.querySelector("#workflowList");
const moleculeSelect = document.querySelector("#molecule");
const form = document.querySelector("#inputForm");
const preview = document.querySelector("#preview");
const resultTitle = document.querySelector("#resultTitle");
const resultList = document.querySelector("#resultList");
const resultSample = document.querySelector("#resultSample");
const chatForm = document.querySelector("#chatForm");
const chatPrompt = document.querySelector("#chatPrompt");
const chatLog = document.querySelector("#chatLog");
const promptExamples = document.querySelector("#promptExamples");
const xyzInput = document.querySelector("#xyzInput");
const xyzFile = document.querySelector("#xyzFile");
const xyzStatus = document.querySelector("#xyzStatus");
const pubchemQuery = document.querySelector("#pubchemQuery");
const pubchemSearch = document.querySelector("#pubchemSearch");
const pubchemStatus = document.querySelector("#pubchemStatus");
const surfaceMode = document.querySelector("#surfaceMode");
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
let lastMoleculeSignature = "";
let fallbackMode = false;
let dragging = false;
let lastPointer = { x: 0, y: 0 };

const atomStyles = {
  H: { color: 0xf4f7fb, radius: 0.22, covalent: 0.31 },
  C: { color: 0x404a55, radius: 0.34, covalent: 0.76 },
  O: { color: 0xd84c3f, radius: 0.36, covalent: 0.66 },
  N: { color: 0x2c67d8, radius: 0.34, covalent: 0.71 },
  F: { color: 0x67b857, radius: 0.32, covalent: 0.57 },
  P: { color: 0xe56b36, radius: 0.44, covalent: 1.07 },
  S: { color: 0xd8b72c, radius: 0.42, covalent: 1.05 },
  Cl: { color: 0x4fad47, radius: 0.45, covalent: 1.02 },
  Br: { color: 0x8e493a, radius: 0.48, covalent: 1.2 },
  I: { color: 0x7046a1, radius: 0.52, covalent: 1.39 }
};

const fallbackAtom = { color: 0x8aa1b4, radius: 0.34, covalent: 0.75 };

const atomicSymbols = [
  "",
  "H",
  "He",
  "Li",
  "Be",
  "B",
  "C",
  "N",
  "O",
  "F",
  "Ne",
  "Na",
  "Mg",
  "Al",
  "Si",
  "P",
  "S",
  "Cl",
  "Ar",
  "K",
  "Ca",
  "Sc",
  "Ti",
  "V",
  "Cr",
  "Mn",
  "Fe",
  "Co",
  "Ni",
  "Cu",
  "Zn",
  "Ga",
  "Ge",
  "As",
  "Se",
  "Br",
  "Kr",
  "Rb",
  "Sr",
  "Y",
  "Zr",
  "Nb",
  "Mo",
  "Tc",
  "Ru",
  "Rh",
  "Pd",
  "Ag",
  "Cd",
  "In",
  "Sn",
  "Sb",
  "Te",
  "I",
  "Xe",
  "Cs",
  "Ba",
  "La",
  "Ce",
  "Pr",
  "Nd",
  "Pm",
  "Sm",
  "Eu",
  "Gd",
  "Tb",
  "Dy",
  "Ho",
  "Er",
  "Tm",
  "Yb",
  "Lu",
  "Hf",
  "Ta",
  "W",
  "Re",
  "Os",
  "Ir",
  "Pt",
  "Au",
  "Hg",
  "Tl",
  "Pb",
  "Bi",
  "Po",
  "At",
  "Rn",
  "Fr",
  "Ra",
  "Ac",
  "Th",
  "Pa",
  "U",
  "Np",
  "Pu",
  "Am",
  "Cm",
  "Bk",
  "Cf",
  "Es",
  "Fm",
  "Md",
  "No",
  "Lr",
  "Rf",
  "Db",
  "Sg",
  "Bh",
  "Hs",
  "Mt",
  "Ds",
  "Rg",
  "Cn",
  "Nh",
  "Fl",
  "Mc",
  "Lv",
  "Ts",
  "Og"
];

const promptMoleculeAliases = {
  water: "water",
  h2o: "water",
  formaldehyde: "formaldehyde",
  methanal: "formaldehyde",
  ethylene: "ethylene",
  ethene: "ethylene"
};

const publicMoleculeNames = [
  "benzene",
  "caffeine",
  "aspirin",
  "methane",
  "ammonia",
  "ethanol",
  "methanol",
  "acetone",
  "acetonitrile",
  "carbon dioxide",
  "co2",
  "nitrogen",
  "oxygen",
  "naphthalene",
  "phenol",
  "pyridine"
];

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

  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await handleChatPrompt(chatPrompt.value);
  });
  promptExamples.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-prompt]");
    if (!button) return;
    chatPrompt.value = button.dataset.prompt;
    await handleChatPrompt(button.dataset.prompt);
  });
  form.addEventListener("input", renderPreview);
  form.addEventListener("change", (event) => {
    if (event.target === moleculeSelect) {
      loadPresetMolecule(moleculeSelect.value);
    }
    if (event.target !== xyzFile) {
      renderPreview();
    }
  });
  xyzFile.addEventListener("change", loadXyzFile);
  pubchemSearch.addEventListener("click", importFromPubChem);
  pubchemQuery.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      importFromPubChem();
    }
  });
  document.querySelector("#resetMolecule").addEventListener("click", () => {
    loadPresetMolecule(moleculeSelect.value);
    renderPreview();
  });
  surfaceMode.addEventListener("change", () => {
    lastMoleculeSignature = "";
    renderPreview();
  });
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
  charge.value = workflow.charge ?? 0;
  multiplicity.value = workflow.multiplicity ?? 1;
  moleculeSelect.value = workflow.molecule;
  loadPresetMolecule(workflow.molecule);

  for (const button of workflowList.querySelectorAll(".workflow-card")) {
    const isActive = button.textContent.includes(workflow.title);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  }

  renderPreview();
}

async function handleChatPrompt(rawPrompt) {
  const prompt = rawPrompt.trim();
  if (!prompt) {
    addChatMessage("assistant", "Add a short request such as: Raman for water with B3LYP/6-31G*.");
    return;
  }

  addChatMessage("user", prompt);
  chatPrompt.value = "";

  const suggestion = parsePlainTextRequest(prompt);
  applyWorkflow(suggestion.workflow);

  if (suggestion.method && !["ekt", "mrsf"].includes(suggestion.workflow.id)) {
    method.value = suggestion.method;
  }
  if (suggestion.basis) basis.value = suggestion.basis;
  if (Number.isInteger(suggestion.charge)) charge.value = suggestion.charge;
  if (Number.isInteger(suggestion.multiplicity)) multiplicity.value = suggestion.multiplicity;
  if (suggestion.surfaceMode) surfaceMode.value = suggestion.surfaceMode;

  let importResult = null;
  if (suggestion.moleculeKey) {
    moleculeSelect.value = suggestion.moleculeKey;
    loadPresetMolecule(suggestion.moleculeKey);
  } else if (suggestion.moleculeQuery) {
    importResult = await importFromPubChem(suggestion.moleculeQuery);
  }

  notes.value = `Generated from plain-text request: ${prompt}`;
  lastMoleculeSignature = "";
  renderPreview();
  addChatMessage("assistant", summarizePromptSuggestion(suggestion, importResult));
}

function parsePlainTextRequest(prompt) {
  const lower = prompt.toLowerCase();
  const workflow = detectWorkflow(lower);
  return {
    workflow,
    method: detectMethod(lower),
    basis: detectBasis(lower),
    charge: detectCharge(lower),
    multiplicity: detectMultiplicity(lower),
    surfaceMode: detectSurfaceMode(lower),
    ...detectMolecule(prompt, lower)
  };
}

function detectWorkflow(lower) {
  if (hasAny(lower, ["ekt", "ionization", "electron affinity", "ip/ea"])) return workflowById("ekt");
  if (hasAny(lower, ["nmr", "shielding"])) return workflowById("nmr");
  if (hasAny(lower, ["raman"])) return workflowById("raman");
  if (/\bir\b/.test(lower) || hasAny(lower, ["infrared"])) return workflowById("ir");
  if (hasAny(lower, ["pcm", "ddpcm", "solvent", "solvation"])) return workflowById("pcm");
  if (hasAny(lower, ["hessian", "frequency", "frequencies", "vibration", "vibrational"])) return workflowById("hessian");
  if (/\bmo\b/.test(lower) || hasAny(lower, ["orbital", "homo", "lumo", "electron density", "spin density", "esp", "electrostatic"])) {
    return workflowById("orbitals-density");
  }
  if (hasAny(lower, ["mrsf", "spin flip", "spin-flip"])) return workflowById("mrsf");
  if (hasAny(lower, ["tddft", "td-dft", "absorption", "excited state", "excited-state"])) return workflowById("tddft");
  if (hasAny(lower, ["optimize", "optimization", "geometry opt", "relax"])) return workflowById("optimize");
  return workflowById("single-point");
}

function detectMethod(lower) {
  if (hasAny(lower, ["mrsf", "spin flip", "spin-flip", "ekt"])) return "MRSF-TDDFT";
  if (/\bpbe0\b/.test(lower)) return "PBE0";
  if (/\bb3lyp\b/.test(lower)) return "B3LYP";
  if (/\bhf\b/.test(lower) || hasAny(lower, ["hartree-fock", "hartree fock"])) return "HF";
  return "";
}

function detectBasis(lower) {
  if (/\b6-31g\s*(?:\*|\(d\))/.test(lower)) return "6-31G*";
  if (/\b6-31g\b/.test(lower)) return "6-31G";
  if (/\bsto-?3g\b/.test(lower)) return "STO-3G";
  if (/\bcc-?pvdz\b/.test(lower)) return "cc-pVDZ";
  if (/\bdef2-?svp\b/.test(lower)) return "def2-SVP";
  return "";
}

function detectCharge(lower) {
  const explicit = lower.match(/\bcharge\s*=?\s*([+-]?\d+)/) || lower.match(/\b([+-]\d+)\s+charge\b/);
  if (explicit) return Number(explicit[1]);
  if (/\banion\b/.test(lower)) return -1;
  if (/\bcation\b/.test(lower)) return 1;
  if (/\bneutral\b/.test(lower)) return 0;
  return null;
}

function detectMultiplicity(lower) {
  const explicit = lower.match(/\b(?:multiplicity|mult)\s*=?\s*(\d+)/);
  if (explicit) return Number(explicit[1]);
  if (/\bsinglet\b/.test(lower)) return 1;
  if (/\bdoublet\b/.test(lower)) return 2;
  if (/\btriplet\b/.test(lower)) return 3;
  if (/\bquartet\b/.test(lower)) return 4;
  return null;
}

function detectSurfaceMode(lower) {
  if (/\blumo\b/.test(lower)) return "lumo";
  if (/\bhomo\b/.test(lower)) return "homo";
  if (hasAny(lower, ["spin density", "spin-density"])) return "spin";
  if (/\besp\b/.test(lower) || hasAny(lower, ["electrostatic potential"])) return "esp";
  if (hasAny(lower, ["electron density", "density"])) return "density";
  return "";
}

function detectMolecule(prompt, lower) {
  const extracted = prompt.match(/\b(?:for|of|on)\s+([A-Za-z0-9][A-Za-z0-9 +'()\-]{1,48}?)(?=\s+(?:with|using|at|in|and|charge|basis|method|multiplicity|singlet|doublet|triplet|neutral|anion|cation|please)\b|[.!?]?$)/i);
  if (extracted) {
    const candidate = extracted[1].trim().replace(/\s+/g, " ");
    const candidateLower = candidate.toLowerCase();
    if (!hasAny(candidateLower, ["input", "calculation", "workflow"])) {
      for (const [alias, key] of Object.entries(promptMoleculeAliases)) {
        if (phrasePattern(alias).test(candidateLower)) return { moleculeKey: key };
      }
      for (const name of publicMoleculeNames) {
        if (phrasePattern(name).test(candidateLower)) return { moleculeQuery: name === "co2" ? "carbon dioxide" : name };
      }
      return { moleculeQuery: candidate };
    }
  }

  for (const [alias, key] of Object.entries(promptMoleculeAliases)) {
    if (phrasePattern(alias).test(lower)) return { moleculeKey: key };
  }

  for (const name of publicMoleculeNames) {
    if (phrasePattern(name).test(lower)) return { moleculeQuery: name === "co2" ? "carbon dioxide" : name };
  }

  return {};
}

function workflowById(id) {
  return workflows.find((workflow) => workflow.id === id) || workflows[0];
}

function hasAny(text, needles) {
  return needles.some((needle) => text.includes(needle));
}

function phrasePattern(phrase) {
  return new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
}

function addChatMessage(role, message) {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${role}`;

  const speaker = document.createElement("strong");
  speaker.textContent = role === "user" ? "You" : "OpenQP Web";

  const text = document.createElement("p");
  text.textContent = message;

  wrapper.append(speaker, text);
  chatLog.append(wrapper);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function summarizePromptSuggestion(suggestion, importResult) {
  const moleculeText = moleculeSummary(suggestion, importResult);
  const surfaceText = surfaceMode.value === "molecule" ? "" : ` Viewer: ${selectedText(surfaceMode)}.`;
  return [
    `Generated ${suggestion.workflow.title}.`,
    moleculeText,
    `Method: ${method.value}; basis: ${basis.value}; charge: ${charge.value}; multiplicity: ${multiplicity.value}.`,
    `${surfaceText} Review the generated input before running OpenQP locally.`
  ]
    .filter(Boolean)
    .join(" ");
}

function moleculeSummary(suggestion, importResult) {
  if (suggestion.moleculeKey) return `Molecule: ${molecules[suggestion.moleculeKey].label}.`;
  if (importResult?.ok) return `Imported PubChem CID ${importResult.cid} (${importResult.recordType.toUpperCase()}) into the XYZ editor.`;
  if (suggestion.moleculeQuery) return `I set the workflow, but PubChem did not return coordinates for "${suggestion.moleculeQuery}".`;
  return `Molecule: ${moleculeDisplayLabel()}.`;
}

function selectedText(select) {
  return select.options[select.selectedIndex]?.textContent || select.value;
}

function safeJobName() {
  return jobName.value.trim().replace(/[^a-zA-Z0-9_.-]/g, "_") || "openqp_job";
}

function normalizeXYZText(text) {
  return text.replace(/\r/g, "").trim();
}

function xyzBody() {
  return normalizeXYZText(xyzInput.value) || molecules[moleculeSelect.value].xyz;
}

function loadPresetMolecule(key) {
  xyzInput.value = molecules[key].xyz;
  lastMoleculeSignature = "";
}

async function loadXyzFile() {
  const [file] = xyzFile.files;
  if (!file) return;
  xyzInput.value = await file.text();
  xyzFile.value = "";
  lastMoleculeSignature = "";
  pubchemStatus.textContent = "Loaded local XYZ file";
  pubchemStatus.dataset.state = "ok";
  renderPreview();
}

function pubChemPath(query, recordType) {
  const trimmed = query.trim();
  const cidMatch = trimmed.match(/^(?:cid[:\s-]*)?(\d+)$/i);
  const kind = cidMatch ? "cid" : "name";
  const identifier = encodeURIComponent(cidMatch ? cidMatch[1] : trimmed);
  return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/${kind}/${identifier}/record/JSON?record_type=${recordType}`;
}

async function fetchPubChemRecord(query, recordType) {
  const response = await fetch(pubChemPath(query, recordType), {
    headers: { Accept: "application/json" }
  });
  if (!response.ok) {
    throw new Error(`PubChem returned ${response.status}`);
  }
  return response.json();
}

async function importFromPubChem(queryOverride = "") {
  const query = (queryOverride || pubchemQuery.value).trim();
  if (!query) {
    pubchemStatus.textContent = "Enter a compound name or CID.";
    pubchemStatus.dataset.state = "error";
    return { ok: false, reason: "empty" };
  }

  pubchemQuery.value = query;
  pubchemSearch.disabled = true;
  pubchemStatus.textContent = "Searching PubChem...";
  pubchemStatus.dataset.state = "";

  try {
    let recordType = "3d";
    let data;
    try {
      data = await fetchPubChemRecord(query, recordType);
    } catch (error) {
      recordType = "2d";
      data = await fetchPubChemRecord(query, recordType);
    }

    const { cid, xyz } = pubChemRecordToXYZ(data, query, recordType);
    xyzInput.value = xyz;
    lastMoleculeSignature = "";
    pubchemStatus.textContent = `Imported PubChem CID ${cid} (${recordType.toUpperCase()})`;
    pubchemStatus.dataset.state = "ok";
    renderPreview();
    return { ok: true, cid, recordType };
  } catch (error) {
    pubchemStatus.textContent = "No PubChem coordinates found for that query.";
    pubchemStatus.dataset.state = "error";
    return { ok: false, reason: "not_found" };
  } finally {
    pubchemSearch.disabled = false;
  }
}

function pubChemRecordToXYZ(data, query, recordType) {
  const compound = data?.PC_Compounds?.[0];
  const atoms = compound?.atoms;
  const coords = compound?.coords?.[0];
  const conformer = coords?.conformers?.[0];
  if (!compound || !atoms?.aid || !atoms?.element || !conformer?.x || !conformer?.y) {
    throw new Error("Missing PubChem coordinates");
  }

  const atomByAid = new Map(atoms.aid.map((aid, index) => [aid, atoms.element[index]]));
  const coordAids = coords.aid || atoms.aid;
  const zValues = conformer.z || new Array(conformer.x.length).fill(0);
  const lines = coordAids.map((aid, index) => {
    const symbol = atomicSymbols[atomByAid.get(aid)] || "X";
    const x = Number(conformer.x[index] || 0).toFixed(6);
    const y = Number(conformer.y[index] || 0).toFixed(6);
    const z = Number(zValues[index] || 0).toFixed(6);
    return `${symbol.padEnd(2)} ${x.padStart(12)} ${y.padStart(12)} ${z.padStart(12)}`;
  });

  const cid = compound.id?.id?.cid || "unknown";
  return {
    cid,
    xyz: `${lines.length}\nPubChem CID ${cid} ${recordType.toUpperCase()} - ${query}\n${lines.join("\n")}`
  };
}

function coordinateLinesFromXYZ(xyz) {
  const lines = normalizeXYZText(xyz)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return /^\d+$/.test(lines[0] || "") ? lines.slice(2) : lines;
}

function declaredAtomCount(xyz) {
  const [firstLine = ""] = normalizeXYZText(xyz).split("\n");
  return /^\d+$/.test(firstLine.trim()) ? Number(firstLine.trim()) : null;
}

function moleculeDisplayLabel() {
  const preset = molecules[moleculeSelect.value];
  if (!preset) return "Custom XYZ";
  return normalizeXYZText(preset.xyz) === xyzBody() ? preset.label : "Custom XYZ";
}

function updateXYZStatus(atoms = parseXYZ(xyzBody())) {
  const declaredCount = declaredAtomCount(xyzBody());
  let text = `${atoms.length} atom${atoms.length === 1 ? "" : "s"} loaded locally`;
  let state = "ok";

  if (atoms.length === 0) {
    text = "Paste full XYZ text: atom count, title line, then coordinates.";
    state = "error";
  } else if (declaredCount === null) {
    text = `${atoms.length} coordinate line${atoms.length === 1 ? "" : "s"} found; add an XYZ atom-count header before running.`;
    state = "error";
  } else if (declaredCount !== atoms.length) {
    text = `XYZ count says ${declaredCount}; found ${atoms.length} coordinate line${atoms.length === 1 ? "" : "s"}.`;
    state = "error";
  }

  xyzStatus.textContent = text;
  xyzStatus.dataset.state = state;
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
  return coordinateLinesFromXYZ(xyz)
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
  const signature = `${moleculeDisplayLabel()}|${surfaceMode.value}|${xyzBody()}`;
  if (signature === lastMoleculeSignature) return;
  lastMoleculeSignature = signature;

  moleculeLabel.textContent = moleculeDisplayLabel();
  const atoms = parseXYZ(xyzBody());
  updateXYZStatus(atoms);

  if (fallbackMode) {
    renderFallbackMolecule(atoms);
    return;
  }

  if (!moleculeRoot || !renderer) return;
  moleculeRoot.clear();
  if (atoms.length === 0) return;

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

  addSurfacePreview(normalizedAtoms, scale);

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

function renderFallbackMolecule(atoms = parseXYZ(xyzBody())) {
  if (!moleculeFallback) return;
  moleculeFallback.replaceChildren();
  if (atoms.length === 0) return;

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

function addSurfacePreview(atoms, scale) {
  const mode = surfaceMode.value;
  if (mode === "molecule" || atoms.length === 0 || !moleculeRoot) return;

  const scaledAtoms = atoms.map((atom) => ({
    ...atom,
    position: atom.position.clone().multiplyScalar(scale)
  }));
  const bounds = new THREE.Box3().setFromPoints(scaledAtoms.map((atom) => atom.position));
  const size = bounds.getSize(new THREE.Vector3());
  const shellScale = new THREE.Vector3(
    Math.max(size.x * 0.55 + 0.95, 1.18),
    Math.max(size.y * 0.55 + 0.95, 1.18),
    Math.max(size.z * 0.55 + 0.95, 1.18)
  );

  if (mode === "density") {
    moleculeRoot.add(createSurfaceMesh(new THREE.Vector3(), shellScale, 0x1ca78f, 0.18));
    for (const atom of scaledAtoms) {
      const style = atomStyles[atom.symbol] || fallbackAtom;
      moleculeRoot.add(createSurfaceMesh(atom.position, new THREE.Vector3(0.42, 0.42, 0.42), style.color, 0.1));
    }
    return;
  }

  if (mode === "esp") {
    moleculeRoot.add(createSurfaceMesh(new THREE.Vector3(), shellScale, 0x75b7d8, 0.13));
    for (const atom of scaledAtoms) {
      const negative = ["O", "N", "S", "F", "Cl", "Br", "I"].includes(atom.symbol);
      moleculeRoot.add(createSurfaceMesh(atom.position, new THREE.Vector3(0.36, 0.36, 0.36), negative ? 0xd95a49 : 0xf2c45f, 0.24));
    }
    return;
  }

  if (mode === "spin") {
    scaledAtoms.forEach((atom, index) => {
      const color = index % 2 === 0 ? 0x2c67d8 : 0xd95a49;
      const radius = ["C", "N", "O", "P", "S"].includes(atom.symbol) ? 0.58 : 0.36;
      moleculeRoot.add(createSurfaceMesh(atom.position, new THREE.Vector3(radius, radius, radius), color, 0.28));
    });
    return;
  }

  const axisName = majorAxisName(size);
  const axis = axisVector(axisName);
  const perp = axisVector(axisName === "x" ? "z" : "x");
  const span = Math.max(size.x, size.y, size.z, 1.8);
  const offset = span * 0.34 + 0.34;
  const lobe = lobeScale(axisName, 0.9, 0.56, 0.68);
  const positiveColor = 0x12a88f;
  const negativeColor = 0xc95848;

  if (mode === "homo") {
    moleculeRoot.add(createSurfaceMesh(axis.clone().multiplyScalar(-offset), lobe, positiveColor, 0.34));
    moleculeRoot.add(createSurfaceMesh(axis.clone().multiplyScalar(offset), lobe, negativeColor, 0.34));
    return;
  }

  if (mode === "lumo") {
    const smaller = lobeScale(axisName, 0.68, 0.44, 0.52);
    moleculeRoot.add(createSurfaceMesh(axis.clone().multiplyScalar(-offset), smaller, positiveColor, 0.34));
    moleculeRoot.add(createSurfaceMesh(axis.clone().multiplyScalar(offset), smaller, positiveColor, 0.34));
    moleculeRoot.add(createSurfaceMesh(perp.clone().multiplyScalar(-offset * 0.72), smaller, negativeColor, 0.3));
    moleculeRoot.add(createSurfaceMesh(perp.clone().multiplyScalar(offset * 0.72), smaller, negativeColor, 0.3));
  }
}

function createSurfaceMesh(position, scaleVector, color, opacity) {
  const material = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity,
    roughness: 0.52,
    metalness: 0.02,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), material);
  mesh.position.copy(position);
  mesh.scale.copy(scaleVector);
  return mesh;
}

function majorAxisName(size) {
  if (size.y >= size.x && size.y >= size.z) return "y";
  if (size.z >= size.x && size.z >= size.y) return "z";
  return "x";
}

function axisVector(axisName) {
  if (axisName === "y") return new THREE.Vector3(0, 1, 0);
  if (axisName === "z") return new THREE.Vector3(0, 0, 1);
  return new THREE.Vector3(1, 0, 0);
}

function lobeScale(axisName, longAxis, midAxis, shortAxis) {
  if (axisName === "y") return new THREE.Vector3(midAxis, longAxis, shortAxis);
  if (axisName === "z") return new THREE.Vector3(midAxis, shortAxis, longAxis);
  return new THREE.Vector3(longAxis, midAxis, shortAxis);
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

function inputMethodForWorkflow(workflow) {
  if (workflow.inputMethod) return workflow.inputMethod;
  return method.value === "MRSF-TDDFT" ? "tdhf" : "hf";
}

function functionalFromMethod(value) {
  if (value === "HF") return "";
  if (value === "MRSF-TDDFT") return "bhhlyp";
  return value.toLowerCase();
}

function functionalForWorkflow(workflow) {
  return workflow.functional ?? functionalFromMethod(method.value);
}

function renderResultPreview() {
  const result = resultPreviews[state.workflow.id] || resultPreviews["single-point"];
  resultTitle.textContent = result.title;
  resultList.replaceChildren(
    ...result.items.map((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      return li;
    })
  );
  resultSample.textContent = result.sample;
}

function renderInput() {
  const workflow = state.workflow;
  const inputMethod = inputMethodForWorkflow(workflow);
  const functional = functionalForWorkflow(workflow);
  const scfExtras = (workflow.scfExtras || []).filter((line) => line !== "save_molden=True");
  const lines = [
    "# OpenQP input generated by OpenQP Web Phase 1",
    "# This static web app prepares files only; it does not run calculations online.",
    `# Notes: ${notes.value.trim() || "Review this starter input before production use."}`,
    "",
    "[input]",
    `system=${safeJobName()}.xyz`,
    `runtype=${workflow.runtype}`,
    `method=${inputMethod}`,
    `basis=${basis.value}`,
    `charge=${charge.value}`
  ];

  if (functional) {
    lines.push(`functional=${functional}`);
  }

  lines.push(
    "d4=False",
    "",
    "[guess]",
    "type=huckel",
    `save_mol=${workflow.saveMol ? "True" : "False"}`,
    "",
    "[scf]",
    `type=${workflow.scfType || "rhf"}`,
    "maxit=100",
    `multiplicity=${multiplicity.value}`,
    `conv=${conv.value}`,
    "save_molden=True",
    ...scfExtras
  );

  if (workflow.states > 0) {
    lines.push(
      "",
      "[tdhf]",
      `type=${workflow.tdhfType || "rpa"}`,
      "maxit=30",
      "multiplicity=1",
      `nstate=${workflow.states}`,
      `conv=${conv.value}`,
      `zvconv=${conv.value}`
    );
  }

  if (workflow.id === "mrsf") {
    lines.push(
      "",
      "# Review active-space and reference settings before production MRSF runs."
    );
  }

  if (workflow.extraSections?.length) {
    lines.push("", ...workflow.extraSections);
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
  renderResultPreview();
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
