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
const formAst = parseFileContent(
  join(root, "src/components/RegisterForm/RegisterForm.tsx"),
);

test("RegisterForm.tsx exists", () => {
  assert(form !== null, "src/components/RegisterForm/RegisterForm.tsx not found");
});

test("All three error spans have aria-live='polite'", () => {
  const els = findQuerySelector(
    formAst,
    'JSXOpeningElement[name.name="span"] JSXAttribute[name.name="aria-live"]',
  );
  const matches = els.filter(
    (attr) => attr?.value?.type === "StringLiteral" && attr.value.value === "polite",
  ).length;
  assert(
    matches >= 3,
    `Expected aria-live="polite" on all three error spans — found ${matches} instance(s)`,
  );
});

test("useEffect is imported from React", () => {
  const el = findQuerySelector(
    formAst,
    'ImportDeclaration[source.value="react"] ImportSpecifier[imported.name="useEffect"]',
  );
  assert(
    el.length > 0,
    "useEffect is not imported — add it to the React import",
  );
});

test("useEffect is not called conditionally", () => {
  const fn = findQuerySelector(
    formAst,
    'FunctionDeclaration[id.name="RegisterForm"]',
  )[0];
  const nestedFns = findQuerySelector(
    fn,
    "ArrowFunctionExpression,FunctionExpression,FunctionDeclaration",
  ).filter((n) => n !== fn);
  const inNested = (node) =>
    nestedFns.some((nf) => node.start > nf.start && node.end < nf.end);

  const el = findQuerySelector(fn, 'CallExpression[callee.name="useEffect"]').filter(
    (n) => !inNested(n),
  );
  const returns = findQuerySelector(fn, "ReturnStatement").filter((n) => !inNested(n));

  assert(
    el.length > 0 &&
    el.every((effect) => !returns.some((ret) => ret.start < effect.start)),
    "useEffect is called conditionally — move it above any early returns so hooks run in the same order every render",
  );
});

test("A setTimeout is used to debounce the error display", () => {
  const el = findQuerySelector(formAst, 'Identifier[name="setTimeout"]');
  assert(
    el.length > 0,
    "setTimeout not found — add a useEffect that delays surfacing errors by 500ms",
  );
});

test("A debouncedErrors state is declared", () => {
  const el = findQuerySelector(
    formAst,
    'Identifier[name="debouncedErrors"]',
  );
  assert(
    el.length > 0,
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
