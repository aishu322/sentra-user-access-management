import Logo from "../Login/Logo";
import { Link } from "react-router-dom";
import { useRegisterForm } from "./hooks/useRegisterForm";
import "./RegisterPage.css";

export default function RegisterPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        submitError,
    } = useRegisterForm();

    return (
        <main className="login-page">
            <section
                className="login-shell"
                aria-labelledby="register-title"
            >
                <div className="login-card">

                    <header className="login-header">
                        <Logo />

                        <div className="login-heading">
                            <h1 id="register-title">
                                Create account
                            </h1>

                            <p>
                                New accounts start with the Viewer role
                            </p>
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
                            >
                                {submitError}
                            </div>
                        )}

                        <div className="field">
                            <label>Full name</label>

                            <input
                                placeholder="Jane Cooper"
                                {...register("full_name")}
                            />

                            {errors.full_name && (
                                <p className="field-error">
                                    {errors.full_name.message}
                                </p>
                            )}
                        </div>

                        <div className="field">
                            <label>Email</label>

                            <input
                                type="email"
                                placeholder="you@company.com"
                                {...register("email")}
                            />

                            {errors.email && (
                                <p className="field-error">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "16px",
                            }}
                        >
                            <div className="field">
                                <label>Password</label>

                                <input
                                    type="password"
                                    placeholder="Min 8 chars"
                                    {...register("password")}
                                />

                                {errors.password && (
                                    <p className="field-error">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="field">
                                <label>Confirm</label>

                                <input
                                    type="password"
                                    placeholder="Repeat it"
                                    {...register("confirm_password")}
                                />

                                {errors.confirm_password && (
                                    <p className="field-error">
                                        {errors.confirm_password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            className="login-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Creating..."
                                : "Create account"}
                        </button>

                    </form>

                    <div className="login-divider" />

                    <footer className="login-footer">
                        <p>Already have an account?</p>

                        <Link to="/login">
                            Sign in
                        </Link>
                    </footer>

                </div>
            </section>
        </main>
    );
}