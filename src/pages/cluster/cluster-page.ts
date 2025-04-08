/*  ClusterPage  –  TSR diagnostic chat (all‑in‑one)
 *  -------------------------------------------------
 *  – Talks to OpenAI Assistants v2 directly from the browser
 *  – Retrieves a JB2 OAuth‑token on‑demand and caches it
 *  – Fetches material data for each part number and slides it in
 *  – Types assistant text like a terminal (type‑writer effect)
 *  – Renders Markdown, support footer, smooth upward animation
 *  ------------------------------------------------- */

import OpenAI from 'openai';

/* ───────── JB2 OAuth credentials (ENV) ───────── */
const JB2_AUTH = {
  clientId:     import.meta.env.VITE_JB2_CLIENT_ID ,
  clientSecret: import.meta.env.VITE_JB2_CLIENT_SECRET
};


const AUTH_BASE = 'https://api-user.integrations.ecimanufacturing.com';
const API_BASE  = 'https://api-jb2.integrations.ecimanufacturing.com';

let jb2Token  = '';
let jb2Expiry = 0;

async function getJB2Token() {
  console.log('[getJB2Token] Called.');

  const now = Math.floor(Date.now() / 1000);
  // If token is still valid, reuse it
  if (jb2Token && now < jb2Expiry - 60) {
    console.log('[getJB2Token] Reusing cached token.');
    return jb2Token;
  }

  // Token endpoint at AUTH_BASE
  const url = `${AUTH_BASE}/oauth2/api-user/token`;
  console.log('[getJB2Token] Request token from:', url);

  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     JB2_AUTH.clientId,
    client_secret: JB2_AUTH.clientSecret,
    scope:         'jb2-api offline_access'
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[getJB2Token] Token fetch failed:', res.status, res.statusText, errorText);
    throw new Error(`OAuth ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  jb2Token  = json.access_token;
  jb2Expiry = now + json.expires_in;

  console.log('[getJB2Token] Got token:', jb2Token ? '***' : 'NO TOKEN', 'Expires in:', json.expires_in);

  return jb2Token;
}


interface BinLocation {
  binLocation: string;
  cost: number;
  datePosted: string;
  deliveryTicketNumber: string;
  lastModDate: string | number | null;
  lastModUser: string;
  lotNumber: string;
  partNumber: string;
  POItemNumber: number;
  quantityOnHand: number;
  receiverNumber: string;
  uniqueID: number;
  vendorCode: string;
}

async function fetchBinLocationsByPart(partNumber: string): Promise<BinLocation[]> {
  const token = await getJB2Token();
  console.log("Using token:", token);

  // Construct the URL for the bin locations endpoint.
  const url = new URL("/api/v1/bin-locations", API_BASE);
  // Use filter expression for the part number.
  url.searchParams.set("partNumber[eq]", partNumber);
  // Specify only the desired fields.
  url.searchParams.set(
    "fields",
    "binLocation,cost,datePosted,deliveryTicketNumber,lastModDate,lastModUser,lotNumber,partNumber,POItemNumber,quantityOnHand,receiverNumber,uniqueID,vendorCode"
  );
  // Set paging parameters.
  url.searchParams.set("take", "50");
  url.searchParams.set("skip", "0");
  // Optionally, add a sort expression.
  url.searchParams.set("sort", "-lastModDate");

  console.log("BinLocations endpoint:", url.toString());

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(
      `Bin locations fetch failed ${response.status} ${response.statusText}`
    );
  }

  const json = await response.json();
  console.log("Got response:", json);
  // Return the Data array (which should be an array of BinLocation objects).
  return json.Data;
}

function binLocationHtml(b: BinLocation | null | undefined): string {
  console.log('[binLocationHtml] Called with bin location:', b);

  if (!b) {
    return '<i>bin location not found</i>';
  }

  // Format fallback values
  const cost  = b.cost.toFixed(2);
  const qty   = b.quantityOnHand;
  const last  = b.lastModDate ? new Date(b.lastModDate).toLocaleDateString() : '—';
  const bin   = b.binLocation ?? '—';
  const uid   = b.uniqueID ?? '—';
  const part  = b.partNumber ?? '—';

  return `
    <div class="bin-location-card">
      <div class="bin-partnumber">${part}</div>
      <div class="bin-details">
        <div><strong>Bin:</strong> ${bin}</div>
        <div><strong>Cost:</strong> $${cost}</div>
        <div><strong>Qty On Hand:</strong> ${qty}</div>
        <div><strong>Last Modified:</strong> ${last}</div>
        <div style="font-size:0.8em;"><small>ID: ${uid}</small></div>
      </div>
    </div>
  `;
}


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
    this.shadow.innerHTML = /*html*/ `
      <style>
        .cluster-container {
          display: flex;
          flex-direction: column;
          padding: 16px;
          font-family: sans-serif;
          overflow-x: hidden;
        }

        .chat-messages {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          margin-bottom: 12px;
          overflow-y: auto;
          max-height: 60vh;
        }

        .message-container {
          display: flex;
          justify-content: flex-start;
          transition: transform 0.35s ease, opacity 0.35s ease;
        }
        .message-container.user {
          justify-content: flex-end;
        }
        .message-container.enter {
          transform: translateY(24px);
          opacity: 0;
        }

        .message {
          margin: 8px 0;
          padding: 12px;
          border-radius: 8px;
          white-space: pre-wrap;
          max-width: 80%;
        }
        .user-message {
          background:rgb(27, 99, 182);
          color: #fff;
          align-self: flex-end;
        }
        .assistant-message {
          background: #e36a1e;
          color: #fff;
          align-self: flex-start;
        }

        .input-area {
          display: flex;
          gap: 8px;
        }
        .input-area textarea {
          flex: 1;
          padding: 8px;
          min-height: 50px;
        }
        button {
          background: var(--container-bg);
          color: var(--color-text);
          font-size: 14px;
          font-weight: bold;
          border: 3px solid black;
          border-radius: 12px;
          cursor: pointer;
          transform: scale(0.9);
          padding: 10px 16px;
          transition: background-color 0.25s ease, transform 0.1s ease;
        }
        button:hover {
          background: #e36a1e;
          border-color: #e36a1e;
          color: #fff;
          transform: scale(1);
        }

        /* Slide container styling */
        .slide {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.4s ease;
          padding: 0 4px;
          border: 1px solid #e36a1e;
          border-radius: 8px;
          margin: 4px 0;
          background: #fff;
          color: #000;
        }
        .slide.show {
          max-height: 500px;
          padding: 8px 4px;
        }

        /* Cursor for typewriter effect */
        .cursor {
          display: inline-block;
          width: 8px;
          background: #fff;
          margin-left: 2px;
          animation: blink 1s steps(2, start) infinite;
        }
        @keyframes blink {
          to {
            background: transparent;
          }
        }
        /* Bin location styling */
        /* NEW: container that wraps all bin items side by side, with wrapping */
        /* Flex container holding all bin location cards */
.bin-locations-container {
  display: flex;
  flex-wrap: wrap;      /* let cards wrap */
  gap: 12px;
  margin-top: 8px;
  align-items: flex-start;
}

/* The parent card: big enough to show part number by default */
.bin-location-card {
  position: relative;        /* or your desired height */
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid #e36a1e;
  border-radius: 6px;
  background: #fff;
  color: #000;
  cursor: pointer;
  /* minimal padding so the base height is small */
  padding: 4px 6px;
  overflow: hidden;
}

/* The always-visible part number */
.bin-partnumber {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 4px;
}

/* The details section: hidden by default via max-height + scaleY */
.bin-details {
  overflow: hidden;
  max-height: 0;               /* collapsed by default */
  transform: scaleY(0);        /* visually "squashed" */
  transform-origin: top;       /* so it grows downward */
  transition:
    max-height 0.3s ease,
    transform 0.3s ease;
}

/* On hover, expand the details in both height and scale */
.bin-location-card:hover .bin-details {
  max-height: 400px; /* or 999px if your content is large */
  transform: scaleY(1);
  heigh: auto;
}

      </style>
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
  }

  /* ───────── typewriter helper ───────── */
  private typeWriter(
    el: HTMLElement,
    text: string,
    done: () => void,
    speed = 15
  ) {
    let i = 0;
    const typedTextSpan = document.createElement('span');
    el.appendChild(typedTextSpan);

    const step = () => {
      if (i < text.length) {
        const ch = text[i++];

        if (ch === '\n') {
          // line break
          typedTextSpan.appendChild(document.createElement('br'));
        } else if (ch === '🚜') {
          // Insert an inline image instead of the tractor emoji
          const img = document.createElement('img');
          // Use your own icon:
          img.src = 'docs/data/TSRIcon.png';
          img.alt = 'harvester';
          img.style.width = '10px'; // for example
          // Add it in the same flow as typed text
          typedTextSpan.appendChild(img);
        } else {
          // Normal text
          typedTextSpan.appendChild(document.createTextNode(ch));
        }

        setTimeout(step, speed);
      } else {
        done();
      }
    };

    step();
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
      if (msg.partNumbers.length) {
        const list = document.createElement('div');
        list.className = 'bin-locations-container'; // Flex container for all cards

        msg.partNumbers.forEach(async pn => {
          const slide = document.createElement('div');
          slide.innerHTML = '<i>loading…</i>';
          list.appendChild(slide);

          try {
            const binLocations = await fetchBinLocationsByPart(pn);
            if (binLocations && binLocations.length > 0) {
              slide.innerHTML = binLocationHtml(binLocations[0]);
            } else {
              slide.innerHTML = '';
            }
          } catch (err) {
            console.error(err);
            slide.innerHTML = `<span style="color:#c00">API error – see console</span>`;
          }
        });

        bubble.appendChild(list);
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

    try {
      const assistant = await this.callAssistantAPI(text);
      this.conversation.push(assistant);
      this.renderNewMessages();
    } catch (e) {
      console.error(e);
      alert('Assistant error – check console.');
    }
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

    return {
      role:        'assistant',
      rawText:     parsed.raw_text ?? raw,
      partNumbers: Array.isArray(parsed.part_numbers) ? parsed.part_numbers : []
    };
  }
}

customElements.define('cluster-page', ClusterPage);
