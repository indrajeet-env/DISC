import { LayoutDashboard, Package, Truck, BellRing } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">DC</span>
          </div>
          DrugChain
        </h1>
        <p className="text-slate-400 text-xs mt-2 uppercase tracking-wider font-semibold">Supply Chain Intelligence</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg font-medium transition-colors">
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
          <Package className="w-5 h-5" />
          Inventory
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
          <Truck className="w-5 h-5" />
          Shipments
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
          <BellRing className="w-5 h-5" />
          Alerts
        </a>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-lg">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="text-xs font-medium text-slate-300">System Operational</span>
        </div>
      </div>
    </aside>
  );
}
