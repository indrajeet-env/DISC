export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-5 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Supply Chain Command Center</h2>
        <p className="text-sm text-slate-500 mt-1">Real-time visibility across hospital drug inventory and distribution</p>
      </div>
      <div className="flex items-center gap-4 text-right">
        <div>
          <p className="text-sm font-semibold text-slate-900">CityCare General Hospital</p>
          <p className="text-xs text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
          <span className="text-slate-600 font-bold text-sm">CG</span>
        </div>
      </div>
    </header>
  );
}
