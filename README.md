# 泊页 · Homeport

跨浏览器、跨设备可迁移的**个人导航工作台**。基于 Vue 3 + [antdv-next](https://www.antdv-next.com/) 实现，数据保存在本机 `localStorage`，支持 JSON 配置包导入 / 导出。

## 功能

- 空间 / 集合管理（新增、重命名、颜色与图标、删除时自动迁移站点）
- 站点增删改、收藏、搜索联想
- 网格 / 列表视图、手动拖拽排序 / 名称 / 最近使用
- 深浅色主题
- 配置包导出、复制、合并或覆盖导入、恢复示例内容
- 桌面端侧栏 + 移动端底部导航

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 技术栈

- Vue 3 + Vite
- [antdv-next](https://www.antdv-next.com/)（Ant Design for Vue 新一代组件库）
- lucide-vue-next

## 说明

首次打开会载入 12 个示例站点。所有数据保存在浏览器本地，导出的 JSON 可在另一台电脑导入以完成迁移。
