/**
 * @description 静态数据与常量：默认空间、默认集合、内置图标映射与示例站点。
 * 空间与集合会在首次启动时写入用户配置，此后以配置中的数据为准（可在界面里增删改）。
 */

/** @type {Array<{key: string, label: string, color: string, icon: string}>} 默认空间 */
export const defaultSpaces = [
  { key: "work", label: "工作台", color: "#46698f", icon: "briefcase" },
  { key: "research", label: "研究室", color: "#7b5c8e", icon: "telescope" },
  { key: "life", label: "生活区", color: "#4f7560", icon: "coffee" }
];

/** @type {Array<{name: string, color: string}>} 默认集合（分类） */
export const defaultCategories = [
  { name: "AI", color: "#e85f43" },
  { name: "开发", color: "#46698f" },
  { name: "设计", color: "#9c6e24" },
  { name: "内容", color: "#7b5c8e" },
  { name: "效率", color: "#4f7560" },
  { name: "生活", color: "#9a6460" }
];

/** @type {string} 中性标识色：无颜色或颜色非法时的统一回退 */
export const NEUTRAL_COLOR = "#65736b";

/** @type {string[]} 管理界面里可选的标识色（低饱和、深浅色下都可读） */
export const palette = [
  "#e85f43", "#c2543f", "#9a6460",
  "#9c6e24", "#b08430", "#4f7560",
  "#2a7f8c", "#46698f", "#5a5f9e",
  "#7b5c8e", "#a05577", NEUTRAL_COLOR
];

/** @type {Record<string, string>} 常用域名到本地 favicon 的映射 */
export const faviconMap = {
  "github.com": "/favicons/github.png",
  "chatgpt.com": "/favicons/chatgpt.png",
  "notion.so": "/favicons/notion.png",
  "figma.com": "/favicons/figma.png",
  "perplexity.ai": "/favicons/perplexity.png",
  "linear.app": "/favicons/linear.png",
  "vercel.com": "/favicons/vercel.png",
  "mail.google.com": "/favicons/gmail.png",
  "youtube.com": "/favicons/youtube.png",
  "bilibili.com": "/favicons/bilibili.png",
  "deepl.com": "/favicons/deepl.png",
  "excalidraw.com": "/favicons/excalidraw.png"
};

/** @type {Array<object>} 首次启动时展示的示例站点 */
export const sampleSites = [
  {
    id: "site-github",
    name: "GitHub",
    url: "https://github.com/",
    description: "代码仓库、Issue 与项目协作。",
    category: "开发",
    space: "work",
    tags: ["代码", "协作"],
    favicon: "/favicons/github.png",
    favorite: true,
    lastUsed: 1785039600000
  },
  {
    id: "site-chatgpt",
    name: "ChatGPT",
    url: "https://chatgpt.com/",
    description: "写作、分析和日常问题处理。",
    category: "AI",
    space: "work",
    tags: ["AI", "写作"],
    favicon: "/favicons/chatgpt.png",
    favorite: true,
    lastUsed: 1785042600000
  },
  {
    id: "site-notion",
    name: "Notion",
    url: "https://www.notion.so/",
    description: "项目资料、知识库与个人记录。",
    category: "效率",
    space: "work",
    tags: ["笔记", "项目"],
    favicon: "/favicons/notion.png",
    favorite: true,
    lastUsed: 1785033200000
  },
  {
    id: "site-figma",
    name: "Figma",
    url: "https://www.figma.com/",
    description: "界面设计、原型与设计评审。",
    category: "设计",
    space: "work",
    tags: ["UI", "原型"],
    favicon: "/favicons/figma.png",
    favorite: false,
    lastUsed: 1784966400000
  },
  {
    id: "site-perplexity",
    name: "Perplexity",
    url: "https://www.perplexity.ai/",
    description: "带来源的检索与资料探索。",
    category: "AI",
    space: "research",
    tags: ["检索", "资料"],
    favicon: "/favicons/perplexity.png",
    favorite: true,
    lastUsed: 1785041400000
  },
  {
    id: "site-linear",
    name: "Linear",
    url: "https://linear.app/",
    description: "任务规划、缺陷管理与迭代节奏。",
    category: "效率",
    space: "work",
    tags: ["任务", "团队"],
    favicon: "/favicons/linear.png",
    favorite: false,
    lastUsed: 1784872800000
  },
  {
    id: "site-vercel",
    name: "Vercel",
    url: "https://vercel.com/",
    description: "前端项目部署与运行状态。",
    category: "开发",
    space: "work",
    tags: ["部署", "前端"],
    favicon: "/favicons/vercel.png",
    favorite: false,
    lastUsed: 1784786400000
  },
  {
    id: "site-gmail",
    name: "Gmail",
    url: "https://mail.google.com/",
    description: "邮件收件箱与工作沟通。",
    category: "效率",
    space: "work",
    tags: ["邮件"],
    favicon: "/favicons/gmail.png",
    favorite: false,
    lastUsed: 1785025200000
  },
  {
    id: "site-youtube",
    name: "YouTube",
    url: "https://www.youtube.com/",
    description: "视频课程、访谈与灵感素材。",
    category: "内容",
    space: "research",
    tags: ["视频", "学习"],
    favicon: "/favicons/youtube.png",
    favorite: false,
    lastUsed: 1784692800000
  },
  {
    id: "site-bilibili",
    name: "哔哩哔哩",
    url: "https://www.bilibili.com/",
    description: "中文教程、科技内容与休闲视频。",
    category: "内容",
    space: "life",
    tags: ["视频", "中文"],
    favicon: "/favicons/bilibili.png",
    favorite: false,
    lastUsed: 1784606400000
  },
  {
    id: "site-deepl",
    name: "DeepL",
    url: "https://www.deepl.com/translator",
    description: "多语言翻译与文本润色。",
    category: "效率",
    space: "research",
    tags: ["翻译", "语言"],
    favicon: "/favicons/deepl.png",
    favorite: false,
    lastUsed: 1784959200000
  },
  {
    id: "site-excalidraw",
    name: "Excalidraw",
    url: "https://excalidraw.com/",
    description: "快速画草图、流程与讨论框架。",
    category: "设计",
    space: "research",
    tags: ["白板", "图示"],
    favicon: "/favicons/excalidraw.png",
    favorite: false,
    lastUsed: 1784520000000
  }
];
