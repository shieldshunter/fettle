// /pages/cluster/cluster-page.ts

class ClusterPage extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      // You can replicate the style from treeBOM if desired:
      this.shadowRoot!.innerHTML = `
        <style>
          /* Add any container styling or same styles as treeBOM if you prefer */
          .cluster-container {
            width: 100%;
            height: auto;
            padding: 10px;
          }
        </style>
        <div class="cluster-container">
          <h2>Cluster Page</h2>
          <p>This is your new cluster page content.</p>
        </div>
      `;
    }
  }
  
  // Register the custom element
  customElements.define('cluster-page', ClusterPage);