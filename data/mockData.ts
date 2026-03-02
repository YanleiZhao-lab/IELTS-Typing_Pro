import { WordBook, IELTSReadingPassage, IELTSWritingTask, IELTSSpeakingQuestion, QuestionType, IELTSListeningSection, TipSection } from '../types';

export const defaultWordList: WordBook = {
  id: 'default-vocabulary',
  name: "雅思核心词汇 (Core)",
  words: [
    { word: "accommodation", translation: "住宿", phonetic: "/əˌkɒm.əˈdeɪ.ʃən/" },
    { word: "beneficial", translation: "有益的", phonetic: "/ˌben.ɪˈfɪʃ.əl/" },
    { word: "chronological", translation: "按时间顺序的", phonetic: "/ˌkrɒn.əˈlɒdʒ.ɪ.kəl/" },
    { word: "deteriorate", translation: "恶化", phonetic: "/dɪˈtɪə.ri.ə.reɪt/" },
    { word: "environment", translation: "环境", phonetic: "/ɪnˈvaɪ.rən.mənt/" },
  ]
};

export const sampleReading: IELTSReadingPassage[] = [
  {
    id: 1,
    title: "玻璃的历史 (The History of Glass)",
    category: "Academic",
    content: `From the earliest times, glass has played an important role in human history. It has been used for containers, windows, and jewellery. The first glass objects were beads, dating back to around 2500 BC.

The Roman Empire saw a rapid expansion of glass usage. The Romans discovered how to make clear glass, and this led to the widespread use of glass windows. Unlike earlier opaque glass, this new innovation allowed light to enter buildings while keeping out the elements.

In the modern era, glass technology has continued to evolve. We now have tempered glass, laminated glass, and even smart glass that can change its opacity. This versatility ensures that glass remains a ubiquitous material in architecture and design.`,
    keywords: [
      { word: "ubiquitous", synonym: "found everywhere / 普遍存在的" },
      { word: "innovation", synonym: "invention / 创新" },
      { word: "expansion", synonym: "growth / 扩张" }
    ],
    questions: [
      {
        id: 1,
        question: "When were the first glass objects created?",
        type: QuestionType.MultipleChoice,
        options: ["1000 BC", "2500 BC", "500 AD", "1900 AD"],
        answer: "2500 BC",
        hint: "Scan for dates like 'BC' or numbers."
      },
      {
        id: 2,
        question: "The Romans were the first to create clear glass.",
        type: QuestionType.TrueFalseNotGiven,
        options: ["True", "False", "Not Given"],
        answer: "True",
        hint: "Look for 'Romans' and 'clear glass' in the second paragraph."
      }
    ]
  }
];

export const sampleWriting: IELTSWritingTask[] = [
  {
    id: 1,
    type: 'Task 2',
    category: 'Discussion',
    prompt: "Some people believe that technology has made communication easier, while others argue that it has led to a loss of personal touch. Discuss both views and give your own opinion.",
    structureGuide: [
      "开头段: 改写题目背景 + 给出个人立场 (Thesis Statement)。",
      "主体段 1: 讨论'科技让沟通更便捷'的观点。",
      "主体段 2: 讨论'失去人情味'的观点。",
      "结尾段: 总结双方观点 + 重申个人看法。"
    ],
    recommendedVocab: [
      "Facilitate (促进)", "Instantaneous (即时的)", "Superficial (肤浅的)", "Alienation (疏远)"
    ],
    modelAnswer: `Technology has undoubtedly revolutionized the way we communicate. While proponents argue that it has bridged geographical gaps, ensuring connectivity, critics maintain that it has eroded the quality of personal interactions. This essay will discuss both perspectives before concluding that while technology enhances convenience, it must be used judiciously to preserve authentic connections.

On the one hand, the advent of digital tools has democratized communication. Platforms like Zoom and WhatsApp allow for instantaneous exchange of information regardless of distance. For instance, families separated by oceans can now maintain relationships through video calls.

On the other hand, the ubiquity of screens has introduced a layer of superficiality. Text-based communication often lacks the nuance of tone and body language, leading to misunderstandings.

In conclusion, while technology acts as a powerful facilitator for keeping in touch, it cannot entirely replace the warmth of face-to-face interaction.`
  }
];

export const sampleSpeaking: IELTSSpeakingQuestion[] = [
  {
    id: 1,
    part: 1,
    topic: "Hometown (家乡)",
    questions: [
      "Where is your hometown?",
      "What do you like most about your hometown?",
      "Has your hometown changed much since you were a child?"
    ]
  }
];

export const sampleListening: IELTSListeningSection[] = [
  {
    id: 1,
    title: "Section 1: 住宿咨询",
    description: "一名学生与房屋中介之间的电话对话。",
    // Using a reliable public domain speech sample (Internet Archive / LibriVox)
    audioSrc: "https://ia800206.us.archive.org/16/items/myth_and_legend_01_0807_librivox/myth_and_legend_01_harrison_64kb.mp3", 
    questions: [
      { id: 1, type: QuestionType.FillInTheBlank, question: "Student's Surname: ______", answer: "Renfrew", hint: "Listen for spelling." },
      { id: 2, type: QuestionType.FillInTheBlank, question: "Address: 14 ______ Road", answer: "Westcott", hint: "Usually a common noun or name." }
    ]
  }
];

// --- 汉化版静态技巧 (RICH STATIC CONTENT - LOCALIZED) ---

export const speakingTips: TipSection[] = [
  {
    title: "Part 1: 简介与问答 (The Interview)",
    tips: [
      { subtitle: "保持简单 (Keep it simple)", content: "Part 1 都是关于日常话题。直接回答，补充1-2句解释即可，不要过度复杂化。" },
      { subtitle: "自然表达 (Be natural)", content: "像在咖啡厅聊天一样。使用缩略语 (如 I'm, don't) 会听起来更自然。" },
      { subtitle: "扩展答案 (Extend answers)", content: "永远不要只说 'Yes' 或 'No'。一定要加上 'because...' 或举个例子。" }
    ]
  },
  {
    title: "Part 2: 个人独白 (The Long Turn)",
    tips: [
      { subtitle: "利用1分钟笔记 (Use the 1 minute)", content: "写下关键词，而不是完整的句子。关注 5W1H (What, Where, Who, Why, How)。" },
      { subtitle: "不要停 (Keep talking)", content: "一直说到考官打断你为止，这展示了你的流利度。" },
      { subtitle: "结构化 (Structure)", content: "直接切入话题，然后展开细节。如果可能的话，讲一个简短的故事。" }
    ]
  },
  {
    title: "Part 3: 双向讨论 (The Discussion)",
    tips: [
      { subtitle: "抽象思维 (Abstract ideas)", content: "讨论“普遍的人们”，而不仅是你自己。使用 'Many people believe...' 或 'It is often said that...' 等句型。" },
      { subtitle: "争取时间 (Buy time)", content: "如果问题很难，可以说: 'That's an interesting question, let me think about that for a moment...' 来争取思考时间。" }
    ]
  }
];

export const writingTips: TipSection[] = [
  {
    title: "Task 1: 图表作文 (Academic)",
    tips: [
      { subtitle: "必须改写 (Paraphrase)", content: "永远不要照抄题目。使用同义词改写 (例如: 'show' -> 'illustrate', 'graph' -> 'chart')。" },
      { subtitle: "总结段是关键 (Overview is Key)", content: "你必须包含一个 Overview 来总结主要趋势。没有它，Task Achievement 这一项最高只能得 5 分。" },
      { subtitle: "不要发表观点 (No Opinions)", content: "坚持描述数据。不要解释趋势背后的原因，也不要给出个人观点。" }
    ]
  },
  {
    title: "Task 2: 议论文 (Essay)",
    tips: [
      { subtitle: "标准结构 (Structure)", content: "4 段式结构：开头段 (Introduction)、主体段 1、主体段 2、结尾段 (Conclusion)。" },
      { subtitle: "主旨句 (Thesis Statement)", content: "在开头段中，清晰地表明你的立场或文章将要讨论的内容。" },
      { subtitle: "中心句 (Topic Sentences)", content: "每个主体段的第一句话应该清晰地陈述该段落的中心思想。" }
    ]
  }
];

export const readingTips: TipSection[] = [
  {
    title: "通用策略 (General Strategies)",
    tips: [
      { subtitle: "略读 (Skimming)", content: "阅读标题、副标题以及每一段的首尾句，以获取文章大意。" },
      { subtitle: "扫读 (Scanning)", content: "在回答问题时，快速查找特定的人名、数字或大写单词。" },
      { subtitle: "时间管理 (Time Management)", content: "不要在难题上花费超过 1 分钟。猜一个答案，然后继续。" }
    ]
  },
  {
    title: "特定题型 (Question Types)",
    tips: [
      { subtitle: "判断题 (T/F/NG)", content: "True = 意思完全匹配。False = 意思相反/矛盾。Not Given = 文中未提及相关信息。" },
      { subtitle: "标题配对 (Matching Headings)", content: "最后做这个题型。阅读整个段落以理解上下文，而不仅仅是匹配关键词。" }
    ]
  }
];

export const listeningTips: TipSection[] = [
  {
    title: "考试期间 (During the Test)",
    tips: [
      { subtitle: "预读 (Read Ahead)", content: "利用空隙时间阅读下一部分的题目。预测答案的词性 (名词、数字、人名)。" },
      { subtitle: "干扰项 (Distractors)", content: "注意自我纠正。'I'll arrive at 5... no, sorry, make that 6.' 答案是 6。" },
      { subtitle: "拼写 (Spelling)", content: "练习常用人名和街道名的拼写。仔细检查复数 (s/es)。" }
    ]
  }
];