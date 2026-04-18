"use client";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>

      <div className="glass-card-solid p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Franchise Information</h3>
        <div className="space-y-4">
          <div>
            <label className="input-label">Franchise Name</label>
            <input defaultValue="AR Traders" className="input-field" readOnly />
          </div>
          <div>
            <label className="input-label">Business Type</label>
            <input defaultValue="Cold-Drink Distribution" className="input-field" readOnly />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Default Tax Rate (%)</label>
              <input defaultValue="0" className="input-field" type="number" readOnly />
            </div>
            <div>
              <label className="input-label">Currency</label>
              <input defaultValue="PKR" className="input-field" readOnly />
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-4">* Settings are read-only in MVP. Contact support for changes.</p>
      </div>

      <div className="glass-card-solid p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">About</h3>
        <div className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
          <p><strong className="text-slate-700 dark:text-slate-300">Version:</strong> 1.0.0 (MVP)</p>
          <p><strong className="text-slate-700 dark:text-slate-300">System:</strong> AR Traders POS — Cold-Drink Franchise Management</p>
          <p><strong className="text-slate-700 dark:text-slate-300">Stack:</strong> Next.js, Express.js, MongoDB, Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}
