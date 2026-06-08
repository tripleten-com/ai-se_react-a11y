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

console.log("\nLesson 04: Focus Management\n");

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

test("useRef is imported from React", () => {
  assert(
    form && form.includes("useRef"),
    "useRef is not imported — add it to the React import",
  );
});

test("Refs are declared for all three inputs and the success message", () => {
  assert(
    form && form.includes("successRef"),
    "successRef not found — declare a useRef for the success message div",
  );
});

test("Refs are declared for all three inputs", () => {
  assert(
    form && form.includes("nameRef"),
    "nameRef not found — declare a useRef for the name input",
  );
  assert(
    form && form.includes("emailRef"),
    "emailRef not found — declare a useRef for the email input",
  );
  assert(
    form && form.includes("passwordRef"),
    "passwordRef not found — declare a useRef for the password input",
  );
});

test("handleSubmit checks validity.valid to find the first invalid field", () => {
  assert(
    form && form.includes("validity.valid"),
    "validity.valid not found — use ref.current?.validity.valid to check each field, not the errors state",
  );
});

test("The success message has tabIndex={-1}", () => {
  assert(
    form && form.includes("tabIndex={-1}"),
    'tabIndex={-1} not found — add it to the success div so it can receive programmatic focus',
  );
});

test("Focus management behaves correctly", () => {
  const result = checkBehavior(root, "tests/lib/lesson-04.behavior.test.tsx");
  assert(
    result.ok,
    "Behavioral tests failed — run `npm test -- tests/lib/lesson-04.behavior.test.tsx` for details",
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail === 0) {
  const code = Buffer.from("dnMzNHp2c3c=", "base64").toString();
  console.log(`\nVerification code: ${code}`);
}
if (fail > 0) process.exit(1);
