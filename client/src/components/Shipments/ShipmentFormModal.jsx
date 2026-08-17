import { useState, useEffect } from 'react';
import { updateShipment, getDrugs } from '../../services/api';
import { X, Save, AlertCircle } from 'lucide-react';

export default function ShipmentFormModal({ shipment, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [drugs, setDrugs] = useState([]);

  const [formData, setFormData] = useState({
    drug_id: '',
    expected_quantity: 0,
    quantity: 0,
    expected_delivery: '',
    status: 'IN_TRANSIT',
    temperature: '',
  });

  useEffect(() => {
    getDrugs().then(setDrugs).catch(console.error);

    if (shipment) {
      setFormData({
        drug_id: shipment.drug_id || '',
        expected_quantity: shipment.expected_quantity || 0,
        quantity: shipment.quantity || 0,
        expected_delivery: shipment.expected_delivery
          ? new Date(shipment.expected_delivery).toISOString().split('T')[0]
          : '',
        status: shipment.status || 'IN_TRANSIT',
        temperature: shipment.temperature ?? '',
      });
    }
  }, [shipment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        expected_quantity: parseInt(formData.expected_quantity, 10) || 0,
        quantity: parseInt(formData.quantity, 10) || 0,
        temperature:
          formData.temperature !== '' ? parseFloat(formData.temperature) : null,
        expected_delivery: formData.expected_delivery,
        status: formData.status,
      };

      await updateShipment(shipment.id, payload);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save shipment');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-900">Edit Shipment</h2>
          <button
            onClick={onClose}
            className="p-2 bg-white text-slate-400 hover:text-slate-700 rounded-full border border-slate-200 shadow-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Drug</label>
              <select
                name="drug_id"
                disabled
                value={formData.drug_id}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
              >
                <option value="" disabled>
                  Select a drug
                </option>
                {drugs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <select
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              >
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELAYED">Delayed</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Expected Quantity
              </label>
              <input
                type="number"
                name="expected_quantity"
                min="0"
                required
                value={formData.expected_quantity}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Received Quantity
              </label>
              <input
                type="number"
                name="quantity"
                min="0"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Expected Delivery
              </label>
              <input
                type="date"
                name="expected_delivery"
                required
                value={formData.expected_delivery}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                placeholder="Informational only"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
