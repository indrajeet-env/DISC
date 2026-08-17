import { X } from 'lucide-react';

export default function ShipmentDetailModal({ shipment, onClose }) {

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
            <h3 className="text-sm font-bold text-slate-900 mb-1">Hospital access</h3>
            <p className="text-sm text-slate-600">
              Shipment details are read-only for hospital users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
