import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const bridgeDir = join(dirname(fileURLToPath(import.meta.url)), "..", "bridge");

execSync("npm install", { cwd: bridgeDir, stdio: "inherit" });
