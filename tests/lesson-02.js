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
const formAst = parseFileContent(join(root, "src/components/RegisterForm/RegisterForm.tsx"));

function hasStringLiteralAttribute(openingEl, attrName, expectedValue) {
  const attrs = openingEl?.attributes || [];
  const attr = attrs.find(
    (a) => a?.type === "JSXAttribute" && a?.name?.name === attrName,
  );
  if (!attr || attr.value?.type !== "StringLiteral") return false;
  return attr.value.value === expectedValue;
}

test("RegisterForm.tsx exists", () => {
  assert(
    form !== null,
    "src/components/RegisterForm/RegisterForm.tsx not found",
  );
});

test("Inputs have aria-invalid set conditionally on the error state", () => {
  const el = findQuerySelector(
    formAst,
    'JSXOpeningElement[name.name="input"] JSXAttribute[name.name="aria-invalid"]',
  );
  assert(
    el.length > 0,
    "aria-invalid not found — add it to each input, set to 'true' when an error is present",
  );

  const el2 = el.some(
    (attr) => findQuerySelector(attr, 'Identifier[name="errors"]').length > 0,
  );
  assert(
    !!el2,
    "aria-invalid does not appear to reference the errors state",
  );
});

test("Error spans have unique IDs (name-error, email-error, password-error)", () => {
  const idAttrs = findQuerySelector(
    formAst,
    'JSXOpeningElement[name.name="span"] JSXAttribute[name.name="id"]',
  );
  const ids = idAttrs
    .map((attr) => (attr?.value?.type === "StringLiteral" ? attr.value.value : null))
    .filter(Boolean);
  assert(
    ids.includes("name-error"),
    'id="name-error" not found on the name error span',
  );
  assert(
    ids.includes("email-error"),
    'id="email-error" not found on the email error span',
  );
  assert(
    ids.includes("password-error"),
    'id="password-error" not found on the password error span',
  );
});

test("Inputs reference their error span via aria-describedby", () => {
  const el = findQuerySelector(
    formAst,
    'JSXOpeningElement[name.name="input"] JSXAttribute[name.name="aria-describedby"]',
  );
  const elValues = el
    .map((attr) =>
      attr?.value?.type === "StringLiteral" ? attr.value.value : null,
    )
    .filter(Boolean);
  assert(
    elValues.includes("name-error"),
    'aria-describedby="name-error" not found on the name input',
  );
  assert(
    elValues.includes("email-error"),
    'aria-describedby="email-error" not found on the email input',
  );
  assert(
    elValues.includes("password-error"),
    'aria-describedby="password-error" not found on the password input',
  );
});

test("Error spans are always present in the DOM (not conditionally rendered)", () => {
  // The starting code uses {errors.name && <span>...} — this check
  // fails if that pattern still exists for name, email, or password.
  const el = findQuerySelector(formAst, 'LogicalExpression[operator="&&"]');
  const el2 = el.some((expr) => {
    const left = expr.left;
    if (left?.type !== "MemberExpression") return false;
    if (left.object?.type !== "Identifier" || left.object.name !== "errors") return false;

    const propName =
      left.property?.type === "Identifier"
        ? left.property.name
        : left.property?.type === "StringLiteral"
          ? left.property.value
          : null;
    if (!["name", "email", "password"].includes(propName)) return false;

    const right = expr.right;
    return (
      right?.type === "JSXElement" ||
      right?.type === "JSXFragment" ||
      right?.type === "ParenthesizedExpression"
    );
  });
  assert(
    !el2,
    "Error spans are still conditionally rendered — remove the && short-circuit and render the span unconditionally",
  );
});

test("Inputs have correct autoComplete values", () => {
  const inputEls = findQuerySelector(formAst, 'JSXOpeningElement[name.name="input"]');
  const name = inputEls.some((el) =>
    hasStringLiteralAttribute(el, "autoComplete", "name"),
  );
  const email = inputEls.some((el) =>
    hasStringLiteralAttribute(el, "autoComplete", "email"),
  );
  const newPwd = inputEls.some((el) =>
    hasStringLiteralAttribute(el, "autoComplete", "new-password"),
  );
  assert(
    name,
    'autocomplete="name" not found on the name input',
  );
  assert(
    email,
    'autocomplete="email" not found on the email input',
  );
  assert(
    newPwd,
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
