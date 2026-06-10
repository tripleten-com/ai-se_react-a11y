import { execSync } from "child_process";

/**
 * Collapses all whitespace sequences to a single space and trims the result.
 * Call this on every file read so that formatting differences don't affect
 * string matching in tests.
 */
export function normalize(content) {
  if (content === null) return null;
  return content.replace(/\s+/g, " ").trim();
}

/**
 * Type-checks the app with TypeScript.
 *
 * Unused-code checks (noUnusedLocals / noUnusedParameters) are disabled here
 * because editors may surface them as faded "warning"-style hints rather than
 * red errors, and students shouldn't fail the check for leftover unused
 * variables. Real type errors (red squiggles) still fail.
 */
export function checkCompiles(root) {
  try {
    execSync(
      "npx tsc -p tsconfig.app.json --noEmit --noUnusedLocals false --noUnusedParameters false",
      {
        cwd: root,
        stdio: "pipe",
      },
    );
    return { ok: true, output: "" };
  } catch (err) {
    const output =
      err.stderr?.toString() || err.stdout?.toString() || "(no output)";
    return { ok: false, output };
  }
}

/**
 * Runs `vite build` to verify the app bundles without errors.
 */
export function checkBuilds(root) {
  try {
    execSync("npx vite build", { cwd: root, stdio: "pipe" });
    return { ok: true, output: "" };
  } catch (err) {
    const output =
      err.stderr?.toString() || err.stdout?.toString() || "(no output)";
    return { ok: false, output };
  }
}

/**
 * Runs a vitest test file silently and returns whether all tests passed.
 */
export function checkBehavior(root, testFile) {
  try {
    execSync(`npx vitest run ${testFile}`, { cwd: root, stdio: "pipe" });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
