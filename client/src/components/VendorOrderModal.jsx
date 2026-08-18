import { X, Calendar, Package, Truck, Building, FileText, CheckCircle2 } from "lucide-react";

export default function VendorOrderModal({ request, onClose }) {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>
              <p className="text-sm text-slate-500 font-medium">ID: {request.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Status Banner */}
          <div className={`mb-8 p-4 rounded-xl flex items-center justify-between border ${
            request.status === 'DELIVERED' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            request.status === 'SHIPPED' ? 'bg-blue-50 border-blue-200 text-blue-800' :
            request.status === 'ACKNOWLEDGED' ? 'bg-amber-50 border-amber-200 text-amber-800' :
            'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider mb-0.5 opacity-80">Current Status</p>
              <p className="text-xl font-bold">{request.status}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 opacity-80" />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Hospital Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">Client Information</h3>
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{request.hospital_name}</p>
                  <p className="text-sm text-slate-500">Destination Hospital</p>
                </div>
              </div>
            </div>

            {/* Vendor Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">Supplier Information</h3>
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{request.vendor_name}</p>
                  <p className="text-sm text-slate-500">Fulfillment Center</p>
                </div>
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-8">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Order Items</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                  <Package className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{request.drug_name}</p>
                  <p className="text-sm text-slate-500">Medical Supplies</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">{request.requested_quantity}</p>
                <p className="text-sm text-slate-500">Units Requested</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">Order Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Request Date</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {new Date(request.requested_at).toLocaleString()}
                </span>
              </div>
              {request.acknowledged_at && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Acknowledged Date</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {new Date(request.acknowledged_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
}
