import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WordBook, TypingStats, Language, WordItem, IELTSWritingTask, IELTSReadingPassage, IELTSSpeakingQuestion, IELTSListeningSection } from '../types';
import { builtInDictionaries } from '../data/dictionaries';
import { sampleReading, sampleSpeaking, sampleWriting, sampleListening } from '../data/mockData';

interface MistakeItem extends WordItem {
  errorCount: number;
  lastMistakeAt: number; // timestamp
}

interface AppState {
  // Vocab State
  currentBook: WordBook;
  dictionaries: WordBook[]; // Unified list
  
  favorites: WordItem[]; // "Collection Notebook"
  mistakes: Record<string, MistakeItem>; // "Mistake Statistics"

  typingStats: TypingStats;
  
  // Granular Settings
  showTranslation: boolean;
  enableKeySound: boolean;
  enableTTS: boolean;
  isBlindMode: boolean;
  
  // Content State (Unified: Built-in + Custom)
  writingTasks: IELTSWritingTask[];
  readingPassages: IELTSReadingPassage[];
  speakingTopics: IELTSSpeakingQuestion[];
  listeningSections: IELTSListeningSection[];

  // Actions
  addMistake: (word: WordItem) => void;
  toggleFavorite: (word: WordItem) => void;
  clearMistakes: () => void;

  updateStats: (stats: Partial<TypingStats>) => void;
  setWordBook: (book: WordBook) => void;
  
  // Generic CRUD Actions
  addDictionary: (book: WordBook) => void;
  updateDictionary: (id: string, updates: Partial<WordBook>) => void;
  deleteDictionary: (id: string) => void;

  addWritingTask: (task: IELTSWritingTask) => void;
  updateWritingTask: (id: string | number, updates: Partial<IELTSWritingTask>) => void;
  deleteWritingTask: (id: string | number) => void;

  addReadingPassage: (passage: IELTSReadingPassage) => void;
  updateReadingPassage: (id: string | number, updates: Partial<IELTSReadingPassage>) => void;
  deleteReadingPassage: (id: string | number) => void;

  addSpeakingTopic: (topic: IELTSSpeakingQuestion) => void;
  updateSpeakingTopic: (id: string | number, updates: Partial<IELTSSpeakingQuestion>) => void;
  deleteSpeakingTopic: (id: string | number) => void;

  addListeningSection: (section: IELTSListeningSection) => void;
  updateListeningSection: (id: string | number, updates: Partial<IELTSListeningSection>) => void;
  deleteListeningSection: (id: string | number) => void;
  
  // Settings Actions
  toggleShowTranslation: () => void;
  toggleKeySound: () => void;
  toggleTTS: () => void;
  toggleBlindMode: () => void;
  
  // UI State
  isDarkMode: boolean;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;

  // AI Config
  aiModel: string;
  setAiModel: (model: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initialize with default data
      currentBook: builtInDictionaries[0],
      dictionaries: [...builtInDictionaries],
      writingTasks: [...sampleWriting],
      readingPassages: [...sampleReading],
      speakingTopics: [...sampleSpeaking],
      listeningSections: [...sampleListening],
      
      favorites: [],
      mistakes: {},
      
      typingStats: { wpm: 0, accuracy: 0, totalChars: 0, correctChars: 0, mistakes: 0 },
      
      // Default Settings
      showTranslation: true,
      enableKeySound: true,
      enableTTS: true,
      isBlindMode: false,
      
      isDarkMode: true,
      language: 'cn',
      aiModel: 'gemini-2.5-flash',

      addMistake: (wordItem) => set((state) => {
        const currentMistake = state.mistakes[wordItem.word];
        return {
          mistakes: {
            ...state.mistakes,
            [wordItem.word]: {
              ...wordItem,
              errorCount: (currentMistake?.errorCount || 0) + 1,
              lastMistakeAt: Date.now(),
            }
          }
        };
      }),

      toggleFavorite: (wordItem) => set((state) => {
        const exists = state.favorites.some(w => w.word === wordItem.word);
        if (exists) return { favorites: state.favorites.filter(w => w.word !== wordItem.word) };
        return { favorites: [...state.favorites, wordItem] };
      }),

      clearMistakes: () => set({ mistakes: {} }),
      updateStats: (newStats) => set((state) => ({ typingStats: { ...state.typingStats, ...newStats } })),
      setWordBook: (book) => set({ currentBook: book }),

      // Dictionaries
      addDictionary: (book) => set((state) => ({ dictionaries: [...state.dictionaries, book] })),
      updateDictionary: (id, updates) => set((state) => {
         const updated = state.dictionaries.map(d => d.id === id ? { ...d, ...updates } : d);
         const current = state.currentBook.id === id ? { ...state.currentBook, ...updates } : state.currentBook;
         return { dictionaries: updated, currentBook: current };
      }),
      deleteDictionary: (id) => set((state) => {
         const remaining = state.dictionaries.filter(d => d.id !== id);
         const current = state.currentBook.id === id ? (remaining[0] || builtInDictionaries[0]) : state.currentBook;
         return { dictionaries: remaining, currentBook: current };
      }),

      // Writing
      addWritingTask: (task) => set((state) => ({ writingTasks: [...state.writingTasks, task] })),
      updateWritingTask: (id, updates) => set((state) => ({
        writingTasks: state.writingTasks.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteWritingTask: (id) => set((state) => ({
        writingTasks: state.writingTasks.filter(t => t.id !== id)
      })),

      // Reading
      addReadingPassage: (passage) => set((state) => ({ readingPassages: [...state.readingPassages, passage] })),
      updateReadingPassage: (id, updates) => set((state) => ({
        readingPassages: state.readingPassages.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteReadingPassage: (id) => set((state) => ({
        readingPassages: state.readingPassages.filter(p => p.id !== id)
      })),

      // Speaking
      addSpeakingTopic: (topic) => set((state) => ({ speakingTopics: [...state.speakingTopics, topic] })),
      updateSpeakingTopic: (id, updates) => set((state) => ({
        speakingTopics: state.speakingTopics.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteSpeakingTopic: (id) => set((state) => ({
        speakingTopics: state.speakingTopics.filter(t => t.id !== id)
      })),

      // Listening
      addListeningSection: (section) => set((state) => ({ listeningSections: [...state.listeningSections, section] })),
      updateListeningSection: (id, updates) => set((state) => ({
        listeningSections: state.listeningSections.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteListeningSection: (id) => set((state) => ({
        listeningSections: state.listeningSections.filter(s => s.id !== id)
      })),
      
      toggleShowTranslation: () => set((state) => ({ showTranslation: !state.showTranslation })),
      toggleKeySound: () => set((state) => ({ enableKeySound: !state.enableKeySound })),
      toggleTTS: () => set((state) => ({ enableTTS: !state.enableTTS })),
      toggleBlindMode: () => set((state) => ({ isBlindMode: !state.isBlindMode })),
      
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setLanguage: (lang) => set({ language: lang }),
      setAiModel: (model) => set({ aiModel: model }),
    }),
    {
      name: 'lingoflow-storage-v6', // Incremented version to ensure new mock data loads
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        mistakes: state.mistakes,
        dictionaries: state.dictionaries,
        writingTasks: state.writingTasks,
        readingPassages: state.readingPassages,
        speakingTopics: state.speakingTopics,
        listeningSections: state.listeningSections,
        typingStats: state.typingStats,
        isDarkMode: state.isDarkMode,
        language: state.language,
        showTranslation: state.showTranslation,
        enableKeySound: state.enableKeySound,
        enableTTS: state.enableTTS,
        isBlindMode: state.isBlindMode,
        aiModel: state.aiModel
      }),
    }
  )
);