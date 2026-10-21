const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcPath = path.join(root, '程序化绘制能力记录.md');
const outPath = path.join(root, '程序化绘制能力记录.html');

const argv = process.argv.slice(2);
if(argv.includes('--help') || argv.includes('-h')){
  console.log('Usage: node build-doc.js [--check] [--watch]');
  console.log('  --check  Verify that 程序化绘制能力记录.html is up to date.');
  console.log('  --watch  Rebuild when 程序化绘制能力记录.md changes.');
  process.exit(0);
}

let marked;
try{
  ({ marked } = require('marked'));
}catch(err){
  console.error('Missing dependency: marked. Run `npm install` inside agent-tools first.');
  process.exit(1);
}

const md = fs.readFileSync(srcPath, 'utf8');

function stripTags(s){
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
function escapeHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function slugify(s){
  return stripTags(s)
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'section';
}

let html = marked.parse(md, { gfm:true, breaks:false });
// Keep the intro blockquote as a lead, remove the source H1 (the page has its own title)
html = html.replace(/<h1>[\s\S]*?<\/h1>/, '');
html = html.replace('<blockquote>', '<blockquote class="lead">');

const toc = [];
const used = new Map();
html = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (m, level, inner) => {
  let id = slugify(inner);
  if(used.has(id)) { const n = used.get(id) + 1; used.set(id, n); id = id + '-' + n; }
  else used.set(id, 0);
  toc.push({ level:Number(level), id, text:stripTags(inner) });
  return `<h${level} id="${id}"><a class="heading-anchor" href="#${id}" aria-label="链接到此节">#</a>${inner}</h${level}>`;
});

// Wrap tables for horizontal scrolling
html = html.replace(/<table>[\s\S]*?<\/table>/g, m => `<div class="table-wrap">${m}</div>`);

// Open local references in a new tab
html = html.replace(/<a href="([^"]+)"/g, (m, href) => {
  if(href.startsWith('#') || href.startsWith('http://') || href.startsWith('https://')) return m;
  return `<a href="${href}" target="_blank" rel="noopener"`;
});

const tocHtml = toc.map(h => `<a class="toc-item toc-h${h.level}" href="#${h.id}">${escapeHtml(h.text)}</a>`).join('\n');
const mobileTocHtml = toc.map(h => `<a class="toc-item toc-h${h.level}" href="#${h.id}">${escapeHtml(h.text)}</a>`).join('\n');

const page = `<!doctype html>
<!-- Generated from 程序化绘制能力记录.md. Edit the Markdown and regenerate; do not edit this HTML directly. -->
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#efe8d8">
<meta name="description" content="程序化绘制能力记录：稳定对象、绘制思路、能力边界与代码位置。">
<title>程序化绘制能力记录 · 一纸山河</title>
<style>
  :root{
    --paper:#efe8d8;
    --paper-2:#f8f2e6;
    --ink:#2d352e;
    --muted:color-mix(in srgb,var(--ink) 57%,transparent);
    --line:color-mix(in srgb,var(--ink) 14%,transparent);
    --line-strong:color-mix(in srgb,var(--ink) 28%,transparent);
    --accent:#7f9a5b;
    --seal:#b64b37;
    --serif:"Songti SC","STSong","Noto Serif CJK SC","Source Han Serif SC","Source Han Serif CN","SimSun",serif;
    --sans:"Helvetica Neue","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",Arial,sans-serif;
    --mono:"SFMono-Regular","Cascadia Mono","Roboto Mono",Consolas,monospace;
    --grain:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.52'/%3E%3C/svg%3E");
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth;scroll-padding-top:92px;background:var(--paper)}
  body{
    margin:0;background:var(--paper);color:var(--ink);
    font-family:var(--sans);-webkit-font-smoothing:antialiased;
  }
  body::before{
    content:"";position:fixed;inset:0;z-index:99;pointer-events:none;
    background-image:var(--grain);background-size:180px 180px;opacity:.14;mix-blend-mode:multiply;
  }
  a{color:inherit;text-decoration:none}
  button{font:inherit;color:inherit}
  ::selection{background:var(--accent);color:var(--paper)}

  .progress{position:fixed;left:0;top:0;width:100%;height:2px;z-index:60;background:transparent;pointer-events:none}
  .progress i{display:block;height:100%;width:0;background:var(--seal);transition:width .1s linear}

  .site-head{
    position:sticky;top:0;z-index:50;
    display:flex;align-items:center;justify-content:space-between;gap:24px;
    padding:16px clamp(20px,5vw,70px);
    background:color-mix(in srgb,var(--paper) 86%,transparent);
    backdrop-filter:blur(14px);
    border-bottom:1px solid var(--line);
  }
  .brand{display:flex;align-items:center;gap:13px;min-width:0}
  .seal{
    width:40px;height:40px;flex:0 0 auto;
    border:1.5px solid var(--seal);color:var(--seal);
    display:grid;place-items:center;
    font-family:var(--serif);font-size:16px;line-height:1;position:relative;
  }
  .seal::after{content:"";position:absolute;inset:3px;border:.5px solid currentColor;opacity:.38}
  .brand-copy{display:flex;flex-direction:column;gap:4px}
  .brand-cn{font-family:var(--serif);font-size:14px;letter-spacing:.16em;font-weight:600;white-space:nowrap}
  .brand-en{font-family:var(--mono);font-size:7px;letter-spacing:.2em;opacity:.42;white-space:nowrap}
  .top-nav{display:flex;align-items:center;gap:20px;font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
  .top-nav a{opacity:.55;padding-bottom:2px;border-bottom:1px solid transparent;transition:opacity .2s,color .2s,border-color .2s}
  .top-nav a:hover{opacity:1;color:var(--seal);border-bottom-color:var(--seal)}

  .page{
    max-width:1440px;margin:0 auto;
    padding:clamp(30px,5vh,60px) clamp(20px,5vw,70px) 90px;
    display:grid;grid-template-columns:220px minmax(0,900px);
    gap:clamp(38px,5vw,76px);
    justify-content:center;
    align-items:start;
  }

  .toc{position:sticky;top:96px;max-height:calc(100vh - 120px);overflow:auto;padding-right:10px}
  .toc::-webkit-scrollbar{width:3px}
  .toc::-webkit-scrollbar-thumb{background:var(--line-strong)}
  .toc-label{font-family:var(--mono);font-size:8px;letter-spacing:.18em;opacity:.42;text-transform:uppercase;margin-bottom:14px}
  .toc-item{
    display:block;padding:5px 0 5px 10px;margin-left:-10px;
    border-left:1px solid transparent;
    font-size:10px;line-height:1.55;color:var(--muted);
    transition:color .2s,border-color .2s,background .2s;
  }
  .toc-item:hover{color:var(--ink)}
  .toc-item.active{color:var(--seal);border-left-color:var(--seal);background:color-mix(in srgb,var(--seal) 4%,transparent)}
  .toc-h3{font-size:9px;padding-left:23px;opacity:.82}
  .toc-meta{margin-top:24px;padding-top:14px;border-top:1px solid var(--line);font-family:var(--mono);font-size:7px;line-height:1.8;letter-spacing:.08em;color:var(--muted)}
  .toc-meta a{display:inline-block;margin-top:4px;border-bottom:1px solid var(--line-strong)}
  .toc-meta a:hover{color:var(--seal);border-color:var(--seal)}
  .toc-actions{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
  .tiny-btn{
    border:1px solid var(--line);background:transparent;padding:6px 8px;
    font-family:var(--mono);font-size:7px;letter-spacing:.09em;cursor:pointer;
    transition:background .2s,color .2s,border-color .2s;
  }
  .tiny-btn:hover{background:var(--ink);color:var(--paper);border-color:var(--ink)}

  .article{min-width:0}
  .article-head{padding-bottom:clamp(26px,4vh,44px);border-bottom:1px solid var(--line-strong)}
  .eyebrow{display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:8px;letter-spacing:.22em;text-transform:uppercase;opacity:.55}
  .eyebrow i{width:6px;height:6px;border-radius:50%;background:var(--seal);display:inline-block;box-shadow:0 0 0 4px color-mix(in srgb,var(--seal) 14%,transparent)}
  .article-head h1{
    margin:18px 0 0;font-family:var(--serif);font-weight:600;
    font-size:clamp(42px,5.3vw,76px);line-height:1.04;letter-spacing:.02em;
  }
  .article-head .dek{
    margin:18px 0 0;max-width:700px;
    font-family:var(--serif);font-size:clamp(14px,1.3vw,17px);line-height:1.9;letter-spacing:.04em;
    color:color-mix(in srgb,var(--ink) 76%,transparent);
  }
  .article-meta{display:flex;flex-wrap:wrap;gap:10px 22px;margin-top:20px;font-family:var(--mono);font-size:8px;letter-spacing:.12em;color:var(--muted)}
  .article-meta b{font-weight:500;color:var(--ink);opacity:.75}

  .toc-mobile{display:none;margin:24px 0 0;border:1px solid var(--line);background:color-mix(in srgb,var(--paper-2) 55%,transparent)}
  .toc-mobile summary{cursor:pointer;padding:12px 14px;font-family:var(--mono);font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
  .toc-mobile nav{padding:0 14px 12px}

  .content{padding-top:clamp(28px,4vh,44px)}
  .content > *:first-child{margin-top:0}
  .content h2{
    position:relative;
    margin:clamp(52px,7vh,78px) 0 20px;
    padding-top:22px;
    border-top:1px solid var(--line-strong);
    font-family:var(--serif);font-weight:600;
    font-size:clamp(28px,3.2vw,40px);line-height:1.25;letter-spacing:.03em;
    scroll-margin-top:96px;
  }
  .content h2:first-of-type{margin-top:14px}
  .content h3{
    position:relative;
    margin:36px 0 10px;
    font-family:var(--serif);font-weight:600;
    font-size:clamp(20px,2vw,25px);line-height:1.35;letter-spacing:.03em;
    scroll-margin-top:96px;
  }
  .heading-anchor{
    position:absolute;left:-1.1em;top:auto;
    font-family:var(--mono);font-size:.55em;font-weight:400;
    color:var(--seal);opacity:0;
    transition:opacity .2s;
  }
  .content h2:hover .heading-anchor,.content h3:hover .heading-anchor,.heading-anchor:focus{opacity:.7}
  .content p{margin:0 0 1.1em;font-size:14px;line-height:2.02;letter-spacing:.025em;color:color-mix(in srgb,var(--ink) 86%,transparent)}
  .content strong{font-weight:600;color:var(--ink)}
  .content em{font-style:normal;color:var(--seal)}
  .content a{color:var(--ink);border-bottom:1px solid var(--line-strong);transition:color .2s,border-color .2s}
  .content a:hover{color:var(--seal);border-color:var(--seal)}
  .content ul,.content ol{margin:0 0 1.2em;padding-left:1.35em}
  .content li{margin:5px 0;font-size:14px;line-height:1.92;color:color-mix(in srgb,var(--ink) 84%,transparent)}
  .content li > ul,.content li > ol{margin:4px 0 6px}
  .content blockquote{
    margin:0 0 1.4em;padding:18px 20px;
    background:color-mix(in srgb,var(--paper-2) 62%,transparent);
    border-left:2px solid var(--seal);
    color:color-mix(in srgb,var(--ink) 80%,transparent);
  }
  .content blockquote p{margin:0 0 .55em;font-family:var(--serif);font-size:13px;line-height:1.95}
  .content blockquote p:last-child{margin-bottom:0}
  .content blockquote a{border-bottom-color:var(--line-strong)}
  .content hr{border:0;border-top:1px solid var(--line);margin:38px 0}
  .content code{
    font-family:var(--mono);font-size:.86em;
    background:color-mix(in srgb,var(--ink) 7%,transparent);
    padding:1px 4px;border-radius:1px;
  }
  .content pre code{background:none;padding:0;font-size:10px;line-height:1.7}
  .code-wrap{margin:0 0 1.4em;border:1px solid rgba(255,255,255,.07);background:#202a26;overflow:hidden}
  .code-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.08);font-family:var(--mono);font-size:7px;letter-spacing:.13em;text-transform:uppercase;color:rgba(239,232,216,.44)}
  .code-bar button{border:1px solid rgba(239,232,216,.2);background:none;color:rgba(239,232,216,.72);padding:4px 7px;font-family:var(--mono);font-size:7px;letter-spacing:.08em;cursor:pointer;transition:background .2s,color .2s}
  .code-bar button:hover{background:rgba(239,232,216,.14);color:#fff8e8}
  .code-wrap pre{margin:0;padding:14px 16px;overflow:auto;max-height:520px;color:#efe8d8;font-family:var(--mono);font-size:10px;line-height:1.72;white-space:pre}
  .table-wrap{margin:0 0 1.5em;overflow:auto;border:1px solid var(--line)}
  .table-wrap table{width:100%;border-collapse:collapse;min-width:560px;font-size:11px;line-height:1.65}
  .table-wrap th,.table-wrap td{padding:9px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
  .table-wrap th{font-family:var(--mono);font-size:8px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);background:color-mix(in srgb,var(--paper-2) 68%,transparent);font-weight:500}
  .table-wrap tr:last-child td{border-bottom:0}
  .table-wrap td{color:color-mix(in srgb,var(--ink) 82%,transparent)}
  .table-wrap code{font-size:10px}

  .article-foot{margin-top:60px;padding-top:22px;border-top:1px solid var(--line-strong);display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;font-family:var(--mono);font-size:8px;letter-spacing:.08em;color:var(--muted)}
  .article-foot a{border-bottom:1px solid var(--line-strong)}
  .article-foot a:hover{color:var(--seal);border-color:var(--seal)}

  #toTop{
    position:fixed;right:22px;bottom:22px;z-index:55;
    width:36px;height:36px;border:1px solid var(--line-strong);
    background:color-mix(in srgb,var(--paper) 78%,transparent);backdrop-filter:blur(8px);
    color:var(--ink);cursor:pointer;
    opacity:0;pointer-events:none;transform:translateY(8px);
    transition:opacity .2s,transform .2s,background .2s,color .2s;
  }
  #toTop.show{opacity:1;pointer-events:auto;transform:none}
  #toTop:hover{background:var(--ink);color:var(--paper)}
  #toast{
    position:fixed;left:50%;bottom:26px;z-index:120;
    transform:translate(-50%,12px);background:var(--ink);color:var(--paper);
    padding:9px 14px;font-family:var(--mono);font-size:8px;letter-spacing:.12em;
    opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;
    box-shadow:0 12px 30px -14px rgba(0,0,0,.45);
  }
  #toast.show{opacity:1;transform:translate(-50%,0)}

  @media (max-width:980px){
    .page{grid-template-columns:1fr;max-width:900px;gap:0}
    .toc{display:none}
    .toc-mobile{display:block}
    .article-head h1{font-size:clamp(38px,9vw,62px)}
  }
  @media (max-width:600px){
    .site-head{padding:13px 18px}
    .brand-cn{font-size:12px}
    .brand-en{display:none}
    .top-nav{gap:13px;font-size:8px}
    .page{padding:22px 18px 70px}
    .article-head h1{font-size:clamp(34px,11vw,50px)}
    .content h2{font-size:27px}
    .content h3{font-size:20px}
    .content p,.content li{font-size:13px;line-height:1.95}
    .heading-anchor{display:none}
    .content blockquote{padding:14px 15px}
    .article-foot{flex-direction:column}
    #toTop{right:14px;bottom:14px}
  }
  @media print{
    .site-head,.toc,.toc-mobile,.progress,#toTop,#toast,.heading-anchor,.code-bar button{display:none!important}
    body::before{display:none}
    .page{display:block;padding:0;max-width:none}
    .article{max-width:none}
    .content a{color:inherit}
    .code-wrap{break-inside:avoid}
    .content h2{break-after:avoid}
  }
</style>
</head>
<body>
<div class="progress" aria-hidden="true"><i id="progressBar"></i></div>

<header class="site-head">
  <a class="brand" href="程序化绘制能力库.html" aria-label="返回程序化绘制能力库">
    <span class="seal" aria-hidden="true">记</span>
    <span class="brand-copy">
      <span class="brand-cn">程序化绘制能力记录</span>
      <span class="brand-en">PROCEDURAL DRAWING NOTES</span>
    </span>
  </a>
  <nav class="top-nav">
    <a href="程序化绘制能力库.html">能力库 ↗</a>
    <a href="index.html">返回作品 →</a>
  </nav>
</header>

<div class="page">
  <aside class="toc" aria-label="文章目录">
    <div class="toc-label">CONTENTS / 目录</div>
    <nav id="tocNav">${tocHtml}</nav>
    <div class="toc-meta">
      9 SECTIONS · 40 ELEMENTS<br>
      源文件：<a href="程序化绘制能力记录.md" target="_blank" rel="noopener">程序化绘制能力记录.md ↗</a><br>
      记录时间：2026-10-21
      <div class="toc-actions">
        <button class="tiny-btn" type="button" onclick="window.print()">打印 / PDF</button>
        <button class="tiny-btn" id="copyTop" type="button">回到顶部</button>
      </div>
    </div>
  </aside>

  <main class="article">
    <header class="article-head">
      <div class="eyebrow"><i></i><span>CAPABILITY NOTES · 2026</span></div>
      <h1>程序化绘制<br>能力记录</h1>
      <p class="dek">记录「二十四节气 · 一纸山河」中真正用到的程序化绘制能力：哪些对象比较稳定、分别是怎么画的、边界在哪里，以及下一次如何直接复用。</p>
      <div class="article-meta">
        <span><b>9</b> 个章节</span>
        <span><b>40</b> 个元素</span>
        <span><b>CANVAS 2D</b> / CSS / INLINE SVG</span>
        <span><b>NO EXTERNAL ASSETS</b></span>
      </div>
      <details class="toc-mobile">
        <summary>目录 / CONTENTS</summary>
        <nav>${mobileTocHtml}</nav>
      </details>
    </header>

    <article class="content" id="content">
${html}
    </article>

    <footer class="article-foot">
      <span>PROCEDURAL DRAWING NOTES · 2026-10-21</span>
      <span><a href="程序化绘制能力库.html">打开可视化能力库 →</a> &nbsp; <a href="index.html">返回作品 →</a></span>
    </footer>
  </main>
</div>

<button id="toTop" type="button" aria-label="回到顶部">↑</button>
<div id="toast" role="status" aria-live="polite"></div>

<script>
(function(){
  var content = document.getElementById('content');
  var tocNav = document.getElementById('tocNav');
  var mobileNav = document.querySelector('.toc-mobile nav');
  var headings = Array.prototype.slice.call(content.querySelectorAll('h2[id],h3[id]'));
  var tocItems = Array.prototype.slice.call(document.querySelectorAll('.toc-item'));
  var progress = document.getElementById('progressBar');
  var toTop = document.getElementById('toTop');
  var toast = document.getElementById('toast');

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(function(){ toast.classList.remove('show'); }, 1600);
  }

  function copyText(text){
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){ showToast('代码已复制'); }).catch(function(){ fallback(); });
    }else{ fallback(); }
    function fallback(){
      try{
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position='fixed'; ta.style.opacity='0'; ta.style.left='-9999px';
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand('copy');
        ta.remove();
        showToast(ok ? '代码已复制' : '复制失败，请手动选择');
      }catch(e){ showToast('复制失败，请手动选择'); }
    }
  }

  // Code blocks: wrapper + language label + copy
  Array.prototype.slice.call(content.querySelectorAll('pre')).forEach(function(pre){
    var code = pre.querySelector('code');
    var lang = '';
    if(code && code.className){
      var m = code.className.match(/language-([a-z0-9]+)/i);
      if(m) lang = m[1].toUpperCase();
    }
    var wrap = document.createElement('div');
    wrap.className = 'code-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    var bar = document.createElement('div');
    bar.className = 'code-bar';
    bar.innerHTML = '<span>' + (lang || 'CODE') + '</span><button type="button">复制</button>';
    bar.querySelector('button').addEventListener('click', function(){ copyText(code ? code.textContent : pre.textContent); });
    wrap.insertBefore(bar, pre);
  });

  // Active TOC + progress
  var ticking = false;
  function update(){
    ticking = false;
    var y = window.scrollY + 130;
    var current = headings.length ? headings[0] : null;
    for(var i=0;i<headings.length;i++){ if(headings[i].offsetTop <= y) current = headings[i]; }
    tocItems.forEach(function(a){
      var href = a.getAttribute('href');
      a.classList.toggle('active', !!(current && href === '#' + current.id));
    });
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progress.style.width = (p * 100).toFixed(2) + '%';
    toTop.classList.toggle('show', window.scrollY > 600);
  }
  function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  update();

  toTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });
  document.getElementById('copyTop').addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });

  // Mobile TOC closes after clicking
  if(mobileNav){
    mobileNav.addEventListener('click', function(e){
      var a=e.target.closest('a'); if(!a) return;
      var d=document.querySelector('.toc-mobile'); if(d) d.open=false;
    });
  }

  // Ensure external/local links open safely
  Array.prototype.slice.call(document.querySelectorAll('.content a, .toc a')).forEach(function(a){
    if(a.target === '_blank'){ a.rel = 'noopener'; }
  });
})();
</script>
</body>
</html>`;

function build(){
  fs.writeFileSync(outPath, page, 'utf8');
  console.log('wrote', path.basename(outPath), 'bytes', Buffer.byteLength(page), 'headings', toc.length);
}

if(argv.includes('--check')){
  const current = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : '';
  if(current === page){
    console.log('up to date:', path.basename(outPath));
  }else{
    console.error('OUT OF DATE:', path.basename(outPath));
    console.error('Run `npm run build:doc` to regenerate it.');
    process.exitCode = 1;
  }
}else if(argv.includes('--watch')){
  build();
  console.log('watching', path.basename(srcPath), '...');
  fs.watchFile(srcPath, {interval:400}, ()=>{
    try{ build(); }catch(err){ console.error(err); }
  });
}else{
  build();
}
