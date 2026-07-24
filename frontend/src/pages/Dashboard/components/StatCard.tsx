import type { DashboardStatCard } from "../dashboard.types";

type StatCardProps = DashboardStatCard;

export default function StatCard({
    label,
    value,
    accent,
}: StatCardProps) {
    return (
        <article className="stat-card">
            <span className="stat-card__label">
                {label}
            </span>

            <span
                className={`stat-card__value stat-card__value--${accent}`}
            >
                {value}
            </span>
        </article>
    );
}