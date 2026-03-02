import { WordBook } from '../types';

export const builtInDictionaries: WordBook[] = [
  {
    id: 'ielts-core',
    name: 'IELTS Core Vocabulary',
    description: 'Essential academic vocabulary for high band scores.',
    category: 'IELTS',
    count: 10,
    words: [
      { word: "accommodation", translation: "住宿", phonetic: "/əˌkɒm.əˈdeɪ.ʃən/" },
      { word: "beneficial", translation: "有益的", phonetic: "/ˌben.ɪˈfɪʃ.əl/" },
      { word: "chronological", translation: "按时间顺序的", phonetic: "/ˌkrɒn.əˈlɒdʒ.ɪ.kəl/" },
      { word: "deteriorate", translation: "恶化", phonetic: "/dɪˈtɪə.ri.ə.reɪt/" },
      { word: "environment", translation: "环境", phonetic: "/ɪnˈvaɪ.rən.mənt/" },
      { word: "fluctuate", translation: "波动", phonetic: "/ˈflʌk.tʃu.eɪt/" },
      { word: "globalization", translation: "全球化", phonetic: "/ˌɡləʊ.bəl.aɪˈzeɪ.ʃən/" },
      { word: "hypothesis", translation: "假设", phonetic: "/haɪˈpɒθ.ə.sɪs/" },
      { word: "inevitable", translation: "不可避免的", phonetic: "/ɪˈnev.ɪ.tə.bəl/" },
      { word: "justification", translation: "理由", phonetic: "/ˌdʒʌs.tɪ.fɪˈkeɪ.ʃən/" }
    ]
  }
];