import { useState, useEffect } from 'react';
import { createDrug, updateDrug } from '../../services/api';
import { X, Save, AlertCircle } from 'lucide-react';

export default function DrugFormModal({ drug, onClose, onSuccess }) {
  const isEditing = !!drug;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    current_stock: 0,
    minimum_stock: 0,
    expiry_date: '',
    hospital_id: 'HOSP-001' // Defaulting based on application context
  });

  useEffect(() => {
    if (isEditing && drug) {
      setFormData({
        name: drug.name || '',
        category: drug.category || '',
        unit: drug.unit || '',
        current_stock: drug.current_stock || 0,
        minimum_stock: drug.minimum_stock || 0,
        expiry_date: drug.expiry_date ? new Date(drug.expiry_date).toISOString().split('T')[0] : '',
        hospital_id: drug.hospital_id || 'HOSP-001'
      });
    }
  }, [drug, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        current_stock: parseInt(formData.current_stock, 10),
        minimum_stock: parseInt(formData.minimum_stock, 10),
      };

      if (isEditing) {
        // Exclude fields that might not be patchable or are handled elsewhere if needed
        await updateDrug(drug.id, payload);
      } else {
        await createDrug(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save drug');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit Drug' : 'Add New Drug'}</h2>
          <button onClick={onClose} className="p-2 bg-white text-slate-400 hover:text-slate-700 rounded-full border border-slate-200 shadow-sm transition-colors">
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Drug Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900" placeholder="e.g. Paracetamol 500mg" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <input type="text" name="category" required value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900" placeholder="e.g. Analgesic" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Unit</label>
              <input type="text" name="unit" required value={formData.unit} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900" placeholder="e.g. tablets, vials" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Minimum Stock</label>
              <input type="number" name="minimum_stock" min="0" required value={formData.minimum_stock} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Current Stock</label>
              <input type="number" name="current_stock" min="0" required disabled={isEditing} value={formData.current_stock} onChange={handleChange} className={`w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 ${isEditing ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`} />
              {isEditing && <p className="text-xs text-slate-500 mt-1">Use the drug detail view to update stock levels securely.</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Expiry Date</label>
              <input type="date" name="expiry_date" required value={formData.expiry_date} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-5 py-2.5 font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
              {isEditing ? 'Save Changes' : 'Add Drug'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
