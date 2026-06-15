type TimelinePhase = {
  label: string;
  date: string;
};

type PropertyConstructionTimelineProps = {
  activePhase?: 0 | 1 | 2 | 3;
  phases?: TimelinePhase[];
};

const defaultPhases: TimelinePhase[] = [
  { label: "Planning", date: "Q1 2026" },
  { label: "Foundation", date: "Q2 2026" },
  { label: "Structure", date: "Q4 2026" },
  { label: "Handover", date: "Q2 2027" },
];

export function PropertyConstructionTimeline({
  activePhase = 1,
  phases = defaultPhases,
}: PropertyConstructionTimelineProps) {
  return (
    <div className="construction-timeline-section">
      <p className="eyebrow">Development timeline</p>
      <div className="construction-timeline">
        <div className="construction-timeline-track" aria-hidden="true" />
        {phases.map((phase, i) => {
          const isDone = i < activePhase;
          const isActive = i === activePhase;
          const modifierClass = isDone
            ? " construction-timeline-step-done"
            : isActive
              ? " construction-timeline-step-active"
              : "";
          return (
            <div key={phase.label} className={`construction-timeline-step${modifierClass}`}>
              <div className="construction-timeline-node" />
              <span className="construction-timeline-label">{phase.label}</span>
              <span className="construction-timeline-date">{phase.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
