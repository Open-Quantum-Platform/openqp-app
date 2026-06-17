#!/usr/bin/env python3
"""Install OpenQP for the OpenQP Web local runner.

This script installs build prerequisites when it can, clones the official
OpenQP source repository, builds the Python package in a local virtual
environment, and places a small launcher in ~/.local/bin/openqp.
"""

from __future__ import annotations

import argparse
import os
import platform
import shlex
import shutil
import stat
import subprocess
import sys
from pathlib import Path


REPO_URL = "https://github.com/Open-Quantum-Platform/openqp.git"
ROOT = Path.home() / ".openqp-local"
SOURCE_DIR = ROOT / "openqp-source"
VENV_DIR = ROOT / "venv"
LAUNCHER = Path.home() / ".local" / "bin" / "openqp"


class SetupError(RuntimeError):
    pass


def display_path(path: Path) -> str:
    try:
        return str(path.relative_to(Path.home()))
    except ValueError:
        return str(path)


def run(command: list[str], *, cwd: Path | None = None, dry_run: bool = False) -> None:
    prefix = f"cd {shlex.quote(str(cwd))} && " if cwd else ""
    print(f"$ {prefix}{shlex.join(command)}", flush=True)
    if dry_run:
        return
    subprocess.run(command, cwd=str(cwd) if cwd else None, check=True)


def find_brew() -> str | None:
    return (
        shutil.which("brew")
        or ("/opt/homebrew/bin/brew" if Path("/opt/homebrew/bin/brew").exists() else None)
        or ("/usr/local/bin/brew" if Path("/usr/local/bin/brew").exists() else None)
    )


def install_prerequisites(*, dry_run: bool) -> None:
    system = platform.system().lower()
    if system == "darwin":
        brew = find_brew()
        if not brew:
            raise SetupError(
                "Homebrew is required to install compilers on macOS. "
                "Install it from https://brew.sh, then run this installer again."
            )
        run([brew, "install", "git", "cmake", "ninja", "gcc"], dry_run=dry_run)
        return

    if system == "linux":
        if shutil.which("apt-get"):
            run(["sudo", "apt-get", "update"], dry_run=dry_run)
            run(
                [
                    "sudo",
                    "apt-get",
                    "install",
                    "-y",
                    "git",
                    "cmake",
                    "ninja-build",
                    "gcc",
                    "g++",
                    "gfortran",
                    "python3-dev",
                    "python3-pip",
                    "python3-venv",
                ],
                dry_run=dry_run,
            )
            return
        if shutil.which("dnf"):
            run(
                [
                    "sudo",
                    "dnf",
                    "install",
                    "-y",
                    "git",
                    "cmake",
                    "ninja-build",
                    "gcc",
                    "gcc-c++",
                    "gcc-gfortran",
                    "python3-devel",
                    "python3-pip",
                    "python3-virtualenv",
                ],
                dry_run=dry_run,
            )
            return
        raise SetupError(
            "This Linux distribution was not recognized. Install git, cmake, ninja, "
            "gcc, g++, gfortran, python3-dev, python3-pip, and python3-venv, "
            "then run this installer again with --skip-prereqs."
        )

    raise SetupError(
        "Native Windows installation is not automated here. Use WSL/Linux for OpenQP, "
        "or install OpenQP manually and start the runner with --openqp /path/to/openqp."
    )


def ensure_source(*, dry_run: bool) -> None:
    if (SOURCE_DIR / ".git").exists():
        run(["git", "pull", "--ff-only"], cwd=SOURCE_DIR, dry_run=dry_run)
        return
    if not dry_run:
        SOURCE_DIR.parent.mkdir(parents=True, exist_ok=True)
    run(["git", "clone", "--depth", "1", REPO_URL, str(SOURCE_DIR)], dry_run=dry_run)


def venv_python() -> Path:
    if os.name == "nt":
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python"


def venv_openqp() -> Path:
    if os.name == "nt":
        return VENV_DIR / "Scripts" / "openqp.exe"
    return VENV_DIR / "bin" / "openqp"


def ensure_venv(*, dry_run: bool) -> Path:
    python = venv_python()
    if not python.exists():
        run([sys.executable, "-m", "venv", str(VENV_DIR)], dry_run=dry_run)
    return python


def write_launcher(openqp_bin: Path, *, dry_run: bool) -> None:
    script = f"#!/usr/bin/env bash\nexec {shlex.quote(str(openqp_bin))} \"$@\"\n"
    print(f"Writing launcher: {LAUNCHER}")
    if dry_run:
        return
    LAUNCHER.parent.mkdir(parents=True, exist_ok=True)
    LAUNCHER.write_text(script, encoding="utf-8")
    current = LAUNCHER.stat().st_mode
    LAUNCHER.chmod(current | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)


def main() -> int:
    parser = argparse.ArgumentParser(description="Install OpenQP for local OpenQP Web runs.")
    parser.add_argument("--force", action="store_true", help="reinstall even if openqp is already available")
    parser.add_argument("--skip-prereqs", action="store_true", help="skip Homebrew/apt/dnf prerequisite installation")
    parser.add_argument("--dry-run", action="store_true", help="print the commands without running them")
    args = parser.parse_args()

    existing = shutil.which("openqp")
    local_existing = venv_openqp()
    if not args.force and (existing or local_existing.exists()):
        found = existing or str(local_existing)
        print(f"OpenQP already appears to be installed: {found}")
        print("Start the local runner with:")
        print("python3 ~/Downloads/openqp-local-runner.py")
        return 0

    print("OpenQP local setup")
    print(f"Install folder: {ROOT}")
    print("Source: official OpenQP repository")

    try:
        if not args.skip_prereqs:
            install_prerequisites(dry_run=args.dry_run)
        ensure_source(dry_run=args.dry_run)
        python = ensure_venv(dry_run=args.dry_run)
        run([str(python), "-m", "pip", "install", "--upgrade", "pip", "setuptools", "wheel", "cffi"], dry_run=args.dry_run)
        run([str(python), "-m", "pip", "install", "."], cwd=SOURCE_DIR, dry_run=args.dry_run)
        write_launcher(venv_openqp(), dry_run=args.dry_run)
    except subprocess.CalledProcessError as exc:
        print(f"\nA setup command failed with exit code {exc.returncode}.")
        return exc.returncode or 1
    except SetupError as exc:
        print(f"\n{exc}")
        return 2

    if args.dry_run:
        print("\nDry run finished. No files were installed.")
    else:
        print("\nOpenQP installation finished.")
    print(f"OpenQP command: {venv_openqp()}")
    print("The local runner will detect this installation automatically.")
    print("Start the runner with:")
    print("python3 ~/Downloads/openqp-local-runner.py")
    print(f"Run folder: {display_path(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
