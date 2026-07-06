import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  checkCompiles,
  checkBuilds,
  checkBehavior,
  normalize,
  parseFileContent,
  findQuerySelector,
} from "./lib/utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function read(relPath) {
  try {
    return normalize(readFileSync(join(root, relPath), "utf8"));
  } catch {
    return null;
  }
}

let pass = 0;
let fail = 0;

function test(label, fn) {
  try {
    fn();
    console.log(`✅ ${label}`);
    pass++;
  } catch (err) {
    console.log(`❌ ${label} — ${err.message}`);
    fail++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

console.log("\nLesson 01: When Not to Use ARIA\n");

const compiled = checkCompiles(root);
if (!compiled.ok) {
  console.log(
    "❌ TypeScript compilation failed — fix all type errors before running tests\n",
  );
  console.log(compiled.output);
  process.exit(1);
}
console.log("✅ Project compiles without type errors");

const built = checkBuilds(root);
if (!built.ok) {
  console.log("❌ Vite build failed — the app does not run without errors\n");
  console.log(built.output);
  process.exit(1);
}
console.log("✅ App builds and runs without errors\n");

const form = read("src/components/RegisterForm/RegisterForm.tsx");
const formAst = parseFileContent(join(root, "src/components/RegisterForm/RegisterForm.tsx"));

test("RegisterForm.tsx exists", () => {
  assert(form !== null, "src/components/RegisterForm/RegisterForm.tsx not found");
});

test("aria-required has been removed from all inputs", () => {
  const ariaRequiredAttrs = findQuerySelector(
    formAst,
    'JSXAttribute[name.name="aria-required"]',
  );
  assert(
    formAst && ariaRequiredAttrs.length === 0,
    'aria-required still present — the native required attribute already exposes this to the accessibility tree',
  );
});

test("aria-label has been removed from the email input", () => {
  const ariaLabelAttrs = findQuerySelector(
    formAst,
    'JSXAttribute[name.name="aria-label"]',
  );
  const hasForbiddenEmailAriaLabel = ariaLabelAttrs.some((attr) => {
    const stringValue =
      attr?.value?.type === "StringLiteral" ? attr.value.value : null;
    return stringValue === "Type your email address";
  });
  assert(
    formAst && !hasForbiddenEmailAriaLabel,
    'aria-label="Type your email address" still on the email input — the linked <label> already provides the accessible name',
  );
});

test("Redundant role has been removed from the submit button", () => {
  const roleAttrs = findQuerySelector(formAst, 'JSXAttribute[name.name="role"]');
  const hasRedundantButtonRole = roleAttrs.some((attr) => {
    const stringValue =
      attr?.value?.type === "StringLiteral" ? attr.value.value : null;
    return stringValue === "button";
  });
  assert(
    formAst && !hasRedundantButtonRole,
    'role="button" still on the submit button — <button> already has the button role implicitly',
  );
});

test("Inputs are still accessible via their labels", () => {
  const result = checkBehavior(root, "tests/lib/lesson-01.behavior.test.tsx");
  assert(
    result.ok,
    "Behavioral tests failed — run `npm test -- tests/lib/lesson-01.behavior.test.tsx` for details",
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("MnltbHhmeGM=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
