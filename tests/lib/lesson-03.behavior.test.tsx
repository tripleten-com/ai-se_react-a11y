import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import RegisterForm from "../../src/components/RegisterForm/RegisterForm";

describe("Lesson 03 — aria-live with debounced errors", () => {
  it("all three error spans have aria-live='polite'", () => {
    render(<RegisterForm />);
    expect(document.getElementById("name-error")).toHaveAttribute("aria-live", "polite");
    expect(document.getElementById("email-error")).toHaveAttribute("aria-live", "polite");
    expect(document.getElementById("password-error")).toHaveAttribute("aria-live", "polite");
  });

  it("error does not appear immediately while typing", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, "A");
    await user.clear(nameInput);
    // debounce hasn't fired yet — error span should still be empty
    expect(document.getElementById("name-error")).toHaveTextContent("");
  });

  it("error appears after a pause without moving focus", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, "A");
    await user.clear(nameInput);
    // wait for the 500ms debounce to fire
    await waitFor(
      () => expect(document.getElementById("name-error")).not.toHaveTextContent(""),
      { timeout: 1500 },
    );
    // input is still focused — user never had to move away
    expect(document.activeElement).toBe(nameInput);
  }, 3000);
});
