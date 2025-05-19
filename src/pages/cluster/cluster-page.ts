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
  "https://app.zea.live/illustrations-viewer/UyWiDDbGReluuuZ9T6Dt";

const TEST_MODE = false;
const TEST_JSON = {
  chunks: [
    "**1. Check the blade pitch and roller alignment**  \nImproper blade pitch can lead to inconsistent cutting or unclean cuts. If the cutter blade is pitched incorrectly, it can pinch or tear the turf instead of cutting smoothly. Verify that the blade is parallel to the roller and that the roller-to-blade distance meets your soil conditions. Softer soils may need less distance, while rocky soils might require a greater gap. Retighten any loosened fasteners after making adjustments. :contentReference[oaicite:0]{index=0}",
    "**2. Inspect the cutterhead drive belt**  \nA worn or loose belt can cause slippage and reduce cutting performance. Make sure the pulleys remain parallel and in line, and confirm the belt tension is tight enough to avoid slippage without being overtightened. Replace any belt that shows visible wear such as cracks or fraying. :contentReference[oaicite:2]{index=2}",
    "**3. Examine the ground roller**  \nIf the ground roller is bent or dirty, it can affect cutting length and turf quality. Clean off debris that builds up on the roller surface, since this can effectively enlarge the roller diameter and result in unwanted length changes of the cut turf. :contentReference[oaicite:4]{index=4}",
    "**4. Confirm the roller scraper is properly adjusted**  \nThe scraper should make even contact with the roller. Any accumulation of debris on the roller can cause inaccurate cut lengths. Adjust the scraper and re-tighten its fasteners so it consistently cleans the roller. :contentReference[oaicite:6]{index=6}",
    "**5. Validate overall lubrication and tightening**  \nCheck for lubrication points on bearings, pivot pins, and other moving parts. Ensure all fasteners are tight. Loose hardware or poor lubrication can produce excessive vibration, noise, or poor cut quality in the cutterhead."
  ],
  top_level_part: {
    part_number: "TS01100-A",
    description: "Cutterhead Frame, TSR"
  },
  sub_parts: [
    {
      part_number: "46061",
      description: "24-inch cutting blade",
      relation_to_query: "Adjusting pitch and alignment is essential for a clean cut",
      relation_to_chunk: 0
    },
    {
      part_number: "20503",
      description: "Cutterhead Belt",
      relation_to_query: "Ensuring correct belt tension prevents slippage",
      relation_to_chunk: 1
    },
    {
      part_number: "TS03076-W",
      description: "Ground cutterhead roller",
      relation_to_query: "The roller can affect cut length when dirty or damaged",
      relation_to_chunk: 2
    },
    {
      part_number: "TS03093",
      description: "Scraper, cutterhead ground roll",
      relation_to_query: "Keeps roller free from debris for proper cutting length",
      relation_to_chunk: 3
    }
  ],
   illustration_url : 'https://app.zea.live/illustrations-viewer/UyWiDDbGReluuuZ9T6Dt'
};

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
  /** which part is currently hovered by the model */
  hoverPart: string | null;
  /** relation to query element */
  relationPanel: HTMLDivElement | null;
  relationMap: Record<string, string>; 
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
                      .getPropertyValue('--left-col')) || 280;

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
          <button id="sendBtn">Send</button>
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
      relationMap: {}
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
  private iframeReady = false;
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
  }
  
  //
  private clearScrollHighlights(ctx: BubbleCtx) {
  ctx.iframe?.contentWindow?.postMessage(
    { type: "clearHighlights", keyPrefix: "scroll" },
    "*"
  );
}

private highlightByPart(pn: string, ctx: BubbleCtx) {
  const paths = this.partToPaths[pn] ?? [];
  paths.forEach(path =>
    ctx.iframe?.contentWindow?.postMessage(
      {
        type: "addHighlight",
        key: `scroll-${pn}`,
        path,
        color: "#ffbb00",
        fill: 0.10
      },
      "*"
    )
  );
}
/* ────────────────────────── helper: wheel-controlled focus ── */
private attachFullScreenScroller(
  bubble: HTMLElement,
  bubList: HTMLElement[],
  chunkLookup: Record<number, string[]>,
  ctx: BubbleCtx
) {
  let idx = 0;
  const max = bubList.length - 1;

const activate = (newIdx: number) => {
  if (newIdx === idx) return;

  bubList[idx].classList.remove('in-focus');
  this.clearScrollHighlights(ctx);
  Object.values(ctx.partButtons).forEach(btn =>
    btn.classList.remove('scroll-active')
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

  const parts = chunkLookup[idx] ?? [];
  parts.forEach(pn => {
    this.highlightByPart(pn, ctx);
    ctx.partButtons[pn]?.classList.add('scroll-active');

    // 🔥 Add this scrolling behavior for bin buttons container
    const btn = ctx.partButtons[pn];
    if (btn) {
      const container = btn.closest('.bin-buttons-container');
      if (container instanceof HTMLElement) {
        btn.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  });

  if (parts.length === 1) {
    this.showRelation(
      ctx,
      `<button class="bin-button static">${parts[0]}</button>&nbsp;—&nbsp;${
        ctx.relationMap[parts[0]] ?? '(no relation text found)'
      }`
    );
  } else {
    this.showRelation(ctx, null);
  }
};

  /* wheel handler */
  bubble.addEventListener(
    "wheel",
    ev => {
      if (!bubble.classList.contains("fullscreen")) return;
      ev.preventDefault(); // block native scroll
      const dir = Math.sign(ev.deltaY);
      if (dir > 0 && idx < max) activate(idx + 1);
      else if (dir < 0 && idx > 0) activate(idx - 1);
    },
    { passive: false }
  );

  /* Initialise first bubble */
  bubList[0].classList.add("in-focus");
  (chunkLookup[0] ?? []).forEach(pn => {
    this.highlightByPart(pn, ctx);
    ctx.partButtons[pn]?.classList.add("scroll-active");
  });
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

private appendOneMessage(msg: UserMsg | AssistantMsg) {
  const chat = this.shadow.getElementById("chatMessages") as HTMLElement;
  const wrap = document.createElement("div");
  wrap.className =
    "message-container enter" + (msg.role === "user" ? " user" : "");
  const bubble = document.createElement("div");
  bubble.style.setProperty("--left-col", "280px");
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
      relationMap: relMap  
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

      const relPanel = document.createElement('div');
      relPanel.className = 'relation-panel';   // closed by default
      relPanel.textContent = '…';              // placeholder
      slide.appendChild(relPanel);
      ctx.relationPanel = relPanel;            // store in the context

      const fsBtn = document.createElement("button");
      fsBtn.className = "fullscreen-btn";
      fsBtn.textContent = "⤢";
      fsBtn.addEventListener("click", () => this.toggleFull(bubble));
      slide.appendChild(fsBtn);
      this.fullBtn = fsBtn;

      bubble.appendChild(makeSplitter(bubble));
      bubble.appendChild(slide);
      requestAnimationFrame(() => slide.classList.add("show"));

      window.addEventListener("message", e => {
        if (e.data?.type === "illustrationLoaded") {
          this.iframeReady = true;

          this.highlightQueue.forEach(h =>
            iframe.contentWindow?.postMessage(
              {
                type: "addHighlight",
                key: "selection",
                path: h.path,
                color: "#ffbb00",
                fill: h.fill
              },
              "*"
            )
          );
          this.highlightQueue.length = 0;

          this.autoHighlight(
            (msg as AssistantMsg).subParts.map(p => p.part_number),
            ctx
          );
        }
      });
    }

    /* Buttons for part numbers */
    this.injectBinButtons(
      bubble,
      (msg as AssistantMsg).subParts.map(p => p.part_number),
      ctx
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
    const r = await openai.beta.threads.runs.retrieve(threadId, run.id);
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
  private partToPaths: Record<string, string[][]> = {
    'TS03053-W': [['root','Assets','TS03083-W.iam','TS03083-W.iam','TS03053:1']],
    'TS03056-W': [
      ['root','Assets','TS03083-W.iam','TS03083-W.iam','TS03056:1']   // ← add
    ]
    // keep any earlier mappings here
  };
    /*
    private highlightedPart: string | null = null;
    */
    private highlightedPaths: string[][] = [];
    private viewerIframe: HTMLIFrameElement | null = null;
    private autoHighlight(parts: string[], ctx: BubbleCtx): void {
      const win = ctx.iframe?.contentWindow;
      if (!win) return;                 // iframe not ready yet
    
      parts.forEach(pn => {
        const paths = this.partToPaths[pn];
        if (!paths) return;
        paths.forEach(path =>
          win.postMessage(
            {
              type:  'addHighlight',
              key:   `auto-${pn}`,
              path,
              color: '#0078d4',
              fill:  0.05,
              outline: 2
            },
            '*'
          )
        );
      });
    }
    private showRelation(ctx: BubbleCtx, html: string | null) {
      const panel = ctx.relationPanel;
      if (!panel) return;

      if (html) {
        panel.innerHTML = html;           // ⬅️ was textContent
        panel.classList.remove('open');
        void panel.offsetWidth;           // reflow → restart animation
        panel.classList.add('open');
      } else {
        panel.classList.remove('open');
      }
    }
  // Inject action buttons for bin locations.
  private injectBinButtons(bubble: HTMLElement, partNumbers: string[] , ctx: BubbleCtx
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
const same = pn === activePart;


if (same) {
  this.clearHighlight(ctx);
  if (activeButton) activeButton.classList.remove('active');
  activeButton = null;
  activePart = null;
  if (detailsContainer) collapseDetailsContainer(detailsContainer);
  this.showRelation(ctx, null);
  return;
}

  if (activeButton) activeButton.classList.remove('active');
  btn.classList.add('active');
  activeButton = btn;
  activePart = pn;

  this.clearHighlight(ctx);
  const paths = this.partToPaths[pn] || [];
  if (this.viewerIframe && this.iframeReady && paths.length) {
    paths.forEach(p =>
      ctx.iframe?.contentWindow?.postMessage(
        { type: 'addHighlight', key: 'selection', path: p, color: '#ffbb00', fill: 0.25 },
        '*'
      )
    );
  } else if (!this.iframeReady) {
    paths.forEach(p => this.highlightQueue.push({ path: p, fill: 0.08 }));
  }
  /*
  this.highlightedPart = pn;
  */
  this.highlightedPaths = paths;

  this.showRelation(
    ctx,
    `<button class="bin-button static">${pn}</button>&nbsp;—&nbsp;${
      ctx.relationMap[pn] ?? '(no relation text found)'
    }`
  );

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
