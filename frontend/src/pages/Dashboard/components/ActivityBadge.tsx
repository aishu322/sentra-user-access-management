import type { ReactNode } from "react";

import type { ActivityBadgeTone } from "../dashboard.types";

type ActivityBadgeProps = {
    tone: ActivityBadgeTone;
    children: ReactNode;
};

export default function ActivityBadge({
    tone,
    children,
}: ActivityBadgeProps) {
    return (
        <span className={`activity-badge activity-badge--${tone}`}>
            {children}
        </span>
    );
}
