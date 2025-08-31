// server/controller/exam.js
import pkg from '../generated/prisma/index.js';
const { PrismaClient } = pkg;
import OpenAI from "openai";
import { getAIConfig } from '../config/ai.js';

const prisma = new PrismaClient();

export const generateExam = async (ctx) => {
    try {
      const { subject, difficulty, duration, questionCounts, topics } = ctx.request.body;
      
      // 获取AI配置
      const aiConfig = getAIConfig('ALIYUN', 'qwen-max');
      const apiKey = process.env.ALIYUN_API_KEY;
      
      if (!apiKey) {
        throw new Error('ALIYUN API key is not configured');
      }
  
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: aiConfig.baseURL,
      });
  
      const prompt = `请根据以下要求智能组卷：
  科目：${subject}
  难度：${difficulty}
  时长：${duration}分钟
  题目数量：单选题${questionCounts.single}道，多选题${questionCounts.multiple}道，编程题${questionCounts.programming}道
  知识点：${topics.join('、')}
  
  请返回JSON格式的试卷结构。请严格参考以下JSON格式返回相关的数据，不要添加任何注释或额外文本：
  
  {
    "subject": "科目名称",
    "difficulty": "难度级别",
    "duration_minutes": 考试时长,
    "questions": [
      {
        "type": "single_choice",
        "question_id": "唯一ID",
        "content": "题目内容",
        "options": ["选项A", "选项B", "选项C", "选项D"],
        "answer": "正确答案"
      },
      {
        "type": "multiple_choice", 
        "question_id": "唯一ID",
        "content": "题目内容",
        "options": ["选项A", "选项B", "选项C", "选项D"],
        "answers": ["A", "B", "C"]
      },
      {
        "type": "programming",
        "question_id": "唯一ID", 
        "language": "编程语言",
        "content": "题目描述",
        "example_input": "示例输入",
        "example_output": "示例输出",
        "hints": ["提示1", "提示2"]
      }
    ]
  }
    
  注意：
  1. 必须严格按照上述格式返回
  2. 不要添加任何注释或说明文字
  3. 确保JSON格式完全正确
  4. 每个题目都要有唯一的question_id
  5. 确保题目内容和答案正确无误
  6. 确保题目类型和难度符合要求，符合${difficulty}难度要求
  7. 确保题目数量完全符合要求：单选题${questionCounts.single}道，多选题${questionCounts.multiple}道，编程题${questionCounts.programming}道
  8. 确保题目内容与${topics.join('、')}知识点相关`;
  
      const completion = await openai.chat.completions.create({
        model: aiConfig.model,
        messages: [
          {
            role: "system",
            content: "你是一个专业的智能组卷助手。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: aiConfig.max_tokens,
      });
  
      const content = completion.choices[0].message.content.trim();
      // const examData = JSON.parse(content);
  
       // 尝试提取JSON部分
       let examData;
       try {
         // 直接解析
         examData = JSON.parse(content);
       } catch (parseError) {
         // 如果直接解析失败，尝试提取JSON部分
         const jsonMatch = content.match(/\{[\s\S]*\}/);
         if (jsonMatch) {
           examData = JSON.parse(jsonMatch[0]);
         } else {
           throw new Error('AI返回的内容不是有效的JSON格式');
         }
       }
      ctx.body = { code: 0, data: examData };
    } catch (error) {
      console.error('Error generating exam:', error);
      ctx.status = 500;
      ctx.body = { code: 1, message: error.message };
    }
  };
  
  
  
  // ... existing code ...
  
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
          createdAt: 'desc'
        }
      });
  
      ctx.body = { code: 0, data: questions };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { code: 1, message: error.message };
    }
  };
  
  