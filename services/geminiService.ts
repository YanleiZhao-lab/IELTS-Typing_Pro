import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackResponse, Language, AIModelConfig } from "../types";
import { useStore } from "../store/useStore";

// --- Configuration Helper ---

const getCustomModels = (): AIModelConfig[] => {
  try {
    const envModels = process.env.VITE_AI_MODELS;
    if (envModels) {
      return JSON.parse(envModels);
    }
  } catch (e) {
    console.error("Failed to parse VITE_AI_MODELS", e);
  }
  return [];
};

const getActiveModelConfig = (): AIModelConfig => {
  const selectedId = useStore.getState().aiModel || 'gemini-2.5-flash';
  const customModels = getCustomModels();
  const custom = customModels.find(m => m.id === selectedId);

  if (custom) return custom;

  // Default fallback to Google Gemini
  return {
    id: selectedId,
    name: selectedId,
    provider: 'google',
    apiKey: process.env.API_KEY
  };
};

// --- Unified API Caller ---

// 1. Google GenAI Implementation
const callGoogleGenAI = async (config: AIModelConfig, systemInstruction: string, userPrompt: string, jsonMode: boolean) => {
  const apiKey = config.apiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("Missing API Key for Google Model");

  const ai = new GoogleGenAI({ apiKey });
  const modelId = config.modelId || config.id;

  const reqConfig: any = {
    systemInstruction,
  };

  if (jsonMode) {
    reqConfig.responseMimeType = "application/json";
    reqConfig.responseSchema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        feedback: { type: Type.STRING },
        correctedText: { type: Type.STRING }
      },
      required: ["score", "feedback", "correctedText"]
    };
  }

  const response = await ai.models.generateContent({
    model: modelId,
    contents: userPrompt,
    config: reqConfig
  });

  return response.text;
};

// 2. OpenAI-Compatible Implementation (Fetch)
const callOpenAICompatible = async (config: AIModelConfig, systemInstruction: string, userPrompt: string, jsonMode: boolean) => {
  const apiKey = config.apiKey;
  if (!apiKey || !config.baseUrl) throw new Error("Missing API Key or Base URL for Custom Model");

  const modelId = config.modelId || config.id;
  
  const messages = [
    { role: "system", content: systemInstruction },
    { role: "user", content: userPrompt }
  ];

  if (jsonMode) {
     messages[0].content += " \nIMPORTANT: Output strictly valid JSON.";
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages,
      temperature: 0.7,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {})
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Error: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

const generateContentUnified = async (systemInstruction: string, userPrompt: string, jsonMode: boolean = false) => {
  const config = getActiveModelConfig();
  
  if (config.provider === 'openai' || config.provider === 'custom') {
    return callOpenAICompatible(config, systemInstruction, userPrompt, jsonMode);
  } else {
    return callGoogleGenAI(config, systemInstruction, userPrompt, jsonMode);
  }
};

// --- Feature Exports ---

export const evaluateWriting = async (
  prompt: string, 
  userEssay: string, 
  taskType: 'Task 1' | 'Task 2',
  language: Language = 'cn'
): Promise<FeedbackResponse> => {
  try {
    const langInstruction = language === 'cn' 
      ? "Provide the 'feedback' value in Chinese. Keep the 'correctedText' in English." 
      : "Provide the feedback in English.";

    const systemInstruction = `You are an expert IELTS examiner. 
    Evaluate the following ${taskType} essay based on the standard IELTS criteria.
    ${langInstruction}
    Output strictly in JSON format with keys: score (number), feedback (string), correctedText (string).`;

    const userPrompt = `Topic: ${prompt}\n\nEssay:\n${userEssay}`;

    const text = await generateContentUnified(systemInstruction, userPrompt, true);
    if (!text) throw new Error("No response from AI");

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    return {
      score: parsed.score || 0,
      feedback: parsed.feedback || "Parsing error",
      correctedText: parsed.correctedText || "",
    };

  } catch (error) {
    console.error("AI Eval Error:", error);
    return { 
      score: 0, 
      feedback: language === 'cn' ? "生成反馈失败，请检查配置或稍后重试。" : "Failed to generate feedback. Check config.", 
      correctedText: "" 
    };
  }
};

export const generateModelAnswer = async (
  prompt: string,
  taskType: 'Task 1' | 'Task 2'
): Promise<string> => {
  try {
    const systemInstruction = `You are an expert IELTS examiner. Write a Band 9 model answer for the following ${taskType} prompt. Do not include any introductory text like "Here is a model answer", just output the essay directly.`;
    const text = await generateContentUnified(systemInstruction, prompt, false);
    return text || "Failed to generate model answer.";
  } catch (error) {
    console.error("Gen Model Error:", error);
    return "Error generating model answer. Please check your API connection.";
  }
};

// New Service: Generate Structure Suggestions
export const generateWritingStructure = async (
  prompt: string,
  taskType: 'Task 1' | 'Task 2'
): Promise<string[]> => {
  try {
    const systemInstruction = `You are an IELTS Writing coach. 
    Analyze the provided prompt and generate a concise structure guide (3-5 points max).
    The guide should outline what to write in the Introduction, Body Paragraphs, and Conclusion.
    Output ONLY a raw JSON array of strings (e.g. ["Intro: ...", "Body 1: ..."]). No markdown formatting.
    Language: Chinese (but keep key terms like 'Introduction' in English).`;
    
    const text = await generateContentUnified(systemInstruction, prompt, false);
    if (!text) return [];
    
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
       const parsed = JSON.parse(cleanText);
       return Array.isArray(parsed) ? parsed : [cleanText];
    } catch (e) {
       // If json parse fails, try to split by newlines
       return cleanText.split('\n').filter(line => line.trim().length > 0);
    }
  } catch (error) {
    console.error("Gen Structure Error:", error);
    return ["Failed to generate structure."];
  }
};

export const evaluateSpeaking = async (
  topic: string, 
  transcript: string,
  language: Language = 'cn'
): Promise<FeedbackResponse> => {
  try {
    const langInstruction = language === 'cn' 
      ? "Provide the 'feedback' and suggestions in Chinese. Keep example phrases in English." 
      : "Provide the feedback in English.";

    const systemInstruction = `You are an expert IELTS examiner. 
    Evaluate the following speaking transcript based on IELTS criteria.
    ${langInstruction}
    Output strictly in JSON format with keys: score (number), feedback (string), correctedText (string).`;

    const userPrompt = `Topic: ${topic}\n\nTranscript:\n${transcript}`;

    const text = await generateContentUnified(systemInstruction, userPrompt, true);
    if (!text) throw new Error("No response from AI");
    
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    return {
      score: parsed.score || 0,
      feedback: parsed.feedback || "Parsing error",
      correctedText: parsed.correctedText || "",
    };

  } catch (error) {
    console.error("AI Eval Error:", error);
    return { 
      score: 0, 
      feedback: language === 'cn' ? "评估失败，请检查配置。" : "Evaluation failed. Check config.", 
      correctedText: "" 
    };
  }
};

// --- Chat Session Abstraction ---

export const createChatSession = (language: Language = 'cn') => {
  const config = getActiveModelConfig();
  
  const langInstruction = language === 'cn'
    ? "If the user speaks Chinese, politely guide them to speak English. You can explain concepts in Chinese if asked."
    : "Keep the conversation in English.";

  const systemInstruction = `You are a friendly but professional IELTS Examiner. 
      Your goal is to conduct a mock Speaking test or free conversation.
      Keep your responses concise (under 40 words).
      ${langInstruction}`;

  // If Google, use SDK Chat
  if (config.provider === 'google') {
    const apiKey = config.apiKey || process.env.API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      return ai.chats.create({
        model: config.modelId || config.id,
        config: { systemInstruction }
      });
    }
  }

  // If OpenAI/Custom, Polyfill a Chat Session Object
  let history = [
    { role: "system", content: systemInstruction }
  ];

  return {
    sendMessage: async (params: { message: string }) => {
      const userMsg = params.message;
      history.push({ role: "user", content: userMsg });

      const responseText = await callOpenAICompatible(config, systemInstruction, userMsg, false);
      
      history.push({ role: "assistant", content: responseText });

      return { text: responseText };
    }
  };
};