import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import RegisterForm from "../../src/components/RegisterForm/RegisterForm";

describe("Lesson 03 — focus management", () => {
  it("submitting an empty form moves focus to the name input", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    const submitButton = screen.getByRole("button", { name: /register/i });
    await user.click(submitButton);
    expect(document.activeElement).toBe(screen.getByLabelText(/name/i));
  });

  it("submitting a valid form shows the success message", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/name/i), "Alice Smith");
    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /register/i }));
    expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
  });

  it("the success message has tabIndex={-1} so it can receive programmatic focus", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/name/i), "Alice Smith");
    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /register/i }));
    const successEl = screen.getByText(/registration successful/i);
    expect(successEl).toHaveAttribute("tabindex", "-1");
  });

  it("focus moves to the success message after a successful submission", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/name/i), "Alice Smith");
    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /register/i }));
    const successEl = screen.getByText(/registration successful/i);
    expect(document.activeElement).toBe(successEl);
  });
});
