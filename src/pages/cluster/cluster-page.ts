// ========================
// Module Imports
// ========================
import OpenAI from 'openai';
import {
  fetchBinLocationsByPart,
  exportToCSV,
  collapseDetailsContainer,
  binLocationHtml,
  BinLocation
} from '../../components/api/jb2';
import cssText from './cluster-page-styles.css?inline';
const ctxMap = new WeakMap<HTMLElement, BubbleCtx>();
// ========================
// Constants and Test Data
// ========================

interface AssistantMsg {
  role: "assistant";
  chunks: string[];
  topLevelPart: { part_number: string; description: string };
  subParts: {
    part_number: string;
    description: string;
    relation_to_query: string;
    relation_to_chunk: number;
  }[];
  illustrationUrl: string | null;
}



const DEFAULT_IFRAME_URL =
  "https://app-alpha.zea.live/illustrations-viewer/UFOeNJer2A2JcBFgtm5t";

const TEST_MODE = true;
const TEST_JSON = {
  /* ── 1. chunks ────────────────────────────────────────────── */
  chunks: [
    // 0  → references part 2021
    `### 1. Inspect Side-Frame Bracket **2021**  
    Look for cracks around the bolt bosses and check that the corner
    welds are intact.`,

    // 1  → references part 2031
    `### 2. Check Gear-Housing **2031**  
    Remove the cover and verify that the bearing seats show no signs of
    galling or fretting.`,

    // 2  → references part 2039
    `### 3. Examine Support Plate **2039**  
    Ensure the plate is free of corrosion and that all mounting holes
    are round and within tolerance.`,

    // 3  → generic step, no CAD mapping
    `### 4. Re-torque all fasteners to specification.`
  ],

  /* ── 2. assembly root ─────────────────────────────────────── */
  top_level_part: {
    part_number : "2034",
    description : "Complete Assembly - Demo Model"
  },

  /* ── 3. sub-parts mapped to the three chunks above ────────── */
  sub_parts: [
  {
    part_number       : "2021",
    description       : "Side-Frame Bracket",
    relation_to_query : "Structural integrity check",
    relation_to_chunk : 0          // ← chunk-0
  },
  {
    part_number       : "2012",         // 🆕  extra part
    description       : "Bracket Gusset",
    relation_to_query : "Check gusset for cracks ( shares the inspection step )",
    relation_to_chunk : 1               // ← points to the same chunk-0
  },
  {
    part_number       : "2031",
    description       : "Gear Housing",
    relation_to_query : "Wear inspection of bearing seats",
    relation_to_chunk : 1
  },
  {
    part_number       : "2039",
    description       : "Support Plate",
    relation_to_query : "Corrosion-free mounting surface",
    relation_to_chunk : 2
  }
  ],

  /* ── 4. demo illustration that contains those parts ───────── */
  illustration_url:
    "https://app-alpha.zea.live/illustrations-viewer/UFOeNJer2A2JcBFgtm5t"
};

/* =========================================================
   STATIC fallback map (only needed until you switch to the
   dynamic ctx.partPaths you’re implementing)
   ========================================================= */


type BubbleCtx = {
  iframe: HTMLIFrameElement | null;
  /** buttons keyed by part-number for hover/highlight */
  partButtons: Record<string, HTMLButtonElement>;
  /** picked paths waiting for iframe to load */
  highlightQueue: { path: string[]; fill: number }[];
  /** record of the actively highlighted part */
  highlightedPart: string | null;
  /** geometry paths we coloured last */
  highlightedPaths: string[][];
  lastFocusPaths: string[][];   
  /** which part is currently hovered by the model */
  hoverPart: string | null;
  /** relation to query element */
  relationPanel: HTMLDivElement | null;
  relationMap: Record<string, string>;
  bottomDock: HTMLDivElement | null;   // 🆕
  partPaths: Record<string, string[][]>;
  hasFramed      : boolean;
  mouseClickHighlighted: string[];
  chunkLookup : Record<number,string[]>;
};


const stripCitations = (md: string) =>
  md.replace(/:contentReference\[.*?\]\{.*?\}|:contentReference[oaicite:1]{index=1}|【\d+:\d+†source】/g, "");

function makeSplitter(bubble: HTMLElement) {
  const splitter = document.createElement('div');
  splitter.className = 'splitter';

  /* ---------- Drag logic ---------- */
  splitter.addEventListener('pointerdown', ev => {
    ev.preventDefault();
    const startX   = ev.clientX;
    const bubbleBB = bubble.getBoundingClientRect();
    const startW   = parseFloat(getComputedStyle(bubble)
                      .getPropertyValue('--left-col')) || 350;

    const onMove = (e: PointerEvent) => {
      const dx   = e.clientX - startX;
      let newW   = startW + dx;
      const min  = 200;                     // left col min width
      const max  = bubbleBB.width - 300;    // keep viewer usable
      newW = Math.min(Math.max(newW, min), max);
      bubble.style.setProperty('--left-col', `${newW}px`);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
  });

  return splitter;
}

// Create a stylesheet and combine imported CSS text with additional styles.
const sheet = new CSSStyleSheet();
sheet.replaceSync(
  cssText +
    `.part-viewer{margin-bottom:16px}
     .part-viewer iframe{width:100%;height:480px;border:none}`
);

// ========================
// Types
// ========================

type UserMsg = { role: 'user'; content: string };

// ========================
// OpenAI Initialization
// ========================
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: { 'OpenAI-Beta': 'assistants=v2' }
});
const ASSISTANT_ID = import.meta.env.VITE_ASSISTANT_ID;

// ========================
// Custom Element: ClusterPage
// ========================
class ClusterPage extends HTMLElement {
  private shadow: ShadowRoot;
  private conversation: (UserMsg | AssistantMsg)[] = [];
  private renderedCount = 0;
  private binCache = new Map<string, BinLocation[]>();

  private static SUPPORT_FOOTER = `Contact Support if Necessary
If the issue persists despite adjustments, contact Trebro Manufacturing support for assistance:
Phone (406) 652‑5867 • Toll‑Free (888) 395‑5867`;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.adoptedStyleSheets = [sheet];
    this.shadow.innerHTML = `
      <div class="cluster-container">
        <h2>Bluegrass (TSR demo)</h2>
        <div class="chat-messages" id="chatMessages"></div>
        <div class="input-area">
          <textarea id="userInput" placeholder="Type your message..."></textarea>
          <button id="sendBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>`;
  }

  // Attach event listener after element is connected to the DOM.
  connectedCallback() {
    this.shadow.getElementById('sendBtn')!.addEventListener('click', () => this.onSendMessage());
  }

  // Utility: Smoothly scroll an element to its bottom.
  private smoothScrollToBottom(el: HTMLElement) {
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }

  // Utility: Animate text typing.
  private typeWriter(el: HTMLElement, text: string, done: () => void, speed = 20) {
    let i = 0;
    const span = document.createElement('span');
    span.className = 'typed-text-span';
    el.appendChild(span);

    const cursor = document.createElement('img');
    cursor.src = 'data/TSRIcon.png';
    cursor.className = 'tsr-inline-cursor';
    span.appendChild(cursor);

    const step = () => {
      if (i < text.length) {
        const ch = text[i++];
        if (ch === '\n') {
          span.insertBefore(document.createElement('br'), cursor);
        } else {
          span.insertBefore(document.createTextNode(ch), cursor);
        }
        this.smoothScrollToBottom(this.shadow.getElementById('chatMessages') as HTMLElement);
        setTimeout(step, speed);
      } else {
        cursor.remove();
        done();
      }
    };
    step();
  }

  // Display a waiting animation whilst processing.
  private showWaitingAnimation() {
    const chat = this.shadow.getElementById('chatMessages') as HTMLElement;
    const wrapper = document.createElement('div');
    wrapper.className = 'message-container';
    const bubble = document.createElement('div');

    const ctx: BubbleCtx = {
      iframe: null,
      partButtons: {},
      highlightQueue: [],
      highlightedPart: null,
      highlightedPaths: [],
      hoverPart: null,
      relationPanel: null,
      relationMap: {},
      bottomDock: null,
      partPaths: {},    
      lastFocusPaths: [],
      hasFramed     : false,
      mouseClickHighlighted: [],
      chunkLookup: {},
    };
    ctxMap.set(bubble, ctx);   // link DOM ➞ context

    bubble.className = 'message assistant-message';
    bubble.innerHTML = `
      <div class="tsr-loading-wrapper">
        <img class="tsr-icon loading" src="data/Rollygreen.png" alt="TSR">
      </div>`;
    wrapper.appendChild(bubble);
    chat.appendChild(wrapper);
    chat.scrollTop = chat.scrollHeight;
    return wrapper;
  }
  private fullBtn: HTMLButtonElement | null = null;
  private highlightQueue: {path:string[];fill:number}[] = [];

  // Toggle full-screen mode for the viewer.
  private toggleFull(bubble: HTMLElement) {
    const isGoingFull = !bubble.classList.contains('fullscreen');
    /* 1️⃣ capture the bubble’s current viewport box */
    const rect = bubble.getBoundingClientRect();

    /* 2️⃣ feed those numbers into CSS variables */
    bubble.style.setProperty('--start-top',    `${rect.top}px`);
    bubble.style.setProperty('--start-left',   `${rect.left}px`);
    bubble.style.setProperty('--start-width',  `${rect.width}px`);
    bubble.style.setProperty('--start-height', `${rect.height}px`);

    /* 3️⃣ give it the “animating” helper class (position:fixed) */
    bubble.classList.add('fs-anim');

    /* 4️⃣ in the very next frame toggle .fullscreen */
    requestAnimationFrame(() => {
      bubble.classList.toggle('fullscreen', isGoingFull);
    });

    /* 5️⃣ when the transition ends, clean up helpers */
    const onDone = () => {
      bubble.classList.remove('fs-anim');
      bubble.style.removeProperty('--start-top');
      bubble.style.removeProperty('--start-left');
      bubble.style.removeProperty('--start-width');
      bubble.style.removeProperty('--start-height');
      bubble.removeEventListener('transitionend', onDone);
    };
    bubble.addEventListener('transitionend', onDone);

    /* 6️⃣ lock / unlock scrolling & swap the icon like before */
    document.body.classList.toggle('fullscreen-active', isGoingFull);
    const main = document.getElementById('mainContainer');
    if (main) main.classList.toggle('no-scroll', isGoingFull);
    if (this.fullBtn) {
      this.fullBtn.textContent = isGoingFull ? '⤡' : '⤢';
    }
    if (!isGoingFull) {                // exiting full
    // existing clear code …
      bubble.querySelectorAll(".mini-bubble.in-focus")
          .forEach(el => el.classList.remove("in-focus"));
      }
    if (isGoingFull){
      /* grab the context */
      const ctx = ctxMap.get(bubble)!;

      /* Which mini-bubble is currently marked in-focus?       */
      const cur = bubble.querySelector<HTMLElement>(
                    '.mini-bubble.in-focus');
      const idx   = Number(cur?.dataset.chunk ?? 0);
      const parts = ctx.chunkLookup?.[idx] ?? [];   // filled in attachFullScreenScroller

      if (parts.length){
        /* orange faces + camera */
        this.addFocusHighlights(parts, ctx);
        this.frameByPart(parts[0], ctx);
        ctx.hasFramed = true;

        /* dock, relation cards, pill outline */
        this.updateRelationCards(ctx, parts);
        this.showDock(ctx);
        parts.forEach(pn=>{
          ctx.partButtons[pn]?.classList.add('scroll-active');
        });
      }
      requestAnimationFrame(()=>{
        bubble.classList.toggle('fullscreen', isGoingFull);

        /* ── NEW: whenever we *enter* FS, jump back to chunk-0 ── */
        if (isGoingFull){
          const ctx          = ctxMap.get(bubble)!;
          const scrollerApi  = (ctx as any).activateFirst as (()=>void)|undefined;

          /* attachFullScreenScroller stores a reset callback */
          scrollerApi?.();            // ← ❶ resets idx & does all the focus work
        }
      });
    }
  }

  //


/* ---------------- helper: add & clear orange “focus” highlights ---------- */
private addFocusHighlights(pns: string[], ctx: BubbleCtx) {
  const win = ctx.iframe?.contentWindow;
  if (!win) return;

  /* remove previous orange focus */
  ctx.lastFocusPaths?.forEach(p =>
    win.postMessage({ type:'removeHighlight', key:'focus', path:p }, '*')
  );

  /* paint new focus and remember the paths so we can remove next time */
  ctx.lastFocusPaths = [];

  pns.forEach(pn => {
    (ctx.partPaths[pn] || []).forEach(path => {
      win.postMessage(
        { type:'addHighlight', key:'focus', path, color:'#ffbb00', fill:0.10 },
        '*'
      );
      ctx.lastFocusPaths!.push(path);
    });
  });
}




private frameByPart(pn: string, ctx: BubbleCtx) {
  const path = ctx.partPaths[pn]?.[0];
  if (!path) return;

  ctx.iframe?.contentWindow?.postMessage(
    { type:'frameView', paths:[path], duration:1500, frameBorder:0.6 },
    '*'
  );
}

private isFull(bubble: HTMLElement){ return bubble.classList.contains('fullscreen'); }

/* ────────────────────────── helper: wheel-controlled focus ── */
private attachFullScreenScroller(
  bubble: HTMLElement,
  bubList: HTMLElement[],
  chunkLookup: Record<number, string[]>,
  ctx: BubbleCtx
) {
  let idx = 0;
  const max = bubList.length - 1;

  /* NEW → wheel-delta accumulator */
  let wheelBuffer = 0;
  const PIXEL_THRESHOLD = 160;          // ≈ 4 small track-pad ticks
  const LINE_TO_PX     = 40;            // deltaMode===1 → lines → estimate px


const activate = (newIdx: number) => {
  if (newIdx === idx) return;

  bubList[idx].classList.remove('in-focus');
  this.clearFocus(ctx);
  this.updateRelationCards(ctx, []);                             // ← NEW
  Object.values(ctx.partButtons).forEach(btn =>
    btn.classList.remove('scroll-active'),
  );

  idx = newIdx;
  const el = bubList[idx];
  el.classList.add('in-focus');
  const scroller = bubble.querySelector('.bubble-col')!;

  const start = scroller.scrollTop;
  const end =
    el.offsetTop - (scroller.clientHeight - el.offsetHeight) / 2;

  const maxScroll = scroller.scrollHeight - scroller.clientHeight;
  const target = Math.max(0, Math.min(end, maxScroll));
  const dist = target - start;
  const dur = 600;
  const t0 = performance.now();

  const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

  const step = (now: number) => {
    const p = Math.min((now - t0) / dur, 1);
    scroller.scrollTop = start + dist * ease(p);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);

  const parts = chunkLookup[newIdx] ?? [];

  /* ⬇︎ run these only when FULLSCREEN */
  if (this.isFull(bubble) && parts.length){
    this.addFocusHighlights(parts, ctx);            // orange paint
    this.frameByPart(parts[0], ctx);                // camera
    this.updateRelationCards(ctx, parts);           // cards
    this.showDock(ctx);                             // slide dock in
    ctx.hasFramed = true;
  }

  ctx.chunkLookup = chunkLookup

  /* still keep the pill-button feedback */
  parts.forEach(pn => ctx.partButtons[pn]?.classList.add('scroll-active'));

};

  /* wheel handler */
  /* wheel handler */
  bubble.addEventListener(
    'wheel',
    ev => {
      if (!bubble.classList.contains('fullscreen')) return;
      ev.preventDefault();                          // block native scroll

      /* normalise to **pixels**, then accumulate */
      const delta =
        ev.deltaMode === 1             // 1 = lines
          ? ev.deltaY * LINE_TO_PX
          : ev.deltaY;                 // 0 = pixels

      wheelBuffer += delta;

      if (wheelBuffer >  PIXEL_THRESHOLD && idx < max) {
        activate(idx + 1);
        wheelBuffer = 0;               // reset after a step
      } else if (wheelBuffer < -PIXEL_THRESHOLD && idx > 0) {
        activate(idx - 1);
        wheelBuffer = 0;
      }
    },
    { passive: false }
  );

  bubList.forEach((el, i) => {
    el.style.cursor = 'pointer';                 // show it’s clickable
    el.addEventListener('click', () => {
      if (!bubble.classList.contains('fullscreen')) return;  // only useful in FS
      activate(i);
    });
  });

  /* Initialise first bubble */
  bubList[0].classList.add('in-focus');

  const firstParts = chunkLookup[0] ?? [];
  const parts = chunkLookup[idx] ?? [];

  /* ONE-OFF work for the new chunk ----------------------------- */
  this.addFocusHighlights(parts, ctx);       // orange fill
  if (parts.length) this.frameByPart(parts[0], ctx);
  ctx.hasFramed = true;
  this.showDock(ctx);                        // make dock visible

  /* Per-part UI sync ------------------------------------------- */
  parts.forEach(pn => {
    ctx.partButtons[pn]?.classList.add('scroll-active');

    /* auto-scroll the pill into view */
    const btn = ctx.partButtons[pn];
    if (btn) {
      btn.scrollIntoView({ behavior:'smooth', block:'center' });
    }
  });

  /* Relation card logic (unchanged) ---------------------------- */

  firstParts.forEach(pn =>
    ctx.partButtons[pn]?.classList.add('scroll-active')
  );
  /* ── expose “activate(0)” so toggleFull can call it ── */
  (ctx as any).activateFirst = ()=>activate(0);

  /* initialise first bubble (unchanged) */
  activate(0);              // ← instead of the manual block you had
}



private clearHighlight(ctx: BubbleCtx) {
  if (this.highlightedPaths.length && ctx.iframe?.contentWindow) {
    this.highlightedPaths.forEach(p =>
      ctx.iframe?.contentWindow?.postMessage(
        { type: 'removeHighlight', key: 'selection', path: p },
        '*'
      )
    );
  }
  this.highlightedPaths = [];
}

private focusPart(pn: string, ctx: BubbleCtx) {
  const win = ctx.iframe?.contentWindow;
  if (!win) return;

  /* a ─ clear previous focus */
  this.clearFocus(ctx);

  /* b ─ colour the faces of the new part */
  this.addFocusHighlights([pn], ctx);
  this.showDock(ctx);

  /* c ─ move the camera */
  this.frameByPart(pn, ctx);          // <- already defined elsewhere
  ctx.hasFramed = true;

  /* d ─ light up the matching pill-button */
  ctx.partButtons[pn]?.classList.add('scroll-active');
}

private showDock(ctx: BubbleCtx) {
  ctx.bottomDock?.classList.add('dock-active');
}


private appendOneMessage(msg: UserMsg | AssistantMsg) {
  const chat = this.shadow.getElementById("chatMessages") as HTMLElement;
  const wrap = document.createElement("div");
  wrap.className =
    "message-container enter" + (msg.role === "user" ? " user" : "");
  const bubble = document.createElement("div");
  bubble.style.setProperty("--left-col", "350px");
  bubble.className =
    "message " + (msg.role === "user" ? "user-message" : "assistant-message");

  /* ------------------ USER MESSAGE ------------------ */
  if (msg.role === "user") {
    bubble.textContent = msg.content;
    wrap.appendChild(bubble);
    chat.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.remove("enter"));
    chat.scrollTop = chat.scrollHeight;
    return;
  }

  /* ---------------- ASSISTANT MESSAGE ---------------- */
  const placeholder = document.createElement("div");
  bubble.appendChild(placeholder);
  wrap.appendChild(bubble);
  chat.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.remove("enter"));
  chat.scrollTop = chat.scrollHeight;

  /* Animated typing of the whole text */
  const fullText = (msg as AssistantMsg)
    .chunks.map(stripCitations)
    .join("\n\n");
  this.typeWriter(placeholder, fullText, () => {
    bubble.removeChild(placeholder);

    /* Build one mini-bubble per chunk */
    const bubbleCol = document.createElement("div");
    bubbleCol.className = "bubble-col"; // flex-column via CSS
    const chunkEls: HTMLElement[] = [];

    (msg as AssistantMsg).chunks.forEach((md, idx) => {
      const bub = document.createElement("div");
      bub.className = "mini-bubble";
      bub.dataset.chunk = String(idx);
      bub.innerHTML = stripCitations(md)
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>")
        .replace(/\*(.*?)\*/gim, "<i>$1</i>")
        .replace(/\n/g, "<br>");
      bubbleCol.appendChild(bub);
      chunkEls.push(bub);
    });
    bubble.appendChild(bubbleCol);

    /* Chunk-index → part-numbers lookup */
    const chunkLookup: Record<number, string[]> = {};
    (msg as AssistantMsg).subParts.forEach(sp => {
      (chunkLookup[sp.relation_to_chunk] ||= []).push(sp.part_number);
    });
    const pnToChunk: Record<string, number> = {};
    (msg as AssistantMsg).subParts.forEach(sp => {
      pnToChunk[sp.part_number] = sp.relation_to_chunk;
    });

    const relMap: Record<string, string> = {};
    (msg as AssistantMsg).subParts.forEach(sp => {
      relMap[sp.part_number] = sp.relation_to_query;
    });

    /* Context for buttons + viewer */
    const ctx: BubbleCtx = {
      iframe: null,
      partButtons: {},
      highlightQueue: [],
      highlightedPart: null,
      highlightedPaths: [],
      hoverPart: null,
      relationPanel: null,
      relationMap: relMap,
      bottomDock: null,
      partPaths: {}, 
      lastFocusPaths: [],  
      hasFramed     : false, 
      mouseClickHighlighted: [],
      chunkLookup: chunkLookup,
    };
    ctxMap.set(bubble, ctx);

    /* Attach wheel-index scroller */
    this.attachFullScreenScroller(bubble, chunkEls, chunkLookup, ctx);

    /* -------------- viewer / splitter / buttons ------------- */
    if (msg.illustrationUrl) {
      const slide = document.createElement("div");
      slide.className = "slide";

      const iframe = document.createElement("iframe");
      ctx.iframe = iframe;
      iframe.src = msg.illustrationUrl;
      iframe.allowFullscreen = true;
      iframe.setAttribute("allow", "xr-spatial-tracking");
      iframe.style.cssText = "width:100%;min-height:480px;border:none";
      slide.appendChild(iframe);
      window.addEventListener('message', (e) => {
        if (!e.data?.type?.startsWith('pointer')) return;
        console.log('[host] got', e.data.type, e.data.path);
      });
/*
      const relPanel = document.createElement('div');
      relPanel.className = 'relation-panel';   // closed by default
      relPanel.textContent = '…';              // placeholder
      slide.appendChild(relPanel);
      ctx.relationPanel = relPanel;            // store in the context
*/
      const fsBtn = document.createElement("button");
      fsBtn.className = "fullscreen-btn";
      fsBtn.textContent = "⤢";
      fsBtn.addEventListener("click", () => this.toggleFull(bubble));
      slide.appendChild(fsBtn);
      this.fullBtn = fsBtn;

      const bottomDock = document.createElement('div');
      bottomDock.className = 'bottom-dock';   // ⬅ absolute grid container

      /* quick-action bar (flex inside col-1) */
      const quickBar = document.createElement('div');
      quickBar.className = 'quick-bar';
      quickBar.innerHTML = `
        <button class="quick-btn" data-id="a1">Action 1</button>
        <button class="quick-btn" data-id="a2">Action 2</button>
      `;
      bottomDock.appendChild(quickBar);
      ctx.bottomDock = bottomDock;
      slide.appendChild(bottomDock);

      /* relation panel (lives in col-2) */
      const relPanel = document.createElement('div');
      relPanel.className = 'relation-panel';  // closed by default
      relPanel.textContent = '…';
      bottomDock.appendChild(relPanel);
      ctx.relationPanel = relPanel;           // save in context

      /* hook up temp actions (unchanged) */
      quickBar.addEventListener('click', e => {
        if (!(e.target instanceof HTMLButtonElement)) return;
        console.log('Clicked', e.target.dataset.id);
      });

      slide.appendChild(bottomDock);  

      /*
      const quickBar = document.createElement('div');
      quickBar.className = 'quick-bar';           // hidden by default – CSS does the magic
      quickBar.innerHTML = `
        <button class="quick-btn" data-id="a1">Action 1</button>
        <button class="quick-btn" data-id="a2">Action 2</button>
      `;
      slide.appendChild(quickBar);
*/
      // (optional) stub click-handlers you can remap later
      quickBar.addEventListener('click', e => {
        if (!(e.target instanceof HTMLButtonElement)) return;
        switch (e.target.dataset.id) {
          case 'a1': console.log('temp action 1'); break;
          case 'a2': console.log('temp action 2'); break;
        }
      });

      bubble.appendChild(makeSplitter(bubble));
      bubble.appendChild(slide);
      requestAnimationFrame(() => slide.classList.add("show"));

/* helper: "2031-2" ⇒ "2031" */
      const getPN = (raw: string) => raw.split('-')[0];

      /* helper: open the dock only if it isn’t already */
      const showDock = (ctx: BubbleCtx) =>
        ctx.bottomDock?.classList.add('dock-active');

      window.addEventListener('message', e => {
        const t = (e.data?.type ?? '') as string;

        switch (t) {
          /* ───────────────────────── illustration finished loading ─── */
          case 'illustrationLoaded': {
            /* 1. build PN → paths[] */
            const map: Record<string, string[][]> = {};
            for (const full of e.data.paths as string[][]) {
              /* keep only every second node & strip dash-suffixes */
              for (let i = 0; i < full.length; i += 2) {
                const pn = getPN(full[full.length - 1 - i]);
                (map[pn] ||= []).push(full);
              }
            }
            ctx.partPaths = map;

            /* 2. permanent blue outline for *all* referenced sub-parts */
            const allPNs = (msg as AssistantMsg).subParts.map(sp => sp.part_number);
            this.autoHighlight(allPNs, ctx);

            /* 3. focus & frame the very first chunk */
            const firstParts = chunkLookup[0] ?? [];
            if (this.isFull(bubble) && firstParts.length){
              this.addFocusHighlights(firstParts, ctx);
              this.frameByPart(firstParts[0], ctx);
              ctx.hasFramed = true;
              this.showDock(ctx);
            }

            /* 4. replay anything that was queued pre-load */
            this.highlightQueue.forEach(h =>
              ctx.iframe?.contentWindow?.postMessage(
                { type:'addHighlight', key:'selection', path:h.path, color:'#ffbb00', fill:h.fill },
                '*',
              )
            );
            this.highlightQueue.length = 0;
            return;                          // <-- case handled
          }

          /* ───────────────────────── click directly on geometry ────── */
          case 'pointerClickedOnGeom': {
            const path = e.data.path as string[];
            const pn   = getPN(path[path.length - 2] ?? '');

            /* ignore clicks on parts the assistant didn’t mention */
            if (!ctx.partPaths[pn]) return;

            /* a) focus + camera */
            this.focusPart(pn, ctx);
            showDock(ctx);

            /* b) highlight / scroll the pill button */
            const btn = ctx.partButtons[pn];
            if (btn) {
              btn.classList.add('scroll-active');
              btn.scrollIntoView({ behavior:'smooth', block:'center' });
            }

            /* c) scroll prose to the matching chunk */
            const tk = (msg as AssistantMsg).subParts
                        .find(sp => sp.part_number === pn)?.relation_to_chunk;
            if (typeof tk === 'number') {
              bubble.querySelector<HTMLElement>(
                `.mini-bubble[data-chunk="${tk}"]`
              )?.click();
            }
            return;
          }

          /* ───────────────────────── ignore everything else ─────────── */
          default:
            return;
        }
      });
      
    }

    /* Buttons for part numbers */
    this.injectBinButtons(
      bubble,
      (msg as AssistantMsg).subParts.map(p => p.part_number),
      ctx,
      pnToChunk
    );

    /* Support footer */
    const footer = document.createElement("div");
    footer.className = "support-footer";
    footer.style.cssText = "margin-top:12px;font-size:12px;opacity:.8;";
    footer.textContent = ClusterPage.SUPPORT_FOOTER;
    bubble.appendChild(footer);

    this.smoothScrollToBottom(chat);
  });
}




  // Process conversation messages and render new ones.
  private renderNewMessages() {
    while (this.renderedCount < this.conversation.length) {
      this.appendOneMessage(this.conversation[this.renderedCount++]);
    }
  }

  // When send button is clicked, process the user's message.
  private async onSendMessage() {
    const input = this.shadow.getElementById('userInput') as HTMLTextAreaElement;
    const text = input.value.trim();
    if (!text) return;

    // Append the user message.
    this.conversation.push({ role: 'user', content: text });
    this.renderNewMessages();
    input.value = '';

    // Show loader then call API or use mock assistant.
    const loader = this.showWaitingAnimation();
    try {
      const assistant = TEST_MODE
        ? await this.mockAssistant()
        : await this.callAssistantAPI(text);
      const img = loader.querySelector<HTMLImageElement>('.tsr-icon.loading');
      if (img) img.classList.add('spin-back');
      (img ?? loader).addEventListener('animationend', () => {
        loader.remove();
        this.conversation.push(assistant);
        this.renderNewMessages();
      }, { once: true });
    } catch (e) {
      console.error(e);
      loader.remove();
    }
  }

  // Simulate an assistant response for testing.
  private async mockAssistant(): Promise<AssistantMsg> {
    await this.prefetchBinLocations(TEST_JSON.sub_parts.map(p => p.part_number));
    return {
      role: "assistant",
      chunks: TEST_JSON.chunks,               // <-- NEW
      topLevelPart: TEST_JSON.top_level_part, // <-- NEW
      subParts: TEST_JSON.sub_parts,          // <-- NEW
      illustrationUrl: TEST_JSON.illustration_url
    };
  }

  // Call the actual OpenAI assistant API.
private async callAssistantAPI(userText: string): Promise<AssistantMsg> {
  let threadId = sessionStorage.getItem("tsrThread");
  if (!threadId) {
    threadId = (await openai.beta.threads.create()).id;
    sessionStorage.setItem("tsrThread", threadId);
  }

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: userText
  });
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID
  });

  // Poll until finished
  while (true) {
    const r = await openai.beta.threads.runs.retrieve(run.id, threadId);
    if (r.status === "completed") break;
    if (r.status === "failed" || r.status === "expired")
      throw new Error("Run " + r.status);
    await new Promise(r => setTimeout(r, 800));
  }

  const { data } = await openai.beta.threads.messages.list(threadId, {
    limit: 1
  });
  const block = data[0].content[0];
  if (block.type !== "text") throw new Error("Assistant returned non-text");

  const parsed = JSON.parse(block.text.value || "{}");
  const partNums = Array.isArray(parsed.sub_parts)
    ? parsed.sub_parts.map((p: any) => p.part_number)
    : [];

  await this.prefetchBinLocations(partNums);

  return {
    role: "assistant",
    chunks: parsed.chunks ?? [parsed.raw_text ?? block.text.value],
    topLevelPart: parsed.top_level_part ?? { part_number: "", description: "" },
    subParts: parsed.sub_parts ?? [],
    illustrationUrl: parsed.illustration_url ?? DEFAULT_IFRAME_URL
  };
}

  // Pre-fetch bin location data based on part numbers.
  private async prefetchBinLocations(partNumbers: string[]) {
    await Promise.all(
      partNumbers.map(async pn => {
        if (!this.binCache.has(pn)) {
          try {
            this.binCache.set(pn, await fetchBinLocationsByPart(pn));
          } catch {
            this.binCache.set(pn, []);
          }
        }
      })
    );
  }
    /*
    private highlightedPart: string | null = null;
    */
    private highlightedPaths: string[][] = [];
    private autoHighlight(subParts: string[], ctx: BubbleCtx) {
      const win = ctx.iframe?.contentWindow;
      if (!win) return;

      subParts.forEach(pn => {
        (ctx.partPaths[pn] || []).forEach(path =>
          win.postMessage(
            {
              type   : 'addHighlight',
              key    : `auto-${pn}`,          // never removed
              path,
              color  : '#0078d4',
              fill   : 0.05,
              outline: 2,
            },
            '*',
          ),
        );
      });
    }
    private clearFocus(ctx: BubbleCtx) {
      const win = ctx.iframe?.contentWindow;
      if (!win) return;

      // ① remove the coloured faces
      ctx.lastFocusPaths.forEach(p =>
        win.postMessage({ type:'removeHighlight', key:'focus', path:p }, '*'),
      );
      ctx.lastFocusPaths = [];
      this.updateRelationCards(ctx, []);

      // ② only fly back if we previously framed in
      if (ctx.hasFramed) {
        win.postMessage(
          { type:'selectView', name:'Initial View', duration:800 },
          '*',
        );
        ctx.hasFramed = false;
      }
    }
  // Inject action buttons for bin locations.
  private injectBinButtons(bubble: HTMLElement, partNumbers: string[] , ctx: BubbleCtx, pnToChunk: Record<string, number>
  ) {
    // use ctx.partButtons instead of this.partButtons
    if (!partNumbers.length) return;

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'bin-buttons-container';

    const detailsContainer = !TEST_MODE
    ? Object.assign(document.createElement('div'), {
        className: 'bin-details-container',
        innerHTML: '<i>Select a part to see bin details.</i>'
      })
    : null;

    let activeButton: HTMLElement | null = null;
    let activePart: string | null = null;

    partNumbers.forEach(pn => {
      const btnWrap = document.createElement('div');
      btnWrap.className = 'bin-button-wrapper';

      const btn = document.createElement('button');
      btn.className = 'bin-button';
      btn.textContent = pn;
      btnWrap.appendChild(btn);
      ctx.partButtons[pn] = btn;
      buttonsContainer.appendChild(btnWrap);

      const data = this.binCache.get(pn);
      if ((!data || !data.length) && !TEST_MODE) {   // ← add condition
        btn.classList.add('disabled');
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
        btn.style.pointerEvents = 'none';
      }

    btn.addEventListener('click', () => {
      const dock = ctx.bottomDock!; 

      const same = pn === activePart;


      if (same) {
        this.clearHighlight(ctx);
        this.clearFocus(ctx);          // 🔸 remove orange + reset camera

        if (activeButton) activeButton.classList.remove('active');
        activeButton = null;
        activePart = null;
        dock.classList.remove('dock-active');
        if (detailsContainer) collapseDetailsContainer(detailsContainer);
        this.updateRelationCards(ctx, []);
        return;
      }

        if (activeButton) activeButton.classList.remove('active');
        btn.classList.add('active');
        activeButton = btn;
        activePart = pn;

        this.clearHighlight(ctx);

        this.clearFocus(ctx);            // ← NEW
        this.focusPart(pn, ctx);
        this.updateRelationCards(ctx, [pn]);  
        /* 🔸 apply orange focus on the newly-clicked part */
        /*
        this.addFocusHighlights([pn], ctx); // ← NEW
        this.frameByPart(pn, ctx);          // ← NEW
        ctx.hasFramed = true;  
        */

        const targetChunk = pnToChunk[pn];
        bubble.querySelector<HTMLElement>(
          `.mini-bubble[data-chunk="${targetChunk}"]`
        )?.click();
        /*
        this.highlightedPart = pn;
        */
        this.highlightedPaths = ctx.partPaths[pn] || [];

        if (detailsContainer) {
          const html =
            data && data.length ? binLocationHtml(data[0]) : '<i>No bin location found</i>';
          this.updateDetailsContainer(detailsContainer, html);
        }

        // 🔥 Add smooth scrolling here
        btn.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
        dock.classList.add('dock-active'); 
      });


    });

  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = '📥 Download These';
  downloadBtn.className = 'bin-button download-btn';
    downloadBtn.style.marginTop = '10px';
    downloadBtn.addEventListener('click', () => {
      const rows: BinLocation[] = partNumbers
        .map(p => this.binCache.get(p))
        .flat()
        .filter((r): r is BinLocation => !!r?.partNumber);
      exportToCSV(rows, `TSR_SelectedParts_${Date.now()}.csv`);
    });

    bubble.appendChild(buttonsContainer);
    if (detailsContainer) bubble.appendChild(detailsContainer);   // ← guarded append
    bubble.appendChild(downloadBtn);
  }

  private updateRelationCards(ctx: BubbleCtx, partNumbers: string[]){
    const panel = ctx.relationPanel;
    if (!panel) return;

    panel.textContent = '';                     // clear

    if (!partNumbers.length){
      ctx.bottomDock?.classList.remove('dock-active');
      return;
    }

    partNumbers.forEach(pn=>{
      const card = document.createElement('div');
      card.className = 'rel-card';
      card.innerHTML =
        `<button class="bin-button static">${pn}</button>
        &nbsp;—&nbsp;${ctx.relationMap[pn] ?? '(no description)'}`;
      panel.appendChild(card);
    });

    ctx.bottomDock?.classList.add('dock-active');
  }
  // Animate update of bin details.
  private updateDetailsContainer(container: HTMLElement, newContent: string) {
    const oldHeight = container.offsetHeight;
    container.classList.remove('fade-transition');
    container.innerHTML = newContent;
    void container.offsetWidth;
    container.classList.add('fade-transition');
    const newHeight = container.scrollHeight;
    container.style.height = oldHeight + 'px';
    void container.offsetHeight;
    requestAnimationFrame(() => {
      container.style.height = newHeight + 'px';
    });
    container.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'height') {
        container.style.height = 'auto';
        container.removeEventListener('transitionend', handler);
      }
    });
  }
}

// ========================
// Define Custom Element
// ========================
customElements.define('cluster-page', ClusterPage);
