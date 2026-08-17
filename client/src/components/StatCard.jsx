export default function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">{value}</p>
        </div>
        {Icon && (
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {description && (
        <p className="mt-4 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}
