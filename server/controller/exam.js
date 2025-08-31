// server/controller/exam.js
import pkg from '../generated/prisma/index.js';
const { PrismaClient } = pkg;
import OpenAI from "openai";
import { getAIConfig } from '../config/ai.js';

const prisma = new PrismaClient();

// 智能组卷API
export const generateExam = async (ctx) => {
  try {
    const { 
      subject, 
      difficulty, 
      duration, 
      questionCounts, 
      topics,
      model = 'qwen-max',
      provider = 'ALIYUN' 
    } = ctx.request.body;

    // 获取AI配置
    const aiConfig = getAIConfig(provider, model);
    const apiKey = process.env[`${provider}_API_KEY`];
    
    if (!apiKey) {
      throw new Error(`${provider} API key is not configured`);
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: aiConfig.baseURL,
    });

    // 构建智能组卷提示词
    const prompt = `请根据以下要求智能组卷：

科目：${subject}
难度：${difficulty}
时长：${duration}分钟
题目数量：单选题${questionCounts.single}道，多选题${questionCounts.multiple}道，编程题${questionCounts.programming}道
知识点：${topics.join('、')}

请从题库中智能选择最合适的题目组合，确保：
1. 难度分布合理，符合${difficulty}级别要求
2. 知识点覆盖全面
3. 题目类型搭配合理
4. 总时长控制在${duration}分钟内

请返回JSON格式的试卷结构：
{
  "examInfo": {
    "title": "试卷标题",
    "subject": "${subject}",
    "difficulty": "${difficulty}",
    "duration": ${duration},
    "totalScore": 100
  },
  "questions": [
    {
      "id": "题目ID",
      "type": "题目类型",
      "content": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "答案",
      "score": "分值",
      "difficulty": "难度",
      "topics": ["相关知识点"]
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: aiConfig.model,
      messages: [
        {
          role: "system",
          content: "你是一个专业的智能组卷助手。请根据要求从题库中智能选择题目，确保试卷质量。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // 降低随机性，提高一致性
      max_tokens: aiConfig.max_tokens,
    });

    const content = completion.choices[0].message.content.trim();
    const examData = JSON.parse(content);

    // 验证并处理返回的试卷数据
    const exam = {
      title: examData.examInfo.title,
      subject: examData.examInfo.subject,
      difficulty: examData.examInfo.difficulty,
      duration: examData.examInfo.duration,
      totalScore: examData.examInfo.totalScore,
      questions: examData.questions,
      createdAt: new Date(),
      status: 'active'
    };

    ctx.body = { code: 0, data: exam };
  } catch (error) {
    console.error('Error generating exam:', error);
    ctx.status = 500;
    ctx.body = { code: 1, message: error.message || 'Failed to generate exam' };
  }
};

// 获取推荐题目
export const getRecommendedQuestions = async (ctx) => {
  try {
    const { difficulty, type, topics, count = 10 } = ctx.query;
    
    // 构建查询条件
    const where = {};
    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;
    if (topics) {
      where.language = {
        contains: topics
      };
    }

    // 从数据库获取题目
    const questions = await prisma.question.findMany({
      where,
      take: parseInt(count),
      orderBy: {
        // 可以添加推荐算法，比如根据使用频率、正确率等
        createdAt: 'desc'
      }
    });

    ctx.body = { code: 0, data: questions };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { code: 1, message: error.message };
  }
};