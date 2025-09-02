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
        const subjectText = Array.isArray(subject) ? subject.join('、') : subject;

        const prompt = `请根据以下要求智能组卷：
  科目：${subjectText}
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


//保存试卷API
export const saveExam = async (ctx) => {
    try {
        const { title, subject, difficulty, duration, totalScore, questions } = ctx.request.body;

        // 创建试卷记录
        const exam = await prisma.exam.create({
            data: {
                title:title || `${subject}考试试卷`,
                subject: Array.isArray(subject) ? subject.join('、') : subject, 
                difficulty,
                duration: duration || 120, // 支持两种字段名
                totalScore: totalScore || 100, // 默认总分100
                status: 'active'
            }
        });
        // 创建试卷题目记录
        const examQuestions = await Promise.all(
            questions.map((question, index) =>
                prisma.examQuestion.create({
                    data: {
                        examId: exam.id,
                        type: question.type,
                        content: question.content,
                        options: question.options ? JSON.stringify(question.options) : null,
                        answer: question.answer||'',
                        score: question.score || 10,
                        difficulty: question.difficulty || difficulty || 'medium',
                        language: question.language||null,
                        order: index + 1
                    }
                })
            )
        );

        ctx.body = {
            code: 0,
            data: {
                examId: exam.id,
                message: '试卷保存成功'
            }
        };
    } catch (error) {
        console.error('Error saving exam:', error);
        ctx.status = 500;
        ctx.body = { code: 1, message: error.message || 'Failed to save exam' };
    }
};


// 获取试卷列表API
export const getExamList = async (ctx) => {
    try {
        const { page = 1, pageSize = 10, status } = ctx.query;

        const where = {};
        if (status) {
            where.status = status;
        } else {
            // 默认只显示非删除状态的试卷
            where.status = { not: 'deleted' };
        }

        const [exams, total] = await Promise.all([
            prisma.exam.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (parseInt(page) - 1) * parseInt(pageSize),
                take: parseInt(pageSize),
                include: {
                    _count: {
                        select: { examQuestions: true }
                    }
                }
            }),
            prisma.exam.count({ where })
        ]);
        ctx.body = {
            code: 0,
            data: {
                exams,
                total,
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            }
        };
    } catch (error) {
        console.error('Error getting exam list:', error);
        ctx.status = 500;
        ctx.body = { code: 1, message: error.message || 'Failed to get exam list' };
    }
};

// 获取试卷详情API
export const getExamDetail = async (ctx) => {
    try {
        const { id } = ctx.params;

        const exam = await prisma.exam.findUnique({
            where: { id: parseInt(id) },
            include: {
                examQuestions: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!exam) {
            ctx.status = 404;
            ctx.body = { code: 1, message: '试卷不存在' };
            return;
        }

        ctx.body = { code: 0, data: exam };
    } catch (error) {
        console.error('Error getting exam detail:', error);
        ctx.status = 500;
        ctx.body = { code: 1, message: error.message || 'Failed to get exam detail' };
    }
};

// 删除试卷API
export const deleteExam = async (ctx) => {
    try {
        const { id } = ctx.params;

        await prisma.exam.update({
            where: { id: parseInt(id) },
            data: { status: 'deleted' }
        });

        ctx.body = { code: 0, message: '试卷删除成功' };
    } catch (error) {
        console.error('Error deleting exam:', error);
        ctx.status = 500;
        ctx.body = { code: 1, message: error.message || 'Failed to delete exam' };
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

