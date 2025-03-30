// /pages/cluster/cluster-page.ts
import { generateProjectWithCallbacks } from '../../ai/orchestrator';

class ClusterPage extends HTMLElement {
  private shadow: ShadowRoot;
  private stepCards = new Map<string, HTMLDivElement>();

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });

    this.shadow.innerHTML = `
      <style>
        .cluster-container {
          display: flex;
          flex-direction: column;
          padding: 16px;
          font-family: sans-serif;
        }
        .actions {
          margin-top: 12px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px; /* spacing between elements */
          width: auto;
        }
        .results {
          margin-top: 16px;
          white-space: pre-wrap;
          font-size: 0.9rem;
          background:rgb(212, 76, 76);
          color:
          padding: 12px;
          border-radius: 6px;
        }
        button {
          background-color: var(--container-bg);
          color: var(--color-text);
          font-size: 14px;
          font-weight: bold;
          border: black 3px solid;
          border-radius: 12px;
          cursor: pointer;
          transform: scale(0.9);
          padding: 10px 16px;
          transition: background-color 0.25s ease;
        }
        button:hover {
          background-color: #e36a1e;
          border: #e36a1e 3px solid;
          transform: scale(1);
          transition: transform 0.1s ease;
          color: white;
        }

        /* NEW: styling the selector to match your button look. */
        select.store-selector {
          background-color: var(--container-bg);
          color: var(--color-text);
          font-size: 14px;
          font-weight: bold;
          border: black 3px solid;
          border-radius: 12px;
          cursor: pointer;
          transform: scale(0.9);
          padding: 8px 16px;
          transition: background-color 0.25s ease;
        }
        select.store-selector:hover {
          background-color: #e36a1e;
          border: #e36a1e 3px solid;
          transform: scale(1);
          transition: transform 0.1s ease;
          color: white;
        }

        textarea {
          width: 100%;
          padding: 12px;
          min-height: 100px;
        }
        .download-buttons {
          margin-top: 16px;
        }

        /* Carousel: new cards on the left, older cards fade out right */
        .carousel {
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          gap: 16px;
          margin-top: 16px;
          padding-bottom: 8px;
          overflow-x: hidden;
        }
        .log-card {
          min-width: 240px;
          background: var(--container-bg);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
          flex-shrink: 0;
          padding: 12px;
          display: flex;
          flex-direction: row;
          align-items: center;
          transition: opacity 0.6s ease;
        }
        .pulse-hex {
          width: 60px;
          height: 60px;
          margin-right: 12px;
        }
        .log-text {
          font-size: 0.85rem;
          color: var(--color-text);
          line-height: 1.4;
          display: inline-block;
        }
        /* Wave animation (continuous) */
        @keyframes waveUpDown {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        .wave-char {
          display: inline-block;
          animation: waveUpDown 1s ease-in-out infinite;
        }
        /* On finish, we transition from mid-wave back to baseline */
        @keyframes waveFadeOut {
          from { transform: translateY(-8px); }
          to   { transform: translateY(0); }
        }
        .wave-char-final {
          display: inline-block;
          animation: waveFadeOut 0.4s ease forwards;
        }

        /* Pulse for the hex polygons */
        @keyframes flashOrange {
          0%, 100% { fill: var(--original-fill); transform: scale(1); }
          50%      { fill: var(--container-bg); transform: scale(1); }
        }
        .pulse {
          animation: flashOrange 1.2s ease-in-out infinite;
        }
      </style>

      <div class="cluster-container">
        <h2>Cluster Page</h2>
        <p>Describe your desired project:</p>
        <textarea id="projectDescription"
          placeholder="e.g., 'Build a TS/HTML web app with Azure Function backend...'">
        </textarea>

        <div class="actions">
          <!-- NEW: File store selector -->
          <select class="store-selector" id="storeSelector">
            <option value="">Select a Vector</option>
            <option value="vector_store_1">Vector Store 1 UI ONLY</option>
            <option value="vector_store_2">Vector Store 2 UI ONLY</option>
            <option value="vector_store_3">Vector Store 3 UI ONLY</option>
          </select>

          <button id="generateBtn">Generate Project</button>
        </div>

        <div class="carousel" id="logCarousel"></div>
        <div class="results" id="results"></div>
        <div class="download-buttons" id="downloadButtons"></div>
      </div>
    `;
  }

  connectedCallback() {
    const generateBtn = this.shadow.getElementById('generateBtn') as HTMLButtonElement;
    generateBtn.addEventListener('click', () => this.onGenerateProject());
  }

  private async onGenerateProject() {
    const descEl = this.shadow.getElementById('projectDescription') as HTMLTextAreaElement;
    const resultsEl = this.shadow.getElementById('results') as HTMLDivElement;
    const downloadContainer = this.shadow.getElementById('downloadButtons') as HTMLDivElement;
    const logCarousel = this.shadow.getElementById('logCarousel') as HTMLDivElement;

    // NEW: read the selected store from the dropdown
    const storeSelector = this.shadow.getElementById('storeSelector') as HTMLSelectElement;
    const selectedStoreId = storeSelector.value; // e.g. "vector_store_1"

    // Clear old content
    resultsEl.innerText = '';
    downloadContainer.innerHTML = '';
    logCarousel.innerHTML = '';
    this.stepCards.clear();

    const prompt = descEl.value.trim();
    if (!prompt) {
      resultsEl.innerText = "Please provide a project description.";
      return;
    }

    resultsEl.innerText = "Generating project...\n";

    try {
      /**
       * We'll pass the selectedStoreId to our orchestrator so it can incorporate
       * that in an OpenAI responses.create call with "tools: [{ type: 'file_search', vector_store_ids: [selectedStoreId], ... }]"
       */
      const projectResult = await generateProjectWithCallbacks(
        prompt,
        (stepId, startMsg) => this.startLogCard(stepId, startMsg),
        (stepId, finishMsg) => this.finishLogCard(stepId, finishMsg),
        selectedStoreId // NEW: pass to orchestrator
      );

      resultsEl.innerText = "Project successfully generated!\n\nFiles:";

      const fileNames = Object.keys(projectResult);
      fileNames.forEach((fileName) => {
        resultsEl.innerText += `\n- ${fileName}`;
      });

      // Create download buttons
      fileNames.forEach((filePath) => {
        const fileContent = projectResult[filePath];
        const downloadBtn = document.createElement('button');
        downloadBtn.innerText = `Download ${filePath}`;
        downloadBtn.addEventListener('click', () => {
          const blob = new Blob([fileContent], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filePath;
          a.click();
          URL.revokeObjectURL(url);
        });
        downloadContainer.appendChild(downloadBtn);
      });

    } catch (err) {
      resultsEl.innerText = `Error: ${err}`;
    }
  }

  /**
   * Create a new card at the left.
   */
  private startLogCard(stepId: string, rawMsg: string) {
    const logCarousel = this.shadow.getElementById('logCarousel') as HTMLDivElement;
    
    // Strip bracket text
    const msgNoBrackets = rawMsg.replace(/\[.*?\]\s*/g, '');

    // Build wave text
    const waveSpan = this.createWaveText(msgNoBrackets);

    // Create the card
    const card = document.createElement('div');
    card.classList.add('log-card');

    // The hex
    const svg = this.createPulseHex(); 

    // The text container
    const textEl = document.createElement('div');
    textEl.classList.add('log-text');
    textEl.appendChild(waveSpan);

    card.appendChild(svg);   // hex on the left
    card.appendChild(textEl); // text on the right

    // Insert at left
    if (logCarousel.firstChild) {
      logCarousel.insertBefore(card, logCarousel.firstChild);
    } else {
      logCarousel.appendChild(card);
    }

    this.stepCards.set(stepId, card);
    this.updateCardOpacity();
  }

  /**
   * Stop the pulse, end wave smoothly.
   */
  private finishLogCard(stepId: string, rawMsg: string) {
    const card = this.stepCards.get(stepId);
    if (!card) return;

    // Remove bracket text
    const msgNoBrackets = rawMsg.replace(/\[.*?\]\s*/g, '');

    // Rebuild wave text but we will use a "final" version
    // so it smoothly ends instead of continuing infinitely.
    const waveSpan = this.createWaveText(msgNoBrackets, /* infinite= */ false);

    const textEl = card.querySelector('.log-text');
    if (textEl) {
      textEl.innerHTML = '';
      textEl.appendChild(waveSpan);
    }

    // Stop pulsing the hex
    const polygons = card.querySelectorAll('polygon');
    polygons.forEach(poly => {
      poly.classList.remove('pulse');
    });
  }

  /**
   * Make a 6-polygon pulse hex.
   */
  private createPulseHex(): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.classList.add('pulse-hex');

    const corners = [
      { points: '100,100 152,70   152,130', fill: '#EA3546' },
      { points: '100,100 152,130  100,160', fill: '#EA3546' },
      { points: '100,100 100,160  48,130',  fill: '#FABF35' },
      { points: '100,100 48,130   48,70',   fill: '#FABF35' },
      { points: '100,100 48,70    100,40',  fill: '#345995' },
      { points: '100,100 100,40   152,70',  fill: '#345995' },
    ];

    corners.forEach((c, i) => {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', c.points);
      poly.setAttribute('fill', c.fill);
      poly.style.setProperty('--original-fill', c.fill);
      poly.style.setProperty('--color-bg', '#FFF');
      poly.classList.add('pulse');
      poly.style.animationDelay = `${i * 0.1}s`;
      svg.appendChild(poly);
    });
    return svg;
  }

  /**
   * Build wave text from a string. If infinite=true, use .wave-char (continuous).
   * If infinite=false, use .wave-char-final for a short fade-out wave.
   */
  private createWaveText(text: string, infinite = true): HTMLSpanElement {
    const span = document.createElement('span');
    text.split('').forEach((char, i) => {
      const charSpan = document.createElement('span');
      charSpan.textContent = char;

      if (char.trim() === '') {
        // For spaces, skip or just place them
        span.appendChild(charSpan);
        return;
      }

      if (infinite) {
        // Ongoing wave
        charSpan.classList.add('wave-char');
        // Slight stagger
        charSpan.style.animationDelay = `${i * 0.01}s`;
      } else {
        // Final wave => ends after 0.4s
        charSpan.classList.add('wave-char-final');
      }
      span.appendChild(charSpan);
    });
    return span;
  }

  /**
   * Fade older cards => index 0 is opacity=1, next=0.85, next=0.7, ...
   */
  private updateCardOpacity() {
    const logCarousel = this.shadow.getElementById('logCarousel') as HTMLDivElement;
    const allCards = Array.from(logCarousel.querySelectorAll('.log-card'));

    allCards.forEach((card, i) => {
      const base = 1 - (i * 0.15);
      const final = Math.max(0.3, base);
      (card as HTMLElement).style.opacity = String(final);
    });
  }
}

customElements.define('cluster-page', ClusterPage);
