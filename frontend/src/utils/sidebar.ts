export type SidebarUser = {
    name: string;
    role: string;
    avatarLabel: string;
};

export function buildSidebarUser(
    fullName: string | null | undefined,
    email: string | null | undefined,
    role: string
): SidebarUser {
    const resolvedName = fullName?.trim() || email?.trim() || "Loading";

    const initials =
        resolvedName
            .split(" ")
            .map((part) => part.trim())
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "L";

    return {
        name: resolvedName,
        role,
        avatarLabel: initials,
    };
}

