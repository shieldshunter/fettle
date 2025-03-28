class LogoPage extends HTMLElement {
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
          align-items: center;
        }

        .logo-wrapper svg {
          width: 200px;
          height: 200px;
          margin: 50px auto;
        }

        polygon {
          transform-origin: 100px 100px;
          transition: fill 0.3s ease;
        }

        @keyframes flashOrange {
          0%, 100% { fill: var(--original-fill); transform: scale(1);}
          50%      { fill: var(--color-bg); transform: scale(1); }
        }

        .pulse {
          animation: flashOrange 1.2s ease-in-out 6;
        }
      </style>

      <div class="cluster-container">
        <h2>Logo Page</h2>
        <div class="logo-wrapper"></div>
        <div class="logo-wrapper"></div>
      </div>
    `;
  }

  connectedCallback() {
    this.loadSVG();
    
  }

  async loadSVG() {
    try {
      const response = await fetch('./data/hexlogo.html');
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const svg = doc.querySelector('svg');

      if (svg) {
        this.shadow.querySelector('.logo-wrapper')?.appendChild(svg);
      
        const polygons = svg.querySelectorAll('polygon');
        polygons.forEach((poly, index) => {
          const originalFill = poly.getAttribute('fill') || '#000';
          poly.style.setProperty('--original-fill', originalFill);
          poly.classList.add('pulse');
          poly.style.animationDelay = `${index * 0.4}s`;
        });
      } else {
        console.warn('No SVG found in loaded HTML');
      }
    } catch (error) {
      console.error('Failed to load SVG:', error);
    }
    
  }
  
}

customElements.define('logo-page', LogoPage);