import { execSync } from "child_process";
import { readFileSync } from "fs";
import { parse } from "@babel/parser";
import esquery from "esquery";

// ============================================================
// TEST RUNNER
// ============================================================

let pass = 0;
let fail = 0;
let notRun = 0;

/**
 * Set when a gate (compile/build) fails. Once blocked, remaining tests are
 * displayed greyed-out as "not run" instead of executing.
 */
let blocked = false;

const GREY = "\x1b[90m";
const RESET = "\x1b[0m";

/** Wraps text in grey ANSI codes (skipped when output is not a terminal). */
function grey(text) {
  if (!process.stdout.isTTY) return text;
  return `${GREY}${text}${RESET}`;
}

/** Prints a greyed-out "not run" line for a test that was skipped. */
function printNotRun(label) {
  console.log(grey(`⚪ ${label} (not run)`));
  notRun++;
}

/**
 * Runs a single test. If a gate has failed (see runGates), the test is not
 * executed; it is listed in grey with a grey circle to show it was skipped.
 */
export function test(label, fn) {
  if (blocked) {
    printNotRun(label);
    return;
  }
  try {
    fn();
    console.log(`✅ ${label}`);
    pass++;
  } catch (err) {
    console.log(`❌ ${label} — ${err.message}`);
    fail++;
  }
}

/** Throws with the given message if the condition is falsy. */
export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

/**
 * Runs the compile and build gates. If either fails, its error output is
 * printed, the failure is counted, and all subsequent tests are blocked
 * (displayed grey as "not run" rather than executed).
 */
export function runGates(root) {
  const compiled = checkCompiles(root);
  if (compiled.ok) {
    console.log("✅ Project compiles without type errors");
    pass++;
  } else {
    console.log(
      "❌ TypeScript compilation failed — fix all type errors before running tests\n",
    );
    console.log(compiled.output);
    fail++;
    blocked = true;
  }

  if (blocked) {
    printNotRun("App builds and runs without errors");
    console.log("");
    return;
  }

  const built = checkBuilds(root);
  if (built.ok) {
    console.log("✅ App builds and runs without errors\n");
    pass++;
  } else {
    console.log("❌ Vite build failed — the app does not run without errors\n");
    console.log(built.output);
    fail++;
    blocked = true;
    console.log("");
  }
}

/**
 * Prints the pass/fail/not-run totals. When everything passed, decodes and
 * prints the lesson's verification code. Exits nonzero on any failure.
 */
export function summary(encodedCode) {
  let line = `\n${pass} passed, ${fail} failed`;
  if (notRun > 0) line += grey(`, ${notRun} not run`);
  console.log(line);
  if (fail === 0 && notRun === 0) {
    const code = Buffer.from(encodedCode, "base64").toString();
    console.log(`\nVerification code: ${code}`);
  } else {
    process.exit(1);
  }
}

// ============================================================
// CHECKS
// ============================================================

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


/**
 * Parses a file into an AST tree.
 * @param {string} filePath - The path to the file to parse.
 * @returns {Object|null} The AST tree or null if the file does not exist.
 */
export function parseFileContent(filePath) {
  try {
    const fileContent = readFileSync(filePath, "utf8");
    return parse(fileContent, { sourceType: "module", plugins: ["jsx", "typescript"] });
  } catch (error) {
    return null;
  }
}


/**
 * Finds all JSX elements in an AST tree.
 */
export function findQuerySelector(ast, selector) {
  try {
    return esquery(ast, selector);
  } catch (error) {
    return [];
  }
}

