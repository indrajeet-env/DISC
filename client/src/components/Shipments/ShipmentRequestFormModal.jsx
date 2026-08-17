import { useState, useEffect } from 'react';
import { createShipmentRequest, getDrugs, getVendors } from '../../services/api';
import { X, Send, AlertCircle, Building2, Star, Clock, DollarSign } from 'lucide-react';

export default function ShipmentRequestFormModal({ hospitalId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [drugs, setDrugs] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [formData, setFormData] = useState({
    drug_id: '',
    vendor_id: '',
    requested_quantity: '',
  });

  useEffect(() => {
    Promise.all([getDrugs(), getVendors()])
      .then(([drugsData, vendorsData]) => {
        setDrugs(drugsData);
        setVendors(vendorsData);
      })
      .catch((err) => setError(err.message || 'Failed to load form data'));
  }, []);

  const selectedVendor = vendors.find((v) => v.id === formData.vendor_id);
  const selectedDrug = drugs.find((d) => d.id === formData.drug_id);
  const effectiveHospitalId = hospitalId || selectedDrug?.hospital_id;

  const availableDrugs = hospitalId
    ? drugs.filter((d) => d.hospital_id === hospitalId)
    : drugs;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!effectiveHospitalId) {
      setError('Unable to determine your hospital. Please sign in again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createShipmentRequest({
        hospital_id: effectiveHospitalId,
        drug_id: formData.drug_id,
        vendor_id: formData.vendor_id,
        requested_quantity: parseInt(formData.requested_quantity, 10),
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create shipment request');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-900">Request Shipment</h2>
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

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Drug</label>
              <select
                name="drug_id"
                required
                value={formData.drug_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              >
                <option value="" disabled>
                  Select a drug
                </option>
                {availableDrugs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Requested Quantity
              </label>
              <input
                type="number"
                name="requested_quantity"
                min="1"
                required
                value={formData.requested_quantity}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                placeholder="Enter quantity needed"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Vendor</label>
              <select
                name="vendor_id"
                required
                value={formData.vendor_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              >
                <option value="" disabled>
                  Select a vendor
                </option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedVendor && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Vendor Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span>
                      Price:{' '}
                      <span className="font-bold text-slate-900">
                        ₹{selectedVendor.price_per_unit}/unit
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Star className="w-4 h-4 text-slate-400" />
                    <span>
                      Reliability:{' '}
                      <span className="font-bold text-slate-900">
                        {selectedVendor.reliability_score}%
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>
                      Avg Delivery:{' '}
                      <span className="font-bold text-slate-900">
                        {selectedVendor.average_delivery_days} days
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Star className="w-4 h-4 text-slate-400" />
                    <span>
                      Quality:{' '}
                      <span className="font-bold text-slate-900">
                        {selectedVendor.quality_score}%
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-sm text-blue-700 font-medium">
                Status will be set to <span className="font-bold">REQUESTED</span> automatically.
              </p>
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
              disabled={loading || !effectiveHospitalId}
              className="px-5 py-2.5 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
