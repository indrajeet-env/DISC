import { AlertTriangle } from 'lucide-react';

export default function ShipmentTable({ shipments = [] }) {
  if (shipments.length === 0) {
    return <div className="text-slate-500 text-sm p-6 text-center">No shipments.</div>;
  }

  const getStatusStyles = (status) => {
    switch (status) {
      case 'DELAYED': return 'bg-red-100 text-red-800 border-red-200';
      case 'IN_TRANSIT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-semibold">Drug</th>
            <th className="px-6 py-4 font-semibold">Vendor</th>
            <th className="px-6 py-4 font-semibold">Hospital</th>
            <th className="px-6 py-4 font-semibold">Qty</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold">Delivery</th>
            <th className="px-6 py-4 font-semibold">Temp °C</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {shipments.map((shipment, idx) => {
            const isDelayed = shipment.status === 'DELAYED';
            const tempViolation = shipment.temperature > 8;
            
            return (
              <tr key={idx} className={`hover:bg-slate-50/80 transition-colors ${isDelayed ? 'bg-red-50/30' : ''}`}>
                <td className="px-6 py-4 font-medium text-slate-900">{shipment.drug_name}</td>
                <td className="px-6 py-4 text-slate-500">{shipment.vendor_name}</td>
                <td className="px-6 py-4 text-slate-500">{shipment.hospital_name}</td>
                <td className="px-6 py-4 font-medium text-slate-700">
                  {shipment.quantity} <span className="text-xs text-slate-400 font-normal">/ {shipment.expected_quantity}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-md border ${getStatusStyles(shipment.status)}`}>
                    {shipment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {new Date(shipment.expected_delivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${tempViolation ? 'text-red-600' : 'text-slate-600'}`}>
                      {shipment.temperature}°C
                    </span>
                    {tempViolation && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
