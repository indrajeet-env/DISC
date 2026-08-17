import { useState, useMemo } from 'react';
import { AlertCircle, AlertTriangle, Info, Search, Filter } from 'lucide-react';

const severityConfig = {
  CRITICAL: {
    label: 'Critical',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
  WARNING: {
    label: 'Warning',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  INFO: {
    label: 'Info',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
};

const categoryColors = {
  'AI Stock Alerts': 'bg-purple-100 text-purple-700',
  'Shipment/Delivery Alerts': 'bg-amber-100 text-amber-700',
  'Procurement Alerts': 'bg-cyan-100 text-cyan-700',
};

export default function Alerts({ alerts = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  // Get unique categories and severities
  const categories = useMemo(() => {
    const cats = new Set(alerts.map(a => a.category));
    return ['All', ...Array.from(cats)].sort();
  }, [alerts]);

  const severities = ['All', 'CRITICAL', 'WARNING', 'INFO'];

  // Filter and sort alerts
  const filteredAlerts = useMemo(() => {
    let result = alerts.filter(alert => {
      const matchesSearch = 
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = selectedSeverity === 'All' || alert.severity === selectedSeverity;
      const matchesCategory = selectedCategory === 'All' || alert.category === selectedCategory;
      
      return matchesSearch && matchesSeverity && matchesCategory;
    });

    // Sort
    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'severity') {
      const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
      result.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    }

    return result;
  }, [alerts, searchTerm, selectedSeverity, selectedCategory, sortBy]);

  // Summary stats
  const stats = useMemo(() => {
    return {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'CRITICAL').length,
      warning: alerts.filter(a => a.severity === 'WARNING').length,
      info: alerts.filter(a => a.severity === 'INFO').length,
    };
  }, [alerts]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Alerts & Notifications</h1>
          <p className="text-slate-500">Monitor supply chain events, stock levels, and shipment status</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Total Alerts</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium mb-1">Critical</p>
                <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium mb-1">Warning</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.warning}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium mb-1">Info</p>
                <p className="text-3xl font-bold text-blue-600">{stats.info}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <Info className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search alerts by title or description..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Severity</label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                >
                  {severities.map(sev => (
                    <option key={sev} value={sev}>{sev}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="severity">By Severity</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <p className="text-slate-900 font-semibold text-lg mb-1">No alerts found</p>
              <p className="text-slate-500">
                {selectedCategory !== 'All' || selectedSeverity !== 'All' || searchTerm
                  ? 'Try adjusting your filters'
                  : 'Everything is running smoothly'}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const config = severityConfig[alert.severity] || severityConfig.INFO;
              const categoryColor = categoryColors[alert.category] || 'bg-slate-100 text-slate-700';

              return (
                <div
                  key={alert.id}
                  className={`bg-white rounded-xl shadow-sm border-l-4 p-6 transition-all hover:shadow-md ${config.bg} ${config.border}`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="mt-1 shrink-0">
                      {getSeverityIcon(alert.severity)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-semibold text-slate-900 text-lg leading-tight">
                          {alert.title}
                        </h3>
                        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                          {formatDate(alert.date)}
                        </span>
                      </div>

                      <p className="text-slate-700 text-sm mb-3 leading-relaxed">
                        {alert.description}
                      </p>

                      {alert.recommendation && (
                        <div className="bg-slate-50/50 rounded-lg p-3 mb-3 border border-slate-200/50">
                          <p className="text-sm text-slate-700">
                            <span className="font-semibold">Recommended action: </span>
                            {alert.recommendation}
                          </p>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.badge}`}>
                          {severityConfig[alert.severity]?.label}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
                          {alert.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
