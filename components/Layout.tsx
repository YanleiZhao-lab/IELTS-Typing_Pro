import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Keyboard, BookOpen, PenTool, Mic, Headphones, Sun, Moon, Menu, X, Languages, Library, Settings, Cpu } from 'lucide-react';
import { useStore } from '../store/useStore';
import { AnimatePresence, motion } from 'framer-motion';
import { t } from '../utils/translations';
import { AIModelConfig } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode, toggleTheme, language, setLanguage, aiModel, setAiModel } = useStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dict = t(language);

  // Strict Theme Sync
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
  }, [isDarkMode]);

  const navItems = [
    { path: '/', label: dict.dashboard, icon: <LayoutDashboard size={20} /> },
    { path: '/vocab', label: dict.vocabTyping, icon: <Keyboard size={20} /> },
    { path: '/listening', label: dict.listening, icon: <Headphones size={20} /> },
    { path: '/reading', label: dict.reading, icon: <BookOpen size={20} /> },
    { path: '/writing', label: dict.writing, icon: <PenTool size={20} /> },
    { path: '/speaking', label: dict.speaking, icon: <Mic size={20} /> },
    { path: '/resources', label: dict.resources, icon: <Library size={20} /> },
  ];

  // Load available models from Default + Environment
  const availableModels = useMemo(() => {
    const defaults = [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Default)' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' }
    ];

    let custom: AIModelConfig[] = [];
    try {
      const envStr = process.env.VITE_AI_MODELS;
      if (envStr) {
        custom = JSON.parse(envStr);
      }
    } catch (e) {
      console.warn("Failed to parse custom models");
    }

    // Deduplicate by ID
    const combined = [...defaults];
    custom.forEach(c => {
      if (!combined.find(d => d.id === c.id)) {
        combined.push({ id: c.id, name: c.name });
      }
    });
    
    return combined;
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'cn' : 'en');
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
      
      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-xl"
             >
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                      <Settings className="text-primary" /> {dict.generalSettings}
                   </h2>
                   <button onClick={() => setIsSettingsOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                      <X size={20} />
                   </button>
                </div>

                <div className="space-y-6">
                   {/* AI Model Selection */}
                   <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                         <Cpu size={16} /> {dict.aiModel}
                      </label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{dict.aiModelDesc}</p>
                      <div className="grid gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                         {availableModels.map(model => (
                           <button
                             key={model.id}
                             onClick={() => setAiModel(model.id)}
                             className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                               aiModel === model.id 
                                 ? 'border-primary bg-primary/5 ring-1 ring-primary text-primary font-medium' 
                                 : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                             }`}
                           >
                              {model.name}
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* Language & Theme */}
                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <button onClick={toggleLanguage} className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300">
                         <Languages size={16} /> {language === 'en' ? 'Switch to 中文' : 'Switch to English'}
                      </button>
                      <button onClick={toggleTheme} className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300">
                         {isDarkMode ? <Sun size={16} /> : <Moon size={16} />} {isDarkMode ? dict.lightMode : dict.darkMode}
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 h-screen shadow-sm z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30">
            I
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 text-transparent bg-clip-text tracking-tight">
            IELTS-Pro
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? 'text-primary bg-primary/10 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings size={18} />
            <span>{dict.settings}</span>
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={toggleLanguage}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
            >
              <Languages size={18} />
            </button>
            
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
            >
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold">I</div>
           <span className="font-bold text-slate-900 dark:text-white">IELTS-Pro</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-16 z-20 bg-white dark:bg-slate-900 p-4"
          >
             <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 space-y-2">
                 <button onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Settings size={20} /> {dict.settings}
                 </button>
                 <div className="flex gap-2 mt-2">
                    <button onClick={toggleLanguage} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <Languages size={20} />
                    </button>
                    <button onClick={toggleTheme} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                 </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 md:ml-0 mt-16 md:mt-0 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
