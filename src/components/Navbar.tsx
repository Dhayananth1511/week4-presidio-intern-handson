import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const themeContext = useContext(ThemeContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!themeContext) return null;

  const { theme, toggleTheme } = themeContext;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="flex flex-wrap items-center justify-between p-4 mb-8 glass-card sticky top-4 z-50 mx-4 lg:mx-auto max-w-6xl" aria-label="Main Navigation">
      <div className="flex gap-6 items-center">
        <Link to="/" className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
          ProTask
        </Link>
        <div className="hidden md:flex gap-4">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/tasks" className="nav-link">Tasks</Link>
          <Link to="/settings" className="nav-link">Settings</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold opacity-75 hidden sm:inline">
              Hi, <span className="text-indigo-600 dark:text-indigo-400">{user}</span>
            </span>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 hover:bg-red-500 hover:text-white rounded-lg transition-all"
            >
              Log Out
            </button>
          </div>
        ) : (
          <Link to="/login">
            <button className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-md transition-all">
              Login
            </button>
          </Link>
        )}

        <button 
          onClick={toggleTheme} 
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-lg hover:rotate-12 transition-all shadow-inner"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
