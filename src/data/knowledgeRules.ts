import type { KnowledgeLevel1, QuestionType } from '@/types';

export interface TenseRule {
  name: string;
  level2: string;
  level3: string;
  keywords: string[];
  structures: string[];
  irregularVerbs?: string[];
  description: string;
  errorRisk: string;
}

export interface VocabularyRule {
  name: string;
  level2: string;
  level3: string;
  keywords: string[];
  description: string;
  errorRisk: string;
}

export interface GrammarRule {
  name: string;
  level2: string;
  level3: string;
  patterns: string[];
  description: string;
  errorRisk: string;
}

export const tenseRules: TenseRule[] = [
  {
    name: '一般过去时',
    level2: '时态',
    level3: '一般过去时',
    keywords: [
      'yesterday', 'last', 'ago', 'just now', 'in 20',
      '昨天', '上周', '去年', '以前', '刚才', '过去'
    ],
    structures: [
      '主语 + 动词过去式',
      'was/were',
      'did + 动词原形',
      "didn't + 动词原形",
    ],
    irregularVerbs: ['go-went', 'do-did', 'see-saw', 'buy-bought', 'eat-ate', 'take-took', 'have-had', 'is-was', 'are-were'],
    description: '表示过去某个时间发生的动作或存在的状态',
    errorRisk: '混淆动词过去式形式，不规则动词记错，否定句/疑问句中动词恢复原形容易忘',
  },
  {
    name: '一般现在时',
    level2: '时态',
    level3: '一般现在时',
    keywords: [
      'always', 'usually', 'often', 'sometimes', 'never',
      'every', 'on Sundays', 'often',
      '每天', '经常', '通常', '总是', '从不', '有时'
    ],
    structures: [
      '主语 + 动词原形',
      '主语三单 + 动词s/es',
      'do/does + 动词原形',
    ],
    description: '表示经常性、习惯性的动作或存在的状态',
    errorRisk: '第三人称单数动词变化容易忘，s/es加成规则混淆',
  },
  {
    name: '现在进行时',
    level2: '时态',
    level3: '现在进行时',
    keywords: [
      'now', 'look', 'listen', 'at the moment',
      '现在', '看', '听', '此刻', '正在'
    ],
    structures: [
      'am/is/are + 动词ing',
    ],
    description: '表示现在正在进行的动作',
    errorRisk: 'be动词遗漏，动词ing变化规则记错（双写、去e等）',
  },
  {
    name: '一般将来时',
    level2: '时态',
    level3: '一般将来时',
    keywords: [
      'tomorrow', 'next', 'in the future', 'soon',
      '明天', '下周', '明年', '将来', '以后', '将要'
    ],
    structures: [
      'will + 动词原形',
      'be going to + 动词原形',
    ],
    description: '表示将来某个时间要发生的动作或存在的状态',
    errorRisk: 'will和be going to用法混淆，will后面动词用原形容易忘',
  },
  {
    name: '现在完成时',
    level2: '时态',
    level3: '现在完成时',
    keywords: [
      'already', 'yet', 'just', 'ever', 'never',
      'since', 'for', 'so far',
      '已经', '还', '刚刚', '曾经', '自从', '到目前为止'
    ],
    structures: [
      'have/has + 过去分词',
    ],
    description: '表示过去发生的动作对现在造成的影响或结果',
    errorRisk: 'have/has选择错误，过去分词记错，与一般过去时用法混淆',
  },
];

export const vocabularyRules: VocabularyRule[] = [
  {
    name: '动词短语搭配',
    level2: '动词短语',
    level3: '固定搭配',
    keywords: [
      'go on', 'look for', 'look after', 'take care of',
      'wake up', 'get up', 'put on', 'turn on', 'turn off',
      'talk about', 'think about', 'worry about',
    ],
    description: '常见的动词短语和固定搭配',
    errorRisk: '短语意思记混，介词搭配错误（on/in/at搞混）',
  },
  {
    name: '形容词/副词比较级',
    level2: '形容词副词',
    level3: '比较级',
    keywords: [
      'than', 'more', 'better', 'bigger', 'smaller',
      'faster', 'slower', 'earlier', 'later',
      '比', '更', '比较'
    ],
    description: '形容词和副词的比较级形式和用法',
    errorRisk: '比较级构成规则记错（双写、变y为i加er、more修饰）',
  },
  {
    name: '介词搭配',
    level2: '介词',
    level3: '时间/地点介词',
    keywords: [
      'in the morning', 'on Monday', 'at night',
      'in', 'on', 'at', 'for', 'with', 'from', 'to',
    ],
    description: '常见介词的时间和地点搭配',
    errorRisk: 'in/on/at用法混淆，固定介词搭配记错',
  },
];

export const grammarRules: GrammarRule[] = [
  {
    name: 'there be句型',
    level2: '句法',
    level3: 'there be句型',
    patterns: ['there is', 'there are', 'there was', 'there were'],
    description: '表示某地有某物的存在句型',
    errorRisk: 'be动词单复数就近原则搞错，与have/has用法混淆',
  },
  {
    name: '宾语从句',
    level2: '句法',
    level3: '宾语从句',
    patterns: ['think that', 'know that', 'say that', 'tell sb that', 'ask if', 'wonder if'],
    description: '在及物动词后面作宾语的从句',
    errorRisk: '从句语序用疑问句语序，引导词遗漏，时态不一致',
  },
  {
    name: '情态动词',
    level2: '动词',
    level3: '情态动词用法',
    patterns: ['can', 'could', 'may', 'might', 'must', 'should', 'will', 'would'],
    description: '情态动词后面接动词原形，没有人称和数的变化',
    errorRisk: '情态动词后面加to，或者动词加s/es',
  },
];

export const questionTypePatterns: Record<QuestionType, string[]> = {
  choice: ['\\d+\\.', 'choose.*answer', '选择', '单项选择', '选择题'],
  fill: ['fill.*blank', 'complete.*sentence', '填空', '用.*正确形式填空', '完成句子'],
  cloze: ['cloze', '完形填空', '短文填空'],
  reading: ['reading', '阅读理解', '阅读短文', 'read.*passage'],
  translation: ['translate', '翻译', '汉译英', '英译汉'],
  writing: ['writing', 'composition', '写', '作文', '书面表达', '短文'],
};
