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

console.log("\nLesson 04: Focus Management\n");

runGates(root);

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

summary("dnMzNHp2c3c=");
