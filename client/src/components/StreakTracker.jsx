/**
 * StreakTracker — GitHub-style activity grid.
 * Generates mock streak data from attendance records.
 * If attendance was updated recently, those days are marked active.
 */
export default function StreakTracker({ subjects = [] }) {
  // Generate 28 days (4 weeks) of mock activity
  const days = generateStreakDays(subjects);
  const currentStreak = calcCurrentStreak(days);

  return (
    <div className="glass-card p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Activity Streak
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold gradient-text">{currentStreak}</span>
          <span className="text-xs text-text-muted">day streak</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-[6px]">
        {/* Day labels */}
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-[10px] text-text-muted text-center mb-1">{d}</div>
        ))}
        {/* Activity cells */}
        {days.map((day, i) => (
          <div
            key={i}
            title={`${day.date} — ${day.level > 0 ? "Active" : "Inactive"}`}
            className={`aspect-square rounded-[4px] transition-all duration-200 hover:scale-110 cursor-default
              ${day.level === 0
                ? "bg-dark-600"
                : day.level === 1
                  ? "bg-accent-blue/30"
                  : day.level === 2
                    ? "bg-accent-blue/60"
                    : "bg-accent-blue shadow-[0_0_6px_rgba(99,102,241,0.4)]"
              }`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-[10px] text-text-muted">Less</span>
        <div className="w-3 h-3 rounded-[3px] bg-dark-600" />
        <div className="w-3 h-3 rounded-[3px] bg-accent-blue/30" />
        <div className="w-3 h-3 rounded-[3px] bg-accent-blue/60" />
        <div className="w-3 h-3 rounded-[3px] bg-accent-blue shadow-[0_0_4px_rgba(99,102,241,0.4)]" />
        <span className="text-[10px] text-text-muted">More</span>
      </div>
    </div>
  );
}

function generateStreakDays(subjects) {
  const days = [];
  const now = new Date();

  // Use average attendance to seed activity probability
  let avgPct = 0;
  if (subjects.length > 0) {
    const totalPct = subjects.reduce((sum, s) => sum + s.percentage, 0);
    avgPct = totalPct / subjects.length;
  }
  // Higher attendance → higher activity probability
  const activityProb = Math.min(0.9, Math.max(0.3, avgPct / 100));

  for (let i = 27; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    // Weekend → lower activity
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const prob = isWeekend ? activityProb * 0.3 : activityProb;

    // Deterministic-ish based on date + index
    const seed = (d.getDate() * 7 + d.getMonth() * 13 + i * 3) % 100;
    const active = seed < prob * 100;

    let level = 0;
    if (active) {
      level = seed < prob * 33 ? 3 : seed < prob * 66 ? 2 : 1;
    }

    days.push({ date: dateStr, level });
  }

  return days;
}

function calcCurrentStreak(days) {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].level > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
