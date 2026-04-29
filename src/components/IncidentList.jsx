import IncidentCard from './IncidentCard';
import { AlertCircle } from 'lucide-react';

export default function IncidentList({ incidents }) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-700 rounded-xl bg-slate-800/20">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <AlertCircle className="text-slate-500" size={24} />
        </div>
        <h3 className="text-lg font-medium text-slate-300">No incidents found</h3>
        <p className="text-sm text-slate-500 mt-1">There are no incidents matching your current criteria.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {incidents.map((incident, idx) => (
        <IncidentCard key={incident.id} incident={incident} index={idx} />
      ))}
    </div>
  );
}
