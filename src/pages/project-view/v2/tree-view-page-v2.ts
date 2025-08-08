import cssText from '../tree-view-page-styles.css?inline';
import { TreeControllerV2 } from './tree-view-controller';

const sheet = new CSSStyleSheet();
sheet.replaceSync(cssText);

export class TreeViewPageV2 extends HTMLElement {
  private shadowRootRef: ShadowRoot;
  private controller: TreeControllerV2;

  constructor() {
    super();
    this.shadowRootRef = this.attachShadow({ mode: 'open' });
    this.shadowRootRef.adoptedStyleSheets = [sheet];
    this.shadowRootRef.innerHTML = `
      <div class="tree-view-container">
        <div class="header">
          <div class="header-content">
            <h2>File Tree View (v2)</h2>
            <div class="project-info" id="projectInfo"></div>
          </div>
        </div>
        <div class="tree-container">
          <div id="fileTree" class="file-tree"></div>
        </div>
      </div>
    `;
    this.controller = new TreeControllerV2(this.shadowRootRef);
  }

  connectedCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectIdParam = urlParams.get('projectId') || sessionStorage.getItem('currentProjectId');
    if (projectIdParam) {
      const id = parseInt(projectIdParam, 10);
      this.controller.load(id).catch((err) => console.error('v2 load error:', err));
    }
  }
}

customElements.define('tree-view-page-v2', TreeViewPageV2);


