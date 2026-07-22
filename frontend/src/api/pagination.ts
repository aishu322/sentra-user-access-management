export type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export type ListQueryParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    ordering?: string;
};

