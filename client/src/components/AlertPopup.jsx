import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

const DISMISSED_ALERTS_KEY = 'disc_dismissed_alerts';

export default function AlertPopup({ alerts = [] }) {
  const [visibleAlert, setVisibleAlert] = useState(null);
  const [dismissedAlertIds, setDismissedAlertIds] = useState(new Set());

  // Load dismissed alerts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(DISMISSED_ALERTS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDismissedAlertIds(new Set(parsed));
      } catch (e) {
        console.error('Failed to parse dismissed alerts:', e);
      }
    }
  }, []);

  // Update visible alert when alerts or dismissed alerts change
  useEffect(() => {
    // Only show popup for critical/warning alerts that haven't been dismissed
    const urgentAlerts = alerts.filter(
      a => (a.severity === 'CRITICAL' || a.severity === 'WARNING') && 
           !dismissedAlertIds.has(a.id)
    );

    if (urgentAlerts.length > 0 && !visibleAlert) {
      // Show the most recent urgent alert
      setVisibleAlert(urgentAlerts[0]);
    }
  }, [alerts, dismissedAlertIds, visibleAlert]);

  const handleDismiss = () => {
    if (visibleAlert) {
      const newDismissed = new Set([...dismissedAlertIds, visibleAlert.id]);
      setDismissedAlertIds(newDismissed);
      // Persist to localStorage
      localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(Array.from(newDismissed)));
      setVisibleAlert(null);
    }
  };

  const handleClose = () => {
    setVisibleAlert(null);
  };

  if (!visibleAlert) return null;

  const isWarning = visibleAlert.severity === 'WARNING';
  const bgColor = isWarning ? 'bg-yellow-50' : 'bg-red-50';
  const borderColor = isWarning ? 'border-yellow-300' : 'border-red-300';
  const iconBgColor = isWarning ? 'bg-yellow-100' : 'bg-red-100';
  const iconColor = isWarning ? 'text-yellow-600' : 'text-red-600';
  const badgeColor = isWarning ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800';
  const Icon = isWarning ? AlertTriangle : AlertCircle;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className={`${bgColor} border-2 ${borderColor} rounded-xl shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-300`}>
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className={`${iconBgColor} p-3 rounded-lg shrink-0`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-slate-900">
                {visibleAlert.title}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>
                {visibleAlert.severity}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{visibleAlert.category}</p>
          </div>
          <button
            onClick={handleClose}
            className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <p className="text-sm text-slate-700 mb-3 leading-relaxed">
            {visibleAlert.description}
          </p>

          {visibleAlert.recommendation && (
            <div className="bg-white/50 border border-slate-200/50 rounded-lg p-3">
              <p className="text-xs text-slate-700 leading-relaxed">
                <span className="font-semibold">Recommendation:</span> {visibleAlert.recommendation}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0 border-t border-slate-200/50">
          <button
            onClick={handleDismiss}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              isWarning
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            Dismiss
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-2 px-4 rounded-lg font-medium bg-slate-200 hover:bg-slate-300 text-slate-900 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
