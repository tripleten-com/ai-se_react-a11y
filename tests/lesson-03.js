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

console.log("\nLesson 03: Dynamic Error Announcements\n");

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
  assert(form !== null, "src/components/RegisterForm/RegisterForm.tsx not found");
});

test("All three error spans have aria-live='polite'", () => {
  const matches = (form.match(/aria-live="polite"/g) || []).length;
  assert(
    matches >= 3,
    `Expected aria-live="polite" on all three error spans — found ${matches} instance(s)`,
  );
});

test("useEffect is imported from React", () => {
  assert(
    form && form.includes("useEffect"),
    "useEffect is not imported — add it to the React import",
  );
});

test("A setTimeout is used to debounce the error display", () => {
  assert(
    form && form.includes("setTimeout"),
    "setTimeout not found — add a useEffect that delays surfacing errors by 500ms",
  );
});

test("A debouncedErrors state is declared", () => {
  assert(
    form && form.includes("debouncedErrors"),
    "debouncedErrors not found — add a separate state for the debounced error values",
  );
});

test("aria-live regions and debounced errors behave correctly", () => {
  const result = checkBehavior(root, "tests/lib/lesson-03.behavior.test.tsx");
  assert(
    result.ok,
    "Behavioral tests failed — run `npm test -- tests/lib/lesson-03.behavior.test.tsx` for details",
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("cGI5YnJ4aDE=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
