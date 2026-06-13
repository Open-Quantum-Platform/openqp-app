import * as THREE from "../vendor/three.module.min.js";

const BOHR_TO_ANGSTROM = 0.529177210903;

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
  },
  benzene: {
    label: "Benzene",
    xyz: `12
benzene
C    1.397000    0.000000    0.000000
C    0.698500    1.209600    0.000000
C   -0.698500    1.209600    0.000000
C   -1.397000    0.000000    0.000000
C   -0.698500   -1.209600    0.000000
C    0.698500   -1.209600    0.000000
H    2.481000    0.000000    0.000000
H    1.240500    2.148300    0.000000
H   -1.240500    2.148300    0.000000
H   -2.481000    0.000000    0.000000
H   -1.240500   -2.148300    0.000000
H    1.240500   -2.148300    0.000000`
  },
  caffeine: {
    label: "Caffeine",
    xyz: `24
caffeine approximate starter
C   -1.900000    0.200000    0.000000
N   -1.100000    1.200000    0.100000
C    0.200000    0.900000   -0.100000
N    0.700000   -0.400000    0.000000
C   -0.400000   -1.200000    0.100000
N   -1.600000   -0.900000   -0.100000
C    1.800000   -0.800000    0.200000
O    2.700000   -0.100000    0.100000
N    2.000000   -2.100000    0.100000
C    3.300000   -2.800000   -0.100000
C   -2.600000    1.400000    0.300000
C   -0.800000   -2.600000    0.200000
O   -0.200000    2.000000   -0.200000
H   -3.200000    0.100000    0.500000
H   -2.900000    2.200000   -0.200000
H   -2.800000    1.500000    1.300000
H   -0.100000   -3.000000   -0.400000
H   -1.800000   -3.000000   -0.100000
H   -0.600000   -2.900000    1.200000
H    3.900000   -2.200000   -0.500000
H    3.100000   -3.700000   -0.600000
H    3.800000   -3.000000    0.800000
H    1.300000   -2.600000    0.500000
H    0.900000    1.500000   -0.400000`
  }
};

const workflows = [
  {
    id: "single-point",
    group: "Ground state",
    title: "Ground-state single point",
    detail: "Small RHF/DFT starter for local OpenQP runs.",
    jobName: "water_hf_sp",
    runtype: "energy",
    method: "HF",
    functional: "",
    basis: "STO-3G",
    molecule: "water",
    states: 0,
    scfType: "rhf"
  },
  {
    id: "dft-gradient",
    group: "Ground state",
    title: "DFT gradient",
    detail: "Local gradient input with the generator-style properties block.",
    jobName: "water_b3lyp_grad",
    runtype: "grad",
    method: "DFT",
    functional: "B3LYP",
    basis: "6-31G(d)",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    extraSections: ["[properties]", "grad=0"]
  },
  {
    id: "optimize",
    group: "Ground state",
    title: "DFT geometry optimization",
    detail: "Editable optimization template for a closed-shell molecule.",
    jobName: "formaldehyde_b3lyp_opt",
    runtype: "optimize",
    method: "DFT",
    functional: "B3LYP",
    basis: "6-31G(d)",
    molecule: "formaldehyde",
    states: 0,
    scfType: "rhf",
    extraSections: ["[optimize]", "istate=0"]
  },
  {
    id: "tddft",
    group: "Excited states",
    title: "TDHF/TDDFT energy",
    detail: "Excited-state starter with an editable states block.",
    jobName: "ethylene_tdhf_energy",
    runtype: "energy",
    method: "TDHF",
    functional: "",
    basis: "cc-pVDZ",
    molecule: "ethylene",
    states: 5,
    inputMethod: "tdhf",
    tdhfType: "rpa",
    scfType: "rhf"
  },
  {
    id: "tdhf-gradient",
    group: "Excited states",
    title: "TDHF/TDDFT gradient",
    detail: "TDHF gradient starter with response settings exposed.",
    jobName: "ethylene_tdhf_grad",
    runtype: "grad",
    method: "TDHF",
    functional: "",
    basis: "cc-pVDZ",
    molecule: "ethylene",
    states: 5,
    inputMethod: "tdhf",
    tdhfType: "rpa",
    scfType: "rhf"
  },
  {
    id: "sf-tddft",
    group: "Excited states",
    title: "SF-TDDFT energy",
    detail: "Spin-flip TDDFT starter from the legacy generator templates.",
    jobName: "ethylene_sf_tddft",
    runtype: "energy",
    method: "SF-TDDFT",
    functional: "BHHLYP",
    basis: "cc-pVDZ",
    molecule: "ethylene",
    states: 5,
    inputMethod: "tdhf",
    tdhfType: "sf",
    scfType: "rohf",
    multiplicity: 3
  },
  {
    id: "sf-tddft-gradient",
    group: "Excited states",
    title: "SF-TDDFT gradient",
    detail: "Spin-flip gradient starter with properties grad=3.",
    jobName: "ethylene_sf_grad",
    runtype: "grad",
    method: "SF-TDDFT",
    functional: "BHHLYP",
    basis: "cc-pVDZ",
    molecule: "ethylene",
    states: 5,
    inputMethod: "tdhf",
    tdhfType: "sf",
    scfType: "rohf",
    multiplicity: 3,
    extraSections: ["[properties]", "grad=3"]
  },
  {
    id: "mrsf",
    group: "MRSF",
    title: "MRSF-TDDFT energy",
    detail: "Prepared as a reviewable template, not an online run.",
    jobName: "ethylene_mrsf_energy",
    runtype: "energy",
    method: "MRSF-TDDFT",
    functional: "BHHLYP",
    basis: "cc-pVDZ",
    molecule: "ethylene",
    states: 4,
    inputMethod: "tdhf",
    tdhfType: "mrsf",
    scfType: "rohf",
    multiplicity: 3
  },
  {
    id: "mrsf-gradient",
    group: "MRSF",
    title: "MRSF-TDDFT gradient",
    detail: "MRSF gradient starter with editable state controls.",
    jobName: "ethylene_mrsf_grad",
    runtype: "grad",
    method: "MRSF-TDDFT",
    functional: "BHHLYP",
    basis: "cc-pVDZ",
    molecule: "ethylene",
    states: 4,
    inputMethod: "tdhf",
    tdhfType: "mrsf",
    scfType: "rohf",
    multiplicity: 3,
    extraSections: ["[properties]", "grad=3"]
  },
  {
    id: "mrsf-optimize",
    group: "MRSF",
    title: "MRSF optimization",
    detail: "MRSF-TDDFT optimization starter with istate exposed.",
    jobName: "ethylene_mrsf_opt",
    runtype: "optimize",
    method: "MRSF-TDDFT",
    functional: "BHHLYP",
    basis: "cc-pVDZ",
    molecule: "ethylene",
    states: 4,
    istate: 1,
    inputMethod: "tdhf",
    tdhfType: "mrsf",
    scfType: "rohf",
    multiplicity: 3,
    extraSections: ["[optimize]", "istate={istate}"]
  },
  {
    id: "mrsf-mep",
    group: "MRSF",
    title: "MRSF MEP optimization",
    detail: "Minimum-energy-path starter adapted from the legacy generator.",
    jobName: "ethylene_mrsf_mep",
    runtype: "mep",
    method: "MRSF-TDDFT",
    functional: "BHHLYP",
    basis: "cc-pVDZ",
    molecule: "ethylene",
    states: 4,
    istate: 2,
    inputMethod: "tdhf",
    tdhfType: "mrsf",
    scfType: "rohf",
    multiplicity: 3,
    extraSections: [
      "[optimize]",
      "optimizer=bfgs",
      "maxit=100",
      "mep_maxit=2",
      "istate={istate}",
      "energy_shift=1e-3",
      "step_size=0.1",
      "step_tol=0.01",
      "rmsd_grad=3e-3",
      "max_grad=5e-3"
    ]
  },
  {
    id: "mrsf-meci",
    group: "MRSF",
    title: "MRSF MECI optimization",
    detail: "Conical-intersection starter with istate/jstate controls.",
    jobName: "ethylene_mrsf_meci",
    runtype: "meci",
    method: "MRSF-TDDFT",
    functional: "BHHLYP",
    basis: "cc-pVDZ",
    molecule: "ethylene",
    states: 4,
    istate: 1,
    jstate: 2,
    inputMethod: "tdhf",
    tdhfType: "mrsf",
    scfType: "rohf",
    multiplicity: 3,
    extraSections: [
      "[optimize]",
      "optimizer=bfgs",
      "maxit=50",
      "istate={istate}",
      "jstate={jstate}",
      "energy_shift=1e-5",
      "energy_gap=1e-4",
      "rmsd_grad=5e-4",
      "max_grad=1e-3"
    ]
  },
  {
    id: "hessian",
    group: "Properties",
    title: "DFT Hessian and frequencies",
    detail: "Closed-shell Hessian starter with normal-mode output.",
    jobName: "water_hessian_freq",
    runtype: "hess",
    method: "DFT",
    functional: "B3LYP",
    basis: "6-31G(d)",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    extraSections: ["[hess]", "type=analytical", "state=0", "clean=True"]
  },
  {
    id: "mrsf-hessian",
    group: "Properties",
    title: "MRSF numerical Hessian",
    detail: "MRSF Hessian starter from the legacy generator template.",
    jobName: "ethylene_mrsf_hessian",
    runtype: "hess",
    method: "MRSF-TDDFT",
    functional: "BHHLYP",
    basis: "cc-pVDZ",
    molecule: "ethylene",
    states: 4,
    inputMethod: "tdhf",
    tdhfType: "mrsf",
    scfType: "rohf",
    multiplicity: 3,
    extraSections: ["[hess]", "state=1"]
  },
  {
    id: "ir",
    group: "Properties",
    title: "IR spectrum",
    detail: "Frequency workflow with IR intensities in the Hessian sidecar.",
    jobName: "water_ir_spectrum",
    runtype: "hess",
    method: "DFT",
    functional: "B3LYP",
    basis: "6-31G(d)",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    extraSections: ["[hess]", "type=analytical", "state=0", "clean=True", "# IR intensities are emitted with the frequency data."]
  },
  {
    id: "raman",
    group: "Properties",
    title: "Raman spectrum",
    detail: "Frequency workflow with Raman activities and mode tensors.",
    jobName: "water_raman_spectrum",
    runtype: "hess",
    method: "DFT",
    functional: "B3LYP",
    basis: "6-31G(d)",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    extraSections: ["[hess]", "type=analytical", "state=0", "clean=True", "# Raman activities are emitted with the frequency data."]
  },
  {
    id: "nmr",
    group: "Properties",
    title: "NMR shielding",
    detail: "Starter for NMR shielding workflows; review build-specific keywords.",
    jobName: "water_nmr_shielding",
    runtype: "prop",
    method: "DFT",
    functional: "B3LYP",
    basis: "pcSseg-1",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    extraSections: [
      "[properties]",
      "scf_prop=el_mom,mulliken",
      "export=true",
      "# nmr=shielding",
      "# NMR shielding support is OpenQP-version dependent; replace with the exact keyword for your build."
    ]
  },
  {
    id: "pcm",
    group: "Properties",
    title: "PCM solvent single point",
    detail: "Solvent-effect starter with a reviewable PCM/ddPCM block.",
    jobName: "water_pcm_sp",
    runtype: "energy",
    method: "DFT",
    functional: "B3LYP",
    basis: "6-31G(d)",
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
    group: "Properties",
    title: "MRSF-EKT IP/EA",
    detail: "Ionization/electron-affinity starter with structured EKT output.",
    jobName: "water_mrsf_ekt_ip",
    runtype: "ekt",
    method: "MRSF-TDDFT",
    functional: "BHHLYP",
    basis: "6-31G",
    molecule: "water",
    states: 10,
    inputMethod: "tdhf",
    tdhfType: "mrsf",
    scfType: "rohf",
    multiplicity: 3,
    extraSections: ["[ekt]", "ip=True", "ea=False"]
  },
  {
    id: "orbitals-density",
    group: "Visualization",
    title: "MO and density export",
    detail: "Save Molden/mol data for MO, density, spin-density, and ESP viewing.",
    jobName: "water_mo_density",
    runtype: "energy",
    method: "DFT",
    functional: "B3LYP",
    basis: "6-31G(d)",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    saveMol: true,
    surfaceMode: "density",
    extraSections: [
      "# Use saved Molden/mol data with a local cube or viewer tool for true MO, density, spin-density, and ESP surfaces."
    ]
  }
];

const resultPreviews = {
  "single-point": {
    title: "Energy and SCF summary",
    items: ["Final SCF energy and convergence history", "Mulliken charges and dipole-style properties when requested", "Molden orbitals when save_molden is enabled"],
    sample: `OpenQP local output
final_scf_energy_hartree: -74.963123456
scf_iterations: 8
converged: true`
  },
  "dft-gradient": {
    title: "Gradient output",
    items: ["Final energy", "Cartesian gradient by atom", "Gradient norm for downstream optimization checks"],
    sample: `Gradient summary
atom          gx            gy            gz
O        0.000001    -0.000002     0.000004
H       -0.000003     0.000001    -0.000002`
  },
  optimize: {
    title: "Optimized structure",
    items: ["Final energy and gradient norm", "Optimized Cartesian coordinates", "Trajectory-style geometry steps from the local run"],
    sample: `Optimization summary
step    energy_hartree       max_gradient
  1     -114.22180432        2.1e-03
  5     -114.22911877        8.4e-06`
  },
  tddft: {
    title: "Excited-state roots",
    items: ["Vertical excitation energies", "Oscillator strengths and response-vector data where enabled", "Molden orbitals for the reference state"],
    sample: `TDHF/TDDFT roots
state   energy_eV   oscillator_strength
  1       7.21            0.018
  2       8.44            0.116`
  },
  "tdhf-gradient": {
    title: "Excited-state gradient",
    items: ["Selected-root gradient", "Reference energy and state data", "Structure-ready gradient block for local review"],
    sample: `TDHF gradient preview
root: 1
max_gradient: 3.8e-04
rms_gradient: 1.2e-04`
  },
  "sf-tddft": {
    title: "Spin-flip states",
    items: ["SF-TDDFT response-state energies", "Spin-flip root labels from local output", "Reference-state diagnostics"],
    sample: `SF-TDDFT roots
state   relative_eV
  1        0.00
  2        2.63`
  },
  "sf-tddft-gradient": {
    title: "Spin-flip gradient",
    items: ["SF response gradient", "properties grad=3 output", "State-resolved local result files"],
    sample: `SF-TDDFT gradient
state: 1
max_gradient: 5.1e-04`
  },
  mrsf: {
    title: "MRSF-TDDFT roots",
    items: ["Spin-flip/MRSF response-state energies", "State vectors and MRSF density terms in structured output", "Reference and active settings for local review"],
    sample: `MRSF-TDDFT summary
state   relative_eV   dominant_character
  1        0.00        reference
  2        3.12        single excitation`
  },
  "mrsf-gradient": {
    title: "MRSF gradient",
    items: ["Selected MRSF root gradient", "Response convergence history", "Geometry-ready local output"],
    sample: `MRSF gradient preview
root: 1
max_gradient: 4.6e-04`
  },
  "mrsf-optimize": {
    title: "MRSF optimized structure",
    items: ["MRSF-state optimization path", "Final geometry", "State-resolved energy history"],
    sample: `MRSF optimization
istate: 1
final_max_gradient: 8.9e-05`
  },
  "mrsf-mep": {
    title: "MRSF MEP path",
    items: ["Minimum-energy-path optimization steps", "State energy changes", "Downloadable trajectory from local logs"],
    sample: `MEP preview
mep_step: 2
step_size: 0.1
energy_shift: 1e-3`
  },
  "mrsf-meci": {
    title: "MRSF MECI result",
    items: ["Conical-intersection optimization metrics", "i-state/j-state energy gap", "Final geometry for local validation"],
    sample: `MECI preview
istate: 1
jstate: 2
energy_gap: 8.0e-05`
  },
  hessian: {
    title: "Hessian and normal modes",
    items: ["Vibrational frequencies", "Normal-mode eigenvectors", "Frequency sidecar data for downstream plotting"],
    sample: `Frequency table
mode   frequency_cm-1      IR_km_mol      Raman_activity
  1       1595.42             42.1              5.7`
  },
  "mrsf-hessian": {
    title: "MRSF Hessian",
    items: ["State-specific Hessian request", "Normal-mode sidecar data", "Local frequency analysis artifacts"],
    sample: `MRSF Hessian preview
state: 1
nstate: 4
artifact: ethylene_mrsf_hessian.hess.json`
  },
  ir: {
    title: "IR spectrum",
    items: ["Frequency table with IR intensities", "Mode dipole derivatives in the Hessian sidecar", "Downloadable data ready for local plotting"],
    sample: `IR stick spectrum
mode   frequency_cm-1      intensity_km_mol
  1       1595.42              42.1`
  },
  raman: {
    title: "Raman spectrum",
    items: ["Frequency table with Raman activities", "Mode polarizability derivatives in the Hessian sidecar", "Downloadable mode data for local spectrum broadening"],
    sample: `Raman activity table
mode   frequency_cm-1      activity
  1       1595.42             5.7`
  },
  nmr: {
    title: "NMR shielding output",
    items: ["Shielding tensors and isotropic shielding when enabled by the OpenQP build", "Reference SCF properties included in the starter input", "Template keeps version-dependent NMR keywords as review comments"],
    sample: `NMR shielding preview
atom   sigma_iso_ppm   anisotropy
 O       321.4           47.2`
  },
  pcm: {
    title: "Solvent-corrected energy",
    items: ["Gas-phase and solvent-corrected energy terms", "Reaction-field contribution when PCM/ddPCM is enabled", "PCM block is commented until exact build keywords are confirmed"],
    sample: `PCM energy preview
gas_phase_energy_hartree:      -76.41234567
solvated_energy_hartree:       -76.42190231`
  },
  ekt: {
    title: "MRSF-EKT IP/EA results",
    items: ["EKT eigenvalues in Hartree/eV", "Pole strengths for ionization or electron attachment", "Dyson-like orbital data in structured output"],
    sample: `MRSF-EKT summary
root   IP_eV    pole_strength
  1    10.42       0.83`
  },
  "orbitals-density": {
    title: "MO, density, spin-density, and ESP assets",
    items: ["Molden orbital file for HOMO/LUMO inspection", "Saved mol data for local post-processing into cube grids", "Viewer modes here are local previews, not calculated surfaces"],
    sample: `Expected local artifacts
water_mo_density.log
water_mo_density.molden
HOMO.cube
electron_density.cube`
  }
};

const basisOptions = [
  "STO-3G", "3-21G", "4-31G", "5-21G", "6-21G", "6-31G", "6-31G(d)", "6-31G*", "6-31G(d,p)",
  "6-31+G", "6-31+G(d)", "6-31++G", "6-31++G(d,p)", "6-311G", "6-311G(d)", "6-311G(d,p)",
  "6-311+G", "6-311+G(d,p)", "6-311++G", "6-311++G(d,p)", "cc-pVDZ", "cc-pVTZ", "cc-pVQZ",
  "cc-pV5Z", "cc-pCVDZ", "cc-pCVTZ", "aug-cc-pVDZ", "aug-cc-pVTZ", "aug-cc-pVQZ", "jun-cc-pVDZ",
  "jul-cc-pVDZ", "def2-SV(P)", "def2-SVP", "def2-SVPD", "def2-TZVP", "def2-TZVPP", "def2-TZVPD",
  "def2-TZVPPD", "def2-QZVP", "def2-QZVPP", "def2-Universal-JKFIT", "LANL2DZ", "LANL2TZ", "LANL08",
  "DGAUSS-DZVP", "DGAUSS-TZVP", "ANO-RCC-VDZP", "ANO-RCC-VTZP", "ANO-RCC-VQZP", "pc-0", "pc-1",
  "pc-2", "pc-3", "aug-pc-1", "aug-pc-2", "pcSseg-1", "pcSseg-2", "aug-pcSseg-1", "aug-pcSseg-2",
  "pcJ-1", "pcJ-2", "IGLO-II", "IGLO-III", "Sapporo-DZP", "Sapporo-TZP", "x2c-SVPall", "x2c-TZVPall"
];

const functionalOptions = [
  "HFEX", "SLATER", "PBE", "PBEPBE", "REVPBE", "RPBE", "PW91", "PBESOL", "BLYP", "OLYP", "XLYP",
  "BOP", "BP86", "B97", "B97-1", "B97-2", "B97-3", "B97-K", "B3LYP", "B3LYP*", "REVB3LYP",
  "PBE0", "PBE1PBE", "BHHLYP", "B1LYP", "B1PW91", "B3PW91", "O3LYP", "X3LYP", "CAM-B3LYP",
  "LC-BLYP", "LC-WPBE", "WB97", "WB97X", "HSE03", "HSE06", "TPSS", "REVTPSS", "TPSSH", "SCAN",
  "R2SCAN", "SCAN0", "M06-L", "M06", "M06-2X", "M06-HF", "M11", "M11-L", "MN12-L", "MN15",
  "BMK", "B2-PLYP", "B2GP-PLYP", "PBE0-DH", "SCAN-QIDH", "TPSS-QIDH", "TUNEDCAM"
];

const state = {
  workflow: workflows[0],
  analysisXYZ: molecules.caffeine.xyz
};

const viewerState = {
  style: "ball-stick",
  labels: false,
  numbers: false,
  axis: false,
  spin: true
};

let renderer;
let scene;
let camera;
let moleculeRoot;
let lastMoleculeSignature = "";
let fallbackMode = false;
let dragging = false;
let lastPointer = { x: 0, y: 0 };
let viewerDebugFrame = 0;
const viewerDebugStats = {
  width: 0,
  height: 0,
  samplePixels: 0,
  nonzero: 0,
  bright: 0,
  redish: 0,
  greenish: 0,
  blueish: 0,
  updatedAt: 0
};

window.openqpWebDebug = {
  viewerStats: () => ({ ...viewerDebugStats })
};

const atomStyles = {
  H: { color: 0xf4f7fb, radius: 0.22, covalent: 0.31, vdw: 1.2 },
  He: { color: 0xd9ffff, radius: 0.3, covalent: 0.28, vdw: 1.4 },
  B: { color: 0xffb86c, radius: 0.34, covalent: 0.84, vdw: 1.92 },
  C: { color: 0x404a55, radius: 0.34, covalent: 0.76, vdw: 1.7 },
  N: { color: 0x2c67d8, radius: 0.34, covalent: 0.71, vdw: 1.55 },
  O: { color: 0xd84c3f, radius: 0.36, covalent: 0.66, vdw: 1.52 },
  F: { color: 0x67b857, radius: 0.32, covalent: 0.57, vdw: 1.47 },
  P: { color: 0xe56b36, radius: 0.44, covalent: 1.07, vdw: 1.8 },
  S: { color: 0xd8b72c, radius: 0.42, covalent: 1.05, vdw: 1.8 },
  Cl: { color: 0x4fad47, radius: 0.45, covalent: 1.02, vdw: 1.75 },
  Br: { color: 0x8e493a, radius: 0.48, covalent: 1.2, vdw: 1.85 },
  I: { color: 0x7046a1, radius: 0.52, covalent: 1.39, vdw: 1.98 },
  Fe: { color: 0xd07a55, radius: 0.52, covalent: 1.24, vdw: 2.04 },
  Cu: { color: 0xc88745, radius: 0.54, covalent: 1.32, vdw: 1.96 },
  Zn: { color: 0x8a99c7, radius: 0.52, covalent: 1.22, vdw: 2.01 },
  Ag: { color: 0xc8d4df, radius: 0.58, covalent: 1.45, vdw: 2.11 },
  Au: { color: 0xf4c542, radius: 0.58, covalent: 1.36, vdw: 2.14 },
  U: { color: 0x4ab16d, radius: 0.64, covalent: 1.96, vdw: 2.4 }
};

const fallbackAtom = { color: 0x8aa1b4, radius: 0.34, covalent: 0.75, vdw: 2.0 };

const atomicSymbols = [
  "",
  "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne",
  "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca",
  "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn",
  "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr",
  "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn",
  "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd",
  "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb",
  "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg",
  "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th",
  "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm",
  "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds",
  "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"
];

const promptMoleculeAliases = {
  water: "water",
  h2o: "water",
  formaldehyde: "formaldehyde",
  methanal: "formaldehyde",
  ethylene: "ethylene",
  ethene: "ethylene",
  benzene: "benzene",
  caffeine: "caffeine"
};

const publicMoleculeNames = [
  "benzene", "caffeine", "aspirin", "methane", "ammonia", "ethanol", "methanol", "acetone",
  "acetonitrile", "carbon dioxide", "co2", "nitrogen", "oxygen", "naphthalene", "phenol", "pyridine"
];

const dom = {};

function init() {
  const page = document.body.dataset.page;
  if (page === "home") initHomePage();
  if (page === "workflow") initWorkflowPage();
  if (page === "analysis") initAnalysisPage();
}

function initHomePage() {
  const form = document.querySelector("#landingPromptForm");
  const prompt = document.querySelector("#landingPrompt");
  const examples = document.querySelector("#landingPromptExamples");
  const workflowSelect = document.querySelector("#workflowExampleSelect");
  const workflowDetail = document.querySelector("#workflowExampleDetail");
  const workflowLink = document.querySelector("#openWorkflowExample");

  if (workflowSelect && workflowDetail && workflowLink) {
    workflowSelect.replaceChildren(
      ...workflows.map((workflow) => {
        const option = document.createElement("option");
        option.value = workflow.id;
        option.textContent = `${workflow.group}: ${workflow.title}`;
        return option;
      })
    );
    workflowSelect.value = "single-point";
    updateWorkflowExampleDetail(workflowById(workflowSelect.value), workflowDetail, workflowLink);
    workflowSelect.addEventListener("change", () => {
      updateWorkflowExampleDetail(workflowById(workflowSelect.value), workflowDetail, workflowLink);
    });
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    openPromptWorkflow(prompt?.value || "");
  });
  examples?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-prompt]");
    if (!button) return;
    openPromptWorkflow(button.dataset.prompt);
  });

  state.analysisXYZ = molecules.caffeine.xyz;
  setupMoleculeViewer();
  updateMoleculeViewer();
}

function updateWorkflowExampleDetail(workflow, detail, link) {
  const states = workflow.states ? `${workflow.states} state${workflow.states === 1 ? "" : "s"}` : "ground-state";
  const functional = workflow.functional ? `, ${workflow.functional}` : "";
  const method = `${workflow.method}${functional}/${workflow.basis}`;
  link.href = `/workflow.html?workflow=${encodeURIComponent(workflow.id)}`;
  detail.innerHTML = `
    <span class="tag">${workflow.group}</span>
    <h3>${workflow.title}</h3>
    <p>${workflow.detail}</p>
    <dl>
      <div><dt>Default</dt><dd>${method}</dd></div>
      <div><dt>Molecule</dt><dd>${molecules[workflow.molecule]?.label || "Custom"}</dd></div>
      <div><dt>Run type</dt><dd>${workflow.runtype}</dd></div>
      <div><dt>States</dt><dd>${states}</dd></div>
    </dl>
  `;
}

function openPromptWorkflow(prompt) {
  const clean = prompt.trim();
  const workflow = clean ? parsePlainTextRequest(clean).workflow : workflows[0];
  const url = new URL("/workflow.html", window.location.origin);
  url.searchParams.set("workflow", workflow.id);
  if (clean) url.searchParams.set("prompt", clean);
  window.location.href = url.pathname + url.search;
}

function initWorkflowPage() {
  captureWorkflowDom();
  setupOptionLists();
  setupMoleculeSelector();
  setupWorkflowSelector();
  setupMoleculeViewer();
  setupViewerControls();
  setupViewerImport();
  setupBuilderEvents();

  const params = new URLSearchParams(window.location.search);
  const requestedWorkflow = workflowById(params.get("workflow") || "");
  applyWorkflow(requestedWorkflow);

  const prompt = params.get("prompt");
  if (prompt) {
    dom.chatPrompt.value = prompt;
    handleChatPrompt(prompt, { silentUser: true });
  }
}

function captureWorkflowDom() {
  Object.assign(dom, {
    workflowSelect: document.querySelector("#workflowSelect"),
    workflowTitle: document.querySelector("#workflowTitle"),
    workflowDetail: document.querySelector("#workflowDetail"),
    moleculeSelect: document.querySelector("#molecule"),
    form: document.querySelector("#inputForm"),
    preview: document.querySelector("#preview"),
    resultTitle: document.querySelector("#resultTitle"),
    resultList: document.querySelector("#resultList"),
    resultSample: document.querySelector("#resultSample"),
    chatForm: document.querySelector("#chatForm"),
    chatPrompt: document.querySelector("#chatPrompt"),
    chatLog: document.querySelector("#chatLog"),
    promptExamples: document.querySelector("#promptExamples"),
    xyzInput: document.querySelector("#xyzInput"),
    xyzFile: document.querySelector("#xyzFile"),
    xyzStatus: document.querySelector("#xyzStatus"),
    pubchemQuery: document.querySelector("#pubchemQuery"),
    pubchemSearch: document.querySelector("#pubchemSearch"),
    pubchemStatus: document.querySelector("#pubchemStatus"),
    surfaceMode: document.querySelector("#surfaceMode"),
    jobName: document.querySelector("#jobName"),
    charge: document.querySelector("#charge"),
    multiplicity: document.querySelector("#multiplicity"),
    method: document.querySelector("#method"),
    functional: document.querySelector("#functional"),
    basis: document.querySelector("#basis"),
    states: document.querySelector("#states"),
    istate: document.querySelector("#istate"),
    jstate: document.querySelector("#jstate"),
    conv: document.querySelector("#conv"),
    notes: document.querySelector("#notes"),
    moleculeLabel: document.querySelector("#moleculeLabel"),
    moleculeCanvas: document.querySelector("#moleculeCanvas"),
    moleculeFallback: document.querySelector("#moleculeFallback"),
    viewerDataFile: document.querySelector("#viewerDataFile"),
    viewerDataInput: document.querySelector("#viewerDataInput"),
    viewerDataStatus: document.querySelector("#viewerDataStatus")
  });
}

function setupWorkflowSelector() {
  if (!dom.workflowSelect) return;
  dom.workflowSelect.replaceChildren(
    ...workflows.map((workflow) => {
      const option = document.createElement("option");
      option.value = workflow.id;
      option.textContent = `${workflow.group}: ${workflow.title}`;
      return option;
    })
  );
  dom.workflowSelect.addEventListener("change", () => {
    applyWorkflow(workflowById(dom.workflowSelect.value));
    replaceWorkflowUrl(state.workflow.id);
  });
}

function setupOptionLists() {
  populateDatalist("#basisOptions", basisOptions);
  populateDatalist("#functionalOptions", functionalOptions);
}

function populateDatalist(selector, values) {
  const list = document.querySelector(selector);
  if (!list) return;
  list.replaceChildren(
    ...values.map((value) => {
      const option = document.createElement("option");
      option.value = value;
      return option;
    })
  );
}

function setupMoleculeSelector() {
  if (!dom.moleculeSelect) return;
  dom.moleculeSelect.replaceChildren(
    ...Object.entries(molecules).map(([key, molecule]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = molecule.label;
      return option;
    })
  );
}

function setupBuilderEvents() {
  dom.chatForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await handleChatPrompt(dom.chatPrompt.value);
  });
  dom.promptExamples?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-prompt]");
    if (!button) return;
    dom.chatPrompt.value = button.dataset.prompt;
    await handleChatPrompt(button.dataset.prompt);
  });
  dom.form?.addEventListener("input", renderPreview);
  dom.form?.addEventListener("change", (event) => {
    if (event.target === dom.moleculeSelect) {
      loadPresetMolecule(dom.moleculeSelect.value);
    }
    if (event.target !== dom.xyzFile) renderPreview();
  });
  dom.xyzFile?.addEventListener("change", loadXyzFile);
  dom.pubchemSearch?.addEventListener("click", () => importFromPubChem());
  dom.pubchemQuery?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      importFromPubChem();
    }
  });
  document.querySelector("#resetMolecule")?.addEventListener("click", () => {
    loadPresetMolecule(dom.moleculeSelect.value);
    renderPreview();
  });
  dom.surfaceMode?.addEventListener("change", () => {
    lastMoleculeSignature = "";
    renderPreview();
  });
  document.querySelector("#downloadInput")?.addEventListener("click", downloadInput);
  document.querySelector("#downloadXyz")?.addEventListener("click", downloadXyz);
  document.querySelector("#copyInput")?.addEventListener("click", copyInput);
}

function replaceWorkflowUrl(workflowId) {
  const url = new URL(window.location.href);
  url.searchParams.set("workflow", workflowId);
  url.searchParams.delete("prompt");
  window.history.replaceState({}, "", url.pathname + url.search);
}

function applyWorkflow(workflow) {
  state.workflow = workflow;
  if (dom.workflowSelect) dom.workflowSelect.value = workflow.id;
  if (dom.workflowTitle) dom.workflowTitle.textContent = workflow.title;
  if (dom.workflowDetail) dom.workflowDetail.textContent = workflow.detail;
  if (dom.jobName) dom.jobName.value = workflow.jobName;
  if (dom.method) dom.method.value = workflow.method;
  if (dom.functional) dom.functional.value = workflow.functional || "";
  if (dom.basis) dom.basis.value = workflow.basis;
  if (dom.charge) dom.charge.value = workflow.charge ?? 0;
  if (dom.multiplicity) dom.multiplicity.value = workflow.multiplicity ?? 1;
  if (dom.states) dom.states.value = workflow.states ?? 0;
  if (dom.istate) dom.istate.value = workflow.istate ?? 0;
  if (dom.jstate) dom.jstate.value = workflow.jstate ?? 1;
  if (dom.surfaceMode) dom.surfaceMode.value = workflow.surfaceMode || "molecule";
  if (dom.moleculeSelect) dom.moleculeSelect.value = workflow.molecule;
  loadPresetMolecule(workflow.molecule);
  renderPreview();
}

async function handleChatPrompt(rawPrompt, options = {}) {
  const prompt = rawPrompt.trim();
  if (!prompt) {
    addChatMessage("assistant", "Add a short request such as: Raman for water with B3LYP/6-31G(d).");
    return;
  }

  if (!options.silentUser) addChatMessage("user", prompt);
  if (dom.chatPrompt) dom.chatPrompt.value = "";

  const suggestion = parsePlainTextRequest(prompt);
  applyWorkflow(suggestion.workflow);
  replaceWorkflowUrl(suggestion.workflow.id);

  if (suggestion.method) dom.method.value = suggestion.method;
  if (suggestion.functional) dom.functional.value = suggestion.functional;
  if (suggestion.basis) dom.basis.value = suggestion.basis;
  if (Number.isInteger(suggestion.charge)) dom.charge.value = suggestion.charge;
  if (Number.isInteger(suggestion.multiplicity)) dom.multiplicity.value = suggestion.multiplicity;
  if (Number.isInteger(suggestion.states)) dom.states.value = suggestion.states;
  if (Number.isInteger(suggestion.istate)) dom.istate.value = suggestion.istate;
  if (Number.isInteger(suggestion.jstate)) dom.jstate.value = suggestion.jstate;
  if (suggestion.surfaceMode) dom.surfaceMode.value = suggestion.surfaceMode;

  let importResult = null;
  if (suggestion.moleculeKey) {
    dom.moleculeSelect.value = suggestion.moleculeKey;
    loadPresetMolecule(suggestion.moleculeKey);
  } else if (suggestion.moleculeQuery) {
    importResult = await importFromPubChem(suggestion.moleculeQuery);
  }

  dom.notes.value = `Generated from plain-text request: ${prompt}`;
  lastMoleculeSignature = "";
  renderPreview();
  addChatMessage("assistant", summarizePromptSuggestion(suggestion, importResult));
}

function parsePlainTextRequest(prompt) {
  const lower = prompt.toLowerCase();
  return {
    workflow: detectWorkflow(lower),
    method: detectMethod(lower),
    functional: detectFunctional(prompt, lower),
    basis: detectBasis(prompt, lower),
    charge: detectCharge(lower),
    multiplicity: detectMultiplicity(lower),
    states: detectStates(lower),
    istate: detectNamedState(lower, "istate"),
    jstate: detectNamedState(lower, "jstate"),
    surfaceMode: detectSurfaceMode(lower),
    ...detectMolecule(prompt, lower)
  };
}

function detectWorkflow(lower) {
  if (hasAny(lower, ["meci", "conical intersection"])) return workflowById("mrsf-meci");
  if (hasAny(lower, ["mep", "minimum energy path"])) return workflowById("mrsf-mep");
  if (hasAny(lower, ["ekt", "ionization", "electron affinity", "ip/ea"])) return workflowById("ekt");
  if (hasAny(lower, ["nmr", "shielding"])) return workflowById("nmr");
  if (hasAny(lower, ["raman"])) return workflowById("raman");
  if (/\bir\b/.test(lower) || hasAny(lower, ["infrared"])) return workflowById("ir");
  if (hasAny(lower, ["pcm", "ddpcm", "solvent", "solvation"])) return workflowById("pcm");
  if (hasAny(lower, ["mrsf"]) && hasAny(lower, ["hessian", "frequency", "frequencies"])) return workflowById("mrsf-hessian");
  if (hasAny(lower, ["hessian", "frequency", "frequencies", "vibration", "vibrational"])) return workflowById("hessian");
  if (/\bmo\b/.test(lower) || hasAny(lower, ["orbital", "homo", "lumo", "electron density", "spin density", "esp", "electrostatic"])) return workflowById("orbitals-density");
  if (hasAny(lower, ["mrsf"]) && hasAny(lower, ["optimize", "optimization", "geometry opt", "relax"])) return workflowById("mrsf-optimize");
  if (hasAny(lower, ["mrsf"]) && hasAny(lower, ["gradient", "grad"])) return workflowById("mrsf-gradient");
  if (hasAny(lower, ["mrsf", "spin flip mrsf"])) return workflowById("mrsf");
  if (hasAny(lower, ["sf-tddft", "spin flip", "spin-flip"]) && hasAny(lower, ["gradient", "grad"])) return workflowById("sf-tddft-gradient");
  if (hasAny(lower, ["sf-tddft", "spin flip", "spin-flip"])) return workflowById("sf-tddft");
  if (hasAny(lower, ["tddft", "td-dft", "tdhf", "absorption", "excited state", "excited-state"]) && hasAny(lower, ["gradient", "grad"])) return workflowById("tdhf-gradient");
  if (hasAny(lower, ["tddft", "td-dft", "tdhf", "absorption", "excited state", "excited-state"])) return workflowById("tddft");
  if (hasAny(lower, ["optimize", "optimization", "geometry opt", "relax"])) return workflowById("optimize");
  if (hasAny(lower, ["gradient", "grad"])) return workflowById("dft-gradient");
  return workflowById("single-point");
}

function detectMethod(lower) {
  if (hasAny(lower, ["mrsf", "ekt"])) return "MRSF-TDDFT";
  if (hasAny(lower, ["sf-tddft", "spin flip", "spin-flip"])) return "SF-TDDFT";
  if (hasAny(lower, ["tdhf", "tddft", "td-dft"])) return "TDHF";
  if (/\bhf\b/.test(lower) || hasAny(lower, ["hartree-fock", "hartree fock"])) return "HF";
  if (detectFunctional("", lower)) return "DFT";
  return "";
}

function detectFunctional(prompt, lower) {
  const normalized = lower.replace(/\s+/g, "");
  const match = functionalOptions.find((name) => normalized.includes(name.toLowerCase().replace(/[^a-z0-9]/g, "")));
  if (match) return match;
  const explicit = prompt.match(/\bfunctional\s*=?\s*([A-Za-z0-9+*()/-]+)/i);
  return explicit ? explicit[1] : "";
}

function detectBasis(prompt, lower) {
  const normalized = lower.replace(/\s+/g, "");
  const match = basisOptions.find((name) => normalized.includes(name.toLowerCase().replace(/[^a-z0-9]/g, "")));
  if (match) return match;
  const explicit = prompt.match(/\bbasis\s*=?\s*([A-Za-z0-9+*()/-]+)/i);
  return explicit ? explicit[1] : "";
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

function detectStates(lower) {
  const explicit = lower.match(/\b(?:nstate|states?)\s*=?\s*(\d+)/) || lower.match(/\b(\d+)\s+(?:states?|roots?)\b/);
  return explicit ? Number(explicit[1]) : null;
}

function detectNamedState(lower, name) {
  const explicit = lower.match(new RegExp(`\\b${name}\\s*=?\\s*(\\d+)`));
  return explicit ? Number(explicit[1]) : null;
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
  const extracted = prompt.match(/\b(?:for|of|on)\s+([A-Za-z0-9][A-Za-z0-9 +'()\-]{1,48}?)(?=\s+(?:with|using|at|in|and|charge|basis|method|functional|multiplicity|singlet|doublet|triplet|neutral|anion|cation|please|states?|istate|jstate)\b|[.!?]?$)/i);
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

function addChatMessage(role, message) {
  if (!dom.chatLog) return;
  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${role}`;
  const speaker = document.createElement("strong");
  speaker.textContent = role === "user" ? "You" : "OpenQP Web";
  const text = document.createElement("p");
  text.textContent = message;
  wrapper.append(speaker, text);
  dom.chatLog.append(wrapper);
  dom.chatLog.scrollTop = dom.chatLog.scrollHeight;
}

function summarizePromptSuggestion(suggestion, importResult) {
  const moleculeText = moleculeSummary(suggestion, importResult);
  const surfaceText = dom.surfaceMode.value === "molecule" ? "" : ` Viewer: ${selectedText(dom.surfaceMode)}.`;
  return [
    `Generated ${suggestion.workflow.title}.`,
    moleculeText,
    `Method: ${dom.method.value}; functional: ${dom.functional.value || "none"}; basis: ${dom.basis.value}; states: ${dom.states.value}.`,
    `${surfaceText} Review the generated input before running OpenQP locally.`
  ].filter(Boolean).join(" ");
}

function moleculeSummary(suggestion, importResult) {
  if (suggestion.moleculeKey) return `Molecule: ${molecules[suggestion.moleculeKey].label}.`;
  if (importResult?.ok) return `Imported PubChem CID ${importResult.cid} (${importResult.recordType.toUpperCase()}) into the XYZ editor.`;
  if (suggestion.moleculeQuery) return `I set the workflow, but PubChem did not return coordinates for "${suggestion.moleculeQuery}".`;
  return `Molecule: ${moleculeDisplayLabel()}.`;
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

function selectedText(select) {
  return select.options[select.selectedIndex]?.textContent || select.value;
}

function safeJobName() {
  return dom.jobName?.value.trim().replace(/[^a-zA-Z0-9_.-]/g, "_") || "openqp_job";
}

function normalizeXYZText(text) {
  return (text || "").replace(/\r/g, "").trim();
}

function currentXYZText() {
  if (dom.xyzInput) return normalizeXYZText(dom.xyzInput.value) || molecules[dom.moleculeSelect?.value || "water"].xyz;
  return normalizeXYZText(state.analysisXYZ) || molecules.caffeine.xyz;
}

function xyzBody() {
  return currentXYZText();
}

function loadPresetMolecule(key) {
  if (!dom.xyzInput || !molecules[key]) return;
  dom.xyzInput.value = molecules[key].xyz;
  lastMoleculeSignature = "";
}

async function loadXyzFile() {
  const [file] = dom.xyzFile.files;
  if (!file) return;
  dom.xyzInput.value = await file.text();
  dom.xyzFile.value = "";
  lastMoleculeSignature = "";
  setStatusText(dom.pubchemStatus, "Loaded local XYZ file", "ok");
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
  const response = await fetch(pubChemPath(query, recordType), { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`PubChem returned ${response.status}`);
  return response.json();
}

async function importFromPubChem(queryOverride = "") {
  const query = (queryOverride || dom.pubchemQuery?.value || "").trim();
  if (!query) {
    setStatusText(dom.pubchemStatus, "Enter a compound name or CID.", "error");
    return { ok: false, reason: "empty" };
  }

  if (dom.pubchemQuery) dom.pubchemQuery.value = query;
  if (dom.pubchemSearch) dom.pubchemSearch.disabled = true;
  setStatusText(dom.pubchemStatus, "Searching PubChem...", "");

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
    dom.xyzInput.value = xyz;
    lastMoleculeSignature = "";
    setStatusText(dom.pubchemStatus, `Imported PubChem CID ${cid} (${recordType.toUpperCase()})`, "ok");
    renderPreview();
    return { ok: true, cid, recordType };
  } catch (error) {
    setStatusText(dom.pubchemStatus, "No PubChem coordinates found for that query.", "error");
    return { ok: false, reason: "not_found" };
  } finally {
    if (dom.pubchemSearch) dom.pubchemSearch.disabled = false;
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
  const lines = normalizeXYZText(xyz).split("\n").map((line) => line.trim()).filter(Boolean);
  return /^\d+$/.test(lines[0] || "") ? lines.slice(2) : lines;
}

function declaredAtomCount(xyz) {
  const [firstLine = ""] = normalizeXYZText(xyz).split("\n");
  return /^\d+$/.test(firstLine.trim()) ? Number(firstLine.trim()) : null;
}

function moleculeDisplayLabel() {
  if (!dom.moleculeSelect) return analysisTitleFromXYZ();
  const preset = molecules[dom.moleculeSelect.value];
  if (!preset) return "Custom XYZ";
  return normalizeXYZText(preset.xyz) === xyzBody() ? preset.label : "Custom XYZ";
}

function analysisTitleFromXYZ() {
  const lines = normalizeXYZText(state.analysisXYZ).split("\n");
  if (/^\d+$/.test(lines[0]?.trim() || "")) return lines[1]?.trim() || "Loaded structure";
  return "Loaded structure";
}

function updateXYZStatus(atoms = parseXYZ(xyzBody())) {
  if (!dom.xyzStatus) return;
  const declaredCount = declaredAtomCount(xyzBody());
  let text = `${atoms.length} atom${atoms.length === 1 ? "" : "s"} loaded locally`;
  let stateName = "ok";
  if (atoms.length === 0) {
    text = "Paste full XYZ text: atom count, title line, then coordinates.";
    stateName = "error";
  } else if (declaredCount === null) {
    text = `${atoms.length} coordinate line${atoms.length === 1 ? "" : "s"} found; add an XYZ atom-count header before running.`;
    stateName = "error";
  } else if (declaredCount !== atoms.length) {
    text = `XYZ count says ${declaredCount}; found ${atoms.length} coordinate line${atoms.length === 1 ? "" : "s"}.`;
    stateName = "error";
  }
  setStatusText(dom.xyzStatus, text, stateName);
}

function setupMoleculeViewer() {
  dom.moleculeCanvas ||= document.querySelector("#moleculeCanvas");
  dom.moleculeFallback ||= document.querySelector("#moleculeFallback");
  dom.moleculeLabel ||= document.querySelector("#moleculeLabel");
  dom.surfaceMode ||= document.querySelector("#surfaceMode");
  if (!dom.moleculeCanvas) return;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.35, 6.2);

  try {
    renderer = new THREE.WebGLRenderer({ canvas: dom.moleculeCanvas, antialias: true, alpha: true });
  } catch (error) {
    fallbackMode = true;
    dom.moleculeCanvas.classList.add("is-hidden");
    dom.moleculeFallback?.classList.add("is-visible");
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

  dom.moleculeCanvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    lastPointer = { x: event.clientX, y: event.clientY };
    dom.moleculeCanvas.setPointerCapture(event.pointerId);
  });
  dom.moleculeCanvas.addEventListener("pointermove", (event) => {
    if (!dragging || !moleculeRoot) return;
    const dx = event.clientX - lastPointer.x;
    const dy = event.clientY - lastPointer.y;
    moleculeRoot.rotation.y += dx * 0.01;
    moleculeRoot.rotation.x += dy * 0.01;
    lastPointer = { x: event.clientX, y: event.clientY };
  });
  dom.moleculeCanvas.addEventListener("pointerup", (event) => {
    dragging = false;
    dom.moleculeCanvas.releasePointerCapture(event.pointerId);
  });
  dom.moleculeCanvas.addEventListener("pointerleave", () => {
    dragging = false;
  });

  new ResizeObserver(resizeMoleculeViewer).observe(dom.moleculeCanvas);
  resizeMoleculeViewer();
  animateMolecule();
}

function setupViewerControls() {
  document.querySelectorAll(".style-choice").forEach((button) => {
    button.addEventListener("click", () => {
      viewerState.style = button.dataset.style || "ball-stick";
      document.querySelectorAll(".style-choice").forEach((choice) => choice.classList.toggle("active", choice === button));
      forceViewerRefresh();
    });
  });
  const labelToggle = document.querySelector("#labelToggle");
  const numberToggle = document.querySelector("#numberToggle");
  const axisToggle = document.querySelector("#axisToggle");
  const spinToggle = document.querySelector("#spinToggle");
  if (labelToggle) viewerState.labels = labelToggle.checked;
  if (numberToggle) viewerState.numbers = numberToggle.checked;
  if (axisToggle) viewerState.axis = axisToggle.checked;
  if (spinToggle) viewerState.spin = spinToggle.checked;
  labelToggle?.addEventListener("change", (event) => { viewerState.labels = event.target.checked; forceViewerRefresh(); });
  numberToggle?.addEventListener("change", (event) => { viewerState.numbers = event.target.checked; forceViewerRefresh(); });
  axisToggle?.addEventListener("change", (event) => { viewerState.axis = event.target.checked; forceViewerRefresh(); });
  spinToggle?.addEventListener("change", (event) => { viewerState.spin = event.target.checked; });
  document.querySelector("#resetView")?.addEventListener("click", () => {
    moleculeRoot?.rotation.set(-0.28, 0.55, 0.04);
  });
}

function setupViewerImport() {
  dom.viewerDataFile ||= document.querySelector("#viewerDataFile");
  dom.viewerDataInput ||= document.querySelector("#viewerDataInput");
  dom.viewerDataStatus ||= document.querySelector("#viewerDataStatus");
  dom.viewerDataFile?.addEventListener("change", async () => {
    const [file] = dom.viewerDataFile.files;
    if (!file) return;
    await loadViewerDataText(await file.text(), file.name);
    dom.viewerDataFile.value = "";
  });
  document.querySelector("#loadViewerData")?.addEventListener("click", async () => {
    await loadViewerDataText(dom.viewerDataInput?.value || "", "pasted-data.txt");
  });
  document.querySelector("#clearViewerData")?.addEventListener("click", () => {
    if (dom.viewerDataInput) dom.viewerDataInput.value = "";
    setStatusText(dom.viewerDataStatus, "Paste area cleared.", "");
  });
}

function forceViewerRefresh() {
  lastMoleculeSignature = "";
  if (dom.preview) renderPreview();
  else updateMoleculeViewer();
}

function resizeMoleculeViewer() {
  if (!renderer || !camera || !dom.moleculeCanvas) return;
  const rect = dom.moleculeCanvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function parseXYZ(xyz) {
  return coordinateLinesFromXYZ(xyz)
    .map((line) => {
      const [rawSymbol, x, y, z] = line.trim().split(/\s+/);
      const symbol = normalizeSymbol(rawSymbol);
      return { symbol, position: new THREE.Vector3(Number(x), Number(y), Number(z)) };
    })
    .filter((atom) => atom.symbol && Number.isFinite(atom.position.x) && Number.isFinite(atom.position.y) && Number.isFinite(atom.position.z));
}

function normalizeSymbol(value) {
  if (!value) return "";
  const clean = String(value).replace(/[^A-Za-z]/g, "");
  if (!clean) return "";
  return clean[0].toUpperCase() + clean.slice(1).toLowerCase();
}

function updateMoleculeViewer() {
  const mode = dom.surfaceMode?.value || "molecule";
  const signature = `${moleculeDisplayLabel()}|${mode}|${viewerState.style}|${viewerState.labels}|${viewerState.numbers}|${viewerState.axis}|${xyzBody()}`;
  if (signature === lastMoleculeSignature) return;
  lastMoleculeSignature = signature;

  if (dom.moleculeLabel) dom.moleculeLabel.textContent = moleculeDisplayLabel();
  const atoms = parseXYZ(xyzBody());
  updateXYZStatus(atoms);

  if (fallbackMode) {
    renderFallbackMolecule(atoms);
    return;
  }

  if (!moleculeRoot || !renderer) return;
  moleculeRoot.clear();
  if (atoms.length === 0) return;

  const center = new THREE.Box3().setFromPoints(atoms.map((atom) => atom.position)).getCenter(new THREE.Vector3());
  const normalizedAtoms = atoms.map((atom, index) => ({ ...atom, index, position: atom.position.clone().sub(center) }));
  const bounds = new THREE.Box3().setFromPoints(normalizedAtoms.map((atom) => atom.position));
  const size = bounds.getSize(new THREE.Vector3()).length() || 1;
  const scale = 2.9 / size;

  addSurfacePreview(normalizedAtoms, scale);
  addBonds(normalizedAtoms, scale);
  addAtoms(normalizedAtoms, scale);
  if (viewerState.axis) moleculeRoot.add(createAxisGroup());
  moleculeRoot.rotation.set(-0.28, 0.55, 0.04);
  renderer.render(scene, camera);
  updateViewerDebugStats();
}

function addBonds(atoms, scale) {
  if (viewerState.style === "space-fill") return;
  const bondMaterial = new THREE.MeshStandardMaterial({ color: 0xd7ece8, roughness: 0.42, metalness: 0.08 });
  for (let i = 0; i < atoms.length; i += 1) {
    for (let j = i + 1; j < atoms.length; j += 1) {
      const a = atoms[i];
      const b = atoms[j];
      const styleA = atomStyles[a.symbol] || fallbackAtom;
      const styleB = atomStyles[b.symbol] || fallbackAtom;
      if (a.position.distanceTo(b.position) <= styleA.covalent + styleB.covalent + 0.45) {
        moleculeRoot.add(createBond(a.position.clone().multiplyScalar(scale), b.position.clone().multiplyScalar(scale), bondMaterial));
      }
    }
  }
}

function addAtoms(atoms, scale) {
  const atomGeometryCache = new Map();
  for (const atom of atoms) {
    const style = atomStyles[atom.symbol] || fallbackAtom;
    const radius = atomRadiusForStyle(style);
    const cacheKey = `${viewerState.style}-${atom.symbol}-${radius}`;
    if (!atomGeometryCache.has(cacheKey)) atomGeometryCache.set(cacheKey, new THREE.SphereGeometry(radius, 32, 20));
    const material = new THREE.MeshStandardMaterial({ color: style.color, roughness: 0.36, metalness: 0.04 });
    const mesh = new THREE.Mesh(atomGeometryCache.get(cacheKey), material);
    mesh.position.copy(atom.position).multiplyScalar(scale);
    moleculeRoot.add(mesh);

    if ((viewerState.labels || viewerState.numbers) && viewerState.style !== "space-fill") {
      const text = viewerState.labels && viewerState.numbers ? `${atom.symbol}${atom.index + 1}` : viewerState.labels ? atom.symbol : `${atom.index + 1}`;
      const sprite = createTextSprite(text);
      sprite.position.copy(mesh.position).add(new THREE.Vector3(0.16, radius + 0.16, 0));
      moleculeRoot.add(sprite);
    }
  }
}

function atomRadiusForStyle(style) {
  if (viewerState.style === "space-fill") return Math.max(0.34, style.vdw * 0.28);
  if (viewerState.style === "wire") return 0.08;
  return style.radius;
}

function renderFallbackMolecule(atoms = parseXYZ(xyzBody())) {
  if (!dom.moleculeFallback) return;
  dom.moleculeFallback.replaceChildren();
  if (atoms.length === 0) return;

  const center = new THREE.Box3().setFromPoints(atoms.map((atom) => atom.position)).getCenter(new THREE.Vector3());
  const normalizedAtoms = atoms.map((atom) => ({ ...atom, position: atom.position.clone().sub(center) }));
  const bounds = new THREE.Box3().setFromPoints(normalizedAtoms.map((atom) => atom.position));
  const size = bounds.getSize(new THREE.Vector3());
  const scale = 62 / Math.max(size.x || 1, size.z || 1, 1);
  const projectedAtoms = normalizedAtoms.map((atom) => ({ ...atom, left: 50 + atom.position.x * scale, top: 50 - atom.position.z * scale }));

  if (viewerState.style !== "space-fill") {
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
        dom.moleculeFallback.append(bond);
      }
    }
  }

  for (const [index, atom] of projectedAtoms.entries()) {
    const style = atomStyles[atom.symbol] || fallbackAtom;
    const marker = document.createElement("span");
    marker.className = "fallback-atom";
    marker.textContent = viewerState.labels && viewerState.numbers ? `${atom.symbol}${index + 1}` : viewerState.labels ? atom.symbol : viewerState.numbers ? `${index + 1}` : atom.symbol;
    marker.style.left = `${atom.left}%`;
    marker.style.top = `${atom.top}%`;
    marker.style.setProperty("--color", `#${style.color.toString(16).padStart(6, "0")}`);
    marker.style.setProperty("--size", `${Math.round(atomRadiusForStyle(style) * 78)}px`);
    dom.moleculeFallback.append(marker);
  }
}

function addSurfacePreview(atoms, scale) {
  const mode = dom.surfaceMode?.value || "molecule";
  if (mode === "molecule" || atoms.length === 0 || !moleculeRoot) return;

  const scaledAtoms = atoms.map((atom) => ({ ...atom, position: atom.position.clone().multiplyScalar(scale) }));
  const bounds = new THREE.Box3().setFromPoints(scaledAtoms.map((atom) => atom.position));
  const size = bounds.getSize(new THREE.Vector3());
  const shellScale = new THREE.Vector3(Math.max(size.x * 0.55 + 0.95, 1.18), Math.max(size.y * 0.55 + 0.95, 1.18), Math.max(size.z * 0.55 + 0.95, 1.18));

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
  const material = new THREE.MeshStandardMaterial({ color, transparent: true, opacity, roughness: 0.52, metalness: 0.02, side: THREE.DoubleSide, depthWrite: false });
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
  const radius = viewerState.style === "wire" ? 0.018 : 0.055;
  const geometry = new THREE.CylinderGeometry(radius, radius, length, viewerState.style === "wire" ? 10 : 18);
  const cylinder = new THREE.Mesh(geometry, material);
  cylinder.position.copy(midpoint);
  cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return cylinder;
}

function createAxisGroup() {
  const group = new THREE.Group();
  const axes = [
    { label: "X", color: 0xd95a49, end: new THREE.Vector3(1.45, 0, 0) },
    { label: "Y", color: 0x12a88f, end: new THREE.Vector3(0, 1.45, 0) },
    { label: "Z", color: 0x2c67d8, end: new THREE.Vector3(0, 0, 1.45) }
  ];
  for (const axis of axes) {
    const material = new THREE.LineBasicMaterial({ color: axis.color });
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), axis.end]), material);
    group.add(line);
    const sprite = createTextSprite(axis.label, axis.color);
    sprite.position.copy(axis.end).multiplyScalar(1.12);
    group.add(sprite);
  }
  group.position.set(-2.25, -1.65, -1.4);
  return group;
}

function createTextSprite(text, color = 0xffffff) {
  const canvas = document.createElement("canvas");
  canvas.width = 192;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "700 42px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineWidth = 8;
  context.strokeStyle = "rgba(10, 20, 28, 0.86)";
  context.strokeText(text, 96, 48);
  context.fillStyle = typeof color === "number" ? `#${color.toString(16).padStart(6, "0")}` : color;
  context.fillText(text, 96, 48);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(0.5, 0.25, 1);
  return sprite;
}

function animateMolecule() {
  if (!renderer || !scene || !camera) return;
  requestAnimationFrame(animateMolecule);
  if (moleculeRoot && !dragging && viewerState.spin) moleculeRoot.rotation.y += 0.0045;
  renderer.render(scene, camera);
  viewerDebugFrame = (viewerDebugFrame + 1) % 30;
  if (viewerDebugFrame === 0) updateViewerDebugStats();
}

function updateViewerDebugStats() {
  if (!renderer) return;
  const gl = renderer.getContext();
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  if (!width || !height) return;
  const sampleW = Math.min(180, width);
  const sampleH = Math.min(180, height);
  const x = Math.max(0, Math.floor((width - sampleW) / 2));
  const y = Math.max(0, Math.floor((height - sampleH) / 2));
  const pixels = new Uint8Array(sampleW * sampleH * 4);
  gl.readPixels(x, y, sampleW, sampleH, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  let nonzero = 0;
  let bright = 0;
  let redish = 0;
  let greenish = 0;
  let blueish = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    if (a > 0 && (r || g || b)) nonzero += 1;
    if (a > 0 && r + g + b > 120) bright += 1;
    if (r > g + 25 && r > b + 25) redish += 1;
    if (g > r + 25 && g > b + 25) greenish += 1;
    if (b > r + 25 && b > g + 25) blueish += 1;
  }

  Object.assign(viewerDebugStats, {
    width,
    height,
    samplePixels: sampleW * sampleH,
    nonzero,
    bright,
    redish,
    greenish,
    blueish,
    updatedAt: Date.now()
  });

  if (dom.moleculeCanvas) {
    dom.moleculeCanvas.dataset.pixelWidth = String(width);
    dom.moleculeCanvas.dataset.pixelHeight = String(height);
    dom.moleculeCanvas.dataset.pixelSample = String(sampleW * sampleH);
    dom.moleculeCanvas.dataset.pixelNonzero = String(nonzero);
    dom.moleculeCanvas.dataset.pixelBright = String(bright);
    dom.moleculeCanvas.dataset.pixelRedish = String(redish);
    dom.moleculeCanvas.dataset.pixelGreenish = String(greenish);
    dom.moleculeCanvas.dataset.pixelBlueish = String(blueish);
  }
}

function inputMethodForWorkflow(workflow) {
  if (workflow.inputMethod) return workflow.inputMethod;
  if (dom.method?.value === "TDHF" || dom.method?.value === "SF-TDDFT" || dom.method?.value === "MRSF-TDDFT") return "tdhf";
  return "hf";
}

function activeFunctional() {
  const value = dom.functional?.value.trim() || "";
  if (dom.method?.value === "HF" && !value) return "";
  return value;
}

function renderResultPreview() {
  if (!dom.resultTitle || !dom.resultList || !dom.resultSample) return;
  const result = resultPreviews[state.workflow.id] || resultPreviews["single-point"];
  dom.resultTitle.textContent = result.title;
  dom.resultList.replaceChildren(...result.items.map((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    return li;
  }));
  dom.resultSample.textContent = result.sample;
}

function renderInput() {
  const workflow = state.workflow;
  const inputMethod = inputMethodForWorkflow(workflow);
  const functional = activeFunctional();
  const scfExtras = (workflow.scfExtras || []).filter((line) => line !== "save_molden=True");
  const lines = [
    "# OpenQP input generated by OpenQP Web Phase 1",
    "# This static web app prepares files only; it does not run calculations online.",
    `# Notes: ${dom.notes?.value.trim() || "Review this starter input before production use."}`,
    "",
    "[input]",
    `system=${safeJobName()}.xyz`,
    `runtype=${workflow.runtype}`,
    `method=${inputMethod}`,
    `basis=${dom.basis.value}`,
    `charge=${dom.charge.value}`
  ];

  if (functional) lines.push(`functional=${functional.toLowerCase()}`);
  lines.push("d4=False", "", "[guess]", "type=huckel", `save_mol=${workflow.saveMol ? "True" : "False"}`, "", "[scf]", `type=${workflow.scfType || "rhf"}`, "maxit=100", `multiplicity=${dom.multiplicity.value}`, `conv=${dom.conv.value}`, "save_molden=True", ...scfExtras);

  const states = Number(dom.states.value || workflow.states || 0);
  if (states > 0 || inputMethod === "tdhf") {
    lines.push("", "[tdhf]", `type=${workflow.tdhfType || (dom.method.value === "SF-TDDFT" ? "sf" : dom.method.value === "MRSF-TDDFT" ? "mrsf" : "rpa")}`, "maxit=30", "multiplicity=1", `nstate=${Math.max(states, 1)}`, `conv=${dom.conv.value}`, `zvconv=${dom.conv.value}`);
  }

  if (["mrsf", "mrsf-gradient", "mrsf-optimize", "mrsf-mep", "mrsf-meci", "mrsf-hessian", "ekt"].includes(workflow.id)) {
    lines.push("", "# Review active-space and reference settings before production MRSF runs.");
  }
  if (workflow.extraSections?.length) {
    lines.push("", ...workflow.extraSections.map(replaceTemplateTokens));
  }
  lines.push("", "# Save the XYZ block below as a separate .xyz file, or use the download button.", "# --- XYZ preview ---", xyzBody());
  return `${lines.join("\n")}\n`;
}

function replaceTemplateTokens(line) {
  return line
    .replaceAll("{istate}", String(dom.istate?.value || 0))
    .replaceAll("{jstate}", String(dom.jstate?.value || 1))
    .replaceAll("{nstate}", String(dom.states?.value || 0));
}

function renderPreview() {
  if (dom.preview) dom.preview.value = renderInput();
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
  downloadFile(`${safeJobName ? safeJobName() : "openqp_structure"}.xyz`, `${xyzBody()}\n`, "chemical/x-xyz");
}

async function copyInput() {
  const button = document.querySelector("#copyInput");
  const original = button.textContent;
  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(renderInput());
      copied = true;
    }
  } catch (error) {
    copied = false;
  }
  if (!copied) {
    dom.preview.focus();
    dom.preview.select();
  }
  button.textContent = copied ? "Copied" : "Text selected";
  setTimeout(() => { button.textContent = original; }, 1200);
}

async function loadViewerDataText(rawText, fileName) {
  const text = rawText.trim();
  if (!text) {
    setStatusText(dom.viewerDataStatus, "Paste or choose a molecular data file first.", "error");
    return;
  }

  try {
    const parsed = parseViewerData(text, fileName);
    if (dom.xyzInput) {
      dom.xyzInput.value = parsed.xyz;
    } else {
      state.analysisXYZ = parsed.xyz;
    }
    lastMoleculeSignature = "";
    setStatusText(dom.viewerDataStatus, parsed.status, "ok");
    updateAnalysisSummary(parsed);
    if (dom.preview) renderPreview();
    else updateMoleculeViewer();
  } catch (error) {
    setStatusText(dom.viewerDataStatus, error.message || "Could not read that data.", "error");
  }
}

function parseViewerData(text, fileName = "data.txt") {
  if (/\.(cube|cub)$/i.test(fileName) || looksLikeCube(text)) return parseCubeGeometry(text, fileName);
  if (/\.(molden|mol)$/i.test(fileName) || /\[Atoms\]/i.test(text)) return parseMoldenGeometry(text, fileName);
  if (/\.(json)$/i.test(fileName) || looksLikeJson(text)) return parseJsonGeometry(text, fileName);
  if (/\.(log|out)$/i.test(fileName) || text.includes("Cartesian Coordinate in Angstrom")) return parseOpenQpLogGeometry(text, fileName);
  if (looksLikeXYZ(text)) return parseXyzGeometry(text, fileName);
  throw new Error("Supported local formats are XYZ, OpenQP log/out, Molden, cube, and JSON geometry.");
}

function looksLikeXYZ(text) {
  const lines = text.trim().split(/\r?\n/);
  if (/^\d+$/.test(lines[0]?.trim() || "") && lines.length >= Number(lines[0].trim()) + 2) return true;
  return coordinateLinesFromXYZ(text).some((line) => /^[A-Za-z]{1,2}\s+[-+0-9.]/.test(line.trim()));
}

function parseXyzGeometry(text, fileName) {
  const atoms = parseXYZ(text);
  if (!atoms.length) throw new Error("No XYZ coordinates found.");
  const xyz = /^\d+/.test(text.trim()) ? normalizeXYZText(text) : atomsToXYZ(atoms, fileName.replace(/\.[^.]+$/, ""));
  return {
    type: "XYZ",
    xyz,
    status: `Loaded ${atoms.length} atoms from XYZ.`,
    atoms: atoms.length,
    frames: 1,
    summary: [`${atoms.length} atoms`, "XYZ geometry loaded", "Ready for input generation or local analysis"],
    sample: xyz.split("\n").slice(0, 8).join("\n")
  };
}

function parseMoldenGeometry(text, fileName) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => /^\[Atoms\]/i.test(line.trim()));
  if (start < 0) throw new Error("No Molden [Atoms] section found.");
  const unit = lines[start].match(/\]\s*(\S+)/)?.[1] || "Angs";
  const factor = /^AU$/i.test(unit) ? BOHR_TO_ANGSTROM : 1;
  const atoms = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^\s*\[/.test(lines[i])) break;
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length < 6) continue;
    const symbol = normalizeSymbol(parts[0]);
    const x = Number(parts[3]) * factor;
    const y = Number(parts[4]) * factor;
    const z = Number(parts[5]) * factor;
    if (symbol && [x, y, z].every(Number.isFinite)) atoms.push({ symbol, position: new THREE.Vector3(x, y, z) });
  }
  if (!atoms.length) throw new Error("Molden file did not contain readable atom coordinates.");
  const moCount = (text.match(/^\s*Ene=/gim) || []).length;
  return {
    type: "Molden",
    xyz: atomsToXYZ(atoms, fileName.replace(/\.(molden|mol)$/i, "")),
    status: `Loaded Molden geometry (${atoms.length} atoms, ${moCount} MO records).`,
    atoms: atoms.length,
    frames: 1,
    orbitals: moCount,
    summary: [`${atoms.length} atoms`, `${moCount} MO metadata records`, `Coordinate unit: ${unit}`],
    sample: `Molden geometry imported from ${fileName}\nMO records: ${moCount}\nTrue MO isosurfaces require the advanced viewer.`
  };
}

function parseCubeGeometry(text, fileName) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 7) throw new Error("Cube file is too short.");
  const originLine = lines[2].trim().split(/\s+/).map(Number);
  const atomCount = Math.abs(originLine[0]);
  const unitFactor = originLine[0] < 0 ? 1 : BOHR_TO_ANGSTROM;
  const atoms = [];
  for (let i = 0; i < atomCount; i += 1) {
    const parts = lines[6 + i]?.trim().split(/\s+/).map(Number);
    if (!parts || parts.length < 5) continue;
    atoms.push({
      symbol: atomicSymbols[Math.round(parts[0])] || "C",
      position: new THREE.Vector3(parts[2] * unitFactor, parts[3] * unitFactor, parts[4] * unitFactor)
    });
  }
  if (!atoms.length) throw new Error("Cube file did not contain readable atom coordinates.");
  const grid = [3, 4, 5].map((index) => Math.abs(Number(lines[index].trim().split(/\s+/)[0]))).join(" x ");
  return {
    type: "Cube",
    xyz: atomsToXYZ(atoms, fileName.replace(/\.(cube|cub)$/i, "")),
    status: `Loaded cube geometry (${atoms.length} atoms, ${grid} grid).`,
    atoms: atoms.length,
    frames: 1,
    summary: [`${atoms.length} atoms`, `Cube grid: ${grid}`, "Geometry loaded; true volumetric isosurfaces use the advanced viewer"],
    sample: `Cube geometry imported from ${fileName}\nGrid: ${grid}\nVolumetric values were not rendered on this Phase 1 page.`
  };
}

function parseJsonGeometry(text, fileName) {
  let json;
  try {
    json = JSON.parse(text);
  } catch (error) {
    throw new Error("JSON parse failed.");
  }
  const source = json.molecule || json.data?.molecule || json;
  let atoms = [];
  if (Array.isArray(source.atoms) && Array.isArray(source.coord) && source.coord.length >= source.atoms.length * 3) {
    atoms = source.atoms.map((atomicNumber, index) => ({
      symbol: atomicSymbols[Number(atomicNumber)] || normalizeSymbol(atomicNumber) || "C",
      position: new THREE.Vector3(
        Number(source.coord[index * 3]) * BOHR_TO_ANGSTROM,
        Number(source.coord[index * 3 + 1]) * BOHR_TO_ANGSTROM,
        Number(source.coord[index * 3 + 2]) * BOHR_TO_ANGSTROM
      )
    }));
  } else if (Array.isArray(source.atoms)) {
    atoms = source.atoms.map((atom) => {
      if (Array.isArray(atom)) return { symbol: normalizeSymbol(atom[0]), position: new THREE.Vector3(Number(atom[1]), Number(atom[2]), Number(atom[3])) };
      return { symbol: normalizeSymbol(atom.symbol || atom.element || atom.atomicNumber), position: new THREE.Vector3(Number(atom.x), Number(atom.y), Number(atom.z)) };
    });
  }
  atoms = atoms.filter((atom) => atom.symbol && [atom.position.x, atom.position.y, atom.position.z].every(Number.isFinite));
  if (!atoms.length) throw new Error("JSON did not contain readable geometry.");
  const orbitalCount = countJsonOrbitals(source);
  return {
    type: "JSON",
    xyz: atomsToXYZ(atoms, fileName.replace(/\.json$/i, "")),
    status: `Loaded JSON geometry (${atoms.length} atoms${orbitalCount ? `, ${orbitalCount} orbital values` : ""}).`,
    atoms: atoms.length,
    frames: 1,
    orbitals: orbitalCount,
    summary: [`${atoms.length} atoms`, orbitalCount ? `${orbitalCount} orbital energy entries` : "No orbital arrays detected", "OpenQP JSON geometry loaded"],
    sample: JSON.stringify({ source: fileName, atoms: atoms.length, orbitals: orbitalCount }, null, 2)
  };
}

function parseOpenQpLogGeometry(text, fileName) {
  const lines = text.split(/\r?\n/);
  const frames = [];
  const energies = [];
  for (let i = 0; i < lines.length; i += 1) {
    const energyMatch = lines[i].match(/(?:Final Energy|PyOQP state\s+\d+)\s+([-+0-9.Ee]+)/);
    if (energyMatch) energies.push(Number(energyMatch[1]));
    if (!lines[i].includes("Cartesian Coordinate in Angstrom")) continue;
    const atoms = [];
    i += 1;
    while (i < lines.length && !/^\s*-{5,}/.test(lines[i])) i += 1;
    i += 1;
    while (i < lines.length) {
      const coord = lines[i].match(/^\s*\d+\s+(\d+(?:\.\d+)?)\s+([-+0-9.Ee]+)\s+([-+0-9.Ee]+)\s+([-+0-9.Ee]+)/);
      if (!coord) break;
      atoms.push({
        symbol: atomicSymbols[Math.round(Number(coord[1]))] || "C",
        position: new THREE.Vector3(Number(coord[2]), Number(coord[3]), Number(coord[4]))
      });
      i += 1;
    }
    if (atoms.length) frames.push(atoms);
  }
  if (!frames.length) throw new Error("No OpenQP Cartesian coordinate blocks were found.");
  const atoms = frames.at(-1);
  const orbitalBlocks = (text.match(/Molecular Orbitals and Energies/g) || []).length;
  return {
    type: "OpenQP log",
    xyz: atomsToXYZ(atoms, `${fileName.replace(/\.(log|out|txt)$/i, "")} final frame`),
    status: `Loaded final geometry from ${frames.length} OpenQP coordinate block${frames.length === 1 ? "" : "s"}.`,
    atoms: atoms.length,
    frames: frames.length,
    orbitals: orbitalBlocks,
    energies,
    summary: [`${frames.length} coordinate frame${frames.length === 1 ? "" : "s"}`, `${atoms.length} atoms in final frame`, `${energies.length} energy-like values found`, `${orbitalBlocks} MO metadata block${orbitalBlocks === 1 ? "" : "s"}`],
    sample: [
      `OpenQP log: ${fileName}`,
      `frames: ${frames.length}`,
      `final atoms: ${atoms.length}`,
      energies.length ? `last energy-like value: ${energies.at(-1)}` : "energy: not detected"
    ].join("\n")
  };
}

function countJsonOrbitals(source) {
  const candidates = [source.orbital_energies, source.orbitalEnergy, source.mo_energy, source.mol_energy, source.energies].filter(Array.isArray);
  return candidates[0]?.length || 0;
}

function atomsToXYZ(atoms, title = "loaded structure") {
  const lines = atoms.map((atom) => `${atom.symbol.padEnd(2)} ${atom.position.x.toFixed(6).padStart(12)} ${atom.position.y.toFixed(6).padStart(12)} ${atom.position.z.toFixed(6).padStart(12)}`);
  return `${atoms.length}\n${title}\n${lines.join("\n")}`;
}

function looksLikeCube(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 7) return false;
  const origin = lines[2].trim().split(/\s+/).map(Number);
  const axes = [3, 4, 5].every((index) => lines[index]?.trim().split(/\s+/).map(Number).length >= 4);
  return origin.length >= 4 && Number.isFinite(origin[0]) && axes;
}

function looksLikeJson(text) {
  const trimmed = text.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

function setStatusText(element, text, stateName) {
  if (!element) return;
  element.textContent = text;
  if (stateName) element.dataset.state = stateName;
  else delete element.dataset.state;
}

function initAnalysisPage() {
  Object.assign(dom, {
    moleculeLabel: document.querySelector("#moleculeLabel"),
    moleculeCanvas: document.querySelector("#moleculeCanvas"),
    moleculeFallback: document.querySelector("#moleculeFallback"),
    surfaceMode: document.querySelector("#surfaceMode"),
    viewerDataFile: document.querySelector("#viewerDataFile"),
    viewerDataInput: document.querySelector("#viewerDataInput"),
    viewerDataStatus: document.querySelector("#viewerDataStatus"),
    analysisTitle: document.querySelector("#analysisTitle"),
    analysisList: document.querySelector("#analysisList"),
    analysisSample: document.querySelector("#analysisSample")
  });
  setupMoleculeViewer();
  setupViewerControls();
  setupViewerImport();
  document.querySelector("#downloadXyz")?.addEventListener("click", () => downloadFile("openqp_loaded_structure.xyz", `${xyzBody()}\n`, "chemical/x-xyz"));
  updateMoleculeViewer();
}

function updateAnalysisSummary(parsed) {
  const title = document.querySelector("#analysisTitle");
  const list = document.querySelector("#analysisList");
  const sample = document.querySelector("#analysisSample");
  if (!title || !list || !sample) return;
  title.textContent = `${parsed.type} loaded`;
  list.replaceChildren(...parsed.summary.map((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    return li;
  }));
  sample.textContent = parsed.sample || parsed.status;
}

init();
