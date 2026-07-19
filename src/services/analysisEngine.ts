import type { Question, KnowledgePoint, ExamPaper, KnowledgeRanking, FullReport, TextbookMapping, PreviewSection, AIJudgment } from '@/types';
import { tenseRules, vocabularyRules, grammarRules, questionTypePatterns } from '@/data/knowledgeRules';
import { generateId } from '@/data/mockData';

interface AnalyzedQuestion {
  number: number;
  type: string;
  content: string;
  score: number;
  knowledgePoints: KnowledgePoint[];
  surfaceContent: string;
  deepGoal: string;
  judgmentBasis: string;
  errorRisk: string;
}

export function detectQuestionType(text: string): { type: string; confidence: number } {
  const lowerText = text.toLowerCase();
  let bestType = 'choice';
  let bestConfidence = 0;

  for (const [type, patterns] of Object.entries(questionTypePatterns)) {
    let count = 0;
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const matches = lowerText.match(regex);
      if (matches) count += matches.length;
    }
    const confidence = Math.min(count * 0.3, 1);
    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestType = type;
    }
  }

  return { type: bestType, confidence: bestConfidence };
}

export function analyzeTenses(text: string): Array<{
  name: string;
  level2: string;
  level3: string;
  confidence: number;
  evidence: string[];
  errorRisk: string;
}> {
  const lowerText = text.toLowerCase();
  const results: Array<{
    name: string;
    level2: string;
    level3: string;
    confidence: number;
    evidence: string[];
    errorRisk: string;
  }> = [];

  for (const rule of tenseRules) {
    let keywordHits: string[] = [];
    let structureHits: string[] = [];

    for (const keyword of rule.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        keywordHits.push(keyword);
      }
    }

    for (const structure of rule.structures) {
      const regex = new RegExp(structure, 'gi');
      if (regex.test(lowerText)) {
        structureHits.push(structure);
      }
    }

    if (rule.irregularVerbs) {
      for (const verbPair of rule.irregularVerbs) {
        const [, pastForm] = verbPair.split('-');
        const regex = new RegExp(`\\b${pastForm}\\b`, 'gi');
        if (regex.test(lowerText)) {
          structureHits.push(verbPair);
        }
      }
    }

    const keywordScore = Math.min(keywordHits.length * 0.25, 0.5);
    const structureScore = Math.min(structureHits.length * 0.2, 0.5);
    const confidence = Math.min(keywordScore + structureScore, 1);

    if (confidence >= 0.3) {
      results.push({
        name: rule.name,
        level2: rule.level2,
        level3: rule.level3,
        confidence,
        evidence: [...keywordHits.slice(0, 3), ...structureHits.slice(0, 3)],
        errorRisk: rule.errorRisk,
      });
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

export function analyzeVocabulary(text: string): Array<{
  name: string;
  level2: string;
  level3: string;
  confidence: number;
  evidence: string[];
  errorRisk: string;
}> {
  const lowerText = text.toLowerCase();
  const results: Array<{
    name: string;
    level2: string;
    level3: string;
    confidence: number;
    evidence: string[];
    errorRisk: string;
  }> = [];

  for (const rule of vocabularyRules) {
    let hits: string[] = [];
    for (const keyword of rule.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        hits.push(keyword);
      }
    }

    const confidence = Math.min(hits.length * 0.2, 0.8);
    if (confidence >= 0.3) {
      results.push({
        name: rule.name,
        level2: rule.level2,
        level3: rule.level3,
        confidence,
        evidence: hits.slice(0, 5),
        errorRisk: rule.errorRisk,
      });
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

export function analyzeGrammar(text: string): Array<{
  name: string;
  level2: string;
  level3: string;
  confidence: number;
  evidence: string[];
  errorRisk: string;
}> {
  const lowerText = text.toLowerCase();
  const results: Array<{
    name: string;
    level2: string;
    level3: string;
    confidence: number;
    evidence: string[];
    errorRisk: string;
  }> = [];

  for (const rule of grammarRules) {
    let hits: string[] = [];
    for (const pattern of rule.patterns) {
      const regex = new RegExp(pattern, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        hits.push(...matches);
      }
    }

    const confidence = Math.min(hits.length * 0.25, 0.8);
    if (confidence >= 0.3) {
      results.push({
        name: rule.name,
        level2: rule.level2,
        level3: rule.level3,
        confidence,
        evidence: [...new Set(hits)].slice(0, 5),
        errorRisk: rule.errorRisk,
      });
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

export function splitQuestions(text: string): Array<{ number: number; content: string }> {
  const questions: Array<{ number: number; content: string }> = [];
  
  const patterns = [
    /(\d+)\.\s*([\s\S]*?)(?=\d+\.\s*|$)/g,
    /第(\d+)题\s*([\s\S]*?)(?=第\d+题|$)/g,
  ];

  let bestMatch: Array<{ number: number; content: string }> = [];
  
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > bestMatch.length) {
      bestMatch = matches.map(m => ({
        number: parseInt(m[1]),
        content: m[2].trim(),
      })).filter(q => q.content.length > 10);
    }
  }

  if (bestMatch.length === 0) {
    const lines = text.split('\n').filter(l => l.trim().length > 20);
    lines.forEach((line, index) => {
      questions.push({ number: index + 1, content: line.trim() });
    });
  } else {
    questions.push(...bestMatch);
  }

  return questions.slice(0, 30);
}

export function analyzeQuestion(content: string, questionNum: number): AnalyzedQuestion {
  const tenses = analyzeTenses(content);
  const vocab = analyzeVocabulary(content);
  const grammar = analyzeGrammar(content);
  const typeInfo = detectQuestionType(content);

  const knowledgePoints: KnowledgePoint[] = [];
  const allEvidence: string[] = [];
  const allErrors: string[] = [];

  if (tenses.length > 0) {
    const topTense = tenses[0];
    knowledgePoints.push({
      level1: 'grammar',
      level2: topTense.level2,
      level3: topTense.level3,
    });
    allEvidence.push(...topTense.evidence);
    allErrors.push(topTense.errorRisk);
  }

  for (const g of grammar.slice(0, 1)) {
    knowledgePoints.push({
      level1: 'grammar',
      level2: g.level2,
      level3: g.level3,
    });
    allEvidence.push(...g.evidence);
    allErrors.push(g.errorRisk);
  }

  if (vocab.length > 0) {
    knowledgePoints.push({
      level1: 'vocabulary',
      level2: vocab[0].level2,
      level3: vocab[0].level3,
    });
    allErrors.push(vocab[0].errorRisk);
  }

  if (typeInfo.type === 'reading') {
    knowledgePoints.push({
      level1: 'reading',
      level2: '阅读理解',
      level3: '细节理解题',
    });
  }
  if (typeInfo.type === 'writing') {
    knowledgePoints.push({
      level1: 'writing',
      level2: '命题作文',
      level3: '叙事类短文',
    });
  }

  const surfaceContent = content.length > 50 
    ? content.substring(0, 50) + '...' 
    : content;

  const topKnowledge = knowledgePoints[0];
  const deepGoal = topKnowledge 
    ? `真正考查：${topKnowledge.level3}` 
    : '综合英语能力考查';

  const judgmentBasis = allEvidence.length > 0
    ? `判断依据：出现了 ${allEvidence.slice(0, 3).join('、')} 等特征词/结构`
    : '根据题型和内容综合判断';

  const errorRisk = allErrors.length > 0 
    ? allErrors[0] 
    : '基础不牢，容易在细节处出错';

  const scoreMap: Record<string, number> = {
    choice: 2,
    fill: 3,
    cloze: 1.5,
    reading: 4,
    translation: 5,
    writing: 15,
  };

  return {
    number: questionNum,
    type: typeInfo.type,
    content,
    score: scoreMap[typeInfo.type] || 2,
    knowledgePoints: knowledgePoints.slice(0, 3),
    surfaceContent,
    deepGoal,
    judgmentBasis,
    errorRisk,
  };
}

export function generateKnowledgeRankings(
  courseId: string,
  papers: ExamPaper[]
): KnowledgeRanking[] {
  const knowledgeMap = new Map<string, {
    name: string;
    level1: string;
    level2: string;
    level3: string;
    appearCount: number;
    totalScore: number;
    questionTypes: Set<string>;
    evidence: Array<{ paperName: string; paperId: string; questionNumber: number; questionId: string }>;
  }>();

  for (const paper of papers) {
    for (const question of paper.questions) {
      for (const kp of question.knowledgePoints) {
        const key = `${kp.level1}-${kp.level2}-${kp.level3}`;
        if (!knowledgeMap.has(key)) {
          knowledgeMap.set(key, {
            name: kp.level3,
            level1: kp.level1,
            level2: kp.level2,
            level3: kp.level3,
            appearCount: 0,
            totalScore: 0,
            questionTypes: new Set(),
            evidence: [],
          });
        }
        const entry = knowledgeMap.get(key)!;
        entry.appearCount++;
        entry.totalScore += question.score;
        entry.questionTypes.add(question.type);
        entry.evidence.push({
          paperName: paper.name,
          paperId: paper.id,
          questionNumber: question.number,
          questionId: question.id,
        });
      }
    }
  }

  const rankings = Array.from(knowledgeMap.values())
    .map(entry => {
      const frequencyScore = Math.min(entry.appearCount / 10, 1) * 0.4;
      const scoreScore = Math.min(entry.totalScore / 50, 1) * 0.3;
      const typeScore = Math.min(entry.questionTypes.size / 4, 1) * 0.2;
      const coreScore = entry.level1 === 'grammar' ? 0.1 : 0;
      const weight = frequencyScore + scoreScore + typeScore + coreScore;

      let stars: 3 | 4 | 5 = 3;
      if (weight >= 0.7) stars = 5;
      else if (weight >= 0.45) stars = 4;

      return {
        id: generateId(),
        courseId,
        rank: 0,
        stars,
        name: entry.name,
        appearCount: entry.appearCount,
        questionTypes: Array.from(entry.questionTypes) as any[],
        totalScore: Math.round(entry.totalScore * 10) / 10,
        reason: generateRankReason(entry.name, entry.appearCount, entry.totalScore, entry.questionTypes.size, stars),
        evidence: entry.evidence.slice(0, 10),
      };
    })
    .sort((a, b) => {
      if (b.stars !== a.stars) return b.stars - a.stars;
      if (b.appearCount !== a.appearCount) return b.appearCount - a.appearCount;
      return b.totalScore - a.totalScore;
    })
    .slice(0, 8)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const fiveStarCount = rankings.filter(r => r.stars === 5).length;
  if (fiveStarCount > 3) {
    for (let i = 3; i < rankings.length; i++) {
      if (rankings[i].stars === 5) rankings[i].stars = 4;
    }
  }

  return rankings;
}

function generateRankReason(
  name: string,
  appearCount: number,
  totalScore: number,
  typeCount: number,
  stars: number
): string {
  const reasons = [];
  if (appearCount >= 5) {
    reasons.push(`出现了 ${appearCount} 次，频率很高`);
  } else if (appearCount >= 3) {
    reasons.push(`出现了 ${appearCount} 次，频率较高`);
  }
  if (totalScore >= 30) {
    reasons.push(`总分值 ${totalScore} 分，占比较大`);
  }
  if (typeCount >= 3) {
    reasons.push(`覆盖 ${typeCount} 种题型，考查方式多样`);
  }
  if (stars === 5) {
    reasons.push('是本单元绝对核心考点');
  } else if (stars === 4) {
    reasons.push('是重要考点，需要认真掌握');
  }

  return reasons.length > 0 ? reasons.join('；') + '。' : '根据试卷分析综合判断。';
}

export function generateTextbookMappings(
  rankings: KnowledgeRanking[],
  unitName: string
): TextbookMapping[] {
  return rankings.slice(0, 5).map(r => ({
    knowledge: r.name,
    textbookPosition: `${unitName} / 待确认页码`,
    previewContent: generatePreviewContent(r.name),
  }));
}

function generatePreviewContent(knowledge: string): string[] {
  const contents: Record<string, string[]> = {
    '一般过去时': [
      '认识一般过去时的定义和用法',
      '记住常见的时间标志词：yesterday, last, ago, just now',
      '掌握肯定句、否定句、疑问句的基本结构',
      '理解be动词和实义动词在过去时中的不同变化',
    ],
    '不规则动词变化': [
      '重点记忆本单元出现的不规则动词',
      '分组记忆：按变化规律分组（元音变化、词尾变化）',
      '多用多练：口头造句加深印象',
    ],
    '比较级': [
      '掌握形容词比较级的基本变化规则',
      '记住常见的不规则比较级（good-better, bad-worse等）',
      '学会使用than进行比较',
    ],
  };

  return contents[knowledge] || [
    `了解${knowledge}的基本概念`,
    '掌握基础规则和常见用法',
    '结合例句理解记忆',
    '做基础练习题巩固',
  ];
}

export function generatePreviewPlan(
  rankings: KnowledgeRanking[]
): {
  section1: PreviewSection;
  section2: PreviewSection;
  section3: PreviewSection;
  classReminders: string[];
} {
  const topRankings = rankings.filter(r => r.stars === 5);
  const secondRankings = rankings.filter(r => r.stars === 4);

  return {
    section1: {
      title: '核心考点突破',
      duration: '10分钟',
      timeRange: '0-10分钟',
      goal: `掌握${topRankings[0]?.name || '核心语法'}的基本规则`,
      focus: '★★★★★ 最高频考点',
      content: [
        `记住 ${topRankings[0]?.name || '核心语法'} 的时间标志词`,
        '掌握基本结构：肯定句/否定句/疑问句',
        '做3-5道基础题检验理解',
        '把错题标出来，明天上课重点听',
      ],
    },
    section2: {
      title: '高频词汇短语',
      duration: '10分钟',
      timeRange: '10-20分钟',
      goal: secondRankings[0]?.name || '熟记本课重点词汇',
      focus: '★★★★ 次重点',
      content: [
        secondRankings[0]?.name || '熟记本课10个高频单词',
        '每个词配一个简单例句',
        '快速互译练习：看中说英，看英说中',
        '2-3个重点短语搭配',
      ],
    },
    section3: {
      title: '基础检测巩固',
      duration: '10分钟',
      timeRange: '20-30分钟',
      goal: '检验是否真正掌握，发现薄弱点',
      focus: '基础检测',
      content: [
        '5道填空/选择题：考核心语法',
        '3道词汇题：考拼写或搭配',
        '1句翻译：综合应用',
        '对照答案批改，错题记下来',
      ],
    },
    classReminders: [
      `重点听老师讲${topRankings[0]?.name || '核心语法'}的难点部分`,
      '注意老师补充的规则和特殊情况',
      '做练习时主动用新学的知识造句',
      '有不懂的地方一定要问，不要攒着',
    ],
  };
}

export function generateFullReport(
  courseId: string,
  courseName: string,
  unit: string,
  papers: ExamPaper[]
): FullReport {
  const rankings = generateKnowledgeRankings(courseId, papers);
  const totalQuestions = papers.reduce((sum, p) => sum + p.questions.length, 0);
  const totalScore = papers.reduce((sum, p) => sum + p.totalScore, 0);
  const questionTypes = new Set<string>();
  papers.forEach(p => p.questions.forEach(q => questionTypes.add(q.type)));

  const typeLabels: Record<string, string> = {
    choice: '选择题',
    fill: '填空题',
    cloze: '完形填空',
    reading: '阅读理解',
    translation: '翻译题',
    writing: '书面表达',
  };

  const typeNames = Array.from(questionTypes).map(t => typeLabels[t] || t);

  const topTense = rankings.find(r => r.name.includes('时'))?.name || '核心语法';

  return {
    courseId,
    overallAnalysis: {
      examScope: `${unit} - ${topTense}及其应用`,
      questionTypes: typeNames,
      difficulty: totalQuestions > 15 ? '中等' : '中等偏易',
      mainDirection: `以${topTense}为核心，结合词汇、阅读、写作全面考查。重点考查语法在不同语境中的运用能力。`,
    },
    knowledgeRankings: rankings,
    evidenceChain: `通过对 ${papers.length} 份试卷共 ${totalQuestions} 道题目的交叉分析，${rankings[0]?.name} 出现频率最高、覆盖题型最广、分值占比最大，确定为第一核心考点。`,
    textbookMappings: generateTextbookMappings(rankings, unit),
    previewPlan: generatePreviewPlan(rankings),
    riskWarnings: [
      `⚠️ 最高风险：${rankings[0]?.name || '核心语法'}掌握不牢，写作和大题大量扣分`,
      '⚠️ 次高风险：否定句和疑问句中动词形式容易搞错',
      '⚠️ 完形填空中容易忽略上下文时态，导致一串题都错',
      '💡 建议：先把最核心的规则记牢，再逐步扩展其他内容',
    ],
    aiJudgment: {
      confirmed: [
        `${rankings[0]?.name}是本单元核心语法（试卷中高频出现）`,
        `共考查 ${typeNames.length} 种题型`,
        `总分值约 ${totalScore} 分`,
      ],
      inferred: [
        '阅读以叙事类文章为主（根据语法时态推断）',
        '写作题需要使用本单元所学时态',
        '学生可能在动词变形上出错最多（根据题型分布推断）',
      ],
      pending: [
        '教材具体页码（待上传教材后确认）',
        '学生实际水平（需积累更多数据）',
        '本单元完整词汇范围（需结合教材确认）',
      ],
    },
    generatedAt: new Date(),
  };
}

export function analyzePaperText(paperName: string, courseId: string, text: string): ExamPaper {
  const questions = splitQuestions(text);
  const analyzedQuestions = questions.map((q, index) => {
    const analyzed = analyzeQuestion(q.content, q.number || index + 1);
    return {
      id: generateId(),
      paperId: '',
      number: analyzed.number,
      type: analyzed.type as any,
      score: analyzed.score,
      surfaceContent: analyzed.surfaceContent,
      deepGoal: analyzed.deepGoal,
      judgmentBasis: analyzed.judgmentBasis,
      errorRisk: analyzed.errorRisk,
      knowledgePoints: analyzed.knowledgePoints,
    };
  });

  const totalScore = analyzedQuestions.reduce((sum, q) => sum + q.score, 0);

  const paper: ExamPaper = {
    id: generateId(),
    courseId,
    name: paperName,
    totalScore,
    questionCount: analyzedQuestions.length,
    questions: analyzedQuestions,
    uploadedAt: new Date(),
  };

  paper.questions.forEach(q => { q.paperId = paper.id; });

  return paper;
}
