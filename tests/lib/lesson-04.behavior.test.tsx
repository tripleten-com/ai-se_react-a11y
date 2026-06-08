import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import RegisterForm from "../../src/components/RegisterForm/RegisterForm";

describe("Lesson 04 — focus management", () => {
  it("submitting an empty form moves focus to the name input", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await user.click(screen.getByRole("button", { name: /register/i }));
    expect(document.activeElement).toBe(screen.getByLabelText(/name/i));
  });

  it("submitting with only the name field filled focuses the email input", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/name/i), "Alice Smith");
    await user.click(screen.getByRole("button", { name: /register/i }));
    expect(document.activeElement).toBe(screen.getByLabelText(/email/i));
  });

  it("the success message appears and has tabIndex={-1} after a valid submit", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/name/i), "Alice Smith");
    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /register/i }));
    const successEl = screen.getByText(/registration successful/i);
    expect(successEl).toBeInTheDocument();
    expect(successEl).toHaveAttribute("tabindex", "-1");
  });

  it("focus moves to the success message after a valid submit", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/name/i), "Alice Smith");
    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /register/i }));
    expect(document.activeElement).toBe(
      screen.getByText(/registration successful/i),
    );
  });
});
