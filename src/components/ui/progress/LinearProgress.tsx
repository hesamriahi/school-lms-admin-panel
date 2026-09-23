type LinearProgressProps = {
  value: number; // 0–100
  max?: number;
  title?: string;
  showProgressLabel?: boolean; // مقدار درصد در گوشهٔ بالا؛ پیش‌فرض true
  className?: string;
  trackClassName?: string;
  barClassName?: string;
};

export default function LinearProgress({
  value,
  max = 100,
  title,
  showProgressLabel = true,
  className = "",
  trackClassName = "",
  barClassName = "",
}: LinearProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const percentLabel = `${Math.round(percent)} %`;

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-1.5 flex w-full items-center justify-between gap-2">
        {showProgressLabel && (
          <span
            className="order-1 text-sm text-gray-600 dark:text-gray-400 rtl:order-2"
            aria-hidden
          >
            {percentLabel}
          </span>
        )}
        {title && (
          <span className="order-2 ms-auto text-sm font-medium text-gray-800 dark:text-gray-200 rtl:order-1 rtl:ms-0">
            {title}
          </span>
        )}
      </div>
      <div
        className={`h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${trackClassName}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`h-full rounded-full bg-brand-500 transition-[width] duration-300 ease-out dark:bg-brand-400 ${barClassName}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
