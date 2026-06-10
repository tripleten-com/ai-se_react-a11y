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

console.log("\nLesson 03: Dynamic Error Announcements\n");

runGates(root);

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

summary("cGI5YnJ4aDE=");
