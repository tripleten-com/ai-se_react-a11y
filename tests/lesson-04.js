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

console.log("\nLesson 04: Focus Management\n");

runGates(root);

const form = read("src/components/RegisterForm/RegisterForm.tsx");
const formAst = parseFileContent(
  join(root, "src/components/RegisterForm/RegisterForm.tsx"),
);

test("RegisterForm.tsx exists", () => {
  assert(form !== null, "src/components/RegisterForm/RegisterForm.tsx not found");
});

test("useRef is imported from React", () => {
  const el = findQuerySelector(
    formAst,
    'ImportDeclaration[source.value="react"] ImportSpecifier[imported.name="useRef"]',
  );
  assert(
    el.length > 0,
    "useRef is not imported — add it to the React import",
  );
});

test("Refs are declared for all three inputs and the success message", () => {
  const el = findQuerySelector(formAst, 'Identifier[name="successRef"]');
  assert(
    el.length > 0,
    "successRef not found — declare a useRef for the success message div",
  );
});

test("Refs are declared for all three inputs", () => {
  const el = findQuerySelector(formAst, 'Identifier[name="nameRef"]');
  assert(
    el.length > 0,
    "nameRef not found — declare a useRef for the name input",
  );
  const el2 = findQuerySelector(formAst, 'Identifier[name="emailRef"]');
  assert(
    el2.length > 0,
    "emailRef not found — declare a useRef for the email input",
  );
  const el3 = findQuerySelector(formAst, 'Identifier[name="passwordRef"]');
  assert(
    el3.length > 0,
    "passwordRef not found — declare a useRef for the password input",
  );
});

test("handleSubmit checks validity.valid to find the first invalid field", () => {
  const el = findQuerySelector(
    formAst,
    'OptionalMemberExpression[property.name="valid"][object.property.name="validity"]',
  );
  assert(
    el.length > 0,
    "validity.valid not found — use ref.current?.validity.valid to check each field, not the errors state",
  );
});

test("The success message has tabIndex={-1}", () => {
  const el = findQuerySelector(
    formAst,
    'JSXOpeningElement JSXAttribute[name.name="tabIndex"]',
  );
  assert(
    el.some(
      (attr) =>
        attr?.value?.type === "JSXExpressionContainer" &&
        attr.value.expression?.type === "UnaryExpression" &&
        attr.value.expression.operator === "-" &&
        attr.value.expression.argument?.value === 1,
    ),
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
