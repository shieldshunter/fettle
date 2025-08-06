class WaveSpinner extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    // Create the spinner HTML structure
    const spinner = document.createElement('div');
    spinner.className = 'wave-spinner';
    
    // Create 5 dots for the wave effect
    for (let i = 0; i < 5; i++) {
      const dot = document.createElement('div');
      spinner.appendChild(dot);
    }

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .wave-spinner {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .wave-spinner > div {
        width: 6px;
        height: 8px;
        margin: 0 6px;
        border-radius: 20%;
        background: var(--container-bg, #ffffff);
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

      @keyframes scaling {
        0%, 100% {
          transform: scaleY(0.5);
          background-color: var(--wave-color-0, var(--container-bg, #ffffff));
        }
        40% {
          transform: scaleY(1.5);
          background-color: var(--wave-color-40, rgb(255, 160, 105));
        }
        50% {
          transform: scaleY(3);
          background-color: var(--wave-color-50, #f36f21);
        }
      }

      /* Size variants */
      .wave-spinner.small > div {
        width: 4px;
        height: 6px;
        margin: 0 4px;
      }

      .wave-spinner.large > div {
        width: 8px;
        height: 10px;
        margin: 0 8px;
      }

      /* Color variants */
      .wave-spinner.primary > div {
        --wave-color-0: var(--btn-primary, #3498db);
        --wave-color-40: var(--btn-primary-hover, #2980b9);
        --wave-color-50: var(--btn-primary, #3498db);
      }

      .wave-spinner.success > div {
        --wave-color-0: var(--btn-success, #27ae60);
        --wave-color-40: var(--btn-success-hover, #229954);
        --wave-color-50: var(--btn-success, #27ae60);
      }

      .wave-spinner.warning > div {
        --wave-color-0: var(--btn-warning, #f39c12);
        --wave-color-40: var(--btn-warning-hover, #e67e22);
        --wave-color-50: var(--btn-warning, #f39c12);
      }

      .wave-spinner.danger > div {
        --wave-color-0: var(--btn-danger, #e74c3c);
        --wave-color-40: var(--btn-danger-hover, #c0392b);
        --wave-color-50: var(--btn-danger, #e74c3c);
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(spinner);

    // Apply random color set if no specific color is set
    this.applyRandomColors();
  }

  private applyRandomColors() {
    const waveColorSets = [
      {
        step0: 'var(--container-bg, #ffffff)',
        step40: 'rgb(255, 160, 105)',
        step50: '#f36f21'
      },
      {
        step0: 'var(--container-bg, #ffffff)',
        step40: 'rgb(52, 152, 219)',
        step50: '#3498db'
      },
      {
        step0: 'var(--container-bg, #ffffff)',
        step40: 'rgb(39, 174, 96)',
        step50: '#27ae60'
      },
      {
        step0: 'var(--container-bg, #ffffff)',
        step40: 'rgb(243, 156, 18)',
        step50: '#f39c12'
      }
    ];

    const randomColors = waveColorSets[Math.floor(Math.random() * waveColorSets.length)];
    const dots = this.shadowRoot!.querySelectorAll<HTMLDivElement>('.wave-spinner > div');

    dots.forEach(dot => {
      dot.style.setProperty('--wave-color-0', randomColors.step0);
      dot.style.setProperty('--wave-color-40', randomColors.step40);
      dot.style.setProperty('--wave-color-50', randomColors.step50);
    });
  }

  // Public method to set custom colors
  setColors(color0: string, color40: string, color50: string) {
    const dots = this.shadowRoot!.querySelectorAll<HTMLDivElement>('.wave-spinner > div');
    dots.forEach(dot => {
      dot.style.setProperty('--wave-color-0', color0);
      dot.style.setProperty('--wave-color-40', color40);
      dot.style.setProperty('--wave-color-50', color50);
    });
  }

  // Public method to set size variant
  setSize(size: 'small' | 'medium' | 'large') {
    const spinner = this.shadowRoot!.querySelector('.wave-spinner') as HTMLElement;
    spinner.className = `wave-spinner ${size}`;
  }

  // Public method to set color variant
  setVariant(variant: 'primary' | 'success' | 'warning' | 'danger' | 'default') {
    const spinner = this.shadowRoot!.querySelector('.wave-spinner') as HTMLElement;
    // Remove existing variant classes
    spinner.classList.remove('primary', 'success', 'warning', 'danger');
    if (variant !== 'default') {
      spinner.classList.add(variant);
    }
  }
}

customElements.define('wave-spinner', WaveSpinner);
export { WaveSpinner }; 