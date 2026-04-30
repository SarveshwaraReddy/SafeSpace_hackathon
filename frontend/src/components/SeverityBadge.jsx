import { AlertCircle, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function SeverityBadge({ severity, className }) {
  const styles = {
    critical: 'bg-red-500/10 text-red-500 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  const currentStyle = styles[severity?.toLowerCase()] || styles.low;

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border uppercase tracking-wider',
      currentStyle,
      className
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {severity}
    </span>
  );
}
