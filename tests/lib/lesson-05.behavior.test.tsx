import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import RegisterForm from "../../src/components/RegisterForm/RegisterForm";

describe("Lesson 04 — show/hide password toggle", () => {
  it("password input starts with type='password'", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/password/i)).toHaveAttribute("type", "password");
  });

  it("clicking the toggle reveals the password (type becomes 'text')", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    const toggle = screen.getByRole("button", { name: /show password/i });
    await user.click(toggle);
    expect(screen.getByLabelText(/password/i)).toHaveAttribute("type", "text");
  });

  it("clicking the toggle a second time hides the password again", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await user.click(screen.getByRole("button", { name: /show password/i }));
    await user.click(screen.getByRole("button", { name: /hide password/i }));
    expect(screen.getByLabelText(/password/i)).toHaveAttribute("type", "password");
  });

  it("toggle aria-label updates to reflect the current action", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    expect(screen.getByRole("button", { name: /show password/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(screen.getByRole("button", { name: /hide password/i })).toBeInTheDocument();
  });
});
