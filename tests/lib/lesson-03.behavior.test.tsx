import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RegisterForm from "../../src/components/RegisterForm/RegisterForm";

describe("Lesson 02 — aria-live on error spans", () => {
  it("name error span has aria-live='polite'", () => {
    render(<RegisterForm />);
    expect(document.getElementById("name-error")).toHaveAttribute("aria-live", "polite");
  });

  it("email error span has aria-live='polite'", () => {
    render(<RegisterForm />);
    expect(document.getElementById("email-error")).toHaveAttribute("aria-live", "polite");
  });

  it("password error span has aria-live='polite'", () => {
    render(<RegisterForm />);
    expect(document.getElementById("password-error")).toHaveAttribute("aria-live", "polite");
  });
});
