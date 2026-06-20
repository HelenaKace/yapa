import { rmSync } from "node:fs";
import { spawn } from "node:child_process";

rmSync(".next", { recursive: true, force: true });

process.env.WATCHPACK_POLLING = process.env.WATCHPACK_POLLING || "true";
process.env.CHOKIDAR_USEPOLLING = process.env.CHOKIDAR_USEPOLLING || "true";

const next = spawn("next", ["dev", "-p", process.env.PORT || "3000"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

next.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
