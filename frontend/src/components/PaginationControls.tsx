type PaginationControlsProps = {
    page: number;
    pageCount: number;
    onPrevious: () => void;
    onNext: () => void;
    isPreviousDisabled?: boolean;
    isNextDisabled?: boolean;
};

export default function PaginationControls({
    page,
    pageCount,
    onPrevious,
    onNext,
    isPreviousDisabled,
    isNextDisabled,
}: PaginationControlsProps) {
    return (
        <div className="admin-pagination">
            <div className="admin-pagination__summary">
                <span>{`Page ${page} of ${pageCount}`}</span>
            </div>
            <div className="admin-pagination__controls">
                <button
                    type="button"
                    className="admin-button"
                    onClick={onPrevious}
                    disabled={isPreviousDisabled}
                >
                    ← Prev
                </button>
                <strong className="admin-pagination__page">{page}/{pageCount}</strong>
                <button
                    type="button"
                    className="admin-button"
                    onClick={onNext}
                    disabled={isNextDisabled}
                >
                    Next →
                </button>
            </div>
        </div>
    );
}

