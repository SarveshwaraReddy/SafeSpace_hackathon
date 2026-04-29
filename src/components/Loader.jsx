import { Loader2 } from 'lucide-react';

export default function Loader({ size = 'default', text = 'Loading...' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 p-8">
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
      {text && <p className="text-slate-400 text-sm font-medium animate-pulse">{text}</p>}
    </div>
  );
}
