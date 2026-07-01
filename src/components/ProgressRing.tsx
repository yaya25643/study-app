export default function ProgressRing({ percent }: { percent: number }) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle
        cx={70}
        cy={70}
        r={radius}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={14}
      />
      <circle
        cx={70}
        cy={70}
        r={radius}
        fill="none"
        stroke="#2563eb"
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
      />
      <text
        x={70}
        y={70}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={28}
        fontWeight={700}
        fill="#1e293b"
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}
