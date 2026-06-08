import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import RegisterForm from "../../src/components/RegisterForm/RegisterForm";

describe("Lesson 01 — ARIA attributes on form fields", () => {
  it("error spans are always present in the DOM, even before any input", () => {
    render(<RegisterForm />);
    expect(document.getElementById("name-error")).toBeInTheDocument();
    expect(document.getElementById("email-error")).toBeInTheDocument();
    expect(document.getElementById("password-error")).toBeInTheDocument();
  });

  it("inputs reference their error span via aria-describedby", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/name/i)).toHaveAttribute("aria-describedby", "name-error");
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("aria-describedby", "email-error");
    expect(screen.getByLabelText(/password/i)).toHaveAttribute("aria-describedby", "password-error");
  });

  it("aria-invalid is 'false' initially and 'true' after an invalid entry", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toHaveAttribute("aria-invalid", "false");
    await user.type(nameInput, "A");
    await user.clear(nameInput);
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
  });
});
