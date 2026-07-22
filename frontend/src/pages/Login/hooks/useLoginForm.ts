import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { login as loginRequest } from "../../../api/auth";
import {
    getApiErrorMessage,
    getApiFieldErrors,
} from "../../../api/error";
import { useAuth } from "../../../providers/AuthProvider";

const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required.")
        .email("Enter a valid email address."),
    password: z
        .string()
        .min(1, "Password is required.")
        .min(8, "Password must be at least 8 characters."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function useLoginForm() {
    const navigate = useNavigate();
    const auth = useAuth();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onSubmit",
    });

    const { clearErrors, setError, handleSubmit, formState } = form;

    const onSubmit = handleSubmit(async (values) => {
        setSubmitError(null);
        clearErrors();

        try {
            const session = await loginRequest(values);

            auth.login(session);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            const { fieldErrors, formError } = getApiFieldErrors(error);
            let appliedFieldErrors = false;

            Object.entries(fieldErrors).forEach(([field, message]) => {
                if (field === "email" || field === "password") {
                    setError(field, {
                        type: "server",
                        message,
                    });
                    appliedFieldErrors = true;
                }
            });

            if (formError) {
                setSubmitError(formError);
                return;
            }

            if (!appliedFieldErrors) {
                setSubmitError(
                    getApiErrorMessage(
                        error,
                        "We couldn't sign you in. Please check your credentials and try again."
                    )
                );
            }
        }
    });

    return {
        ...form,
        handleSubmit: onSubmit,
        isSubmitting: formState.isSubmitting,
        submitError,
    };
}
