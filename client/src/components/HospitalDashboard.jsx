import { useEffect, useState, useMemo } from "react";
import { getDashboard, getAlerts } from "../services/api";
import Sidebar from "./Sidebar";
import Header from "./Header";
import StatCard from "./StatCard";
import InventoryRiskTable from "./InventoryRiskTable";
import ShipmentTable from "./ShipmentTable";
import { DrugStatusChart, ShipmentStatusChart } from "./Charts";
import {
  Activity,
  Pill,
  Package,
  Truck,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import Inventory from "../pages/Inventory";
import Shipments from "../pages/Shipments";
import Alerts from "../pages/Alerts";
import ProcurementAssistant from "./ProcurementAssistant";
import AlertPopup from "./AlertPopup";
import { supabase } from "../config/supabase";

export default function HospitalDashboard({ session, profile }) {
  const [activeView, setActiveView] = useState("dashboard");
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
      .channel("hospital-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shipments" },
        () => {
          loadDashboard();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shipment_requests" },
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

    score -= dashboard.summary.criticalDrugs * 10;
    score -=
      (dashboard.summary.lowStockDrugs -
        dashboard.summary.criticalDrugs) *
      5;
    score -= dashboard.summary.delayedShipments * 5;

    const tempViolations =
      dashboard.alerts?.filter(
        (a) => a.type === "COLD_CHAIN_VIOLATION"
      ).length || 0;

    score -= tempViolations * 15;

    return Math.max(0, score);
  }, [dashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Initializing Command Center...
        </p>
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

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Connection Error
          </h2>

          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AlertPopup alerts={alerts} />

      <Sidebar
        activeTab={activeView}
        onTabChange={setActiveView}
        alertCount={
          alerts.filter(
            (a) =>
              a.severity === "CRITICAL" ||
              a.severity === "WARNING"
          ).length
        }
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {activeView === "inventory" ? (
          <Inventory />
        ) : activeView === "shipments" ? (
          <Shipments />
        ) : activeView === "alerts" ? (
          <Alerts alerts={alerts} />
        ) : (
          <main className="flex-1 p-6 sm:p-8 overflow-y-auto">

            {/* =====================================================
                SECTION 1 - SUPPLY CHAIN OVERVIEW
            ====================================================== */}

            <section className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Supply Chain Overview
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">

                {/* Total Drugs */}
                <div className="h-full [&>*]:h-full">
                  <StatCard
                    title="Total Drugs"
                    value={dashboard.summary.totalDrugs}
                    icon={Pill}
                    description="Managed inventory items"
                  />
                </div>

                {/* Critical Stock */}
                <div className="h-full [&>*]:h-full">
                  <StatCard
                    title="Critical Stock"
                    value={dashboard.summary.criticalDrugs}
                    icon={Package}
                    description="Drugs below minimum threshold"
                  />
                </div>

                {/* Active Shipments */}
                <div className="h-full [&>*]:h-full">
                  <StatCard
                    title="Active Shipments"
                    value={dashboard.summary.activeShipments}
                    icon={Truck}
                    description="In transit deliveries"
                  />
                </div>

                {/* Active Exceptions */}
                <div className="h-full">
                  <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                          Active Exceptions
                        </p>

                        <p className="mt-4 text-5xl leading-none font-bold tracking-tight text-red-600">
                          {dashboard.summary.totalExceptions}
                        </p>
                      </div>

                      <div className="shrink-0 w-16 h-16 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <AlertTriangle className="w-7 h-7" />
                      </div>

                    </div>

                    <p className="mt-auto pt-8 text-sm leading-6 text-slate-500">
                      Alerts requiring attention
                    </p>

                  </div>
                </div>

              </div>
            </section>


            {/* =====================================================
                SECTION 2 - SUPPLY CHAIN HEALTH
            ====================================================== */}
            <section className="mb-8">

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

                {/* Supply Chain Health */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[300px]">

                  <div className="flex items-center gap-3 mb-6">

                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <ShieldCheck className="w-5 h-5" />
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">
                      Supply Chain Health
                    </h2>

                  </div>

                  <div className="flex items-end gap-4 mb-4">
                    <span className="text-6xl font-bold text-slate-900 tracking-tighter">
                      80
                    </span>

                    <span className="text-xl font-medium text-slate-400 mb-1.5">
                      / 100
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden">
                    <div
                    className="h-3 rounded-full transition-all duration-1000 bg-emerald-500"
                    style={{ width: "81%" }}
                  ></div>
                  </div>

                  <p className="mt-auto text-sm text-slate-500 font-medium leading-6">
                    {healthScore > 80
                      ? "Optimal operations"
                      : healthScore > 50
                      ? "Warning: Operating with degraded efficiency"
                      : "Critical: Immediate attention required"}
                  </p>

                </section>


                {/* Inventory Status + Shipment Status */}
                <section className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Inventory Status */}
                  <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[300px]">

                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
                      Inventory Status
                    </h2>

                    <div className="flex-1 min-h-0 flex items-center justify-center">
                      <DrugStatusChart
                        inventory={dashboard.inventory || []}
                      />
                    </div>

                  </section>


                  {/* Shipment Status */}
                  <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[300px]">

                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
                      Shipment Status
                    </h2>

                    <div className="flex-1 min-h-0 flex items-center justify-center">
                      <ShipmentStatusChart
                        shipments={dashboard.shipments || []}
                      />
                    </div>

                  </section>

                </section>

              </div>
            </section>


            {/* =====================================================
                SECTION 3 - INVENTORY RISK
            ====================================================== */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8 w-full">

              <div className="px-6 py-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Inventory Risk
                  </h2>

                  <p className="text-sm text-slate-500 mt-0.5">
                    Current drug availability and stock health
                  </p>
                </div>

                <button className="self-start sm:self-auto text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                  View All
                </button>

              </div>

              <div className="w-full overflow-x-auto">
                <InventoryRiskTable
                  drugs={dashboard.inventory}
                />
              </div>

            </section>


            {/* =====================================================
                SECTION 4 - SHIPMENT MONITORING
            ====================================================== */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">

              <div className="px-6 py-5 border-b border-slate-200 bg-white">

                <h2 className="text-lg font-bold text-slate-900">
                  Shipment Monitoring
                </h2>

                <p className="text-sm text-slate-500 mt-0.5">
                  Track incoming drug deliveries
                </p>

              </div>

              <ShipmentTable
                shipments={dashboard.shipments}
              />

            </section>

          </main>
        )}
      </div>

      <ProcurementAssistant />
    </div>
  );
}