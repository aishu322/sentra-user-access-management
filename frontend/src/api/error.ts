import axios from "axios";

type ApiErrorPayload = {
    message?: unknown;
    detail?: unknown;
    errors?: unknown;
};

function firstString(value: unknown) {
    if (typeof value === "string" && value) {
        return value;
    }

    if (Array.isArray(value)) {
        const match = value.find((item) => typeof item === "string" && item);

        if (typeof match === "string") {
            return match;
        }
    }

    return null;
}

export function getApiErrorMessage(
    error: unknown,
    fallback = "Something went wrong. Please try again."
) {
    if (axios.isAxiosError(error)) {
        const payload = error.response?.data as ApiErrorPayload | undefined;

        if (typeof payload?.message === "string" && payload.message) {
            return payload.message;
        }

        if (typeof payload?.detail === "string" && payload.detail) {
            return payload.detail;
        }

        if (typeof payload?.errors === "string" && payload.errors) {
            return payload.errors;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}

export function getApiFieldErrors(error: unknown) {
    const fieldErrors: Record<string, string> = {};
    let formError: string | null = null;

    if (!axios.isAxiosError(error)) {
        return {
            fieldErrors,
            formError,
        };
    }

    const payload = error.response?.data as ApiErrorPayload | undefined;
    const errors = payload?.errors;

    if (!errors || typeof errors !== "object" || Array.isArray(errors)) {
        const message = firstString(payload?.detail) ?? firstString(errors);

        return {
            fieldErrors,
            formError: message,
        };
    }

    Object.entries(errors as Record<string, unknown>).forEach(
        ([key, value]) => {
            const message = firstString(value);

            if (!message) {
                return;
            }

            if (key === "detail" || key === "non_field_errors") {
                formError = formError ?? message;
                return;
            }

            fieldErrors[key] = message;
        }
    );

    if (!formError) {
        formError =
            firstString(payload?.detail) ??
            firstString(payload?.message) ??
            firstString(errors) ??
            null;
    }

    return {
        fieldErrors,
        formError,
    };
}
