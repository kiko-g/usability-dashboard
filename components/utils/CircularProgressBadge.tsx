type Props = {
  progress: number;
};

export default function CircularProgressBadge({ progress }: Props) {
  const diameter = 50;
  const strokeWidth = 5;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative h-12 w-12">
      <svg viewBox={`0 0 ${diameter} ${diameter}`} xmlns="http://www.w3.org/2000/svg">
        <circle
          fill="none"
          stroke="currentColor"
          className="text-blue-600 opacity-20"
          r={radius}
          cx={diameter / 2}
          cy={diameter / 2}
          strokeWidth={strokeWidth}
        />
        <circle
          fill="none"
          className="origin-center -rotate-90 transform stroke-current text-blue-600"
          r={radius}
          cx={diameter / 2}
          cy={diameter / 2}
          strokeWidth={strokeWidth}
          strokeDashoffset={offset}
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center">
        <span className="text-xs lg:text-sm">{`${progress.toFixed(0)}`}</span>
      </div>
    </div>
  );
}
