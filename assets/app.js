import * as THREE from "../vendor/three.module.min.js";

const BOHR_TO_ANGSTROM = 0.529177210903;
const LOCAL_RUNNER_URL = "http://127.0.0.1:17651";
const LOCAL_RUNNER_TOKEN_KEY = "openqpLocalRunnerToken";
const LOCAL_RUNNER_POLL_MS = 1200;

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
  methyl: {
    label: "Methyl radical",
    xyz: `4
methyl radical
C    0.000000    0.000000    0.000000
H    1.079000    0.000000    0.000000
H   -0.539500    0.934500    0.000000
H   -0.539500   -0.934500    0.000000`
  },
  butadiene: {
    label: "1,3-Butadiene",
    xyz: `10
1,3-butadiene
C   -1.901081    0.114577    0.000000
C   -0.574901   -0.402238    0.000000
C    0.574901    0.402238    0.000000
C    1.901081   -0.114577    0.000000
H   -2.755249   -0.545116    0.000000
H   -2.071563    1.183087    0.000000
H   -0.441349   -1.477941    0.000000
H    0.441349    1.477941    0.000000
H    2.071563   -1.183087    0.000000
H    2.755249    0.545116    0.000000`
  },
  hcn: {
    label: "Hydrogen cyanide",
    xyz: `3
hydrogen cyanide
C    0.000000    0.000000    0.000000
N    0.000000    0.000000    1.170000
H   -1.100000    0.000000    0.000000`
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
    id: "open-shell-uhf",
    group: "Ground state",
    title: "Open-shell UHF energy",
    detail: "Doublet radical starter using the UHF reference path.",
    jobName: "methyl_uhf_pbe0",
    runtype: "energy",
    method: "DFT",
    functional: "PBE0",
    basis: "6-31G(d)",
    molecule: "methyl",
    states: 0,
    scfType: "uhf",
    multiplicity: 2
  },
  {
    id: "dft-d4",
    group: "Ground state",
    title: "DFT-D4 dispersion energy",
    detail: "Single-point DFT template with the current [input] d4 switch enabled.",
    jobName: "benzene_b3lyp_d4",
    runtype: "energy",
    method: "DFT",
    functional: "B3LYP",
    basis: "def2-SVP",
    molecule: "benzene",
    states: 0,
    scfType: "rhf",
    inputExtras: ["d4=True"]
  },
  {
    id: "symmetry-labels",
    group: "Ground state",
    title: "Symmetry labels and reductions",
    detail: "Energy run with point-group detection, MO labels, and response-state labels enabled.",
    jobName: "ethylene_symmetry_labels",
    runtype: "energy",
    method: "DFT",
    functional: "B3LYP",
    basis: "6-31G(d)",
    molecule: "ethylene",
    states: 0,
    scfType: "rhf",
    extraSections: [
      "[symmetry]",
      "enabled=true",
      "point_group=auto",
      "subgroup=auto",
      "label_mo=True",
      "label_states=True",
      "use_integral_symmetry=True",
      "use_response_symmetry=True"
    ]
  },
  {
    id: "dft-grid-refined",
    group: "Ground state",
    title: "Refined DFT grid",
    detail: "DFT starter with explicit radial and angular grid controls.",
    jobName: "water_refined_grid",
    runtype: "energy",
    method: "DFT",
    functional: "PBE0",
    basis: "6-31G(d)",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    extraSections: [
      "[dftgrid]",
      "rad_type=mhl",
      "rad_npts=99",
      "ang_npts=302",
      "pruned="
    ]
  },
  {
    id: "scf-auto-trah",
    group: "Ground state",
    title: "Auto SCF with TRAH fallback",
    detail: "SCF robustness template using the current auto selector and opt-in stability flag.",
    jobName: "water_auto_scf_trah",
    runtype: "energy",
    method: "DFT",
    functional: "PBE0",
    basis: "6-31G(d)",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    scfExtras: ["converger_type=auto", "alternative_scf=trah", "stability=False"]
  },
  {
    id: "threaded-local",
    group: "Ground state",
    title: "Threaded local run",
    detail: "Local-run starter that requests OpenMP threads through the input file.",
    jobName: "benzene_threaded_dft",
    runtype: "energy",
    method: "DFT",
    functional: "B3LYP",
    basis: "6-31G(d)",
    molecule: "benzene",
    states: 0,
    scfType: "rhf",
    inputExtras: ["omp_threads=4"]
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
    id: "tda",
    group: "Excited states",
    title: "TDA excited states",
    detail: "Tamm-Dancoff TDDFT starter using the current tdhf.type=tda path.",
    jobName: "water_tda_bhhlyp",
    runtype: "energy",
    method: "TDHF",
    functional: "BHHLYP",
    basis: "6-31G",
    molecule: "water",
    states: 10,
    inputMethod: "tdhf",
    tdhfType: "tda",
    tdhfMultiplicity: 1,
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
    id: "umrsf",
    group: "MRSF",
    title: "UMRSF-TDDFT energy",
    detail: "Energy-only unrestricted MRSF starter from the current OpenQP examples.",
    jobName: "butadiene_umrsf_energy",
    runtype: "energy",
    method: "UMRSF-TDDFT",
    functional: "BHHLYP",
    basis: "6-31G*",
    molecule: "butadiene",
    states: 10,
    inputMethod: "tdhf",
    tdhfType: "umrsf",
    tdhfMultiplicity: 1,
    scfType: "uhf",
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
    id: "mecp",
    group: "Reaction paths",
    title: "MECP optimization",
    detail: "MRSF-TDDFT minimum-energy crossing point starter with multiplicity controls.",
    jobName: "ethylene_mrsf_mecp",
    runtype: "mecp",
    method: "MRSF-TDDFT",
    functional: "BHHLYP",
    basis: "6-31G*",
    molecule: "ethylene",
    states: 5,
    istate: 1,
    jstate: 1,
    inputMethod: "tdhf",
    tdhfType: "mrsf",
    scfType: "rohf",
    multiplicity: 3,
    extraSections: [
      "[optimize]",
      "lib=geometric",
      "maxit=20",
      "istate={istate}",
      "jstate={jstate}",
      "imult=1",
      "jmult=3",
      "energy_shift=1",
      "energy_gap=1e-4",
      "rmsd_grad=1e-3",
      "max_grad=2e-3"
    ]
  },
  {
    id: "transition-state",
    group: "Reaction paths",
    title: "Transition-state search",
    detail: "Ground-state geomeTRIC TS starter with HCN coordinates.",
    jobName: "hcn_ts_search",
    runtype: "ts",
    method: "DFT",
    functional: "BHHLYP",
    basis: "3-21G",
    molecule: "hcn",
    states: 0,
    scfType: "rhf",
    extraSections: [
      "[optimize]",
      "lib=geometric",
      "istate=0",
      "maxit=20",
      "energy_shift=1e-3",
      "rmsd_grad=1e-3",
      "max_grad=2e-3",
      "",
      "[geometric]",
      "coordsys=dlc",
      "trust=0.05",
      "hessian=never",
      "convergence_set=GAU"
    ]
  },
  {
    id: "irc",
    group: "Reaction paths",
    title: "IRC from a TS guess",
    detail: "Intrinsic reaction coordinate starter using the native OQP optimizer path.",
    jobName: "hcn_irc_forward",
    runtype: "irc",
    method: "DFT",
    functional: "BHHLYP",
    basis: "6-31G*",
    molecule: "hcn",
    states: 0,
    scfType: "rhf",
    extraSections: [
      "[hess]",
      "type=analytical",
      "state=0",
      "",
      "[optimize]",
      "lib=oqp",
      "istate=0",
      "maxit=10",
      "",
      "[oqp]",
      "irc_step=0.15",
      "irc_direction=forward"
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
    id: "mrsf-soc",
    group: "Couplings",
    title: "MRSF spin-orbit coupling",
    detail: "SOC starter with the required ROHF triplet MRSF reference.",
    jobName: "water_mrsf_soc",
    runtype: "soc",
    method: "MRSF-TDDFT",
    functional: "BHHLYP",
    basis: "6-31G*",
    molecule: "water",
    states: 12,
    inputMethod: "tdhf",
    tdhfType: "mrsf",
    tdhfMultiplicity: 3,
    scfType: "rohf",
    multiplicity: 3,
    inputExtras: ["ispher=false", "soc_2e=1"],
    extraSections: [
      "[dftgrid]",
      "rad_npts=90",
      "ang_npts=302"
    ]
  },
  {
    id: "mrsf-nac",
    group: "Couplings",
    title: "MRSF nonadiabatic coupling",
    detail: "Numerical NAC starter for a selected pair of MRSF states.",
    jobName: "ethylene_mrsf_nac",
    runtype: "nac",
    method: "MRSF-TDDFT",
    functional: "BHHLYP",
    basis: "6-31G",
    molecule: "ethylene",
    states: 5,
    istate: 1,
    jstate: 2,
    inputMethod: "tdhf",
    tdhfType: "mrsf",
    scfType: "rohf",
    multiplicity: 3,
    extraSections: [
      "[nac]",
      "type=numerical",
      "states={istate} {jstate}",
      "nproc=1",
      "restart=False",
      "clean=True"
    ]
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
    detail: "GIAO NMR shielding starter using the current properties.scf_prop=nmr path.",
    jobName: "water_nmr_shielding",
    runtype: "prop",
    method: "DFT",
    functional: "PBE0",
    basis: "STO-3G",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    extraSections: [
      "[dftgrid]",
      "rad_type=mhl",
      "rad_npts=99",
      "ang_npts=302",
      "",
      "[properties]",
      "scf_prop=nmr",
      "nmr_gauge=giao"
    ]
  },
  {
    id: "pcm",
    group: "Properties",
    title: "PCM solvent single point",
    detail: "Solvent-effect starter with the current ddX/ddPCM reference-SCF block.",
    jobName: "water_pcm_sp",
    runtype: "energy",
    method: "DFT",
    functional: "B3LYP",
    basis: "6-31G(d)",
    molecule: "water",
    states: 0,
    scfType: "rhf",
    extraSections: [
      "[pcm]",
      "enabled=true",
      "backend=ddx",
      "mode=reference_scf",
      "model=ddpcm",
      "solvent=water",
      "epsilon=78.3553"
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
  "open-shell-uhf": {
    title: "Open-shell SCF summary",
    items: ["UHF energy and convergence history", "Spin-state diagnostics from the local log", "Molden orbitals when enabled"],
    sample: `Open-shell preview
reference: UHF
multiplicity: 2
converged: true`
  },
  "dft-d4": {
    title: "DFT-D4 energy",
    items: ["Final DFT energy", "D4 dispersion contribution when the local build supports D4", "Combined corrected energy in the log"],
    sample: `DFT-D4 preview
scf_energy_hartree: -232.11234567
d4_correction_hartree: -0.01823456`
  },
  "symmetry-labels": {
    title: "Symmetry-labeled output",
    items: ["Detected point group", "MO symmetry labels", "State labels when response symmetry is used"],
    sample: `Symmetry preview
point_group: auto
label_mo: true
label_states: true`
  },
  "dft-grid-refined": {
    title: "Refined-grid DFT output",
    items: ["DFT energy with explicit grid controls", "Grid settings echoed in the input/log", "Useful baseline for grid sensitivity checks"],
    sample: `DFT grid preview
rad_type: mhl
rad_npts: 99
ang_npts: 302`
  },
  "scf-auto-trah": {
    title: "SCF recovery diagnostics",
    items: ["Auto-selected SCF path", "TRAH fallback status if DIIS/SOSCF needs help", "Stability remains opt-in unless enabled"],
    sample: `SCF manager preview
converger_type: auto
alternative_scf: trah
stability: false`
  },
  "threaded-local": {
    title: "Threaded local run",
    items: ["Requested OpenMP thread count", "SCF energy and timing from the local machine", "Warning in the log if the build lacks OpenMP"],
    sample: `Threaded run preview
omp_threads: 4
backend: local OpenQP`
  },
  tddft: {
    title: "Excited-state roots",
    items: ["Vertical excitation energies", "Oscillator strengths and response-vector data where enabled", "Molden orbitals for the reference state"],
    sample: `TDHF/TDDFT roots
state   energy_eV   oscillator_strength
  1       7.21            0.018
  2       8.44            0.116`
  },
  tda: {
    title: "TDA excited-state roots",
    items: ["TDA vertical excitation energies", "Response-state convergence history", "Oscillator strengths when emitted by the local build"],
    sample: `TDA roots
state   energy_eV
  1       7.05
  2       8.18`
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
  umrsf: {
    title: "UMRSF-TDDFT roots",
    items: ["Energy-only UMRSF response roots", "UHF reference convergence details", "State list from the unrestricted MRSF path"],
    sample: `UMRSF preview
reference: UHF triplet
tdhf.type: umrsf
nstate: 10`
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
  mecp: {
    title: "MECP optimization",
    items: ["Crossing-point optimization progress", "Two multiplicity surfaces and final energy gap", "Final geometry for local validation"],
    sample: `MECP preview
istate/jstate: 1/1
imult/jmult: 1/3
energy_gap: 1.0e-04`
  },
  "transition-state": {
    title: "Transition-state search",
    items: ["TS optimization steps", "Gradient and step norms", "Final candidate geometry for frequency confirmation"],
    sample: `TS preview
optimizer: geomeTRIC
coordsys: dlc
target: first-order saddle point`
  },
  irc: {
    title: "IRC path",
    items: ["IRC branch points from the starting TS guess", "Energy profile along the path", "Forward or reverse branch direction"],
    sample: `IRC preview
irc_direction: forward
irc_step: 0.15`
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
  "mrsf-soc": {
    title: "Spin-orbit coupling output",
    items: ["MRSF state energies for SOC analysis", "Spin-orbit coupling matrix elements", "SOC settings echoed from the local run"],
    sample: `SOC preview
tdhf.type: mrsf
scf.multiplicity: 3
soc_2e: 1`
  },
  "mrsf-nac": {
    title: "Nonadiabatic coupling output",
    items: ["Selected-state NAC vector", "Finite-difference worker settings", "State-pair metadata for downstream dynamics checks"],
    sample: `NAC preview
states: 1 2
nproc: 1
type: numerical`
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
    items: ["GIAO shielding tensors", "Isotropic shielding values", "Grid settings used for the DFT response"],
    sample: `NMR shielding preview
atom   sigma_iso_ppm   anisotropy
 O       321.4           47.2`
  },
  pcm: {
    title: "Solvent-corrected energy",
    items: ["Reference-SCF ddPCM energy", "Reaction-field contribution", "Dielectric and backend settings echoed in the run"],
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
  analysisXYZ: molecules.caffeine.xyz,
  analysisJobMode: false,
  analysisResult: createEmptyAnalysisResult()
};

const viewerState = {
  style: "ball-stick",
  labels: false,
  numbers: false,
  axis: false,
  spin: true,
  modePhase: 0
};

let renderer;
let scene;
let camera;
let moleculeRoot;
let lastMoleculeSignature = "";
let moleculeResizeObserver;
let moleculeResizeFrame = 0;
let moleculeLastSize = { width: 0, height: 0 };
let fallbackMode = false;
let dragging = false;
let lastPointer = { x: 0, y: 0 };
let viewerDebugFrame = 0;
const localRunnerState = {
  jobId: "",
  pollTimer: 0,
  tokenCheckTimer: 0,
  ready: false,
  busy: false,
  analysisOpenedFor: ""
};
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
  methyl: "methyl",
  "methyl radical": "methyl",
  butadiene: "butadiene",
  "1,3-butadiene": "butadiene",
  hcn: "hcn",
  "hydrogen cyanide": "hcn",
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
    handleChatPrompt(prompt, { silentUser: true, scrollToRun: true });
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
    viewerDataStatus: document.querySelector("#viewerDataStatus"),
    localRunOs: document.querySelector("#localRunOs"),
    localRunCommand: document.querySelector("#localRunCommand"),
    downloadRunPackage: document.querySelector("#downloadRunPackage"),
    copyLocalCommand: document.querySelector("#copyLocalCommand"),
    downloadRunScript: document.querySelector("#downloadRunScript"),
    localRunStatus: document.querySelector("#localRunStatus"),
    localRunnerToken: document.querySelector("#localRunnerToken"),
    localSetupDialog: document.querySelector("#localSetupDialog"),
    localSetupDetected: document.querySelector("#localSetupDetected"),
    openLocalSetup: document.querySelector("#openLocalSetup"),
    closeLocalSetup: document.querySelector("#closeLocalSetup"),
    copyOpenQpInstall: document.querySelector("#copyOpenQpInstall"),
    copyRunnerStart: document.querySelector("#copyRunnerStart"),
    checkLocalRunner: document.querySelector("#checkLocalRunner"),
    runLocalOpenQp: document.querySelector("#runLocalOpenQp"),
    cancelLocalOpenQp: document.querySelector("#cancelLocalOpenQp"),
    localRunnerStatus: document.querySelector("#localRunnerStatus"),
    localRunnerLog: document.querySelector("#localRunnerLog")
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
    await handleChatPrompt(dom.chatPrompt.value, { scrollToRun: true });
  });
  dom.promptExamples?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-prompt]");
    if (!button) return;
    dom.chatPrompt.value = button.dataset.prompt;
    await handleChatPrompt(button.dataset.prompt, { scrollToRun: true });
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
  dom.localRunOs?.addEventListener("change", updateLocalRunPanel);
  dom.downloadRunPackage?.addEventListener("click", downloadRunPackage);
  dom.copyLocalCommand?.addEventListener("click", copyLocalCommand);
  dom.downloadRunScript?.addEventListener("click", downloadRunScript);
  dom.openLocalSetup?.addEventListener("click", () => openLocalSetupDialog());
  dom.closeLocalSetup?.addEventListener("click", closeLocalSetupDialog);
  dom.localSetupDialog?.addEventListener("click", (event) => {
    if (event.target === dom.localSetupDialog) closeLocalSetupDialog();
  });
  dom.copyOpenQpInstall?.addEventListener("click", () => copySetupCommand(dom.copyOpenQpInstall, "python3 ~/Downloads/install-openqp-local.py"));
  dom.copyRunnerStart?.addEventListener("click", () => copySetupCommand(dom.copyRunnerStart, "python3 ~/Downloads/openqp-local-runner.py"));
  restoreLocalRunnerToken();
  dom.localRunnerToken?.addEventListener("input", handleLocalRunnerTokenInput);
  dom.checkLocalRunner?.addEventListener("click", () => checkLocalRunner());
  dom.runLocalOpenQp?.addEventListener("click", () => startLocalRunnerJob());
  dom.cancelLocalOpenQp?.addEventListener("click", () => cancelLocalRunnerJob());
  setLocalRunnerReady(false);
  if (localRunnerToken()) scheduleLocalRunnerAutoCheck();
  detectPreferredLocalRunOs();
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
  if (options.scrollToRun) showLocalRunStep();
}

function showLocalRunStep() {
  const target = document.querySelector("#local-run");
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
  setStatusText(dom.localRunnerStatus, "Ready to send this job to the local runner.", "ok");
  if (dom.localRunStatus) {
    const script = localRunScriptName();
    dom.localRunStatus.dataset.state = "ok";
    dom.localRunStatus.textContent = selectedLocalRunOs() === "macos"
      ? `Run package is ready. Download ${localRunPackageName()}, unzip it, then double-click ${script}.`
      : `Run files are ready. Download the runnable package, unzip it, then run ${script}.`;
  }
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
  if (hasAny(lower, ["mecp", "crossing point", "minimum energy crossing"])) return workflowById("mecp");
  if (/\birc\b/.test(lower) || hasAny(lower, ["intrinsic reaction coordinate"])) return workflowById("irc");
  if (hasAny(lower, ["transition state", "ts search", "saddle point"])) return workflowById("transition-state");
  if (hasAny(lower, ["mep", "minimum energy path"])) return workflowById("mrsf-mep");
  if (/\bsoc\b/.test(lower) || hasAny(lower, ["spin orbit", "spin-orbit"])) return workflowById("mrsf-soc");
  if (/\bnac\b/.test(lower) || hasAny(lower, ["nonadiabatic coupling", "non-adiabatic coupling"])) return workflowById("mrsf-nac");
  if (hasAny(lower, ["ekt", "ionization", "electron affinity", "ip/ea"])) return workflowById("ekt");
  if (hasAny(lower, ["nmr", "shielding"])) return workflowById("nmr");
  if (hasAny(lower, ["raman"])) return workflowById("raman");
  if (/\bir\b/.test(lower) || hasAny(lower, ["infrared"])) return workflowById("ir");
  if (hasAny(lower, ["pcm", "ddpcm", "solvent", "solvation"])) return workflowById("pcm");
  if (hasAny(lower, ["umrsf", "unrestricted mrsf"])) return workflowById("umrsf");
  if (/\btda\b/.test(lower) || hasAny(lower, ["tamm-dancoff", "tamm dancoff"])) return workflowById("tda");
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
  if (hasAny(lower, ["open shell", "open-shell", "radical", "uhf"])) return workflowById("open-shell-uhf");
  if (/\bd4\b/.test(lower) || hasAny(lower, ["dispersion"])) return workflowById("dft-d4");
  if (hasAny(lower, ["symmetry", "point group", "point-group", "labels"])) return workflowById("symmetry-labels");
  if (hasAny(lower, ["grid", "dftgrid", "radial grid", "angular grid"])) return workflowById("dft-grid-refined");
  if (/\btrah\b/.test(lower) || hasAny(lower, ["auto scf", "scf fallback", "scf recovery"])) return workflowById("scf-auto-trah");
  if (hasAny(lower, ["openmp", "threads", "threaded"])) return workflowById("threaded-local");
  if (hasAny(lower, ["optimize", "optimization", "geometry opt", "relax"])) return workflowById("optimize");
  if (hasAny(lower, ["gradient", "grad"])) return workflowById("dft-gradient");
  return workflowById("single-point");
}

function detectMethod(lower) {
  if (hasAny(lower, ["umrsf", "unrestricted mrsf"])) return "UMRSF-TDDFT";
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
  if (state.analysisJobMode) return normalizeXYZText(state.analysisXYZ);
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

  moleculeResizeObserver?.disconnect();
  moleculeResizeObserver = new ResizeObserver(queueMoleculeResize);
  moleculeResizeObserver.observe(moleculeSceneElement());
  window.addEventListener("resize", queueMoleculeResize, { passive: true });
  window.addEventListener("orientationchange", queueMoleculeResize, { passive: true });
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
  document.querySelector("#normalModeSelect")?.addEventListener("change", () => {
    viewerState.modePhase = 0;
    updateModeStatus();
    forceViewerRefresh();
  });
  document.querySelector("#modeAmplitude")?.addEventListener("input", () => {
    updateModeStatus();
    forceViewerRefresh();
  });
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

function moleculeSceneElement() {
  return dom.moleculeCanvas?.closest(".molecule-scene") || dom.moleculeCanvas;
}

function queueMoleculeResize() {
  if (moleculeResizeFrame) cancelAnimationFrame(moleculeResizeFrame);
  moleculeResizeFrame = requestAnimationFrame(() => {
    moleculeResizeFrame = 0;
    resizeMoleculeViewer();
  });
}

function resizeMoleculeViewer() {
  if (!renderer || !camera || !dom.moleculeCanvas) return;
  const rect = moleculeSceneElement().getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  const changed = width !== moleculeLastSize.width || height !== moleculeLastSize.height;
  moleculeLastSize = { width, height };
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  if (changed) {
    lastMoleculeSignature = "";
    updateMoleculeViewer();
  } else if (scene && camera) {
    renderer.render(scene, camera);
  }
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

function activeNormalMode() {
  const modes = state.analysisResult?.vibrations?.modes || [];
  const index = Number(dom.normalModeSelect?.value ?? -1);
  const mode = modes[index];
  return mode?.vectors?.length ? mode : null;
}

function modeAmplitudeValue() {
  return Number(dom.modeAmplitude?.value || 0.35);
}

function normalModeSignature() {
  const mode = activeNormalMode();
  if (!mode) return "";
  return `${dom.normalModeSelect?.value || 0}|${modeAmplitudeValue()}|${viewerState.modePhase.toFixed(2)}`;
}

function atomsWithNormalMode(atoms) {
  const mode = activeNormalMode();
  if (!mode) return atoms;
  const phase = Math.sin(viewerState.modePhase);
  const amplitude = modeAmplitudeValue();
  return atoms.map((atom, index) => {
    const vector = mode.vectors[index];
    if (!vector) return atom;
    return {
      ...atom,
      position: atom.position.clone().add(new THREE.Vector3(vector.x, vector.y, vector.z).multiplyScalar(amplitude * phase))
    };
  });
}

function updateMoleculeViewer() {
  const mode = dom.surfaceMode?.value || "molecule";
  const signature = `${moleculeDisplayLabel()}|${mode}|${viewerState.style}|${viewerState.labels}|${viewerState.numbers}|${viewerState.axis}|${normalModeSignature()}|${xyzBody()}`;
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
  const hadMolecule = moleculeRoot.children.length > 0;
  const previousRotation = moleculeRoot.rotation.clone();
  moleculeRoot.clear();
  if (atoms.length === 0) return;

  const center = new THREE.Box3().setFromPoints(atoms.map((atom) => atom.position)).getCenter(new THREE.Vector3());
  const normalizedAtoms = atoms.map((atom, index) => ({ ...atom, index, position: atom.position.clone().sub(center) }));
  const bounds = new THREE.Box3().setFromPoints(normalizedAtoms.map((atom) => atom.position));
  const size = bounds.getSize(new THREE.Vector3()).length() || 1;
  const scale = 2.9 / size;
  const displayAtoms = atomsWithNormalMode(normalizedAtoms);

  addSurfacePreview(displayAtoms, scale);
  addBonds(displayAtoms, scale);
  addAtoms(displayAtoms, scale);
  addNormalModeArrows(normalizedAtoms, scale);
  if (viewerState.axis) moleculeRoot.add(createAxisGroup());
  if (hadMolecule) moleculeRoot.rotation.copy(previousRotation);
  else moleculeRoot.rotation.set(-0.28, 0.55, 0.04);
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
    const radius = atomRadiusForStyle(style, scale);
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

function addNormalModeArrows(atoms, scale) {
  const mode = activeNormalMode();
  if (!mode || !moleculeRoot) return;
  const material = new THREE.LineBasicMaterial({ color: 0xf2c45f, transparent: true, opacity: 0.72 });
  const amplitude = Math.max(0.35, modeAmplitudeValue() * 1.8);
  atoms.forEach((atom, index) => {
    const vector = mode.vectors[index];
    if (!vector) return;
    const start = atom.position.clone().multiplyScalar(scale);
    const end = atom.position.clone().add(new THREE.Vector3(vector.x, vector.y, vector.z).multiplyScalar(amplitude)).multiplyScalar(scale);
    if (start.distanceTo(end) < 0.03) return;
    moleculeRoot.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([start, end]), material));
    moleculeRoot.add(createSurfaceMesh(end, new THREE.Vector3(0.055, 0.055, 0.055), 0xf2c45f, 0.78));
  });
}

function atomRadiusForStyle(style, moleculeScale = 1) {
  if (viewerState.style === "space-fill") return Math.max(0.38, Math.min(style.vdw * moleculeScale * 0.56, 1.45));
  if (viewerState.style === "wire") return 0.08;
  return Math.max(0.11, Math.min(style.radius * moleculeScale, style.radius));
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
  if (activeNormalMode()) {
    viewerState.modePhase = (viewerState.modePhase + 0.12) % (Math.PI * 2);
    lastMoleculeSignature = "";
    updateMoleculeViewer();
    return;
  }
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
  if (["TDHF", "SF-TDDFT", "MRSF-TDDFT", "UMRSF-TDDFT"].includes(dom.method?.value)) return "tdhf";
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
  const inputExtras = (workflow.inputExtras || []).map(replaceTemplateTokens);
  const hasD4Setting = inputExtras.some((line) => /^\s*d4\s*=/i.test(line));
  const lines = [
    "# OpenQP input generated by OpenQP Web",
    "# Default execution path: download this input and run OpenQP locally.",
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
  lines.push(...inputExtras);
  if (!hasD4Setting) lines.push("d4=False");
  lines.push("", "[guess]", "type=huckel", `save_mol=${workflow.saveMol ? "True" : "False"}`, "", "[scf]", `type=${workflow.scfType || "rhf"}`, `maxit=${workflow.scfMaxit || 100}`, `multiplicity=${dom.multiplicity.value}`, `conv=${dom.conv.value}`, "save_molden=False", ...scfExtras);

  const states = Number(dom.states.value || workflow.states || 0);
  if (states > 0 || inputMethod === "tdhf") {
    const tdhfType = workflow.tdhfType || (dom.method.value === "SF-TDDFT" ? "sf" : dom.method.value === "MRSF-TDDFT" ? "mrsf" : dom.method.value === "UMRSF-TDDFT" ? "umrsf" : "rpa");
    lines.push("", "[tdhf]", `type=${tdhfType}`, `maxit=${workflow.tdhfMaxit || 30}`, `multiplicity=${workflow.tdhfMultiplicity || 1}`, `nstate=${Math.max(states, 1)}`, `conv=${dom.conv.value}`, `zvconv=${dom.conv.value}`);
  }

  if (["mrsf", "umrsf"].includes(workflow.tdhfType) || ["ekt", "mrsf-soc", "mrsf-nac"].includes(workflow.id)) {
    lines.push("", "# Review active-space and reference settings before production MRSF runs.");
  }
  if (workflow.extraSections?.length) {
    lines.push("", ...workflow.extraSections.map(replaceTemplateTokens));
  }
  return `${lines.join("\n")}\n`;
}

function replaceTemplateTokens(line) {
  return line
    .replaceAll("{istate}", String(dom.istate?.value || 0))
    .replaceAll("{jstate}", String(dom.jstate?.value || 1))
    .replaceAll("{nstate}", String(dom.states?.value || 0))
    .replaceAll("{multiplicity}", String(dom.multiplicity?.value || 1));
}

function renderPreview() {
  if (dom.preview) dom.preview.value = renderInput();
  renderResultPreview();
  updateLocalRunPanel();
  updateMoleculeViewer();
}

function downloadFile(filename, content, type) {
  downloadBlob(filename, new Blob([content], { type }));
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadInput() {
  downloadFile(`${safeJobName()}.inp`, renderInput(), "text/plain");
}

function downloadXyz() {
  downloadFile(`${safeJobName ? safeJobName() : "openqp_structure"}.xyz`, `${xyzBody()}\n`, "chemical/x-xyz");
}

function detectPreferredLocalRunOs() {
  if (!dom.localRunOs) return;
  const platform = [
    navigator.userAgentData?.platform || "",
    navigator.platform || "",
    navigator.userAgent || ""
  ].join(" ").toLowerCase();
  if (platform.includes("win")) dom.localRunOs.value = "powershell";
  else if (platform.includes("mac")) dom.localRunOs.value = "macos";
  else dom.localRunOs.value = "bash";
  updateLocalRunPanel();
}

function localRunFileNames() {
  const job = safeJobName();
  return {
    job,
    input: `${job}.inp`,
    xyz: `${job}.xyz`,
    output: `${job}.out`,
    resultDir: "openqp-results"
  };
}

function selectedLocalRunOs() {
  return dom.localRunOs?.value || "bash";
}

function localRunCommand(os = selectedLocalRunOs()) {
  const files = localRunFileNames();
  if (os === "macos") {
    return [
      `Unzip ${localRunPackageName()} and double-click ${localRunScriptName(os)}.`,
      `Output will be written to ${files.resultDir}/${files.output}.`
    ].join("\n");
  }
  if (os === "powershell") {
    return [
      `New-Item -ItemType Directory -Force -Path ".\\${files.resultDir}" | Out-Null`,
      `openqp ".\\${files.input}" *> ".\\${files.resultDir}\\${files.output}"`
    ].join("\n");
  }
  if (os === "cmd") {
    return [
      `if not exist ${files.resultDir} mkdir ${files.resultDir}`,
      `openqp "${files.input}" > "${files.resultDir}\\${files.output}" 2>&1`
    ].join("\r\n");
  }
  return [
    `mkdir -p ${shellQuote(files.resultDir)}`,
    `openqp ${shellQuote(`./${files.input}`)} > ${shellQuote(`${files.resultDir}/${files.output}`)} 2>&1`
  ].join("\n");
}

function localRunScript(os = selectedLocalRunOs()) {
  const files = localRunFileNames();
  if (os === "macos") {
    return [
      "#!/bin/zsh",
      "set -euo pipefail",
      "",
      "trap 'status=$?; if [ \"$status\" -ne 0 ]; then echo \"\"; echo \"OpenQP run failed. Press Return to close this window.\"; read -r _ || true; fi' EXIT",
      "",
      "cd -- \"${0:A:h}\"",
      "",
      "for profile in \"$HOME/.zprofile\" \"$HOME/.zshrc\"; do",
      "  if [ -r \"$profile\" ]; then",
      "    source \"$profile\" >/dev/null 2>&1 || true",
      "  fi",
      "done",
      "",
      "if ! command -v openqp >/dev/null 2>&1; then",
      "  echo \"OpenQP command not found. Install OpenQP and add the openqp command to PATH.\" >&2",
      "  exit 1",
      "fi",
      "",
      `test -f ${shellQuote(files.input)} || { echo "Missing ${files.input} in this folder." >&2; exit 1; }`,
      `test -f ${shellQuote(files.xyz)} || { echo "Missing ${files.xyz} in this folder." >&2; exit 1; }`,
      `mkdir -p ${shellQuote(files.resultDir)}`,
      `openqp ${shellQuote(`./${files.input}`)} > ${shellQuote(`${files.resultDir}/${files.output}`)} 2>&1`,
      `echo "OpenQP finished. Output: ${files.resultDir}/${files.output}"`,
      "echo \"\"",
      "echo \"Press Return to close this window.\"",
      "read -r _ || true"
    ].join("\n") + "\n";
  }
  if (os === "powershell") {
    return [
      "$ErrorActionPreference = \"Stop\"",
      "$openqp = Get-Command openqp -ErrorAction SilentlyContinue",
      "if (-not $openqp) {",
      "  Write-Error \"OpenQP command not found. Install OpenQP and add the openqp command to PATH.\"",
      "}",
      `if (-not (Test-Path ".\\${files.input}")) { Write-Error "Missing ${files.input} in this folder." }`,
      `if (-not (Test-Path ".\\${files.xyz}")) { Write-Error "Missing ${files.xyz} in this folder." }`,
      `New-Item -ItemType Directory -Force -Path ".\\${files.resultDir}" | Out-Null`,
      `& $openqp.Source ".\\${files.input}" *> ".\\${files.resultDir}\\${files.output}"`,
      `Write-Host "OpenQP finished. Output: .\\${files.resultDir}\\${files.output}"`
    ].join("\r\n") + "\r\n";
  }
  if (os === "cmd") {
    return [
      "@echo off",
      "setlocal",
      "where openqp >nul 2>nul",
      "if errorlevel 1 (",
      "  echo OpenQP command not found. Install OpenQP and add openqp to PATH.",
      "  exit /b 1",
      ")",
      `if not exist "${files.input}" (`,
      `  echo Missing ${files.input} in this folder.`,
      "  exit /b 1",
      ")",
      `if not exist "${files.xyz}" (`,
      `  echo Missing ${files.xyz} in this folder.`,
      "  exit /b 1",
      ")",
      `if not exist ${files.resultDir} mkdir ${files.resultDir}`,
      `openqp "${files.input}" > "${files.resultDir}\\${files.output}" 2>&1`,
      "if errorlevel 1 (",
      `  echo OpenQP exited with an error. See ${files.resultDir}\\${files.output}`,
      "  exit /b 1",
      ")",
      `echo OpenQP finished. Output: ${files.resultDir}\\${files.output}`
    ].join("\r\n") + "\r\n";
  }
  return [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    "script_dir=\"$(cd \"$(dirname \"${BASH_SOURCE[0]}\")\" && pwd)\"",
    "cd \"$script_dir\"",
    "",
    "if ! command -v openqp >/dev/null 2>&1; then",
    "  echo \"OpenQP command not found. Install OpenQP and add the openqp command to PATH.\" >&2",
    "  exit 1",
    "fi",
    "",
    `test -f ${shellQuote(files.input)} || { echo "Missing ${files.input} in this folder." >&2; exit 1; }`,
    `test -f ${shellQuote(files.xyz)} || { echo "Missing ${files.xyz} in this folder." >&2; exit 1; }`,
    `mkdir -p ${shellQuote(files.resultDir)}`,
    `openqp ${shellQuote(`./${files.input}`)} > ${shellQuote(`${files.resultDir}/${files.output}`)} 2>&1`,
    `echo "OpenQP finished. Output: ${files.resultDir}/${files.output}"`
  ].join("\n") + "\n";
}

function localRunScriptName(os = selectedLocalRunOs()) {
  const job = safeJobName();
  if (os === "macos") return `run_${job}.command`;
  if (os === "powershell") return `run_${job}.ps1`;
  if (os === "cmd") return `run_${job}.bat`;
  return `run_${job}.sh`;
}

function localRunScriptType(os = selectedLocalRunOs()) {
  if (os === "powershell") return "text/plain;charset=utf-8";
  if (os === "cmd") return "application/x-msdos-program";
  return "text/x-shellscript;charset=utf-8";
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function updateLocalRunPanel() {
  if (!dom.localRunCommand) return;
  dom.localRunCommand.textContent = localRunCommand();
  if (dom.localRunStatus) {
    const files = localRunFileNames();
    const script = localRunScriptName();
    if (selectedLocalRunOs() === "macos") {
      dom.localRunStatus.textContent =
        `Download ${localRunPackageName()}, unzip it, then double-click ${script}.`;
    } else {
      dom.localRunStatus.textContent =
        `Download ${files.input}, ${files.xyz}, and ${script}; keep them together before running.`;
    }
  }
}

function localRunPackageName() {
  return `${safeJobName()}_openqp_run.zip`;
}

function localRunPackageFiles() {
  const os = selectedLocalRunOs();
  const files = localRunFileNames();
  const scriptName = localRunScriptName(os);
  const readmeLines = [
    "OpenQP local run package",
    "",
    `Job: ${files.job}`,
    "",
    `Files in this package:`,
    `- ${files.input}: generated OpenQP input`,
    `- ${files.xyz}: molecular coordinates`,
    `- ${scriptName}: local launcher script`,
    "",
    os === "macos"
      ? `On macOS, unzip this package and double-click ${scriptName}.`
      : `Keep these files in one folder and run ${scriptName} from that folder.`,
    "The launcher expects the openqp command to be installed and available on PATH.",
    `Output will be written to ${files.resultDir}/${files.output}.`,
    "",
    "Nothing is uploaded by this local run path."
  ];
  return [
    { name: files.input, content: renderInput(), type: "text/plain;charset=utf-8" },
    { name: files.xyz, content: `${xyzBody()}\n`, type: "chemical/x-xyz" },
    { name: scriptName, content: localRunScript(os), type: localRunScriptType(os), executable: ["macos", "bash"].includes(os) },
    { name: "README.txt", content: `${readmeLines.join("\n")}\n`, type: "text/plain;charset=utf-8" }
  ];
}

function downloadRunPackage() {
  const packageName = localRunPackageName();
  const blob = zipFiles(localRunPackageFiles());
  downloadBlob(packageName, blob);
  const script = localRunScriptName();
  const nextStep = selectedLocalRunOs() === "macos"
    ? `Unzip ${packageName}, then double-click ${script}.`
    : `Unzip ${packageName}, then run ${script} from that folder.`;
  setStatusText(dom.localRunStatus, nextStep, "ok");
}

function zipFiles(files) {
  const encoder = new TextEncoder();
  const now = new Date();
  const { time, date } = dosDateTime(now);
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = typeof file.content === "string" ? encoder.encode(file.content) : file.content;
    const crc = crc32(dataBytes);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, time, true);
    localView.setUint16(12, date, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, dataBytes.length, true);
    localView.setUint32(22, dataBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localHeader.set(nameBytes, 30);
    localParts.push(localHeader, dataBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 0x0314, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, time, true);
    centralView.setUint16(14, date, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, dataBytes.length, true);
    centralView.setUint32(24, dataBytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, (file.executable ? 0o100755 : 0o100644) * 0x10000, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    centralParts.push(centralHeader);

    offset += localHeader.length + dataBytes.length;
  }

  const centralOffset = offset;
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, centralOffset, true);

  return new Blob([...localParts, ...centralParts, endRecord], { type: "application/zip" });
}

function dosDateTime(value) {
  const year = Math.max(value.getFullYear(), 1980);
  return {
    time: (value.getHours() << 11) | (value.getMinutes() << 5) | Math.floor(value.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((value.getMonth() + 1) << 5) | value.getDate()
  };
}

let crc32Lookup;

function crc32(bytes) {
  if (!crc32Lookup) {
    crc32Lookup = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let current = index;
      for (let bit = 0; bit < 8; bit += 1) {
        current = current & 1 ? 0xedb88320 ^ (current >>> 1) : current >>> 1;
      }
      crc32Lookup[index] = current >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = crc32Lookup[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function restoreLocalRunnerToken() {
  if (!dom.localRunnerToken) return;
  try {
    dom.localRunnerToken.value = sessionStorage.getItem(LOCAL_RUNNER_TOKEN_KEY) || "";
  } catch (error) {
    dom.localRunnerToken.value = "";
  }
}

function storeLocalRunnerToken() {
  if (!dom.localRunnerToken) return;
  try {
    sessionStorage.setItem(LOCAL_RUNNER_TOKEN_KEY, dom.localRunnerToken.value.trim());
  } catch (error) {
    // Ignore private-browsing storage failures; the field still works for this page.
  }
}

function rememberedLocalRunnerToken() {
  try {
    return sessionStorage.getItem(LOCAL_RUNNER_TOKEN_KEY) || "";
  } catch (error) {
    return "";
  }
}

function localRunnerToken() {
  return dom.localRunnerToken?.value.trim() || rememberedLocalRunnerToken();
}

function handleLocalRunnerTokenInput() {
  storeLocalRunnerToken();
  setLocalRunnerReady(false);
  if (localRunnerToken()) {
    scheduleLocalRunnerAutoCheck();
  } else {
    setLocalRunnerStatus("Paste the pairing code from the local runner to enable direct run.", "running");
  }
}

function scheduleLocalRunnerAutoCheck() {
  if (localRunnerState.tokenCheckTimer) window.clearTimeout(localRunnerState.tokenCheckTimer);
  localRunnerState.tokenCheckTimer = window.setTimeout(() => {
    localRunnerState.tokenCheckTimer = 0;
    checkLocalRunner({ quiet: true }).catch(() => {});
  }, 650);
}

function localRunnerHeaders(hasBody = false) {
  const headers = {};
  const token = localRunnerToken();
  if (hasBody) headers["Content-Type"] = "application/json";
  if (token) headers["X-OpenQP-Runner-Token"] = token;
  return headers;
}

async function localRunnerRequest(path, options = {}) {
  const response = await fetch(`${LOCAL_RUNNER_URL}${path}`, {
    mode: "cors",
    cache: "no-store",
    ...options,
    headers: {
      ...localRunnerHeaders(Boolean(options.body)),
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    data = { error: text || "Local runner returned an unreadable response." };
  }
  if (!response.ok) {
    throw new Error(data.error || `Local runner returned HTTP ${response.status}.`);
  }
  return data;
}

function setLocalRunnerStatus(text, stateName = "") {
  setStatusText(dom.localRunnerStatus, text, stateName);
}

function setLocalRunnerLog(text) {
  if (!dom.localRunnerLog) return;
  dom.localRunnerLog.textContent = text || "";
  dom.localRunnerLog.scrollTop = dom.localRunnerLog.scrollHeight;
}

function setLocalRunnerBusy(isBusy) {
  localRunnerState.busy = Boolean(isBusy);
  updateLocalRunnerControls();
}

function setLocalRunnerReady(isReady) {
  localRunnerState.ready = Boolean(isReady);
  updateLocalRunnerControls();
}

function updateLocalRunnerControls() {
  if (dom.runLocalOpenQp) dom.runLocalOpenQp.disabled = localRunnerState.busy || !localRunnerState.ready;
  if (dom.checkLocalRunner) dom.checkLocalRunner.disabled = localRunnerState.busy;
  if (dom.cancelLocalOpenQp) dom.cancelLocalOpenQp.disabled = !localRunnerState.busy;
}

function setLocalSetupDetected(text, stateName = "") {
  setStatusText(dom.localSetupDetected, text, stateName);
}

function openLocalSetupDialog(message = "", stateName = "running") {
  if (message) setLocalSetupDetected(message, stateName);
  if (!dom.localSetupDialog) return;
  if (typeof dom.localSetupDialog.showModal === "function" && !dom.localSetupDialog.open) {
    dom.localSetupDialog.showModal();
  } else {
    dom.localSetupDialog.setAttribute("open", "");
  }
}

function closeLocalSetupDialog() {
  if (!dom.localSetupDialog) return;
  if (typeof dom.localSetupDialog.close === "function") {
    dom.localSetupDialog.close();
  } else {
    dom.localSetupDialog.removeAttribute("open");
  }
}

async function copySetupCommand(button, command) {
  if (!button) return;
  const original = button.textContent;
  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(command);
      copied = true;
    }
  } catch (error) {
    copied = false;
  }
  button.textContent = copied ? "Copied" : "Select command";
  setTimeout(() => { button.textContent = original; }, 1200);
}

function localRunnerConnectionMessage(error) {
  const message = error?.message || "";
  if (window.location.protocol === "https:" && /Failed to fetch|Load failed|NetworkError/i.test(message)) {
    return "This browser blocked direct localhost access from HTTPS. Start the local runner, then open local mode.";
  }
  return message || "Could not connect to local runner.";
}

async function checkLocalRunner({ quiet = false } = {}) {
  try {
    const health = await localRunnerRequest("/health");
    const hasOpenQp = Boolean(health.openqp?.available);
    let paired = false;
    let pairMessage = "";
    if (hasOpenQp && localRunnerToken()) {
      try {
        await localRunnerRequest("/pair");
        paired = true;
      } catch (error) {
        if (/not found/i.test(error?.message || "")) {
          paired = true;
          pairMessage = "Runner connected. Download the updated runner from setup when convenient.";
        } else {
          pairMessage = "The pairing code was not accepted. Check the code printed by the runner.";
        }
      }
    }
    const openqpText = hasOpenQp ? `OpenQP: ${health.openqp.path || health.openqp.configured}` : "OpenQP command not found";
    const statusText = !hasOpenQp
      ? "Local runner connected, but OpenQP is not installed yet. Open setup and run the installer."
      : paired
        ? `Ready for direct run. ${openqpText}.`
        : localRunnerToken()
          ? pairMessage
          : `Local runner connected. ${openqpText}. Paste the pairing code to enable direct run.`;
    setLocalRunnerStatus(
      statusText,
      paired ? "ok" : hasOpenQp && !localRunnerToken() ? "running" : "error"
    );
    setLocalSetupDetected(
      paired
        ? "Direct run is ready. Close this guide and run the job."
        : hasOpenQp
          ? `OpenQP was found at ${health.openqp?.path || health.openqp?.configured}. Paste the pairing code, then run the job.`
        : "OpenQP was not found. Download and run the OpenQP installer, then restart the local runner.",
      paired ? "ok" : hasOpenQp ? "running" : "error"
    );
    setLocalRunnerReady(paired);
    if (!quiet) {
      const lines = [
        `${health.runner || "OpenQP Local Runner"} ${health.version || ""}`.trim(),
        `Work folder: ${health.workDir || ""}`,
        `Limit: ${health.maxAtoms || "?"} atoms, ${health.timeoutSeconds || "?"} s`,
        openqpText
      ];
      if (hasOpenQp && paired) {
        lines.push(pairMessage || "Pairing code accepted.", "Run with local OpenQP is enabled.");
      } else if (hasOpenQp && localRunnerToken()) {
        lines.push(pairMessage);
      } else if (hasOpenQp) {
        lines.push("Paste the pairing code printed by the runner.");
      }
      if (!hasOpenQp) {
        lines.push("", "Install command:", "python3 ~/Downloads/install-openqp-local.py", "", "Then restart the local runner.");
      }
      setLocalRunnerLog(lines.join("\n"));
    }
    return health;
  } catch (error) {
    setLocalRunnerReady(false);
    if (!quiet) {
      setLocalRunnerStatus(localRunnerConnectionMessage(error), "error");
      setLocalRunnerLog(localRunnerConnectionMessage(error));
      setLocalSetupDetected("The local runner is not connected. Download it, start it in Terminal, then copy its pairing code.", "error");
    }
    throw error;
  }
}

async function startLocalRunnerJob() {
  if (!localRunnerToken()) {
    const message = "Paste the pairing code printed by the local runner before starting the job.";
    setLocalRunnerStatus(message, "error");
    openLocalSetupDialog(message, "error");
    dom.localRunnerToken?.focus();
    return;
  }

  stopLocalRunnerPolling();
  setLocalRunnerBusy(true);
  setLocalRunnerStatus("Starting local OpenQP run...", "running");
  setLocalRunnerLog("");

  try {
    const health = await checkLocalRunner({ quiet: true });
    if (!health.openqp?.available) {
      const message = "OpenQP is not installed yet. Run the OpenQP installer, restart the local runner, then try again.";
      setLocalRunnerBusy(false);
      setLocalRunnerStatus(message, "error");
      openLocalSetupDialog(message, "error");
      return;
    }
    if (!localRunnerState.ready) {
      const message = "Direct run is not ready yet. Check the runner and pairing code in setup.";
      setLocalRunnerBusy(false);
      setLocalRunnerStatus(message, "error");
      openLocalSetupDialog(message, "error");
      return;
    }
    const job = await localRunnerRequest("/jobs", {
      method: "POST",
      body: JSON.stringify({
        jobName: safeJobName(),
        input: renderInput(),
        xyz: `${xyzBody()}\n`,
        workflow: state.workflow?.id || "",
        timeoutSeconds: 900
      })
    });
    localRunnerState.jobId = job.id;
    updateLocalRunnerJob(job);
    startLocalRunnerPolling();
  } catch (error) {
    const message = localRunnerConnectionMessage(error);
    setLocalRunnerBusy(false);
    setLocalRunnerStatus(message, "error");
    openLocalSetupDialog(message, "error");
  }
}

function startLocalRunnerPolling() {
  stopLocalRunnerPolling();
  localRunnerState.pollTimer = window.setInterval(pollLocalRunnerJob, LOCAL_RUNNER_POLL_MS);
}

function stopLocalRunnerPolling() {
  if (!localRunnerState.pollTimer) return;
  window.clearInterval(localRunnerState.pollTimer);
  localRunnerState.pollTimer = 0;
}

async function pollLocalRunnerJob() {
  if (!localRunnerState.jobId) return;
  try {
    const job = await localRunnerRequest(`/jobs/${encodeURIComponent(localRunnerState.jobId)}`);
    updateLocalRunnerJob(job);
  } catch (error) {
    stopLocalRunnerPolling();
    setLocalRunnerBusy(false);
    setLocalRunnerStatus(localRunnerConnectionMessage(error), "error");
  }
}

function updateLocalRunnerJob(job) {
  const status = job.status || "unknown";
  const terminal = ["complete", "failed", "canceled", "timed_out"].includes(status);
  const statusText = {
    queued: "Local OpenQP job is queued.",
    running: "Local OpenQP is running.",
    canceling: "Stopping local OpenQP run...",
    complete: `Local OpenQP finished. Output: ${job.output || ""}`,
    failed: `Local OpenQP failed. Output: ${job.output || ""}`,
    canceled: "Local OpenQP run was stopped.",
    timed_out: "Local OpenQP run timed out."
  }[status] || `Local OpenQP status: ${status}.`;
  setLocalRunnerStatus(statusText, terminal ? (status === "complete" ? "ok" : "error") : "running");
  setLocalRunnerLog(job.log || "");
  if (terminal) {
    stopLocalRunnerPolling();
    setLocalRunnerBusy(false);
    if (status === "complete") openCompletedLocalRunAnalysis(job);
  } else {
    setLocalRunnerBusy(true);
  }
}

function openCompletedLocalRunAnalysis(job) {
  if (!job?.id || localRunnerState.analysisOpenedFor === job.id) return;
  localRunnerState.analysisOpenedFor = job.id;
  const url = new URL("/analysis.html", LOCAL_RUNNER_URL);
  url.searchParams.set("job", job.id);
  const token = localRunnerToken();
  if (token) url.hash = `token=${encodeURIComponent(token)}`;
  window.setTimeout(() => {
    window.location.href = url.toString();
  }, 700);
}

async function cancelLocalRunnerJob() {
  if (!localRunnerState.jobId) return;
  try {
    const job = await localRunnerRequest(`/jobs/${encodeURIComponent(localRunnerState.jobId)}/cancel`, { method: "POST" });
    updateLocalRunnerJob(job);
  } catch (error) {
    setLocalRunnerStatus(error.message || "Could not stop local OpenQP.", "error");
  }
}

async function copyLocalCommand() {
  const button = dom.copyLocalCommand;
  if (!button) return;
  const original = button.textContent;
  const command = localRunCommand();
  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(command);
      copied = true;
    }
  } catch (error) {
    copied = false;
  }
  button.textContent = copied ? "Copied" : "Select command";
  if (!copied && dom.localRunCommand) {
    const range = document.createRange();
    range.selectNodeContents(dom.localRunCommand);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
  setTimeout(() => { button.textContent = original; }, 1200);
}

function downloadRunScript() {
  const os = selectedLocalRunOs();
  downloadFile(localRunScriptName(os), localRunScript(os), localRunScriptType(os));
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
    applyParsedAnalysis(parsed);
    updateAnalysisSummary(parsed);
    if (dom.preview) renderPreview();
    else updateMoleculeViewer();
  } catch (error) {
    setStatusText(dom.viewerDataStatus, error.message || "Could not read that data.", "error");
  }
}

function createEmptyAnalysisResult() {
  return {
    energy: { values: [] },
    orbitals: { levels: [] },
    vibrations: { modes: [], units: {} },
    nmr: { tensors: [] },
    hessian: { matrix: null, metadata: {}, dimension: 0 },
    surfaces: []
  };
}

function applyParsedAnalysis(parsed) {
  state.analysisResult = normalizeAnalysisResult(parsed.analysis || createEmptyAnalysisResult());
  syncNormalModeControls();
  renderAnalysisViewers();
}

function normalizeAnalysisResult(analysis) {
  const empty = createEmptyAnalysisResult();
  return {
    energy: { ...empty.energy, ...(analysis.energy || {}) },
    orbitals: { ...empty.orbitals, ...(analysis.orbitals || {}) },
    vibrations: { ...empty.vibrations, ...(analysis.vibrations || {}) },
    nmr: { ...empty.nmr, ...(analysis.nmr || {}) },
    hessian: { ...empty.hessian, ...(analysis.hessian || {}) },
    surfaces: analysis.surfaces || []
  };
}

function hasAnalysisData(analysis) {
  const normalized = normalizeAnalysisResult(analysis);
  return Boolean(
    normalized.energy.values.length ||
    normalized.orbitals.levels.length ||
    normalized.vibrations.modes.length ||
    normalized.nmr.tensors.length ||
    normalized.hessian.matrix ||
    normalized.surfaces.length
  );
}

function mergeAnalysis(...items) {
  const merged = createEmptyAnalysisResult();
  for (const item of items.filter(Boolean).map(normalizeAnalysisResult)) {
    merged.energy.values.push(...(item.energy.values || []));
    merged.orbitals.levels.push(...(item.orbitals.levels || []));
    merged.vibrations.modes.push(...(item.vibrations.modes || []));
    merged.nmr.tensors.push(...(item.nmr.tensors || []));
    merged.surfaces.push(...(item.surfaces || []));
    if (item.energy.energy !== undefined) merged.energy.energy = item.energy.energy;
    if (item.orbitals.source) merged.orbitals.source = item.orbitals.source;
    if (item.vibrations.units) merged.vibrations.units = { ...(merged.vibrations.units || {}), ...item.vibrations.units };
    if (item.hessian.matrix) merged.hessian = item.hessian;
  }
  merged.energy.values = dedupeAnalysisRows(merged.energy.values, (row) => `${row.label}|${row.value}|${row.index}`);
  merged.orbitals.levels = dedupeAnalysisRows(merged.orbitals.levels, (row) => `${row.index}|${row.energy}|${row.spin}|${row.occupation}`);
  merged.vibrations.modes = dedupeAnalysisRows(merged.vibrations.modes, (row) => `${row.index}|${row.frequency}`);
  return merged;
}

function dedupeAnalysisRows(rows, keyFn) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = keyFn(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractTextAnalysis(text) {
  return mergeAnalysis(
    { energy: { values: extractEnergyValues(text) } },
    { vibrations: { modes: extractVibrationsFromText(text), units: { frequency: "cm-1" } } },
    { nmr: { tensors: extractNmrTensorsFromText(text) } }
  );
}

function extractEnergyValues(text) {
  const values = [];
  const patterns = [
    /(?:Final\s+(?:SCF\s+)?Energy|Total\s+Energy|SCF\s+Energy|PyOQP state\s+\d+)\s*[:=]?\s*([-+]?\d+(?:\.\d+)?(?:[Ee][-+]?\d+)?)/gi,
    /^\s*(?:step\s+)?(\d+)\s+([-+]?\d+\.\d+(?:[Ee][-+]?\d+)?)\s+(?:[-+]?\d|\s*$)/gim
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text))) {
      const value = Number(match[2] || match[1]);
      if (!Number.isFinite(value) || Math.abs(value) < 1e-12) continue;
      const index = values.length + 1;
      values.push({ index, label: `E${index}`, value, unit: "hartree" });
    }
  }
  return values;
}

function extractVibrationsFromText(text) {
  const modes = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!/(freq|frequency|cm-1|ir|raman)/i.test(line)) continue;
    const numbers = numericValues(line);
    if (!numbers.length) continue;
    const frequency = numbers.find((value) => Math.abs(value) > 20 && Math.abs(value) < 10000);
    if (!Number.isFinite(frequency)) continue;
    const mode = {
      index: modes.length + 1,
      frequency,
      ir: /ir|infrared/i.test(line) ? numbers.at(-1) : undefined,
      raman: /raman/i.test(line) ? numbers.at(-1) : undefined,
      vectors: []
    };
    modes.push(mode);
  }
  return modes;
}

function extractNmrTensorsFromText(text) {
  if (!/(nmr|shield|shielding|sigma|tensor)/i.test(text)) return [];
  const tensors = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || /^[#=-]/.test(trimmed)) continue;
    const rowBody = trimmed.replace(/^(?:\d+\s+)?[A-Z][a-z]?\d*\b\s*/, "");
    const numbers = numericValues(rowBody);
    if (numbers.length < 2) continue;
    const atom = trimmed.match(/^(?:\d+\s+)?([A-Z][a-z]?)(?:\d+)?\b/)?.[1] || `Atom ${tensors.length + 1}`;
    if (!atom || /^(NMR|ISO|Tensor)$/i.test(atom)) continue;
    const tensor = numbers.length >= 9 ? [numbers.slice(-9, -6), numbers.slice(-6, -3), numbers.slice(-3)] : null;
    const iso = tensor ? (tensor[0][0] + tensor[1][1] + tensor[2][2]) / 3 : numbers[0];
    tensors.push({ atom, index: tensors.length + 1, iso, anisotropy: numbers[1], tensor });
  }
  return tensors.slice(0, 80);
}

function extractJsonAnalysis(source) {
  const analysis = createEmptyAnalysisResult();
  if (Number.isFinite(Number(source.energy))) {
    analysis.energy.energy = Number(source.energy);
    analysis.energy.values.push({ index: 1, label: "Energy", value: Number(source.energy), unit: "hartree" });
  }
  const energies = firstArray(source.energies, source.energy_history, source.energyHistory, source.data?.energies);
  if (energies) {
    analysis.energy.values.push(...energies.map((value, index) => ({ index: index + 1, label: `Step ${index + 1}`, value: Number(value), unit: "hartree" })).filter((row) => Number.isFinite(row.value)));
  }
  const orbitalValues = firstArray(source.orbital_energies, source.orbitalEnergy, source.mo_energy, source.orbitals?.energies, source.data?.orbital_energies);
  if (orbitalValues) {
    analysis.orbitals.levels = orbitalValues.map((energy, index) => ({
      index: index + 1,
      energy: Number(energy),
      occupation: Number(firstArray(source.occupations, source.mo_occ, source.orbitals?.occupations)?.[index] || 0),
      spin: "Alpha"
    })).filter((row) => Number.isFinite(row.energy));
    analysis.orbitals.source = "JSON";
  }
  const vibrationAnalysis = extractJsonVibrations(source);
  analysis.vibrations = vibrationAnalysis.vibrations;
  analysis.hessian = vibrationAnalysis.hessian;
  analysis.nmr.tensors = extractJsonNmrTensors(source);
  return analysis;
}

function extractJsonVibrations(source) {
  const frequencies = firstArray(source.freqs, source.frequencies, source.frequency_modes?.["frequencies_cm-1"], source.vibrations?.frequencies);
  const rawModes = firstArray(source.modes, source.normal_modes, source.frequency_modes?.normal_mode_eigenvectors, source.vibrations?.modes);
  const ir = firstArray(source.infrared_intensities, source.ir_intensities, source.vibrations?.ir);
  const raman = firstArray(source.raman_activities, source.vibrations?.raman);
  const modes = (frequencies || []).map((frequency, index) => ({
    index: index + 1,
    frequency: Number(frequency),
    ir: Number(ir?.[index]),
    raman: Number(raman?.[index]),
    vectors: normalizeModeVectors(rawModes?.[index] || [], atomCountFromJson(source))
  })).filter((mode) => Number.isFinite(mode.frequency));
  const hessian = Array.isArray(source.hessian)
    ? {
        matrix: source.hessian,
        metadata: source.hessian_metadata || {},
        dimension: source.hessian.length,
        energy: Number(source.energy),
        maxAbs: maxAbsMatrix(source.hessian),
        trace: traceMatrix(source.hessian)
      }
    : { matrix: null, metadata: {}, dimension: 0 };
  return {
    vibrations: {
      modes,
      units: {
        frequency: "cm-1",
        ir: source.vibrational_intensity_metadata?.ir_units || "km/mol",
        raman: source.vibrational_intensity_metadata?.raman_units || "A^4/amu"
      },
      metadata: source.vibrational_intensity_metadata || {}
    },
    hessian
  };
}

function extractJsonNmrTensors(source) {
  const candidates = [source.nmr, source.nmr_shielding, source.shielding, source.properties?.nmr, source.data?.nmr].filter(Boolean);
  const tensors = [];
  for (const candidate of candidates) {
    const rows = Array.isArray(candidate) ? candidate : candidate.tensors || candidate.atoms || candidate.shieldings || [];
    for (const row of rows) {
      if (!row) continue;
      const tensor = row.tensor || row.shielding_tensor || row.sigma || null;
      const flatTensor = Array.isArray(tensor) ? tensor.flat().map(Number) : [];
      const matrix = flatTensor.length >= 9 ? [flatTensor.slice(0, 3), flatTensor.slice(3, 6), flatTensor.slice(6, 9)] : null;
      const iso = Number(row.iso ?? row.isotropic ?? row.sigma_iso ?? (matrix ? (matrix[0][0] + matrix[1][1] + matrix[2][2]) / 3 : NaN));
      if (!Number.isFinite(iso) && !matrix) continue;
      tensors.push({
        atom: normalizeSymbol(row.atom || row.symbol || row.element) || `Atom ${tensors.length + 1}`,
        index: Number(row.index || tensors.length + 1),
        iso,
        anisotropy: Number(row.anisotropy ?? row.aniso),
        tensor: matrix
      });
    }
  }
  return tensors;
}

function parseMoldenOrbitals(text) {
  const section = text.split(/^\[MO\]/im)[1] || "";
  if (!section) return [];
  const levels = [];
  let current = null;
  for (const rawLine of section.split(/\r?\n/)) {
    const line = rawLine.trim();
    const energy = line.match(/^Ene=\s*([-+0-9.Ee]+)/i);
    if (energy) {
      if (current) levels.push(current);
      current = { index: levels.length + 1, energy: Number(energy[1]), occupation: 0, spin: "", symmetry: "" };
      continue;
    }
    if (!current) continue;
    const spin = line.match(/^Spin=\s*(.+)$/i);
    const occupation = line.match(/^Occup=\s*([-+0-9.Ee]+)/i);
    const symmetry = line.match(/^Sym=\s*(.+)$/i);
    if (spin) current.spin = spin[1].trim();
    if (occupation) current.occupation = Number(occupation[1]);
    if (symmetry) current.symmetry = symmetry[1].trim();
  }
  if (current) levels.push(current);
  return levels.filter((level) => Number.isFinite(level.energy));
}

function firstArray(...values) {
  return values.find((value) => Array.isArray(value));
}

function atomCountFromJson(source) {
  if (Array.isArray(source.atoms)) return source.atoms.length;
  if (Array.isArray(source.coord)) return Math.floor(source.coord.length / 3);
  return 0;
}

function normalizeModeVectors(rawMode, atomCount) {
  if (!Array.isArray(rawMode) || !atomCount) return [];
  const flat = rawMode.flat().map(Number).filter(Number.isFinite);
  const vectors = [];
  for (let i = 0; i < atomCount; i += 1) {
    vectors.push({ x: flat[i * 3] || 0, y: flat[i * 3 + 1] || 0, z: flat[i * 3 + 2] || 0 });
  }
  const maxLength = Math.max(...vectors.map((vector) => Math.hypot(vector.x, vector.y, vector.z)), 0);
  if (!maxLength) return vectors;
  return vectors.map((vector) => ({ x: vector.x / maxLength, y: vector.y / maxLength, z: vector.z / maxLength }));
}

function numericValues(text) {
  return [...text.matchAll(/[-+]?\d+(?:\.\d+)?(?:[Ee][-+]?\d+)?/g)].map((match) => Number(match[0])).filter(Number.isFinite);
}

function maxAbsMatrix(matrix) {
  return Math.max(...matrix.flat().map((value) => Math.abs(Number(value))).filter(Number.isFinite), 0);
}

function traceMatrix(matrix) {
  return matrix.reduce((sum, row, index) => sum + Number(row?.[index] || 0), 0);
}

function parseViewerData(text, fileName = "data.txt") {
  if (/\.(cube|cub)$/i.test(fileName) || looksLikeCube(text)) return parseCubeGeometry(text, fileName);
  if (/\.(molden|mol)$/i.test(fileName) || /\[Atoms\]/i.test(text)) return parseMoldenGeometry(text, fileName);
  if (/\.(json)$/i.test(fileName) || looksLikeJson(text)) return parseJsonGeometry(text, fileName);
  if (/\.(log|out)$/i.test(fileName) || text.includes("Cartesian Coordinate in Angstrom")) return parseOpenQpLogGeometry(text, fileName);
  const textAnalysis = extractTextAnalysis(text);
  if (hasAnalysisData(textAnalysis) && looksLikeResultSectionText(text)) return parseResultOnlyText(text, fileName, textAnalysis);
  if (looksLikeXYZ(text)) return parseXyzGeometry(text, fileName);
  if (hasAnalysisData(textAnalysis)) return parseResultOnlyText(text, fileName, textAnalysis);
  throw new Error("Supported local formats are XYZ, OpenQP log/out, Molden, cube, and JSON geometry.");
}

function looksLikeResultSectionText(text) {
  return /(nmr\s+shield|shielding\s+tensor|normal\s+mode|frequenc|cm-1|infrared|raman|hessian|orbital\s+energ|molecular\s+orbital|energy\s+(path|trace|history))/i.test(text);
}

function parseResultOnlyText(text, fileName, analysis = extractTextAnalysis(text)) {
  const normalized = normalizeAnalysisResult(analysis);
  return {
    type: "Result text",
    xyz: "0\nResult without geometry",
    status: `Loaded result metadata from ${fileName}.`,
    atoms: 0,
    frames: 0,
    orbitals: normalized.orbitals.levels.length,
    energies: normalized.energy.values.map((row) => row.value),
    summary: [
      "No coordinate block found",
      `${normalized.energy.values.length} energy value(s)`,
      `${normalized.vibrations.modes.length} vibrational mode(s)`,
      `${normalized.nmr.tensors.length} NMR tensor row(s)`
    ],
    sample: text.split(/\r?\n/).slice(0, 16).join("\n"),
    analysis: normalized
  };
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
    sample: xyz.split("\n").slice(0, 8).join("\n"),
    analysis: createEmptyAnalysisResult()
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
  const orbitals = parseMoldenOrbitals(text);
  const moCount = orbitals.length;
  return {
    type: "Molden",
    xyz: atomsToXYZ(atoms, fileName.replace(/\.(molden|mol)$/i, "")),
    status: `Loaded Molden geometry (${atoms.length} atoms, ${moCount} MO records).`,
    atoms: atoms.length,
    frames: 1,
    orbitals: moCount,
    summary: [`${atoms.length} atoms`, `${moCount} MO metadata records`, `Coordinate unit: ${unit}`],
    sample: `Molden geometry imported from ${fileName}\nMO records: ${moCount}\nTrue MO isosurfaces require the advanced viewer.`,
    analysis: { ...createEmptyAnalysisResult(), orbitals: { levels: orbitals, source: "Molden" } }
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
    sample: `Cube geometry imported from ${fileName}\nGrid: ${grid}\nVolumetric values are summarized here; use a dedicated cube viewer for full isosurfaces.`,
    analysis: { ...createEmptyAnalysisResult(), surfaces: [{ type: "cube", grid, fileName }] }
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
  const analysis = extractJsonAnalysis(source);
  if (!atoms.length && !hasAnalysisData(analysis)) throw new Error("JSON did not contain readable geometry.");
  const xyz = atoms.length ? atomsToXYZ(atoms, fileName.replace(/\.json$/i, "")) : "0\nJSON result without geometry";
  const orbitalCount = countJsonOrbitals(source);
  return {
    type: "JSON",
    xyz,
    status: atoms.length ? `Loaded JSON geometry (${atoms.length} atoms${orbitalCount ? `, ${orbitalCount} orbital values` : ""}).` : "Loaded JSON result data.",
    atoms: atoms.length,
    frames: 1,
    orbitals: orbitalCount,
    summary: [atoms.length ? `${atoms.length} atoms` : "No geometry", orbitalCount ? `${orbitalCount} orbital energy entries` : "No orbital arrays detected", "OpenQP JSON data loaded"],
    sample: JSON.stringify({ source: fileName, atoms: atoms.length, orbitals: orbitalCount, modes: analysis.vibrations.modes.length }, null, 2),
    analysis
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
  const textAnalysis = extractTextAnalysis(text);
  if (!frames.length) {
    if (!hasAnalysisData(textAnalysis)) throw new Error("No OpenQP Cartesian coordinate blocks were found.");
    return {
      type: "OpenQP output",
      xyz: "0\nOpenQP result without geometry",
      status: `Loaded result metadata from ${fileName}.`,
      atoms: 0,
      frames: 0,
      orbitals: 0,
      energies: textAnalysis.energy.values.map((row) => row.value),
      summary: ["No coordinate block found", `${textAnalysis.energy.values.length} energy value(s)`, `${textAnalysis.vibrations.modes.length} vibrational mode(s)`],
      sample: `OpenQP output: ${fileName}\nNo readable coordinate block was found; result viewers were populated from text metadata.`,
      analysis: textAnalysis
    };
  }
  const atoms = frames.at(-1);
  const orbitalBlocks = (text.match(/Molecular Orbitals and Energies/g) || []).length;
  const analysis = mergeAnalysis(textAnalysis, { energy: { values: energies.map((value, index) => ({ index: index + 1, label: `Energy ${index + 1}`, value, unit: "hartree" })) } });
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
    ].join("\n"),
    analysis
  };
}

function countJsonOrbitals(source) {
  const candidates = [source.orbital_energies, source.orbitalEnergy, source.mo_energy, source.orbitals?.energies, source.mol_energy, source.energies].filter(Array.isArray);
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
  const params = new URLSearchParams(window.location.search);
  const hasLocalJob = Boolean(params.get("job"));
  state.analysisJobMode = hasLocalJob;
  if (hasLocalJob) state.analysisXYZ = "0\nLoading completed local run";

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
    analysisSample: document.querySelector("#analysisSample"),
    energyViewer: document.querySelector("#energyViewer"),
    orbitalViewer: document.querySelector("#orbitalViewer"),
    vibrationViewer: document.querySelector("#vibrationViewer"),
    nmrViewer: document.querySelector("#nmrViewer"),
    hessianViewer: document.querySelector("#hessianViewer"),
    normalModeControls: document.querySelector("#normalModeControls"),
    normalModeSelect: document.querySelector("#normalModeSelect"),
    modeAmplitude: document.querySelector("#modeAmplitude"),
    modeStatus: document.querySelector("#modeStatus")
  });
  setupMoleculeViewer();
  setupViewerControls();
  setupViewerImport();
  renderAnalysisViewers();
  syncNormalModeControls();
  document.querySelector("#downloadXyz")?.addEventListener("click", () => downloadFile("openqp_loaded_structure.xyz", `${xyzBody()}\n`, "chemical/x-xyz"));
  hydrateLocalRunnerTokenFromHash();
  if (hasLocalJob) {
    setStatusText(dom.viewerDataStatus, "Loading completed local run...", "running");
    updateMoleculeViewer();
    loadLocalRunnerJobFromUrl();
  } else {
    updateMoleculeViewer();
  }
}

function updateAnalysisSummary(parsed) {
  const title = document.querySelector("#analysisTitle");
  const list = document.querySelector("#analysisList");
  const sample = document.querySelector("#analysisSample");
  if (!title || !list || !sample) return;
  title.textContent = parsed.heading || `${parsed.type} loaded`;
  list.replaceChildren(...parsed.summary.map((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    return li;
  }));
  sample.textContent = parsed.sample || parsed.status;
}

function renderAnalysisViewers() {
  const analysis = normalizeAnalysisResult(state.analysisResult || createEmptyAnalysisResult());
  renderEnergyViewer(analysis.energy);
  renderOrbitalViewer(analysis.orbitals);
  renderVibrationViewer(analysis.vibrations);
  renderNmrViewer(analysis.nmr);
  renderHessianViewer(analysis.hessian);
}

function renderEnergyViewer(energy) {
  if (!dom.energyViewer) return;
  const values = energy.values || [];
  if (!values.length) {
    renderEmptyViewer(dom.energyViewer, "No energy trace found. Load an OpenQP log, optimization output, IRC output, or JSON energy history.");
    return;
  }
  dom.energyViewer.replaceChildren(
    metricGrid([
      ["Points", values.length],
      ["First", formatScalar(values[0].value, 8)],
      ["Last", formatScalar(values.at(-1).value, 8)]
    ]),
    lineChart(values.map((row) => row.value), { label: "Energy / PES trace", unit: values[0].unit || "hartree" }),
    tableWrap(["#", "Label", "Energy", "Unit"], values.map((row, index) => [index + 1, row.label || `Point ${index + 1}`, formatScalar(row.value, 10), row.unit || "hartree"]))
  );
}

function renderOrbitalViewer(orbitals) {
  if (!dom.orbitalViewer) return;
  const levels = (orbitals.levels || []).filter((level) => Number.isFinite(level.energy));
  if (!levels.length) {
    renderEmptyViewer(dom.orbitalViewer, "No orbital energies found. Load a Molden file or JSON orbital-energy array.");
    return;
  }
  const occupied = levels.filter((level) => Number(level.occupation) > 0);
  const homo = occupied.at(-1);
  const lumo = levels.find((level) => Number(level.occupation) <= 0 && (!homo || level.index > homo.index));
  const gap = homo && lumo ? (lumo.energy - homo.energy) * 27.211386245988 : null;
  dom.orbitalViewer.replaceChildren(
    metricGrid([
      ["Levels", levels.length],
      ["HOMO", homo ? `${formatScalar(homo.energy, 5)} Ha` : "n/a"],
      ["Gap", Number.isFinite(gap) ? `${formatScalar(gap, 3)} eV` : "n/a"]
    ]),
    lineChart(levels.map((level) => level.energy), { label: "MO energies", unit: "hartree" }),
    tableWrap(["#", "Spin", "Energy (Ha)", "Occ", "Sym"], levels.slice(0, 80).map((level) => [level.index, level.spin || "", formatScalar(level.energy, 7), formatScalar(level.occupation, 2), level.symmetry || ""]))
  );
}

function renderVibrationViewer(vibrations) {
  if (!dom.vibrationViewer) return;
  const modes = vibrations.modes || [];
  if (!modes.length) {
    renderEmptyViewer(dom.vibrationViewer, "No vibrational modes found. Load an OpenQP .hess.json file for IR, Raman, and normal-mode animation.");
    return;
  }
  dom.vibrationViewer.replaceChildren(
    metricGrid([
      ["Modes", modes.length],
      ["Lowest", `${formatScalar(modes[0].frequency, 1)} cm-1`],
      ["Highest", `${formatScalar(modes.at(-1).frequency, 1)} cm-1`]
    ]),
    spectrumChart(modes, "ir", vibrations.units?.ir || "IR"),
    spectrumChart(modes, "raman", vibrations.units?.raman || "Raman"),
    tableWrap(["Mode", "Freq (cm-1)", "IR", "Raman", "Motion"], modes.map((mode, index) => [
      mode.index || index + 1,
      formatScalar(mode.frequency, 2),
      Number.isFinite(mode.ir) ? formatScalar(mode.ir, 3) : "",
      Number.isFinite(mode.raman) ? formatScalar(mode.raman, 3) : "",
      mode.vectors?.length ? "3D" : ""
    ]))
  );
}

function renderNmrViewer(nmr) {
  if (!dom.nmrViewer) return;
  const tensors = nmr.tensors || [];
  if (!tensors.length) {
    renderEmptyViewer(dom.nmrViewer, "No NMR shielding tensors found. Load NMR output or JSON with shielding data.");
    return;
  }
  dom.nmrViewer.replaceChildren(
    metricGrid([
      ["Atoms", tensors.length],
      ["First iso", formatScalar(tensors[0].iso, 3)],
      ["Tensor rows", tensors.filter((row) => row.tensor).length]
    ]),
    tableWrap(["Atom", "Iso", "Anisotropy", "Tensor diag"], tensors.map((row) => [
      `${row.atom}${row.index || ""}`,
      Number.isFinite(row.iso) ? formatScalar(row.iso, 4) : "",
      Number.isFinite(row.anisotropy) ? formatScalar(row.anisotropy, 4) : "",
      row.tensor ? row.tensor.map((line, index) => formatScalar(line[index], 3)).join(", ") : ""
    ]))
  );
}

function renderHessianViewer(hessian) {
  if (!dom.hessianViewer) return;
  if (!hessian?.matrix) {
    renderEmptyViewer(dom.hessianViewer, "No Hessian matrix found. Load an OpenQP Hessian JSON sidecar.");
    return;
  }
  const dimension = hessian.dimension || hessian.matrix.length;
  const preview = hessian.matrix.slice(0, 8).map((row) => row.slice(0, 8));
  dom.hessianViewer.replaceChildren(
    metricGrid([
      ["Dimension", `${dimension} x ${dimension}`],
      ["Max |H|", formatScalar(hessian.maxAbs, 5)],
      ["Trace", formatScalar(hessian.trace, 5)]
    ]),
    tableWrap(["", ...preview.map((_, index) => index + 1)], preview.map((row, index) => [index + 1, ...row.map((value) => formatScalar(value, 4))])),
    textBlock(JSON.stringify(hessian.metadata || {}, null, 2) || "{}")
  );
}

function syncNormalModeControls() {
  const modes = state.analysisResult?.vibrations?.modes || [];
  if (!dom.normalModeControls || !dom.normalModeSelect) return;
  const animatedModes = modes.filter((mode) => mode.vectors?.length);
  dom.normalModeControls.hidden = animatedModes.length === 0;
  dom.normalModeSelect.replaceChildren(
    ...animatedModes.map((mode, index) => {
      const option = document.createElement("option");
      option.value = String(modes.indexOf(mode));
      option.textContent = `Mode ${mode.index || index + 1} - ${formatScalar(mode.frequency, 1)} cm-1`;
      return option;
    })
  );
  if (animatedModes.length) {
    dom.normalModeSelect.value = dom.normalModeSelect.options[0]?.value || "0";
  }
  viewerState.modePhase = 0;
  updateModeStatus();
  forceViewerRefresh();
}

function updateModeStatus() {
  if (!dom.modeStatus) return;
  const mode = activeNormalMode();
  dom.modeStatus.textContent = mode
    ? `Animating mode ${mode.index}: ${formatScalar(mode.frequency, 2)} cm-1.`
    : "Load a Hessian sidecar to animate normal modes.";
}

function renderEmptyViewer(target, text) {
  target.replaceChildren(element("p", { className: "viewer-empty", text }));
}

function metricGrid(items) {
  const grid = element("div", { className: "analysis-metric-grid" });
  grid.replaceChildren(...items.map(([label, value]) => {
    const item = element("div", { className: "analysis-metric" });
    item.replaceChildren(element("span", { text: label }), element("strong", { text: String(value) }));
    return item;
  }));
  return grid;
}

function lineChart(values, options = {}) {
  const finite = values.map(Number).filter(Number.isFinite);
  if (!finite.length) return element("p", { className: "viewer-empty", text: "No numeric values to plot." });
  const width = 640;
  const height = 190;
  const pad = 28;
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const span = max - min || 1;
  const points = finite.map((value, index) => {
    const x = pad + (finite.length === 1 ? 0.5 : index / (finite.length - 1)) * (width - pad * 2);
    const y = height - pad - ((value - min) / span) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const wrapper = element("div", { className: "mini-chart" });
  wrapper.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(options.label || "Line chart")}">
    <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="#cbd9d6" />
    <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height - pad}" stroke="#cbd9d6" />
    <polyline fill="none" stroke="#155f8e" stroke-width="3" points="${points}" />
    ${points.split(" ").map((point) => {
      const [x, y] = point.split(",");
      return `<circle cx="${x}" cy="${y}" r="3.5" fill="#008277" />`;
    }).join("")}
    <text x="${pad}" y="18" fill="#607080" font-size="13">${escapeHtml(options.unit || "")}</text>
    <text x="${width - pad}" y="${height - 8}" fill="#607080" text-anchor="end" font-size="12">${finite.length} point${finite.length === 1 ? "" : "s"}</text>
  </svg>`;
  return wrapper;
}

function spectrumChart(modes, key, label) {
  const values = modes.map((mode) => ({ x: Number(mode.frequency), y: Number(mode[key]) })).filter((row) => Number.isFinite(row.x) && Number.isFinite(row.y));
  if (!values.length) return element("p", { className: "viewer-empty", text: `${key.toUpperCase()} intensities were not found.` });
  const width = 720;
  const height = 190;
  const pad = 30;
  const minX = Math.min(...values.map((row) => row.x));
  const maxX = Math.max(...values.map((row) => row.x));
  const maxY = Math.max(...values.map((row) => Math.abs(row.y)), 1);
  const spanX = maxX - minX || 1;
  const wrapper = element("div", { className: "spectrum-chart" });
  wrapper.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(label)} spectrum">
    <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="#cbd9d6" />
    ${values.map((row) => {
      const x = pad + ((row.x - minX) / spanX) * (width - pad * 2);
      const y = height - pad - (Math.abs(row.y) / maxY) * (height - pad * 2);
      return `<line x1="${x.toFixed(1)}" y1="${height - pad}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${key === "raman" ? "#b8822f" : "#008277"}" stroke-width="4" />`;
    }).join("")}
    <text x="${pad}" y="18" fill="#607080" font-size="13">${escapeHtml(label)}</text>
    <text x="${width - pad}" y="${height - 8}" fill="#607080" text-anchor="end" font-size="12">cm-1</text>
  </svg>`;
  return wrapper;
}

function tableWrap(headers, rows) {
  const wrap = element("div", { className: "analysis-table-wrap" });
  const table = element("table", { className: "analysis-table" });
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.replaceChildren(...headers.map((header) => element("th", { text: String(header) })));
  thead.append(headRow);
  const tbody = document.createElement("tbody");
  tbody.replaceChildren(...rows.map((row) => {
    const tr = document.createElement("tr");
    tr.replaceChildren(...row.map((cell) => element("td", { text: String(cell ?? "") })));
    return tr;
  }));
  table.replaceChildren(thead, tbody);
  wrap.append(table);
  return wrap;
}

function textBlock(text) {
  const pre = document.createElement("pre");
  pre.textContent = text;
  return pre;
}

function element(tag, options = {}) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  return node;
}

function formatScalar(value, digits = 4) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "n/a";
  if (Math.abs(number) >= 10000 || (Math.abs(number) > 0 && Math.abs(number) < 0.001)) return number.toExponential(Math.max(1, digits - 1));
  return number.toFixed(digits).replace(/\.?0+$/, "");
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function hydrateLocalRunnerTokenFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return;
  const params = new URLSearchParams(hash);
  const token = params.get("token");
  if (!token) return;
  try {
    sessionStorage.setItem(LOCAL_RUNNER_TOKEN_KEY, token);
  } catch (error) {
    // The analysis page can still try the request if storage is unavailable.
  }
  window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
}

async function loadLocalRunnerJobFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("job");
  if (!jobId) return;
  setStatusText(dom.viewerDataStatus, "Loading completed local run...", "running");
  try {
    const job = await localRunnerRequest(`/jobs/${encodeURIComponent(jobId)}`);
    const outputName = fileNameFromPath(job.output) || `${job.name || "openqp_job"}.out`;
    const xyzName = fileNameFromPath(job.xyz) || `${job.name || "openqp_job"}.xyz`;
    const logText = job.log || "";
    const candidates = [
      ...localRunnerArtifacts(job).map((artifact) => ({
        name: artifact.name || fileNameFromPath(artifact.path) || "openqp-result.json",
        text: artifact.text || "",
        label: artifact.name || fileNameFromPath(artifact.path) || "result artifact"
      })),
      { name: outputName, text: logText, label: outputName }
    ].filter((candidate) => candidate.text.trim());
    let resultParsed = null;
    let resultText = "";
    let resultLabel = "";
    for (const candidate of candidates) {
      try {
        const candidateParsed = parseViewerData(candidate.text, candidate.name);
        if (!resultParsed || parsedHasMoleculeGeometry(candidateParsed) || hasAnalysisData(candidateParsed.analysis)) {
          resultParsed = candidateParsed;
          resultText = candidate.text;
          resultLabel = candidate.label;
        }
        if (parsedHasMoleculeGeometry(candidateParsed) && hasAnalysisData(candidateParsed.analysis)) break;
      } catch (error) {
        // Keep trying lower-priority local-run artifacts.
      }
    }

    let geometryParsed = parsedHasMoleculeGeometry(resultParsed) ? resultParsed : null;
    if (!geometryParsed && job.xyzText) {
      geometryParsed = parseViewerData(job.xyzText, xyzName);
    }
    if (!resultParsed && geometryParsed) {
      resultParsed = geometryParsed;
      resultText = job.xyzText || "";
      resultLabel = xyzName;
    }
    if (!resultParsed) throw new Error("The completed local run did not include readable log, JSON, or XYZ data.");

    const parsed = geometryParsed && resultParsed !== geometryParsed
      ? mergeLocalRunnerResultWithGeometry(resultParsed, geometryParsed, resultLabel)
      : resultParsed;
    if (dom.viewerDataInput) dom.viewerDataInput.value = resultText || logText || job.xyzText || "";
    state.analysisXYZ = parsed.xyz;
    lastMoleculeSignature = "";
    parsed.status = `Loaded local run ${job.name || job.id}.`;
    parsed.summary = [
      `Run status: ${job.status || "unknown"}`,
      job.output ? `Output: ${job.output}` : `Job: ${job.id}`,
      ...parsed.summary
    ];
    setStatusText(dom.viewerDataStatus, parsed.status, "ok");
    applyParsedAnalysis(parsed);
    updateAnalysisSummary(parsed);
    updateMoleculeViewer();
  } catch (error) {
    const message = error.message || "Could not load the completed local run.";
    state.analysisXYZ = "0\nLocal run geometry unavailable";
    lastMoleculeSignature = "";
    setStatusText(dom.viewerDataStatus, message, "error");
    updateAnalysisSummary({
      heading: "Local run could not be loaded",
      type: "Local run",
      summary: [
        "Could not load the completed job geometry.",
        "Check that the local runner is still open and the pairing code is valid.",
        "If the runner was started before the latest update, restart it from setup."
      ],
      sample: message,
      status: message
    });
    updateMoleculeViewer();
  }
}

function localRunnerArtifacts(job) {
  return (Array.isArray(job.artifacts) ? job.artifacts : [])
    .filter((artifact) => artifact && typeof artifact.text === "string" && artifact.text.trim() && !artifact.truncated)
    .sort((a, b) => localRunnerArtifactRank(a) - localRunnerArtifactRank(b));
}

function localRunnerArtifactRank(artifact) {
  const name = String(artifact.name || artifact.path || "").toLowerCase();
  if (name.endsWith(".hess.json") || (name.includes("hess") && name.endsWith(".json"))) return 0;
  if (name.endsWith(".json")) return 1;
  if (name.endsWith(".molden") || name.endsWith(".mol")) return 2;
  if (name.endsWith(".cube") || name.endsWith(".cub")) return 3;
  if (name.endsWith(".xyz")) return 4;
  return 9;
}

function parsedHasMoleculeGeometry(parsed) {
  return Number(parsed?.atoms || 0) > 0 && parseXYZ(parsed.xyz || "").length > 0;
}

function mergeLocalRunnerResultWithGeometry(resultParsed, geometryParsed, resultLabel) {
  const summary = [];
  const addSummary = (item) => {
    if (item && !summary.includes(item)) summary.push(item);
  };
  (resultParsed.summary || []).forEach(addSummary);
  addSummary(`Results loaded from ${resultLabel || "local run output"}.`);
  addSummary("Molecule geometry loaded from the local-run XYZ file.");
  (geometryParsed.summary || []).forEach(addSummary);
  return {
    ...geometryParsed,
    type: resultParsed.type || geometryParsed.type,
    heading: resultParsed.heading || `${resultParsed.type || "Local run"} loaded`,
    orbitals: resultParsed.orbitals || geometryParsed.orbitals,
    energies: resultParsed.energies || geometryParsed.energies,
    summary,
    sample: [
      resultParsed.sample,
      "",
      "Geometry was loaded from the local-run XYZ file so the molecule viewer can render the completed job.",
      geometryParsed.sample
    ].filter(Boolean).join("\n"),
    analysis: mergeAnalysis(resultParsed.analysis, geometryParsed.analysis)
  };
}

function fileNameFromPath(path) {
  return String(path || "").split(/[\\/]/).filter(Boolean).at(-1) || "";
}

init();
