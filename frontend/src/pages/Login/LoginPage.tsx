import Logo from "./Logo";
import { useLoginForm } from "./hooks/useLoginForm";
import "./LoginPage.css";
import { Link } from "react-router-dom";

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        submitError,
    } = useLoginForm();

    const emailErrorId = errors.email ? "login-email-error" : undefined;
    const passwordErrorId = errors.password
        ? "login-password-error"
        : undefined;

    return (
        <main className="login-page">
            <section
                className="login-shell"
                aria-labelledby="login-title"
            >
                <div className="login-card">
                    <header className="login-header">
                        <Logo />

                        <div className="login-heading">
                            <h1 id="login-title">Sign in</h1>
                            <p>User &amp; access management console</p>
                        </div>
                    </header>

                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        {submitError && (
                            <div
                                className="login-alert"
                                role="alert"
                                aria-live="polite"
                            >
                                {submitError}
                            </div>
                        )}

                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                placeholder="you@company.com"
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={emailErrorId}
                                {...register("email")}
                            />
                            {errors.email && (
                                <p
                                    id="login-email-error"
                                    className="field-error"
                                    role="alert"
                                >
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="•••••••••••"
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={passwordErrorId}
                                {...register("password")}
                            />
                            {errors.password && (
                                <p
                                    id="login-password-error"
                                    className="field-error"
                                    role="alert"
                                >
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <button
                            className="login-button"
                            type="submit"
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                        >
                            {isSubmitting ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <div className="login-divider" aria-hidden="true" />

                    <footer className="login-footer">
                        <p>Demo: any email + password</p>

                        <Link to="/register">
                            Create account
                        </Link>
                    </footer>
                </div>
            </section>
        </main>
    );
}
