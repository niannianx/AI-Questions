// server/config/ai.js
export const AI_PROVIDERS = {
  ALIYUN: {
    name: 'aliyun',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: {
      'qwen-plus': {
        name: 'qwen-plus',
        temperature: 0.7,
        max_tokens: 2000
      },
      'qwen-turbo': {
        name: 'qwen-turbo',
        temperature: 0.7,
        max_tokens: 1500
      },
      'qwen-max': {
        name: 'qwen-max',
        temperature: 0.7,
        max_tokens: 2500
      }
    }
  },
  
};

export const getAIConfig = (provider, model) => {
  const providerConfig = AI_PROVIDERS[provider];
  if (!providerConfig) {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }

  const modelConfig = providerConfig.models[model];
  if (!modelConfig) {
    throw new Error(`Unsupported model: ${model} for provider: ${provider}`);
  }

  return {
    baseURL: providerConfig.baseURL,
    model: modelConfig.name,
    temperature: modelConfig.temperature,
    max_tokens: modelConfig.max_tokens
  };
};