import { useState } from "react";
import { useFormWithValidation } from "../../hooks/useFormWithValidation";
import "./RegisterForm.css";

export default function RegisterForm() {
  const { values, handleChange, errors, isValid } =
    useFormWithValidation({ name: "", email: "", password: "" });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitSuccess(true);
  };

  if (submitSuccess) {
    return (
      <div className="form__success">
        Registration successful!
      </div>
    );
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
          aria-required="true"
          minLength={2}
          maxLength={40}
          value={values.name}
          onChange={handleChange}
        />
        {errors.name && (
          <span className="form__error">{errors.name}</span>
        )}
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
          aria-required="true"
          aria-label="Type your email address"
          value={values.email}
          onChange={handleChange}
        />
        {errors.email && (
          <span className="form__error">{errors.email}</span>
        )}
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
          aria-required="true"
          minLength={8}
          value={values.password}
          onChange={handleChange}
        />
        {errors.password && (
          <span className="form__error">{errors.password}</span>
        )}
      </div>

      <button className="form__submit" type="submit" role="button">
        Register
      </button>
    </form>
  );
}