import * as XLSX from 'xlsx';

type ModuleType = 'vocab' | 'writing' | 'speaking' | 'reading' | 'listening';
type FileFormat = 'json' | 'xlsx';

export const downloadTemplate = (module: ModuleType, format: FileFormat) => {
  const filename = `${module}_template.${format}`;

  if (format === 'json') {
    let data: any = {};
    switch (module) {
      case 'vocab':
        data = { 
          name: "My Custom List", 
          category: "Custom", 
          words: [
            { word: "example", translation: "例子", phonetic: "/ɪɡˈzæmpəl/" },
            { word: "learning", translation: "学习", phonetic: "/ˈlɜːnɪŋ/" }
          ] 
        };
        break;
      case 'writing':
        data = [
          {
            type: "Task 2",
            category: "Education",
            prompt: "Discuss the advantages and disadvantages of online learning.",
            structureGuide: ["Introduction: Define online learning.", "Body 1: Advantages (Flexibility).", "Body 2: Disadvantages (Isolation).", "Conclusion: Balance is key."],
            recommendedVocab: ["Remote", "Asynchronous", "Self-discipline"],
            modelAnswer: "Online learning has become increasingly popular..."
          }
        ];
        break;
      case 'speaking':
        data = [
          {
            part: 1,
            topic: "Hometown",
            questions: ["Where are you from?", "Do you like it there?"]
          }
        ];
        break;
      case 'reading':
        data = {
          title: "Example Passage",
          category: "Academic",
          content: "Passage text goes here...",
          questions: [
            {
              id: 1,
              question: "Question text?",
              type: "MC",
              options: ["A", "B", "C"],
              answer: "A",
              hint: "Look at paragraph 1"
            }
          ]
        };
        break;
      case 'listening':
        data = {
          title: "Section 1 Example",
          description: "Conversation...",
          audioSrc: "https://example.com/audio.mp3",
          questions: [
            {
              id: 101,
              question: "Name: ______",
              type: "FIB",
              answer: "Smith",
              hint: "Spelling"
            }
          ]
        };
        break;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    // Excel Logic
    let headers: string[] = [];
    let rows: any[] = [];

    switch (module) {
      case 'vocab':
        headers = ['Word', 'Translation', 'Phonetic', 'Chapter'];
        rows = [
          ['accommodation', '住宿', '/əˌkɒm.əˈdeɪ.ʃən/', 1],
          ['beneficial', '有益的', '/ˌben.ɪˈfɪʃ.əl/', 1],
          ['deteriorate', '恶化', '/dɪˈtɪə.ri.ə.reɪt/', 2]
        ];
        break;
      case 'writing':
        headers = ['Type', 'Category', 'Prompt', 'Structure', 'Vocab', 'ModelAnswer'];
        rows = [
          ['Task 2', 'Education', 'Discuss the advantages of online learning.', 'Intro|Body 1|Body 2|Conclusion', 'Remote|Flexibility', 'Online learning has revolutionized education...']
        ];
        break;
      case 'speaking':
        headers = ['Part', 'Topic', 'Questions'];
        rows = [
          [1, 'Hometown', 'Where are you from?|Do you like it there?']
        ];
        break;
      case 'reading':
        headers = ['Title', 'Category', 'Content', 'Question', 'Type', 'Options', 'Answer', 'Hint'];
        rows = [
          ['Glass History', 'Academic', 'Text content...', 'When was it made?', 'MC', '1990,2000', '1990', 'Scan dates']
        ];
        break;
      case 'listening':
        headers = ['SectionTitle', 'SectionDesc', 'AudioURL', 'Question', 'Type', 'Options', 'Answer', 'Hint'];
        rows = [
          ['Booking Form', 'A student calling...', 'https://example.com/audio.mp3', 'Surname: ____', 'FIB', '', 'Smith', 'Spelling']
        ];
        break;
    }

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, filename);
  }
};