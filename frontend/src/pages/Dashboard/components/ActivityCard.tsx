import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import ActivityBadge from "./ActivityBadge";

import type { DashboardActivity } from "../dashboard.types";

type ActivityCardProps = {
    title: string;
    viewAllHref: string;
    activities: DashboardActivity[];
};

function getBadgeTone(action: string) {
    switch (action) {
        case "LOGIN":
            return "green";

        case "LOGOUT":
            return "orange";

        case "CREATE_USER":
            return "blue";

        case "UPDATE_USER":
            return "purple";

        case "DELETE_USER":
            return "red";

        default:
            return "blue";
    }
}

export default function ActivityCard({
    title,
    viewAllHref,
    activities,
}: ActivityCardProps) {
    return (
        <section
            className="activity-card"
            aria-labelledby="recent-activity"
        >
            <header className="activity-card__header">
                <h2 id="recent-activity">
                    {title}
                </h2>

                <Link
                    className="activity-card__link"
                    to={viewAllHref}
                >
                    View audit log
                    <ArrowRight
                        size={16}
                        aria-hidden="true"
                    />
                </Link>
            </header>

            <div
                className="activity-list"
                role="list"
            >
                {activities.map((activity) => (
                    <article
                        key={activity.id}
                        className="activity-row"
                        role="listitem"
                    >
                        <span className="activity-row__timestamp">
                            {activity.timestamp}
                        </span>

                        <ActivityBadge
                            tone={getBadgeTone(activity.action)}
                        >
                            {activity.action}
                        </ActivityBadge>

                        <p className="activity-row__description">
                            <strong>{activity.actor}</strong>{" "}
                            {activity.description}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}