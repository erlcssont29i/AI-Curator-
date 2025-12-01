import { AppConfig } from './types';

export const DEFAULT_CATEGORIES = ['AI技術', '產業應用', '政策法規', '市場趨勢'];

export const DEFAULT_CONFIG: AppConfig = {
  targetUrls: 'https://news.ycombinator.com\nhttps://dev.to/t/ai',
  keywords: 'AI, LLM, Generative AI, Machine Learning',
  
  scheduleFrequency: 'weekly',
  scheduleDay: 'Friday',
  scheduleHour: '09',
  scheduleMinute: '00',

  scoreThreshold: 4,
  categories: DEFAULT_CATEGORIES,
  categoryQuotas: {
    'AI技術': 2,
    '產業應用': 2,
    '政策法規': 1,
    '市場趨勢': 2
  },
  promptTemplate: `請根據以下文章內容，生成一份專業的週報摘要：

## 文章資訊
標題：{{title}}
來源：{{source}}
日期：{{date}}

## 原始內容
{{content}}

## 輸出要求
1. 用 2-3 句話總結文章核心觀點
2. 列出 3-5 個關鍵要點
3. 說明這篇文章的價值與啟發
4. 使用 Markdown 格式輸出

請保持專業、簡潔、客觀的風格。`
};

export const MOCK_ARTICLES_POOL = [
  {
    title: "GPT-5 正式發布：多模態能力全面升級",
    content: "OpenAI 今日發布了最新一代模型 GPT-5，具備更強的推理能力與視覺處理速度...",
    source: "TechCrunch",
    category: "AI技術",
    score: 5
  },
  {
    title: "歐盟 AI 法案最新進展與影響分析",
    content: "歐盟議會今日通過了 AI 法案的修正案，對開源模型的使用進行了新的規範...",
    source: "AI Policy Hub",
    category: "政策法規",
    score: 4
  },
  {
    title: "自動駕駛技術在物流業的應用案例",
    content: "DHL 宣布在歐洲全面導入 L4 級別自動駕駛卡車，預計降低 30% 運輸成本...",
    source: "Industry Weekly",
    category: "產業應用",
    score: 4
  },
  {
    title: "2024 Q4 AI 晶片市場報告",
    content: "NVIDIA 市佔率持續擴大，AMD 與 Intel 推出新品試圖搶佔邊緣運算市場...",
    source: "Market Research",
    category: "市場趨勢",
    score: 3
  },
  {
    title: "如何使用 React Server Components 建構 AI 應用",
    content: "本文詳細介紹了 Next.js 14 的新特性，以及如何整合 LangChain...",
    source: "Dev.to",
    category: "AI技術",
    score: 5
  }
];