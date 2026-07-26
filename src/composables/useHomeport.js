import { computed, reactive, watch } from "vue";
import { message } from "antdv-next";
import { defaultCategories, defaultSpaces, faviconMap, NEUTRAL_COLOR, sampleSites } from "../data/presets.js";

const STORAGE_KEY = "homeport-config-v1";
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * @description 校验标识色，非法时回退到中性色。
 * @param {*} value - 待校验的颜色值
 * @returns {string} 合法的 hex 颜色
 */
function sanitizeColor(value) {
  return HEX_COLOR.test(value) ? value : NEUTRAL_COLOR;
}

/** @type {object} 默认配置：示例站点 + 默认空间/集合 + 默认偏好 */
const defaultConfig = {
  version: "1.1",
  sites: sampleSites,
  spaces: defaultSpaces,
  categories: defaultCategories,
  preferences: {
    theme: "light",
    view: "grid",
    sort: "manual",
    lastExport: null
  }
};

/**
 * @description 深拷贝一个可 JSON 序列化的值。
 * @param {*} value - 需要拷贝的值
 * @returns {*} 与输入结构相同的全新副本
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * @description 读取系统偏好的主题色（深/浅）。
 * @returns {"light"|"dark"} 系统当前偏好的主题
 */
function getPreferredTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * @description 解析 URL 中的 ?theme=light|dark 初始主题覆盖（便于分享指定主题的链接）。
 * @returns {"light"|"dark"|null} 合法的主题参数；未指定时为 null
 */
function getThemeOverride() {
  const value = new URLSearchParams(window.location.search).get("theme");
  return value === "dark" || value === "light" ? value : null;
}

/**
 * @description 规范化用户输入的网址：补全协议并校验仅允许 HTTP(S)。
 * @param {string} value - 用户输入的原始网址
 * @returns {string} 规范化后的完整 URL
 * @throws {Error} 当协议不是 HTTP/HTTPS 或 URL 无法解析时抛出
 */
export function normalizeUrl(value) {
  let raw = String(value || "").trim();
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  const parsed = new URL(raw);
  if (!/^https?:$/.test(parsed.protocol)) throw new Error("仅支持 HTTP 或 HTTPS 网址");
  return parsed.href;
}

/**
 * @description 从 URL 中提取去掉 www 前缀的域名。
 * @param {string} url - 完整 URL
 * @returns {string} 域名；解析失败时返回空字符串
 */
export function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (error) {
    return "";
  }
}

/**
 * @description 根据域名取 favicon：优先内置资源，否则回退到 Google favicon 服务。
 * @param {string} domain - 站点域名
 * @returns {string} favicon 图片地址
 */
export function getFavicon(domain) {
  return faviconMap[domain] || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

/**
 * @description 判断站点是否命中搜索词（名称/网址/描述/分类/标签）。
 * 主列表过滤与搜索联想共用同一份匹配语义。
 * @param {object} site - 站点对象
 * @param {string} query - 已小写化的搜索词
 * @returns {boolean} 是否命中
 */
export function matchesQuery(site, query) {
  if (!query) return true;
  return [site.name, site.url, site.description, site.category, ...(site.tags || [])]
    .join(" ")
    .toLocaleLowerCase("zh-CN")
    .includes(query);
}

/**
 * @description 生成唯一 ID，优先使用 crypto.randomUUID。
 * @param {string} prefix - 兜底 ID 的前缀
 * @returns {string} 新的唯一 ID
 */
function createId(prefix = "site") {
  if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * @description 清洗空间列表：字段裁剪、颜色校验、key 去重，空列表回退默认空间。
 * @param {*} input - 待清洗的空间数组
 * @returns {Array<object>} 合法的空间列表（至少一项）
 */
function sanitizeSpaces(input) {
  const seen = new Set();
  const spaces = (Array.isArray(input) ? input : [])
    .filter((space) => space && typeof space.key === "string" && space.key && typeof space.label === "string" && space.label.trim())
    .filter((space) => !seen.has(space.key) && seen.add(space.key))
    .map((space) => ({
      key: space.key.slice(0, 40),
      label: space.label.trim().slice(0, 20),
      color: sanitizeColor(space.color),
      icon: typeof space.icon === "string" ? space.icon.slice(0, 20) : "folder"
    }));
  return spaces.length ? spaces : clone(defaultSpaces);
}

/**
 * @description 清洗集合列表：字段裁剪、颜色校验、名称去重。
 * 若配置里没有集合（旧版本配置），用默认集合并补上站点里实际用到的分类。
 * @param {*} input - 待清洗的集合数组
 * @param {Array<object>} sites - 已清洗的站点（用于旧配置补全）
 * @returns {Array<object>} 合法的集合列表（至少一项）
 */
function sanitizeCategories(input, sites) {
  const seen = new Set();
  let categories = (Array.isArray(input) ? input : [])
    .filter((category) => category && typeof category.name === "string" && category.name.trim())
    .map((category) => ({
      name: category.name.trim().slice(0, 20),
      color: sanitizeColor(category.color)
    }))
    .filter((category) => !seen.has(category.name) && seen.add(category.name));
  if (!categories.length) {
    categories = clone(defaultCategories);
    categories.forEach((category) => seen.add(category.name));
  }
  for (const site of sites) {
    if (site.category && !seen.has(site.category)) {
      seen.add(site.category);
      categories.push({ name: site.category, color: NEUTRAL_COLOR });
    }
  }
  return categories;
}

/**
 * @description 清洗单个站点对象：裁剪长度、校验 URL、补全缺省字段，抵御脏数据导入。
 * @param {object} site - 待清洗的站点数据
 * @param {Set<string>} spaceKeySet - 合法空间 key 集合
 * @param {string} fallbackSpace - 空间非法时的回退 key
 * @returns {object|null} 合法的站点对象；无法修复时返回 null
 */
function sanitizeSite(site, spaceKeySet, fallbackSpace) {
  if (!site || typeof site.name !== "string" || typeof site.url !== "string") return null;
  try {
    const safeUrl = normalizeUrl(site.url);
    const domain = getDomain(safeUrl);
    return {
      id: typeof site.id === "string" && site.id ? site.id : createId(),
      name: site.name.trim().slice(0, 80),
      url: safeUrl,
      description: typeof site.description === "string" ? site.description.trim().slice(0, 180) : "",
      category: typeof site.category === "string" && site.category ? site.category.trim().slice(0, 20) : "",
      space: spaceKeySet.has(site.space) ? site.space : fallbackSpace,
      tags: Array.isArray(site.tags) ? site.tags.map((tag) => String(tag).trim().slice(0, 18)).filter(Boolean).slice(0, 6) : [],
      favicon: typeof site.favicon === "string" && site.favicon ? site.favicon : getFavicon(domain),
      favorite: Boolean(site.favorite),
      lastUsed: Number(site.lastUsed) || Date.now()
    };
  } catch (error) {
    return null;
  }
}

/**
 * @description 清洗整份配置（空间 + 集合 + 站点 + 偏好），非法输入回退到默认配置。
 * @param {object} input - 从 localStorage 或导入文件解析出的配置
 * @returns {object} 结构可信的配置对象
 */
export function sanitizeConfig(input) {
  if (!input || !Array.isArray(input.sites)) return clone(defaultConfig);
  const spaces = sanitizeSpaces(input.spaces);
  const spaceKeySet = new Set(spaces.map((space) => space.key));
  const fallbackSpace = spaces[0].key;
  const sites = input.sites.map((site) => sanitizeSite(site, spaceKeySet, fallbackSpace)).filter(Boolean);
  const categories = sanitizeCategories(input.categories, sites);
  const fallbackCategory = categories[0].name;
  const categoryNames = new Set(categories.map((category) => category.name));
  sites.forEach((site) => {
    if (!categoryNames.has(site.category)) site.category = fallbackCategory;
  });
  const prefs = input.preferences || {};
  return {
    version: "1.1",
    sites,
    spaces,
    categories,
    preferences: {
      theme: ["light", "dark"].includes(prefs.theme) ? prefs.theme : "light",
      view: ["grid", "list"].includes(prefs.view) ? prefs.view : "grid",
      sort: ["manual", "name", "recent"].includes(prefs.sort) ? prefs.sort : "manual",
      lastExport: prefs.lastExport || null
    }
  };
}

/**
 * @description 从 localStorage 加载配置，损坏或缺失时返回默认配置副本。
 * @returns {object} 可用的配置对象
 */
function loadConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return clone(defaultConfig);
    return sanitizeConfig(JSON.parse(stored));
  } catch (error) {
    return clone(defaultConfig);
  }
}

const config = reactive(loadConfig());

const state = reactive({
  activeSpace: "all",
  activeCategory: "all",
  query: "",
  view: config.preferences.view,
  sort: config.preferences.sort,
  theme: getThemeOverride() || config.preferences.theme
});

/**
 * @description 把当前配置与偏好写入 localStorage。
 * @returns {void}
 */
function persist() {
  config.preferences.theme = state.theme;
  config.preferences.view = state.view;
  config.preferences.sort = state.sort;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * @description 按 key 查找空间元数据，未命中时返回占位对象（例如空间刚被删除的瞬间）。
 * @param {string} key - 空间 key
 * @returns {{key: string, label: string, color: string, icon: string}} 空间对象
 */
function getSpace(key) {
  return config.spaces.find((space) => space.key === key)
    || { key, label: "未分组", color: NEUTRAL_COLOR, icon: "folder" };
}

/**
 * @description 按名称查找集合颜色。
 * @param {string} name - 集合名
 * @returns {string} 颜色 hex；未命中时为中性灰
 */
function getCategoryColor(name) {
  const category = config.categories.find((item) => item.name === name);
  return category ? category.color : NEUTRAL_COLOR;
}

/** @description 各空间与收藏的站点数量统计（单次遍历，key 随配置动态变化） */
const spaceCounts = computed(() => {
  const counts = { all: config.sites.length, favorites: 0 };
  for (const space of config.spaces) counts[space.key] = 0;
  for (const site of config.sites) {
    if (site.favorite) counts.favorites += 1;
    counts[site.space] = (counts[site.space] || 0) + 1;
  }
  return counts;
});

/** @description 各集合（分类）的站点数量统计 */
const categoryCounts = computed(() =>
  config.sites.reduce((acc, site) => {
    acc[site.category] = (acc[site.category] || 0) + 1;
    return acc;
  }, {})
);

/** @description 当前空间 + 集合 + 搜索词过滤并排序后的站点列表 */
const filteredSites = computed(() => {
  const query = state.query.trim().toLocaleLowerCase("zh-CN");
  const sites = config.sites.filter((site) => {
    const matchesSpace = state.activeSpace === "all"
      || (state.activeSpace === "favorites" ? site.favorite : site.space === state.activeSpace);
    const matchesCategory = state.activeCategory === "all" || site.category === state.activeCategory;
    return matchesSpace && matchesCategory && matchesQuery(site, query);
  });
  if (state.sort === "name") sites.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
  if (state.sort === "recent") sites.sort((a, b) => b.lastUsed - a.lastUsed);
  return sites;
});

/** @description 顶部文案：「工作台 · 全部集合 · 7 个入口」 */
const resultSummary = computed(() => {
  const scopeLabel = state.activeSpace === "favorites"
    ? "收藏"
    : state.activeSpace === "all"
      ? "全部空间"
      : getSpace(state.activeSpace).label;
  const categoryLabel = state.activeCategory === "all" ? "全部集合" : state.activeCategory;
  return `${scopeLabel} · ${categoryLabel} · ${filteredSites.value.length} 个入口`;
});

/**
 * @description 切换收藏状态、持久化并弹出提示。
 * @param {string} id - 站点 ID
 * @returns {void}
 */
function toggleFavorite(id) {
  const site = config.sites.find((item) => item.id === id);
  if (!site) return;
  site.favorite = !site.favorite;
  persist();
  message.success(site.favorite ? "已加入收藏" : "已取消收藏");
}

/**
 * @description 记录站点被打开的时间（用于「最近使用」排序）。
 * @param {string} id - 站点 ID
 * @returns {void}
 */
function markSiteUsed(id) {
  const site = config.sites.find((item) => item.id === id);
  if (!site) return;
  site.lastUsed = Date.now();
  persist();
}

/**
 * @description 新增或更新站点；URL 重复时抛错交由表单展示。
 * @param {object} payload - 表单收集的站点字段（含可选 id 表示编辑）
 * @returns {void}
 * @throws {Error} 名称为空、URL 非法或与现有站点重复时抛出
 */
function saveSite(payload) {
  const name = String(payload.name || "").trim();
  if (!name) throw new Error("请填写站点名称。");
  const url = normalizeUrl(payload.url);
  const duplicate = config.sites.find((site) => site.url === url && site.id !== payload.id);
  if (duplicate) throw new Error(`“${duplicate.name}” 已使用这个网址。`);
  const domain = getDomain(url);
  const siteData = {
    id: payload.id || createId(),
    name,
    url,
    description: String(payload.description || "").trim(),
    space: payload.space,
    category: payload.category,
    tags: String(payload.tags || "").split(/[,，]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 6),
    favicon: getFavicon(domain),
    favorite: false,
    lastUsed: Date.now()
  };
  if (payload.id) {
    const index = config.sites.findIndex((site) => site.id === payload.id);
    const previous = config.sites[index];
    siteData.favorite = previous.favorite;
    siteData.lastUsed = previous.lastUsed;
    siteData.favicon = previous.favicon && getDomain(previous.url) === domain ? previous.favicon : getFavicon(domain);
    config.sites[index] = siteData;
  } else {
    config.sites.unshift(siteData);
  }
  persist();
}

/**
 * @description 删除站点。
 * @param {string} id - 站点 ID
 * @returns {object|undefined} 被删除的站点（不存在时为 undefined）
 */
function removeSite(id) {
  const index = config.sites.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  const [removed] = config.sites.splice(index, 1);
  persist();
  return removed;
}

/**
 * @description 手动排序模式下把一个站点移动到另一个站点的位置。
 * @param {string} fromId - 被拖动的站点 ID
 * @param {string} toId - 目标位置的站点 ID
 * @returns {void}
 */
function reorderSites(fromId, toId) {
  if (!fromId || !toId || fromId === toId) return;
  const fromIndex = config.sites.findIndex((site) => site.id === fromId);
  const toIndex = config.sites.findIndex((site) => site.id === toId);
  if (fromIndex < 0 || toIndex < 0) return;
  const [moved] = config.sites.splice(fromIndex, 1);
  config.sites.splice(toIndex, 0, moved);
  persist();
}

/**
 * @description 把引用某个空间 / 集合的站点批量迁移到新值。
 * @param {"space"|"category"} field - 站点上的字段名
 * @param {string} fromValue - 迁出的旧值
 * @param {string} toValue - 迁入的新值
 * @returns {number} 迁移的站点数量
 */
function migrateSites(field, fromValue, toValue) {
  let moved = 0;
  config.sites.forEach((site) => {
    if (site[field] === fromValue) {
      site[field] = toValue;
      moved += 1;
    }
  });
  return moved;
}

/**
 * @description 新增空间。
 * @param {{label: string, color: string, icon: string}} payload - 空间属性
 * @returns {void}
 * @throws {Error} 名称为空或与现有空间重名时抛出
 */
function addSpace(payload) {
  const label = String(payload.label || "").trim().slice(0, 20);
  if (!label) throw new Error("请填写空间名称。");
  if (config.spaces.some((space) => space.label === label)) throw new Error(`空间「${label}」已存在。`);
  config.spaces.push({
    key: createId("space"),
    label,
    color: sanitizeColor(payload.color),
    icon: payload.icon || "folder"
  });
  persist();
  message.success(`已创建空间「${label}」`);
}

/**
 * @description 更新空间的名称 / 颜色 / 图标（key 保持不变，站点无需迁移）。
 * @param {string} key - 空间 key
 * @param {{label?: string, color?: string, icon?: string}} patch - 要更新的字段
 * @returns {void}
 * @throws {Error} 新名称与其他空间重名时抛出
 */
function updateSpace(key, patch) {
  const space = config.spaces.find((item) => item.key === key);
  if (!space) return;
  if (typeof patch.label === "string" && patch.label.trim()) {
    const label = patch.label.trim().slice(0, 20);
    if (config.spaces.some((item) => item.label === label && item.key !== key)) throw new Error(`空间「${label}」已存在。`);
    space.label = label;
  }
  if (HEX_COLOR.test(patch.color)) space.color = patch.color;
  if (typeof patch.icon === "string" && patch.icon) space.icon = patch.icon;
  persist();
}

/**
 * @description 删除空间，其中的站点迁移到第一个剩余空间。
 * @param {string} key - 空间 key
 * @returns {void}
 * @throws {Error} 只剩最后一个空间时抛出
 */
function removeSpace(key) {
  if (config.spaces.length <= 1) throw new Error("至少保留一个空间。");
  const index = config.spaces.findIndex((space) => space.key === key);
  if (index < 0) return;
  const [removed] = config.spaces.splice(index, 1);
  const fallback = config.spaces[0];
  const moved = migrateSites("space", key, fallback.key);
  if (state.activeSpace === key) state.activeSpace = "all";
  persist();
  message.success(moved
    ? `已删除「${removed.label}」，${moved} 个站点移到「${fallback.label}」`
    : `已删除空间「${removed.label}」`);
}

/**
 * @description 新增集合。
 * @param {{name: string, color: string}} payload - 集合属性
 * @returns {void}
 * @throws {Error} 名称为空或与现有集合重名时抛出
 */
function addCategory(payload) {
  const name = String(payload.name || "").trim().slice(0, 20);
  if (!name) throw new Error("请填写集合名称。");
  if (config.categories.some((category) => category.name === name)) throw new Error(`集合「${name}」已存在。`);
  config.categories.push({ name, color: sanitizeColor(payload.color) });
  persist();
  message.success(`已创建集合「${name}」`);
}

/**
 * @description 更新集合：重命名会同步更新所有引用该集合的站点。
 * @param {string} name - 现有集合名
 * @param {{name?: string, color?: string}} patch - 要更新的字段
 * @returns {void}
 * @throws {Error} 新名称与其他集合重名时抛出
 */
function updateCategory(name, patch) {
  const category = config.categories.find((item) => item.name === name);
  if (!category) return;
  const nextName = typeof patch.name === "string" ? patch.name.trim().slice(0, 20) : "";
  if (nextName && nextName !== name) {
    if (config.categories.some((item) => item.name === nextName)) throw new Error(`集合「${nextName}」已存在。`);
    category.name = nextName;
    migrateSites("category", name, nextName);
    if (state.activeCategory === name) state.activeCategory = nextName;
  }
  if (HEX_COLOR.test(patch.color)) category.color = patch.color;
  persist();
}

/**
 * @description 删除集合，其中的站点迁移到第一个剩余集合。
 * @param {string} name - 集合名
 * @returns {void}
 * @throws {Error} 只剩最后一个集合时抛出
 */
function removeCategory(name) {
  if (config.categories.length <= 1) throw new Error("至少保留一个集合。");
  const index = config.categories.findIndex((category) => category.name === name);
  if (index < 0) return;
  config.categories.splice(index, 1);
  const fallback = config.categories[0].name;
  const moved = migrateSites("category", name, fallback);
  if (state.activeCategory === name) state.activeCategory = "all";
  persist();
  message.success(moved
    ? `已删除「${name}」，${moved} 个站点移到「${fallback}」`
    : `已删除集合「${name}」`);
}

/**
 * @description 构造导出 / 复制共用的配置载荷文本。
 * @returns {string} 带导出时间戳的格式化 JSON 文本
 */
function buildExportText() {
  return JSON.stringify({ ...config, exportedAt: new Date().toISOString(), source: "Homeport" }, null, 2);
}

/**
 * @description 导出配置为 JSON 文件下载并提示成功。
 * @returns {void}
 */
function exportConfig() {
  const blob = new Blob([buildExportText()], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `homeport-config-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  config.preferences.lastExport = new Date().toISOString();
  persist();
  message.success("配置文件已导出");
}

/**
 * @description 把配置 JSON 文本复制到剪贴板（含 execCommand 兜底）并提示成功。
 * @returns {Promise<void>} 复制完成的 Promise
 */
async function copyConfig() {
  const text = buildExportText();
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  message.success("配置已复制到剪贴板");
}

/**
 * @description 整体应用一份新配置（覆盖导入 / 恢复示例共用），并同步界面状态。
 * @param {object} next - 已清洗的配置对象
 * @returns {void}
 */
function applyConfig(next) {
  config.sites = next.sites;
  config.spaces = next.spaces;
  config.categories = next.categories;
  config.preferences = next.preferences;
  state.theme = next.preferences.theme;
  state.view = next.preferences.view;
  state.sort = next.preferences.sort;
  state.activeSpace = "all";
  state.activeCategory = "all";
}

/**
 * @description 从 JSON 文件导入配置。合并模式：站点按 URL 去重，空间按 key、集合按名称取并集；
 * 覆盖模式：整体替换。
 * @param {File} file - 用户选择的 JSON 文件
 * @param {"merge"|"replace"} mode - 导入方式
 * @returns {Promise<void>} 导入完成的 Promise
 * @throws {Error} 文件不是合法 JSON 时抛出
 */
async function importConfig(file, mode) {
  const incoming = sanitizeConfig(JSON.parse(await file.text()));
  if (mode === "replace") {
    applyConfig(incoming);
  } else {
    const existingSpaceKeys = new Set(config.spaces.map((space) => space.key));
    config.spaces = config.spaces.concat(incoming.spaces.filter((space) => !existingSpaceKeys.has(space.key)));
    const existingCategoryNames = new Set(config.categories.map((category) => category.name));
    config.categories = config.categories.concat(incoming.categories.filter((category) => !existingCategoryNames.has(category.name)));
    const existingUrls = new Set(config.sites.map((site) => site.url));
    config.sites = config.sites.concat(incoming.sites.filter((site) => !existingUrls.has(site.url)));
  }
  persist();
}

/**
 * @description 恢复示例内容：数据与界面状态全部回到初始值。
 * @returns {void}
 */
function resetToSample() {
  applyConfig(clone(defaultConfig));
  state.query = "";
  state.theme = getPreferredTheme();
  persist();
}

/**
 * @description 清空空间、集合与搜索筛选，回到全部站点。
 * @returns {void}
 */
function clearFilters() {
  state.activeSpace = "all";
  state.activeCategory = "all";
  state.query = "";
}

watch(
  () => [state.theme, state.view, state.sort],
  () => persist()
);

/** @type {object} 模块级共享 store：所有组件拿到同一份引用 */
const store = {
  config,
  state,
  spaceCounts,
  categoryCounts,
  filteredSites,
  resultSummary,
  getSpace,
  getCategoryColor,
  toggleFavorite,
  markSiteUsed,
  saveSite,
  removeSite,
  reorderSites,
  addSpace,
  updateSpace,
  removeSpace,
  addCategory,
  updateCategory,
  removeCategory,
  exportConfig,
  copyConfig,
  importConfig,
  resetToSample,
  clearFilters
};

/**
 * @description 泊页全局状态 composable：返回模块级单例，
 * 避免每个组件重建 computed 与函数闭包。
 * @returns {object} 状态、派生数据与操作方法的集合
 */
export function useHomeport() {
  return store;
}
