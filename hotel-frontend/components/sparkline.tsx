import { createMemo } from "solid-js";

// ---------------------------------------------------------------------------
// Sparkline – lightweight inline SVG chart for trend visualization
// ---------------------------------------------------------------------------

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
}

export function Sparkline(props: SparklineProps) {
  const width = () => props.width ?? 120;
  const height = () => props.height ?? 32;
  const color = () => props.color ?? "var(--dls-accent)";
  const fillOpacity = () => props.fillOpacity ?? 0.1;

  const points = createMemo(() => {
    const d = props.data;
    if (!d.length) return [];
    const min = Math.min(...d);
    const max = Math.max(...d);
    const range = max - min || 1;
    const padding = 2;
    const w = width() - padding * 2;
    const h = height() - padding * 2;
    return d.map((v, i) => ({
      x: padding + (i / Math.max(d.length - 1, 1)) * w,
      y: padding + h - ((v - min) / range) * h,
    }));
  });

  const polylinePoints = createMemo(() =>
    points()
      .map((p) => `${p.x},${p.y}`)
      .join(" "),
  );

  const polygonPoints = createMemo(() => {
    const pts = points();
    if (pts.length < 2) return "";
    const h = height();
    const linePoints = pts.map((p) => `${p.x},${p.y}`).join(" ");
    const lastX = pts[pts.length - 1].x;
    const firstX = pts[0].x;
    return `${linePoints} ${lastX},${h} ${firstX},${h}`;
  });

  const lastPoint = createMemo(() => {
    const pts = points();
    return pts.length ? pts[pts.length - 1] : null;
  });

  return (
    <svg
      width={width()}
      height={height()}
      viewBox={`0 0 ${width()} ${height()}`}
      class="block"
      aria-hidden="true"
    >
      {points().length >= 2 && (
        <>
          {/* Area fill */}
          <polygon
            points={polygonPoints()}
            fill={color()}
            opacity={fillOpacity()}
          />
          {/* Line */}
          <polyline
            points={polylinePoints()}
            fill="none"
            stroke={color()}
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          {/* Last-point indicator */}
          {lastPoint() && (
            <circle
              cx={lastPoint()!.x}
              cy={lastPoint()!.y}
              r={2}
              fill={color()}
            />
          )}
        </>
      )}
    </svg>
  );
}

export default Sparkline;
