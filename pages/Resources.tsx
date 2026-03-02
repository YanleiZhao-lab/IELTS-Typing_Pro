import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Book, PenTool, GraduationCap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { t } from '../utils/translations';
import { ResourceLink } from '../types';

export const Resources: React.FC = () => {
  const { language } = useStore();
  const dict = t(language);

  const resources: ResourceLink[] = [
    {
      title: 'IELTS Online Tests',
      description: 'Free online IELTS practice tests for Listening, Reading, Writing and Speaking.',
      url: 'https://ieltsonlinetests.com/',
      category: 'practice'
    },
    {
      title: 'XDF IELTS Computer-based Test',
      description: 'Official-like interface for computer-delivered IELTS practice by New Oriental.',
      url: 'https://ieltscat.xdf.cn/',
      category: 'practice'
    },
    {
      title: 'Cambridge Dictionary',
      description: 'The most popular online dictionary and thesaurus for learners of English.',
      url: 'https://dictionary.cambridge.org/',
      category: 'dictionary'
    },
    {
      title: 'Qwerty Learner',
      description: 'The inspiration for this module. Excellent typing practice for programmers.',
      url: 'https://qwerty.kaiyi.cool/',
      category: 'tool'
    },
    {
      title: 'IELTS Liz',
      description: 'Tips, lessons and model answers for IELTS.',
      url: 'https://ieltsliz.com/',
      category: 'practice'
    },
    {
      title: 'Grammarly',
      description: 'AI writing assistance for checking grammar and tone.',
      url: 'https://www.grammarly.com/',
      category: 'tool'
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{dict.externalTools}</h2>
        <p className="text-slate-500 dark:text-slate-400">{dict.toolsDesc}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res, idx) => (
          <motion.a
            key={idx}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-primary transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">
                {res.category === 'practice' && <GraduationCap size={24} />}
                {res.category === 'dictionary' && <Book size={24} />}
                {res.category === 'tool' && <PenTool size={24} />}
              </div>
              <ExternalLink size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white group-hover:text-primary transition-colors">{res.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm flex-1">{res.description}</p>
            <div className="mt-4 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              {dict.visit} &rarr;
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};