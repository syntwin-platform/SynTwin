/**
 * audit_api.mjs — SynTwin API Coverage Audit (final)
 *
 * Strategy:
 * 1. Extract all paths from swagger.json
 * 2. Read all lib/api/*.ts files
 * 3. For each apiRequest call, extract (path, method)
 *    - GET is default when no `method:` option
 *    - Template literals are normalized: ${...} → {X}
 * 4. Compare and report
 */

import { readFileSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Swagger endpoints ────────────────────────────────────────
const swagger = JSON.parse(
  readFileSync(path.join(__dirname, "../SynTwin_Backend/swagger.json"), "utf8")
);

const swaggerSet = new Map(); // normalized → original
for (const [p, methods] of Object.entries(swagger.paths)) {
  for (const m of Object.keys(methods)) {
    const norm = m.toUpperCase() + " " + p.replace(/\{[^}]+\}/g, "{X}");
    swaggerSet.set(norm, m.toUpperCase() + " " + p);
  }
}

// ─── Read all API files ───────────────────────────────────────
const apiDir = path.join(__dirname, "lib/api");
const files = readdirSync(apiDir).filter(
  (f) => f.endsWith(".ts") && !["index.ts", "types.ts", "client.ts"].includes(f)
);

const implSet = new Set();

for (const f of files) {
  const src = readFileSync(path.join(apiDir, f), "utf8");

  // Find every occurrence of apiRequest
  let searchFrom = 0;
  while (true) {
    const callStart = src.indexOf("apiRequest", searchFrom);
    if (callStart === -1) break;
    searchFrom = callStart + 1;

    // Find the opening paren
    const parenIdx = src.indexOf("(", callStart);
    if (parenIdx === -1 || parenIdx > callStart + 30) continue;

    // Grab window after paren for path + options
    const window = src.slice(parenIdx + 1, parenIdx + 800);

    // Extract path — try backtick first, then double quote, then single quote
    let rawPath = null;
    let pathEnd = -1;

    const btMatch = window.match(/^\s*`([^`]+)`/);
    const dqMatch = window.match(/^\s*"([^"]+)"/);
    const sqMatch = window.match(/^\s*'([^']+)'/);

    if (btMatch) { rawPath = btMatch[1]; pathEnd = btMatch[0].length; }
    else if (dqMatch) { rawPath = dqMatch[1]; pathEnd = dqMatch[0].length; }
    else if (sqMatch) { rawPath = sqMatch[1]; pathEnd = sqMatch[0].length; }

    if (!rawPath) continue;

    // Normalize template expressions like ${id}, ${robotId}, etc.
    const normPath = rawPath.replace(/\$\{[^}]+\}/g, "{X}");

    // Look for method in remaining window (after path)
    const afterPath = window.slice(pathEnd, pathEnd + 400);
    const methodMatch = afterPath.match(/method\s*:\s*["']([A-Z]+)["']/);
    const method = methodMatch ? methodMatch[1] : "GET";

    const key = `${method} ${normPath}`;
    implSet.add(key);
  }
}

// Mark POST /api/auth/refresh as covered (called inside client.ts directly)
implSet.add("POST /api/auth/refresh");

// VNPay IPN/Return are backend webhooks — not called from FE
const backendOnly = new Set([
  "GET /api/payments/vnpay/ipn",
  "GET /api/payments/vnpay/return",
  // PATCH /api/users/me/subscription always returns 400 per backend code
  // (redirect to VNPay) — no FE function needed, documented in users.ts
  "PATCH /api/users/me/subscription",
]);

// ─── Compare & Report ─────────────────────────────────────────
const covered = [];
const missing = [];
const notApplicable = [];

for (const [norm, original] of [...swaggerSet.entries()].sort()) {
  if (backendOnly.has(norm)) {
    notApplicable.push({ norm, original });
  } else if (implSet.has(norm)) {
    covered.push({ norm, original });
  } else {
    missing.push({ norm, original });
  }
}

console.log("╔══════════════════════════════════════════════════════════╗");
console.log("║        SynTwin API Coverage Audit — Final               ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");
console.log(`📋 Total Swagger endpoints : ${swaggerSet.size}`);
console.log(`✅ Implemented (FE)        : ${covered.length}`);
console.log(`⚠️  N/A for FE (webhooks)  : ${notApplicable.length}`);
console.log(`❌ Missing                 : ${missing.length}`);
console.log("");

console.log("✅ IMPLEMENTED:");
covered.forEach(({ original }) => console.log(`   [OK] ${original}`));

console.log("\n⚠️  NOT APPLICABLE (backend-only / always 400):");
notApplicable.forEach(({ original }) => console.log(`   [N/A] ${original}`));

if (missing.length > 0) {
  console.log("\n❌ MISSING:");
  missing.forEach(({ original }) => console.log(`   [!!] ${original}`));
} else {
  console.log("\n🎉 All FE-relevant endpoints are covered!");
}

const feDenom = swaggerSet.size - notApplicable.length;
const pct = Math.round((covered.length / feDenom) * 100);
console.log(`\n📊 FE Coverage: ${covered.length}/${feDenom} (${pct}%)`);
