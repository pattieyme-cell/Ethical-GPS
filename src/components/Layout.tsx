import React, { useEffect, useState } from 'react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, isAuthenticated, onLogout }) => {
  const [theme, setTheme] = useState<'light'|'dark'>('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setActiveView(isAuthenticated ? ViewType.HOME : ViewType.LOGIN)}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg group-hover:from-indigo-600 group-hover:to-purple-600 transition-colors">
              G
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              Ethics<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">GPS</span>
            </h1>
          </div>
          
          <nav className="flex items-center gap-2 md:gap-4">
            {isAuthenticated && (
              <>
                <NavButton active={activeView === ViewType.HOME} onClick={() => setActiveView(ViewType.HOME)} label="Home" />
                <NavButton active={activeView === ViewType.ANALYZE} onClick={() => setActiveView(ViewType.ANALYZE)} label="New Decision" />
                <NavButton active={activeView === ViewType.HISTORY} onClick={() => setActiveView(ViewType.HISTORY)} label="History" />
                <NavButton active={activeView === ViewType.FEEDBACK} onClick={() => setActiveView(ViewType.FEEDBACK)} label="Feedback" />
              </>
            )}

            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="ml-2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveView(ViewType.PROFILE)} className="ml-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  Profile
                </button>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                <button onClick={onLogout} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              activeView !== ViewType.LOGIN && activeView !== ViewType.SIGNUP && (
                <button onClick={() => setActiveView(ViewType.LOGIN)} className="ml-2 text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  Login
                </button>
              )
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} EthicsGPS. Navigate your life with clarity and wisdom.
          </p>
        </div>
      </footer>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`hidden md:block px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 shadow-sm' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`}
  >
    {label}
  </button>
);

export default Layout;
