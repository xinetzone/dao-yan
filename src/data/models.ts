/** Available AI models for chat */
export interface ModelOption {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    nameZh: "Claude Sonnet 4.5",
    description: "Best for complex reasoning",
    descriptionZh: "擅长复杂推理",
  },
  {
    id: "google/gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    nameZh: "Gemini 3.1 Pro",
    description: "Fast and capable",
    descriptionZh: "快速且强大",
  },
  {
    id: "openai/gpt-5.4",
    name: "GPT 5.4",
    nameZh: "GPT 5.4",
    description: "Powerful general-purpose model",
    descriptionZh: "强大的通用模型",
  },
  {
    id: "anthropic/claude-opus-4.7",
    name: "Claude Opus 4.7",
    nameZh: "Claude Opus 4.7",
    description: "Most capable, best for creative & nuanced tasks",
    descriptionZh: "最强模型，擅长创意与细腻任务",
  },
  {
    id: "z-ai/glm-5",
    name: "GLM 5",
    nameZh: "GLM 5",
    description: "Advanced Chinese-optimized model",
    descriptionZh: "智谱旗舰模型，中文优化",
  },
];

export const DEFAULT_MODEL_ID = "z-ai/glm-5";
