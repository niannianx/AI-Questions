import OpenAI from "openai";
import "dotenv/config";
// import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname,join } from "path";


// 获取当前文件的目录（test 文件夹）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 构建指向根目录 .env 的相对路径
const envPath = join(__dirname, "../.env"); // 从 test 文件夹向上一级

// 加载 .env 文件
dotenv.config({ path: envPath });
// dotenv.config(); // 默认加载项目根目录下的 .env 文件
// 调试输出
console.log("尝试加载 .env 文件:", envPath);
console.log("加载的 ALI_API_KEY:", process.env.ALI_API_KEY);
try {
  const openai = new OpenAI({
    // 若没有配置环境变量，请用阿里云百炼API Key将下行替换为：apiKey: "sk-xxx",
    apiKey: process.env.ALI_API_KEY,
    // apiKey: "sk-21ab5a678e2e4fbf9d2acd27265befb7",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });
  const completion = await openai.chat.completions.create({
    model: "qwen-plus", //模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
    messages: [
      {
        role: "user",
        content: `
          帮我出2道React相关的选择器，以JSON的格式返回，如下：
      [{
       "title": "React的生命周期函数有几个阶段？",
       "content": "具体描述",
       "options": [
         "1个",
         "2个",
         "3个",
         "4个"
       ],
       answer: [0, 1]
      }]  
    `,
      },
    ],
  });
  console.log(completion.choices[0].message.content);
} catch (error) {
  console.log(`错误信息：${error}`);
  console.log("请参考文档：https://help.aliyun.com/zh/model-studio/developer-reference/error-code");
}