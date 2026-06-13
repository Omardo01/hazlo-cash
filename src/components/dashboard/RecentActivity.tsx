const activities = [
  {
    id: 1,
    name: "Carlos R.",
    business: "Tacos El Güero",
    time: "Hace 12 min",
    amount: "+$15.00",
    status: "completado" as const,
    initials: "CR",
    bg: "bg-brand-teal/10 text-brand-teal",
  },
  {
    id: 2,
    name: "María L.",
    business: "Estética Luna",
    time: "Hace 2 hrs",
    amount: "+$25.00",
    status: "pendiente" as const,
    initials: "ML",
    bg: "bg-[#FE7801]/10 text-[#FE7801]",
  },
  {
    id: 3,
    name: "Jorge P.",
    business: "Plomería Express",
    time: "Hace 5 hrs",
    amount: "+$45.00",
    status: "completado" as const,
    initials: "JP",
    bg: "bg-brand-orange/10 text-brand-orange",
  },
  {
    id: 4,
    name: "Ana G.",
    business: "Tacos El Güero",
    time: "Ayer",
    amount: "+$15.00",
    status: "completado" as const,
    initials: "AG",
    bg: "bg-violet-100 text-violet-600",
  },
];

const statusConfig = {
  completado: {
    label: "Cobrado",
    className: "bg-brand-teal/10 text-brand-teal",
  },
  pendiente: {
    label: "Pendiente",
    className: "bg-brand-orange/10 text-brand-orange",
  },
};

export function RecentActivity() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h3 className="text-sm font-semibold mb-4">Actividad reciente</h3>

      <div className="space-y-1">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-secondary/60"
          >
            {/* Avatar */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${activity.bg}`}
            >
              {activity.initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{activity.name}</p>
              <p className="text-[12px] text-muted-foreground truncate">
                {activity.business} · {activity.time}
              </p>
            </div>

            {/* Status + Amount */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusConfig[activity.status].className}`}
              >
                {statusConfig[activity.status].label}
              </span>
              <span className="text-sm font-semibold text-brand-teal tabular-nums">
                {activity.amount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
