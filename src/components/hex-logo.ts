class HexLogo extends HTMLElement {
    private shadow: ShadowRoot;
  
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
  
      this.shadow.innerHTML = `
        <style>
          :host {
            display: inline-block;
            --logo-size: 200px;
            --color-bg: #F36F21;
          }
  
          .logo-wrapper svg {
            width: var(--logo-size);
            height: var(--logo-size);
          }
  
          polygon {
            transform-origin: 100px 100px;
            transition: fill 0.3s ease;
          }
  
          @keyframes flashOrange {
            0%, 100% { fill: var(--original-fill); transform: scale(1); }
            50%      { fill: var(--color-bg); transform: scale(0.9); }
          }
  
          .pulse {
            animation: flashOrange 1.2s ease-in-out 6;
          }
        </style>
  
        <div class="logo-wrapper"></div>
      `;
    }
  
    connectedCallback() {
      const size = this.getAttribute('size');
      const color = this.getAttribute('color');
  
      if (size) this.style.setProperty('--logo-size', size);
      if (color) this.style.setProperty('--color-bg', color);
  
      this.loadSVG();
    }
  
    async loadSVG() {
      try {
        const response = await fetch('./data/hexlogo.html'); // Make this dynamic if needed
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
  
  customElements.define('hex-logo', HexLogo);
  