import pkg from '../generated/prisma/index.js';
const { PrismaClient } = pkg;
import OpenAI from "openai";

const prisma = new PrismaClient();

// List questions with pagination and filters
export const listQuestions = async (ctx) => {
  try {
    const { page = 1, pageSize = 10, type, difficulty, search } = ctx.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const where = {};
    if (type) where.type = type;
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.content = {
        contains: search,
      };
    }

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    ctx.body = {
      code: 0,
      data: {
        total,
        list: questions,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { code: 1, message: error.message };
  }
};


export const createQuestion = async (ctx) => {
  try {
    const question = await prisma.question.create({
      data: ctx.request.body,
    });
    ctx.body = { code: 0, data: question };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { code: 1, message: error.message };
  }
};


export const updateQuestion = async (ctx) => {
  try {
    const { id } = ctx.params;
    const question = await prisma.question.update({
      where: { id: parseInt(id) },
      data: ctx.request.body,
    });
    ctx.body = { code: 0, data: question };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { code: 1, message: error.message };
  }
};


export const deleteQuestions = async (ctx) => {
  try {
    const { ids } = ctx.request.body;
    await prisma.question.deleteMany({
      where: {
        id: {
          in: ids.map(id => parseInt(id)),
        },
      },
    });
    ctx.body = { code: 0, message: 'Questions deleted successfully' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { code: 1, message: error.message };
  }
};


import { getAIConfig } from '../config/ai.js';

export const generateQuestions = async (ctx) => {
  try {
    const { type, count = 1, difficulty, language, model = 'qwen-plus', provider = 'ALIYUN' } = ctx.request.body;
    
    // 获取 AI 配置
    const aiConfig = getAIConfig(provider, model);
    
    // 获取 API Key
    const apiKey = process.env[`${provider}_API_KEY`];
    if (!apiKey) {
      throw new Error(`${provider} API key is not configured`);
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: aiConfig.baseURL,
    });

    let prompt = '';
    const languages = Array.isArray(language) ? language : [language];
    const languageText = languages.length > 0 ? languages.join('、') + '编程相关的' : '';

    if (type === 'programming') {
      prompt = `请生成${count}道${languageText}${difficulty}难度的编程题目，必须严格按照以下JSON数组格式返回，不要返回其他任何内容：
      [{
        "type": "programming",
        "content": "题目描述",
        "options": null,
        "answer": "参考答案",
        "difficulty": "${difficulty}",
        "language": ${JSON.stringify(languages)}
      }]`;
    } else {
      prompt = `请生成${count}道${languageText}${type === 'single' ? '单' : '多'}选题，难度为${difficulty}，必须严格按照以下JSON数组格式返回，不要返回其他任何内容：
      [{
        "type": "${type}",
        "content": "题目描述",
        "options": ["选项A的内容", "选项B的内容", "选项C的内容", "选项D的内容"],
        "answer": ${type === 'single' ? '"A"' : '["A", "B"]'},
        "difficulty": "${difficulty}",
        "language": ${JSON.stringify(languages)}
      }]`;
    }

    const completion = await openai.chat.completions.create({
      model: aiConfig.model,
      messages: [
        {
          role: "system",
          content: "你是一个专业的题目生成助手。请严格按照JSON格式生成题目，不要添加任何额外的文字说明。确保返回的是一个有效的JSON数组。" + 
                  (languages.length > 0 ? `请确保生成的题目都与${languageText}相关。` : '')
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: aiConfig.temperature,
      max_tokens: aiConfig.max_tokens,
    });

    let questions;
    try {
      const content = completion.choices[0].message.content.trim();
      console.log('AI Response:', content);
      
      // 尝试提取 JSON 部分
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }
      
      questions = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(questions)) {
        questions = [questions];
      }

      // 验证每个问题的格式
      questions = questions.map(q => ({
        type: q.type || type,
        content: q.content,
        options: type === 'programming' 
          ? null 
          : JSON.stringify(Array.isArray(q.options) ? q.options : JSON.parse(q.options)),
        // answer: JSON.stringify(q.answer),
        answer: type === 'single' ? q.answer : JSON.stringify(q.answer), // 单选题答案保持为单个字符
        difficulty: q.difficulty || difficulty,
        language: languages.length > 0 ? JSON.stringify(languages) : null
      }));

    } catch (parseError) {
      console.error('Error parsing AI response:', completion.choices[0].message.content);
      throw new Error('Failed to parse AI response as JSON');
    }

    ctx.body = { code: 0, data: questions };
  } catch (error) {
    console.error('Error generating questions:', error);
    ctx.status = 500;
    ctx.body = { code: 1, message: error.message || 'Failed to generate questions' };
  }
};