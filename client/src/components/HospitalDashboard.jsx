import { useEffect, useState, useMemo } from "react";
import { getDashboard, getAlerts } from "../services/api";
import Sidebar from "./Sidebar";
import Header from "./Header";
import StatCard from "./StatCard";
import InventoryRiskTable from "./InventoryRiskTable";
import ShipmentTable from "./ShipmentTable";
import AlertCard from "./AlertCard";
import { DrugStatusChart, ShipmentStatusChart } from "./Charts";
import { Activity, Pill, Package, Truck, AlertTriangle, ShieldCheck } from "lucide-react";
import Inventory from "../pages/Inventory";
import Shipments from "../pages/Shipments";
import Alerts from "../pages/Alerts";
import ProcurementAssistant from "./ProcurementAssistant";
import AlertPopup from "./AlertPopup";
import { supabase } from "../config/supabase";

export default function HospitalDashboard({ session, profile }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session) return;
    
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await getDashboard();
        setDashboard(data);
        
        try {
          const alertsData = await getAlerts();
          setAlerts(alertsData);
        } catch (e) {
          console.error("Failed to load alerts:", e);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

    const subscription = supabase
      .channel('hospital-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        () => {
          loadDashboard();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shipment_requests' },
        () => {
          loadDashboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [session]);

  const healthScore = useMemo(() => {
    if (!dashboard) return 100;
    
    let score = 100;
    // Penalize based on summary metrics and alerts
    score -= (dashboard.summary.criticalDrugs * 10);
    score -= (dashboard.summary.lowStockDrugs - dashboard.summary.criticalDrugs) * 5;
    score -= (dashboard.summary.delayedShipments * 5);
    
    const tempViolations = dashboard.alerts?.filter(a => a.type === 'COLD_CHAIN_VIOLATION').length || 0;
    score -= (tempViolations * 15);
    
    return Math.max(0, score);
  }, [dashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Initializing Command Center...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 max-w-md text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AlertPopup alerts={alerts} />
      <Sidebar activeTab={activeView} onTabChange={setActiveView} alertCount={alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'WARNING').length} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {activeView === 'inventory' ? (
          <Inventory />
        ) : activeView === 'shipments' ? (
          <Shipments />
        ) : activeView === 'alerts' ? (
          <Alerts alerts={alerts} />
        ) : (
        <main className="flex-1 p-8 overflow-y-auto">
          {/* SECTION 1 - OVERVIEW CARDS */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Supply Chain Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Drugs" 
                value={dashboard.summary.totalDrugs} 
                icon={Pill} 
                description="Managed inventory items"
              />
              <StatCard 
                title="Critical Stock" 
                value={dashboard.summary.criticalDrugs} 
                icon={Package} 
                description="Drugs below minimum threshold"
              />
              <StatCard 
                title="Active Shipments" 
                value={dashboard.summary.activeShipments} 
                icon={Truck} 
                description="In transit deliveries"
              />
              <StatCard 
                title="Active Exceptions" 
                value={dashboard.summary.totalExceptions} 
                icon={AlertTriangle} 
                description="Alerts requiring attention"
              />
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              
              {/* SECTION 2 - HEALTH & CHARTS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Health Score */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Supply Chain Health</h2>
                  </div>
                  
                  <div className="flex items-end gap-4 mb-4">
                    <span className="text-6xl font-bold text-slate-900 tracking-tighter">{healthScore}</span>
                    <span className="text-xl font-medium text-slate-400 mb-1.5">/ 100</span>
                  </div>
                  
                  <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        healthScore > 80 ? 'bg-emerald-500' : healthScore > 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${healthScore}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-slate-500 font-medium">
                    {healthScore > 80 ? 'Optimal operations' : healthScore > 50 ? 'Warning: Operating with degraded efficiency' : 'Critical: Immediate attention required'}
                  </p>
                </section>

                {/* Charts */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Inventory Status</h2>
                  <div className="flex-1 flex items-center justify-center">
                    <DrugStatusChart inventory={dashboard.inventory || []} />
                  </div>
                </section>
              </div>

              {/* SECTION 3 - INVENTORY RISK */}
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Inventory Risk</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Current drug availability and stock health</p>
                  </div>
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                    View All
                  </button>
                </div>
                <InventoryRiskTable drugs={dashboard.inventory} />
              </section>

              {/* SECTION 4 - SHIPMENT MONITORING */}
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-white">
                  <h2 className="text-lg font-bold text-slate-900">Shipment Monitoring</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Track incoming drug deliveries</p>
                </div>
                <ShipmentTable shipments={dashboard.shipments} />
              </section>
            </div>

            {/* SECTION 5 - ALERTS SIDEBAR */}
            <div className="xl:col-span-1 space-y-6">
              
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Shipment Status</h2>
                  <div className="flex-1 flex items-center justify-center">
                    <ShipmentStatusChart shipments={dashboard.shipments || []} />
                  </div>
              </section>

              <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col sticky top-24 max-h-[calc(100vh-120px)]">
                <div className="px-6 py-5 border-b border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Active Exceptions</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Real-time alerts</p>
                  </div>
                  <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold border border-red-200">
                    {dashboard.alerts?.length || 0}
                  </span>
                </div>
                <div className="p-5 overflow-y-auto flex-1 bg-slate-50/50">
                  {!dashboard.alerts || dashboard.alerts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <p className="text-slate-900 font-medium">No active exceptions</p>
                      <p className="text-slate-500 text-sm mt-1">Supply chain is running smoothly.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {dashboard.alerts.map((alert, idx) => (
                        <AlertCard key={idx} alert={alert} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
            
          </div>
        </main>
        )}
      </div>
      <ProcurementAssistant />
    </div>
  );
}
