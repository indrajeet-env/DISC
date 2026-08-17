import { useState, useEffect, useMemo } from 'react';
import {
  getShipments,
  deleteShipment,
  getShipmentRequests,
  updateShipmentRequest,
} from '../services/api';
import { authService } from '../services/authService';
import {
  Package,
  Search,
  Plus,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Edit2,
  ClipboardList,
  XCircle,
} from 'lucide-react';
import ShipmentDetailModal from '../components/Shipments/ShipmentDetailModal';
import ShipmentFormModal from '../components/Shipments/ShipmentFormModal';
import ShipmentRequestFormModal from '../components/Shipments/ShipmentRequestFormModal';

const SHIPMENT_STATUSES = ['IN_TRANSIT', 'DELIVERED', 'DELAYED'];
const REQUEST_STATUSES = ['REQUESTED', 'ACKNOWLEDGED', 'REJECTED', 'CANCELLED'];

const getRequestStatusStyles = (status) => {
  switch (status) {
    case 'REQUESTED':
      return 'bg-blue-100 text-blue-700';
    case 'ACKNOWLEDGED':
      return 'bg-emerald-100 text-emerald-700';
    case 'REJECTED':
      return 'bg-red-100 text-red-700';
    case 'CANCELLED':
      return 'bg-slate-100 text-slate-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

export default function Shipments() {
  const [activeTab, setActiveTab] = useState('shipments');
  const [hospitalId, setHospitalId] = useState(null);

  const [shipments, setShipments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);

  useEffect(() => {
    authService.getSession().then(async (session) => {
      if (session?.user?.id) {
        try {
          const profile = await authService.getProfile(session.user.id);
          setHospitalId(profile.hospital_id);
        } catch {
          // Profile may be unavailable; request form will show an error
        }
      }
    });
  }, []);

  const fetchShipments = async () => {
    const data = await getShipments();
    setShipments(data.filter((s) => SHIPMENT_STATUSES.includes(s.status)));
  };

  const fetchRequests = async () => {
    const data = await getShipmentRequests();
    setRequests(data);
  };

  const fetchAll = async () => {
    setLoading(true);
    const errors = [];

    try {
      await fetchShipments();
    } catch (err) {
      errors.push(err.message || 'Unable to load shipments.');
    }

    try {
      await fetchRequests();
    } catch (err) {
      errors.push(err.message || 'Unable to load shipment requests.');
    }

    setError(errors.length === 2 ? errors.join(' ') : errors[0] || null);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const processedShipments = useMemo(() => {
    return shipments.map((shipment) => {
      let statusPriority = 3;
      if (shipment.status === 'DELAYED') statusPriority = 1;
      else if (shipment.status === 'IN_TRANSIT') statusPriority = 2;

      return { ...shipment, statusPriority };
    });
  }, [shipments]);

  const summary = useMemo(() => {
    let inTransit = 0,
      delivered = 0,
      delayed = 0;
    processedShipments.forEach((s) => {
      if (s.status === 'IN_TRANSIT') inTransit++;
      if (s.status === 'DELIVERED') delivered++;
      if (s.status === 'DELAYED') delayed++;
    });
    return { total: processedShipments.length, inTransit, delivered, delayed };
  }, [processedShipments]);

  const filteredShipments = useMemo(() => {
    let result = processedShipments.filter((s) => {
      const sTerm = search.toLowerCase();
      if (
        search &&
        !(
          s.drug_name.toLowerCase().includes(sTerm) ||
          s.vendor_name.toLowerCase().includes(sTerm)
        )
      )
        return false;

      if (statusFilter !== 'All' && s.status !== statusFilter.toUpperCase().replace(' ', '_'))
        return false;
      return true;
    });

    result.sort((a, b) => {
      if (a.statusPriority !== b.statusPriority) {
        return a.statusPriority - b.statusPriority;
      }
      return new Date(a.expected_delivery) - new Date(b.expected_delivery);
    });

    return result;
  }, [processedShipments, search, statusFilter]);

  const filteredRequests = useMemo(() => {
    let result = requests.filter((r) => {
      const sTerm = search.toLowerCase();
      if (
        search &&
        !(
          r.drug_name.toLowerCase().includes(sTerm) ||
          r.vendor_name.toLowerCase().includes(sTerm)
        )
      )
        return false;

      if (statusFilter !== 'All' && r.status !== statusFilter.toUpperCase()) return false;
      return true;
    });

    return result.sort(
      (a, b) => new Date(b.requested_at || b.created_at) - new Date(a.requested_at || a.created_at)
    );
  }, [requests, search, statusFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      try {
        await deleteShipment(id);
        fetchShipments();
        if (selectedShipment?.id === id) setSelectedShipment(null);
      } catch (err) {
        alert('Failed to delete shipment: ' + err.message);
      }
    }
  };

  const handleCancelRequest = async (id) => {
    if (window.confirm('Cancel this shipment request?')) {
      try {
        await updateShipmentRequest(id, { status: 'CANCELLED' });
        fetchRequests();
      } catch (err) {
        alert('Failed to cancel request: ' + err.message);
      }
    }
  };

  const openEditForm = (shipment) => {
    setEditingShipment(shipment);
    setIsEditOpen(true);
  };

  if (loading && shipments.length === 0 && requests.length === 0) {
    return (
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading shipments...</p>
      </main>
    );
  }

  if (error && shipments.length === 0 && requests.length === 0) {
    return (
      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600">{error}</p>
          <button
            onClick={fetchAll}
            className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shipments Tracking</h1>
          <p className="text-slate-500 mt-1">
            Monitor incoming deliveries and manage shipment requests.
          </p>
        </div>
        <button
          onClick={() => setIsRequestOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Request Shipment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Shipments</p>
            <h3 className="text-2xl font-bold text-slate-900">{summary.total}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">In Transit</p>
            <h3 className="text-2xl font-bold text-slate-900">{summary.inTransit}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Delayed</p>
            <h3 className="text-2xl font-bold text-slate-900">{summary.delayed}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Delivered</p>
            <h3 className="text-2xl font-bold text-slate-900">{summary.delivered}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 flex">
          <button
            onClick={() => {
              setActiveTab('shipments');
              setStatusFilter('All');
            }}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'shipments'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-4 h-4" />
            Actual Shipments
          </button>
          <button
            onClick={() => {
              setActiveTab('requests');
              setStatusFilter('All');
            }}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Shipment Requests
            {requests.filter((r) => r.status === 'REQUESTED').length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                {requests.filter((r) => r.status === 'REQUESTED').length}
              </span>
            )}
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center bg-slate-50">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by drug or vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            {activeTab === 'shipments' ? (
              <>
                <option value="In Transit">In Transit</option>
                <option value="Delayed">Delayed</option>
                <option value="Delivered">Delivered</option>
              </>
            ) : (
              REQUEST_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'shipments' ? (
            filteredShipments.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">
                No shipments match your search.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Drug</th>
                    <th className="px-6 py-4 font-semibold">Vendor</th>
                    <th className="px-6 py-4 font-semibold">Expected Delivery</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-center">Temp (°C)</th>
                    <th className="px-6 py-4 font-semibold">Qty</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredShipments.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedShipment(shipment)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{shipment.drug_name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {shipment.vendor_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700">
                          {new Date(shipment.expected_delivery).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-bold text-xs px-2.5 py-1 rounded-md ${
                            shipment.status === 'DELAYED'
                              ? 'bg-red-100 text-red-700'
                              : shipment.status === 'IN_TRANSIT'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {shipment.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-sm text-slate-700">
                          {shipment.temperature ? `${shipment.temperature}°C` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-sm">
                          <span className="font-bold text-slate-900">
                            {shipment.quantity || 0}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            Exp: {shipment.expected_quantity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditForm(shipment);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(shipment.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              No shipment requests match your search.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Drug</th>
                  <th className="px-6 py-4 font-semibold">Vendor</th>
                  <th className="px-6 py-4 font-semibold">Quantity</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Requested Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{request.drug_name}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{request.vendor_name}</div>
                      {request.vendor_reliability_score != null && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          Reliability: {request.vendor_reliability_score}% ·{' '}
                          {request.vendor_average_delivery_days}d avg
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      {request.requested_quantity}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-bold text-xs px-2.5 py-1 rounded-md ${getRequestStatusStyles(request.status)}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(request.requested_at || request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {request.status === 'REQUESTED' && (
                        <button
                          onClick={() => handleCancelRequest(request.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedShipment && (
        <ShipmentDetailModal
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
          onRefresh={() => {
            fetchShipments();
            setSelectedShipment(null);
          }}
        />
      )}

      {isEditOpen && editingShipment && (
        <ShipmentFormModal
          shipment={editingShipment}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => {
            setIsEditOpen(false);
            fetchShipments();
          }}
        />
      )}

      {isRequestOpen && (
        <ShipmentRequestFormModal
          hospitalId={hospitalId}
          onClose={() => setIsRequestOpen(false)}
          onSuccess={() => {
            setIsRequestOpen(false);
            fetchRequests();
            setActiveTab('requests');
          }}
        />
      )}
    </main>
  );
}
