import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Headphones, Play, Pause, SkipForward, SkipBack, Volume2, HelpCircle, CheckCircle, AlertCircle, Library, X, Upload, Download, Pencil, Trash2, FileAudio, GraduationCap } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { t } from '../../utils/translations';
import { listeningTips } from '../../data/mockData';
import { QuestionType, IELTSListeningSection } from '../../types';
import { AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { downloadTemplate } from '../../utils/fileHelpers';

export const Listening: React.FC = () => {
  const { language, listeningSections, addListeningSection, deleteListeningSection, updateListeningSection } = useStore();
  const dict = t(language);
  
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showHints, setShowHints] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'sections' | 'tips'>('sections');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  
  // Audio State
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState(false);
  
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSection = listeningSections[currentSectionIndex];

  // Determine audio source: Local file overrides section source
  const activeAudioSrc = localAudioUrl || currentSection?.audioSrc;

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && !audioError) {
        audioRef.current.play().catch(e => {
            console.error("Audio play failed", e);
            setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioError]);

  useEffect(() => {
      setAudioError(false);
      if (audioRef.current) {
          audioRef.current.currentTime = 0;
          setProgress(0);
          setIsPlaying(false);
      }
      setLocalAudioUrl(null); // Reset local audio when section changes
  }, [currentSectionIndex]);

  const handleTimeUpdate = () => {
      if (audioRef.current) {
          const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setProgress(isNaN(p) ? 0 : p);
      }
  };

  const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
  };

  const handleLocalAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalAudioUrl(url);
      setAudioError(false);
      setIsPlaying(false);
      // Clean up old URL if needed? Browser handles blob GC eventually, but could revoke.
    }
    event.target.value = '';
  };

  const handleAnswerChange = (qId: number, val: string) => { setAnswers(prev => ({ ...prev, [qId]: val })); };
  
  const startEditing = (sec: IELTSListeningSection) => { setEditingId(sec.id); setEditTitle(sec.title); };
  const saveEditing = (id: string | number) => { updateListeningSection(id, { title: editTitle }); setEditingId(null); };
  const handleDelete = (id: string | number) => { if(window.confirm(dict.confirmDelete)) { deleteListeningSection(id); if(currentSectionIndex >= listeningSections.length - 1) setCurrentSectionIndex(0); }};

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isJson = file.name.endsWith('.json');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    try {
      if (isJson) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        addListeningSection({...parsed, id: Date.now()});
        setIsLibraryOpen(false);
      } else if (isExcel) {
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet) as any[];
        
        if(json.length > 0) {
           const firstRow = json[0];
           const newSection: IELTSListeningSection = {
             id: Date.now(),
             title: firstRow.SectionTitle || 'Custom Listening',
             description: firstRow.SectionDesc || '',
             audioSrc: firstRow.AudioURL || '',
             questions: json.map((row, idx) => ({
               id: Date.now() + idx,
               question: row.Question || '',
               type: (row.Type || 'FIB') as QuestionType,
               options: (row.Options ? row.Options.split(',') : []),
               answer: row.Answer || '',
               hint: row.Hint || ''
             }))
           };
           addListeningSection(newSection);
           setIsLibraryOpen(false);
        }
      }
    } catch (e) {
      console.error(e);
      alert("Import failed");
    }
    event.target.value = '';
  };

  if (!currentSection) return <div className="p-8 text-center text-slate-500">No Listening Sections Available. Import one to start.</div>;

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col gap-6 relative">
      <audio 
          ref={audioRef} 
          src={activeAudioSrc || undefined} 
          onTimeUpdate={handleTimeUpdate} 
          onEnded={handleEnded}
          onError={(e) => {
            console.error("Audio source failed to load", e);
            setAudioError(true);
            setIsPlaying(false);
          }}
      />

      <AnimatePresence>
        {isLibraryOpen && (
          <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white"><Library className="text-primary" /> Listening Library</h2>
                <button onClick={() => setIsLibraryOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"><X size={24} /></button>
             </div>
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
               <span className="text-sm text-slate-500">{listeningSections.length} Sections Available</span>
               <div className="flex items-center gap-2">
                  <div className="relative">
                    <button onClick={() => setShowTemplateMenu(!showTemplateMenu)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                      <Download size={16} /> Template
                    </button>
                    {showTemplateMenu && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
                        <button onClick={() => { downloadTemplate('listening', 'xlsx'); setShowTemplateMenu(false); }} className="px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 w-full hover:text-primary">Excel (.xlsx)</button>
                        <button onClick={() => { downloadTemplate('listening', 'json'); setShowTemplateMenu(false); }} className="px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 w-full hover:text-primary">JSON (.json)</button>
                      </div>
                    )}
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition cursor-pointer shadow-md">
                    <Upload size={16} />
                    Import Section
                    <input type="file" accept=".json, .xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                  </label>
               </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-10">
                {listeningSections.map((sec, idx) => (
                  <div key={sec.id} className={`p-5 rounded-xl border-2 transition-all group ${currentSectionIndex === idx ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50'}`}>
                    {editingId === sec.id ? (
                       <div className="flex gap-2">
                          <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="flex-1 px-2 py-1 border rounded text-slate-900 dark:text-white bg-transparent" />
                          <div className="flex gap-2">
                            <button onClick={() => saveEditing(sec.id)} className="px-3 py-1 bg-green-600 text-white rounded text-xs">Save</button>
                            <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-slate-200 text-slate-600 rounded text-xs">Cancel</button>
                          </div>
                       </div>
                    ) : (
                       <div className="flex justify-between items-start">
                          <div onClick={() => { setCurrentSectionIndex(idx); setSubmitted(false); setProgress(0); setIsPlaying(false); setIsLibraryOpen(false); }} className="cursor-pointer flex-1">
                             <div className="text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 w-fit mb-1">Section {idx + 1}</div>
                             <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors text-slate-900 dark:text-white">{sec.title}</h3>
                             <p className="text-sm text-slate-500 line-clamp-2">{sec.description}</p>
                          </div>
                          <div className="flex gap-2 ml-2">
                              <button onClick={() => startEditing(sec)} className="p-1.5 text-slate-400 hover:text-primary"><Pencil size={16}/></button>
                              <button onClick={() => handleDelete(sec.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                          </div>
                       </div>
                    )}
                  </div>
                ))}
             </div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-6 sticky top-0 z-10 border border-slate-200 dark:border-slate-800">
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20"><Headphones size={24} className="text-primary" /></div>
        <div className="flex items-center gap-4">
          <button onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 5; }} className="text-slate-400 hover:text-primary transition"><SkipBack size={20} /></button>
          <button onClick={() => !audioError && setIsPlaying(!isPlaying)} disabled={audioError} className={`w-12 h-12 flex items-center justify-center text-white rounded-full transition shadow-lg ${audioError ? 'bg-slate-300 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover shadow-primary/30'}`}>{isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}</button>
          <button onClick={() => { if (audioRef.current) audioRef.current.currentTime += 5; }} className="text-slate-400 hover:text-primary transition"><SkipForward size={20} /></button>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-1 w-full">
           <div className="flex justify-between text-xs text-slate-500 font-mono">
             <span className="font-bold text-slate-900 dark:text-slate-100">{currentSection.title}</span>
             {localAudioUrl && <span className="text-primary text-[10px] border border-primary px-1 rounded">LOCAL</span>}
           </div>
           {audioError ? (
              <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded border border-red-100 dark:border-red-900/50 w-full justify-center animate-in fade-in">
                <AlertCircle size={14} />
                <span>Audio failed to load. Please check your connection or load a local file.</span>
              </div>
           ) : (
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-700" onClick={(e) => {
                  if (audioRef.current) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const p = x / rect.width;
                      audioRef.current.currentTime = p * audioRef.current.duration;
                  }
              }}>
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
           )}
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-slate-500 hover:text-primary" title={dict.loadAudio}>
              <FileAudio size={20} />
            </button>
            <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleLocalAudioUpload} className="hidden" />
            <button onClick={() => setIsLibraryOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-slate-500 hover:text-primary"><Library size={20} /></button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
             <button onClick={() => setSidebarTab('sections')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${sidebarTab === 'sections' ? 'text-primary border-primary bg-primary/5' : 'text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Sections</button>
             <button onClick={() => setSidebarTab('tips')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${sidebarTab === 'tips' ? 'text-primary border-primary bg-primary/5' : 'text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{dict.tips}</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {sidebarTab === 'sections' ? (
              <>
                <div className="space-y-2">{listeningSections.map((sec, idx) => (<button key={sec.id} onClick={() => { setCurrentSectionIndex(idx); setSubmitted(false); setProgress(0); setIsPlaying(false); }} className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-all border ${idx === currentSectionIndex ? 'bg-white dark:bg-slate-900 text-primary border-primary shadow-sm ring-1 ring-primary/20' : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}>{dict.section} {idx + 1}</button>))}</div>
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-300 leading-relaxed border border-blue-100 dark:border-blue-800"><div className="font-bold mb-2 flex items-center gap-1"><HelpCircle size={12}/> Quick Tip</div>{currentSection.description}</div>
              </>
            ) : (
              <div className="space-y-4">
                 {listeningTips.map((section, idx) => (
                    <div key={idx} className="space-y-2">
                       <h4 className="text-xs font-bold text-slate-500 uppercase">{section.title}</h4>
                       <div className="space-y-2">
                          {section.tips.map((t, i) => (
                             <div key={i} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{t.subtitle}</div>
                                <p className="text-xs text-slate-500">{t.content}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col h-full overflow-hidden">
           <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white dark:bg-slate-900">
              <div className="mb-6"><h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">{currentSection.title}</h2><p className="text-slate-500">{currentSection.description}</p></div>
              {currentSection.questions.map((q, idx) => {
                const isCorrect = submitted && answers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim();
                return (
                  <div key={q.id} className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex gap-3 mb-3">
                      <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{idx + 1}</span>
                      <div className="flex-1 font-medium text-lg text-slate-900 dark:text-slate-100">
                        {q.question.split('______').map((part, i, arr) => (<React.Fragment key={i}>{part}{i < arr.length - 1 && (<input type="text" disabled={submitted || q.type === QuestionType.MultipleChoice} value={q.type === QuestionType.FillInTheBlank ? (answers[q.id] || '') : ''} onChange={(e) => handleAnswerChange(q.id, e.target.value)} className={`mx-2 border-b-2 bg-transparent text-center w-32 focus:outline-none font-mono text-primary font-bold ${q.type === QuestionType.MultipleChoice ? 'hidden' : 'border-slate-300 dark:border-slate-600 focus:border-primary'}`} placeholder="..." />)}</React.Fragment>))}
                      </div>
                    </div>
                    {q.type === QuestionType.MultipleChoice && (<div className="pl-9 space-y-2">{q.options?.map(opt => (<label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${answers[q.id] === opt ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'}`}><input type="radio" name={`q-${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => handleAnswerChange(q.id, opt)} disabled={submitted} className="accent-primary w-4 h-4" /><span className="text-slate-900 dark:text-slate-100 text-sm">{opt}</span></label>))}</div>)}
                    <div className="pl-9 mt-2"><button onClick={() => setShowHints(!showHints)} className="text-xs text-slate-400 hover:text-primary flex items-center gap-1"><HelpCircle size={12} /> {showHints ? q.hint : dict.showHint}</button></div>
                    {submitted && (<div className={`pl-9 mt-4 p-3 rounded-lg flex items-start gap-3 text-sm ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>{isCorrect ? <CheckCircle size={18} className="mt-0.5" /> : <AlertCircle size={18} className="mt-0.5" />}<div><p className="font-bold">{isCorrect ? dict.correct : dict.typo}</p>{!isCorrect && <p>{dict.answer}: <span className="font-bold">{q.answer}</span></p>}</div></div>)}
                  </div>
                );
              })}
           </div>
           <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end"><button onClick={() => setSubmitted(true)} disabled={submitted} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-hover disabled:opacity-50 shadow-lg shadow-primary/20 transition">{submitted ? dict.reviewAnswers : dict.submitAnswers}</button></div>
        </div>
      </div>
    </div>
  );
};