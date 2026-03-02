import React, { useState, useEffect, useRef, useMemo } from 'react';
import { evaluateSpeaking, createChatSession } from '../../services/geminiService';
import { FeedbackResponse, IELTSSpeakingQuestion, ChatMessage } from '../../types';
import { Mic, Square, Loader2, Library, X, Upload, Download, Lightbulb, ChevronDown, GraduationCap, User, MessageSquare, Bot, Send, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { t } from '../../utils/translations';
import { speakingTips } from '../../data/mockData';
import { AnimatePresence, motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { downloadTemplate } from '../../utils/fileHelpers';

export const Speaking: React.FC = () => {
  const { language, speakingTopics, addSpeakingTopic, updateSpeakingTopic, deleteSpeakingTopic } = useStore();
  const dict = t(language);
  const [currentPart, setCurrentPart] = useState<IELTSSpeakingQuestion | null>(null);
  const [mode, setMode] = useState<'practice' | 'mock'>('practice');
  
  // Practice Mode State
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<FeedbackResponse | null>(null);
  
  // Mock/Chat Mode State
  const [chatSession, setChatSession] = useState<any | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatRecording, setIsChatRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [filterPart, setFilterPart] = useState<'All' | 1 | 2 | 3>('All');
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Edit State
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editTopic, setEditTopic] = useState('');

  React.useEffect(() => {
      // If current part deleted or null, reset to first available
      if (!currentPart && speakingTopics.length > 0) {
          setCurrentPart(speakingTopics[0]);
      } else if (currentPart && !speakingTopics.find(t => t.id === currentPart.id)) {
          setCurrentPart(speakingTopics[0] || null);
      }
  }, [speakingTopics, currentPart]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; 
      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
             const finalText = event.results[i][0].transcript;
             setTranscript(prev => prev + ' ' + finalText);
          }
        }
      };
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleRecording = () => {
    if (isRecording) { 
      recognitionRef.current?.stop(); 
      setIsRecording(false); 
    } else { 
      setTranscript(''); 
      setResult(null); 
      recognitionRef.current?.start(); 
      setIsRecording(true); 
    }
  };

  const handleEvaluate = async () => { 
    if (!transcript || !currentPart) return; 
    setIsLoading(true); 
    const response = await evaluateSpeaking(currentPart.topic, transcript, language); 
    setResult(response); 
    setIsLoading(false); 
  };
  
  const startMockExam = async () => {
    setMode('mock');
    setMessages([]);
    const session = createChatSession(language);
    setChatSession(session);
    
    setIsProcessing(true);
    try {
      const response = await session.sendMessage({ message: "Start the exam. Introduce yourself briefly and ask for my name." });
      const text = response.text || "Hello, I am your examiner. What is your name?";
      setMessages([{ role: 'model', text }]);
      speakText(text);
    } catch (e) {
      console.error(e);
    }
    setIsProcessing(false);
  };

  const toggleChatRecording = () => {
    if (isChatRecording) {
      recognitionRef.current?.stop();
      setIsChatRecording(false);
      setTimeout(handleSendChatMessage, 500);
    } else {
      setTranscript(''); 
      recognitionRef.current?.start();
      setIsChatRecording(true);
    }
  };

  const handleSendChatMessage = async () => {
    if (!transcript.trim() || !chatSession) return;
    
    const userMsg = transcript.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setTranscript('');
    setIsProcessing(true);

    try {
      const result = await chatSession.sendMessage({ message: userMsg });
      const aiMsg = result.text;
      if (aiMsg) {
        setMessages(prev => [...prev, { role: 'model', text: aiMsg }]);
        speakText(aiMsg);
      }
    } catch (e) {
      console.error("Chat error", e);
    }
    setIsProcessing(false);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const startEditing = (topic: IELTSSpeakingQuestion) => { setEditingId(topic.id); setEditTopic(topic.topic); };
  const saveEditing = (id: string | number) => { updateSpeakingTopic(id, { topic: editTopic }); setEditingId(null); };
  const handleDelete = (id: string | number) => { if(window.confirm(dict.confirmDelete)) deleteSpeakingTopic(id); };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => { 
     const file = event.target.files?.[0];
    if (!file) return;
    const isJson = file.name.endsWith('.json');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    try {
      if (isJson) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        addSpeakingTopic({...parsed, id: `custom-${Date.now()}`});
        setIsLibraryOpen(false);
      } else if (isExcel) {
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet) as any[];
        json.forEach((row: any) => {
            addSpeakingTopic({
              id: `custom-${Date.now()}-${Math.random()}`,
              part: row.Part || 1,
              topic: row.Topic || 'Custom Topic',
              questions: (row.Questions || '').split('|')
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

  const filteredTopics = useMemo(() => { if (filterPart === 'All') return speakingTopics; return speakingTopics.filter(t => t.part === filterPart); }, [speakingTopics, filterPart]);

  if (!currentPart) return <div className="p-10 text-center text-slate-500 flex flex-col items-center justify-center h-full"><p>No Speaking Topics available.</p><button onClick={() => setIsLibraryOpen(true)} className="mt-4 text-primary hover:underline">Open Library to Import</button></div>;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 relative overflow-hidden">
       
       <AnimatePresence>
        {isLibraryOpen && (
          <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white"><Library className="text-primary" /> {dict.speakingLibrary}</h2>
               <button onClick={() => setIsLibraryOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"><X size={24} /></button>
             </div>
             <div className="flex flex-wrap justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
               <div className="flex gap-2">
                 {(['All', 1, 2, 3] as const).map(p => (
                   <button key={p} onClick={() => setFilterPart(p)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterPart === p ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>{p === 'All' ? 'All' : `Part ${p}`}</button>
                 ))}
               </div>
               <div className="flex items-center gap-2">
                  <div className="relative">
                    <button onClick={() => setShowTemplateMenu(!showTemplateMenu)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                      <Download size={16} /> Template
                    </button>
                    {showTemplateMenu && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
                        <button onClick={() => { downloadTemplate('speaking', 'xlsx'); setShowTemplateMenu(false); }} className="px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 w-full hover:text-primary">Excel (.xlsx)</button>
                        <button onClick={() => { downloadTemplate('speaking', 'json'); setShowTemplateMenu(false); }} className="px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 w-full hover:text-primary">JSON (.json)</button>
                      </div>
                    )}
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition cursor-pointer shadow-md">
                    <Upload size={16} />
                    {dict.importTopic}
                    <input type="file" accept=".json, .xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                  </label>
               </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-10">
                {filteredTopics.map(t => (
                  <div key={t.id} className={`p-5 rounded-xl border-2 transition-all group flex flex-col gap-2 ${currentPart?.id === t.id ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50'}`}>
                    {editingId === t.id ? (
                        <div className="flex gap-2">
                           <input value={editTopic} onChange={e => setEditTopic(e.target.value)} className="flex-1 px-2 py-1 border rounded text-slate-900 dark:text-white bg-transparent" />
                           <div className="flex gap-2">
                              <button onClick={() => saveEditing(t.id)} className="px-3 py-1 bg-green-600 text-white rounded text-xs">Save</button>
                              <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-slate-200 text-slate-600 rounded text-xs">Cancel</button>
                           </div>
                        </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                           <span className="text-xs font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Part {t.part}</span>
                           <div className="flex gap-2">
                              <button onClick={() => startEditing(t)} className="p-1 text-slate-400 hover:text-primary"><Pencil size={16}/></button>
                              <button onClick={() => handleDelete(t.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                           </div>
                        </div>
                        <div onClick={() => { setCurrentPart(t); setTranscript(''); setResult(null); setIsLibraryOpen(false); setMode('practice'); }} className="cursor-pointer">
                           <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t.topic}</h3>
                           <div className="text-xs text-slate-500">{t.questions.length} questions</div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
             </div>
          </div>
        )}
       </AnimatePresence>

       {/* Sidebar for Tips */}
       <div className="hidden lg:flex flex-col w-1/4 min-w-[250px] bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><Lightbulb size={16} /> {dict.lizTips}</h3>
          <div className="space-y-4">
             {speakingTips.map((section, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                   <h4 className="text-xs font-bold text-primary mb-2">{section.title}</h4>
                   <ul className="space-y-3">
                      {section.tips.map((tip, i) => (
                         <li key={i} className="text-sm">
                            <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">{tip.subtitle}</span>
                            <span className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{tip.content}</span>
                         </li>
                      ))}
                   </ul>
                </div>
             ))}
          </div>
       </div>

       <div className="flex-1 flex flex-col gap-6 overflow-y-auto scroll-smooth p-4 lg:p-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-1 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 shrink-0 w-fit mx-auto lg:mx-0">
            <button onClick={() => setMode('practice')} className={`px-6 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${mode === 'practice' ? 'bg-slate-100 dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
               <Mic size={16} /> {dict.practiceMode}
            </button>
            <button onClick={() => setMode('mock')} className={`px-6 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${mode === 'mock' ? 'bg-slate-100 dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
               <Bot size={16} /> {dict.mockMode}
            </button>
          </div>

          {mode === 'practice' ? (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-3">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">Part {currentPart.part}</span>
                      <button onClick={() => setIsLibraryOpen(true)} className="flex items-center gap-2 text-slate-900 dark:text-white hover:text-primary font-bold text-2xl transition-colors group">
                         {currentPart.topic}
                         <ChevronDown size={20} className="text-slate-400 group-hover:text-primary"/>
                      </button>
                   </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wide flex items-center gap-2"><User size={14}/> {dict.examinerQuestions}</h3>
                  <ul className="space-y-3">{currentPart.questions.map((q, i) => <li key={i} className="flex gap-3 text-slate-800 dark:text-slate-200 text-lg leading-relaxed"><span className="text-primary font-bold select-none">•</span>{q}</li>)}</ul>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col items-center justify-center gap-8 flex-1 min-h-[300px]">
                <div className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500/10' : 'bg-slate-50 dark:bg-slate-800'}`}>
                   {isRecording && <span className="absolute inset-0 rounded-full animate-ping bg-red-500/20"></span>}
                   <button onClick={toggleRecording} className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all active:scale-95 shadow-xl z-10 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-hover'}`}>{isRecording ? <Square fill="currentColor" size={28} /> : <Mic size={32} />}</button>
                </div>
                <div className="text-center w-full max-w-2xl space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isRecording ? dict.listeningState : dict.tapToSpeak}</p>
                  <AnimatePresence mode="wait">
                    {transcript ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl text-left w-full border border-slate-200 dark:border-slate-800 min-h-[120px] relative">
                        <MessageSquare className="absolute top-4 right-4 text-slate-300 dark:text-slate-700 opacity-50" size={24} />
                        <p className="text-slate-800 dark:text-slate-200 text-lg leading-relaxed font-serif">{transcript}</p>
                      </motion.div>
                    ) : (
                       <div className="h-[120px] flex items-center justify-center text-slate-400 italic text-sm border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">(Transcript will appear here...)</div>
                    )}
                  </AnimatePresence>
                </div>
                {!isRecording && transcript && (
                  <button onClick={handleEvaluate} disabled={isLoading} className="bg-white dark:bg-slate-900 text-primary border-2 border-primary hover:bg-primary hover:text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">{isLoading ? <Loader2 className="animate-spin" /> : dict.evaluateAnswer}</button>
                )}
              </div>

              {result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg mb-8">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                      <h3 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white"><div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Lightbulb size={24} /></div>{dict.feedback}</h3>
                      <div className="flex flex-col items-end bg-slate-50 dark:bg-slate-950 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800">
                         <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Est. Band Score</span>
                         <span className="text-4xl font-bold text-green-500">{result.score}</span>
                      </div>
                   </div>
                   <div className="space-y-6">
                       <div><h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Assessment</h4><p className="text-slate-800 dark:text-slate-200 text-lg leading-relaxed">{result.feedback}</p></div>
                       {result.correctedText && <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 p-6 rounded-xl"><h4 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase mb-3 flex items-center gap-2">{dict.suggestedVocab}</h4><p className="text-slate-800 dark:text-slate-200 font-serif italic leading-relaxed">{result.correctedText}</p></div>}
                   </div>
                </motion.div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm h-full min-h-[500px]">
               {!chatSession ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                   <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 animate-pulse">
                     <Bot size={48} />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{dict.mockMode}</h3>
                   <p className="text-slate-500 max-w-md">
                     The AI Examiner will simulate a real IELTS speaking test (Parts 1-3). The session is free-flowing. Please ensure your microphone is ready.
                   </p>
                   <button onClick={startMockExam} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-hover transition shadow-lg shadow-primary/30 flex items-center gap-2">
                     {dict.startMockExam} <Send size={18} />
                   </button>
                 </div>
               ) : (
                 <>
                   <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-950">
                      {messages.map((msg, idx) => (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                           <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
                              <div className="text-xs opacity-70 mb-1 font-bold">{msg.role === 'user' ? dict.you : dict.examiner}</div>
                              <p className="leading-relaxed">{msg.text}</p>
                           </div>
                        </motion.div>
                      ))}
                      {isProcessing && (
                        <div className="flex justify-start w-full">
                           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-2 items-center">
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                           </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                   </div>
                   <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-4">
                      <button 
                        onClick={toggleChatRecording} 
                        className={`p-4 rounded-full transition-all shadow-md ${isChatRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-primary text-white hover:bg-primary-hover'}`}
                      >
                         {isChatRecording ? <Square size={24} fill="currentColor" /> : <Mic size={24} />}
                      </button>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-slate-500 flex items-center gap-2">
                         {isChatRecording ? (
                           <span className="text-slate-900 dark:text-slate-100 animate-pulse font-medium">Listening... {transcript}</span>
                         ) : (
                           <span>{dict.chatPlaceholder}</span>
                         )}
                      </div>
                   </div>
                 </>
               )}
            </div>
          )}
       </div>
    </div>
  );
};