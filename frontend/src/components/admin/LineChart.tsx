import { cn } from "@/lib/cn";

export type Series = {
  label: string;
  color: string;
  fill?: string;
  points: number[];
};

/**
 * Inline SVG line/area chart. Values are normalised against the largest point
 * across all series, so the caller only supplies raw numbers.
 */
export function LineChart({
  series,
  labels,
  yTicks,
  className,
  height = 260,
}: {
  series: Series[];
  labels: string[];
  yTicks?: string[];
  className?: string;
  height?: number;
}) {
  const W = 600;
  const H = 220;
  const max = Math.max(...series.flatMap((s) => s.points), 1);
  const stepX = W / Math.max(labels.length - 1, 1);

  const coords = (points: number[]) =>
    points.map((p, i) => [i * stepX, H - (p / max) * H] as const);

  const toPath = (pts: ReadonlyArray<readonly [number, number]>) =>
    pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <div className="flex gap-3" style={{ height }}>
        {yTicks && (
          <div className="flex flex-col justify-between py-1 text-[10px] leading-4 text-muted">
            {yTicks.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}

        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-full flex-1"
          role="img"
          aria-label={series.map((s) => s.label).join(", ")}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={0}
              x2={W}
              y1={H * f}
              y2={H * f}
              stroke="var(--color-surface-tint)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {series.map((s) => {
            const pts = coords(s.points);
            return (
              <g key={s.label}>
                {s.fill && (
                  <path
                    d={`${toPath(pts)} L${W},${H} L0,${H} Z`}
                    fill={s.fill}
                    stroke="none"
                  />
                )}
                <path
                  d={toPath(pts)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between pl-8 text-xs leading-4 text-body">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>

      <figcaption className="flex justify-center gap-6 text-xs leading-4 text-body">
        {series.map((s) => (
          <span key={s.label} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
