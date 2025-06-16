/*********************************************************************
 * Jobboss2 AI -- Agent edition  ✨ (rev. QAB‑2)
 * Adds **toggleable** quick‑action buttons: only one can be active at
 * a time.  Clicking the active button again clears template/tool mode
 * and returns the chat bar to normal.
 *********************************************************************/

import {
  Agent,
  AgentInputItem,
  run,
  setDefaultOpenAIKey,
  setDefaultOpenAIClient,
} from '@openai/agents';

// 🔗 Tool bundle (core only for brevity)
import { jb2CoreTools } from '../../agents/jb2-core-tools';

import './jobboss2-ai-page-styles.css';
import OpenAI from 'openai';
import { Tool } from '@openai/agents';

/* --------------- 1. build the Agent once ------------------------ */
setDefaultOpenAIKey(import.meta.env.VITE_OPENAI_API_KEY);
setDefaultOpenAIClient(
  new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  })
);

const agent = new Agent({
  model: 'gpt-4o',
  name: 'JobBOSS‑2 AI',
  instructions: `You are a JobBOSS‑2 AI agent. Use the provided tools to manage parts and orders. Always give clear answers that fully address the user's request. If you don't know, say so. If you can't help, suggest contacting support.`,
  tools: [...Object.values(jb2CoreTools) as unknown as Tool<unknown>[]],
});

/* ---------------- 2. quick‑action metadata ---------------------- */
interface QuickCfg {
  label: string;
  template?: string; // optional prompt prefix
  tool?: string;     // optional forced tool call
  hint: string;
}

const QUICK_ACTIONS: QuickCfg[] = [
  { label: '📦 New Order',    template: 'Create a new sales order:',           hint: 'Enter PO, qty …' },
  { label: '🔎 Find Order',   template: 'What are the details for order...',               hint: 'Enter order #'   },
  { label: '⏱ ETA',           template: "What’s the ship date for order",      hint: 'Enter order #'   },

  { label: 'Qty On Hand',      template: 'How much quantity on hand do we have for this part...', tool: 'getOnHandQty',             hint: 'Part number…'  },
  { label: 'Find Bins',        tool: 'getBinLocations',          hint: 'Part number…'  },
  { label: 'Order Snapshot',   template: 'Can you check what we have on hand for order...', tool: 'checkOrderOnHandQty',      hint: 'Order #…'      },
  { label: 'Create Pick List', tool: 'createPickList',           hint: 'Order #…'      },
  { label: 'Auto Purchase',    tool: 'autoPurchaseForShortages', hint: 'Order #…'      },
  { label: 'Search Docs',      tool: 'searchERPDocs',            hint: 'How do I…?'    },
];

/* --------------- 3. page / custom element ----------------------- */
export default class Jobboss2AIAgentPage extends HTMLElement {
  private thread:   AgentInputItem[] = [];
  private messages: { role: 'user' | 'assistant'; content: string }[] = [];

  private activeIdx  = -1;             // index of toggled button, -1 = none
  private quickHint  = '';
  private quickTemplate: string | null = null;

  connectedCallback() {
    this.classList.add('cluster-container');
    this.render();
  }

  private showWaitingAnimation(): HTMLElement {
    const chat = this.querySelector('.chat-messages') as HTMLDivElement;

    const wrapper = document.createElement('div');
    wrapper.className = 'message-container';

    const bubble = document.createElement('div');
    bubble.className = 'message assistant-message';

    const tsrRow = document.createElement('div');
    tsrRow.className = 'tsr-harvest-row';
    tsrRow.innerHTML = `
      <div class="tsr-loading-wrapper">
        <img class="tsr-icon loading" src="data/RollyWhite.png" alt="TSR">
      </div>`;
    bubble.appendChild(tsrRow);
    wrapper.appendChild(bubble);
    chat.appendChild(wrapper);
    chat.scrollTop = chat.scrollHeight;

    return wrapper;                         // so we can remove it later
  }
private smoothScroll(el: HTMLElement) {
  el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
}

private appendAssistantAnimated(raw: string) {
  const chat = this.querySelector('.chat-messages') as HTMLElement;
  if (!chat) return;  

  /* container + bubble */
  const wrap   = document.createElement('div');
  wrap.className = 'message-container enter';
  const bubble = document.createElement('div');
  bubble.className = 'message assistant-message';

  /* live type-writer span */
  const span  = document.createElement('span');
  span.className = 'typed-text-span';
  bubble.appendChild(span);

  /* TSR cursor */
  const cursor = document.createElement('img');
  cursor.src   = 'data/TSRIcon.png';
  cursor.alt   = 'TSR';
  cursor.className = 'tsr-inline-cursor';
  span.appendChild(cursor);

  wrap.appendChild(bubble);
  chat.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.remove('enter'));
  this.smoothScroll(chat);

  /* ── typing ── */
  let i = 0;
  const step = () => {
    if (i < raw.length) {
      const ch = raw[i++];
      if (ch === '\n') span.insertBefore(document.createElement('br'), cursor);
      else             span.insertBefore(document.createTextNode(ch), cursor);

      this.smoothScroll(chat);
      setTimeout(step, 10);                     // 20 ms per char
    } else {
      cursor.remove();

      /* swap typed text → formatted HTML */
      bubble.innerHTML = raw
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim,  '<h2>$1</h2>')
        .replace(/^# (.*$)/gim,   '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*?)\*/gim,     '<i>$1</i>')
        .replace(/\n/g, '<br>');
      this.smoothScroll(chat);
    }
  };
  step();
}
  /* ─────────── chat loop ─────────── */
private async send(userText: string) {
  const text = this.quickTemplate
    ? `${this.quickTemplate} ${userText}`.trim()
    : userText;

  /* capture & clear toggle state */
  this.clearQuickAction();
  this.render();

  /* USER message */
  this.messages.push({ role: 'user', content: text });
  this.render();

  /* 🔄 SHOW SPINNER ------------------------------------ */
  const loader = this.showWaitingAnimation();              // ★ NEW

  try {
    const res  = await run(
      agent,
      this.thread.concat({ role: 'user', content: text })
    );

    loader.remove();                                       // ★ NEW

  this.thread = res.history;
  this.appendAssistantAnimated(String(res.finalOutput ?? ''));
  } catch (err) {
    loader.remove();                                       // ★ NEW
    console.error(err);
    alert('Agent error – check console.');
  }
}

  /* ─────────── toggle helpers ─────────── */
  private activateQuick(idx: number) {
    const cfg = QUICK_ACTIONS[idx];
    this.activeIdx     = idx;
    this.quickTemplate = cfg.template || null;
    this.quickHint     = cfg.hint;
  }

  private clearQuickAction() {
    this.activeIdx     = -1;
    this.quickTemplate = null;
    this.quickHint     = '';
  }

  /* ─────────── UI render ─────────── */
  private render() {
    this.innerHTML = '';

    

    /* 1) conversation */
    const chat = document.createElement('div');
    chat.className = 'chat-messages';
    for (const m of this.messages) {
      const line = document.createElement('div');
      line.className = `message ${m.role}-message`;
      line.textContent = m.content;
      chat.appendChild(line);
    }
    this.appendChild(chat);

    /* 2) quick‑action bar */
    const bar = document.createElement('div');
    bar.className = 'quick-bar';

    QUICK_ACTIONS.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quick-btn';
      if (idx === this.activeIdx) btn.classList.add('active');
      btn.textContent = q.label;
      btn.onclick = () => {
        if (this.activeIdx === idx) {
          // toggle OFF
          this.clearQuickAction();
        } else {
          // toggle ON (and deactivate any previous)
          this.activateQuick(idx);
        }
        this.render();
        (this.querySelector('#jb2-chatbox') as HTMLTextAreaElement)?.focus();
      };
      bar.appendChild(btn);
    });
    this.appendChild(bar);

    /* 3) input bar */
    const wrapper = document.createElement('div');
    wrapper.className = 'input-bar';

    const ta = document.createElement('textarea');
    ta.id = 'jb2-chatbox';
    ta.rows = 1;
    ta.placeholder = this.quickHint || 'Type a message…';
    if (this.activeIdx !== -1) ta.classList.add('template-mode');

    // auto-grow height
    ta.oninput = () => {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    };

    // Enter = send (unless Shift held)
    ta.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const v = ta.value.trim();
        if (v) {
          this.send(v);
          ta.value = '';
          ta.style.height = 'auto';
        }
      }
    };

    const sendBtn = document.createElement('button');
    sendBtn.className = 'send-btn';
    if (this.activeIdx !== -1) sendBtn.classList.add('template-mode');
    sendBtn.textContent = 'Send';
    sendBtn.style.cssText = `
      background: linear-gradient(45deg,rgb(0, 108, 196),rgb(0, 137, 155));
      color: white;
      border: none;
      border-radius: 20px;
      padding: 8px 16px;
      font-weight: bold;
      width: 50x;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    sendBtn.onmouseover = () => {
      sendBtn.style.transform = 'translateY(-2px)';
      sendBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    };
    sendBtn.onmouseout = () => {
      sendBtn.style.transform = 'translateY(0)';
      sendBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    };
    sendBtn.onclick = () => {
      const v = ta.value.trim();
      if (v) {
        this.send(v);
        ta.value = '';
        ta.style.height = 'auto';
      }
    };

    wrapper.appendChild(ta);
    wrapper.appendChild(sendBtn);
    this.appendChild(wrapper);
  }
}



/* register custom element */
customElements.define('jobboss2-ai-page', Jobboss2AIAgentPage);
