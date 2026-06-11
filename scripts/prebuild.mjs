import { execSync } from "node:child_process";

// Coolify/Nixpacks often runs `npm install` with production flags, which skips
// platform-specific optional binaries (rollup, lightningcss, tailwind oxide).
if (process.platform === "linux") {
  execSync("npm install --include=optional --no-audit --no-fund", {
    stdio: "inherit",
  });
}
