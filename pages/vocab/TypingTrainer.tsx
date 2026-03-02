import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Upload, AlertCircle, Book, Volume2, VolumeX, 
  ChevronDown, Download, Eye, EyeOff, ChevronLeft, ChevronRight, 
  Speaker, X, Library, BookOpen, Pencil, Trash2, Heart, BookX, Bookmark, Keyboard, Mic
} from 'lucide-react';
import { WordBook, WordItem } from '../../types';
import { t } from '../../utils/translations';
import { playKeySound, playErrorSound } from '../../utils/sound';
import * as XLSX from 'xlsx';
import { downloadTemplate } from '../../utils/fileHelpers';

const PAGE_SIZE = 20;

export const TypingTrainer: React.FC = () => {
  const { 
    currentBook, dictionaries, favorites, mistakes,
    addDictionary, updateDictionary, deleteDictionary,
    addMistake, toggleFavorite,
    updateStats, setWordBook, typingStats, 
    language, 
    // Granular Controls
    showTranslation, toggleShowTranslation,
    enableKeySound, toggleKeySound,
    enableTTS, toggleTTS,
    isBlindMode, toggleBlindMode 
  } = useStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [input, setInput] = useState('');
  const [isMistake, setIsMistake] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  // Edit State
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string, category: string }>({ name: '', category: '' });
  
  const dict = t(language);
  
  // Dynamic "Review" Books
  const favoritesBook: WordBook = useMemo(() => ({
    id: 'favorites',
    name: dict.favorites,
    description: 'Your collection of difficult words.',
    category: 'Review',
    words: favorites,
    count: favorites.length
  }), [favorites, dict.favorites]);

  const mistakesBook: WordBook = useMemo(() => ({
    id: 'mistakes',
    name: dict.mistakes,
    description: 'Words you typed incorrectly.',
    category: 'Review',
    words: Object.values(mistakes).sort((a: any, b: any) => b.errorCount - a.errorCount) as WordItem[],
    count: Object.keys(mistakes).length
  }), [mistakes, dict.mistakes]);

  const allDictionaries = useMemo(() => {
    // Filter out duplicates if any, though store handles it
    return [
      ...dictionaries,
      favoritesBook,
      mistakesBook
    ];
  }, [dictionaries, favoritesBook, mistakesBook]);

  const validBook = currentBook && currentBook.words.length > 0 ? currentBook : dictionaries[0];

  const categories = useMemo(() => {
    const cats = new Set<string>(['All', 'Review']);
    dictionaries.forEach(d => cats.add(d.category || 'Other'));
    return Array.from(cats);
  }, [dictionaries]);

  const filteredDictionaries = useMemo(() => {
    if (selectedCategory === 'All') return allDictionaries;
    return allDictionaries.filter(d => d.category === selectedCategory);
  }, [allDictionaries, selectedCategory]);

  const totalChapters = Math.max(1, Math.ceil(validBook.words.length / PAGE_SIZE));
  const chapterWords = useMemo(() => {
    const start = currentChapter * PAGE_SIZE;
    return validBook.words.slice(start, start + PAGE_SIZE);
  }, [validBook, currentChapter]);

  const currentWordObj = chapterWords[currentIndex % chapterWords.length];
  const targetWord = currentWordObj?.word || "";
  const isFavorite = favorites.some(w => w.word === targetWord);

  const fontSizeClass = useMemo(() => {
    const len = targetWord.length;
    if (len > 16) return "text-2xl sm:text-3xl md:text-5xl";
    if (len > 12) return "text-3xl sm:text-4xl md:text-6xl";
    if (len > 8) return "text-4xl sm:text-5xl md:text-7xl";
    return "text-5xl sm:text-6xl md:text-8xl";
  }, [targetWord]);

  const speakWord = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    if (enableTTS && targetWord) {
      speakWord(targetWord);
    }
  }, [targetWord, enableTTS, speakWord]);

  useEffect(() => {
    setCurrentIndex(0);
    setCurrentChapter(0);
    setInput('');
  }, [currentBook.id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => { 
      const file = event.target.files?.[0];
      if (!file) return;
      const isJson = file.name.endsWith('.json');
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

      try {
        let newBook: WordBook | null = null;
        if (isJson) {
          const text = await file.text();
          const parsed = JSON.parse(text) as WordBook;
          if (parsed.words && Array.isArray(parsed.words)) newBook = { ...parsed, id: `custom-${Date.now()}`, category: 'Custom' };
        } else if (isExcel) {
          const data = await file.arrayBuffer();
          const wb = XLSX.read(data);
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet) as any[];
          
          // Sort by Chapter if available
          if (json[0]?.Chapter) {
            json.sort((a, b) => (a.Chapter || 0) - (b.Chapter || 0));
          }
          
          const words = json.map(r => ({
             word: r.word || r.Word || r['单词'],
             translation: r.translation || r.Translation || r['翻译'],
             phonetic: r.phonetic || r.Phonetic || r['音标']
          })).filter(w => w.word && w.translation);
          
          if (words.length) newBook = { id: `custom-${Date.now()}`, name: file.name.replace(/\.[^/.]+$/, ""), category: 'Custom', words, count: words.length };
        }
        if (newBook) { addDictionary(newBook); setWordBook(newBook); setIsLibraryOpen(false); }
      } catch (e) { console.error(e); alert("Import failed"); }
      event.target.value = '';
  };

  const startEditing = (book: WordBook) => {
    setEditingBookId(book.id);
    setEditForm({ name: book.name, category: book.category || 'Custom' });
  };
  const saveEditing = (id: string) => {
    updateDictionary(id, { name: editForm.name, category: editForm.category });
    setEditingBookId(null);
  };
  const deleteDictionaryHandler = (id: string) => {
    if (window.confirm(dict.confirmDelete)) deleteDictionary(id);
  };

  const changeChapter = (delta: number) => {
    const next = currentChapter + delta;
    if (next >= 0 && next < totalChapters) {
      setCurrentChapter(next);
      setCurrentIndex(0);
      setInput('');
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isLibraryOpen) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    
    if (e.key === 'ArrowUp') { e.preventDefault(); if (currentIndex > 0) { setCurrentIndex(p => p - 1); setInput(''); setIsMistake(false); } return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); if (currentIndex < chapterWords.length - 1) { setCurrentIndex(p => p + 1); setInput(''); setIsMistake(false); } return; }

    if (e.key.length !== 1 && e.key !== 'Backspace') return;
    if (e.key === 'Escape') { setInput(''); setIsMistake(false); return; }
    if (e.key === 'Backspace') { setInput(p => p.slice(0, -1)); setIsMistake(false); return; }

    const nextChar = targetWord[input.length];
    if (e.key === nextChar) {
      const newInput = input + e.key;
      setInput(newInput);
      if (enableKeySound) playKeySound();
      updateStats({ totalChars: typingStats.totalChars + 1, correctChars: typingStats.correctChars + 1, wpm: Math.floor((typingStats.correctChars + 1) / 5) });
      if (newInput === targetWord) {
        setTimeout(() => {
          if (currentIndex < chapterWords.length - 1) setCurrentIndex(p => p + 1); else setCurrentIndex(0);
          setInput('');
        }, 100);
      }
    } else {
      setIsMistake(true);
      if (enableKeySound) playErrorSound();
      if (currentWordObj) addMistake(currentWordObj);
      updateStats({ mistakes: typingStats.mistakes + 1 });
      setTimeout(() => setIsMistake(false), 300);
    }
  }, [input, targetWord, typingStats, updateStats, enableKeySound, currentIndex, chapterWords.length, currentChapter, totalChapters, isLibraryOpen, currentWordObj, addMistake]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (typingStats.totalChars > 0) {
      const acc = (typingStats.correctChars / (typingStats.correctChars + typingStats.mistakes)) * 100;
      updateStats({ accuracy: isNaN(acc) ? 100 : acc });
    }
  }, [typingStats.mistakes, typingStats.correctChars]);

  const progress = ((currentIndex) / chapterWords.length) * 100;

  return (
    <div className="relative flex flex-col h-[calc(100vh-100px)]">
      {/* Library Overlay */}
      <AnimatePresence>
        {isLibraryOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col p-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Library className="text-primary" size={28} />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{dict.library}</h2>
              </div>
              <button 
                onClick={() => setIsLibraryOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            {/* Import & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat === 'All' ? dict.myDictionaries : cat === 'Review' ? dict.review : cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                  <div className="relative">
                    <button onClick={() => setShowTemplateMenu(!showTemplateMenu)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                      <Download size={16} /> Template
                    </button>
                    {showTemplateMenu && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
                        <button onClick={() => { downloadTemplate('vocab', 'xlsx'); setShowTemplateMenu(false); }} className="px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 w-full hover:text-primary">Excel (.xlsx)</button>
                        <button onClick={() => { downloadTemplate('vocab', 'json'); setShowTemplateMenu(false); }} className="px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 w-full hover:text-primary">JSON (.json)</button>
                      </div>
                    )}
                  </div>
                 <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition cursor-pointer shadow-md">
                    <Upload size={16} />
                    {dict.importFile}
                    <input type="file" accept=".json, .xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                 </label>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto p-1">
              {filteredDictionaries.map(book => {
                const isSelected = currentBook.id === book.id;
                const isEditing = editingBookId === book.id;
                const isReview = book.category === 'Review';

                return (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative flex flex-col p-6 rounded-xl border-2 transition-all group ${
                      isSelected && !isEditing
                        ? 'border-primary bg-primary/5' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 hover:shadow-md'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex flex-col gap-3 h-full">
                         <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" autoFocus />
                         <div className="flex gap-2">
                            <button onClick={() => saveEditing(book.id)} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm">{dict.save}</button>
                            <button onClick={() => setEditingBookId(null)} className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-2 rounded-lg text-sm">{dict.cancel}</button>
                         </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-4">
                           <div className={`p-3 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                              {book.id === 'favorites' ? <Bookmark size={24} /> : book.id === 'mistakes' ? <BookX size={24} /> : <BookOpen size={24} />}
                           </div>
                           {!isReview && (
                             <div className="flex gap-2">
                               <button onClick={() => startEditing(book)} className="p-1.5 text-slate-400 hover:text-primary"><Pencil size={16} /></button>
                               <button onClick={() => deleteDictionaryHandler(book.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                             </div>
                           )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate">{book.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{book.description || `${book.words.length} words`}</p>
                        <button 
                          onClick={() => { setWordBook(book); setIsLibraryOpen(false); }}
                          className={`w-full py-2 rounded-lg text-sm font-medium ${isSelected ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' : 'bg-primary text-white'}`}
                        >
                          {isSelected ? dict.selected : dict.select}
                        </button>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="flex flex-wrap justify-between items-center p-4 gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4">
        <button 
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
               <Book size={20} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">{dict.switchDict}</span>
              <span className="font-semibold text-sm leading-tight max-w-[150px] truncate text-slate-900 dark:text-slate-100">
                {validBook.name}
              </span>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
        </button>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
          <button onClick={() => changeChapter(-1)} disabled={currentChapter === 0} className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200"><ChevronLeft size={16} /></button>
          <span className="text-xs font-mono font-medium px-2 min-w-[80px] text-center text-slate-700 dark:text-slate-200">{dict.chapter} {currentChapter + 1}/{totalChapters}</span>
          <button onClick={() => changeChapter(1)} disabled={currentChapter >= totalChapters - 1} className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200"><ChevronRight size={16} /></button>
        </div>

        {/* Granular Controls */}
        <div className="flex items-center gap-2">
          <button onClick={toggleShowTranslation} className={`p-2 rounded-lg border ${showTranslation ? 'text-primary border-transparent bg-primary/5' : 'text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`} title={showTranslation ? dict.hideTrans : dict.showTrans}>
            {showTranslation ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
          <button onClick={toggleTTS} className={`p-2 rounded-lg border ${enableTTS ? 'text-primary border-transparent bg-primary/5' : 'text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`} title={dict.autoTTS}>
            <Speaker size={20} />
          </button>
          <button onClick={toggleKeySound} className={`p-2 rounded-lg border ${enableKeySound ? 'text-primary border-transparent bg-primary/5' : 'text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`} title={dict.keySound}>
            <Keyboard size={20} />
          </button>
          <button onClick={toggleBlindMode} className={`p-2 rounded-lg border ${isBlindMode ? 'bg-accent/10 text-accent border-accent/20' : 'text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`} title={dict.blindMode}>
            <BookX size={20} />
          </button>
        </div>
      </div>

      {/* Main Typing Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-4xl mx-auto px-4">
        <div className="text-center space-y-8 w-full relative z-10">
          
          <div className="space-y-3 min-h-[100px]">
            <div className={`text-2xl md:text-4xl text-slate-800 dark:text-slate-200 font-sans font-semibold transition-opacity duration-300 ${showTranslation ? 'opacity-100' : 'opacity-0 select-none'}`}>
              {currentWordObj?.translation}
            </div>
            <div className="flex items-center justify-center gap-3">
              {currentWordObj?.phonetic && <div className="text-lg text-slate-500 dark:text-slate-400 font-mono">{currentWordObj.phonetic}</div>}
              <button onClick={() => speakWord(targetWord)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary"><Speaker size={16} /></button>
              <button onClick={() => currentWordObj && toggleFavorite(currentWordObj)} className={`p-1.5 rounded-full ${isFavorite ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'text-slate-400 bg-slate-100 dark:bg-slate-800 hover:text-pink-500'}`}><Heart size={16} fill={isFavorite ? "currentColor" : "none"} /></button>
            </div>
          </div>
          
          <div className={`relative font-mono font-bold tracking-wide break-all min-h-[1.2em] flex items-center justify-center gap-[1px] ${fontSizeClass}`}>
            {targetWord.split('').map((char, idx) => {
              const isTyped = idx < input.length;
              const isCurrent = idx === input.length;
              const isHidden = isBlindMode && !isTyped;
              
              let charClass = '';
              if (isTyped) {
                charClass = isBlindMode ? 'text-primary dark:text-white' : 'text-slate-800 dark:text-slate-100';
              } else if (isHidden) {
                charClass = 'text-transparent border-b-4 border-slate-300 dark:border-slate-600 rounded-sm select-none';
              } else {
                charClass = 'text-slate-400 dark:text-slate-700';
              }

              return (
                <span key={idx} className={`relative transition-all duration-100 inline-block ${charClass} mx-[1px]`}>
                   {char}
                  {isCurrent && (
                    <motion.div layoutId="cursor" className="absolute -bottom-2 left-0 right-0 h-1 bg-primary" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                  )}
                </span>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {isMistake && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-32 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-full flex items-center gap-2 font-bold">
              <AlertCircle size={20} /> {dict.typo}
            </motion.div>
          )}
        </AnimatePresence>

         <div className="absolute bottom-8 text-sm text-slate-400 dark:text-slate-500 flex flex-col md:flex-row gap-4 items-center">
           <span>{dict.typeWord} <span className="border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded text-xs mx-1 font-mono bg-slate-100 dark:bg-slate-800">ESC</span> {dict.reset}</span>
           <span className="hidden md:inline">|</span>
           <span className="flex items-center gap-1"><span className="border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800">↑</span> <span className="border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800">↓</span> Switch Word</span>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 grid grid-cols-4 gap-4">
        <div className="flex flex-col items-center border-r border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold">{dict.progress}</span>
          <div className="w-full max-w-[100px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
             <motion.div className="h-full bg-primary" animate={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-slate-500 mt-1">{currentIndex + 1} / {chapterWords.length}</span>
        </div>
        <div className="flex flex-col items-center border-r border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold">WPM</span>
          <span className="text-xl font-mono font-bold text-blue-500">{typingStats.wpm}</span>
        </div>
        <div className="flex flex-col items-center border-r border-slate-100 dark:border-slate-800">
           <span className="text-xs text-slate-400 uppercase font-bold">{dict.accuracy}</span>
           <span className={`text-xl font-mono font-bold ${typingStats.accuracy > 90 ? 'text-green-500' : 'text-orange-500'}`}>{typingStats.accuracy.toFixed(0)}%</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400 uppercase font-bold">{dict.totalWords}</span>
          <span className="text-xl font-mono font-bold text-purple-500">{validBook.words.length}</span>
        </div>
      </div>
    </div>
  );
};