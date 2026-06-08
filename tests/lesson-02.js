import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  checkCompiles,
  checkBuilds,
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

console.log("\nLesson 02: Accessible Form Fields\n");

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

test("RegisterForm.tsx exists", () => {
  assert(
    form !== null,
    "src/components/RegisterForm/RegisterForm.tsx not found",
  );
});

test("Inputs have aria-invalid set conditionally on the error state", () => {
  assert(
    form && form.includes("aria-invalid"),
    "aria-invalid not found — add it to each input, set to 'true' when an error is present",
  );
  assert(
    form && form.includes("errors."),
    "aria-invalid does not appear to reference the errors state",
  );
});

test("Error spans have unique IDs (name-error, email-error, password-error)", () => {
  assert(
    form && form.includes('id="name-error"'),
    'id="name-error" not found on the name error span',
  );
  assert(
    form && form.includes('id="email-error"'),
    'id="email-error" not found on the email error span',
  );
  assert(
    form && form.includes('id="password-error"'),
    'id="password-error" not found on the password error span',
  );
});

test("Inputs reference their error span via aria-describedby", () => {
  assert(
    form && form.includes('aria-describedby="name-error"'),
    'aria-describedby="name-error" not found on the name input',
  );
  assert(
    form && form.includes('aria-describedby="email-error"'),
    'aria-describedby="email-error" not found on the email input',
  );
  assert(
    form && form.includes('aria-describedby="password-error"'),
    'aria-describedby="password-error" not found on the password input',
  );
});

test("Error spans are always present in the DOM (not conditionally rendered)", () => {
  // The starting code uses {errors.name && <span>...} — this check
  // fails if that pattern still exists for name, email, or password.
  assert(
    form && !/(errors\.(name|email|password)\s*&&\s*[(<])/.test(form),
    "Error spans are still conditionally rendered — remove the && short-circuit and render the span unconditionally",
  );
});

test("Inputs have correct autoComplete values", () => {
  assert(
    form && form.includes('autoComplete="name"'),
    'autocomplete="name" not found on the name input',
  );
  assert(
    form && form.includes('autoComplete="email"'),
    'autocomplete="email" not found on the email input',
  );
  assert(
    form && form.includes('autoComplete="new-password"'),
    'autocomplete="new-password" not found on the password input — use "new-password" on registration forms',
  );
});

test("ARIA attributes behave correctly in the rendered form", () => {
  const result = checkBehavior(root, "tests/lib/lesson-02.behavior.test.tsx");
  assert(
    result.ok,
    "Behavioral tests failed — run `npm test -- tests/lib/lesson-02.behavior.test.tsx` for details",
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("aGU1djRoZTM=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
