import { useState } from 'react';
import { updateDrug } from '../../services/api';
import { X, Activity, Package, AlertTriangle, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

export default function DrugDetailModal({ drug, onClose, onRefresh }) {
  const [updating, setUpdating] = useState(false);
  const [stockOp, setStockOp] = useState('add'); // 'add', 'remove', 'set'
  const [stockAmount, setStockAmount] = useState('');
  const [error, setError] = useState(null);

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    if (!stockAmount || isNaN(stockAmount) || stockAmount < 0) return;

    setUpdating(true);
    setError(null);

    try {
      const amount = parseInt(stockAmount, 10);
      let newStock = drug.current_stock;
      if (stockOp === 'add') newStock += amount;
      if (stockOp === 'remove') newStock = Math.max(0, newStock - amount);
      if (stockOp === 'set') newStock = amount;

      await updateDrug(drug.id, { current_stock: newStock });
      onRefresh(); // Refresh the list
    } catch (err) {
      setError(err.message || "Failed to update stock");
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{drug.name}</h2>
            <p className="text-slate-500 font-medium mt-1">{drug.category} &bull; {drug.unit}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white text-slate-400 hover:text-slate-700 rounded-full border border-slate-200 shadow-sm transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* Main Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Stock</p>
              <p className="text-2xl font-bold text-slate-900">{drug.current_stock}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Minimum Stock</p>
              <p className="text-2xl font-bold text-slate-900">{drug.minimum_stock}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Shortfall</p>
              <p className="text-2xl font-bold text-red-600">{drug.shortfall}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <p className={`text-lg font-bold mt-1 ${
                drug.status === 'CRITICAL' ? 'text-red-600' : 
                drug.status === 'WARNING' ? 'text-amber-600' : 'text-emerald-600'
              }`}>{drug.status}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Update Stock Form */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                Update Stock
              </h3>
              
              {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
              
              <form onSubmit={handleStockUpdate} className="space-y-4">
                <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <button type="button" onClick={() => setStockOp('add')} className={`flex-1 py-2 text-sm font-medium ${stockOp === 'add' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>Add</button>
                  <button type="button" onClick={() => setStockOp('remove')} className={`flex-1 py-2 text-sm font-medium border-l border-r border-slate-200 ${stockOp === 'remove' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}>Remove</button>
                  <button type="button" onClick={() => setStockOp('set')} className={`flex-1 py-2 text-sm font-medium ${stockOp === 'set' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}>Set</button>
                </div>
                
                <div className="flex gap-3">
                  <input 
                    type="number" 
                    min="0"
                    placeholder="Amount" 
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={stockAmount}
                    onChange={e => setStockAmount(e.target.value)}
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={updating}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>

            {/* Future ML / Metadata */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Drug Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Expiry Date</span>
                    <span className="font-medium text-slate-900">{new Date(drug.expiry_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Hospital Context</span>
                    <span className="font-medium text-slate-900">{drug.hospital_id || 'Global'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Created At</span>
                    <span className="font-medium text-slate-900">{new Date(drug.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4" />
                  Demand Forecast
                </h3>
                <p className="text-xs text-blue-700/80 leading-relaxed italic">
                  Forecasting will be available once sufficient historical consumption data is available. Machine Learning models require more continuous usage logs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
