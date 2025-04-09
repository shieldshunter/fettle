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
  if (!b) return '<i>bin location not found</i>';
  const cost  = b.cost.toFixed(2);
  const qty   = b.quantityOnHand;
  const last  = b.lastModDate ? new Date(b.lastModDate).toLocaleDateString() : '—';
  const bin   = b.binLocation ?? '—';
  const uid   = b.uniqueID ?? '—';
  const part  = b.partNumber ?? '—';
  const rawHtml = `
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
  // Remove newlines and extra whitespace
  return rawHtml.replace(/\s\s+/g, ' ').trim();
}

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
          padding: 25px;
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
        .tsr-inline-cursor {
          display: inline-block;
          width: 70px;
          height: auto;
          vertical-align: text-bottom;
          margin-left: 2px;
          animation: blink-tsr 2s ease infinite, bounce-tsr 1.2s ease-in-out infinite;
        }

        /* Blinking */
        @keyframes blink-tsr {
          50% {
            opacity: 0.7;
          }
        }

        /* Tiny bounce while typing */
        @keyframes bounce-tsr {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-1px); }
        }
        /* Bin location styling */
        /* NEW: container that wraps all bin items side by side, with wrapping */
        /* Flex container holding all bin location cards */
/* Container for the part number buttons */
.bin-buttons-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
  margin-top: 12px;
}

.bin-partnumber {
  font-weight: bold;
  font-size: 20px;

}

/* Style for each button */
.bin-button {
  background:rgb(255, 255, 255);
  color: #e36a1e;
  border: 1px solid #e36a1e;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s ease, color 0.2s ease, height: 0.4s ease;
}

.bin-button:hover {
  background: rgb(27, 99, 182);
  color: #fff;
  border-color: black;
  border-weight: 3px;
  scale: 1.1;
  transition: scale 0.2s ease;
}

/* Container for the details below the buttons */
.bin-details-container {
  border: 1px solid #e36a1e;
  border-radius: 6px;
  padding: 12px;
  background: #fff;
  color: #000;
  overflow: hidden;              /* Hide overflowing content during transition */
  height: auto;
  transition: height 0.3s ease;
}

/* Wave Spinner Container (will be visible in our placeholder div) */
.wave-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Wave Spinner Dot Styles */
.wave-spinner > div {
  width: 6px;
  height: 8px;
  margin: 0 6px;
  border-radius: 20%; /* to form a diamond-like shape */
  background-color: rgb(255, 255, 255);
  animation: scaling 1.2s ease-in-out infinite;
}

/* Set staggered animation delays for a wave effect */
.wave-spinner > div:nth-child(1) {
  animation-delay: -0.6s;
}
.wave-spinner > div:nth-child(2) {
  animation-delay: -0.4s;
}
.wave-spinner > div:nth-child(3) {
  animation-delay: -0.2s;
}
.wave-spinner > div:nth-child(4) {
  animation-delay: 0s;
}
.wave-spinner > div:nth-child(5) {
  animation-delay: 0.2s;
}

/* Wave Dot Keyframes */
@keyframes scaling {
  0%, 100% {
    transform: scaleY(0.5);
    background-color: rgb(255, 255, 255);
  }
  40% {
    transform: scaleY(1.5);
    background-color: rgb(255, 160, 105);
  }
  50% {
    transform: scaleY(3);
    background-color: #f36f21;
  }
}

/* Optional: a container for the spinner */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px; /* Set a fixed height to reserve space */
}
.bin-details-container.fade-transition {
  animation: fadeContent 0.4s ease;
}

@keyframes fadeContent {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
    speed = 40
  ) {
    let i = 0;

    // Main container for typed text
    const typedTextSpan = document.createElement('span');
    typedTextSpan.className = 'typed-text-span';
    el.appendChild(typedTextSpan);

    // TSR image cursor (inline, like a blinking character)
    const cursor = document.createElement('img');
    cursor.src = 'docs/data/TSRIcon.png';
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

        setTimeout(step, speed);
      } else {
        cursor.remove();
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
  msg.partNumbers.forEach(pn => {
    const btn = document.createElement('div');
    btn.className = 'bin-button';
    btn.textContent = pn;

    // On hover (or click if you prefer), fetch and display the details.
    btn.addEventListener('click', async () => {
      try {
        const binLocations = await fetchBinLocationsByPart(pn);
        if (binLocations && binLocations.length > 0) {
          // Instead of direct assignment, use our helper to animate the height change
          updateDetailsContainer(detailsContainer, binLocationHtml(binLocations[0]));
        } else {
          updateDetailsContainer(detailsContainer, '<i>No bin location found</i>');
        }
      } catch (err) {
        console.error(err);
        updateDetailsContainer(detailsContainer, `<span style="color:#c00">API error – see console</span>`);
      }
    });

    buttonsContainer.appendChild(btn);
  });

  // Append both containers to the message bubble
  bubble.appendChild(buttonsContainer);
  bubble.appendChild(detailsContainer);
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
