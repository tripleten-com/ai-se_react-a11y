import { execSync } from "child_process";
import { readFileSync } from "fs";
import { parse } from "@babel/parser";
import esquery from "esquery";

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
 * Type-checks the app with TypeScript. Uses tsconfig.app.json directly because
 * the root tsconfig.json is a project-references wrapper with "files": [] and
 * checks nothing on its own.
 */
export function checkCompiles(root) {
  try {
    execSync("npx tsc -p tsconfig.app.json --noEmit", {
      cwd: root,
      stdio: "pipe",
    });
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

