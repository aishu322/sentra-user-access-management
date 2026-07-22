import { useEffect, type PropsWithChildren, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = PropsWithChildren<{
    open: boolean;
    title: string;
    onClose: () => void;
    footer?: ReactNode;
}>;

export default function Modal({
    open,
    title,
    onClose,
    footer,
    children,
}: ModalProps) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return createPortal(
        <div
            className="admin-dialog__overlay"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <section
                className="admin-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-dialog-title"
            >
                <header className="admin-dialog__header">
                    <h2 id="admin-dialog-title" className="admin-dialog__title">
                        {title}
                    </h2>
                    <button
                        type="button"
                        className="admin-button admin-button--ghost"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </header>
                <div className="admin-dialog__body">{children}</div>
                {footer ? <footer className="admin-form__actions">{footer}</footer> : null}
            </section>
        </div>,
        document.body
    );
}

