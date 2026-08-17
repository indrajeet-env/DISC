import { useState, useEffect, useMemo } from 'react';
import { getDrugs, deleteDrug } from '../services/api';
import { Package, Search, Filter, Plus, Pill, AlertTriangle, Trash2, ShieldCheck, Edit2, Clock } from 'lucide-react';
import DrugDetailModal from '../components/Inventory/DrugDetailModal';
import DrugFormModal from '../components/Inventory/DrugFormModal';

export default function Inventory() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expiryFilter, setExpiryFilter] = useState('All');

  const [selectedDrug, setSelectedDrug] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState(null);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      const data = await getDrugs();
      setDrugs(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Unable to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  // Process data (calculate status, risk, shortfall)
  const processedDrugs = useMemo(() => {
    return drugs.map(drug => {
      const stockPercentage = Math.round((drug.current_stock / drug.minimum_stock) * 100);
      const shortfall = Math.max(drug.minimum_stock - drug.current_stock, 0);
      
      let status = 'HEALTHY';
      let statusPriority = 3;
      if (drug.current_stock < drug.minimum_stock * 0.8) {
        status = 'CRITICAL';
        statusPriority = 1;
      } else if (drug.current_stock < drug.minimum_stock) {
        status = 'WARNING';
        statusPriority = 2;
      }

      const expiryDate = new Date(drug.expiry_date);
      const daysToExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
      
      let expiryStatus = 'VALID';
      if (daysToExpiry <= 0) {
        expiryStatus = 'EXPIRED';
      } else if (daysToExpiry <= 30) {
        expiryStatus = 'EXPIRING_SOON';
      }

      return {
        ...drug,
        stockPercentage,
        shortfall,
        status,
        statusPriority,
        daysToExpiry,
        expiryStatus
      };
    });
  }, [drugs]);

  // Derived filters
  const categories = useMemo(() => {
    const cats = new Set(processedDrugs.map(d => d.category));
    return ['All', ...Array.from(cats)].sort();
  }, [processedDrugs]);

  // Summary logic
  const summary = useMemo(() => {
    let healthy = 0, warning = 0, critical = 0, expiring = 0;
    processedDrugs.forEach(d => {
      if (d.status === 'HEALTHY') healthy++;
      if (d.status === 'WARNING') warning++;
      if (d.status === 'CRITICAL') critical++;
      if (d.expiryStatus === 'EXPIRING_SOON' || d.expiryStatus === 'EXPIRED') expiring++;
    });
    return { total: processedDrugs.length, healthy, warning, critical, expiring };
  }, [processedDrugs]);

  // Filter and sort
  const filteredAndSortedDrugs = useMemo(() => {
    let result = processedDrugs.filter(d => {
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.category.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'All' && d.status !== statusFilter.toUpperCase()) return false;
      if (categoryFilter !== 'All' && d.category !== categoryFilter) return false;
      if (expiryFilter === 'Expiring Soon' && d.expiryStatus !== 'EXPIRING_SOON') return false;
      if (expiryFilter === 'Expired' && d.expiryStatus !== 'EXPIRED') return false;
      return true;
    });

    result.sort((a, b) => {
      if (a.statusPriority !== b.statusPriority) {
        return a.statusPriority - b.statusPriority;
      }
      return a.stockPercentage - b.stockPercentage;
    });

    return result;
  }, [processedDrugs, search, statusFilter, categoryFilter, expiryFilter]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this drug?")) {
      try {
        await deleteDrug(id);
        fetchDrugs();
        if (selectedDrug && selectedDrug.id === id) {
          setSelectedDrug(null);
        }
      } catch (err) {
        alert("Failed to delete drug: " + err.message);
      }
    }
  };

  const openEditForm = (drug) => {
    setEditingDrug(drug);
    setIsFormOpen(true);
  };

  if (loading && drugs.length === 0) {
    return (
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading inventory...</p>
      </main>
    );
  }

  if (error && drugs.length === 0) {
    return (
      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600">{error}</p>
          <button onClick={fetchDrugs} className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100">Try Again</button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-500 mt-1">Monitor drug availability, stock levels, expiry and inventory risk.</p>
        </div>
        <button 
          onClick={() => { setEditingDrug(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Drug
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Pill className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Total Drugs</p><h3 className="text-2xl font-bold text-slate-900">{summary.total}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><ShieldCheck className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Healthy</p><h3 className="text-2xl font-bold text-slate-900">{summary.healthy}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><AlertTriangle className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Warning</p><h3 className="text-2xl font-bold text-slate-900">{summary.warning}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600"><Package className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Critical</p><h3 className="text-2xl font-bold text-slate-900">{summary.critical}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600"><Clock className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Expiring Soon</p><h3 className="text-2xl font-bold text-slate-900">{summary.expiring}</h3></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center bg-slate-50">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search drugs by name or category..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 font-medium" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Healthy">Healthy</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
            <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 font-medium" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>)}
            </select>
            <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 font-medium" value={expiryFilter} onChange={e => setExpiryFilter(e.target.value)}>
              <option value="All">All Expiry</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredAndSortedDrugs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">No drugs match your search.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Drug Name</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Stock Level</th>
                  <th className="px-6 py-4 font-semibold">Expiry Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedDrugs.map(drug => (
                  <tr key={drug.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => setSelectedDrug(drug)}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{drug.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{drug.unit}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{drug.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-bold text-slate-900">{drug.current_stock} <span className="text-slate-400 font-medium">/ {drug.minimum_stock}</span></span>
                        <span className={`font-bold text-xs px-2 py-0.5 rounded-md ${
                          drug.status === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                          drug.status === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>{drug.status}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            drug.status === 'CRITICAL' ? 'bg-red-500' : 
                            drug.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, drug.stockPercentage)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{new Date(drug.expiry_date).toLocaleDateString()}</div>
                      {drug.expiryStatus === 'EXPIRED' && <div className="text-xs font-bold text-red-600 mt-0.5">Expired</div>}
                      {drug.expiryStatus === 'EXPIRING_SOON' && <div className="text-xs font-bold text-purple-600 mt-0.5">Expiring Soon</div>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); openEditForm(drug); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(drug.id); }} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedDrug && (
        <DrugDetailModal 
          drug={selectedDrug} 
          onClose={() => setSelectedDrug(null)} 
          onRefresh={() => { fetchDrugs(); setSelectedDrug(null); }}
        />
      )}

      {isFormOpen && (
        <DrugFormModal 
          drug={editingDrug}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => { setIsFormOpen(false); fetchDrugs(); }}
        />
      )}
    </main>
  );
}
