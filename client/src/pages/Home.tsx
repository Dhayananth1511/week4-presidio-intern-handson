import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 animate-fade-in">
      <div className="glass-card max-w-2xl w-full p-12 text-center relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10">
          <span className="px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black rounded-full tracking-widest uppercase mb-6 inline-block">
            Productivity Reimagined
          </span>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
            Welcome to <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ProTask</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium max-w-md mx-auto mb-10 leading-relaxed">
            Manage your daily flow with clarity and precision. Your goals, visualized.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/tasks" className="w-full sm:w-auto">
              <button className="button-primary w-full px-10 py-4 text-lg">
                Go to Dashboard →
              </button>
            </Link>
            <Link to="/settings" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl transition-all">
                Preferences
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
