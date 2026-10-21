# agent-tools

Agent / 开发侧工具目录，**不参与页面运行**。

目前包含：

- `build-doc.js`：从 `../程序化绘制能力记录.md` 生成 `../程序化绘制能力记录.html`。
- `package.json`：只包含文档生成所需的 `marked` 依赖。

## 安装

```bash
cd agent-tools
npm install
```

## 生成阅读版

```bash
npm run build:doc
```

## 检查是否同步

```bash
npm run check:doc
```

如果 Markdown 改了但 HTML 没重新生成，会输出 `OUT OF DATE` 并以非零状态退出。

## 监听修改

```bash
npm run watch:doc
```

## 维护规则

1. 只修改 `程序化绘制能力记录.md`。
2. 运行 `npm run build:doc` 重新生成 HTML。
3. 不要直接编辑 `程序化绘制能力记录.html` 的内容，它会在下次生成时被覆盖。
4. 如果只想调阅读版样式，修改 `build-doc.js` 里的模板，再重新生成。

这里的依赖只用于本地开发，不影响 `index.html`、`程序化绘制能力库.html` 等交付物在浏览器中直接打开。
