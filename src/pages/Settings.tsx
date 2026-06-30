function Settings() {
  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in pb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-black mb-2">Settings</h1>
        <p className="text-slate-500 font-medium">Personalize your experience and account.</p>
      </header>

      <div className="space-y-8 text-slate-900 dark:text-white">
        <section className="glass-card p-8">
          <h3 className="text-lg font-black uppercase tracking-widest opacity-40 mb-8 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
            User Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Display Name</label>
              <input 
                className="input-base" 
                placeholder="John Doe" 
                defaultValue="Guest User" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Email Address</label>
              <input 
                className="input-base" 
                placeholder="user@example.com" 
              />
            </div>
          </div>
        </section>

        <section className="glass-card p-8">
          <h3 className="text-lg font-black uppercase tracking-widest opacity-40 mb-8 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
            App Preferences
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center group">
              <div>
                <span className="font-bold block">Email Notifications</span>
                <span className="text-xs opacity-50">Receive daily task summaries.</span>
              </div>
              <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner">
                 <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-all"></div>
              </div>
            </div>
            <div className="flex justify-between items-center group">
              <div>
                <span className="font-bold block">Compact Mode</span>
                <span className="text-xs opacity-50">Minimize card spacing.</span>
              </div>
              <div className="w-12 h-6 bg-slate-300 dark:bg-slate-800 rounded-full relative cursor-pointer shadow-inner">
                 <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 transition-all"></div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button className="button-primary sm:flex-1">
            Apply Changes
          </button>
          <button className="px-8 py-4 border-2 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded-xl transition-all sm:flex-1">
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
