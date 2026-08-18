import { useEffect, useState, useMemo } from "react";
import { getVendor, getShipmentRequests, updateShipmentRequest } from "../services/api";
import { supabase } from "../config/supabase";
import VendorSidebar from "../components/VendorSidebar";
import VendorHeader from "../components/VendorHeader";
import StatCard from "../components/StatCard";
import VendorOrderModal from "../components/VendorOrderModal";
import { Activity, FileText, CheckCircle, Clock, PackageCheck, List } from "lucide-react";

export default function VendorDashboard({ session, profile }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [vendor, setVendor] = useState(null);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!profile?.vendor_id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [vendorData, requestsData] = await Promise.all([
          getVendor(profile.vendor_id),
          getShipmentRequests()
        ]);
        setVendor(vendorData);
        setRequests(requestsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('vendor-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipment_requests',
          filter: `vendor_id=eq.${profile.vendor_id}`
        },
        async (payload) => {
          // Simplest approach: refetch on any change to guarantee populated relations
          try {
            const freshData = await getShipmentRequests();
            setRequests(freshData);
          } catch (e) {
            console.error("Failed to fetch fresh requests:", e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profile?.vendor_id]);

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'REQUESTED').length;
    const accepted = requests.filter(r => r.status === 'ACKNOWLEDGED').length;
    const completed = requests.filter(r => r.status === 'DELIVERED').length;
    return { total, pending, accepted, completed };
  }, [requests]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateShipmentRequest(id, { status: newStatus });
      // Realtime will update the list automatically
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Initializing Vendor Portal...</p>
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
      <VendorOrderModal 
        request={selectedRequest} 
        onClose={() => setSelectedRequest(null)} 
      />
      <VendorSidebar activeTab={activeView} onTabChange={setActiveView} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <VendorHeader vendorName={vendor?.name} />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {activeView === 'dashboard' && (
            <>
              <section className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Vendor Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Requests" value={stats.total} icon={List} description="All time requests" />
                  <StatCard title="Pending Requests" value={stats.pending} icon={Clock} description="Awaiting acknowledgment" />
                  <StatCard title="Accepted Orders" value={stats.accepted} icon={CheckCircle} description="Being processed" />
                  <StatCard title="Completed Orders" value={stats.completed} icon={PackageCheck} description="Successfully delivered" />
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-white">
                  <h2 className="text-lg font-bold text-slate-900">Recent Incoming Requests</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Most recent orders from hospitals</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="px-6 py-4">Hospital</th>
                        <th className="px-6 py-4">Drug</th>
                        <th className="px-6 py-4">Qty</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requests.slice(0, 5).map(req => (
                        <tr 
                          key={req.id} 
                          onClick={() => setSelectedRequest(req)}
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{req.hospital_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{req.drug_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{req.requested_quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(req.requested_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {requests.length === 0 && (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500">No requests found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {activeView === 'requests' && (
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-white">
                <h2 className="text-lg font-bold text-slate-900">All Orders & Requests</h2>
                <p className="text-sm text-slate-500 mt-0.5">Manage and update shipment requests</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="px-6 py-4">Hospital</th>
                      <th className="px-6 py-4">Drug</th>
                      <th className="px-6 py-4">Qty</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map(req => (
                      <tr 
                        key={req.id} 
                        onClick={() => setSelectedRequest(req)}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{req.hospital_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{req.drug_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{req.requested_quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(req.requested_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {req.status === 'REQUESTED' && (
                            <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(req.id, 'ACKNOWLEDGED'); }} className="text-blue-600 hover:text-blue-900 mr-3">Acknowledge</button>
                          )}
                          {req.status === 'ACKNOWLEDGED' && (
                            <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(req.id, 'SHIPPED'); }} className="text-blue-600 hover:text-blue-900 mr-3">Ship</button>
                          )}
                          {req.status === 'SHIPPED' && (
                            <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(req.id, 'DELIVERED'); }} className="text-blue-600 hover:text-blue-900 mr-3">Deliver</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-500">No requests found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
