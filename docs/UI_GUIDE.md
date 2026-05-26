# UI 维护指南

本项目 UI 采用：

```txt
HTML + CSS + Alpine.js + 少量原生 JS
```

不使用 React / Vue / Next.js。

## 前台文件

- HTML：`public/index.html`
- CSS：`public/assets/css/main.css`
- JS：`public/assets/js/app.js`

## 后台文件

- HTML：`admin/index.html`
- CSS：`public/assets/css/admin.css`
- JS：`public/assets/js/admin.js`

## Alpine.js

Alpine 文件位置：

```txt
public/assets/js/alpine.min.js
```

当前前端已拆分 CSS/JS，后续 UI 可逐步把全局函数整理成 Alpine 组件。

推荐模式：

```html
<div x-data="homeApp()" x-init="init()">
  <span x-text="profile.name"></span>
</div>
```

## 前台模板

后台“前台模板”目前支持两套：

- `scheme-a`：高级毛玻璃方案，保留默认左窄右宽排版，重点增强流体背景、玻璃高光和 hover 光晕。
- `scheme-b`：浮动主视觉方案，左侧个人资料作为 Hero 区，右侧站点卡片更松弛，适合偏作品集/展示型首页。

模板值保存在内容 JSON 的 `uiTemplate` 字段中，由 `public/assets/js/app.js` 写入 `html[data-ui-template]`，样式集中在 `public/assets/css/main.css`。

## 站点分类与排序

后台“站点分类”可以新增/删除分类，并用 ↑/↓ 调整分类顺序。后台“个人站点”每条站点可以选择分类，并用 ↑/↓ 调整站点顺序。

前台渲染规则：

- 没有分类，或没有站点选择分类：保持原来的平铺站点网格。
- 有分类且站点选择了分类：显示“我的站点 → 分类标题 → 分类下站点”。
- 未分类或分类被删除的站点会自动显示在“未分类”分组。

## UI 修改规则

- 不要擅自修改前台可见文案。
- 前台可见设置应优先支持后台配置。
- 不要把域名、图片地址、API Key 写死。
- 不要改 `src/` 后端文件来完成纯 UI 需求。
- 不要引入构建工具，除非用户明确要求。
- 不要大规模重写页面结构，除非用户明确要求。

## Gemini 推荐范围

Gemini 做 UI 时建议只给它这些文件：

```txt
public/index.html
admin/index.html
public/assets/css/main.css
public/assets/css/admin.css
public/assets/js/app.js
public/assets/js/admin.js
```

不要让 Gemini 修改：

```txt
src/
data/
Dockerfile
docker-compose.yml
package.json
```

