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
