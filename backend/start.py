"""
MaVionix creative backend orchestrator.

Starts each product API on its own port, plus a small gateway health server.

Usage (from project root):
  python backend/start.py
  npm run backend
"""

from __future__ import annotations

import json
import os
import signal
import subprocess
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = Path(__file__).resolve().parent / "services.json"


def load_config() -> dict:
    with CONFIG_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def resolve_python(service_cwd: Path) -> Path:
    """Prefer each service's own venv interpreter."""
    candidates = [
        service_cwd / "venv" / "Scripts" / "python.exe",
        service_cwd / "venv" / "bin" / "python",
    ]
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return Path(sys.executable)


def start_service(service: dict) -> subprocess.Popen:
    cwd = ROOT / service["cwd"]
    if not cwd.is_dir():
        raise FileNotFoundError(f"Service cwd missing: {cwd}")

    python = resolve_python(cwd)
    port = int(service["port"])
    module = service["module"]
    env_file = cwd / service.get("env_file", ".env")

    cmd = [
        str(python),
        "-m",
        "uvicorn",
        module,
        "--host",
        "127.0.0.1",
        "--port",
        str(port),
        "--reload",
    ]
    if env_file.is_file():
        cmd.extend(["--env-file", str(env_file)])

    env = os.environ.copy()
    env.setdefault("PYTHONUNBUFFERED", "1")

    print(f"[backend] starting {service['name']} on :{port}")
    print(f"          cwd={cwd}")
    print(f"          python={python}")

    return subprocess.Popen(
        cmd,
        cwd=str(cwd),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )


def pipe_output(prefix: str, proc: subprocess.Popen) -> None:
    assert proc.stdout is not None
    for line in proc.stdout:
        sys.stdout.write(f"[{prefix}] {line}")
        sys.stdout.flush()


def check_health(url: str, timeout: float = 1.5) -> dict:
    try:
        with urlopen(url, timeout=timeout) as response:
            body = response.read().decode("utf-8", errors="replace")
            try:
                payload = json.loads(body)
            except json.JSONDecodeError:
                payload = {"raw": body}
            return {"ok": response.status == 200, "status": response.status, "body": payload}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": str(exc)}


def make_gateway(config: dict) -> ThreadingHTTPServer:
    services = config["services"]

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, fmt: str, *args) -> None:  # quieter
            return

        def do_GET(self) -> None:  # noqa: N802
            if self.path in ("/", "/health", "/api/health"):
                payload = {
                    "status": "ok",
                    "gateway": "mavionix-backend",
                    "services": {
                        s["id"]: {
                            "name": s["name"],
                            "port": s["port"],
                            "health_url": s["health"],
                            **check_health(s["health"]),
                        }
                        for s in services
                    },
                }
                data = json.dumps(payload, indent=2).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return

            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'{"error":"not found"}')

    port = int(config.get("gateway_port", 8080))
    return ThreadingHTTPServer(("127.0.0.1", port), Handler)


def main() -> int:
    config = load_config()
    processes: list[tuple[dict, subprocess.Popen]] = []
    stop = threading.Event()

    def shutdown(*_args) -> None:
        if stop.is_set():
            return
        stop.set()
        print("\n[backend] shutting down services...")
        for service, proc in reversed(processes):
            if proc.poll() is None:
                print(f"[backend] stopping {service['id']} (pid {proc.pid})")
                proc.terminate()
        deadline = time.time() + 8
        for _, proc in processes:
            remaining = max(0.1, deadline - time.time())
            try:
                proc.wait(timeout=remaining)
            except subprocess.TimeoutExpired:
                proc.kill()

    signal.signal(signal.SIGINT, shutdown)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, shutdown)

    try:
        for service in config["services"]:
            proc = start_service(service)
            processes.append((service, proc))
            thread = threading.Thread(
                target=pipe_output,
                args=(service["id"], proc),
                daemon=True,
            )
            thread.start()
    except Exception as exc:  # noqa: BLE001
        print(f"[backend] failed to start: {exc}", file=sys.stderr)
        shutdown()
        return 1

    gateway = make_gateway(config)
    gateway_port = int(config.get("gateway_port", 8080))
    gateway_thread = threading.Thread(target=gateway.serve_forever, daemon=True)
    gateway_thread.start()

    print()
    print("[backend] all services launching")
    for service in config["services"]:
        print(f"  - {service['id']}: http://127.0.0.1:{service['port']}  ({service['name']})")
    print(f"  - gateway health: http://127.0.0.1:{gateway_port}/health")
    print("[backend] Ctrl+C to stop everything")
    print()

    try:
        while not stop.is_set():
            for service, proc in processes:
                code = proc.poll()
                if code is not None:
                    print(f"[backend] {service['id']} exited with code {code}")
                    shutdown()
                    return code or 1
            time.sleep(0.4)
    finally:
        gateway.shutdown()
        shutdown()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
