export default function InventoryRiskTable({ drugs = [] }) {
  if (drugs.length === 0) {
    return <div className="text-slate-500 text-sm p-6 text-center">No inventory data available.</div>;
  }

  const getStatusStyles = (status) => {
    switch (status) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-semibold">Drug</th>
            <th className="px-6 py-4 font-semibold">Category</th>
            <th className="px-6 py-4 font-semibold">Current Stock</th>
            <th className="px-6 py-4 font-semibold">Min Stock</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold">Expiry Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {drugs.map((drug, idx) => (
            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-900">{drug.name}</td>
              <td className="px-6 py-4 text-slate-500">{drug.category}</td>
              <td className="px-6 py-4 font-medium text-slate-700">{drug.current_stock} <span className="text-xs text-slate-400 font-normal ml-1">{drug.unit}</span></td>
              <td className="px-6 py-4 text-slate-500">{drug.minimum_stock}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 text-xs font-bold rounded-md border ${getStatusStyles(drug.status)}`}>
                  {drug.status}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-500">
                {new Date(drug.expiry_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
