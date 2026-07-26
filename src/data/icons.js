/**
 * @description 空间可选图标集：图标名（存入配置）到 lucide 组件的映射。
 * 名称保持稳定，配置里只存字符串，跨设备迁移后仍能解析。
 */
import {
  BriefcaseBusiness,
  Telescope,
  Coffee,
  BookOpen,
  GraduationCap,
  Gamepad2,
  Heart,
  House,
  Globe,
  Music,
  Palette,
  Rocket,
  Folder
} from "lucide-vue-next";

/** @type {Record<string, object>} 图标名 → lucide 组件 */
export const spaceIcons = {
  briefcase: BriefcaseBusiness,
  telescope: Telescope,
  coffee: Coffee,
  book: BookOpen,
  graduation: GraduationCap,
  gamepad: Gamepad2,
  heart: Heart,
  house: House,
  globe: Globe,
  music: Music,
  palette: Palette,
  rocket: Rocket,
  folder: Folder
};

/**
 * @description 按图标名取组件，未知名称回退到文件夹图标。
 * @param {string} name - 配置中存的图标名
 * @returns {object} lucide 图标组件
 */
export function getSpaceIcon(name) {
  return spaceIcons[name] || Folder;
}
