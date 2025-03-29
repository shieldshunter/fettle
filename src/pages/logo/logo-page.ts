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
          padding: 5px;
          font-family: sans-serif;
          align-items: center;
        }

        .logo-wrapper svg {
          width: 200px;
          height: 200px;
          margin: 20px auto;
        }
        .logo-wrapper:hover {
          transform: scale(1.1) rotate(10deg);
        }

        polygon {
          transform-origin: 100px 100px;
          transition: fill 0.3s ease;
        }

        @keyframes flashOrange {
          0%, 100% { fill: var(--original-fill); transform: scale(1);}
          50%      { fill: var(--color-bg); transform: scale(1); }
        }
        
        @keyframes rotateColors {
          0%   { fill: var(--c0); }
          16%  { fill: var(--c5); }
          33%  { fill: var(--c4); }
          50%  { fill: var(--c3); }
          66%  { fill: var(--c2); }
          83%  { fill: var(--c1); }
          100% { fill: var(--c0); }
        }

        .rotate {
          animation: rotateColors 2.4s linear 3;
        }

        .pulse {
          animation: flashOrange 1.2s ease-in-out 3;
        }
      </style>

      <div class="cluster-container">
        <h2>Logo Page</h2>
        <div class="logo-wrapper"></div>
        <div class="logo-wrapper"></div>
        <div class="logo-wrapper"></div>
      </div>
    `;
  }

  connectedCallback() {
  this.loadSVG().then(() => {
    // Once SVGs are loaded, add click-to-restart logic
    this.shadow.querySelectorAll('.logo-wrapper').forEach(wrapper => {
      wrapper.addEventListener('click', () => {
        const polygons = wrapper.querySelectorAll('polygon');
        polygons.forEach(polygon => {
          const currentClasses = polygon.classList;
          const isPulse = currentClasses.contains('pulse');
          const isRotate = currentClasses.contains('rotate');

          // Remove animation class
          polygon.classList.remove('pulse', 'rotate');

          // Force reflow to reset animation
          void polygon.getBoundingClientRect().width;

          // Re-apply the class to restart animation
          if (isPulse) polygon.classList.add('pulse');
          if (isRotate) polygon.classList.add('rotate');
        });
      });
    });
  });
  } 

  async loadSVG() {
    try {
      const response = await fetch('./data/hexlogo.html');
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const originalSVG = doc.querySelector('svg');
  
      const wrappers = this.shadow.querySelectorAll('.logo-wrapper');
  
      // 1st Logo: Pulse Animation
      if (originalSVG && wrappers[0]) {
        const pulseClone = originalSVG.cloneNode(true) as SVGSVGElement;
        wrappers[0].appendChild(pulseClone);
  
        const pulsePolygons = pulseClone.querySelectorAll('polygon');
        pulsePolygons.forEach((poly, index) => {
          const originalFill = poly.getAttribute('fill') || '#000';
          poly.style.setProperty('--original-fill', originalFill);
          poly.classList.add('pulse');
          poly.style.animationDelay = `${index * 0.4}s`;
        });
      }
  
      // 2nd Logo: Rotate Color Animation
      if (originalSVG && wrappers[1]) {
        const rotateClone = originalSVG.cloneNode(true) as SVGSVGElement;
        wrappers[1].appendChild(rotateClone);
  
        const rotatePolygons = rotateClone.querySelectorAll('polygon');
        const colorCycle = [
          '#EA3546',
          '#EA3546',
          '#FABF35',
          '#FABF35',
          '#345995',
          '#345995'
        ];
  
        rotatePolygons.forEach((poly, i) => {
          poly.style.setProperty('--c0', colorCycle[i % 6]);
          poly.style.setProperty('--c1', colorCycle[(i + 1) % 6]);
          poly.style.setProperty('--c2', colorCycle[(i + 2) % 6]);
          poly.style.setProperty('--c3', colorCycle[(i + 3) % 6]);
          poly.style.setProperty('--c4', colorCycle[(i + 4) % 6]);
          poly.style.setProperty('--c5', colorCycle[(i + 5) % 6]);
          poly.classList.add('rotate');
        });
      }
      if (originalSVG && wrappers[2]) {
        const dualPulseClone = originalSVG.cloneNode(true) as SVGSVGElement;
        wrappers[2].appendChild(dualPulseClone);
      
        const dualPolygons = dualPulseClone.querySelectorAll('polygon');
        dualPolygons.forEach((poly, i) => {
          const originalFill = poly.getAttribute('fill') || '#000';
          poly.style.setProperty('--original-fill', originalFill);
          poly.classList.add('pulse');
      
          // Every two polygons share the same delay
          const delayGroup = Math.floor(i / 2);
          poly.style.animationDelay = `${delayGroup * 0.4}s`;
        });
      }
  
    } catch (error) {
      console.error('Failed to load SVG:', error);
    }
  }
  
}

customElements.define('logo-page', LogoPage);