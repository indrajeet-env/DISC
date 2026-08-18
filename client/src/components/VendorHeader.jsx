import { LogOut } from "lucide-react";
import { authService } from "../services/authService";

export default function VendorHeader({ vendorName }) {
  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-5 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Vendor Portal</h2>
        <p className="text-sm text-slate-500 mt-1">Manage incoming shipment requests and fulfill orders</p>
      </div>
      <div className="flex items-center gap-4 text-right">
        <div>
          <p className="text-sm font-semibold text-slate-900">{vendorName || "Loading..."}</p>
          <p className="text-xs text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
          <span className="text-slate-600 font-bold text-sm">V</span>
        </div>
        <div className="pl-4 border-l border-slate-200 ml-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
