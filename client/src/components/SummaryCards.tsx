import type { DashboardData } from "../types";

type SummaryCardsProps = {
  dashboard: DashboardData | null;
};

export function SummaryCards({ dashboard }: SummaryCardsProps) {
  const cards = [
    {
      label: "Active team",
      value: dashboard?.activeEmployees ?? 0,
      badge: "TM",
      detail: "Employees available"
    },
    {
      label: "Scheduled shifts",
      value: dashboard?.scheduledShifts ?? 0,
      badge: "SH",
      detail: `${dashboard?.scheduledStaff ?? 0} unique employees`
    },
    {
      label: "Labour hours",
      value: `${(dashboard?.totalHours ?? 0).toFixed(1)}h`,
      badge: "HR",
      detail: "For selected date"
    },
    {
      label: "Estimated cost",
      value: `£${(dashboard?.estimatedLabourCost ?? 0).toFixed(2)}`,
      badge: "£",
      detail: "Based on hourly rates"
    }
  ];

  return (
    <section className="summary-grid" aria-label="Daily summary">
      {cards.map((card) => (
        <article className="summary-card" key={card.label}>
          <div className="summary-icon" aria-hidden="true">
            {card.badge}
          </div>
          <div>
            <p className="summary-label">{card.label}</p>
            <p className="summary-value">{card.value}</p>
            <p className="summary-detail">{card.detail}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
