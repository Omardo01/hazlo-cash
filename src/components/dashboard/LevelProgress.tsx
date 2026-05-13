import { StarIcon, TrophyIcon } from "lucide-react";

export function LevelProgress() {
  const currentLevel = "Bronce";
  const nextLevel = "Plata";
  const currentReferrals = 12;
  const requiredReferrals = 25;
  const progress = (currentReferrals / requiredReferrals) * 100;

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <TrophyIcon className="h-4 w-4 text-brand-orange" />
        <h3 className="text-sm font-semibold">Tu nivel</h3>
      </div>

      {/* Level */}
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-2xl font-black text-brand-purple">{currentLevel}</span>
        <span className="text-sm text-muted-foreground">→ {nextLevel}</span>
      </div>

      {/* Progress bar */}
      <div className="mb-1.5">
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--brand-purple), #6366F1)",
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] mt-1.5">
          <span className="text-muted-foreground">
            {currentReferrals}/{requiredReferrals} referidos
          </span>
          <span className="font-semibold text-brand-purple">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Tier pills — neumorphic active */}
      <div className="mt-4 flex gap-2">
        {[
          { level: "Bronce", active: true, commission: "3%" },
          { level: "Plata", active: false, commission: "5%" },
          { level: "Oro", active: false, commission: "8%" },
        ].map((tier) => (
          <div
            key={tier.level}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-center transition-all ${
              tier.active
                ? "bg-brand-purple text-white"
                : "bg-secondary text-muted-foreground"
            }`}
            style={tier.active ? { boxShadow: "0 3px 12px rgba(45, 43, 143, 0.25)" } : {}}
          >
            <StarIcon
              className={`h-3.5 w-3.5 ${tier.active ? "fill-white/30" : ""}`}
            />
            <span className="text-[11px] font-bold">{tier.level}</span>
            <span className={`text-[10px] ${tier.active ? "text-white/60" : ""}`}>
              {tier.commission}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
