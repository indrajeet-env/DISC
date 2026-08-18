import { AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function AlertCard({ alert }) {
  const getStyles = () => {
    switch (alert.severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          iconBg: 'bg-red-500',
          icon: 'text-white',
          Icon: AlertCircle,
        };

      case 'WARNING':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          iconBg: 'bg-yellow-500',
          icon: 'text-white',
          Icon: AlertTriangle,
        };

      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          iconBg: 'bg-blue-500',
          icon: 'text-white',
          Icon: Info,
        };
    }
  };

  const { bg, text, iconBg, icon, Icon } = getStyles();

  return (
    <div
      className={`p-4 rounded-xl border flex items-start gap-4 mb-3 transition-all hover:shadow-sm ${bg}`}
    >

      {/* Filled Severity Icon */}
      <div
        className={`mt-0.5 shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}
      >
        <Icon className={`w-5 h-5 ${icon}`} />
      </div>

      {/* Alert Content */}
      <div className="flex-1 min-w-0">

        <h4 className={`font-semibold text-sm ${text}`}>
          {alert.title}
        </h4>

        <p className={`text-sm mt-1 opacity-90 ${text}`}>
          {alert.description}
        </p>

        {/* Tags */}
        <div className="mt-3 flex items-center gap-2">

          {alert.severity === 'CRITICAL' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">
              Critical
            </span>
          )}

          {alert.severity === 'WARNING' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 uppercase tracking-wider">
              Warning
            </span>
          )}

          {alert.related_drug && (
            <span className="text-xs font-medium text-slate-500 bg-white/50 px-2 py-0.5 rounded-md border border-slate-200/50">
              {alert.related_drug}
            </span>
          )}

        </div>
      </div>
    </div>
  );
}