import { useState, useEffect } from "react";
import { useFormWithValidation } from "../../hooks/useFormWithValidation";
import "./RegisterForm.css";

export default function RegisterForm() {
  const { values, handleChange, errors, isValid } = useFormWithValidation({
    name: "",
    email: "",
    password: "",
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitSuccess(true);
  };

  const [debouncedErrors, setDebouncedErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedErrors(errors);
    }, 500);
    return () => clearTimeout(timer);
  }, [errors]);

  if (submitSuccess) {
    return <div className="form__success">Registration successful!</div>;
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h1 className="form__title">Register</h1>

      <div className="form__field">
        <label className="form__label" htmlFor="name">
          Name
        </label>
        <input
          className="form__input"
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={40}
          value={values.name}
          onChange={handleChange}
          aria-invalid={debouncedErrors.name ? "true" : "false"}
          aria-describedby="name-error"
          autoComplete="name"
        />
        <span className="form__error" id="name-error" aria-live="polite">
          {debouncedErrors.name}
        </span>
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="email">
          Email
        </label>
        <input
          className="form__input"
          id="email"
          name="email"
          type="email"
          required
          value={values.email}
          onChange={handleChange}
          aria-invalid={debouncedErrors.email ? "true" : "false"}
          aria-describedby="email-error"
          autoComplete="email"
        />
        <span className="form__error" id="email-error" aria-live="polite">
          {debouncedErrors.email}
        </span>
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="password">
          Password
        </label>
        <input
          className="form__input"
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          value={values.password}
          onChange={handleChange}
          aria-invalid={debouncedErrors.password ? "true" : "false"}
          aria-describedby="password-error"
          autoComplete="new-password"
        />
        <span className="form__error" id="password-error" aria-live="polite">
          {debouncedErrors.password}
        </span>
      </div>

      <button className="form__submit" type="submit">
        Register
      </button>
    </form>
  );
}
