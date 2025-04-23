/*  ClusterPage  –  TSR diagnostic chat (all‑in‑one)
 *  -------------------------------------------------
 *  – Talks to OpenAI Assistants v2 directly from the browser
 *  – Retrieves a JB2 OAuth‑token on‑demand and caches it
 *  – Fetches material data for each part number and slides it in
 *  – Types assistant text like a terminal (type‑writer effect)
 *  – Renders Markdown, support footer, smooth upward animation
 *  ------------------------------------------------- */

import OpenAI from 'openai';

import {
  fetchBinLocationsByPart,
  exportToCSV,
  collapseDetailsContainer,
  binLocationHtml,
  BinLocation
} from '../../components/api/jb2';

import cssText from './cluster-page-styles.css?inline'; // Import the CSS text


const sheet = new CSSStyleSheet();
sheet.replaceSync(cssText);

/* ───────── Type definitions ───────── */


type AssistantMsg = { role: 'assistant'; rawText: string; partNumbers: string[] };
type UserMsg      = { role: 'user';      content:  string };

/* ───────── OpenAI assistant setup ───────── */
const openai = new OpenAI({
  apiKey:  import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: { 'OpenAI-Beta': 'assistants=v2' }
});
const ASSISTANT_ID = import.meta.env.VITE_ASSISTANT_ID;

/* ───────── Web‑component ───────── */
class ClusterPage extends HTMLElement {
  private shadow: ShadowRoot;
  private conversation: Array<UserMsg | AssistantMsg> = [];
  private renderedCount = 0;

  private static SUPPORT_FOOTER = `
Contact Support if Necessary
If the issue persists despite adjustments, contact Trebro Manufacturing support for assistance:
Phone: (406) 652‑5867 • Toll‑Free: (888) 395‑5867`.trim();

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.adoptedStyleSheets = [sheet];
    this.shadow.innerHTML = /*html*/ `

      <div class="cluster-container">
        <h2>Bluegrass (TSR demo)</h2>
        <div class="chat-messages" id="chatMessages"></div>
        <div class="input-area">
          <textarea id="userInput" placeholder="Type your message..."></textarea>
          <button id="sendBtn">Send</button>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    this.shadow.getElementById('sendBtn')!.addEventListener('click', () => this.onSendMessage());

    // Add "Download All" button inside the cluster container
  }




  private smoothScrollToBottom(container: HTMLElement) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  }
  private binCache: Map<string, BinLocation[]> = new Map();

  /* ───────── typewriter helper ───────── */
  private typeWriter(
    el: HTMLElement,
    text: string,
    done: () => void,
    speed = 20
  ) {
    let i = 0;

    // Main container for typed text
    const typedTextSpan = document.createElement('span');
    typedTextSpan.className = 'typed-text-span';
    el.appendChild(typedTextSpan);

    // TSR image cursor (inline, like a blinking character)
    const cursor = document.createElement('img');
    cursor.src = 'data/TSRIcon.png';
    cursor.alt = 'TSR';
    cursor.className = 'tsr-inline-cursor';
    typedTextSpan.appendChild(cursor);

    const step = () => {
      if (i < text.length) {
        const ch = text[i++];

        if (ch === '\n') {
          typedTextSpan.insertBefore(document.createElement('br'), cursor);
        } else {
          typedTextSpan.insertBefore(document.createTextNode(ch), cursor);
        }

        // Automatically scroll down
        const chatMessages = this.shadow.getElementById('chatMessages') as HTMLElement;
        this.smoothScrollToBottom(chatMessages);

        setTimeout(step, speed);
      } else {
        cursor.remove();
        done();
      }
    };

    step();
  }

  private showWaitingAnimation() {
    const chat = this.shadow.getElementById('chatMessages') as HTMLDivElement;

    const wrapper = document.createElement('div');
    wrapper.classList.add('message-container');

    const bubble = document.createElement('div');
    bubble.classList.add('message', 'assistant-message');

    // 🚜 Create the TSR + dot animation container
    const tsrRow = document.createElement('div');
    tsrRow.className = 'tsr-harvest-row';
    tsrRow.innerHTML = `
    <div class="tsr-loading-wrapper">
      <img class="tsr-icon loading" src="data/RollyWhite.png" alt="TSR">
      <!--
      <div class="dot-stream-container">
        <div class="dot-stream">
          ${'<div class="dot"></div>'.repeat(10)}
          ${'<div class="dot"></div>'.repeat(10)}
        </div>
      </div>
      -->
    </div>
  `;

    bubble.appendChild(tsrRow);
    wrapper.appendChild(bubble);
    chat.appendChild(wrapper);
    chat.scrollTop = chat.scrollHeight;

    return wrapper; // allow you to remove it later
  }

  /* ───────── helpers ───────── */
  private appendOneMessage(msg: UserMsg | AssistantMsg) {
    const chat = this.shadow.getElementById('chatMessages') as HTMLDivElement;
    const wrapper = document.createElement('div');
    wrapper.classList.add('message-container', 'enter');
    if (msg.role === 'user') wrapper.classList.add('user');

    const bubble = document.createElement('div');
    bubble.classList.add('message', msg.role === 'user' ? 'user-message' : 'assistant-message');

    if (msg.role === 'user') {
      bubble.textContent = msg.content;
      wrapper.appendChild(bubble);
      chat.appendChild(wrapper);
      requestAnimationFrame(() => wrapper.classList.remove('enter'));
      chat.scrollTop = chat.scrollHeight;
      return;
    }

    /* assistant: start with typewriter plain text */
    const placeholder = document.createElement('div');
    bubble.appendChild(placeholder);
    wrapper.appendChild(bubble);
    chat.appendChild(wrapper);
    requestAnimationFrame(() => wrapper.classList.remove('enter'));
    chat.scrollTop = chat.scrollHeight;

    this.typeWriter(placeholder, msg.rawText, () => {
      /* once typing finished, replace with formatted HTML */
      bubble.innerHTML = msg.rawText
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim,  '<h2>$1</h2>')
        .replace(/^# (.*$)/gim,   '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*?)\*/gim,     '<i>$1</i>')
        .replace(/\n/g, '<br>');

      /* slide‑in part containers */
/* slide‑in part containers */
if (msg.partNumbers.length) {
  // Create container for part-number buttons
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'bin-buttons-container';

  // Create a separate details container (initially with placeholder text)
  const detailsContainer = document.createElement('div');
  detailsContainer.className = 'bin-details-container';
  detailsContainer.innerHTML = '<i>Select a part to see bin details.</i>';

  // For each part number, create a flex button
  let activeButton: HTMLElement | null = null;
  let activePartNumber: string | null = null;

  msg.partNumbers.forEach(pn => {
    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'bin-button-wrapper';

    const btn = document.createElement('div');
    btn.className = 'bin-button';
    btn.textContent = pn;

    btnWrapper.appendChild(btn);
    buttonsContainer.appendChild(btnWrapper);

    const data = this.binCache.get(pn);
    if (!data || data.length === 0) {
      btn.classList.add('disabled');
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      btn.style.pointerEvents = 'none';
    }

    btn.addEventListener('click', () => {
      const isSame = activePartNumber === pn;

      if (isSame) {
        // Collapse
        if (activeButton) activeButton.classList.remove('active');
        activeButton = null;
        activePartNumber = null;

        collapseDetailsContainer(detailsContainer);
      } else {
        // New item
        if (activeButton) activeButton.classList.remove('active');
        btn.classList.add('active');
        activeButton = btn;
        activePartNumber = pn;

        const content = data && data.length > 0
          ? binLocationHtml(data[0])
          : '<i>No bin location found</i>';

        updateDetailsContainer(detailsContainer, content);
      }
    });

    buttonsContainer.appendChild(btn);
  });


  // Create the download button for just these part numbers
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = '📥 Download These';
  downloadBtn.className = 'bin-button';
  downloadBtn.style.marginTop = '10px';

  downloadBtn.addEventListener('click', () => {
    const selectedParts: BinLocation[] = msg.partNumbers
      .map(pn => this.binCache.get(pn))
      .flat()
      .filter((x): x is BinLocation => !!x?.partNumber);

    exportToCSV(selectedParts, `TSR_SelectedParts_${Date.now()}.csv`);
  });

  // Append everything to the bubble
  bubble.appendChild(buttonsContainer);
  bubble.appendChild(detailsContainer);
  bubble.appendChild(downloadBtn); // ✅ Add download after part details
}

function updateDetailsContainer(container: HTMLElement, newContent: string): void {
  const oldHeight = container.offsetHeight;

  // Apply a temporary fade-out by removing the content (optional)
  container.classList.remove('fade-transition');

  // Set new content
  container.innerHTML = newContent;

  // Force reflow to restart animation
  void container.offsetWidth;

  // Add fade-in class
  container.classList.add('fade-transition');

  // Animate height (same as before)
  const newHeight = container.scrollHeight;
  container.style.height = oldHeight + 'px';
  void container.offsetHeight;
  requestAnimationFrame(() => {
    container.style.height = newHeight + 'px';
  });

  container.addEventListener('transitionend', function handler(e) {
    if (e.propertyName === 'height') {
      container.style.height = 'auto';
      container.style.transition = 'height 0.4s ease-in-out, opacity 0.4s ease-in-out';
      container.removeEventListener('transitionend', handler);
    }
  });
}



      /* footer */
      const footer = document.createElement('div');
      footer.style.cssText = 'margin-top:12px;font-size:12px;opacity:.8;';
      footer.textContent = ClusterPage.SUPPORT_FOOTER;
      bubble.appendChild(footer);
      chat.scrollTop = chat.scrollHeight;
    });
  }

  private renderNewMessages() {
    while (this.renderedCount < this.conversation.length) {
      this.appendOneMessage(this.conversation[this.renderedCount]);
      this.renderedCount += 1;
    }
  }

  /* ───────── chat flow ───────── */
  private async onSendMessage() {
    const input = this.shadow.getElementById('userInput') as HTMLTextAreaElement;
    const text  = input.value.trim();
    if (!text) return;

    this.conversation.push({ role: 'user', content: text });
    this.renderNewMessages();
    input.value = '';

    const loader = this.showWaitingAnimation(); // show animation before the call

    try {
      const assistant = await this.callAssistantAPI(text);
      this.conversation.push(assistant);
      loader.remove(); // remove placeholder
      this.renderNewMessages();
    } catch (e) {
      console.error(e);
      alert('Assistant error – check console.');
      loader.remove(); // cleanup
    }
  }

  private async prefetchBinLocations(partNumbers: string[]) {
    const fetches = partNumbers.map(async pn => {
      if (!this.binCache.has(pn)) {
        try {
          const data = await fetchBinLocationsByPart(pn);
          this.binCache.set(pn, data);
        } catch (err) {
          console.error(`Error fetching bin for ${pn}:`, err);
          this.binCache.set(pn, []);
        }
      }
    });

    await Promise.all(fetches);
  }

  /* ───────── Assistant API ───────── */
  private async callAssistantAPI(userText: string): Promise<AssistantMsg> {
    let threadId = sessionStorage.getItem('tsrThread');
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      sessionStorage.setItem('tsrThread', threadId);
    }

    await openai.beta.threads.messages.create(threadId, { role: 'user', content: userText });
    const run = await openai.beta.threads.runs.create(threadId, { assistant_id: ASSISTANT_ID });

    while (true) {
      const r = await openai.beta.threads.runs.retrieve(threadId, run.id);
      if (r.status === 'completed') break;
      if (['failed','expired'].includes(r.status)) throw new Error(`Run ${r.status}`);
      await new Promise(r => setTimeout(r, 800));
    }

    const { data } = await openai.beta.threads.messages.list(threadId, { limit: 1 });
    const block = data[0].content[0];
    if (block.type !== 'text') throw new Error('Assistant returned non‑text block');

    const raw = block.text.value;
    let parsed: { raw_text?: string; part_numbers?: string[] } = {};
    try { parsed = JSON.parse(raw); } catch {}

    const partNumbers = Array.isArray(parsed.part_numbers) ? parsed.part_numbers : [];
    await this.prefetchBinLocations(partNumbers); // ✅ move before return

    return {
      role:        'assistant',
      rawText:     parsed.raw_text ?? raw,
      partNumbers: partNumbers
    };
  }

}

customElements.define('cluster-page', ClusterPage);
