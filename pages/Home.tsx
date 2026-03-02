import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ArrowRight, Activity, CheckCircle, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { t } from '../utils/translations';

export const Home: React.FC = () => {
  const { typingStats, language } = useStore();
  const dict = t(language);

  const statsCards = [
    { label: dict.typingSpeed, value: `${typingStats.wpm} WPM`, icon: <Activity className="text-blue-500" /> },
    { label: dict.accuracy, value: `${typingStats.accuracy.toFixed(1)}%`, icon: <Target className="text-green-500" /> },
    { label: dict.totalChars, value: typingStats.totalChars, icon: <CheckCircle className="text-violet-500" /> },
  ];

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{dict.welcomeBack}</h2>
        <p className="text-slate-500 dark:text-slate-400">{dict.trackProgress}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/vocab" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-8 text-white shadow-lg hover:shadow-xl transition-all">
          <h3 className="text-2xl font-bold mb-2">{dict.vocabTrainer}</h3>
          <p className="text-blue-100 mb-6 max-w-[80%]">{dict.vocabDesc}</p>
          <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full group-hover:bg-white/30 transition-colors font-medium">
            {dict.startPracticing} <ArrowRight size={16} />
          </span>
        </Link>

        <Link to="/writing" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 p-8 text-white shadow-lg hover:shadow-xl transition-all">
          <h3 className="text-2xl font-bold mb-2">{dict.aiWriting}</h3>
          <p className="text-violet-100 mb-6 max-w-[80%]">{dict.aiWritingDesc}</p>
          <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full group-hover:bg-white/30 transition-colors font-medium">
            {dict.writeNow} <ArrowRight size={16} />
          </span>
        </Link>
      </div>
    </div>
  );
};