// /pages/cluster/cluster-page.ts
import { generateProject } from '../../ai/orchestrator';

class ClusterPage extends HTMLElement {
    private shadow: ShadowRoot;
  
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
          }
  
          .results {
            margin-top: 16px;
            white-space: pre-wrap; /* So newlines show up if you log JSON or code */
            font-size: 0.9rem;
            background: #f7f7f7;
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
  
          textarea {
            width: 100%;
            padding: 12px;
            min-height: 100px;
          }
        </style>
  
        <div class="cluster-container">
          <h2>Cluster Page</h2>
          <p>Describe your desired project:</p>
          <textarea id="projectDescription" placeholder="e.g., 'Build a TS/HTML web app with Azure Function backend...'"></textarea>
  
          <div class="actions">
            <button id="generateBtn">Generate Project</button>
            <!-- Additional actions can go here: e.g., Deploy, Validate, etc. -->
          </div>
  
          <div class="results" id="results">
            <!-- We'll display logs or output here -->
          </div>
        </div>
      `;
    }
  
    connectedCallback() {
      const generateBtn = this.shadow.getElementById('generateBtn') as HTMLButtonElement;
      generateBtn.addEventListener('click', () => {
        this.onGenerateProject();
      });
    }
  
    // This is where you'd hook your orchestrator logic
    private async onGenerateProject() {
        const descEl = this.shadow.getElementById('projectDescription') as HTMLTextAreaElement;
        const resultsEl = this.shadow.getElementById('results') as HTMLDivElement;
      
        const prompt = descEl.value.trim();
        if (!prompt) {
          resultsEl.innerText = "Please provide a project description.";
          return;
        }
      
        resultsEl.innerText = "Generating project...\n";
      
        try {
          const projectResult = await generateProject(prompt);
      
          resultsEl.innerText += "Project successfully generated:\n\n";
          resultsEl.innerText += JSON.stringify(projectResult, null, 2);
        } catch (err) {
          resultsEl.innerText += `Error: ${err}`;
        }
      }
  }
  
  customElements.define('cluster-page', ClusterPage);
  