import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { register as registerRequest } from "../../../api/auth";
import {
    getApiErrorMessage,
    getApiFieldErrors,
} from "../../../api/error";

const registerSchema = z
    .object({
        full_name: z
            .string()
            .min(2, "Full name is required."),

        email: z
            .string()
            .email("Enter a valid email."),

        password: z
            .string()
            .min(
                8,
                "Password must be at least 8 characters."
            ),

        confirm_password: z.string(),
    })
    .refine(
        (data) =>
            data.password ===
            data.confirm_password,
        {
            path: ["confirm_password"],
            message: "Passwords do not match.",
        }
    );

export type RegisterFormValues = z.infer<
    typeof registerSchema
>;

type RegisterFieldName = keyof RegisterFormValues;

function isRegisterFieldName(field: string): field is RegisterFieldName {
    return (
        field === "email" ||
        field === "password" ||
        field === "full_name" ||
        field === "confirm_password"
    );
}

export function useRegisterForm() {
    const navigate = useNavigate();

    const [submitError, setSubmitError] =
        useState<string | null>(null);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),

        defaultValues: {
            full_name: "",
            email: "",
            password: "",
            confirm_password: "",
        },
    });

    const {
        clearErrors,
        setError,
        handleSubmit,
        formState,
    } = form;

    const onSubmit = handleSubmit(
        async (values) => {
            setSubmitError(null);

            clearErrors();

            try {
                await registerRequest(values);

                navigate("/login", {
                    replace: true,
                });

            } catch (error) {

                const {
                    fieldErrors,
                    formError,
                } = getApiFieldErrors(error);

                Object.entries(fieldErrors).forEach(([field, message]) => {
                    if (isRegisterFieldName(field)) {
                        setError(field, {
                            type: "server",
                            message,
                        });
                    }
                });

                if (formError) {
                    setSubmitError(formError);
                    return;
                }

                setSubmitError(
                    getApiErrorMessage(
                        error,
                        "Unable to create account."
                    )
                );
            }
        }
    );

    return {
        ...form,
        handleSubmit: onSubmit,
        isSubmitting:
            formState.isSubmitting,
        submitError,
    };
}
