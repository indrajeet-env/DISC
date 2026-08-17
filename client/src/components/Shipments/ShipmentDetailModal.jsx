import { useState } from 'react';
import { updateShipment } from '../../services/api';
import { X, RefreshCw } from 'lucide-react';

export default function ShipmentDetailModal({ shipment, onClose, onRefresh }) {
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState(shipment.status);
  const [quantity, setQuantity] = useState(shipment.quantity || 0);
  const [error, setError] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      await updateShipment(shipment.id, {
        status,
        quantity: parseInt(quantity, 10),
      });
      onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to update shipment');
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Shipment Details</h2>
            <p className="text-slate-500 font-medium mt-1">{shipment.drug_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white text-slate-400 hover:text-slate-700 rounded-full border border-slate-200 shadow-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Drug
              </p>
              <p className="text-lg font-bold text-slate-900">{shipment.drug_name}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Vendor
              </p>
              <p className="text-lg font-bold text-slate-900">{shipment.vendor_name}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Expected Date
              </p>
              <p className="text-lg font-bold text-slate-900">
                {new Date(shipment.expected_delivery).toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Temperature
              </p>
              <p className="text-lg font-bold text-slate-900">
                {shipment.temperature ? `${shipment.temperature}°C` : 'N/A'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              Update Shipment
            </h3>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900"
                >
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex justify-between">
                  <span>Received Qty</span>
                  <span className="text-slate-400 font-medium lowercase">
                    Exp: {shipment.expected_quantity}
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
