/*  ClusterPage  –  TSR diagnostic chat (all‑in‑one)
 *  -------------------------------------------------
 *  – Talks to OpenAI Assistants v2 directly from the browser
 *  – Uses import.meta.env.VITE_OPENAI_API_KEY and VITE_ASSISTANT_ID
 *  – Persists thread_id in sessionStorage
 *  – Renders Markdown, part‑number pills, support footer
 *  – Keeps smooth upward animation
 *  ------------------------------------------------- */

import OpenAI from 'openai';

type AssistantMsg = { role: 'assistant'; rawText: string; partNumbers: string[] };
type UserMsg      = { role: 'user';      content:  string };

const openai = new OpenAI({
  apiKey:  import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,          // <- allow key in browser
  defaultHeaders: { 'OpenAI-Beta': 'assistants=v2' }
});

const ASSISTANT_ID = import.meta.env.VITE_ASSISTANT_ID; // asst_********

class ClusterPage extends HTMLElement {
  private shadow: ShadowRoot;
  private conversation: Array<UserMsg | AssistantMsg> = [];
  private renderedCount = 0;

  private static SUPPORT_FOOTER = `
Contact Support if Necessary
If the issue persists despite adjustments, contact Trebro Manufacturing support for assistance:
Phone: (406) 652‑5867 • Toll‑Free: (888) 395‑5867
`.trim();

  /* ───────── constructor & template ───────── */
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = /* html */`
      <style> /* — styling unchanged — */
        .cluster-container{display:flex;flex-direction:column;padding:16px;font-family:sans-serif;overflow-x:hidden}
        .chat-messages{display:flex;flex-direction:column;flex-grow:1;margin-bottom:12px;overflow-y:auto;max-height:60vh}
        .message-container{display:flex;justify-content:flex-start;transition:transform .35s ease,opacity .35s ease}
        .message-container.user{justify-content:flex-end}
        .message-container.enter{transform:translateY(24px);opacity:0}
        .message{margin:8px 0;padding:12px;border-radius:8px;white-space:pre-wrap;max-width:80%}
        .user-message{background:#345995;color:#fff;align-self:flex-end}
        .assistant-message{background:#e36a1e;color:#fff;align-self:flex-start}
        .input-area{display:flex;gap:8px}
        .input-area textarea{flex:1;padding:8px;min-height:50px}
        button{background:var(--container-bg);color:var(--color-text);font-size:14px;font-weight:bold;border:3px solid black;border-radius:12px;cursor:pointer;transform:scale(.9);padding:10px 16px;transition:background-color .25s ease,transform .1s ease}
        button:hover{background:#e36a1e;border-color:#e36a1e;color:#fff;transform:scale(1)}
      </style>

      <div class="cluster-container">
        <h2>Bluegrass (TSR demo)</h2>
        <div class="chat-messages" id="chatMessages"></div>

        <div class="input-area">
          <textarea id="userInput" placeholder="Type your message..."></textarea>
          <button id="sendBtn">Send</button>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    this.shadow.getElementById('sendBtn')!
        .addEventListener('click', () => this.onSendMessage());
  }

  /* ─────────── UI helpers (unchanged) ─────────── */
  private appendOneMessage(msg: UserMsg | AssistantMsg) {
    const chat = this.shadow.getElementById('chatMessages') as HTMLDivElement;

    const wrapper = document.createElement('div');
    wrapper.classList.add('message-container', 'enter');
    if (msg.role === 'user') wrapper.classList.add('user');

    const bubble = document.createElement('div');
    bubble.classList.add('message',
      msg.role === 'user' ? 'user-message' : 'assistant-message');

    if (msg.role === 'user') {
      bubble.textContent = msg.content;
    } else {
      /* naive Markdown → HTML */
      bubble.innerHTML = msg.rawText
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim,  '<h2>$1</h2>')
        .replace(/^# (.*$)/gim,   '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*?)\*/gim,     '<i>$1</i>')
        .replace(/\n/g, '<br>');

      /* part‑number pills */
      if (msg.partNumbers.length) {
        const pillRow = document.createElement('div');
        pillRow.style.marginTop = '8px';
        msg.partNumbers.forEach(pn => {
          const pill = document.createElement('span');
          pill.textContent = pn;
          pill.style.cssText =
            pill.style.cssText = `
              display: inline-block; margin: 2px; padding: 2px 8px;
              background: #fff; color: #e36a1e; border: 1px solid #e36a1e;
              border-radius: 12px; font-size: 12px; font-weight: bold;
            `;
          pillRow.appendChild(pill);
        });
        bubble.appendChild(pillRow);
      }

      /* footer */
      const footer = document.createElement('div');
      footer.style.cssText = 'margin-top:12px;font-size:12px;opacity:.8;';
      footer.textContent = ClusterPage.SUPPORT_FOOTER;
      bubble.appendChild(footer);
    }

    wrapper.appendChild(bubble);
    chat.appendChild(wrapper);
    requestAnimationFrame(() => wrapper.classList.remove('enter'));
    chat.scrollTop = chat.scrollHeight;
  }

  private renderNewMessages() {
    while (this.renderedCount < this.conversation.length) {
      this.appendOneMessage(this.conversation[this.renderedCount]);
      this.renderedCount += 1;
    }
  }

  /* ─────────── Chat flow ─────────── */
  private async onSendMessage() {
    const input = this.shadow.getElementById('userInput') as HTMLTextAreaElement;
    const text  = input.value.trim();
    if (!text) return;

    this.conversation.push({ role: 'user', content: text });
    this.renderNewMessages();
    input.value = '';

    try {
      const assistant = await this.callAssistantAPI(text);
      this.conversation.push(assistant);
      this.renderNewMessages();
    } catch (e) {
      console.error(e);
      alert('Assistant error – check console.');
    }
  }

  /* ─────────── Assistant API (browser) ─────────── */
  private async callAssistantAPI(userText: string): Promise<AssistantMsg> {
    /* 1. get or create thread */
    let threadId = sessionStorage.getItem('tsrThread');
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      sessionStorage.setItem('tsrThread', threadId);
    }

    /* 2. add user message */
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: userText
    });

    /* 3. run assistant */
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID
    });

    /* 4. poll until completed */
    while (true) {
      const r = await openai.beta.threads.runs.retrieve(threadId, run.id);
      if (r.status === 'completed') break;
      if (['failed','expired'].includes(r.status)) throw new Error(`Run ${r.status}`);
      await new Promise(r => setTimeout(r, 800));
    }

    /* 5. fetch last assistant message */
    const { data } = await openai.beta.threads.messages.list(threadId, { limit: 1 });
    const block = data[0].content[0];
    if (block.type !== 'text') throw new Error('Assistant returned non‑text block');

    /* 6. parse JSON payload */
    const raw = block.text.value;
    let parsed: { raw_text?: string; part_numbers?: string[] } = {};
    try { parsed = JSON.parse(raw); } catch { /* ignore */ }

    return {
      role: 'assistant',
      rawText:     parsed.raw_text ?? raw,
      partNumbers: Array.isArray(parsed.part_numbers) ? parsed.part_numbers : []
    };
  }
}

customElements.define('cluster-page', ClusterPage);
