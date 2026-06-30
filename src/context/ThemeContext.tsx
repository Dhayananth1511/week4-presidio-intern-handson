import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Concept: Secure Storage (localStorage)
  // Check if a theme is already saved, otherwise default to "light"
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    // Save theme choice to persistent storage
    localStorage.setItem("theme", theme);
    
    // Sync body styles
    document.body.style.backgroundColor = theme === "light" ? "var(--bg-light)" : "var(--bg-dark)";
    document.body.style.color = theme === "light" ? "var(--text-light)" : "var(--text-dark)";
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`app-container ${theme}`} style={{ 
        transition: 'var(--transition)'
      }}>
        <style>
          {`
            .dark nav { background: var(--card-dark); }
            .dark li { background: var(--card-dark); }
            .dark input { background: #1e293b; border-color: #334155; color: white; }
          `}
        </style>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
