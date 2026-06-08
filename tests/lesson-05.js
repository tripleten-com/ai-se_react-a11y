import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { checkCompiles, checkBuilds, checkBehavior, normalize } from "./lib/utils.js";

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

console.log("\nLesson 05: Keyboard-Accessible Custom Components\n");

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
const css = read("src/components/RegisterForm/RegisterForm.css");

test("RegisterForm.tsx exists", () => {
  assert(form !== null, "src/components/RegisterForm/RegisterForm.tsx not found");
});

test("showPassword state variable is declared", () => {
  assert(
    form && form.includes("showPassword"),
    "showPassword not found — declare a boolean state variable with useState",
  );
});

test("Password input type toggles based on showPassword", () => {
  assert(
    form && form.includes("showPassword") && form.includes("'text'") && form.includes("'password'"),
    "Password input type does not appear to toggle — use showPassword to switch between 'text' and 'password'",
  );
});

test("Password input is wrapped in a div with className form__password-wrapper", () => {
  assert(
    form && form.includes("form__password-wrapper"),
    'form__password-wrapper class not found — wrap the password input and toggle button in a div with this class',
  );
});

test("Toggle button has type='button'", () => {
  assert(
    form && form.includes('type="button"'),
    'type="button" not found on the toggle button — without it the button will submit the form',
  );
});

test("Toggle button has an aria-label that reflects the current action", () => {
  assert(
    form && form.includes("aria-label") && form.includes("Show password") && form.includes("Hide password"),
    'aria-label not found on the toggle button — add one that says "Show password" or "Hide password" based on state',
  );
});

test("RegisterForm.css has a :focus-visible rule for the toggle button", () => {
  assert(
    css && css.includes("focus-visible"),
    ":focus-visible rule not found in RegisterForm.css — add a focus style for .form__password-toggle:focus-visible",
  );
});

test("Password toggle works correctly", () => {
  const result = checkBehavior(root, "tests/lib/lesson-05.behavior.test.tsx");
  assert(
    result.ok,
    "Behavioral tests failed — run `npm test -- tests/lib/lesson-05.behavior.test.tsx` for details",
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("enVkdjN6dmQ=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
