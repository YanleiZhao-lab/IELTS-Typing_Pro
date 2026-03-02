import React, { useState, useMemo } from 'react';
import { evaluateWriting, generateModelAnswer, generateWritingStructure } from '../../services/geminiService';
import { FeedbackResponse, IELTSWritingTask } from '../../types';
import { Loader2, Send, CheckCircle, Lightbulb, BookOpen, FileText, Copy, Library, X, Upload, Download, GraduationCap, Pencil, Trash2, Sparkles, Wand2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { t } from '../../utils/translations';
import { writingTips } from '../../data/mockData';
import { AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { downloadTemplate } from '../../utils/fileHelpers';

export const Writing: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<IELTSWritingTask | null>(null);
  const [essay, setEssay] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FeedbackResponse | null>(null);
  const [showModel, setShowModel] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'tips'>('write');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [filterType, setFilterType] = useState<'All' | 'Task 1' | 'Task 2'>('All');
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  
  // Mobile View State
  const [mobileTab, setMobileTab] = useState<'task' | 'editor'>('task');
  
  // AI Generation State
  const [isGeneratingModel, setIsGeneratingModel] = useState(false);
  const [generatedModel, setGeneratedModel] = useState<string | null>(null);
  
  // AI Structure State
  const [isGeneratingStructure, setIsGeneratingStructure] = useState(false);
  const [dynamicStructure, setDynamicStructure] = useState<string[] | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editCategory, setEditCategory] = useState('');

  const { language, writingTasks, addWritingTask, updateWritingTask, deleteWritingTask } = useStore();
  const dict = t(language);

  React.useEffect(() => {
      if (!selectedTask && writingTasks.length > 0) {
          setSelectedTask(writingTasks[0]);
          setDynamicStructure(null);
      } else if (selectedTask && !writingTasks.find(t => t.id === selectedTask.id)) {
          setSelectedTask(writingTasks[0] || null);
          setDynamicStructure(null);
      }
  }, [writingTasks, selectedTask]);

  const filteredTasks = useMemo(() => {
    if (filterType === 'All') return writingTasks;
    return writingTasks.filter(t => t.type === filterType);
  }, [writingTasks, filterType]);

  const handleSubmit = async () => { if (!essay.trim() || !selectedTask) return; setIsLoading(true); setResult(null); const response = await evaluateWriting(selectedTask.prompt, essay, selectedTask.type, language); setResult(response); setIsLoading(false); setActiveTab('write'); };
  
  const handleGenerateModel = async () => {
    if (!selectedTask) return;
    setIsGeneratingModel(true);
    const answer = await generateModelAnswer(selectedTask.prompt, selectedTask.type);
    setGeneratedModel(answer);
    setIsGeneratingModel(false);
  };

  const handleGenerateStructure = async () => {
    if (!selectedTask) return;
    setIsGeneratingStructure(true);
    const structure = await generateWritingStructure(selectedTask.prompt, selectedTask.type);
    setDynamicStructure(structure);
    setIsGeneratingStructure(false);
  };

  const startEditing = (task: IELTSWritingTask) => { setEditingId(task.id); setEditCategory(task.category); };
  const saveEditing = (id: string | number) => { updateWritingTask(id, { category: editCategory as any }); setEditingId(null); };
  const handleDelete = (id: string | number) => { if(window.confirm(dict.confirmDelete)) deleteWritingTask(id); };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => { 
    const file = event.target.files?.[0];
    if (!file) return;
    const isJson = file.name.endsWith('.json');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    try {
      if (isJson) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const tasks = Array.isArray(parsed) ? parsed : [parsed];
        tasks.forEach((t: any) => addWritingTask({...t, id: `custom-${Date.now()}-${Math.random()}`}));
        setIsLibraryOpen(false);
      } else if (isExcel) {
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet) as any[];
        json.forEach((row: any) => {
           addWritingTask({
             id: `custom-${Date.now()}-${Math.random()}`,
             type: row.Type || 'Task 2',
             category: row.Category || 'Discussion',
             prompt: row.Prompt || row.prompt || '',
             structureGuide: (row.Structure || '').split('|'),
             recommendedVocab: (row.Vocab || '').split('|'),
             modelAnswer: row.ModelAnswer || ''
           });
        });
        setIsLibraryOpen(false);
      }
    } catch (e) {
      console.error(e);
      alert("Import failed");
    }
    event.target.value = '';
  }; 

  if (!selectedTask) return <div className="p-10 text-center text-slate-500">No writing tasks available. Please import tasks from the library.</div>;
  
  const currentStructure = dynamicStructure || selectedTask.structureGuide;

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-90px)] md:h-[calc(100vh-100px)] relative">
      
      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
         <button 
           onClick={() => setMobileTab('task')}
           className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mobileTab === 'task' ? 'bg-white dark:bg-slate-900 shadow text-primary' : 'text-slate-500 dark:text-slate-400'}`}
         >
           {dict.taskPrompt} & {dict.tips}
         </button>
         <button 
           onClick={() => setMobileTab('editor')}
           className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mobileTab === 'editor' ? 'bg-white dark:bg-slate-900 shadow text-primary' : 'text-slate-500 dark:text-slate-400'}`}
         >
           {dict.writeNow}
         </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden relative">
        <AnimatePresence>
          {isLibraryOpen && (
            <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white"><Library className="text-primary" /> {dict.taskLibrary}</h2><button onClick={() => setIsLibraryOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"><X size={24} /></button></div>
              <div className="flex flex-wrap justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex gap-2">{['All', 'Task 1', 'Task 2'].map(f => (<button key={f} onClick={() => setFilterType(f as any)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterType === f ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>{f === 'All' ? 'All' : f}</button>))}</div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                      <button onClick={() => setShowTemplateMenu(!showTemplateMenu)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                        <Download size={16} /> Template
                      </button>
                      {showTemplateMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
                          <button onClick={() => { downloadTemplate('writing', 'xlsx'); setShowTemplateMenu(false); }} className="px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 w-full hover:text-primary">Excel (.xlsx)</button>
                          <button onClick={() => { downloadTemplate('writing', 'json'); setShowTemplateMenu(false); }} className="px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 w-full hover:text-primary">JSON (.json)</button>
                        </div>
                      )}
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition cursor-pointer shadow-md">
                      <Upload size={16} />
                      {dict.importTask}
                      <input type="file" accept=".json, .xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-10">
                {filteredTasks.map(task => (
                  <div key={task.id} className={`p-5 rounded-xl border-2 transition-all group ${selectedTask.id === task.id ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50'}`}>
                    {editingId === task.id ? (
                      <div className="flex flex-col gap-2">
                          <input value={editCategory} onChange={e => setEditCategory(e.target.value)} className="px-2 py-1 border rounded dark:bg-slate-950 dark:text-white"/>
                          <div className="flex gap-2">
                            <button onClick={() => saveEditing(task.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Save</button>
                            <button onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-600 px-3 py-1 rounded text-xs">Cancel</button>
                          </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded border ${task.type === 'Task 1' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>{task.type}</span>
                          <div className="flex gap-2">
                            <button onClick={() => startEditing(task)} className="p-1 text-slate-400 hover:text-primary"><Pencil size={14}/></button>
                            <button onClick={() => handleDelete(task.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                          </div>
                        </div>
                        <div onClick={() => { setSelectedTask(task); setShowModel(false); setResult(null); setEssay(''); setIsLibraryOpen(false); setGeneratedModel(null); setDynamicStructure(null); setMobileTab('task'); }} className="cursor-pointer">
                          <h3 className="font-bold text-slate-900 dark:text-white mb-1">{task.category}</h3>
                          <p className="text-sm text-slate-500 line-clamp-3">{task.prompt}</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Sidebar (Task & Tips) - Hidden on mobile if 'editor' tab selected */}
        <div className={`${mobileTab === 'task' ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 flex-col h-full`}>
          <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-4 custom-scrollbar">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-3"><h3 className="text-xs font-bold text-slate-500 uppercase">{dict.taskPrompt}</h3><button onClick={() => setIsLibraryOpen(true)} className="text-xs flex items-center gap-1 text-primary hover:underline font-medium"><Library size={14} /> {dict.selectTask}</button></div>
                <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-2"><span className={`text-xs font-bold px-2 py-0.5 rounded border ${selectedTask.type === 'Task 1' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>{selectedTask.type}</span><span className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedTask.category}</span></div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm font-serif">{selectedTask.prompt}</p>
                </div>
                {selectedTask.imageUri && <div className="mb-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white"><img src={selectedTask.imageUri} alt="Task Visual" className="w-full h-auto object-cover" /></div>}
              </div>
              
              {/* Task specific tips / Structure Guide */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800 overflow-hidden">
                  <div className="p-4 bg-blue-100/50 dark:bg-blue-900/20 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
                        <Lightbulb size={16} /> {dict.structureTips}
                    </div>
                    <button 
                      onClick={handleGenerateStructure} 
                      disabled={isGeneratingStructure}
                      className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isGeneratingStructure ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                        AI 生成思路
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {currentStructure.map((tip, idx) => (
                      <div key={idx} className="flex gap-3 items-start text-sm text-slate-700 dark:text-slate-300">
                          <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[24px] text-center mt-0.5">{idx + 1}</span>
                          <span>{tip}</span>
                      </div>
                    ))}
                    {dynamicStructure && (
                        <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-600 dark:text-blue-400 italic">Tips generated by AI</p>
                        </div>
                    )}
                  </div>
              </div>

              {/* Static General Tips */}
              <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800 overflow-hidden">
                <div className="p-4 bg-amber-100/50 dark:bg-amber-900/20 flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
                  <GraduationCap size={16} /> {dict.generalTips}
                </div>
                <div className="p-4 space-y-4">
                    {writingTips.map((section, idx) => (
                      <div key={idx}>
                        <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">{section.title}</h4>
                        <div className="space-y-2">
                            {section.tips.map((t, i) => (
                              <div key={i} className="text-sm text-slate-700 dark:text-slate-300">
                                <span className="font-bold text-slate-900 dark:text-slate-100">{t.subtitle}:</span> {t.content}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
          </div>
        </div>

        {/* Editor (Writing & Model) - Hidden on mobile if 'editor' tab selected */}
        <div className={`${mobileTab === 'editor' ? 'flex' : 'hidden'} md:flex w-full md:w-2/3 flex-col gap-4 h-full`}>
          <div className="flex gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-lg w-fit border border-slate-200 dark:border-slate-800">
            <button onClick={() => setActiveTab('write')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'write' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary ring-1 ring-slate-200 dark:ring-slate-800' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}>{dict.writeNow}</button>
            <button onClick={() => { setShowModel(true); setActiveTab('tips'); }} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'tips' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary ring-1 ring-slate-200 dark:ring-slate-800' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}>{dict.modelAnswer}</button>
          </div>
          <div className="flex-1 relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col shadow-sm">
            {activeTab === 'write' && (
              <>
                <textarea value={essay} onChange={(e) => setEssay(e.target.value)} placeholder={dict.startWriting} className="flex-1 w-full p-6 resize-none focus:outline-none bg-transparent font-serif text-lg leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-400" spellCheck={false} />
                {result && (
                  <div className="absolute inset-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-y-auto p-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800"><h3 className="text-xl font-bold flex items-center gap-2 text-primary"><CheckCircle /> {dict.aiEvaluation}</h3><button onClick={() => setResult(null)} className="text-sm text-slate-500 hover:text-primary underline">{dict.cancel}</button></div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800"><div className="text-2xl font-bold text-primary">{result.score}</div><div className="text-xs text-slate-500 uppercase tracking-wider">{dict.band}</div></div>
                          <div className="col-span-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-left"><div className="text-xs text-slate-500 uppercase mb-1 tracking-wider">{dict.feedback}</div><p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{result.feedback}</p></div>
                        </div>
                        {result.correctedText && <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl p-6"><div className="text-xs font-bold text-secondary uppercase mb-2 tracking-wider">{dict.betterVersion}</div><p className="text-slate-800 dark:text-slate-200 font-serif leading-relaxed">{result.correctedText}</p></div>}
                    </div>
                  </div>
                )}
              </>
            )}
            {activeTab === 'tips' && (
              <div className="flex-1 p-6 overflow-y-auto bg-amber-50/30 dark:bg-amber-900/5 relative">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-amber-700 dark:text-amber-500 flex items-center gap-2"><FileText /> {dict.modelAnswer}</h3>
                      <div className="flex gap-2">
                        <button onClick={handleGenerateModel} disabled={isGeneratingModel} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover disabled:opacity-50 transition">
                          {isGeneratingModel ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                          {isGeneratingModel ? dict.generating : dict.generateAIModel}
                        </button>
                        <button className="text-slate-400 hover:text-primary" onClick={() => navigator.clipboard.writeText(generatedModel || selectedTask.modelAnswer)}><Copy size={18} /></button>
                      </div>
                    </div>
                    
                    {showModel || generatedModel ? (
                      <div className="prose dark:prose-invert prose-lg max-w-none font-serif">
                        {(generatedModel || selectedTask.modelAnswer).split('\n\n').map((para, i) => <p key={i} className="mb-4 text-slate-800 dark:text-slate-200 leading-loose">{para}</p>)}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <p className="text-slate-500 max-w-md text-center">Try to write your own version first.</p>
                        <div className="flex gap-4">
                          <button onClick={() => setShowModel(true)} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition">{dict.showModel}</button>
                          <button onClick={handleGenerateModel} disabled={isGeneratingModel} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-hover transition shadow-lg shadow-primary/20 flex items-center gap-2">
                            <Sparkles size={16} /> {dict.generateAIModel}
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
            <span className="text-slate-500 text-sm font-mono">{essay.split(/\s+/).filter(w => w.length > 0).length} {dict.words}</span>
            <button onClick={handleSubmit} disabled={isLoading || !essay.trim()} className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg shadow-primary/30">{isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}{isLoading ? dict.grading : dict.submitReview}</button>
          </div>
        </div>
      </div>
    </div>
  );
};