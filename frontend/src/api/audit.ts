import api from "./axios";
import type { PaginatedResponse } from "./pagination";

export type AuditLogItem = {
    id: number;
    user: string;
    action: string;
    description: string;
    user_agent?: string;
    created_at: string;
};

export type AuditQueryParams = {
    page?: number;
    pageSize?: number;
    action?: string;
    search?: string;
    ordering?: string;
};

function normalizeAuditResponse(response: PaginatedResponse<AuditLogItem> | AuditLogItem[]) {
    if (Array.isArray(response)) {
        return {
            count: response.length,
            next: null,
            previous: null,
            results: response,
        };
    }

    return {
        count: response.count,
        next: response.next,
        previous: response.previous,
        results: response.results ?? [],
    };
}

export async function listAuditLogs(params: AuditQueryParams = {}) {
    const response = await api.get<PaginatedResponse<AuditLogItem> | AuditLogItem[]>("/audit/", {
        params: {
            page: params.page,
            page_size: params.pageSize,
            action: params.action,
            search: params.search,
            ordering: params.ordering,
        },
    });

    return normalizeAuditResponse(response.data);
}

export async function getAuditLog(auditLogId: number) {
    const response = await api.get<AuditLogItem>(`/audit/${auditLogId}/`);

    return response.data;
}
