interface ComponentCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title = null,
  children,
  className = '',
  desc = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      {title && (
        <div className="px-8 py-2">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">{title}</h3>
          {desc && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{desc}</p>}
        </div>
      )}

      {/* Card Body */}
      <div className="border-t border-gray-100 p-4 sm:px-6 sm:py-4 dark:border-gray-800">
        <div className="space-y-2">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
