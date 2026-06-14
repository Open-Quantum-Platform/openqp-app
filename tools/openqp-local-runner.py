#!/usr/bin/env python3
"""Local OpenQP runner for app.openqp.org.

This helper listens only on 127.0.0.1 by default. It accepts generated OpenQP
input from the browser, writes files into a local work folder, and runs a fixed
`openqp input.inp` command without invoking a shell.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import secrets
import shutil
import signal
import subprocess
import sys
import threading
import time
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse
from urllib.request import Request, urlopen


VERSION = "0.1.0"
DEFAULT_PORT = 17651
DEFAULT_ORIGINS = (
    "https://app.openqp.org",
    "http://127.0.0.1:17651",
    "http://localhost:17651",
    "http://127.0.0.1:4174",
    "http://localhost:4174",
)
REMOTE_APP_ORIGIN = "https://app.openqp.org"


def safe_job_name(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_.-]+", "_", (value or "").strip())
    return cleaned[:64].strip("._-") or "openqp_job"


def count_xyz_atoms(xyz: str) -> int:
    lines = [line.strip() for line in (xyz or "").splitlines() if line.strip()]
    if not lines:
        return 0
    if re.fullmatch(r"\d+", lines[0]):
        return int(lines[0])
    return sum(1 for line in lines if re.match(r"^[A-Za-z]{1,2}\s+[-+0-9.]", line))


def read_tail(path: Path, limit: int = 24000) -> str:
    if not path.exists():
        return ""
    with path.open("rb") as handle:
        handle.seek(0, os.SEEK_END)
        size = handle.tell()
        handle.seek(max(0, size - limit), os.SEEK_SET)
        return handle.read().decode("utf-8", errors="replace")


class RunnerState:
    def __init__(
        self,
        *,
        token: str,
        openqp_bin: str,
        work_dir: Path,
        allowed_origins: set[str],
        timeout_seconds: int,
        max_input_bytes: int,
        max_atoms: int,
    ) -> None:
        self.token = token
        self.openqp_bin = openqp_bin
        self.work_dir = work_dir
        self.allowed_origins = allowed_origins
        self.timeout_seconds = timeout_seconds
        self.max_input_bytes = max_input_bytes
        self.max_atoms = max_atoms
        self.jobs: dict[str, dict[str, Any]] = {}
        self.lock = threading.RLock()
        self.work_dir.mkdir(parents=True, exist_ok=True)

    def openqp_path(self) -> str | None:
        configured = Path(self.openqp_bin).expanduser()
        if configured.is_absolute() or os.sep in self.openqp_bin:
            return str(configured) if configured.exists() else None
        return shutil.which(self.openqp_bin)

    def active_job_id(self) -> str | None:
        with self.lock:
            for job_id, job in self.jobs.items():
                if job.get("status") == "running":
                    return job_id
        return None

    def start_job(self, payload: dict[str, Any]) -> dict[str, Any]:
        input_text = str(payload.get("input") or "")
        xyz_text = str(payload.get("xyz") or "")
        job_name = safe_job_name(str(payload.get("jobName") or "openqp_job"))
        timeout = int(payload.get("timeoutSeconds") or self.timeout_seconds)
        timeout = max(1, min(timeout, self.timeout_seconds))

        if not input_text.strip():
            raise ValueError("OpenQP input is empty.")
        if not xyz_text.strip():
            raise ValueError("XYZ coordinates are empty.")
        if len(input_text.encode("utf-8")) + len(xyz_text.encode("utf-8")) > self.max_input_bytes:
            raise ValueError(f"Input is larger than {self.max_input_bytes} bytes.")
        atoms = count_xyz_atoms(xyz_text)
        if atoms <= 0:
            raise ValueError("XYZ coordinates do not contain atoms.")
        if atoms > self.max_atoms:
            raise ValueError(f"This local runner is limited to {self.max_atoms} atoms.")
        if not self.openqp_path():
            raise ValueError("The openqp command was not found. Start the runner with --openqp /path/to/openqp.")

        with self.lock:
            active = self.active_job_id()
            if active:
                raise ValueError(f"Job {active} is already running.")

            job_id = f"{time.strftime('%Y%m%d-%H%M%S')}-{secrets.token_hex(4)}-{job_name}"
            job_dir = self.work_dir / job_id
            job_dir.mkdir(parents=True, exist_ok=False)
            input_path = job_dir / f"{job_name}.inp"
            xyz_path = job_dir / f"{job_name}.xyz"
            output_path = job_dir / f"{job_name}.out"
            input_path.write_text(input_text, encoding="utf-8")
            xyz_path.write_text(xyz_text if xyz_text.endswith("\n") else f"{xyz_text}\n", encoding="utf-8")
            job = {
                "id": job_id,
                "name": job_name,
                "status": "queued",
                "createdAt": time.time(),
                "startedAt": None,
                "finishedAt": None,
                "returnCode": None,
                "directory": str(job_dir),
                "input": str(input_path),
                "xyz": str(xyz_path),
                "output": str(output_path),
                "process": None,
                "error": None,
                "timeoutSeconds": timeout,
                "atoms": atoms,
            }
            self.jobs[job_id] = job

        thread = threading.Thread(target=self._run_job, args=(job_id,), daemon=True)
        thread.start()
        return self.public_job(job_id)

    def _run_job(self, job_id: str) -> None:
        with self.lock:
            job = self.jobs[job_id]
            job["status"] = "running"
            job["startedAt"] = time.time()

        output_path = Path(job["output"])
        job_dir = Path(job["directory"])
        input_name = Path(job["input"]).name
        env = os.environ.copy()
        env.setdefault("OMP_NUM_THREADS", "1")
        env.setdefault("OPENBLAS_NUM_THREADS", "1")
        env.setdefault("MKL_NUM_THREADS", "1")

        try:
            with output_path.open("w", encoding="utf-8", errors="replace") as output:
                output.write(f"OpenQP Local Runner {VERSION}\n")
                output.write(f"Working directory: {job_dir}\n")
                output.write(f"Command: {self.openqp_bin} {input_name}\n\n")
                output.flush()
                process = subprocess.Popen(
                    [self.openqp_bin, input_name],
                    cwd=str(job_dir),
                    stdout=output,
                    stderr=subprocess.STDOUT,
                    env=env,
                    text=True,
                )
                with self.lock:
                    self.jobs[job_id]["process"] = process
                try:
                    return_code = process.wait(timeout=int(job["timeoutSeconds"]))
                    with self.lock:
                        job = self.jobs[job_id]
                        if job["status"] == "canceling":
                            job["status"] = "canceled"
                        else:
                            job["status"] = "complete" if return_code == 0 else "failed"
                        job["returnCode"] = return_code
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
                    output.write("\nOpenQP run timed out and was stopped.\n")
                    with self.lock:
                        job = self.jobs[job_id]
                        job["status"] = "timed_out"
                        job["returnCode"] = process.returncode
        except Exception as exc:  # noqa: BLE001 - local helper should report all run failures.
            with self.lock:
                job = self.jobs[job_id]
                job["status"] = "failed"
                job["error"] = str(exc)
        finally:
            with self.lock:
                job = self.jobs[job_id]
                job["finishedAt"] = time.time()
                job["process"] = None

    def cancel_job(self, job_id: str) -> dict[str, Any]:
        with self.lock:
            job = self.jobs.get(job_id)
            if not job:
                raise KeyError(job_id)
            process = job.get("process")
            if job.get("status") != "running" or process is None:
                return self.public_job(job_id)
            job["status"] = "canceling"
        try:
            if os.name == "posix":
                process.send_signal(signal.SIGTERM)
            else:
                process.terminate()
        except Exception:
            process.kill()
        return self.public_job(job_id)

    def public_job(self, job_id: str) -> dict[str, Any]:
        with self.lock:
            job = self.jobs.get(job_id)
            if not job:
                raise KeyError(job_id)
            public = {key: value for key, value in job.items() if key != "process"}
        public["log"] = read_tail(Path(public["output"]))
        return public


class RequestHandler(BaseHTTPRequestHandler):
    server_version = "OpenQPLocalRunner/0.1"

    @property
    def state(self) -> RunnerState:
        return self.server.state  # type: ignore[attr-defined]

    def log_message(self, fmt: str, *args: Any) -> None:
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))

    def allowed_origin(self) -> str | None:
        origin = self.headers.get("Origin")
        if not origin:
            return None
        return origin if origin in self.state.allowed_origins else ""

    def add_cors_headers(self) -> None:
        origin = self.allowed_origin()
        if origin:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-OpenQP-Runner-Token")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Access-Control-Max-Age", "600")
        self.send_header("Cache-Control", "no-store")

    def reject_bad_origin(self) -> bool:
        if self.allowed_origin() == "":
            self.send_json({"error": "Origin is not allowed."}, HTTPStatus.FORBIDDEN)
            return True
        return False

    def require_token(self) -> bool:
        if self.headers.get("X-OpenQP-Runner-Token") != self.state.token:
            self.send_json({"error": "Invalid or missing local runner pairing code."}, HTTPStatus.UNAUTHORIZED)
            return False
        return True

    def send_json(self, payload: dict[str, Any], status: HTTPStatus = HTTPStatus.OK) -> None:
        encoded = json.dumps(payload, indent=2, sort_keys=True).encode("utf-8")
        self.send_response(status)
        self.add_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def send_bytes(self, content: bytes, content_type: str, status: HTTPStatus = HTTPStatus.OK) -> None:
        self.send_response(status)
        self.add_cors_headers()
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def proxy_app_asset(self, path: str) -> bool:
        if path == "/":
            path = "/workflow.html"
        allowed = (
            path in {"/index.html", "/workflow.html", "/analysis.html", "/README.md"}
            or path.startswith("/assets/")
            or path.startswith("/vendor/")
        )
        if not allowed:
            return False
        target = f"{REMOTE_APP_ORIGIN}{path}"
        try:
            request = Request(target, headers={"User-Agent": f"OpenQPLocalRunner/{VERSION}"})
            with urlopen(request, timeout=10) as response:
                content = response.read()
                content_type = response.headers.get_content_type()
                charset = response.headers.get_content_charset()
                if charset:
                    content_type = f"{content_type}; charset={charset}"
                self.send_bytes(content, content_type)
        except Exception as exc:  # noqa: BLE001 - local helper should report proxy failures.
            self.send_json({"error": f"Could not load app asset: {exc}"}, HTTPStatus.BAD_GATEWAY)
        return True

    def read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length") or "0")
        if length <= 0:
            return {}
        if length > self.state.max_input_bytes + 4096:
            raise ValueError("Request body is too large.")
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    def do_OPTIONS(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler API.
        if self.reject_bad_origin():
            return
        self.send_response(HTTPStatus.NO_CONTENT)
        self.add_cors_headers()
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler API.
        if self.reject_bad_origin():
            return
        path = urlparse(self.path).path
        if path == "/health":
            self.send_json(
                {
                    "ok": True,
                    "runner": "OpenQP Local Runner",
                    "version": VERSION,
                    "tokenRequired": True,
                    "openqp": {
                        "configured": self.state.openqp_bin,
                        "path": self.state.openqp_path(),
                        "available": bool(self.state.openqp_path()),
                    },
                    "activeJob": self.state.active_job_id(),
                    "workDir": str(self.state.work_dir),
                    "maxAtoms": self.state.max_atoms,
                    "timeoutSeconds": self.state.timeout_seconds,
                }
            )
            return
        if path == "/tools/openqp-local-runner.py":
            self.send_bytes(Path(__file__).read_bytes(), "text/x-python; charset=utf-8")
            return
        if path.startswith("/jobs/"):
            if not self.require_token():
                return
            job_id = path.split("/", 2)[2]
            try:
                self.send_json(self.state.public_job(job_id))
            except KeyError:
                self.send_json({"error": "Job was not found."}, HTTPStatus.NOT_FOUND)
            return
        if self.proxy_app_asset(path):
            return
        self.send_json({"error": "Not found."}, HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler API.
        if self.reject_bad_origin():
            return
        path = urlparse(self.path).path
        if not self.require_token():
            return
        try:
            if path == "/jobs":
                self.send_json(self.state.start_job(self.read_json()), HTTPStatus.ACCEPTED)
                return
            if path.startswith("/jobs/") and path.endswith("/cancel"):
                job_id = path.split("/")[2]
                self.send_json(self.state.cancel_job(job_id))
                return
            self.send_json({"error": "Not found."}, HTTPStatus.NOT_FOUND)
        except ValueError as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except KeyError:
            self.send_json({"error": "Job was not found."}, HTTPStatus.NOT_FOUND)
        except json.JSONDecodeError:
            self.send_json({"error": "Request body is not valid JSON."}, HTTPStatus.BAD_REQUEST)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Local OpenQP runner for app.openqp.org")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--openqp", default=os.environ.get("OPENQP_BIN") or "openqp")
    parser.add_argument("--work-dir", default=str(Path.home() / "OpenQP Local Runs"))
    parser.add_argument("--origin", action="append", default=list(DEFAULT_ORIGINS))
    parser.add_argument("--token", default=os.environ.get("OPENQP_RUNNER_TOKEN"))
    parser.add_argument("--timeout-seconds", type=int, default=900)
    parser.add_argument("--max-input-bytes", type=int, default=65536)
    parser.add_argument("--max-atoms", type=int, default=80)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.host not in {"127.0.0.1", "localhost", "::1"}:
        print("Refusing to listen on a non-loopback host.", file=sys.stderr)
        return 2
    token = args.token or secrets.token_urlsafe(9)
    state = RunnerState(
        token=token,
        openqp_bin=args.openqp,
        work_dir=Path(args.work_dir).expanduser().resolve(),
        allowed_origins=set(args.origin or DEFAULT_ORIGINS),
        timeout_seconds=max(1, int(args.timeout_seconds)),
        max_input_bytes=max(4096, int(args.max_input_bytes)),
        max_atoms=max(1, int(args.max_atoms)),
    )
    server = ThreadingHTTPServer((args.host, args.port), RequestHandler)
    server.state = state  # type: ignore[attr-defined]

    print("OpenQP Local Runner")
    print(f"Listening: http://{args.host}:{args.port}")
    print(f"Pairing code: {token}")
    print(f"OpenQP command: {args.openqp}")
    print(f"Work folder: {state.work_dir}")
    print(f"Local mode: http://{args.host}:{args.port}/workflow.html")
    print("Keep this window open while running jobs from app.openqp.org.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping local runner.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
