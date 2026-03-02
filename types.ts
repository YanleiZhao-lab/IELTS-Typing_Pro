
export interface WordItem {
  word: string;
  translation: string;
  phonetic?: string;
}

export interface WordBook {
  id: string;
  name: string;
  description?: string;
  category?: string; // e.g., 'IELTS', 'TOEFL', 'CET-4'
  words: WordItem[];
  count?: number;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  totalChars: number;
  correctChars: number;
  mistakes: number;
}

export enum QuestionType {
  MultipleChoice = 'MC',
  FillInTheBlank = 'FIB',
  TrueFalseNotGiven = 'TFNG',
  MatchingHeadings = 'MH',
}

export interface IELTSListeningQuestion {
  id: number;
  question: string;
  type: QuestionType;
  options?: string[]; // For MC
  answer: string;
  hint?: string; // specific strategy hint
}

export interface IELTSListeningSection {
  id: number;
  title: string;
  audioSrc?: string; // placeholder for real audio
  description: string;
  questions: IELTSListeningQuestion[];
}

export interface IELTSReadingPassage {
  id: number | string; // changed to allow string IDs for custom imports
  title: string;
  category?: string; // e.g., 'General', 'Academic', 'TFNG Practice'
  content: string; // Markdown or HTML string
  questions: IELTSListeningQuestion[]; // Reusing question structure
  keywords?: { word: string; synonym: string }[]; // Vocabulary help
}

export interface IELTSWritingTask {
  id: number | string; // changed to allow string IDs
  type: 'Task 1' | 'Task 2';
  category: 'Line Graph' | 'Bar Chart' | 'Pie Chart' | 'Table' | 'Map' | 'Process' | 'Opinion' | 'Discussion' | 'Problem Solution' | 'Direct Question';
  prompt: string;
  imageUri?: string; // For Task 1 charts
  structureGuide: string[]; // Tips on paragraphing
  recommendedVocab: string[]; // Key words to use
  modelAnswer: string; // Band 9 answer
}

export interface IELTSSpeakingQuestion {
  id: number | string;
  part: 1 | 2 | 3;
  topic: string;
  questions: string[];
}

export interface SpeakingTip {
  title: string;
  content: string[];
}

export interface TipSection {
  title: string;
  tips: {
    subtitle: string;
    content: string;
  }[];
}

export interface FeedbackResponse {
  score: number | string;
  feedback: string;
  correctedText?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type Language = 'en' | 'cn';

export interface ResourceLink {
  title: string;
  description: string;
  url: string;
  icon?: string;
  category: 'practice' | 'dictionary' | 'tool';
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: 'google' | 'openai' | 'custom';
  baseUrl?: string; // For OpenAI compatible endpoints
  apiKey?: string; // Specific key for this model if different from default
  modelId?: string; // The actual model ID string sent to API (e.g., 'gpt-4', 'glm-4')
}
