import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  runGates,
  test,
  assert,
  summary,
  checkBehavior,
  normalize,
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

console.log("\nLesson 01: When Not to Use ARIA\n");

runGates(root);

const form = read("src/components/RegisterForm/RegisterForm.tsx");

test("RegisterForm.tsx exists", () => {
  assert(form !== null, "src/components/RegisterForm/RegisterForm.tsx not found");
});

test("aria-required has been removed from all inputs", () => {
  assert(
    form && !form.includes('aria-required'),
    'aria-required still present — the native required attribute already exposes this to the accessibility tree',
  );
});

test("aria-label has been removed from the email input", () => {
  assert(
    form && !form.includes('aria-label="Type your email address"'),
    'aria-label="Type your email address" still on the email input — the linked <label> already provides the accessible name',
  );
});

test("Redundant role has been removed from the submit button", () => {
  assert(
    form && !form.includes('role="button"'),
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

summary("MnltbHhmeGM=");
