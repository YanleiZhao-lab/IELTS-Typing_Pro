import React, { useState, useRef, useMemo } from 'react';
import { CheckCircle, XCircle, Key, Lightbulb, Library, X, Upload, ChevronDown, Download, GraduationCap, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { t } from '../../utils/translations';
import { readingTips } from '../../data/mockData';
import { IELTSReadingPassage, QuestionType } from '../../types';
import { AnimatePresence, motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { downloadTemplate } from '../../utils/fileHelpers';

export const Reading: React.FC = () => {
  const { language, readingPassages, addReadingPassage, updateReadingPassage, deleteReadingPassage } = useStore();
  const dict = t(language);
  
  const [passage, setPassage] = useState<IELTSReadingPassage | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Edit State
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  React.useEffect(() => {
      if (!passage && readingPassages.length > 0) {
          setPassage(readingPassages[0]);
      } else if (passage && !readingPassages.find(p => p.id === passage.id)) {
          setPassage(readingPassages[0] || null);
      }
  }, [readingPassages, passage]);

  const handleSelect = (qId: number, val: string) => { if (submitted) return; setAnswers(prev => ({ ...prev, [qId]: val })); };
  const checkScore = () => { setSubmitted(true); };
  
  const startEditing = (p: IELTSReadingPassage) => { setEditingId(p.id); setEditTitle(p.title); };
  const saveEditing = (id: string | number) => { updateReadingPassage(id, { title: editTitle }); setEditingId(null); };
  const handleDelete = (id: string | number) => { if(window.confirm(dict.confirmDelete)) deleteReadingPassage(id); };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isJson = file.name.endsWith('.json');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    try {
      if (isJson) {
        const text = await file.text();
        const parsed = JSON.parse(text) as IELTSReadingPassage;
        if (parsed.title && parsed.content && Array.isArray(parsed.questions)) {
          addReadingPassage({ ...parsed, id: `custom-${Date.now()}` });
          setIsLibraryOpen(false);
        }
      } else if (isExcel) {
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet) as any[];
        
        if (json.length > 0) {
          const firstRow = json[0];
          const newPassage: IELTSReadingPassage = {
            id: `custom-${Date.now()}`,
            title: firstRow.Title || firstRow.title || 'Untitled Import',
            category: firstRow.Category || firstRow.category || 'Custom',
            content: firstRow.Content || firstRow.content || '',
            questions: json.map((row, idx) => ({
              id: idx + 1,
              question: row.Question || row.question || '',
              type: (row.Type || row.type || 'MC') as QuestionType,
              options: (row.Options || row.options) ? (row.Options || row.options).split(',') : [],
              answer: row.Answer || row.answer || '',
              hint: row.Hint || row.hint || ''
            }))
          };
          addReadingPassage(newPassage);
          setPassage(newPassage);
          setIsLibraryOpen(false);
        }
      }
    } catch (e) {
      console.error("Import failed", e);
      alert("Failed to import file. Please check the format.");
    }
    event.target.value = '';
  };

  if (!passage) return <div className="p-10 text-center text-slate-500">No reading passages available. Import one to start.</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)] overflow-hidden relative">
      
      {/* Strategy Modal */}
      <AnimatePresence>
        {isStrategyOpen && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="absolute inset-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-8 overflow-y-auto"
           >
              <div className="max-w-3xl mx-auto">
                 <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                       <GraduationCap className="text-primary" size={32} /> {dict.strategies}
                    </h2>
                    <button onClick={() => setIsStrategyOpen(false)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">
                       <X size={24} />
                    </button>
                 </div>
                 <div className="grid grid-cols-1 gap-8">
                    {readingTips.map((section, idx) => (
                       <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                          <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                             <BookOpen size={20} /> {section.title}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {section.tips.map((t, i) => (
                                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl">
                                   <div className="font-bold text-slate-900 dark:text-slate-100 mb-2">{t.subtitle}</div>
                                   <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t.content}</p>
                                </div>
                             ))}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Library Modal */}
      <AnimatePresence>
        {isLibraryOpen && (
          <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                  <Library className="text-primary" /> {dict.passageLibrary}
                </h2>
                <button onClick={() => setIsLibraryOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <X size={24} />
                </button>
             </div>
             
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
               <span className="text-sm text-slate-500">{readingPassages.length} Passages Available</span>
               <div className="flex items-center gap-2">
                  <div className="relative">
                    <button onClick={() => setShowTemplateMenu(!showTemplateMenu)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                      <Download size={16} /> Template
                    </button>
                    {showTemplateMenu && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
                        <button onClick={() => { downloadTemplate('reading', 'xlsx'); setShowTemplateMenu(false); }} className="px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 w-full hover:text-primary">Excel (.xlsx)</button>
                        <button onClick={() => { downloadTemplate('reading', 'json'); setShowTemplateMenu(false); }} className="px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 w-full hover:text-primary">JSON (.json)</button>
                      </div>
                    )}
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition cursor-pointer shadow-md">
                    <Upload size={16} />
                    {dict.importPassage}
                    <input type="file" accept=".json, .xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                  </label>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-10">
                {readingPassages.map(p => (
                  <div key={p.id} className={`p-5 rounded-xl border-2 transition-all group ${passage.id === p.id ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50'}`}>
                    {editingId === p.id ? (
                       <div className="flex gap-2">
                          <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="flex-1 px-2 py-1 border rounded text-slate-900 dark:text-white bg-transparent" />
                          <div className="flex gap-2">
                             <button onClick={() => saveEditing(p.id)} className="px-3 py-1 bg-green-600 text-white rounded text-xs">Save</button>
                             <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-slate-200 text-slate-600 rounded text-xs">Cancel</button>
                          </div>
                       </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{p.category || 'General'}</span>
                          <div className="flex gap-2">
                              <button onClick={() => startEditing(p)} className="p-1 text-slate-400 hover:text-primary"><Pencil size={16}/></button>
                              <button onClick={() => handleDelete(p.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                          </div>
                        </div>
                        <div onClick={() => { setPassage(p); setAnswers({}); setSubmitted(false); setIsLibraryOpen(false); }} className="cursor-pointer">
                          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors text-slate-900 dark:text-white">{p.title}</h3>
                          <p className="text-sm text-slate-500 line-clamp-2">{p.content}</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
             </div>
          </div>
        )}
      </AnimatePresence>

      {/* Passage Column */}
      <div className="lg:w-1/2 flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
           <div className="flex items-center gap-2 overflow-hidden"><button onClick={() => setIsLibraryOpen(true)} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white dark:hover:bg-slate-900 transition"><Library size={16} className="text-primary" /><h2 className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">{passage.title}</h2><ChevronDown size={14} className="text-slate-400" /></button></div>
           <div className="flex gap-2"><button onClick={() => setIsStrategyOpen(!isStrategyOpen)} className="p-2 rounded border shadow-sm transition text-slate-500 hover:text-primary bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"><GraduationCap size={16} /></button></div>
        </div>
        <div ref={contentRef} className="flex-1 overflow-y-auto p-8 prose dark:prose-invert max-w-none font-serif leading-loose text-lg select-text cursor-text text-slate-800 dark:text-slate-200">
          {passage.content.split('\n').filter(p => p.trim()).map((para, i) => <p key={i} className="mb-6">{para}</p>)}
        </div>
        {passage.keywords && (
          <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Key size={12} /> {dict.keywordTable}</h4>
            <div className="flex flex-wrap gap-2">{passage.keywords.map((k, i) => (<span key={i} className="text-xs px-2 py-1 bg-white dark:bg-slate-900 border rounded border-slate-200 dark:border-slate-800 text-slate-500"><span className="font-bold text-slate-900 dark:text-slate-100">{k.word}</span> = {k.synonym}</span>))}</div>
          </div>
        )}
      </div>

      {/* Questions Column */}
      <div className="lg:w-1/2 flex flex-col bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center"><h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{dict.questions}</h3><div className="text-xs font-mono bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded text-slate-500 border border-slate-200 dark:border-slate-800">{Object.keys(answers).length}/{passage.questions.length} Answered</div></div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {passage.questions.map((q, idx) => {
            const isCorrect = submitted && answers[q.id] === q.answer;
            return (
              <div key={q.id} className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800 last:border-0">
                <div className="flex gap-3"><span className="font-bold text-white bg-primary h-6 w-6 rounded flex items-center justify-center text-sm flex-shrink-0">{idx + 1}</span><p className="font-medium text-slate-900 dark:text-slate-100 leading-relaxed">{q.question}</p></div>
                <div className="pl-9 space-y-2">{q.options?.map(opt => (<label key={opt} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${answers[q.id] === opt ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900'}`}><input type="radio" name={`q-${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => handleSelect(q.id, opt)} className="accent-primary w-4 h-4" disabled={submitted} /><span className="text-sm text-slate-900 dark:text-slate-100">{opt}</span></label>))}</div>
                {!submitted && q.hint && (<div className="pl-9 mt-2"><div className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-primary cursor-help group transition-colors"><Lightbulb size={12} /><span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">{q.hint}</span><span className="group-hover:hidden">{dict.hint}</span></div></div>)}
                {submitted && (<div className="pl-9 mt-3 bg-white dark:bg-slate-900 p-3 rounded-lg text-sm border border-slate-200 dark:border-slate-800">{isCorrect ? (<div className="text-secondary flex items-center gap-2 font-bold"><CheckCircle size={16}/> {dict.correct}</div>) : (<div className="space-y-1"><div className="text-red-500 flex items-center gap-2 font-bold"><XCircle size={16}/> {dict.typo}</div><div className="text-slate-900 dark:text-slate-100">{dict.answer}: <span className="font-mono font-bold">{q.answer}</span></div></div>)}</div>)}
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"><button onClick={checkScore} disabled={submitted} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-hover disabled:opacity-50 transition-all shadow-lg shadow-primary/20">{submitted ? dict.reviewAnswers : dict.submitAnswers}</button></div>
      </div>
    </div>
  );
};