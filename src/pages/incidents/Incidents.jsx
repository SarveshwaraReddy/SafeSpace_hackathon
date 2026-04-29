import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import IncidentList from '../../components/IncidentList';

export default function Incidents() {
  const [searchTerm, setSearchTerm] = useState('');

  const dummyIncidents = [
    { id: '1', displayId: 'INC-4829', title: 'Auth Service Latency Spike (US-EAST-1)', service: 'IAM-Manager', severity: 'Critical', status: 'Investigating', lastUpdated: new Date(Date.now() - 2 * 60000).toISOString() },
    { id: '2', displayId: 'INC-4830', title: 'Database Read Replica Timeout', service: 'RDS-Core', severity: 'High', status: 'Open', lastUpdated: new Date(Date.now() - 14 * 60000).toISOString() },
    { id: '3', displayId: 'INC-4827', title: 'Failed Webhook Deliveries: Shopify', service: 'API-Gateway', severity: 'Medium', status: 'Investigating', lastUpdated: new Date(Date.now() - 60 * 60000).toISOString() },
    { id: '4', displayId: 'INC-4821', title: 'Asset CDN propagation delay', service: 'Cloudfront-Edge', severity: 'Low', status: 'Resolved', lastUpdated: new Date(Date.now() - 180 * 60000).toISOString() },
    { id: '5', displayId: 'INC-4818', title: 'Major Outage: Core Payment Processor', service: 'Checkout-Service', severity: 'Critical', status: 'Resolved', lastUpdated: new Date(Date.now() - 360 * 60000).toISOString() },
  ];

  return (
    <div className="p-8 pb-20 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Incidents</h1>
          <p className="text-slate-400">Manage and monitor all active and historical incidents.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <Plus size={18} />
          Create Incident
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 mb-8 flex flex-wrap gap-4 backdrop-blur-md">
        <div className="flex-1 min-w-[300px] relative">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by incident ID or title..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
          <Search className="absolute left-3 top-3 text-slate-500" size={18} />
        </div>
        
        <div className="flex gap-4">
          <select className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-300 focus:outline-none focus:border-cyan-500 appearance-none min-w-[140px]">
            <option>Severity: All</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-300 focus:outline-none focus:border-cyan-500 appearance-none min-w-[140px]">
            <option>Status: All</option>
            <option>Open</option>
            <option>Investigating</option>
            <option>Resolved</option>
          </select>
          <button className="px-4 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-2 backdrop-blur-sm">
        {/* Header row */}
        <div className="flex items-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
           <div className="flex-1">Incident Title</div>
           <div className="w-24 text-center">Severity</div>
           <div className="w-32 text-center">Status</div>
           <div className="w-32 text-right">Last Updated</div>
           <div className="w-16"></div>
        </div>
        
        <IncidentList incidents={dummyIncidents} />
      </div>
    </div>
  );
}
