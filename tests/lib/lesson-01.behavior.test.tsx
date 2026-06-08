import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RegisterForm from "../../src/components/RegisterForm/RegisterForm";

describe("Lesson 01 — redundant ARIA removed", () => {
  it("inputs are reachable by their visible label text", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it("no input has aria-required (redundant with the required attribute)", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/^name$/i)).not.toHaveAttribute("aria-required");
    expect(screen.getByLabelText(/^email$/i)).not.toHaveAttribute("aria-required");
    expect(screen.getByLabelText(/^password$/i)).not.toHaveAttribute("aria-required");
  });

  it("email input has no aria-label (the linked label already names it)", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/^email$/i)).not.toHaveAttribute("aria-label");
  });

  it("submit button has no explicit role attribute (implicit button role is correct)", () => {
    render(<RegisterForm />);
    expect(screen.getByRole("button", { name: /register/i })).not.toHaveAttribute("role");
  });
});
